import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Homelab & Sunucu Topluluk Forumu, Docker Tartışmaları',
  description: 'VDS sunucu deneyimlerinizi paylaşın, Docker port çakışmalarına yardım isteyin ve mimari önerileri tartışın.',
  openGraph: {
    title: 'XIVIZLEY Topluluk Forumu & Tartışmalar',
    description: 'Linux VDS, Docker Compose ve Homelab geliştirici topluluğu.',
    url: 'https://xivizley.com.tr/forum',
  },
  alternates: {
    canonical: '/forum',
  },
};

export default function ForumLayout({ children }: { children: React.ReactNode }) {
  return children;
}
