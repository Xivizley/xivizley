// ============================================================
// XIVIZLEY — Official Sponsors & Commercial Partner Config
// lib/config/sponsors.ts
// ============================================================

export interface SponsorItem {
  id: string;
  name: string;
  fullName: string;
  url: string;
  affiliateUrl: string;
  role: string;
  roleEn: string;
  badge: string;
  accentColor: string;
  enabled: boolean;
  recommendedTiers?: {
    minRamGB: number;
    planName: string;
    specs: string;
    purchaseUrl: string;
  }[];
}

export const SPONSORS: Record<string, SponsorItem> = {
  odeaweb: {
    id: 'odeaweb',
    name: 'OWEB',
    fullName: 'OWEB Bilişim Teknolojileri (TR Cloud)',
    url: 'https://www.oweb.net.tr/tr-cloud-sunucu.php?utm_source=xivizley&utm_medium=sponsor',
    affiliateUrl: 'https://www.oweb.net.tr/aff.php?aff=975',
    role: 'Resmi Altyapı Sponsorumuz (OWEB TR Cloud & 10 Gbit/s Datacenter NVMe)',
    roleEn: 'Official Infrastructure Sponsor (OWEB TR Cloud & 10 Gbit/s Datacenter NVMe)',
    badge: '⚡ OWEB TR Cloud & 10 Gbps NVMe Sponsoru',
    accentColor: '#00F2FE',
    enabled: true,
  },
  hostingComTr: {
    id: 'hosting-com-tr',
    name: 'Hosting.com.tr',
    fullName: 'Hosting.com.tr / Web Hosting Bilişim Teknolojileri A.Ş.',
    url: 'https://www.hosting.com.tr/aff.php?aff=1702',
    affiliateUrl: 'https://www.hosting.com.tr/aff.php?aff=1702',
    role: 'Resmi Altyapı Sponsorumuz (Yüksek Hızlı NVMe VDS)',
    roleEn: 'Official Infrastructure Sponsor (High-Speed NVMe VDS)',
    badge: '⚡ Resmi Altyapı Sponsorumuz',
    accentColor: '#8B5CF6',
    enabled: true,
    recommendedTiers: [
      {
        minRamGB: 2,
        planName: 'VPS 1 (Otomatik Kurulum)',
        specs: '2 GB RAM • 2 Core CPU • 30 GB NVMe SSD',
        purchaseUrl: 'https://www.hosting.com.tr/aff.php?aff=1702',
      },
      {
        minRamGB: 4,
        planName: 'VPS 2 (Otomatik Kurulum)',
        specs: '4 GB RAM • 4 Core CPU • 60 GB NVMe SSD',
        purchaseUrl: 'https://www.hosting.com.tr/aff.php?aff=1702',
      },
      {
        minRamGB: 8,
        planName: 'VPS 3 (Otomatik Kurulum)',
        specs: '8 GB RAM • 6 Core CPU • 100 GB NVMe SSD',
        purchaseUrl: 'https://www.hosting.com.tr/aff.php?aff=1702',
      },
    ],
  },
};

/**
 * Calculates the best recommended VDS tier for the given active nodes
 */
export function getRecommendedVdsPlan(estimatedRamMB: number) {
  const ramGB = estimatedRamMB / 1024;
  const tiers = SPONSORS.hostingComTr?.recommendedTiers;
  if (!tiers || tiers.length < 3) return null;

  if (ramGB <= 2.5) {
    return tiers[0];
  } else if (ramGB <= 5) {
    return tiers[1];
  } else {
    return tiers[2];
  }
}

// ─── Template to Sponsor / Affiliate Mapping ──────────────────

export interface TemplateSponsorInfo {
  sponsorId: 'odeaweb' | 'hostingComTr';
  sponsorName: string;
  badgeLabelTr: string;
  badgeLabelEn: string;
  noteTr: string;
  noteEn: string;
  ctaTextTr: string;
  ctaTextEn: string;
  affiliateUrl: string;
}

/**
 * Single source of truth for template-to-sponsor associations.
 * Any template mapped here will show the sponsor badge, affiliate disclaimer,
 * and direct sponsor action button with rel="sponsored noopener".
 */
