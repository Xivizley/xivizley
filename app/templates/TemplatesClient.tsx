'use client';

// ============================================================
// XIVIZLEY — Ready Stacks Hub (/templates)
// Design System: Obsidian Violet (#090514 Void Obsidian / #120A21 Deep Amethyst)
// Specification: DIN 40719 Industrial Hardware Spec Sheet
// Typography: Newsreader (Editorial Serif) + JetBrains Mono (Technical Mono)
// app/templates/TemplatesClient.tsx
// ============================================================

import React, { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  STACK_TEMPLATES,
  TEMPLATE_CATEGORIES,
  type TemplateCategory,
  type StackTemplate,
} from '@/lib/data/templates';
import { useArchitectStore } from '@/store/useArchitectStore';
import { useI18nStore } from '@/lib/i18n/store';
import { useToast } from '@/lib/hooks/useToast';
import { ToastContainer } from '@/components/shared/Toast';
import { getTemplateSponsor } from '@/lib/config/sponsors';
import { cn } from '@/lib/utils';

const CATEGORY_NAMES_EN: Record<TemplateCategory, string> = {
  all: 'All Stacks',
  web: 'Websites & CMS',
  ai: 'AI & LLM',
  ecommerce: 'E-Commerce & SaaS',
  media: '4K Media & Streaming',
  security: 'Network & Security',
  game: 'Game Servers',
  devops: 'DevOps & Monitoring',
  enterprise: 'Enterprise & Office',
};

