'use client';

// ============================================================
// XIVIZLEY — Community Feed & Templates Hub
// app/(community)/feed/FeedClient.tsx
// ============================================================

import React, { useState, useMemo } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import {
  Heart, MessageCircle, Eye, Cpu,
  Tv, Home, ShieldCheck, Gamepad2,
  Terminal, Cloud, LayoutDashboard,
  Lock, Gamepad, BookOpen, Film,
  Workflow, Car, HardDrive, Globe,
  ArrowRight, Sparkles, Users, Search, X,
  Layers, Zap, ExternalLink,
} from 'lucide-react';
import type { ArchitectureDTO } from '@/lib/types';
import { PREDEFINED_TEMPLATES, TEMPLATE_CATEGORIES, ArchitectureTemplate } from '@/lib/data/templates';
import { FEATURED_COMMUNITY_STACKS, FeaturedCommunityStack } from '@/lib/data/communityFeatured';
import { getTemplateSponsor } from '@/lib/config/sponsors';
import { cn } from '@/lib/utils';
import { useI18nStore, useTranslation } from '@/lib/i18n/store';

const ICON_MAP: Record<string, React.ComponentType<{ className?: string; style?: React.CSSProperties }>> = {
  Tv, Home, ShieldCheck, Gamepad2, Terminal, Cloud,
  LayoutDashboard, Lock, Gamepad, BookOpen, Film,
  Workflow, Car, HardDrive, Globe, Sparkles,
};

const DIFFICULTY_COLOR: Record<string, string> = {
  'Kolay': 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30',
  'Orta':  'text-amber-400 bg-amber-500/10 border-amber-500/30',
  'İleri': 'text-red-400 bg-red-500/10 border-red-500/30',
};

const CATEGORY_LABELS_EN: Record<string, string> = {
  all: 'All Templates',
  game: '🎮 Game Servers',
  media: '🎬 Media & Entertainment',
  network: '🛡️ Privacy & Network',
  cloud: '☁️ Cloud & Web',
  dev: '💻 Developer & DevOps',
  home: '🏠 Smart Home & Family',
};

