import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Gizlilik ve Güvenlik Politikası',
  description: 'XIVIZLEY %100 istemci taraflı (client-side) çalışır. Veritabanımızda hiçbir sunucu şifresi, konfigürasyon veya IP tutulmaz.',
  openGraph: {
    title: 'Gizlilik Politikası — XIVIZLEY',
    description: 'Şeffaf ve güvenli veri mimarisi: Sıfır veri saklama politikası.',
  },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
