// ============================================================
// XIVIZLEY — Root Layout (Production Grade with SEO, A11y & JSON-LD)
// app/layout.tsx
// ============================================================

import './globals.css';
import { Newsreader, JetBrains_Mono } from 'next/font/google';
import { Providers } from '@/components/shared/Providers';
import { siteMetadata, siteViewport } from '@/lib/metadata';
import { PLATFORM_STATS } from '@/lib/constants/stats';

const serifFont = Newsreader({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-serif',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
});

const monoFont = JetBrains_Mono({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-mono',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

export const viewport = siteViewport;
export const metadata = siteMetadata;

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    {
      '@type': 'WebSite',
      '@id': 'https://xivizley.com.tr/#website',
      url: 'https://xivizley.com.tr',
      name: 'XIVIZLEY',
      description: PLATFORM_STATS.taglineTr,
      inLanguage: 'tr-TR',
    },
    {
      '@type': 'WebApplication',
      '@id': 'https://xivizley.com.tr/#webapp',
      name: 'XIVIZLEY',
      url: 'https://xivizley.com.tr',
      applicationCategory: 'DeveloperApplication',
      operatingSystem: 'All',
      inLanguage: 'tr-TR',
      description: PLATFORM_STATS.taglineTr,
      offers: {
        '@type': 'Offer',
        price: '0',
        priceCurrency: 'TRY',
      },
      featureList: [
        'Görsel Sürükle-Bırak Docker Tuvali',
        'Canlı Port Çakışması Tespit ve Çözüm Motoru',
        'Akıllı Otomatik Hizalama (Auto-Layout)',
        '1-Tıkla VDS & VPS Akıllı Kurulum Scripti (curl | bash)',
        'Hosting.com.tr & OWEB Bulut Entegrasyonu (Affiliate)',
        'Nextcloud, Immich, Paperless-ngx, Vaultwarden, Pi-hole desteği',
        'İki Yönlü Docker Compose YAML İçe / Dışa Aktarma',
      ],
    },
    {
      '@type': 'Organization',
      '@id': 'https://xivizley.com.tr/#organization',
      name: 'XIVIZLEY',
      url: 'https://xivizley.com.tr',
      logo: 'https://xivizley.com.tr/icon.svg',
      description: PLATFORM_STATS.taglineTr,
      founder: {
        '@type': 'Person',
        name: 'Alperen',
        jobTitle: 'Kurucu & Geliştirici',
      },
      license: 'https://opensource.org/licenses/MIT',
      sameAs: [
        'https://github.com/Xivizley/xivizley',
        'https://forum.xivizley.com.tr',
        'https://x.com/xivizley',
      ],
      contactPoint: {
        '@type': 'ContactPoint',
        email: 'destek@xivizley.com.tr',
        contactType: 'customer support',
        availableLanguage: ['Turkish'],
      },
    },
    // NOTE: FAQPage structured data is intentionally NOT declared here.
    // It is emitted on the homepage only (app/page.tsx) from the same FAQS
    // source as the visible accordion, to avoid duplicate/empty FAQ schemas
    // being injected on every route (e.g. /compare ships its own FAQPage).
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" className="dark" suppressHydrationWarning>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              "name": "XIVIZLEY",
              "description": PLATFORM_STATS.taglineTr,
              "applicationCategory": "DeveloperApplication",
              "url": "https://xivizley.com.tr",
              "offers": { "@type": "Offer", "price": "0" },
            }),
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
        {/* SendPulse Web Push Notification Engine */}
        <script
          charSet="UTF-8"
          src="//web.webpushs.com/js/push/f86b3cd41d9992b162f73e37fdd9ec9d_1.js"
          async
        />
      </head>
      <body className={`${serifFont.variable} ${monoFont.variable} font-mono antialiased bg-[#090514] text-[#F5F3FF] min-h-screen flex flex-col selection:bg-[#8B5CF6]/30 selection:text-[#F5F3FF]`}>
        <Providers>{children}</Providers>
        {/* Directory Verification Backlink */}
        <div className="sr-only">
          <a href="https://smolrank.com/projects/xivizley?utm_source=badge" target="_blank" rel="noopener noreferrer">
            <img src="https://smolrank.com/smolrank/images/badges/featured-on-dark.svg" alt="Featured on Smol Rank" style={{ height: '44px', width: 'auto' }} />
          </a>
        </div>
      </body>
    </html>
  );
}
