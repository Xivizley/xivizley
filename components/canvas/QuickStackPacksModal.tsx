'use client';

import React, { useState, useMemo } from 'react';
import { useArchitectStore } from '@/store/useArchitectStore';
import { Sparkles, X, ArrowRight, Server, Search } from 'lucide-react';
import { cn } from '@/lib/utils';

export type PackCategory = 'all' | 'media' | 'security' | 'ai' | 'web' | 'enterprise' | 'game';

export interface StackPack {
  id: string;
  templateId: string;
  name: string;
  desc: string;
  emoji: string;
  category: PackCategory;
  badge: string;
  badgeColor: string;
  modules: string[];
  sponsorText: string;
  sponsorUrl: string;
}

export const STACK_PACKS: StackPack[] = [
  {
    id: 'media',
    templateId: 'ultimate-4k-media-suite',
    name: '4K Medya & Sinema Paketi',
    desc: 'Jellyfin + qBittorrent + Radarr + Sonarr + FileBrowser',
    emoji: '🎬',
    category: 'media',
    badge: '10 Gbps Önerilir',
    badgeColor: 'border-cyan-500/40 text-cyan-300 bg-cyan-500/10',
    modules: ['Jellyfin', 'qBittorrent', 'Radarr', 'Sonarr', 'FileBrowser'],
    sponsorText: '⚡ OWEB TR Cloud 10 Gbps',
    sponsorUrl: 'https://www.oweb.net.tr/aff.php?aff=975',
  },
  {
    id: 'reader',
    templateId: 'kavita-digital-library',
    name: 'Manga, Kitap & Medya Kütüphanesi',
    desc: 'Kavita + Audiobookshelf + FileBrowser + Caddy Proxy',
    emoji: '📚',
    category: 'media',
    badge: 'OPDS & Web Okuyucu',
    badgeColor: 'border-sky-500/40 text-sky-300 bg-sky-500/10',
    modules: ['Kavita', 'Audiobookshelf', 'FileBrowser', 'Caddy'],
    sponsorText: '🚀 Hosting.com.tr NVMe',
    sponsorUrl: 'https://www.hosting.com.tr/aff.php?aff=1702',
  },
  {
    id: 'security',
    templateId: 'cyber-security-fortress',
    name: 'Siber Güvenlik & VPN Kalkanı',
    desc: 'WireGuard + Pi-hole + AdGuard Home + Nginx Proxy Manager',
    emoji: '🛡️',
    category: 'security',
    badge: 'Düşük Ping',
    badgeColor: 'border-indigo-500/40 text-indigo-300 bg-indigo-500/10',
    modules: ['WireGuard', 'Pi-hole', 'AdGuard Home', 'Nginx Proxy'],
    sponsorText: '🚀 Hosting.com.tr NVMe',
    sponsorUrl: 'https://www.hosting.com.tr/aff.php?aff=1702',
  },
  {
    id: 'ai',
    templateId: 'local-ai-ollama',
    name: 'Yerel Yapay Zeka & LLM Stüdyosu',
    desc: 'Ollama + Open WebUI + ChromaDB + Flowise',
    emoji: '🤖',
    category: 'ai',
    badge: 'Yerel DeepSeek / Llama',
    badgeColor: 'border-purple-500/40 text-purple-300 bg-purple-500/10',
    modules: ['Ollama', 'Open-WebUI', 'Flowise', 'Nginx Proxy'],
    sponsorText: '⚡ Datacenter NVMe',
    sponsorUrl: 'https://www.oweb.net.tr/aff.php?aff=975',
  },
  {
    id: 'analytics',
    templateId: 'umami-analytics-suite',
    name: 'Web Analitik & Veri Merkezi',
    desc: 'Umami Analytics + PostgreSQL + NocoDB + Caddy',
    emoji: '📈',
    category: 'web',
    badge: 'Çerezsiz & GDPR Uyumlu',
    badgeColor: 'border-blue-500/40 text-blue-300 bg-blue-500/10',
    modules: ['Umami', 'PostgreSQL', 'NocoDB', 'Caddy'],
    sponsorText: '⚡ OWEB 10 Gbps',
    sponsorUrl: 'https://www.oweb.net.tr/aff.php?aff=975',
  },
  {
    id: 'tracker',
    templateId: 'changedetection-monitor-stack',
    name: 'Otonom Fiyat & Sistem Radarı',
    desc: 'Changedetection.io + Uptime Kuma + n8n + Nginx',
    emoji: '🎯',
    category: 'ai',
    badge: 'Anlık Telegram / Discord',
    badgeColor: 'border-pink-500/40 text-pink-300 bg-pink-500/10',
    modules: ['Changedetection', 'Uptime Kuma', 'n8n', 'Nginx'],
    sponsorText: '⚡ OWEB TR Cloud',
    sponsorUrl: 'https://www.oweb.net.tr/aff.php?aff=975',
  },
  {
    id: 'design',
    templateId: 'penpot-design-studio',
    name: 'Açık Kaynak Tasarım & UI/UX Stüdyosu',
    desc: 'Penpot + PostgreSQL + Redis + Caddy Web Sunucusu',
    emoji: '🎨',
    category: 'enterprise',
    badge: 'Figma Alternatifi',
    badgeColor: 'border-violet-500/40 text-violet-300 bg-violet-500/10',
    modules: ['Penpot', 'PostgreSQL', 'Redis', 'Caddy'],
    sponsorText: '⚡ Datacenter NVMe',
    sponsorUrl: 'https://www.oweb.net.tr/aff.php?aff=975',
  },
  {
    id: 'cloud',
    templateId: 'nextcloud-collabora-office',
    name: 'Özel Bulut & Ofis Depolama',
    desc: 'Nextcloud 28 + Collabora Office + PostgreSQL + Redis',
    emoji: '☁️',
    category: 'enterprise',
    badge: 'Sınırsız Alan',
    badgeColor: 'border-sky-500/40 text-sky-300 bg-sky-500/10',
    modules: ['Nextcloud', 'Collabora', 'PostgreSQL', 'Redis'],
    sponsorText: '🚀 Hosting.com.tr NVMe',
    sponsorUrl: 'https://www.hosting.com.tr/aff.php?aff=1702',
  },
  {
    id: 'starter',
    templateId: 'casaos-starter-home',
    name: 'CasaOS Başlangıç Homelab',
    desc: 'CasaOS Web UI + Docker Engine + FileBrowser + Jellyfin',
    emoji: '🏠',
    category: 'web',
    badge: '1-Tık Kurulum',
    badgeColor: 'border-amber-500/40 text-amber-300 bg-amber-500/10',
    modules: ['CasaOS', 'Docker', 'FileBrowser', 'Jellyfin'],
    sponsorText: '⚡ OWEB TR Cloud',
    sponsorUrl: 'https://www.oweb.net.tr/aff.php?aff=975',
  },
  {
    id: 'smart-home',
    templateId: 'home-assistant-smart-home',
    name: 'Akıllı Ev & IoT Karargahı',
    desc: 'Home Assistant + Mosquitto MQTT + Node-RED + Zigbee',
    emoji: '🏡',
    category: 'enterprise',
    badge: 'Yerel Gizlilik Odaklı',
    badgeColor: 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10',
    modules: ['Home Assistant', 'Mosquitto', 'Node-RED'],
    sponsorText: '🚀 Hosting.com.tr NVMe',
    sponsorUrl: 'https://www.hosting.com.tr/aff.php?aff=1702',
  },
  {
    id: 'game',
    templateId: 'minecraft-papermc-ultimate',
    name: 'Minecraft PaperMC 1.21.4',
    desc: 'PaperMC + ViaVersion + AuthMe + EssentialsX + Glances',
    emoji: '🎮',
    category: 'game',
    badge: '20 TPS Garanti',
    badgeColor: 'border-emerald-500/40 text-emerald-300 bg-emerald-500/10',
    modules: ['PaperMC', 'ViaVersion', 'AuthMe', 'EssentialsX'],
    sponsorText: '⚡ OWEB 10 Gbps Port',
    sponsorUrl: 'https://www.oweb.net.tr/aff.php?aff=975',
  },
  {
    id: 'dms',
    templateId: 'paperless-ngx-dms',
    name: 'Paperless Dijital Belge Arşivi',
    desc: 'Paperless-ngx + PostgreSQL + Redis + Tika OCR + Gotenberg',
    emoji: '📄',
    category: 'enterprise',
    badge: 'Yapay Zeka Destekli OCR',
    badgeColor: 'border-teal-500/40 text-teal-300 bg-teal-500/10',
    modules: ['Paperless-ngx', 'PostgreSQL', 'Redis', 'Tika'],
    sponsorText: '⚡ OWEB TR Cloud',
    sponsorUrl: 'https://www.oweb.net.tr/aff.php?aff=975',
  },
];