const STACK_EN_MAP: Record<string, { title: string; desc: string }> = {
  'local-ai-ollama': {
    title: 'Local AI & LLM Studio',
    desc: 'Run AI models like Llama 3, DeepSeek R1 and Mistral on your server. Equipped with ChatGPT-like modern Open-WebUI interface and SSL-protected reverse proxy.',
  },
  'wordpress-ultra': {
    title: 'WordPress Ultra Speed Stack',
    desc: 'Complete WordPress architecture including Redis object cache, Nginx Proxy SSL, and optimized MariaDB for high-traffic blogs and corporate sites.',
  },
  'ghost-pro-publishing': {
    title: 'Ghost Modern Publishing Stack',
    desc: 'Complete Ghost publishing architecture with MySQL and Nginx SSL for newsletters, paid subscriptions, and modern SEO blogs.',
  },
  'strapi-headless-cms': {
    title: 'Strapi Headless CMS & API',
    desc: 'Flexible open-source Headless CMS with PostgreSQL delivering fast REST and GraphQL APIs for mobile apps and Next.js frontends.',
  },
  'ultimate-4k-media-suite': {
    title: 'Ultimate 4K Home Cinema & Media Suite',
    desc: 'Massive media suite with Jellyfin, Radarr, Sonarr, Overseerr, and qBittorrent for fully automated 4K streaming and downloading.',
  },
  'immich-ai-photo-vault': {
    title: 'Immich AI Photo & Backup Vault',
    desc: 'Self-hosted photo server with AI face recognition, map geolocation, and automated 4K backup from all your mobile devices.',
  },
  'audiobookshelf-media': {
    title: 'Audiobookshelf Audio & Podcast Server',
    desc: 'Self-hosted Audible and podcast streaming server with mobile synchronization, position tracking, and offline downloads.',
  },
  'cyber-security-fortress': {
    title: 'Zero-Trust Cybersecurity Fortress',
    desc: 'AdGuard Home DNS filtering, Vaultwarden password vault, WireGuard VPN, and 2FAuth multi-factor authentication.',
  },
  'pihole-privacy-gateway': {
    title: 'Pi-hole & Unbound Privacy Gateway',
    desc: 'Network-wide DNS advertisement and tracking blocker with local recursive DNS resolution protecting all home devices.',
  },
  'minecraft-papermc-ultimate': {
    title: 'Minecraft PaperMC Ultimate Server',
    desc: 'High-performance 20 TPS Minecraft server with ViaVersion cross-version support, AuthMe authentication, and EssentialsX suite.',
  },
  'fivem-sandbox-stack': {
    title: 'GTA V FiveM Sandbox & vMenu Server',
    desc: 'Turnkey vMenu admin server to spawn supercars, tune vehicles without limits, drift, and explore hidden GTA V interiors with friends.',
  },
  'fivem-roleplay-stack': {
    title: 'FiveM GTA 5 Roleplay Server',
    desc: 'Zero-latency GTA V roleplay server with txAdmin web panel, MariaDB database, and automated artifact updates.',
  },
  'palworld-dedicated-stack': {
    title: 'Palworld Dedicated Server',
    desc: 'Dedicated Palworld server on Linux VDS with memory leak protection and automated restart scripts.',
  },
  'cs2-arena-stack': {
    title: 'Counter-Strike 2 Dedicated Server',
    desc: '128-tick match and community server powered by SteamCMD and Metamod:Source plugin support.',
  },
  'romm-retro-arcade-stack': {
    title: 'RomM Retro Arcade Stack',
    desc: 'Browser-playable retro game library hosting ROMs, cover art, and save states for SNES, PS1, N64, and GBA.',
  },
  'n8n-automation-hub': {
    title: 'n8n Workflow Automation Hub',
    desc: 'Open-source visual workflow automation platform connecting APIs, databases, webhooks, and AI assistants.',
  },
  'baserow-nocode-suite': {
    title: 'Baserow No-Code Database Suite',
    desc: 'Self-hosted Airtable alternative with PostgreSQL backend and unlimited rows for teams and developers.',
  },
  'production-observability': {
    title: 'Production Observability & Monitoring',
    desc: 'Real-time infrastructure monitoring with Grafana visual dashboards, Prometheus metrics, and Node Exporter.',
  },
  'tpl-personal-cloud': {
    title: 'Personal Cloud & Secure Storage',
    desc: 'Complete self-hosted cloud architecture for personal files, AI photo organization, and automated encrypted backups.',
  },
  'nextcloud-collabora-office': {
    title: 'Nextcloud & Collabora Cloud Office',
    desc: 'Private cloud storage with online document collaboration, calendar sync, and media backup backed by PostgreSQL and Redis.',
  },
  'casaos-starter-home': {
    title: 'CasaOS Simple Home Cloud',
    desc: 'Beginner-friendly lightweight homelab dashboard to manage Docker containers with zero Linux CLI experience required.',
  },
  'home-assistant-smart-home': {
    title: 'Home Assistant Smart Home Hub',
    desc: 'Centralized local home automation hub integrating Zigbee, Wi-Fi, and Bluetooth devices with zero cloud latency.',
  },
  'paperless-ngx-dms': {
    title: 'Paperless-ngx Document Management',
    desc: 'AI-driven paperless archive indexing invoices and legal documents into a searchable repository with Tesseract OCR.',
  },
  'umami-analytics-suite': {
    title: 'Privacy Web Analytics & Data Hub',
    desc: 'Self-hosted, cookie-free web analytics powered by Umami, PostgreSQL database, and NocoDB smart spreadsheet backend.',
  },
  'kavita-digital-library': {
    title: 'Manga, Book & Podcast Library',
    desc: 'Ultimate digital media library featuring Kavita for manga and comics, Audiobookshelf for audiobooks, and FileBrowser.',
  },
  'changedetection-monitor-stack': {
    title: 'Autonomous Price & System Monitor',
    desc: 'Automated price tracking and change detection station with Changedetection, Uptime Kuma monitoring, and n8n webhook alerts.',
  },
  'penpot-design-studio': {
    title: 'Open Source Design & Prototyping Studio',
    desc: 'Self-hosted Figma alternative for vector UI/UX design and team prototyping backed by PostgreSQL and Redis.',
  },
  'supabase-selfhost': {
    title: 'Supabase Self-Hosted Backend & Studio',
    desc: 'Full-fledged open-source Firebase alternative featuring Supabase Studio, PostgreSQL 15, GoTrue Auth, PostgREST, and Kong API gateway.',
  },
  'rustdesk-remote-desktop': {
    title: 'RustDesk Private Remote Desktop Relay',
    desc: 'Self-hosted end-to-end encrypted remote desktop and file transfer infrastructure replacing TeamViewer and AnyDesk with total privacy.',
  },
  'searxng-privacy-search': {
    title: 'SearXNG Private Metasearch Engine',
    desc: 'Privacy-respecting, zero-tracking metasearch engine aggregating results from 70+ search engines with high-speed Redis caching.',
  },
  'pterodactyl-game-panel': {
    title: 'Pterodactyl Game Management Panel',
    desc: 'Industry standard open-source control panel for hosting and managing Minecraft, CS2, Palworld and Rust servers with isolated Docker nodes.',
  },
};