export const TEMPLATE_SPONSORS: Record<string, TemplateSponsorInfo> = {
  // 1. Web Siteleri & CMS
  'strapi-headless-cms': {
    sponsorId: 'hostingComTr',
    sponsorName: 'Hosting.com.tr',
    badgeLabelTr: 'Hosting.com.tr Önerisi',
    badgeLabelEn: 'Recommended by Hosting.com.tr',
    noteTr: 'İş ortaklığı / Sponsorlu',
    noteEn: 'Affiliate Partnership / Sponsored',
    ctaTextTr: 'Uyumlu VDS Kirala',
    ctaTextEn: 'Get Compatible VDS',
    affiliateUrl: 'https://www.hosting.com.tr/aff.php?aff=1702',
  },
  // 2. 4K Medya, Sinema & Dizi
  'ultimate-4k-media-suite': {
    sponsorId: 'odeaweb',
    sponsorName: 'OWEB',
    badgeLabelTr: 'OWEB TR Cloud 10 Gbps Önerisi',
    badgeLabelEn: 'OWEB TR Cloud 10 Gbps Pick',
    noteTr: 'İş ortaklığı / Sponsorlu',
    noteEn: 'Affiliate Partnership / Sponsored',
    ctaTextTr: 'OWEB TR Cloud Seç',
    ctaTextEn: 'Select OWEB TR Cloud',
    affiliateUrl: 'https://www.oweb.net.tr/aff.php?aff=975',
  },
  'immich-ai-photo-vault': {
    sponsorId: 'odeaweb',
    sponsorName: 'OWEB',
    badgeLabelTr: 'OWEB TR Cloud NVMe Önerisi',
    badgeLabelEn: 'OWEB TR Cloud NVMe Pick',
    noteTr: 'İş ortaklığı / Sponsorlu',
    noteEn: 'Affiliate Partnership / Sponsored',
    ctaTextTr: 'OWEB TR Cloud Seç',
    ctaTextEn: 'Select OWEB TR Cloud',
    affiliateUrl: 'https://www.oweb.net.tr/aff.php?aff=975',
  },
  // 3. Oyun Sunucuları
  'palworld-dedicated-stack': {
    sponsorId: 'odeaweb',
    sponsorName: 'OWEB',
    badgeLabelTr: 'OWEB TR Cloud Yüksek RAM',
    badgeLabelEn: 'OWEB TR Cloud High RAM',
    noteTr: 'İş ortaklığı / Sponsorlu',
    noteEn: 'Affiliate Partnership / Sponsored',
    ctaTextTr: 'OWEB TR Cloud Kirala',
    ctaTextEn: 'Rent OWEB TR Cloud',
    affiliateUrl: 'https://www.oweb.net.tr/aff.php?aff=975',
  },
  'cs2-arena-stack': {
    sponsorId: 'hostingComTr',
    sponsorName: 'Hosting.com.tr',
    badgeLabelTr: 'Hosting.com.tr Düşük Ping',
    badgeLabelEn: 'Hosting.com.tr Low Ping',
    noteTr: 'İş ortaklığı / Sponsorlu',
    noteEn: 'Affiliate Partnership / Sponsored',
    ctaTextTr: 'Oyun VDS Kirala',
    ctaTextEn: 'Rent Game VDS',
    affiliateUrl: 'https://www.hosting.com.tr/aff.php?aff=1702',
  },
  // 4. E-Ticaret & SaaS
  'baserow-nocode-suite': {
    sponsorId: 'hostingComTr',
    sponsorName: 'Hosting.com.tr',
    badgeLabelTr: 'Hosting.com.tr Önerisi',
    badgeLabelEn: 'Recommended by Hosting.com.tr',
    noteTr: 'İş ortaklığı / Sponsorlu',
    noteEn: 'Affiliate Partnership / Sponsored',
    ctaTextTr: 'VDS İncele',
    ctaTextEn: 'Explore VDS',
    affiliateUrl: 'https://www.hosting.com.tr/aff.php?aff=1702',
  },
  // 5. Kurumsal & Ofis
  'nextcloud-collabora-office': {
    sponsorId: 'hostingComTr',
    sponsorName: 'Hosting.com.tr',
    badgeLabelTr: 'Hosting.com.tr Kurumsal',
    badgeLabelEn: 'Hosting.com.tr Enterprise',
    noteTr: 'İş ortaklığı / Sponsorlu',
    noteEn: 'Affiliate Partnership / Sponsored',
    ctaTextTr: 'Kurumsal VDS Kirala',
    ctaTextEn: 'Rent Enterprise VDS',
    affiliateUrl: 'https://www.hosting.com.tr/aff.php?aff=1702',
  },
};

export function getTemplateSponsor(templateId: string): TemplateSponsorInfo | null {
  return TEMPLATE_SPONSORS[templateId] || null;
}
