import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Homelab & Docker Rehberi, Sunucu Kurulum Kılavuzları',
  description: 'Adım adım Docker Compose kurulum rehberleri, port çakışması çözümleri ve VDS sunucu optimizasyon kılavuzları.',
  openGraph: {
    title: 'XIVIZLEY Homelab & Docker Kütüphanesi',
    description: 'Adım adım Docker kurulum kılavuzları ve tek tıkla canlıya alma mimarileri.',
    url: 'https://xivizley.com.tr/blog',
  },
  alternates: {
    canonical: '/blog',
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
