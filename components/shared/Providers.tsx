'use client';

import { SessionProvider } from 'next-auth/react';
import { ReactNode, useEffect } from 'react';
import { useThemeStore } from '@/store/useThemeStore';

function ThemeInitializer() {
  const theme = useThemeStore((s) => s.theme);

  useEffect(() => {
    if (typeof document !== 'undefined') {
      document.documentElement.setAttribute('data-theme', theme);
    }
  }, [theme]);

  return null;
}

import { TelegramSupportWidget } from '@/components/shared/TelegramSupportWidget';
import { LeadMagnetModal } from '@/components/shared/LeadMagnetModal';

export function Providers({ children }: { children: ReactNode }) {
  return (
    <SessionProvider>
      <ThemeInitializer />
      {children}
      <TelegramSupportWidget />
      <LeadMagnetModal />
    </SessionProvider>
  );
}
