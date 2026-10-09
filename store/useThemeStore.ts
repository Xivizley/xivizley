// ============================================================
// XIVIZLEY — Theme State Store
// store/useThemeStore.ts
// ============================================================

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type AppTheme = 'cyberpunk' | 'synthwave' | 'matrix' | 'oled';

export interface ThemeOption {
  id: AppTheme;
  name: string;
  nameEn: string;
  color: string;
  border: string;
  icon: string;
}

export const THEME_OPTIONS: ThemeOption[] = [
  { id: 'cyberpunk', name: 'Cyberpunk Cyan', nameEn: 'Cyberpunk Cyan', color: '#06b6d4', border: 'border-cyan-500', icon: '🌌' },
  { id: 'synthwave', name: 'Synthwave Mor', nameEn: 'Synthwave Purple', color: '#a855f7', border: 'border-purple-500', icon: '🟣' },
  { id: 'matrix', name: 'Matrix Hacker', nameEn: 'Matrix Emerald', color: '#10b981', border: 'border-emerald-500', icon: '🟢' },
  { id: 'oled', name: 'OLED Midnight', nameEn: 'OLED Midnight', color: '#f8fafc', border: 'border-slate-400', icon: '🌑' },
];

interface ThemeState {
  theme: AppTheme;
  setTheme: (theme: AppTheme) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'cyberpunk',
      setTheme: (theme) => {
        set({ theme });
        if (typeof document !== 'undefined') {
          document.documentElement.setAttribute('data-theme', theme);
        }
      },
    }),
    { name: 'xivizley-theme' }
  )
);
