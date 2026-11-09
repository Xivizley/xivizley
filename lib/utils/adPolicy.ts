// ============================================================
// XIVIZLEY — Commercial Ad & Sponsor Display Policy
// lib/utils/adPolicy.ts
// ============================================================

/**
 * Checks whether commercial advertisements, affiliate referral links,
 * sponsor badges, and VIP promotion buttons should be disabled.
 *
 * Always returns true on local development / local network (localhost, 127.0.0.1)
 * or when NEXT_PUBLIC_DISABLE_ADS is set to "true".
 * This ensures clean, zero-ad academic presentation mode for TÜBİTAK, recordings, and offline demos.
 */
export function isCommercialAdsDisabled(): boolean {
  if (process.env.NEXT_PUBLIC_DISABLE_ADS === 'true') {
    return true;
  }
  if (typeof window !== 'undefined') {
    const host = window.location.hostname;
    if (
      host === 'localhost' ||
      host === '127.0.0.1' ||
      host.startsWith('192.168.') ||
      host.startsWith('10.') ||
      host.endsWith('.local')
    ) {
      return true;
    }
  }
  return false;
}

export function shouldShowAds(): boolean {
  return !isCommercialAdsDisabled();
}
