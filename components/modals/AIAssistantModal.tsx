'use client';

// ============================================================
// XIVIZLEY — AI Homelab Architecture Assistant Modal 2.0
// components/modals/AIAssistantModal.tsx
// ============================================================

import React, { useState } from 'react';
import { useArchitectStore } from '@/store/useArchitectStore';
import { MODULE_CATALOG } from '@/lib/data/modules';
import { cn } from '@/lib/utils';
import {
  Sparkles,
  Loader2,
  X,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
  Building2,
  Users,
  User,
  ShieldAlert,
  MemoryStick,
  Plus,
  RefreshCw,
} from 'lucide-react';
import { useI18nStore } from '@/lib/i18n/store';

interface AIAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AIResult {
  title: string;
  explanation: string;
  nodes: Array<{ id: string; moduleId: string; x: number; y: number }>;
  edges: Array<{ source: string; target: string }>;
}

const PROFILES = [
  { id: 'family', icon: Users, label: 'Aile İçin', labelEn: 'Family & Home', promptSuffix: 'aile sunucusu' },
  { id: 'individual', icon: User, label: 'Bireysel / Dev', labelEn: 'Personal / Dev', promptSuffix: 'bireysel geliştirici sunucusu' },
  { id: 'mid_company', icon: Building2, label: 'Orta Düzey Şirket', labelEn: 'Mid-Tier Company (SMB)', promptSuffix: 'orta düzey şirket sunucusu' },
  { id: 'enterprise', icon: ShieldAlert, label: 'Üst Düzey Şirket (Kurumsal)', labelEn: 'Enterprise Company', promptSuffix: 'üst düzey kurumsal şirket sunucusu' },
];

const RAM_OPTIONS = ['1 GB', '2 GB', '4 GB', '6 GB', '8 GB', '12 GB', '16 GB', '32 GB', '64 GB'];

const PRESET_PROMPTS = [
  {
    icon: '🎬',
    title: 'Otomatik Medya & İndirme',
    titleEn: 'Auto Media & Torrent',
    prompt: 'Plex medya sunucusu, Overseerr talep sistemi, Radarr/Sonarr dizi film yöneticileri ve qBittorrent içeren otomatik indirme sistemi.',
  },
  {
    icon: '🛡️',
    title: 'Reklam Engelleme & VPN',
    titleEn: 'AdBlock DNS & WireGuard',
    prompt: 'Evdeki tüm cihazlarda reklamları engelleyen Pi-hole DNS, güvenli uzaktan erişim için WireGuard VPN ve Nginx Proxy Manager.',
  },
  {
    icon: '☁️',
    title: 'Kişisel Bulut & Fotoğraf',
    titleEn: 'Nextcloud & Photo Backup',
    prompt: 'Google Drive ve Google Fotoğraflar alternatifi Nextcloud, Immich ve otomatik yedekleme için Duplicati altyapısı.',
  },
  {
    icon: '🏡',
    title: 'Akıllı Ev & Otomasyon',
    titleEn: 'Smart Home & Automation',
    prompt: 'İş akışlarını bağlayan n8n otomasyon sunucusu, CasaOS ve Glances sistem izleme.',
  },
  {
    icon: '🎮',
    title: 'Minecraft & Oyun Sunucusu',
    titleEn: 'Minecraft & Gaming Stack',
    prompt: 'PaperMC Minecraft sunucusu, eklentiler ve RomM retro oyun emülasyon arşivi.',
  },
  {
    icon: '🔐',
    title: 'Şifre Kasası & 2FA',
    titleEn: 'Vaultwarden & 2FA Auth',
    prompt: 'Kendi şifrelerimi barındırabileceğim Vaultwarden ve 2FA kodları için 2FAuth sistemi.',
  },
];