const TEMPLATE_EN_MAP: Record<string, { name: string; desc: string; badge?: string }> = {
  'local-ai-ollama': {
    name: 'Local AI & LLM Studio (Ollama + Open-WebUI)',
    desc: 'Run AI models like Llama 3, DeepSeek R1 and Mistral with GPU acceleration and a ChatGPT-like web UI.',
    badge: 'Popular Stack',
  },
  'wordpress-ultra': {
    name: 'WordPress Ultra Speed Stack',
    desc: 'Full WordPress stack featuring Redis object cache, Nginx Proxy SSL, and MariaDB for maximum performance.',
    badge: 'High Performance',
  },
  'cyber-security-fortress': {
    name: 'Zero-Trust Cybersecurity Fortress',
    desc: 'AdGuard Home DNS filtering, Vaultwarden password vault, WireGuard VPN, and 2FAuth multi-factor authentication.',
    badge: 'Security Stack',
  },
  'ultimate-4k-media-suite': {
    name: 'Ultimate 4K Media Suite',
    desc: 'Jellyfin, Radarr, Sonarr, Overseerr, and qBittorrent for fully automated media downloading and 4K streaming.',
    badge: 'Media Center',
  },
  'nextcloud-collabora-office': {
    name: 'Nextcloud & Collabora Cloud Office',
    desc: 'Self-hosted private cloud storage and online document editing suite with PostgreSQL and Redis.',
    badge: 'Cloud Storage',
  },
  'minecraft-papermc-ultimate': {
    name: 'Minecraft PaperMC Ultimate Server',
    desc: 'High-performance 20 TPS Minecraft server with ViaVersion cross-version support, AuthMe, and EssentialsX.',
    badge: 'Gaming Server',
  },
  'immich-ai-photo-vault': {
    name: 'Immich AI Photo Vault',
    desc: 'Self-hosted Google Photos alternative with AI facial recognition, object detection, and automated mobile backup.',
    badge: 'AI Photo Vault',
  },
  'home-assistant-smart-home': {
    name: 'Home Assistant Smart Home Hub',
    desc: 'Centralized open-source local home automation hub integrating Zigbee, Wi-Fi, and Bluetooth devices.',
    badge: 'Smart Home',
  },
  'paperless-ngx-dms': {
    name: 'Paperless-ngx Document Management',
    desc: 'AI-driven paperless archive indexing invoices and legal documents with Tesseract OCR.',
    badge: 'Document Archive',
  },
  'ghost-pro-publishing': {
    name: 'Ghost CMS Pro Publishing Stack',
    desc: 'High-speed, SEO-optimized newsletter and paid subscription publishing platform.',
    badge: 'Publishing & CMS',
  },
  'strapi-headless-cms': {
    name: 'Strapi Headless CMS + PostgreSQL',
    desc: 'Flexible open-source Headless CMS delivering fast REST and GraphQL APIs for mobile and web.',
    badge: 'Headless CMS',
  },
  'audiobookshelf-media': {
    name: 'Audiobookshelf Audio & Podcast Server',
    desc: 'Self-hosted Audible and podcast streaming server with mobile synchronization and offline downloads.',
    badge: 'Audiobook Suite',
  },
  'pihole-privacy-gateway': {
    name: 'Pi-hole & Unbound Privacy Gateway',
    desc: 'Network-wide DNS advertisement and tracking blocker with local recursive DNS resolution.',
    badge: 'DNS Privacy',
  },
  'fivem-roleplay-stack': {
    name: 'FiveM GTA 5 Roleplay Server',
    desc: 'Zero-latency GTA V roleplay server with txAdmin web panel and MariaDB database.',
    badge: 'Game Server',
  },
  'palworld-dedicated-stack': {
    name: 'Palworld Dedicated Server',
    desc: 'High-performance dedicated Palworld server with memory leak prevention and auto-backup.',
    badge: 'Game Server',
  },
  'cs2-arena-stack': {
    name: 'Counter-Strike 2 Dedicated Server',
    desc: '128-tick tournament and community server powered by SteamCMD and Metamod.',
    badge: 'Game Server',
  },
  'romm-retro-arcade-stack': {
    name: 'RomM Retro Arcade Stack',
    desc: 'Browser-playable retro game library hosting ROMs, cover art, and save states.',
    badge: 'Retro Gaming',
  },
  'baserow-nocode-suite': {
    name: 'Baserow No-Code Database Suite',
    desc: 'Self-hosted Airtable alternative with PostgreSQL backend and unlimited rows.',
    badge: 'No-Code DB',
  },
  'production-observability': {
    name: 'Production Observability & Monitoring',
    desc: 'Real-time infrastructure monitoring with Grafana dashboards, Prometheus, and Node Exporter.',
    badge: 'DevOps Stack',
  },
};

const FEATURED_EN_MAP: Record<string, { title: string; desc: string; badge: string; createdAt: string }> = {
  'official-local-ai-studio': {
    title: 'Local AI & LLM Studio (Ollama + Open-WebUI)',
    desc: 'Run AI models like Llama 3, DeepSeek R1 and Mistral on your server with GPU acceleration and a ChatGPT-style interface.',
    badge: 'Founder Architect',
    createdAt: 'Today',
  },
  'media-cinema-beast': {
    title: '4K HDR Ultimate Media & Streaming Server',
    desc: 'Jellyfin, Radarr, Sonarr, Overseerr, and qBittorrent for fully automated 4K streaming and downloading.',
    badge: 'Top Architect',
    createdAt: '2 days ago',
  },
  'privacy-zero-trust': {
    title: 'Zero-Trust Privacy & Ad-Blocking Fortress',
    desc: 'AdGuard Home DNS filter, Vaultwarden password vault, WireGuard VPN, and 2FAuth authentication station.',
    badge: 'Security Specialist',
    createdAt: '4 days ago',
  },
  'gaming-party-hub': {
    title: 'Multi-Game Dedicated Server & Remote Desktop',
    desc: 'PaperMC Minecraft plugin bundle, Palworld server, RustDesk encrypted remote desktop, and Portainer.',
    badge: 'Game Architect',
    createdAt: '1 week ago',
  },
  'ai-automation-dev': {
    title: 'Local AI & Workflow Automation',
    desc: 'N8N visual API automation, Nextcloud private cloud storage, Glances system monitoring, and Watchtower.',
    badge: 'AI Lab',
    createdAt: '3 days ago',
  },
  'smart-family-cloud': {
    title: 'Smart Home, Family Photo Archive & Audiobooks',
    desc: 'Immich AI-powered family album, Mealie recipe manager, Audiobookshelf, and Uptime Kuma monitoring.',
    badge: 'Family Cloud',
    createdAt: '5 days ago',
  },
  'microservices-prod': {
    title: 'Production Web & Microservices Infrastructure',
    desc: 'Nginx Proxy Manager SSL termination, PostgreSQL database, Redis cache, and pgAdmin management console.',
    badge: 'Infrastructure',
    createdAt: '1 week ago',
  },
};

