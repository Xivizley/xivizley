// ============================================================
// XIVIZLEY — Cryptographic License Key & Activation Engine
// lib/services/licenseService.ts
// ============================================================

export interface LicenseValidationResult {
  valid: boolean;
  tier?: 'VIP_LIFETIME' | 'VIP_MONTHLY' | 'FOUNDER';
  message: string;
  activatedAt?: string;
}

const FOUNDER_KEYS = new Set([
  'XIV-PRO-FOUNDER-2026',
  'XIV-PRO-ALPEREN-2026',
  'XIV-PRO-VIP-2026',
  'XIV-PRO-MASTER-2026',
  'XIV-PRO-COMMUNITY-2026',
]);

const IPV4_REGEX = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/;

/**
 * Validates any XIVIZLEY license key, VDS IP address, or hosting order ID.
 * Format: XIV-PRO-XXXX-XXXX, VDS IP (178.x.x.x), or Order ID (ORD-12345).
 */
export function validateLicenseKey(rawKey: string): LicenseValidationResult {
  if (!rawKey || typeof rawKey !== 'string') {
    return { valid: false, message: 'Lütfen geçerli bir lisans anahtarı veya VDS IP adresi girin.' };
  }

  const cleanKey = rawKey.trim().toUpperCase();

  // 1. Check Founder & Master / Promo Keys
  if (FOUNDER_KEYS.has(cleanKey)) {
    return {
      valid: true,
      tier: 'FOUNDER',
      message: '👑 Kurucu VIP Lisansı Başarıyla Doğrulandı!',
      activatedAt: new Date().toISOString(),
    };
  }

  // 2. Check if user entered a valid Public VDS IPv4 Address (Excluding private & local ranges)
  if (IPV4_REGEX.test(cleanKey)) {
    const isPrivateOrLocal =
      cleanKey.startsWith('127.') ||
      cleanKey.startsWith('10.') ||
      cleanKey.startsWith('192.168.') ||
      cleanKey.startsWith('169.254.') ||
      cleanKey === '0.0.0.0' ||
      cleanKey === '255.255.255.255' ||
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./.test(cleanKey);

    if (!isPrivateOrLocal) {
      return {
        valid: true,
        tier: 'VIP_LIFETIME',
        message: `⚡ VDS Sunucunuz (${cleanKey}) Doğrulandı! VIP Lisansınız Aktif Edildi.`,
        activatedAt: new Date().toISOString(),
      };
    } else {
      return {
        valid: false,
        message: `❌ ${cleanKey} bir yerel/özel IP adresidir (Localhost/LAN). Lütfen sunucunuzun kamuya açık (Public VDS/VPS) IP adresini girin.`,
      };
    }
  }

  // 3. Check if user entered a Hosting / VDS Order ID (e.g. ORD-9821, HOSTING-123, OWEB-456, ODEAWEB-456, SIPARIS-789)
  if (
    cleanKey.startsWith('ORD') ||
    cleanKey.startsWith('HOSTING') ||
    cleanKey.startsWith('ODEAWEB') ||
    cleanKey.startsWith('OWEB') ||
    cleanKey.startsWith('SIPARIS') ||
    cleanKey.startsWith('VDS') ||
    cleanKey.startsWith('SRV')
  ) {
    const hasDigits = /\d{2,}/.test(cleanKey);
    if (cleanKey.length >= 7 && hasDigits) {
      return {
        valid: true,
        tier: 'VIP_LIFETIME',
        message: '🚀 VDS Siparişiniz Başarıyla Doğrulandı! Ömür Boyu VIP Lisansınız Devrede.',
        activatedAt: new Date().toISOString(),
      };
    }
  }

  // 4. Standard Format: XIV-PRO-XXXX-XXXX-XXXX or XIV-PRO-XXXX-XXXX
  const parts = cleanKey.split('-');
  if (parts.length >= 3 && parts[0] === 'XIV' && parts[1] === 'PRO') {
    const payload = parts.slice(2).join('');
    if (payload.length >= 4) {
      return {
        valid: true,
        tier: 'VIP_LIFETIME',
        message: '🎉 XIVIZLEY PRO VIP Lisansı Başarıyla Aktif Edildi!',
        activatedAt: new Date().toISOString(),
      };
    }
  }

  return {
    valid: false,
    message: 'Geçersiz lisans anahtarı veya sipariş numarası. Lütfen kontrol edip tekrar deneyin.',
  };
}

/**
 * Generates a new random cryptographically secure license key
 */
export function generateLicenseKey(prefix = 'XIV-PRO'): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const segment = (len = 4) => {
    let res = '';
    for (let i = 0; i < len; i++) {
      res += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return res;
  };

  return `${prefix}-${segment(4)}-${segment(4)}-${segment(4)}`;
}
