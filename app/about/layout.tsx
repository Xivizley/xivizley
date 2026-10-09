import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Hakkımızda & Vizyonumuz',
  description:
    'XIVIZLEY, geliştiricilerin ve self-host meraklılarının karmaşık Docker mimarilerini görselleştirip saniyeler içinde kurmasını sağlar.',
  openGraph: {
    title: 'Hakkımızda & Vizyonumuz | XIVIZLEY',
    description:
      'Geliştiricilerin ve self-host meraklılarının karmaşık Docker mimarilerini görselleştirip saniyeler içinde kurmasını sağlar.',
    url: 'https://xivizley.com.tr/about',
    siteName: 'XIVIZLEY',
    type: 'website',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
