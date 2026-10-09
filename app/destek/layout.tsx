import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Destek & İletişim — XIVIZLEY Homelab & VDS',
  description: 'XIVIZLEY teknik destek, 7/24 bilet oluşturma, kurulum yardımı ve doğrudan kurucu iletişim merkezi.',
  openGraph: {
    title: 'Destek & İletişim — XIVIZLEY',
    description: 'XIVIZLEY teknik destek ve yardım masası.',
    images: ['/og.png'],
  },
};

export default function DestekLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