const CATEGORY_TABS: Array<{ id: PackCategory; label: string }> = [
  { id: 'all', label: 'Tümü' },
  { id: 'media', label: '🎬 Medya' },
  { id: 'security', label: '🛡️ Güvenlik' },
  { id: 'ai', label: '🤖 AI & Otomasyon' },
  { id: 'web', label: '📈 Web & Veri' },
  { id: 'enterprise', label: '💼 Ofis & Araçlar' },
  { id: 'game', label: '🎮 Oyun' },
];

interface QuickStackPacksModalProps {
  isOpen: boolean;
  onClose: () => void;
}

import { useI18nStore } from '@/lib/i18n/store';

export function QuickStackPacksModal({ isOpen, onClose }: QuickStackPacksModalProps) {
  const lang = useI18nStore((s) => s.lang);
  const isTr = lang === 'tr';
  const isPt = lang === 'pt';
  const loadTemplate = useArchitectStore((s) => s.loadTemplate);
  const [selectedCat, setSelectedCat] = useState<PackCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const categoryTabs = [
    { id: 'all' as PackCategory, label: isTr ? 'Tümü' : isPt ? 'Todos' : 'All' },
    { id: 'media' as PackCategory, label: isTr ? '🎬 Medya' : isPt ? '🎬 Mídia' : '🎬 Media' },
    { id: 'security' as PackCategory, label: isTr ? '🛡️ Güvenlik' : isPt ? '🛡️ Segurança' : '🛡️ Security' },
    { id: 'ai' as PackCategory, label: isTr ? '🤖 AI & Otomasyon' : isPt ? '🤖 IA & Automação' : '🤖 AI & Automation' },
    { id: 'web' as PackCategory, label: isTr ? '📈 Web & Veri' : isPt ? '📈 Web & Dados' : '📈 Web & Data' },
    { id: 'enterprise' as PackCategory, label: isTr ? '💼 Ofis & Araçlar' : isPt ? '💼 Escritório & Ferramentas' : '💼 Office & Tools' },
    { id: 'game' as PackCategory, label: isTr ? '🎮 Oyun' : isPt ? '🎮 Jogos' : '🎮 Gaming' },
  ];

  const filteredPacks = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    return STACK_PACKS.filter((p) => {
      const matchCat = selectedCat === 'all' || p.category === selectedCat;
      const matchSearch =
        !q ||
        p.name.toLowerCase().includes(q) ||
        p.desc.toLowerCase().includes(q) ||
        p.modules.some((m) => m.toLowerCase().includes(q));
      return matchCat && matchSearch;
    });
  }, [selectedCat, searchQuery]);

  if (!isOpen) return null;

  const handleSelect = (templateId: string) => {
    loadTemplate(templateId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-3xl border border-slate-800/90 bg-[#0c1017]/95 p-5 sm:p-7 shadow-2xl backdrop-blur-xl">
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-5 top-5 rounded-xl border border-slate-800 bg-slate-900/80 p-2 text-slate-400 hover:text-white transition-colors"
          aria-label={isTr ? 'Kapat' : isPt ? 'Fechar' : 'Close'}
        >
          <X className="h-4 w-4" />
        </button>

        {/* Header */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-indigo-500/20 border border-indigo-500/40 text-indigo-400 shrink-0">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-extrabold text-slate-100">
                {isTr ? 'Hazır Mimari Paketleri' : isPt ? 'Pacotes de Arquitetura Prontos' : 'Ready Architecture Packs'}
              </h3>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 font-mono">
                {STACK_PACKS.length} {isTr ? 'Paket' : isPt ? 'Pacotes' : 'Packs'}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {isTr
                ? 'Tek tıkla optimize edilmiş, port çakışmaları çözülmüş tam teşekküllü mimariyi tuvale yükleyin.'
                : isPt
                ? 'Carregue uma arquitetura completa no canvas com 1 clique, sem conflitos de porta.'
                : 'Load a full-fledged, conflict-free, optimized architecture onto the canvas with 1 click.'}
            </p>
          </div>
        </div>

        {/* Search & Category Filter Bar */}
        <div className="space-y-2.5 mb-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-500" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={isTr ? 'Paket veya servis ara (örn: Umami, Plex, Nextcloud, Ollama)...' : isPt ? 'Buscar pacote ou serviço (ex: Umami, Plex, Nextcloud, Ollama)...' : 'Search packs or services (e.g. Umami, Plex, Nextcloud, Ollama)...'}
              className="w-full rounded-xl border border-slate-800 bg-slate-900/80 pl-9 pr-8 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/60 focus:ring-1 focus:ring-indigo-500/40 transition-colors"
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

          {/* Category Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {categoryTabs.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCat(cat.id)}
                className={cn(
                  'shrink-0 rounded-xl px-3 py-1 text-xs font-semibold transition-all',
                  selectedCat === cat.id
                    ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/50 shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60 border border-transparent'
                )}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stacks Grid */}
        <div className="flex-1 overflow-y-auto pr-1">
          {filteredPacks.length === 0 ? (
            <div className="py-12 text-center">
              <p className="text-sm font-semibold text-slate-400">
                {isTr ? 'Aramanıza uygun mimari paket bulunamadı.' : isPt ? 'Nenhum pacote de arquitetura encontrado.' : 'No architecture packs found matching your search.'}
              </p>
              <p className="text-xs text-slate-600 mt-1">
                {isTr ? 'Farklı bir arama terimi deneyin veya filtreyi sıfırlayın.' : isPt ? 'Tente um termo diferente ou redefina o filtro.' : 'Try a different search term or reset filters.'}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pb-2">
              {filteredPacks.map((pack) => (
                <div
                  key={pack.id}
                  className="group relative flex flex-col justify-between rounded-2xl border border-slate-800/80 bg-slate-900/60 p-4 transition-all hover:border-indigo-500/60 hover:bg-slate-900/95 hover:shadow-xl hover:shadow-indigo-500/10 cursor-pointer"
                  onClick={() => handleSelect(pack.templateId)}
                >
                  <div>
                    {/* Top Row: Emoji, Name, Badge */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex items-center gap-2.5">
                        <span className="text-2xl shrink-0">{pack.emoji}</span>
                        <div>
                          <h4 className="text-xs font-bold text-slate-100 group-hover:text-indigo-300 transition-colors">
                            {pack.name}
                          </h4>
                          <span className={cn('inline-block text-[9px] font-semibold px-2 py-0.5 rounded-full border mt-0.5', pack.badgeColor)}>
                            {pack.badge}
                          </span>
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 leading-relaxed mb-3">
                      {pack.desc}
                    </p>

                    {/* Included Modules Pill List */}
                    <div className="flex flex-wrap gap-1 mb-3">
                      {pack.modules.map((mod) => (
                        <span
                          key={mod}
                          className="rounded-md border border-slate-800 bg-slate-950/60 px-1.5 py-0.5 text-[9px] font-mono text-slate-400"
                        >
                          {mod}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Card Footer: Sponsor & Deploy CTA */}
                  <div className="flex items-center justify-between pt-2.5 border-t border-slate-800/60 text-[11px]">
                    <a
                      href={pack.sponsorUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="text-slate-400 hover:text-cyan-300 transition-colors font-medium flex items-center gap-1 text-[10px]"
                      title={isTr ? 'Tavsiye Edilen Yüksek Hızlı VDS' : isPt ? 'VDS de Alta Velocidade Recomendado' : 'Recommended High-Speed Cloud VDS'}
                    >
                      <Server className="h-3 w-3 text-cyan-400" />
                      {pack.sponsorText}
                    </a>
                    <span className="inline-flex items-center gap-1 font-bold text-indigo-400 group-hover:translate-x-0.5 transition-transform text-[11px]">
                      {isTr ? '1-Tık Kur' : isPt ? 'Instalar com 1-Clique' : '1-Click Install'} <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
