import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Self-Host & Docker Başlangıç Rehberi',
  description:
    'Adım adım Docker kurulumu, port yönetimi, ters vekil (Nginx Proxy) ve VDS optimizasyonu rehberi. Self-Host uzmanı olun.',
  openGraph: {
    title: 'Self-Host & Docker Başlangıç Rehberi | XIVIZLEY',
    description:
      'Adım adım Docker kurulumu, port yönetimi, ters vekil ve VDS optimizasyonu rehberi.',
    url: 'https://xivizley.com.tr/guide',
    siteName: 'XIVIZLEY',
    type: 'article',
  },
  twitter: {
    title: 'Self-Host & Docker Başlangıç Rehberi | XIVIZLEY',
    description: 'Adım adım Docker ve Self-Host rehberi.',
  },
  alternates: {
    canonical: 'https://xivizley.com.tr/guide',
  },
};

export default function GuideLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
