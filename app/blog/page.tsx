// ============================================================
// XIVIZLEY — Homelab & Docker SEO Blog Engine (/blog)
// app/blog/page.tsx
// ============================================================

'use client';

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/shared/Navbar';
import { BLOG_POSTS } from '@/lib/data/blog';
import {
  BookOpen,
  Search,
  Sparkles,
  ArrowRight,
  Clock,
  Tag,
  Boxes,
  ShieldCheck,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useI18nStore } from '@/lib/i18n/store';

const BLOG_EN_MAP: Record<string, { title: string; desc: string; categoryLabel: string }> = {
  'minecraft-papermc-docker-kurulumu': {
    title: '1-Click Minecraft PaperMC 1.21.4 Server with Docker',
    desc: 'Complete guide to setting up a high-performance, plugin-ready Minecraft 1.21.4 server on Linux VDS using Docker and PaperMC.',
    categoryLabel: 'Game Servers',
  },
  'nextcloud-homelab-rehberi': {
    title: 'Deploy Your Private Cloud Storage: Nextcloud 28 + PostgreSQL',
    desc: 'Keep your data under your control. Deploy Nextcloud 28, PostgreSQL, and Redis caching with Docker Compose in 5 minutes.',
    categoryLabel: 'Cloud Storage',
  },
  'jellyfin-4k-ev-sinemasi': {
    title: 'Automated 4K Media Server with Jellyfin + Radarr + Sonarr',
    desc: 'Build your private ad-free Netflix and Spotify home streaming server with automated media downloaders.',
    categoryLabel: 'Media & Streaming',
  },
  'vaultwarden-sifre-kasasi-kurulumu': {
    title: 'Unlimited & Encrypted Password Vault with Vaultwarden',
    desc: 'Escape subscription fee hikes. Set up the lightweight C++ Bitwarden backend syncing across all your devices.',
    categoryLabel: 'Network & Security',
  },
  'immich-google-fotograflar-alternatifi': {
    title: 'AI-Powered Google Photos Alternative: Immich Setup',
    desc: 'Overcome Google Photos storage limits. Deploy Immich with AI facial recognition, object detection, and mobile backup.',
    categoryLabel: 'Media & Storage',
  },
  'home-assistant-docker-compose': {
    title: 'Smart Home Automation with Home Assistant & Docker Compose',
    desc: 'Connect Zigbee, Wi-Fi, and Bluetooth sensors into a single secure local dashboard with zero latency.',
    categoryLabel: 'Automation & DevOps',
  },
  'paperless-ngx-dokuman-yonetimi': {
    title: 'Paperless Office: Digitize & Index Documents with Paperless-ngx',
    desc: 'Turn all your paper invoices and contracts into an AI-indexed, searchable digital archive with Tesseract OCR.',
    categoryLabel: 'Enterprise & Cloud',
  },
  'wordpress-ultra-hiz-yigini': {
    title: 'WordPress Ultra Speed Stack: Redis + Nginx Proxy SSL',
    desc: 'Cut WordPress page load times to milliseconds. Docker Compose guide with Redis object cache and MariaDB optimization.',
    categoryLabel: 'Web & CMS',
  },
  'ghost-cms-yayincilik-yigini': {
    title: 'Modern Publishing and Newsletter Platform with Ghost CMS',
    desc: 'Launch your subscription-based, super-fast, SEO-optimized publishing platform with Ghost CMS and MySQL 8.',
    categoryLabel: 'Web & CMS',
  },
  'strapi-headless-cms-rehberi': {
    title: 'Flexible API Server with Strapi Headless CMS + PostgreSQL',
    desc: 'Deploy a customizable REST and GraphQL API server for mobile apps and Next.js frontends on Docker.',
    categoryLabel: 'Developer & DevOps',
  },
  'audiobookshelf-sesli-kitap-sunucusu': {
    title: 'Self-Hosted Audible & Podcast Server with Audiobookshelf',
    desc: 'Stream your audiobooks and podcasts to mobile devices with position sync and offline download support.',
    categoryLabel: 'Media & Streaming',
  },
  'pihole-dns-reklam-engelleme': {
    title: 'Network-Wide Ad & Tracker Blocking with Pi-hole and Unbound',
    desc: 'Protect all devices on your network from ads and phishing at the DNS level with recursive Unbound DNS.',
    categoryLabel: 'Network & Security',
  },
  'fivem-gta5-sunucu-kurulumu': {
    title: 'FiveM GTA 5 Roleplay Server on Linux VDS with Docker',
    desc: 'Launch a zero-latency GTA V roleplay server with txAdmin, MariaDB, and automated artifact updates.',
    categoryLabel: 'Game Servers',
  },
  'palworld-sunucu-kurulumu-docker': {
    title: 'Palworld Dedicated Server Setup & RAM Optimization',
    desc: 'Run a dedicated Palworld server on Linux VDS and prevent memory leaks with automated restarts.',
    categoryLabel: 'Game Servers',
  },
  'cs2-counter-strike-2-sunucusu': {
    title: 'Counter-Strike 2 (CS2) Linux Dedicated Server Setup',
    desc: '128-tick performance match and community server powered by SteamCMD and Metamod:Source.',
    categoryLabel: 'Game Servers',
  },
  'romm-retro-oyun-kutuphanesi': {
    title: 'Retro Game Library and EmuDeck Server with RomM',
    desc: 'Host your retro game collection with artwork, covers, and save files, playable directly in any browser.',
    categoryLabel: 'Gaming & Emulation',
  },
  'baserow-nocode-veritabani': {
    title: 'No-Code Database Platform: Baserow as Airtable Alternative',
    desc: 'Create custom databases and automated workflows without Airtable limits using self-hosted PostgreSQL.',
    categoryLabel: 'Productivity & DevOps',
  },
  'grafana-prometheus-izleme-yigini': {
    title: 'Server Monitoring Stack with Grafana + Prometheus + Node Exporter',
    desc: 'Track CPU, RAM, Disk I/O, and network traffic in real time with Prometheus metrics and Grafana dashboards.',
    categoryLabel: 'Monitoring & DevOps',
  },
};

