// ============================================================
// XIVIZLEY — Newsletter & Lead Magnet Subscription API Route
// app/api/newsletter/route.ts
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import rateLimit from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

const limiter = rateLimit({
  interval: 10 * 60 * 1000, // 10 minutes
  uniqueTokenPerInterval: 500,
});

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_PAYLOAD_BYTES = 16 * 1024; // 16 KB

function getClientIp(req: NextRequest): string {
  // If behind Cloudflare, cf-connecting-ip is set by the Cloudflare edge and cannot be spoofed by the client
  const cfIp = req.headers.get('cf-connecting-ip')?.trim();
  if (cfIp) return cfIp;

  // If not Cloudflare, read x-real-ip from direct reverse proxy
  const realIp = req.headers.get('x-real-ip')?.trim();
  if (realIp) return realIp;

  // Safe fallback (do not trust arbitrary spoofed x-forwarded-for headers)
  return '127.0.0.1';
}

export async function POST(req: NextRequest) {
  try {
    const ip = getClientIp(req);

    // 1. IP & Rate Limiting (Max 5 newsletter subscriptions per 10 minutes per IP)
    try {
      await limiter.check(5, ip);
    } catch {
      return NextResponse.json(
        { error: 'Çok fazla bülten kaydı isteği yapıldı. Lütfen daha sonra tekrar deneyin.' },
        { status: 429 }
      );
    }

    // 2. Payload size check
    const contentLength = Number(req.headers.get('content-length') || 0);
    if (contentLength > MAX_PAYLOAD_BYTES) {
      return NextResponse.json(
        { error: 'İstek boyutu izin verilen sınırı aşıyor.' },
        { status: 413 }
      );
    }

    const body = await req.json();
    const { email, turnstileToken } = body;

    // 3. Cloudflare Turnstile Verification
    const isProduction = process.env.NODE_ENV === 'production';
    const turnstileSecret = process.env.CLOUDFLARE_TURNSTILE_SECRET_KEY?.trim();

    if (isProduction) {
      if (!turnstileSecret) {
        return NextResponse.json(
          { error: 'Sunucu güvenlik yapılandırması eksik (Turnstile anahtarı tanımlanmamış).' },
          { status: 503 }
        );
      }
      if (!turnstileToken || typeof turnstileToken !== 'string') {
        return NextResponse.json(
          { error: 'Lütfen güvenlik doğrulamasını (CAPTCHA) tamamlayın.' },
          { status: 400 }
        );
      }
      const { verifyTurnstileToken } = await import('@/lib/turnstile');
      const turnstileResult = await verifyTurnstileToken(turnstileToken, ip);
      if (!turnstileResult.success) {
        return NextResponse.json(
          { error: 'Güvenlik doğrulaması (Turnstile) başarısız oldu.' },
          { status: 400 }
        );
      }
    } else {
      // In development, verify only if token and secret are provided; otherwise skip
      if (turnstileSecret && turnstileToken) {
        const { verifyTurnstileToken } = await import('@/lib/turnstile');
        const turnstileResult = await verifyTurnstileToken(turnstileToken, ip);
        if (!turnstileResult.success) {
          return NextResponse.json(
            { error: 'Güvenlik doğrulaması (Turnstile) başarısız oldu.' },
            { status: 400 }
          );
        }
      }
    }

    // 4. Strict Input Size, CRLF & Format Validation
    if (!email || typeof email !== 'string' || email.length > 150 || !EMAIL_REGEX.test(email.trim()) || /[\r\n]/.test(email)) {
      return NextResponse.json({ error: 'Lütfen geçerli bir e-posta adresi giriniz.' }, { status: 400 });
    }

    const safeEmail = email.trim();

    // Direct SendPulse API Integration if configured
    import('@/lib/sendpulse').then(({ addSubscriberToSendPulse, createCrmDeal }) => {
      addSubscriberToSendPulse(safeEmail).catch((e) => console.error('[SendPulse Book Error]:', e));
      createCrmDeal(`Lead Magnet: ${safeEmail}`).catch((e) => console.error('[SendPulse CRM Deal Error]:', e));
    });

    // Asynchronously send welcome email via SMTP if configured
    import('@/lib/email').then(({ sendNewsletterWelcomeEmail }) => {
      sendNewsletterWelcomeEmail(safeEmail).catch((e) =>
        console.error('[Newsletter Welcome Email Error]:', e)
      );
    });

    return NextResponse.json({
      success: true,
      message: 'Aboneliğiniz başarıyla oluşturuldu! Homelab rehberleri ve güncellemeler gelen kutunuzda.',
    });
  } catch (error) {
    console.error('[Newsletter API Error]:', error);
    return NextResponse.json({ error: 'Bir hata oluştu. Lütfen tekrar deneyin.' }, { status: 500 });
  }
}
