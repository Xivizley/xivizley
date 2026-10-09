// ============================================================
// XIVIZLEY — Send Architecture & Compose to Email API Route
// app/api/export/email/route.ts
// ============================================================

import { NextRequest, NextResponse } from 'next/server';
import { sendMail } from '@/lib/email';
import rateLimit from '@/lib/rateLimit';

export const dynamic = 'force-dynamic';

const limiter = rateLimit({
  interval: 10 * 60 * 1000, // 10 minutes
  uniqueTokenPerInterval: 500,
});

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MAX_PAYLOAD_BYTES = 256 * 1024; // 256 KB

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

    // 1. IP & Rate Limiting (Max 5 export emails per 10 minutes per IP)
    try {
      await limiter.check(5, ip);
    } catch {
      return NextResponse.json(
        { error: 'Çok fazla e-posta gönderim isteği yapıldı. Lütfen birkaç dakika sonra tekrar deneyin.' },
        { status: 429 }
      );
    }

    // 2. Payload size check
    const contentLength = Number(req.headers.get('content-length') || 0);
    if (contentLength > MAX_PAYLOAD_BYTES) {
      return NextResponse.json(
        { error: 'İstek boyutu izin verilen sınırı aşıyor (Maksimum 256 KB).' },
        { status: 413 }
      );
    }

    const body = await req.json();
    const { email, composeYaml, deployScript, moduleNames, canvasUrl, turnstileToken } = body;

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
    if (!email || typeof email !== 'string' || email.length > 150 || !EMAIL_REGEX.test(email.trim()) || /[\r\n]/.test(email)) {
      return NextResponse.json(
        { error: 'Lütfen geçerli bir e-posta adresi giriniz.' },
        { status: 400 }
      );
    }

    if (!composeYaml || typeof composeYaml !== 'string') {
      return NextResponse.json(
        { error: 'Gönderilecek Docker Compose verisi bulunamadı.' },
        { status: 400 }
      );
    }

    const safeEmail = email.trim();
    const cleanYaml = composeYaml.slice(0, 50000);
    const escapedYaml = cleanYaml
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;');

    const safeDeployScript = typeof deployScript === 'string' ? deployScript.slice(0, 50000) : '';
    const safeCanvasUrl = typeof canvasUrl === 'string' && canvasUrl.length < 2000 && !/[\r\n]/.test(canvasUrl) ? canvasUrl : '';

    const safeModules = Array.isArray(moduleNames)
      ? moduleNames
          .slice(0, 50)
          .filter((m) => typeof m === 'string' && !/[\r\n]/.test(m))
          .map((m) => m.slice(0, 50).replace(/[<>&"']/g, ''))
      : [];

    const servicesList = safeModules.length > 0
      ? safeModules.map((m: string) => '<span style="display:inline-block; background:#1e293b; border:1px solid #334155; color:#38bdf8; padding:3px 10px; border-radius:12px; font-size:12px; margin:3px 4px 3px 0; font-weight:600;">📦 ' + m + '</span>').join('')
      : '<span style="color:#94a3b8; font-style:italic;">Özel Servisler</span>';

    const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #08090e; color: #f1f5f9; margin: 0; padding: 24px; }
        .container { max-width: 620px; margin: 0 auto; background: #0c111d; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; }
        .header { background: linear-gradient(135deg, #0284c7, #06b6d4); padding: 32px 28px; text-align: center; }
        .title { color: #ffffff; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
        .sub { color: rgba(255,255,255,0.9); margin: 6px 0 0 0; font-size: 13px; }
        .content { padding: 28px; font-size: 14px; line-height: 1.6; color: #cbd5e1; }
        .section-title { font-size: 13px; font-weight: 700; text-transform: uppercase; color: #94a3b8; letter-spacing: 0.5px; margin: 20px 0 8px 0; }
        .code-block { background: #04060a; border: 1px solid #1e293b; border-radius: 12px; padding: 16px; font-family: monospace; font-size: 11px; color: #38bdf8; overflow-x: auto; line-height: 1.5; white-space: pre-wrap; word-break: break-all; }
        .btn-primary { display: inline-block; background: linear-gradient(135deg, #0284c7, #06b6d4); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 13px; margin: 12px 0; }
        .btn-outline { display: inline-block; background: #1e293b; border: 1px solid #38bdf8; color: #38bdf8; text-decoration: none; padding: 10px 20px; border-radius: 8px; font-weight: 600; font-size: 12px; }
        .footer { border-top: 1px solid #1e293b; padding: 20px 28px; font-size: 11px; color: #64748b; text-align: center; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1 class="title">XIVIZLEY — Docker Stack Mimarisi 🚀</h1>
          <p class="sub">Tasarladığınız Homelab konfigürasyonu ve kurulum rehberiniz</p>
        </div>
        <div class="content">
          <p>Merhaba,</p>
          <p><strong>XIVIZLEY</strong> üzerinde oluşturduğunuz görsel Docker Compose mimarinizi daha sonra kolayca kullanabilmeniz için e-postanıza kaydettik.</p>
          
          <div class="section-title">Mimarinizdeki Servisler:</div>
          <div style="margin-bottom: 16px;">
            ${servicesList}
          </div>

          ${safeDeployScript ? `
          <div class="section-title">⚡ Kurulum &amp; Dağıtım Scripti (deploy.sh):</div>
          <p style="font-size:12px; color:#94a3b8; margin-top:2px;">Sunucunuzda <code>chmod +x deploy.sh &amp;&amp; ./deploy.sh</code> ile pre-flight ve port çakışma denetimini otomatik yapabilirsiniz:</p>
          <div class="code-block" style="color: #34d399; font-size: 11px;">
${safeDeployScript.slice(0, 4000).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}
          </div>
          ` : ''}

          <div class="section-title">📄 docker-compose.yml İçeriği:</div>
          <div class="code-block">
${escapedYaml}
          </div>

          <div style="text-align: center; margin: 28px 0 16px 0;">
            ${safeCanvasUrl ? `
            <a href="${safeCanvasUrl}" class="btn-primary" style="margin-right: 8px;">Tuvali Yeniden Aç ➔</a>
            ` : ''}
            <a href="https://t.me/xivizley_destek_bot" class="btn-outline">7/24 Telegram Asistanına Sor 🤖</a>
          </div>

          <p style="font-size:12px; color:#94a3b8; text-align:center;">
            Herhangi bir port çakışması veya Docker sorusunda Telegram botumuz (@xivizley_destek_bot) 7/24 ücretsiz yardıma hazır.
          </p>
        </div>
        <div class="footer">
          Bu e-posta <a href="https://xivizley.com.tr" style="color: #38bdf8;">xivizley.com.tr</a> üzerinde mimarinizi e-postaya gönder seçeneğini kullandığınız için gönderilmiştir.<br>
          © ${new Date().getFullYear()} XIVIZLEY · Alperen
        </div>
      </div>
    </body>
    </html>
    `;

    const countLabel = safeModules.length > 0 ? ` (${safeModules.length} Servis)` : '';
    const result = await sendMail({
      to: safeEmail,
      subject: `[XIVIZLEY] Docker Compose Mimariniz Hazır! 🚀${countLabel}`,
      html,
    });

    if (!result.success) {
      return NextResponse.json(
        { error: `E-posta gönderilirken hata oluştu: ${result.error}` },
        { status: 500 }
      );
    }

    // Direct SendPulse API Integration if configured
    import('@/lib/sendpulse').then(({ addSubscriberToSendPulse, createCrmDeal }) => {
      addSubscriberToSendPulse(safeEmail).catch((e) => console.error('[SendPulse Book Error]:', e));
      const count = safeModules.length;
      createCrmDeal(`Mimari Talebi: ${safeEmail} (${count} Servis)`).catch((e) => console.error('[SendPulse CRM Deal Error]:', e));
    });

    return NextResponse.json({
      success: true,
      message: 'docker-compose.yml ve kurulum rehberiniz e-posta adresinize gönderildi! Gelen kutunuzu kontrol edin.',
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Sunucu hatası';
    return NextResponse.json({ error: errorMsg }, { status: 500 });
  }
}