export default function BlogIndexPage() {
  const { lang } = useI18nStore();
  const isTr = lang === 'tr';

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<string>('all');

  const categories = [
    { id: 'all', label: isTr ? 'Tüm Rehberler' : 'All Guides', icon: '✨' },
    { id: 'game', label: isTr ? 'Oyun Sunucuları' : 'Game Servers', icon: '🎮' },
    { id: 'cloud', label: isTr ? 'Bulut Depolama' : 'Cloud Storage', icon: '☁️' },
    { id: 'media', label: isTr ? 'Medya & Akış' : 'Media & Streaming', icon: '🎬' },
    { id: 'security', label: isTr ? 'Ağ & Güvenlik' : 'Network & Security', icon: '🛡️' },
  ];

  const filteredPosts = useMemo(() => {
    const q = search.toLowerCase().trim();
    return BLOG_POSTS.filter((post) => {
      const en = BLOG_EN_MAP[post.slug];
      const title = !isTr && en ? en.title : post.title;
      const desc = !isTr && en ? en.desc : post.description;

      const matchesCat = selectedCat === 'all' || post.category === selectedCat;
      const matchesSearch =
        q === '' ||
        title.toLowerCase().includes(q) ||
        desc.toLowerCase().includes(q) ||
        post.tags.some((t) => t.toLowerCase().includes(q));
      return matchesCat && matchesSearch;
    });
  }, [search, selectedCat, isTr]);

  return (
    <div className="flex min-h-screen flex-col bg-[#08090e] text-slate-100 selection:bg-indigo-500/30 selection:text-indigo-200">
      <Navbar />

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-12">
        {/* Header Hero */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-semibold text-indigo-300 mb-4 shadow-inner">
            <BookOpen className="h-3.5 w-3.5 text-indigo-400" />
            <span>{isTr ? 'XIVIZLEY Homelab & Sunucu Rehberi' : 'XIVIZLEY Homelab & Server Guides'}</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            {isTr ? 'Homelab & Docker Kütüphanesi' : 'Homelab & Docker Library'}
          </h1>
          <p className="mt-3 text-sm sm:text-base text-slate-400 leading-relaxed">
            {isTr
              ? 'Adım adım Docker kurulum kılavuzları, port çakışma çözümleri ve tek tıkla canlıya alma mimarileri.'
              : 'Step-by-step Docker deployment guides, port conflict solutions, and 1-click production architectures.'}
          </p>

          {/* Search Bar */}
          <div className="mt-8 relative max-w-xl mx-auto">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-500 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder={
                isTr
                  ? 'Rehber, sunucu tipi veya teknoloji ara (örn: Minecraft, Nextcloud, Jellyfin)...'
                  : 'Search guides, server types or technologies (e.g. Minecraft, Nextcloud, Jellyfin)...'
              }
              className="w-full rounded-2xl border border-slate-800 bg-[#0e111a] pl-11 pr-4 py-3.5 text-xs sm:text-sm text-slate-200 placeholder-slate-500 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 shadow-xl transition-all"
            />
          </div>

          {/* Category Chips */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={cn(
                  'flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all border',
                  selectedCat === cat.id
                    ? 'border-indigo-500/50 bg-indigo-500/20 text-indigo-300 shadow-lg shadow-indigo-500/10'
                    : 'border-slate-800 bg-[#0e111a]/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                )}
              >
                <span>{cat.icon}</span>
                <span>{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Blog Post Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPosts.map((post) => {
            const en = BLOG_EN_MAP[post.slug];
            const title = !isTr && en ? en.title : post.title;
            const description = !isTr && en ? en.desc : post.description;
            const categoryLabel = !isTr && en ? en.categoryLabel : post.categoryLabel;
            const readTime = isTr ? post.readTime : post.readTime.replace('dk okuma', 'min read');
            const authorRole = isTr ? post.author.role : 'XIVIZLEY Founder & System Architect';

            return (
              <article
                key={post.id}
                className="group relative flex flex-col justify-between rounded-3xl border border-slate-800/80 bg-[#0e111a] p-6 backdrop-blur-xl shadow-xl transition-all duration-300 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 hover:-translate-y-1"
              >
                <div>
                  {/* Meta Header */}
                  <div className="flex items-center justify-between gap-2 mb-3 text-xs">
                    <span className="rounded-full bg-indigo-500/15 border border-indigo-500/30 px-3 py-0.5 font-bold text-indigo-300 flex items-center gap-1">
                      <span>{post.icon}</span>
                      <span>{categoryLabel}</span>
                    </span>
                    <span className="flex items-center gap-1 text-slate-500 text-[11px]">
                      <Clock className="h-3 w-3" />
                      <span>{readTime}</span>
                    </span>
                  </div>

                  {/* Title & Description */}
                  <Link href={`/blog/${post.slug}`} className="block group-hover:text-indigo-300 transition-colors">
                    <h2 className="text-lg font-bold text-white tracking-tight leading-snug mb-2">
                      {title}
                    </h2>
                    <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-4">
                      {description}
                    </p>
                  </Link>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {post.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-[#131724] px-2 py-0.5 text-[10px] font-mono text-slate-400 border border-slate-800"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Action Footer */}
                <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="h-6 w-6 rounded-full bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-xs">
                      {post.author.avatar}
                    </div>
                    <div>
                      <span className="text-[11px] font-medium text-slate-300 block leading-tight">{post.author.name}</span>
                      <span className="text-[9px] text-slate-500 block">{authorRole}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    {post.templateId && (
                      <Link
                        href={`/architect?template=${post.templateId}`}
                        className="rounded-xl border border-indigo-500/40 bg-indigo-950/30 hover:bg-indigo-900/40 px-3 py-1.5 text-[11px] font-bold text-indigo-300 transition-all flex items-center gap-1"
                      >
                        <Boxes className="h-3 w-3 text-indigo-400" />
                        <span>{isTr ? 'Mimarda Aç' : 'Open in Canvas'}</span>
                      </Link>
                    )}
                    <Link
                      href={`/blog/${post.slug}`}
                      className="rounded-xl bg-slate-800 hover:bg-slate-700 px-3.5 py-1.5 text-[11px] font-semibold text-slate-200 hover:text-white transition-all flex items-center gap-1"
                    >
                      <span>{isTr ? 'Oku' : 'Read'}</span>
                      <ChevronRight className="h-3 w-3" />
                    </Link>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-[#08090e] py-6 text-center text-xs text-slate-500">
        <p>
          {isTr
            ? `© ${new Date().getFullYear()} XIVIZLEY — Açık Kaynak Görsel Homelab & Sunucu Mimarı`
            : `© ${new Date().getFullYear()} XIVIZLEY — Open Source Visual Homelab & Server Architect`}
        </p>
      </footer>
    </div>
  );
}