const TEMPLATES_WITH_SCREENSHOT = new Set([
  'audiobookshelf-media',
  'baserow-nocode-suite',
  'casaos-starter-home',
  'cs2-arena-stack',
  'cyber-security-fortress',
  'fivem-roleplay-stack',
  'ghost-pro-publishing',
  'home-assistant-smart-home',
  'immich-ai-photo-vault',
  'local-ai-ollama',
  'minecraft-papermc-ultimate',
  'n8n-automation-hub',
  'nextcloud-collabora-office',
  'palworld-dedicated-stack',
  'paperless-ngx-dms',
  'pihole-privacy-gateway',
  'production-observability',
  'romm-retro-arcade-stack',
  'strapi-headless-cms',
  'ultimate-4k-media-suite',
  'wordpress-ultra',
]);

function getDifficultyLabel(diff: string, isTr: boolean) {
  if (isTr) return diff;
  if (diff === 'Kolay') return 'Easy';
  if (diff === 'Orta') return 'Medium';
  if (diff.includes('İleri')) return 'Advanced';
  return diff;
}

export function TemplatesClient() {
  const router = useRouter();
  const { lang } = useI18nStore();
  const isTr = lang === 'tr';
  const { toasts, toast, dismiss } = useToast();
  const loadTemplate = useArchitectStore((s) => s.loadTemplate);

  useEffect(() => {
    document.title = isTr
      ? 'Hazır Web & Homelab Şablonları Marketi — XIVIZLEY'
      : 'Ready Web & Homelab Stacks Hub — XIVIZLEY';
  }, [isTr]);

  const [search, setSearch] = useState('');
  const [selectedCat, setSelectedCat] = useState<TemplateCategory>('all');
  const [filterProOnly, setFilterProOnly] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Filter templates
  const filteredTemplates = useMemo(() => {
    return STACK_TEMPLATES.filter((tpl) => {
      const en = STACK_EN_MAP[tpl.id];
      const title = !isTr && en ? en.title : tpl.title;
      const desc = !isTr && en ? en.desc : tpl.description;

      const matchesCat = selectedCat === 'all' || tpl.category === selectedCat;
      const matchesPro = !filterProOnly || tpl.isPro;
      const q = search.toLowerCase().trim();
      const matchesSearch =
        q === '' ||
        title.toLowerCase().includes(q) ||
        tpl.subtitle.toLowerCase().includes(q) ||
        desc.toLowerCase().includes(q) ||
        tpl.tags.some((tag) => tag.toLowerCase().includes(q));

      return matchesCat && matchesPro && matchesSearch;
    });
  }, [selectedCat, filterProOnly, search, isTr]);

  // 1-Click Open in Canvas
  const handleOpenInCanvas = (tpl: StackTemplate) => {
    loadTemplate(tpl.id);
    const en = STACK_EN_MAP[tpl.id];
    const title = !isTr && en ? en.title : tpl.title;
    toast(
      'success',
      isTr ? 'Şablon Yüklendi! 🎨' : 'Template Loaded! 🎨',
      isTr
        ? `"${title}" eksiksiz mimari olarak tuvale aktarıldı...`
        : `"${title}" loaded onto your canvas...`
    );

    setTimeout(() => {
      router.push('/architect');
    }, 500);
  };

  // Copy compose YAML
  const handleCopyCompose = async (tpl: StackTemplate) => {
    await navigator.clipboard.writeText(tpl.composeSnippet);
    setCopiedId(tpl.id);
    const en = STACK_EN_MAP[tpl.id];
    const title = !isTr && en ? en.title : tpl.title;
    toast(
      'success',
      isTr ? 'Kopyalandı! 📋' : 'Copied! 📋',
      isTr
        ? `"${title}" docker-compose.yml panoya kopyalandı.`
        : `"${title}" docker-compose.yml copied to clipboard.`
    );
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="min-h-screen bg-[#090514] text-[#F5F3FF] selection:bg-[#7C3AED] selection:text-white">
      {/* Top Technical Metadata Band */}
      <div className="border-b border-[#2B1A42] bg-[#0D0719] py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between font-mono text-[10px] sm:text-[11px]">
          <div className="flex items-center gap-2 text-[#8B7D9E]">
            <span className="text-[#C084FC] font-semibold">XIVIZLEY</span>
            <span className="text-[#3B255E]">//</span>
            <span>{isTr ? 'HAZIR MİMARİLER' : 'PRE-BUILT ARCHITECTURES'}</span>
          </div>
          <div className="flex items-center gap-3 text-[#8B7D9E]">
            <span className="hidden sm:inline">DIN 40719 SPEC</span>
            <span className="hidden sm:inline text-[#3B255E]">·</span>
            <div className="flex items-center gap-1.5 text-[#10B981]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#10B981]" aria-hidden="true" />
              <span>{isTr ? 'DOĞRULANMIŞ MODÜLLER' : 'VERIFIED STACKS'}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        {/* Spec Header Badge */}
        <div className="flex items-center justify-center gap-3 mb-6 max-w-xl mx-auto">
          <div className="h-px flex-1 bg-[#2B1A42]" aria-hidden="true" />
          <span className="font-mono text-[10px] tracking-[0.2em] uppercase text-[#C084FC]">
            STK-MARKET // REV.2026.10
          </span>
          <div className="h-px flex-1 bg-[#2B1A42]" aria-hidden="true" />
        </div>

        {/* Hero Title & Subtitle */}
        <div className="text-center max-w-3xl mx-auto mb-10">
          <h1
            className="text-[clamp(2.4rem,5.5vw,4.2rem)] leading-[1.05] tracking-tight text-[#F5F3FF] mb-5 font-bold"
            style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
          >
            {isTr ? (
              <>
                1-Tıkla Hazır <span style={{ color: '#C084FC' }}>Web & Homelab</span> Yığınları
              </>
            ) : (
              <>
                1-Click Ready <span style={{ color: '#C084FC' }}>Web & Homelab</span> Stacks
              </>
            )}
          </h1>

          <p className="font-mono text-[13px] sm:text-[14px] text-[#A19BAF] max-w-2xl mx-auto leading-relaxed">
            {isTr
              ? 'Sıfırdan yapılandırmakla vakit kaybetmeyin. Web siteleri, yapay zeka ajanları, 4K medya kütüphaneleri ve kurumsal ofis sistemlerini tek tıkla tuvale aktarın ve VDS sunucunuza kurun.'
              : "Don't waste time configuring from scratch. Import websites, AI agents, 4K media libraries, and enterprise office suites directly onto your canvas and deploy to your server in 1-click."}
          </p>
        </div>

        {/* Search & Filter Bar (DIN Control Deck) */}
        <div className="max-w-3xl mx-auto mb-10">
          <div className="flex flex-col sm:flex-row items-center gap-3">
            <div className="relative flex-1 w-full">
              <svg
                className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[#8B7D9E] pointer-events-none"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
              </svg>
              <input
                id="template-search-input"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                aria-label={isTr ? 'Şablon veya servis ara' : 'Search templates or services'}
                placeholder={
                  isTr
                    ? 'Şablon, teknoloji veya servis ara (örn: WordPress, Nextcloud, Plex, Ollama)...'
                    : 'Search templates, technology or services (e.g. WordPress, Nextcloud, Plex, Ollama)...'
                }
                className="w-full rounded-[2px] border border-[#2B1A42] bg-[#0E0720] pl-10 pr-10 py-3 font-mono text-[12px] sm:text-[13px] text-[#F5F3FF] placeholder-[#5E4E77] focus:outline-none focus:border-[#8B5CF6] transition-colors"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#8B7D9E] hover:text-[#F5F3FF] transition-colors p-1"
                  aria-label={isTr ? 'Aramayı Temizle' : 'Clear search'}
                >
                  <svg className="w-3.5 h-3.5" viewBox="0 0 14 14" fill="none" aria-hidden="true">
                    <path d="M2 2l10 10M12 2L2 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
                  </svg>
                </button>
              )}
            </div>

            <button
              onClick={() => setFilterProOnly(!filterProOnly)}
              aria-pressed={filterProOnly}
              className={cn(
                'flex items-center gap-2 px-5 py-3 rounded-[2px] border font-mono text-[12px] font-semibold tracking-wide transition-colors shrink-0 w-full sm:w-auto justify-center',
                filterProOnly
                  ? 'border-[#8B5CF6] bg-[#7C3AED] text-white'
                  : 'border-[#2B1A42] bg-[#0E0720] text-[#A19BAF] hover:border-[#8B5CF6] hover:text-[#F5F3FF]'
              )}
            >
              <svg
                className={cn('w-3.5 h-3.5', filterProOnly ? 'text-white' : 'text-[#C084FC]')}
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path d="M2 13h12M3 10l2.5-6L8 8l2.5-4L13 10H3z" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" strokeLinejoin="miter" />
              </svg>
              <span>{isTr ? '[ PRO // GELİŞMİŞ ]' : '[ PRO // ADVANCED ]'}</span>
            </button>
          </div>

          {/* Category Tabs (DIN Pafta Sekmeleri) */}
          <div
            className="mt-6 flex items-center justify-start sm:justify-center gap-1.5 overflow-x-auto sm:flex-wrap pb-2 scrollbar-none w-full"
            role="tablist"
            aria-label={isTr ? 'Şablon Kategorileri' : 'Template Categories'}
          >
            {TEMPLATE_CATEGORIES.map((cat) => {
              const isActive = selectedCat === cat.id;
              return (
                <button
                  key={cat.id}
                  role="tab"
                  aria-selected={isActive}
                  onClick={() => setSelectedCat(cat.id)}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-[2px] font-mono text-[11px] uppercase tracking-wider transition-colors border shrink-0',
                    isActive
                      ? 'border-[#8B5CF6] bg-[#7C3AED] text-white font-bold'
                      : 'border-[#2B1A42] bg-[#0D0719] text-[#8B7D9E] hover:border-[#3B255E] hover:text-[#F5F3FF]'
                  )}
                >
                  <span>{isTr ? cat.label : (CATEGORY_NAMES_EN[cat.id] ?? cat.label)}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Status Bar / Counter Band */}
        <div className="mb-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-3 border-b border-[#2B1A42] font-mono text-[11px]">
          <div className="flex items-center gap-2 text-[#A19BAF]">
            <span className="text-[#C084FC] font-semibold">
              [ {filteredTemplates.length} / {STACK_TEMPLATES.length} ]
            </span>
            <span>
              {filteredTemplates.length > 0
                ? (isTr ? 'YIĞIN AKTİF // TÜM MODÜLLER DOĞRULANDI' : 'ACTIVE STACKS // ALL MODULES VALIDATED')
                : (isTr ? 'YIĞIN BULUNDU // EŞLEŞEN YOK' : 'STACKS FOUND // NO MATCH')}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-[#10B981]" aria-hidden="true" />
            <span className="text-[#8B7D9E] tracking-wider uppercase">DIN 40719 INDUSTRIAL SPEC</span>
          </div>
        </div>

        {/* Templates Grid / Empty State */}
        {filteredTemplates.length === 0 ? (
          <div className="text-center py-20 rounded-[2px] border border-[#2B1A42] bg-[#120A21]">
            <svg className="w-12 h-12 text-[#5E4E77] mx-auto mb-4" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <rect x="3" y="3" width="7" height="7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
              <rect x="14" y="3" width="7" height="7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
              <rect x="14" y="14" width="7" height="7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
              <rect x="3" y="14" width="7" height="7" stroke="currentColor" strokeWidth="1.4" strokeLinecap="square" />
            </svg>
            <h3
              className="text-base font-semibold text-[#F5F3FF]"
              style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
            >
              {isTr ? 'Aradığınız kriterde şablon bulunamadı' : 'No templates found matching your criteria'}
            </h3>
            <p className="font-mono text-xs text-[#8B7D9E] mt-2 max-w-sm mx-auto">
              {isTr
                ? 'Lütfen farklı anahtar kelimeler deneyin veya filtreleri sıfırlayın.'
                : 'Please try different keywords or reset filters.'}
            </p>
            <button
              onClick={() => {
                setSearch('');
                setSelectedCat('all');
                setFilterProOnly(false);
              }}
              className="mt-5 px-5 py-2 rounded-[2px] bg-[#8B5CF6] hover:bg-[#7C3AED] text-white font-mono text-xs font-semibold tracking-wider uppercase transition-colors"
            >
              {isTr ? 'Filtreleri Sıfırla' : 'Reset Filters'}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredTemplates.map((tpl) => {
              const en = STACK_EN_MAP[tpl.id];
              const title = !isTr && en ? en.title : tpl.title;
              const description = !isTr && en ? en.desc : tpl.description;
              const sponsor = getTemplateSponsor(tpl.id);
              const tplIndex = STACK_TEMPLATES.findIndex((t) => t.id === tpl.id) + 1;
              const tplCode = `STK-${String(tplIndex).padStart(3, '0')}`;

              return (
                <div
                  key={tpl.id}
                  className={cn(
                    'group relative flex flex-col justify-between rounded-[2px] border bg-[#120A21] p-5 sm:p-6 transition-all duration-200',
                    sponsor
                      ? 'border-[#7C3AED]/70 hover:border-[#8B5CF6] hover:bg-[#150C28]'
                      : 'border-[#2B1A42] hover:border-[#8B5CF6] hover:bg-[#150C28]'
                  )}
                >
                  {/* Top 2px accent rule */}
                  <div
                    className="absolute inset-x-0 top-0 h-[2px]"
                    style={{ background: sponsor ? '#8B5CF6' : (tpl.color || '#7C3AED') }}
                  />

                  <div>
                    {/* Spec Strip: STK-001 // CATEGORY and Status badge */}
                    <div className="flex items-center justify-between gap-2 mb-3 pb-2.5 border-b border-[#2B1A42] font-mono text-[10px]">
                      <div className="flex items-center gap-1.5 text-[#C084FC] tracking-widest uppercase">
                        <span className="font-semibold">{tplCode}</span>
                        <span className="text-[#3B255E]">//</span>
                        <span className="text-[#8B7D9E]">{tpl.category.toUpperCase()}</span>
                      </div>
                      <div>
                        {sponsor ? (
                          <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-[2px] bg-[#7C3AED]/20 border border-[#8B5CF6]/60 text-[#C084FC] font-semibold">
                            ⚡ {isTr ? sponsor.badgeLabelTr : sponsor.badgeLabelEn}
                          </span>
                        ) : tpl.isPro ? (
                          <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-[2px] bg-[#7C3AED]/20 border border-[#8B5CF6]/40 text-[#C084FC] font-semibold">
                            {isTr ? 'PRO // GELİŞMİŞ' : 'PRO // ADVANCED'}
                          </span>
                        ) : (
                          <span className="font-mono text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-[2px] bg-[#0E0720] border border-[#2B1A42] text-[#8B7D9E]">
                            {isTr ? 'STD // STANDART' : 'STD // STANDARD'}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Screenshot or DIN Schematic Blueprint */}
                    {TEMPLATES_WITH_SCREENSHOT.has(tpl.id) ? (
                      <img
                        src={`/templates/screenshots/template-${tpl.id}.png`}
                        alt={title}
                        loading="lazy"
                        className="w-full h-40 object-cover rounded-[2px] border border-[#2B1A42] mb-4 bg-[#0D0719]"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-full h-40 rounded-[2px] border border-[#2B1A42] mb-4 bg-[#0D0719] p-3 flex flex-col justify-between relative overflow-hidden select-none">
                        {/* DIN Grid Pattern */}
                        <div
                          className="absolute inset-0 opacity-20 pointer-events-none"
                          style={{
                            backgroundImage:
                              'linear-gradient(to right, #2B1A42 1px, transparent 1px), linear-gradient(to bottom, #2B1A42 1px, transparent 1px)',
                            backgroundSize: '16px 16px',
                          }}
                          aria-hidden="true"
                        />
                        <div className="relative z-10 flex items-center justify-between font-mono text-[9px] text-[#8B7D9E]">
                          <span className="text-[#C084FC] font-semibold">{`// SCHEMATIC : ${tplCode}`}</span>
                          <span className="text-[#5E4E77]">+ DIN 40719 +</span>
                        </div>
                        <div className="relative z-10 flex flex-wrap items-center justify-center gap-1.5 py-1">
                          {tpl.moduleIds.slice(0, 3).map((mId) => (
                            <span
                              key={mId}
                              className="font-mono text-[9px] text-[#F5F3FF] bg-[#120A21] border border-[#2B1A42] px-2 py-1 rounded-[2px]"
                            >
                              {mId}
                            </span>
                          ))}
                        </div>
                        <div className="relative z-10 flex items-center justify-between font-mono text-[9px] text-[#5E4E77]">
                          <span>SYS.STATUS: VERIFIED</span>
                          <span className="text-[#10B981]">● READY</span>
                        </div>
                      </div>
                    )}

                    {/* Title & Icon */}
                    <div className="flex items-start gap-3 mb-3">
                      <div
                        className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[2px] border text-xl bg-[#0E0720]"
                        style={{
                          borderColor: tpl.color ? `${tpl.color}55` : '#2B1A42',
                        }}
                        aria-hidden="true"
                      >
                        {tpl.icon}
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3
                          className="text-[17px] font-semibold text-[#F5F3FF] group-hover:text-[#C084FC] transition-colors leading-snug line-clamp-1"
                          style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
                          title={title}
                        >
                          {title}
                        </h3>
                        <p className="font-mono text-[11px] text-[#8B7D9E] truncate mt-0.5" title={tpl.subtitle}>
                          {tpl.subtitle}
                        </p>
                      </div>
                    </div>

                    {/* Sponsor Note */}
                    {sponsor && (
                      <div className="mb-3 flex items-center justify-between rounded-[2px] bg-[#0E0720] border border-[#7C3AED]/40 px-2.5 py-1.5 font-mono text-[10px]">
                        <span className="text-[#C084FC] font-semibold truncate mr-2">
                          🤝 {isTr ? sponsor.noteTr : sponsor.noteEn}
                        </span>
                        <span className="text-[#8B7D9E] shrink-0">{sponsor.sponsorName}</span>
                      </div>
                    )}

                    {/* Description */}
                    <p className="font-mono text-[12px] text-[#A19BAF] leading-relaxed mb-4 line-clamp-3">
                      {description}
                    </p>

                    {/* Hardware Specs: RAM & Level */}
                    <div className="grid grid-cols-2 gap-2 mb-4 font-mono text-[10px]">
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-[2px] bg-[#0D0719] border border-[#2B1A42] text-[#A19BAF]">
                        <svg className="w-3.5 h-3.5 text-[#C084FC] shrink-0" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                          <rect x="4" y="4" width="8" height="8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
                          <path d="M2 6h2M2 10h2M12 6h2M12 10h2M6 2v2M10 2v2M6 12v2M10 12v2" stroke="currentColor" strokeWidth="1.2" />
                        </svg>
                        <span className="truncate font-medium">MIN {tpl.minRamGB} GB RAM</span>
                      </div>
                      <div className="flex items-center justify-between px-2.5 py-1.5 rounded-[2px] bg-[#0D0719] border border-[#2B1A42] text-[#8B7D9E]">
                        <span className="text-[#5E4E77]">{isTr ? 'SEVİYE:' : 'LEVEL:'}</span>
                        <span className="text-[#F5F3FF] font-medium truncate">{getDifficultyLabel(tpl.difficulty, isTr)}</span>
                      </div>
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-1 mb-5">
                      {tpl.tags.map((tag) => (
                        <span
                          key={tag}
                          className="rounded-[2px] bg-[#0E0720] border border-[#2B1A42] px-2 py-0.5 font-mono text-[10px] text-[#8B7D9E]"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Footer Actions */}
                  <div className="flex flex-col gap-2 pt-4 border-t border-[#2B1A42]">
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenInCanvas(tpl)}
                        className="flex-1 flex items-center justify-center gap-2 rounded-[2px] bg-[#8B5CF6] hover:bg-[#7C3AED] px-4 py-2.5 font-mono text-[12px] font-semibold text-white transition-colors"
                      >
                        <span>{isTr ? 'Tuvalde Aç' : 'Open in Canvas'}</span>
                        <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                          <path d="M1 6h10M7 2l4 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
                        </svg>
                      </button>

                      <button
                        onClick={() => handleCopyCompose(tpl)}
                        title={isTr ? 'Docker Compose YAML Kopyala' : 'Copy Docker Compose YAML'}
                        aria-label={isTr ? `${title} Docker Compose YAML Kopyala` : `Copy ${title} Docker Compose YAML`}
                        className="flex items-center gap-1.5 px-3 py-2.5 rounded-[2px] border border-[#2B1A42] bg-[#0E0720] hover:border-[#8B5CF6] hover:text-[#C084FC] text-[#A19BAF] font-mono text-[11px] transition-colors shrink-0"
                      >
                        {copiedId === tpl.id ? (
                          <>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" className="text-[#10B981]" aria-hidden="true">
                              <path d="M2 6l3 3 5-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="square" />
                            </svg>
                            <span className="text-[#10B981] font-semibold">OK</span>
                          </>
                        ) : (
                          <>
                            <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true">
                              <rect x="4" y="2" width="6" height="7" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
                              <path d="M2 5v5h6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
                            </svg>
                            <span>YAML</span>
                          </>
                        )}
                      </button>
                    </div>

                    {/* Sponsor Affiliate CTA */}
                    {sponsor && (
                      <a
                        href={sponsor.affiliateUrl}
                        target="_blank"
                        rel="sponsored noopener noreferrer"
                        className="flex items-center justify-center gap-1.5 rounded-[2px] border border-[#7C3AED]/50 bg-[#7C3AED]/15 hover:bg-[#7C3AED]/25 py-2 px-3 font-mono text-[11px] font-semibold text-[#C084FC] hover:text-[#E9D5FF] transition-colors"
                      >
                        <span>⚡ {isTr ? `${sponsor.sponsorName}: ${sponsor.ctaTextTr}` : `${sponsor.sponsorName}: ${sponsor.ctaTextEn}`}</span>
                        <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                          <path d="M2 8l6-6M4 2h4v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
                        </svg>
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Affiliate & Sponsorship Disclosure Panel */}
        <div className="mt-14 rounded-[2px] border border-[#2B1A42] bg-[#0E0720] p-5 font-mono text-[12px] text-[#A19BAF] leading-relaxed">
          <div className="flex items-start gap-3">
            <span className="font-mono text-[#C084FC] font-bold text-sm shrink-0">[ i ]</span>
            <div>
              <p className="font-semibold text-[#F5F3FF] tracking-wide uppercase text-[11px] mb-1">
                {isTr ? 'Affiliate & Sponsorluk Bildirimi' : 'Affiliate & Sponsorship Disclosure'}
              </p>
              <p className="text-[11px] text-[#8B7D9E] leading-relaxed">
                {isTr
                  ? 'Bu sitedeki ve şablon kartlarındaki bazı bağlantılar iş ortaklarımıza (OWEB, Hosting.com.tr) aittir. Bu bağlantılar üzerinden bir sunucu/VDS satın alırsanız XIVIZLEY komisyon kazanabilir. Bu durum sizin için ödeyeceğiniz fiyatı değiştirmez veya artırmaz. Tüm şablonlar, araçlar ve tuval %100 ücretsizdir; herhangi bir ödeme duvarı (paywall) bulunmaz.'
                  : 'Some links on this site and within template cards belong to our affiliate partners (OWEB, Hosting.com.tr). If you purchase a server or VDS through these links, XIVIZLEY may earn a small commission at no additional cost to you. All architecture templates and canvas tools remain 100% free and open for everyone with zero paywalls.'}
              </p>
            </div>
          </div>
        </div>

        {/* Sponsor & Infrastructure Cadre */}
        <div className="mt-12 rounded-[2px] border border-[#2B1A42] bg-[#120A21] p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="max-w-2xl">
              <div className="flex items-center gap-2 mb-2 font-mono text-[10px] tracking-[0.18em] text-[#C084FC] uppercase font-bold">
                <span>⚡ {isTr ? 'RESMİ ALTYAPI SPONSORLARIMIZ' : 'OFFICIAL INFRASTRUCTURE SPONSORS'}</span>
                <span className="text-[#3B255E]">//</span>
                <span className="text-[#8B7D9E]">DIN 40719 SPEC</span>
              </div>
              <h3
                className="text-2xl sm:text-3xl font-bold text-[#F5F3FF] tracking-tight"
                style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
              >
                {isTr
                  ? 'Şablonlarınızı 10 Gbit/s NVMe VDS Altyapısında Çalıştırın'
                  : 'Run Your Stacks on 10 Gbps NVMe VDS Infrastructure'}
              </h3>
              <p className="mt-2 font-mono text-[12px] sm:text-[13px] text-[#A19BAF] leading-relaxed">
                {isTr
                  ? 'OWEB TR Cloud 10 Gbps Datacenter NVMe ve Hosting.com.tr %50 indirimli VDS Ultra paketleriyle tüm Docker yığınlarınızı sıfır gecikmeyle barındırın.'
                  : 'Host all your Docker stacks with zero latency using OWEB TR Cloud 10 Gbps Datacenter NVMe and Hosting.com.tr 50% discount VDS Ultra plans.'}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3 shrink-0 w-full sm:w-auto">
              <a
                href="https://www.oweb.net.tr/aff.php?aff=975"
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-[2px] border border-[#2B1A42] bg-[#0E0720] hover:border-[#8B5CF6] hover:text-[#C084FC] px-5 py-3 font-mono text-[12px] font-semibold text-[#F5F3FF] transition-colors"
              >
                <span>{isTr ? '⚡ OWEB TR Cloud (10 Gbps VDS)' : '⚡ OWEB TR Cloud (10 Gbps)'}</span>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <path d="M2 8l6-6M4 2h4v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
                </svg>
              </a>
              <a
                href="https://www.hosting.com.tr/aff.php?aff=1702"
                target="_blank"
                rel="noopener noreferrer sponsored"
                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 rounded-[2px] bg-[#8B5CF6] hover:bg-[#7C3AED] px-5 py-3 font-mono text-[12px] font-semibold text-white transition-colors"
              >
                <span>{isTr ? '%50 İndirimli VDS Kirala' : 'Rent VDS with 50% Off'}</span>
                <svg width="10" height="10" viewBox="0 0 10 10" fill="none" aria-hidden="true">
                  <path d="M2 8l6-6M4 2h4v4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="square" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>

      <ToastContainer toasts={toasts} onDismiss={dismiss} />
    </div>
  );
}