function formatDifficulty(diff: string, lang: string) {
  if (lang === 'tr') return diff;
  switch (diff) {
    case 'Kolay': return 'Easy';
    case 'Orta': return 'Medium';
    case 'İleri': return 'Advanced';
    default: return diff;
  }
}

function TemplateCard({ tpl }: { tpl: ArchitectureTemplate }) {
  const { lang, setLang } = useI18nStore();
  const { t } = useTranslation();
  const isTr = lang === 'tr';
  const [localLikes, setLocalLikes] = useState(tpl.nodes.length * 4 + 9);
  const [hasLiked, setHasLiked] = useState(false);

  React.useEffect(() => {
    try {
      const likedKey = `xivizley_like_${tpl.id}`;
      if (localStorage.getItem(likedKey) === 'true') {
        setHasLiked(true);
      }
    } catch {}
  }, [tpl.id]);

  const Icon = ICON_MAP[tpl.icon] ?? Cpu;
  const nodeCount = tpl.nodes.length;
  const categoryLabel = lang === 'en' ? (CATEGORY_LABELS_EN[tpl.category] ?? tpl.categoryLabel) : tpl.categoryLabel;

  const en = TEMPLATE_EN_MAP[tpl.id];
  const name = !isTr && en ? en.name : tpl.name;
  const description = !isTr && en ? en.desc : tpl.description;
  const sponsor = getTemplateSponsor(tpl.id);
  const badge = sponsor
    ? (isTr ? sponsor.badgeLabelTr : sponsor.badgeLabelEn)
    : (!isTr && en && en.badge ? en.badge : (tpl.badge === 'Gelişmiş' || tpl.badge === 'PRO Mimari' ? (isTr ? 'Gelişmiş' : 'Advanced') : (isTr ? 'Topluluk' : 'Community')));

  return (
    <article className={cn(
      "group flex flex-col rounded-2xl border bg-[#0e111a] overflow-hidden transition-all duration-300 hover:shadow-2xl",
      sponsor
        ? "border-indigo-500/40 hover:border-indigo-400 hover:shadow-indigo-500/15"
        : "border-slate-800/80 hover:border-indigo-500/50 hover:bg-[#111522] hover:shadow-indigo-500/10"
    )}>
      {/* Visual Header */}
      <div
        className="relative flex items-center justify-center h-36 border-b border-slate-800/80 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${sponsor ? '#8B5CF6' : tpl.color}22 0%, #08090e 100%)` }}
      >
        <div className="absolute inset-0 flex items-center justify-center gap-3 opacity-20">
          {tpl.nodes.slice(0, 6).map((_, i) => (
            <div key={i} className="h-2 w-2 rounded-full" style={{ backgroundColor: tpl.color }} />
          ))}
          {tpl.nodes.length > 6 && <span className="text-[10px]" style={{ color: tpl.color }}>+{tpl.nodes.length - 6}</span>}
        </div>
        <div
          className="relative flex h-16 w-16 items-center justify-center rounded-2xl border shadow-xl transition-transform duration-300 group-hover:scale-110"
          style={{ backgroundColor: `${tpl.color}20`, borderColor: `${tpl.color}50` }}
        >
          <Icon className="h-8 w-8" style={{ color: tpl.color }} />
        </div>
        {badge && (
          <span className={cn(
            "absolute top-3 right-3 text-[10px] font-semibold backdrop-blur-sm px-2.5 py-0.5 rounded-full shadow-sm flex items-center gap-1",
            sponsor
              ? "bg-indigo-950/90 border border-indigo-500/50 text-indigo-300"
              : "bg-[#08090e]/90 border border-slate-700/80 text-slate-200"
          )}>
            {sponsor && <Zap className="h-2.5 w-2.5 text-indigo-400" />}
            {badge}
          </span>
        )}
        <span className="absolute top-3 left-3 text-[9px] font-medium uppercase tracking-wider text-slate-400 bg-[#08090e]/90 backdrop-blur-sm border border-slate-800 px-2 py-0.5 rounded-md">
          {categoryLabel}
        </span>
      </div>

      {/* Body Details */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-sm font-bold text-slate-100 leading-tight group-hover:text-indigo-300 transition-colors">
            {name}
          </h3>
          {tpl.difficulty && (
            <span className={cn('shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border', DIFFICULTY_COLOR[tpl.difficulty])}>
              {formatDifficulty(tpl.difficulty, lang)}
            </span>
          )}
        </div>

        {/* Sponsor disclosure note */}
        {sponsor && (
          <div className="flex items-center justify-between rounded-lg bg-indigo-950/40 border border-indigo-500/30 px-2.5 py-1 text-[10px] text-indigo-200">
            <span>🤝 {isTr ? sponsor.noteTr : sponsor.noteEn}</span>
            <span className="text-indigo-400 font-mono font-semibold">{sponsor.sponsorName}</span>
          </div>
        )}

        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">{description}</p>

        {/* Service Pills */}
        {tpl.services && (
          <div className="flex flex-wrap gap-1.5 mt-1">
            {tpl.services.slice(0, 4).map((s) => (
              <span key={s} className="text-[10px] bg-[#131724] border border-slate-700/70 text-slate-300 px-2 py-0.5 rounded-md font-medium">
                {s}
              </span>
            ))}
            {tpl.services.length > 4 && (
              <span className="text-[10px] text-slate-500 bg-[#131724] px-1.5 py-0.5 rounded-md font-mono">
                +{tpl.services.length - 4}
              </span>
            )}
          </div>
        )}

        {/* Footer Actions */}
        <div className="mt-auto pt-3 border-t border-slate-800/60 flex flex-col gap-2">
          <div className="flex items-center justify-between gap-2">
            {/* Like / Upvote Button */}
            <button
              onClick={() => {
                const likedKey = `xivizley_like_${tpl.id}`;
                const isLiked = localStorage.getItem(likedKey) === 'true';
                if (isLiked) {
                  localStorage.removeItem(likedKey);
                  setLocalLikes((prev) => Math.max(0, prev - 1));
                  setHasLiked(false);
                } else {
                  localStorage.setItem(likedKey, 'true');
                  setLocalLikes((prev) => prev + 1);
                  setHasLiked(true);
                }
              }}
              className={cn(
                'flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border transition-all active:scale-95',
                hasLiked
                  ? 'bg-pink-950/40 border-pink-500/50 text-pink-400'
                  : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-pink-400 hover:border-pink-500/30'
              )}
              title={isTr ? 'Tasarımı Beğen / Oyla' : 'Like / Upvote'}
            >
              <Heart className={cn('h-3.5 w-3.5', hasLiked && 'fill-current text-pink-400')} />
              <span>{localLikes}</span>
            </button>

            {/* Fork & Open in Canvas */}
            <Link
              href={`/architect?template=${tpl.id}`}
              className="flex items-center gap-1.5 rounded-lg bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 px-3 py-1.5 text-xs font-bold text-white shadow-md shadow-indigo-500/20 hover:brightness-110 transition-all active:scale-95"
              title={isTr ? 'Bu mimariyi kendi tuvaline kopyala ve düzenle' : 'Copy and customize this architecture in canvas'}
            >
              <Sparkles className="h-3 w-3" />
              <span>{isTr ? 'Fork & Aç (Ücretsiz)' : 'Fork & Open (Free)'}</span>
            </Link>
          </div>

          {/* Direct sponsor CTA if sponsored */}
          {sponsor && (
            <a
              href={sponsor.affiliateUrl}
              target="_blank"
              rel="sponsored noopener noreferrer"
              className="flex items-center justify-center gap-1.5 rounded-lg border border-indigo-500/40 bg-indigo-950/30 hover:bg-indigo-900/40 py-1 px-2.5 text-[10px] font-bold text-indigo-300 hover:text-indigo-100 transition-all active:scale-95"
            >
              <span>⚡ {sponsor.sponsorName}: {isTr ? sponsor.ctaTextTr : sponsor.ctaTextEn}</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          )}
        </div>
      </div>
    </article>
  );
}

function ArchCard({ arch }: { arch: ArchitectureDTO }) {
  const { lang } = useI18nStore();
  const { t } = useTranslation();
  let moduleCount = 0;
  try {
    const parsed = JSON.parse(arch.canvasJson) as { nodes?: unknown[] };
    moduleCount = parsed.nodes?.length ?? 0;
  } catch { /* ignore */ }

  const formattedDate = new Intl.DateTimeFormat(lang === 'tr' ? 'tr-TR' : 'en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(new Date(arch.createdAt));

  return (
    <article className="group flex flex-col rounded-2xl border border-slate-800/80 bg-[#0e111a] overflow-hidden hover:border-indigo-500/50 hover:bg-[#111522] hover:shadow-xl transition-all duration-200">
      <div className="relative aspect-video w-full bg-[#08090e] border-b border-slate-800 overflow-hidden">
        {arch.thumbnail ? (
          <Image src={arch.thumbnail} alt={`${arch.title} preview`} fill className="object-cover" sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw" />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="flex flex-col items-center gap-2 text-slate-700">
              <Cpu className="h-10 w-10" />
              <span className="text-xs">{moduleCount} {t('feedPage.moduleCount')}</span>
            </div>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-[#08090e]/80 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>
      <div className="flex flex-col flex-1 p-4 gap-2">
        <Link href={`/architect?load=${arch.id}`} className="text-sm font-semibold text-slate-200 hover:text-indigo-400 transition-colors line-clamp-1">{arch.title}</Link>
        {arch.description && <p className="text-xs text-slate-500 line-clamp-2">{arch.description}</p>}
        <div className="mt-auto flex items-center gap-2 pt-2">
          {arch.user.image ? <Image src={arch.user.image} alt={arch.user.name ?? 'User'} width={20} height={20} className="rounded-full" /> : <div className="h-5 w-5 rounded-full bg-slate-700" />}
          <span className="text-[11px] text-slate-500 flex-1 truncate">{arch.user.name ?? (lang === 'tr' ? 'Anonim' : 'Anonymous')}</span>
          <span className="text-[10px] text-slate-700">{formattedDate}</span>
        </div>
      </div>
      <div className="flex items-center gap-3 border-t border-slate-800 px-4 py-2">
        <span className="flex items-center gap-1 text-[11px] text-slate-600"><Heart className="h-3 w-3" />{arch._count.likes}</span>
        <span className="flex items-center gap-1 text-[11px] text-slate-600"><MessageCircle className="h-3 w-3" />{arch._count.comments}</span>
        <span className="flex items-center gap-1 text-[11px] text-slate-600 ml-auto"><Eye className="h-3 w-3" />{arch.viewCount}</span>
      </div>
    </article>
  );
}

function FeaturedCommunityCard({ stack }: { stack: FeaturedCommunityStack }) {
  const { lang } = useI18nStore();
  const { t } = useTranslation();
  const isTr = lang === 'tr';

  const en = FEATURED_EN_MAP[stack.id];
  const title = !isTr && en ? en.title : stack.title;
  const description = !isTr && en ? en.desc : stack.description;
  const authorBadge = !isTr && en ? en.badge : stack.author.badge;
  const createdAt = !isTr && en ? en.createdAt : stack.createdAt;

  return (
    <article className="group flex flex-col rounded-2xl border border-slate-800/80 bg-[#0e111a] overflow-hidden hover:border-indigo-500/50 hover:bg-[#111522] hover:shadow-2xl hover:shadow-indigo-500/10 transition-all duration-300">
      {/* Visual Header */}
      <div
        className="relative flex items-center justify-between p-4 border-b border-slate-800/80 overflow-hidden"
        style={{ background: `linear-gradient(135deg, ${stack.color}20 0%, #08090e 100%)` }}
      >
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-950/80 border border-slate-700/60 text-base shadow-md">
            {stack.author.avatar}
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-200">{stack.author.name}</span>
              <span className="rounded-full bg-indigo-500/15 border border-indigo-500/30 px-1.5 py-0.2 text-[9px] font-semibold text-indigo-300">
                {authorBadge}
              </span>
            </div>
            <span className="text-[10px] text-slate-500">{createdAt}</span>
          </div>
        </div>

        <span className={cn('shrink-0 text-[10px] font-semibold px-2 py-0.5 rounded-full border', DIFFICULTY_COLOR[stack.difficulty])}>
          {formatDifficulty(stack.difficulty, lang)}
        </span>
      </div>

      {/* Body */}
      <div className="flex flex-col flex-1 p-4 gap-2">
        <h3 className="text-sm font-bold text-slate-100 leading-tight group-hover:text-indigo-300 transition-colors">
          {title}
        </h3>
        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2">
          {description}
        </p>

        {/* Tags */}
        <div className="flex flex-wrap gap-1 mt-1">
          {stack.tags.map((tag) => (
            <span key={tag} className="rounded-md bg-slate-800/60 border border-slate-700/50 px-1.5 py-0.5 text-[10px] text-slate-300 font-medium">
              #{tag}
            </span>
          ))}
        </div>

        {/* Footer Actions */}
        <div className="mt-auto pt-3 border-t border-slate-800/60 flex items-center justify-between">
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <span className="flex items-center gap-1 text-slate-400 font-mono" title="Örnek değer">
              <Heart className="h-3 w-3 text-red-400 fill-red-400/20" />
              {stack.stars}
            </span>
            <span className="flex items-center gap-1 text-slate-400 font-mono" title="Örnek değer">
              <MessageCircle className="h-3 w-3 text-indigo-400" />
              {stack.comments}
            </span>
            <span className="text-[10px] text-slate-600 italic">örnek</span>
          </div>

          <Link
            href={`/architect?modules=${stack.moduleIds.join(',')}`}
            className="flex items-center gap-1.5 rounded-lg bg-indigo-500/10 border border-indigo-500/30 px-3 py-1.5 text-xs font-semibold text-indigo-300 hover:bg-gradient-to-r hover:from-indigo-500 hover:via-purple-500 hover:to-cyan-500 hover:text-white hover:border-transparent transition-all active:scale-95 shadow-sm"
          >
            <span>{t('feedPage.openInCanvas')}</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export function FeedClient({ architectures }: { architectures: ArchitectureDTO[] }) {
  const { lang } = useI18nStore();
  const { t } = useTranslation();
  const isTr = lang === 'tr';
  const [activeTab, setActiveTab] = useState<'templates' | 'community'>('templates');
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const hasRealDesigns = architectures.length > 0;

  // Filtered Templates
  const filteredTemplates = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return PREDEFINED_TEMPLATES.filter((tpl) => {
      const en = TEMPLATE_EN_MAP[tpl.id];
      const name = !isTr && en ? en.name : tpl.name;
      const desc = !isTr && en ? en.desc : tpl.description;
      const categoryLabel = lang === 'en' ? (CATEGORY_LABELS_EN[tpl.category] ?? tpl.categoryLabel) : tpl.categoryLabel;

      const matchesCategory = activeCategory === 'all' || tpl.category === activeCategory;
      const matchesQuery =
        !q ||
        name.toLowerCase().includes(q) ||
        desc.toLowerCase().includes(q) ||
        tpl.services.some((s) => s.toLowerCase().includes(q)) ||
        categoryLabel.toLowerCase().includes(q);

      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, searchQuery, isTr, lang]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/30">
            <Sparkles className="h-4 w-4" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-100">{t('feedPage.pageTitle')}</h1>
        </div>
        <p className="text-xs sm:text-sm text-slate-400 max-w-2xl">
          {t('feedPage.pageSubtitle')}
        </p>
      </div>

      {/* Controls Bar: Tabs & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        {/* Main Tab Switcher */}
        <div className="flex items-center gap-1 bg-[#0e111a] border border-slate-800 rounded-xl p-1 w-fit shadow-sm">
          <button
            onClick={() => setActiveTab('templates')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all',
              activeTab === 'templates'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <Sparkles className="h-3.5 w-3.5 text-indigo-400" />
            <span>{t('feedPage.tabTemplates')}</span>
            <span className="ml-1 bg-[#131724] border border-slate-700 text-slate-300 text-[10px] px-1.5 py-0.5 rounded-full font-mono">
              {PREDEFINED_TEMPLATES.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('community')}
            className={cn(
              'flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold transition-all',
              activeTab === 'community'
                ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            )}
          >
            <Users className="h-3.5 w-3.5 text-indigo-400" />
            <span>{t('feedPage.tabCommunity')}</span>
            {hasRealDesigns && (
              <span className="ml-1 bg-indigo-500/20 border border-indigo-500/30 text-indigo-400 text-[10px] px-1.5 py-0.5 rounded-full font-mono">
                {architectures.length}
              </span>
            )}
          </button>
        </div>

        {/* Instant Search Bar */}
        <div className="relative w-full sm:w-72">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={t('feedPage.searchPlaceholder')}
            className="w-full rounded-xl border border-slate-800 bg-[#0e111a] pl-9 pr-8 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500/30 transition-all shadow-sm"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Category Chips (Templates Tab only) */}
      {activeTab === 'templates' && (
        <div className="flex gap-2 overflow-x-auto scrollbar-none pb-2 mb-8">
          {TEMPLATE_CATEGORIES.map((cat) => {
            const count =
              cat.id === 'all'
                ? PREDEFINED_TEMPLATES.length
                : PREDEFINED_TEMPLATES.filter((t) => t.category === cat.id).length;
            const label = lang === 'en' ? (CATEGORY_LABELS_EN[cat.id] ?? cat.label) : cat.label;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={cn(
                  'flex items-center gap-2 shrink-0 rounded-xl border px-3.5 py-1.5 text-xs font-semibold transition-all',
                  activeCategory === cat.id
                    ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-300 ring-1 ring-indigo-500/30'
                    : 'border-slate-800 bg-[#0e111a]/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                )}
              >
                <span>{label}</span>
                <span className="text-[10px] font-mono text-slate-500">({count})</span>
              </button>
            );
          })}
        </div>
      )}

      {/* Content Grid */}
      {activeTab === 'templates' && (
        filteredTemplates.length === 0 ? (
          <div className="py-24 text-center rounded-2xl border border-slate-800 bg-[#0e111a]/60 p-8">
            <Search className="mx-auto mb-3 h-10 w-10 text-slate-600" />
            <h3 className="text-base font-bold text-slate-300">{t('feedPage.noResults')}</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              {t('feedPage.noResultsHint')}
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setActiveCategory('all');
              }}
              className="mt-4 rounded-xl border border-slate-700 bg-slate-800 px-4 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700"
            >
              {t('feedPage.clearFilters')}
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filteredTemplates.map((tpl) => (
              <TemplateCard key={tpl.id} tpl={tpl} />
            ))}
          </div>
        )
      )}

      {activeTab === 'community' && (
        <div className="space-y-6">
          {/* Community Subheader */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 rounded-2xl border border-slate-800 bg-[#0e111a] p-4 backdrop-blur-sm">
            <div>
              <h2 className="text-sm font-bold text-slate-100 flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-indigo-400" />
                <span>{isTr ? 'Topluluk & Geliştirici Mimarileri' : 'Community & Developer Architectures'}</span>
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                {isTr
                  ? 'Topluluk üyeleri tarafından test edilmiş ve paylaşılan canlı homelab mimarileri.'
                  : 'Live homelab architectures tested and shared by community members.'}
              </p>
            </div>
            <Link
              href="/architect"
              className="flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 via-purple-500 to-cyan-500 hover:brightness-110 px-4 py-2 text-xs font-bold text-white transition-all shadow-md shadow-indigo-500/20 active:scale-95 shrink-0"
            >
              <span>{isTr ? '+ Kendi Mimarini Paylaş' : '+ Share Your Architecture'}</span>
            </Link>
          </div>

          {/* Cards Grid */}
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3">
            {/* Real DB Architectures if present */}
            {architectures.map((arch) => (
              <ArchCard key={arch.id} arch={arch} />
            ))}

            {/* Featured Community Stacks */}
            {FEATURED_COMMUNITY_STACKS.map((stack) => (
              <FeaturedCommunityCard key={stack.id} stack={stack} />
            ))}
          </div>
        </div>
      )}
    </main>
  );
}
