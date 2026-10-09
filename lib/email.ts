import nodemailer from 'nodemailer';

const rawHost = process.env.SMTP_HOST;
const SMTP_HOST = rawHost || '';
const SMTP_PORT = Number(process.env.SMTP_PORT) || 465;
const rawUser = process.env.SMTP_USER;
const SMTP_USER = rawUser || '';
const rawPass = process.env.SMTP_PASS;
const SMTP_PASS = rawPass || '';
const SMTP_FROM = `"XIVIZLEY" <${process.env.SMTP_FROM_EMAIL || 'destek@xivizley.com.tr'}>`;

export const transporter = nodemailer.createTransport({
  host: SMTP_HOST,
  port: SMTP_PORT,
  secure: SMTP_PORT === 465,
  auth: {
    user: SMTP_USER,
    pass: SMTP_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

/**
 * Escapes HTML characters to prevent HTML / XSS / Phishing injection in email clients
 */
export function escapeHtml(str: string): string {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

/**
 * Strips carriage return and newline characters to prevent SMTP / Email Header Injection
 */
export function sanitizeHeader(str: string): string {
  if (!str) return '';
  return String(str).replace(/[\r\n\t]/g, ' ').trim();
}

export interface SendMailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
  replyTo?: string;
}

export async function sendMail({ to, subject, html, text, replyTo }: SendMailOptions) {
  try {
    const cleanTo = sanitizeHeader(to);
    const cleanSubject = sanitizeHeader(subject);
    const cleanReplyTo = replyTo ? sanitizeHeader(replyTo) : 'destek@xivizley.com.tr';

    const info = await transporter.sendMail({
      from: SMTP_FROM,
      to: cleanTo,
      subject: cleanSubject,
      html,
      text: text || html.replace(/<[^>]+>/g, ''),
      replyTo: cleanReplyTo,
    });
    console.log(`[SMTP SUCCESS] Sent email to ${cleanTo}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : String(err);
    console.error(`[SMTP ERROR] Failed sending email:`, errorMsg);
    return { success: false, error: errorMsg };
  }
}

export async function sendTicketConfirmationEmail(email: string, name: string, ticketId: string, subject: string, userMessage: string) {
  const safeName = escapeHtml(name);
  const safeTicketId = escapeHtml(sanitizeHeader(ticketId));
  const safeSubjectHtml = escapeHtml(subject);
  const safeMessageHtml = escapeHtml(userMessage.slice(0, 500));
  const safeSubjectHeader = sanitizeHeader(subject);

  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #08090e; color: #f1f5f9; margin: 0; padding: 24px; }
      .container { max-width: 580px; margin: 0 auto; background: #0e131f; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; }
      .header { background: linear-gradient(135deg, #0284c7, #06b6d4); padding: 28px; text-align: center; }
      .title { color: #ffffff; margin: 0; font-size: 22px; font-weight: 700; letter-spacing: -0.5px; }
      .badge { display: inline-block; background: rgba(255,255,255,0.2); padding: 4px 12px; border-radius: 20px; font-size: 12px; margin-top: 8px; color: #fff; }
      .content { padding: 28px; font-size: 14px; line-height: 1.6; color: #cbd5e1; }
      .ticket-box { background: #151d30; border: 1px solid #334155; border-radius: 12px; padding: 16px; margin: 20px 0; }
      .ticket-label { font-size: 11px; text-transform: uppercase; color: #94a3b8; font-weight: 600; margin-bottom: 4px; }
      .ticket-val { color: #38bdf8; font-family: monospace; font-size: 16px; font-weight: bold; }
      .btn { display: inline-block; background: #0284c7; color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 600; font-size: 13px; margin-top: 16px; }
      .footer { border-top: 1px solid #1e293b; padding: 20px 28px; font-size: 11px; color: #64748b; text-align: center; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1 class="title">XIVIZLEY Destek Talebi Alındı</h1>
        <div class="badge">Bilet #${safeTicketId}</div>
      </div>
      <div class="content">
        <p>Merhaba <strong>${safeName}</strong>,</p>
        <p>Destek talebiniz başarıyla sistemimize kaydedildi. Uzman ekibimiz ve yapay zeka asistanımız konuyu inceleyerek en kısa sürede bu e-posta adresi üzerinden dönüş yapacaktır.</p>
        
        <div class="ticket-box">
          <div class="ticket-label">Talep Numarası</div>
          <div class="ticket-val">#${safeTicketId}</div>
          <div class="ticket-label" style="margin-top: 12px;">Konu</div>
          <div style="color: #f8fafc; font-weight: 600;">${safeSubjectHtml}</div>
          <div class="ticket-label" style="margin-top: 12px;">Mesajınız</div>
          <div style="color: #94a3b8; font-style: italic;">"${safeMessageHtml}${userMessage.length > 500 ? '...' : ''}"</div>
        </div>

        <p>Acil konularda 7/24 Telegram AI Destek Asistanımızla da anında görüşebilirsiniz:</p>
        <p><a href="https://t.me/xivizley_destek_bot" class="btn">Telegram Asistanına Sor ➔</a></p>
      </div>
      <div class="footer">
        © ${new Date().getFullYear()} XIVIZLEY · Açık Kaynak Homelab & Docker Platformu · <a href="https://xivizley.com.tr" style="color: #0ea5e9;">xivizley.com.tr</a>
      </div>
    </div>
  </body>
  </html>
  `;

  return sendMail({
    to: email,
    subject: `[XIVIZLEY Destek #${safeTicketId}] Talebiniz Alındı: ${safeSubjectHeader}`,
    html,
  });
}

export async function sendNewsletterWelcomeEmail(email: string) {
  const html = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background-color: #08090e; color: #f1f5f9; margin: 0; padding: 24px; }
      .container { max-width: 580px; margin: 0 auto; background: #0e131f; border: 1px solid #1e293b; border-radius: 16px; overflow: hidden; }
      .header { background: linear-gradient(135deg, #0f172a, #1e293b); padding: 32px 28px; text-align: center; border-bottom: 1px solid #334155; }
      .title { color: #38bdf8; margin: 0; font-size: 24px; font-weight: 800; letter-spacing: -0.5px; }
      .sub { color: #94a3b8; margin: 8px 0 0 0; font-size: 13px; }
      .content { padding: 28px; font-size: 14px; line-height: 1.6; color: #cbd5e1; }
      .feature { background: #131b2e; border: 1px solid #1e293b; border-radius: 10px; padding: 14px; margin: 10px 0; }
      .btn { display: inline-block; background: linear-gradient(135deg, #0284c7, #06b6d4); color: #ffffff; text-decoration: none; padding: 12px 24px; border-radius: 8px; font-weight: 700; font-size: 13px; margin: 16px 0; }
      .footer { border-top: 1px solid #1e293b; padding: 20px 28px; font-size: 11px; color: #64748b; text-align: center; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="header">
        <h1 class="title">XIVIZLEY Topluluğuna Hoş Geldin! 🚀</h1>
        <p class="sub">Görsel Docker & Homelab Mimarisi Platformu</p>
      </div>
      <div class="content">
        <p>Aramıza katıldığın için çok mutluyuz! Artık en yeni Docker Compose şablonları, port çakışması optimizasyonları ve homelab rehberleri doğrudan gelen kutuna gelecek.</p>
        
        <div class="feature">
          <strong style="color: #38bdf8;">🖥️ 115 Popüler Modül:</strong>
          <span style="color: #94a3b8;"> AdGuard, Nextcloud, Plex, Jellyfin, Vaultwarden ve daha fazlasını sürükle-bırak tasarla.</span>
        </div>
        <div class="feature">
          <strong style="color: #34d399;">⚡ 1-Tıkla VDS Kurulumu:</strong>
          <span style="color: #94a3b8;"> Üretilen curl betiğini sunucu terminaline yapıştır, tüm stack otomatik kurulsun.</span>
        </div>
        <div class="feature">
          <strong style="color: #a78bfa;">🤖 7/24 AI Destek:</strong>
          <span style="color: #94a3b8;"> Telegram botumuz (@xivizley_destek_bot) her an sorularına yanıt vermeye hazır.</span>
        </div>

        <p style="text-align: center;">
          <a href="https://xivizley.com.tr/architect" class="btn">Hemen Mimari Tasarlamaya Başla ➔</a>
        </p>
      </div>
      <div class="footer">
        Bu e-posta <a href="https://xivizley.com.tr" style="color: #38bdf8;">xivizley.com.tr</a> bültenine kayıt olduğun için gönderilmiştir.<br>
        © ${new Date().getFullYear()} XIVIZLEY · Alperen
      </div>
    </div>
  </body>
  </html>
  `;

  return sendMail({
    to: email,
    subject: 'XIVIZLEY Topluluğuna Hoş Geldiniz! 🚀 (Görsel Docker & Homelab)',
    html,
  });
}