export function AIAssistantModal({ isOpen, onClose }: AIAssistantModalProps) {
  const { lang } = useI18nStore();
  const [prompt, setPrompt] = useState('');
  const [selectedProfile, setSelectedProfile] = useState<string>('family');
  const [selectedRam, setSelectedRam] = useState<string>('8 GB');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<AIResult | null>(null);

  const nodeCount = useArchitectStore((s) => s.nodes.length);
  const loadCustomStack = useArchitectStore((s) => s.loadCustomStack);
  const mergeCustomStack = useArchitectStore((s) => s.mergeCustomStack);

  const isTr = lang === 'tr';

  const handleGenerate = async (textToUse?: string) => {
    const query = (textToUse || prompt).trim();
    if (!query) return;

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const res = await fetch('/api/ai/architect', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: query }),
      });

      if (!res.ok) {
        throw new Error(isTr ? 'AI sunucusu yanıt vermedi.' : 'AI server failed to respond.');
      }

      const data = (await res.json()) as AIResult;
      setResult(data);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : isTr ? 'Bir hata oluştu.' : 'An error occurred.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickMatrixGenerate = (profileId: string, ram: string) => {
    setSelectedProfile(profileId);
    setSelectedRam(ram);
    const profileObj = PROFILES.find((p) => p.id === profileId) || PROFILES[0]!;
    const combinedPrompt = `${ram} ramli ${profileObj.promptSuffix}`;
    setPrompt(combinedPrompt);
    handleGenerate(combinedPrompt);
  };

  const handleApplyReplace = () => {
    if (!result) return;
    loadCustomStack(result.nodes, result.edges);
    onClose();
  };

  const handleApplyMerge = () => {
    if (!result) return;
    mergeCustomStack(result.nodes, result.edges);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#090514]/85 p-4 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-2xl overflow-hidden rounded-[2px] border border-[#2B1A42] bg-[#0D0719] shadow-2xl text-[#F5F3FF]">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2B1A42] bg-[#120A21] px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-[2px] border border-[#2B1A42] bg-[#06030D] text-[#C084FC]">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h2
                className="text-base font-bold text-[#F5F3FF] flex items-center gap-2"
                style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
              >
                {isTr ? 'AI Self-Host & VDS Mimarı 2.0' : 'AI Self-Host & VDS Architect 2.0'}
                <span className="rounded-[2px] bg-[#1E1235] px-2 py-0.5 text-[10px] font-mono font-bold text-[#C084FC] border border-[#2B1A42]">
                  {isTr ? 'Akıllı Asistan' : 'Smart Assistant'}
                </span>
              </h2>
              <p className="text-xs text-[#A19BAF] mt-0.5">
                {isTr
                  ? 'Kullanım amacınızı ve RAM miktarınızı seçin, yapay zeka tuvalinizi saniyeler içinde tasarlasın.'
                  : 'Select your use case and RAM size, and AI will generate your canvas in seconds.'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-[2px] p-1.5 text-[#8B7D9E] hover:bg-[#1E1235] hover:text-[#F5F3FF] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto scrollbar-thin scrollbar-thumb-[#2B1A42]">
          {/* 1. Profile Matrix Selector */}
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-[#8B7D9E] mb-2">
              <Users className="h-3.5 w-3.5 text-[#8B5CF6]" />
              {isTr ? '1. Kullanım Amacı / Profil:' : '1. Target Profile:'}
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {PROFILES.map((prof) => {
                const Icon = prof.icon;
                const isSelected = selectedProfile === prof.id;
                return (
                  <button
                    key={prof.id}
                    onClick={() => handleQuickMatrixGenerate(prof.id, selectedRam)}
                    className={cn(
                      'flex items-center gap-2 rounded-[2px] border p-3 text-left text-xs font-mono font-semibold transition-all',
                      isSelected
                        ? 'border-[#8B5CF6] bg-[#1E1235] text-[#F5F3FF] shadow-sm'
                        : 'border-[#2B1A42] bg-[#120A21] text-[#A19BAF] hover:border-[#8B5CF6] hover:text-[#F5F3FF]'
                    )}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span className="truncate">{isTr ? prof.label : prof.labelEn}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* 2. RAM Selector */}
          <div>
            <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-[#8B7D9E] mb-2">
              <MemoryStick className="h-3.5 w-3.5 text-[#C084FC]" />
              {isTr ? '2. Sunucu RAM Kapasitesi:' : '2. Server RAM Size:'}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {RAM_OPTIONS.map((ram) => {
                const isSelected = selectedRam === ram;
                return (
                  <button
                    key={ram}
                    onClick={() => handleQuickMatrixGenerate(selectedProfile, ram)}
                    className={cn(
                      'rounded-[2px] border px-3 py-1.5 text-xs font-mono font-medium transition-all',
                      isSelected
                        ? 'border-[#8B5CF6] bg-[#1E1235] text-[#F5F3FF]'
                        : 'border-[#2B1A42] bg-[#120A21] text-[#A19BAF] hover:border-[#8B5CF6] hover:text-[#F5F3FF]'
                    )}
                  >
                    {ram}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Inspiration Chips */}
          <div className="mb-2">
            <div className="text-[11px] font-mono uppercase tracking-wider text-[#8B7D9E] mb-1.5 flex items-center gap-1.5">
              <Lightbulb className="h-3.5 w-3.5 text-amber-400" />
              <span>{isTr ? 'Örnek İstekler:' : 'Example Ideas:'}</span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_PROMPTS.map((p, idx) => (
                <button
                  key={idx}
                  onClick={() => {
                    setPrompt(p.prompt);
                    handleGenerate(p.prompt);
                  }}
                  className="flex items-center gap-1 rounded-[2px] border border-[#2B1A42] bg-[#120A21] px-2.5 py-1 text-[11px] font-mono font-medium text-[#A19BAF] hover:border-[#8B5CF6] hover:bg-[#1E1235] hover:text-[#F5F3FF] transition-all active:scale-95"
                >
                  <span>{p.icon}</span>
                  <span>{isTr ? p.title : p.titleEn}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Prompt Input Box */}
          <div className="relative pt-1">
            <textarea
              rows={2}
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                isTr
                  ? "Veya özel prompt yazın (Örn: 8 GB ramli orta düzey şirket sunucusu)..."
                  : 'Or type custom prompt (e.g. 8 GB RAM mid-tier company server)...'
              }
              className="w-full rounded-[2px] border border-[#2B1A42] bg-[#06030D] p-3.5 text-xs text-[#F5F3FF] placeholder-[#8B7D9E] font-mono focus:border-[#8B5CF6] focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]/50 transition-all shadow-inner"
            />
            <div className="mt-2.5 flex items-center justify-between">
              <span className="text-[10px] text-[#8B7D9E] font-mono">
                💡 {isTr ? 'Butonlara tıklayabilir veya istediğiniz detayları yazabilirsiniz.' : 'Click buttons or type custom details.'}
              </span>
              <button
                onClick={() => handleGenerate()}
                disabled={loading || !prompt.trim()}
                className={cn(
                  'flex items-center gap-2 rounded-[2px] px-4 py-2.5 text-xs font-mono font-bold transition-all shadow-md',
                  loading || !prompt.trim()
                    ? 'border border-[#2B1A42] bg-[#120A21] text-[#8B7D9E] cursor-not-allowed opacity-50'
                    : 'bg-[#8B5CF6] hover:bg-[#7C3AED] text-white active:scale-95'
                )}
              >
                {loading ? (
                  <>
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    {isTr ? 'Mimari Tasarlanıyor...' : 'Designing Architecture...'}
                  </>
                ) : (
                  <>
                    <Sparkles className="h-3.5 w-3.5" />
                    {isTr ? 'Mimariyi Tasarla' : 'Generate Architecture'}
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="flex items-center gap-2 rounded-[2px] border border-red-500/40 bg-red-950/30 p-3 text-xs font-mono text-red-400 animate-in fade-in duration-150">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Result Card */}
          {result && (
            <div className="rounded-[2px] border border-[#2B1A42] bg-[#120A21] p-5 shadow-xl space-y-3.5 animate-in fade-in zoom-in-95 duration-200">
              <div className="flex items-start justify-between">
                <div>
                  <h3
                    className="text-sm font-bold text-[#F5F3FF] flex items-center gap-1.5"
                    style={{ fontFamily: 'var(--font-serif, Georgia, serif)' }}
                  >
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                    {result.title}
                  </h3>
                  <p className="mt-1 text-xs text-[#A19BAF] leading-relaxed">
                    {result.explanation}
                  </p>
                </div>
              </div>

              {/* Modules list */}
              <div>
                <span className="text-[10px] font-mono uppercase tracking-wider text-[#8B7D9E]">
                  {isTr ? `Seçilen Servisler (${result.nodes.length} Düğüm):` : `Selected Services (${result.nodes.length} Nodes):`}
                </span>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {result.nodes.map((node) => {
                    const mod = MODULE_CATALOG.find((m) => m.id === node.moduleId);
                    return (
                      <span
                        key={node.id}
                        className="flex items-center gap-1.5 rounded-[2px] border border-[#2B1A42] bg-[#06030D] px-2.5 py-1 text-[11px] font-mono font-medium text-[#F5F3FF]"
                      >
                        <span
                          className="h-2 w-2 rounded-full"
                          style={{ background: mod?.color || '#8B5CF6' }}
                        />
                        <span>{mod?.name || node.moduleId}</span>
                      </span>
                    );
                  })}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-2 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={handleApplyMerge}
                  className="flex items-center justify-center gap-1.5 rounded-[2px] border border-[#2B1A42] bg-[#0D0719] px-3 py-2.5 text-xs font-mono font-semibold text-[#A19BAF] hover:border-[#8B5CF6] hover:text-[#F5F3FF] transition-all active:scale-95 shadow-sm"
                >
                  <Plus className="h-3.5 w-3.5" />
                  <span>{isTr ? 'Mevcut Tuvale Ekle (Merge)' : 'Add to Existing Canvas'}</span>
                  {nodeCount > 0 && (
                    <span className="ml-1 rounded-[2px] bg-[#1E1235] px-1.5 py-0.2 text-[10px] text-[#C084FC]">
                      +{nodeCount}
                    </span>
                  )}
                </button>
                <button
                  onClick={handleApplyReplace}
                  className="flex items-center justify-center gap-1.5 rounded-[2px] bg-[#8B5CF6] hover:bg-[#7C3AED] px-3 py-2.5 text-xs font-mono font-bold text-white transition-all shadow-md active:scale-95"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  <span>{isTr ? 'Tuvali Sıfırla & Yükle' : 'Reset Canvas & Load'}</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
