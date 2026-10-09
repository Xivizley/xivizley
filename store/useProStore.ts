import { create } from 'zustand';
import { validateLicenseKey, type LicenseValidationResult } from '@/lib/services/licenseService';

interface ProState {
  isPro: boolean;
  tier: 'VIP_LIFETIME' | 'VIP_MONTHLY' | 'FOUNDER' | 'FREE';
  licenseKey: string | null;
  activatedAt: string | null;

  activateLicense: (key: string) => LicenseValidationResult;
  deactivateLicense: () => void;
}

const STORAGE_KEY = 'xivizley_pro_data';

export const useProStore = create<ProState>((set) => {
  // Initial load from localStorage
  let initialIsPro = false;
  let initialTier: ProState['tier'] = 'FREE';
  let initialKey: string | null = null;
  let initialActivatedAt: string | null = null;

  if (typeof window !== 'undefined') {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const data = JSON.parse(saved);
        if (data.key && validateLicenseKey(data.key).valid) {
          initialIsPro = true;
          initialTier = data.tier || 'VIP_LIFETIME';
          initialKey = data.key;
          initialActivatedAt = data.activatedAt;
        }
      }
    } catch {
      // ignore
    }
  }

  return {
    isPro: initialIsPro,
    tier: initialTier,
    licenseKey: initialKey,
    activatedAt: initialActivatedAt,

    activateLicense: (rawKey: string) => {
      const result = validateLicenseKey(rawKey);
      if (result.valid) {
        const payload = {
          isPro: true,
          tier: result.tier || 'VIP_LIFETIME',
          key: rawKey.trim().toUpperCase(),
          activatedAt: result.activatedAt || new Date().toISOString(),
        };

        if (typeof window !== 'undefined') {
          localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        }

        set({
          isPro: true,
          tier: payload.tier,
          licenseKey: payload.key,
          activatedAt: payload.activatedAt,
        });
      }
      return result;
    },

    deactivateLicense: () => {
      if (typeof window !== 'undefined') {
        localStorage.removeItem(STORAGE_KEY);
      }
      set({
        isPro: false,
        tier: 'FREE',
        licenseKey: null,
        activatedAt: null,
      });
    },
  };
});
