// ============================================================
// XIVIZLEY — SEO & OpenGraph Configuration (Top-Ranking Engine)
// lib/metadata.ts
// ============================================================

import type { Metadata, Viewport } from 'next';
import { PLATFORM_STATS } from '@/lib/constants/stats';

export const siteViewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#090514',
};

export const siteMetadata: Metadata = {
  metadataBase: new URL('https://xivizley.com.tr'),
  title: {
    template: '%s | XIVIZLEY',
    default: 'XIVIZLEY — Görsel Self-Host & Docker Mimari Tasarımı',
  },
  description: PLATFORM_STATS.taglineTr,
  keywords: [
    // Global & English High-Intent Search
    'docker compose generator',
    'visual docker compose builder',
    'docker compose gui',
    'homelab architecture builder',
    'docker port conflict resolver',
    'din 40719 architecture spec',
    'visual homelab designer',
    'supabase self hosted docker compose',
    'pterodactyl docker compose',
    'rustdesk relay docker compose',
    'searxng docker compose template',
    'n8n workflow docker compose',
    // Core Product & Self-Host TR
    'self-host',
    'self-hosting',
    'self-hosted uygulamalar',
    'homelab',
    'docker compose oluşturucu',
    'görsel docker compose',
    'docker mimarisi tasarlama',
    'vds sunucu kurma',
    'vds docker kurulumu',
    'port çakışması çözümü',
    'türkiye vds',
    'bulut sunucu kurma',
    'otomatik docker kurulumu',
    '10 gbps vds türkiye',
    // New & Trending Modules
    'immich docker kurulumu',
    'google fotoğraflar alternatifi',
    'paperless-ngx kurulumu ve ocr',
    'home assistant docker setup',
    'ghost cms docker compose',
    'pocketbase self hosted',
    'gitea github alternatifi kurma',
    'minio s3 object storage docker',
    'grafana prometheus sunucu izleme',
    'rustdesk server kurma uzak masaüstü',
    // Core Services
    'nextcloud docker kurulumu',
    'pihole docker setup',
    'uptime kuma kurulumu',
    'vaultwarden şifre kasası',
    'portainer ce kurulumu',
    'nginx proxy manager rehberi',
    'mail sunucusu kurma docker',
    'wireguard vpn kurulumu',
    'glances sistem izleme',
    'plex medya sunucusu',
    'jellyfin docker türkçe',
    // Commercial Partners
    'oweb tr cloud',
    'oweb vds',
    'oweb bulut sunucu',
    'oweb 10 gbps port',
    'odeaweb vds',
    'odeaweb bulut sunucu',
    'hosting.com.tr vps',
    'hosting.com.tr vds ultra',
    // English & Global SEO
    'visual self-hosted architect',
    'docker compose visual builder',
    'port conflict resolver',
    'self-hosted stack generator',
    '1-click vds deploy',
    'docker compose auto layout',
    'open source self-hosting manager',
  ],
  authors: [{ name: 'Alperen | XIVIZLEY', url: 'https://xivizley.com.tr' }],
  creator: 'Alperen (XIVIZLEY)',
  publisher: 'XIVIZLEY Cloud & Self-Host Platform',
  category: 'technology',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    title: 'XIVIZLEY — Görsel Self-Host & Docker Mimari Tasarımı',
    description: PLATFORM_STATS.taglineTr,
    url: 'https://xivizley.com.tr',
    siteName: 'XIVIZLEY',
    locale: 'tr_TR',
    type: 'website',
    images: [
      {
        url: 'https://xivizley.com.tr/api/og',
        width: 1200,
        height: 630,
        alt: 'XIVIZLEY — Görsel Self-Host & Docker Mimari Tasarımı',
      },
      {
        url: 'https://xivizley.com.tr/og.png',
        width: 1200,
        height: 630,
        alt: 'XIVIZLEY — Görsel Self-Host Mimarı',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'XIVIZLEY — Görsel Self-Host & Docker Mimari Tasarımı',
    description: PLATFORM_STATS.taglineTr,
    creator: '@xivizley',
    images: ['https://xivizley.com.tr/api/og'],
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48', type: 'image/x-icon' },
      { url: '/icon.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [
      { url: '/apple-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};
