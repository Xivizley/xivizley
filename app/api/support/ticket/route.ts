// ============================================================
// XIVIZLEY — Support & Ticket System API Route
// app/api/support/ticket/route.ts
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import rateLimit from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

const limiter = rateLimit({
  interval: 10 * 60 * 1000, // 10 minutes
  uniqueTokenPerInterval: 500,
});

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_PAYLOAD_BYTES = 64 * 1024; // 64 KB

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

    // 1. IP & Rate Limiting (Max 5 tickets per 10 minutes per IP)
    try {
      await limiter.check(5, ip);
    } catch {
      return NextResponse.json(
        { error: 'Çok fazla istek gönderildi. Lütfen birkaç dakika sonra tekrar deneyin.' },
        { status: 429 }
      );
    }

    // 2. Payload size check
    const contentLength = Number(req.headers.get('content-length') || 0);
    if (contentLength > MAX_PAYLOAD_BYTES) {
      return NextResponse.json(
        { error: 'İstek boyutu çok büyük (Maksimum 64 KB).' },
        { status: 413 }
      );
    }

    const body = await req.json();
    const { name, email, category, priority, subject, message, turnstileToken } = body;

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

    // 4. Strict Input Size & Type Validation
    if (!name || typeof name !== 'string' || name.trim().length < 2 || name.length > 100) {
      return NextResponse.json({ error: 'Lütfen geçerli bir isim giriniz (2-100 karakter).' }, { status: 400 });
    }

    if (!email || typeof email !== 'string' || email.length > 150 || !EMAIL_REGEX.test(email.trim())) {
      return NextResponse.json({ error: 'Lütfen geçerli bir e-posta adresi giriniz.' }, { status: 400 });
    }

    if (!subject || typeof subject !== 'string' || subject.trim().length < 3 || subject.length > 200) {
      return NextResponse.json({ error: 'Konu başlığı 3-200 karakter arasında olmalıdır.' }, { status: 400 });
    }

    if (!message || typeof message !== 'string' || message.trim().length < 10 || message.length > 5000) {
      return NextResponse.json({ error: 'Mesaj metni 10-5000 karakter arasında olmalıdır.' }, { status: 400 });
    }

    // 5. Anti-CRLF / Header Injection Check on header fields
    if (/[\r\n]/.test(name) || /[\r\n]/.test(subject) || /[\r\n]/.test(email)) {
      return NextResponse.json(
        { error: 'İsim, e-posta veya konu alanında satır sonu (CRLF) karakteri kullanılamaz.' },
        { status: 400 }
      );
    }

    const safeCategory = typeof category === 'string' ? category.slice(0, 50).replace(/[\r\n]/g, '') : 'Teknik Destek';
    const safePriority = typeof priority === 'string' ? priority.slice(0, 50).replace(/[\r\n]/g, '') : 'Normal';

    // Generate unique Ticket ID: XIV-XXXXXX
    const randomNum = Math.floor(100000 + Math.random() * 900000);
    const ticketId = `XIV-${randomNum}`;
    const createdAt = new Date().toISOString();

    const ticketData = {
      ticketId,
      name: name.trim(),
      email: email.trim(),
      category: safeCategory,
      priority: safePriority,
      subject: subject.trim(),
      message: message.trim(),
      status: 'Açık / İnceleniyor',
      createdAt,
      assignedTo: 'destek@xivizley.com.tr',
    };

    console.log('[XIVIZLEY SUPPORT] New Ticket Created:', ticketData.ticketId);

    // Asynchronously send confirmation email if configured
    import('@/lib/email').then(({ sendTicketConfirmationEmail }) => {
      sendTicketConfirmationEmail(ticketData.email, ticketData.name, ticketId, ticketData.subject, ticketData.message).catch((e) =>
        console.error('[Ticket Email Error]:', e)
      );
    });

    // Create deal in CRM if configured
    import('@/lib/sendpulse').then(({ createCrmDeal }) => {
      createCrmDeal(`Destek #${ticketId}: ${ticketData.name} (${ticketData.subject})`).catch((e) =>
        console.error('[Ticket CRM Deal Error]:', e)
      );
    });

    return NextResponse.json({
      success: true,
      ticketId,
      message: `Destek talebiniz başarıyla oluşturuldu (#${ticketId}). Uzman ekibimiz en kısa sürede (${ticketData.email}) adresinize geri dönüş yapacaktır.`,
      ticket: ticketData,
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Bilinmeyen hata';
    return NextResponse.json(
      { error: `Bilet oluşturulurken hata oluştu: ${errorMsg}` },
      { status: 500 }
    );
  }
}
