import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Görsel Tuval & Self-Host Mimar',
  description:
    'Sürükle-bırak ile Self-Host ve Docker servislerini bağlayın, canlı port çakışması tespit edin ve VDS sunucunuza 1-tıkla deploy edin.',
  openGraph: {
    title: 'Görsel Tuval & Self-Host Mimar | XIVIZLEY',
    description:
      'Sürükle-bırak ile Self-Host ve Docker servislerini bağlayın, canlı port çakışması tespit edin ve VDS sunucunuza 1-tıkla deploy edin.',
    url: 'https://xivizley.com.tr/architect',
    siteName: 'XIVIZLEY',
    type: 'website',
  },
  twitter: {
    title: 'Görsel Tuval & Self-Host Mimar | XIVIZLEY',
    description:
      'Sürükle-bırak ile Self-Host ve Docker servislerini bağlayın, canlı port çakışması tespit edin ve 1-tıkla kurun.',
  },
  alternates: {
    canonical: 'https://xivizley.com.tr/architect',
  },
};

export default function ArchitectLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
