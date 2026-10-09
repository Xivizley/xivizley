'use client';

// ============================================================
// XIVIZLEY — Instagram Story Formatında (9:16) Homelab Kimlik Kartı
// components/modals/StoryCardModal.tsx
// Spotify Wrapped-style viral 1080x1920 Story Card generator
// ============================================================

import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import {
  X,
  Download,
  Copy,
  Check,
  Share2,
  Sparkles,
  Layers,
  Cpu,
  HardDrive,
  MemoryStick,
  ShieldCheck,
  ShieldAlert,
  Palette,
  BookOpen,
  Terminal,
  Server,
  Box,
  Home,
  Globe,
  Cloud,
  Image as ImageIcon,
  Play,
  Lock,
  KeyRound,
  Gamepad2,
  Car,
  ShieldBan,
  Shield,
  Network,
  LayoutDashboard,
  Tv,
  Activity,
  LayoutGrid,
  FolderSync,
  Film,
  Video,
  Workflow,
  ChefHat,
  Headphones,
  FileText,
  GitBranch,
  Database,
  Bot,
  Flame,
  CheckCircle2,
  type LucideIcon,
} from 'lucide-react';
import { toPng, toBlob } from 'html-to-image';
import { useArchitectStore } from '@/store/useArchitectStore';
import { MODULE_CATALOG } from '@/lib/data/modules';
import { calculateHardwareEstimate } from '@/lib/utils/hardwareEstimator';
import { auditStackSecurity } from '@/lib/utils/securityAuditor';
import { cn } from '@/lib/utils';

// ─── Lucide Icon Mapping ─────────────────────────────────────
const ICON_MAP: Record<string, LucideIcon> = {
  Server,
  Cpu,
  Container: Box,
  Box,
  Home,
  ShieldCheck,
  Globe,
  Cloud,
  FolderCloud: Cloud,
  Image: ImageIcon,
  Play,
  Lock,
  KeyRound,
  Gamepad2,
  Car,
  ShieldBan,
  Shield,
  Network,
  LayoutDashboard,
  Tv,
  Download,
  Activity,
  LayoutGrid,
  FolderSync,
  Film,
  Video,
  Workflow,
  ChefHat,
  Headphones,
  FileText,
  FilePdf: FileText,
  GitBranch,
  Database,
  Bot,
  Sparkles,
  Flame,
  HardDrive,
  BookOpen,
  Palette,
};

// ─── Official Instagram Icon SVG ─────────────────────────────
export function InstagramIcon({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
    </svg>
  );
}

// ─── Cyberpunk Decorative QR / Matrix Code ────────────────────
function CyberMatrixBadge({ theme, className = '' }: { theme: ThemeConfig; className?: string }) {
  return (
    <div
      className={cn('relative p-3 rounded-2xl bg-black/70 backdrop-blur-md border shadow-lg', className)}
      style={{ borderColor: `${theme.accentHex}50` }}
    >
      <div className="absolute top-1 left-1 w-2.5 h-2.5 border-t-2 border-l-2" style={{ borderColor: theme.accentHex }} />
      <div className="absolute top-1 right-1 w-2.5 h-2.5 border-t-2 border-r-2" style={{ borderColor: theme.accentHex }} />
      <div className="absolute bottom-1 left-1 w-2.5 h-2.5 border-b-2 border-l-2" style={{ borderColor: theme.accentHex }} />
      <div className="absolute bottom-1 right-1 w-2.5 h-2.5 border-b-2 border-r-2" style={{ borderColor: theme.accentHex }} />
      <svg viewBox="0 0 80 80" className="w-16 h-16 opacity-95" aria-hidden="true" style={{ fill: theme.accentHex }}>
        {/* Finder pattern Top-Left */}
        <rect x="0" y="0" width="24" height="24" rx="4" />
        <rect x="4" y="4" width="16" height="16" rx="2" fill="#070b14" />
        <rect x="8" y="8" width="8" height="8" rx="1" fill={theme.accentHex} />
        {/* Finder pattern Top-Right */}
        <rect x="56" y="0" width="24" height="24" rx="4" />
        <rect x="60" y="4" width="16" height="16" rx="2" fill="#070b14" />
        <rect x="64" y="8" width="8" height="8" rx="1" fill={theme.accentHex} />
        {/* Finder pattern Bottom-Left */}
        <rect x="0" y="56" width="24" height="24" rx="4" />
        <rect x="4" y="60" width="16" height="16" rx="2" fill="#070b14" />
        <rect x="8" y="64" width="8" height="8" rx="1" fill={theme.accentHex} />
        {/* Data bits */}
        <rect x="32" y="4" width="6" height="6" rx="1" />
        <rect x="42" y="12" width="6" height="6" rx="1" />
        <rect x="32" y="24" width="8" height="8" rx="1" />
        <rect x="44" y="26" width="6" height="6" rx="1" fill={theme.gradStops[1]} />
        <rect x="12" y="36" width="8" height="8" rx="1" fill={theme.gradStops[2]} />
        <rect x="28" y="38" width="6" height="6" rx="1" />
        <rect x="40" y="40" width="8" height="8" rx="1" />
        <rect x="54" y="36" width="6" height="6" rx="1" />
        <rect x="66" y="38" width="8" height="8" rx="1" />
        <rect x="32" y="56" width="6" height="6" rx="1" />
        <rect x="44" y="58" width="8" height="8" rx="1" fill={theme.accentHex} />
        <rect x="58" y="54" width="6" height="6" rx="1" />
        <rect x="68" y="66" width="8" height="8" rx="1" />
        <rect x="36" y="70" width="8" height="8" rx="1" />
      </svg>
    </div>
  );
}

// ─── Theme Presets ───────────────────────────────────────────
type ThemeKey = 'cyberpunk' | 'synthwave' | 'matrix' | 'obsidian';

interface ThemeConfig {
  key: ThemeKey;
  label: string;
  badge: string;
  bgHex: string;
  glowA: string;
  glowB: string;
  glowC: string;
  accentBorder: string;
  accentText: string;
  accentGradient: string;
  accentHex: string;
  gradStops: [string, string, string];
  cardBg: string;
  cardBorder: string;
}

const THEMES: Record<ThemeKey, ThemeConfig> = {
  cyberpunk: {
    key: 'cyberpunk',
    label: 'Cyber Neon',
    badge: '🌌 CYBERPUNK',
    bgHex: '#070b14',
    glowA: 'bg-cyan-500/25',
    glowB: 'bg-purple-600/30',
    glowC: 'bg-pink-500/15',
    accentBorder: 'border-cyan-400/50',
    accentText: 'text-cyan-400',
    accentGradient: 'from-cyan-400 via-indigo-300 to-purple-400',
    accentHex: '#00F2FE',
    gradStops: ['#00F2FE', '#818CF8', '#C084FC'],
    cardBg: 'bg-[#0d1424]/85',
    cardBorder: 'border-cyan-500/25',
  },
  synthwave: {
    key: 'synthwave',
    label: 'Synthwave Sunset',
    badge: '🌅 SYNTHWAVE',
    bgHex: '#0d0718',
    glowA: 'bg-pink-500/30',
    glowB: 'bg-amber-500/25',
    glowC: 'bg-purple-600/20',
    accentBorder: 'border-pink-400/50',
    accentText: 'text-pink-400',
    accentGradient: 'from-pink-400 via-rose-300 to-amber-400',
    accentHex: '#EC4899',
    gradStops: ['#F472B6', '#FB7185', '#FBBF24'],
    cardBg: 'bg-[#180e2b]/85',
    cardBorder: 'border-pink-500/25',
  },
  matrix: {
    key: 'matrix',
    label: 'Matrix Terminal',
    badge: '🟢 MATRIX',
    bgHex: '#040d08',
    glowA: 'bg-emerald-500/30',
    glowB: 'bg-teal-500/25',
    glowC: 'bg-green-600/15',
    accentBorder: 'border-emerald-400/50',
    accentText: 'text-emerald-400',
    accentGradient: 'from-emerald-400 via-teal-300 to-lime-400',
    accentHex: '#10B981',
    gradStops: ['#34D399', '#2DD4BF', '#A3E635'],
    cardBg: 'bg-[#081b11]/85',
    cardBorder: 'border-emerald-500/25',
  },
  obsidian: {
    key: 'obsidian',
    label: 'OLED Obsidian',
    badge: '⚡ OBSIDIAN',
    bgHex: '#000000',
    glowA: 'bg-sky-500/20',
    glowB: 'bg-slate-400/15',
    glowC: 'bg-blue-600/10',
    accentBorder: 'border-sky-400/40',
    accentText: 'text-sky-300',
    accentGradient: 'from-sky-300 via-slate-100 to-cyan-300',
    accentHex: '#38BDF8',
    gradStops: ['#7DD3FC', '#E2E8F0', '#67E8F9'],
    cardBg: 'bg-[#0a0d14]/90',
    cardBorder: 'border-slate-800',
  },
};

// ─── Default Sample Services for Empty Canvas ─────────────────
const SAMPLE_MODULES = [
  { id: 'plex', name: 'Plex Media Server', category: 'media', color: '#E5A00D', icon: 'Play', port: 32400 },
  { id: 'nginx-proxy-manager', name: 'Nginx Proxy Manager', category: 'proxy', color: '#009639', icon: 'Globe', port: 81 },
  { id: 'adguard-home', name: 'AdGuard Home', category: 'security', color: '#68BC71', icon: 'ShieldCheck', port: 53 },
  { id: 'nextcloud', name: 'Nextcloud Hub', category: 'storage', color: '#0082C9', icon: 'Cloud', port: 8080 },
  { id: 'vaultwarden', name: 'Vaultwarden', category: 'security', color: '#175DDC', icon: 'Lock', port: 80 },
  { id: 'immich', name: 'Immich Fotoğraf Yedek', category: 'media', color: '#4285F4', icon: 'Image', port: 2283 },
];

export interface StoryCardModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast?: ((type: 'success' | 'error' | 'info', title: string, desc?: string) => void) | undefined;
}

function computeDefaultStackTitle(nodeList: { data: { moduleId: string } }[]): string {
  if (nodeList.length === 0) return 'Ultimate Self-Host Stack';
  const hasMedia = nodeList.some((n) => n.data.moduleId.includes('plex') || n.data.moduleId.includes('jellyfin'));
  const hasSecurity = nodeList.some((n) => n.data.moduleId.includes('adguard') || n.data.moduleId.includes('vaultwarden'));
  if (hasMedia && hasSecurity) return '4K Medya & Siber Güvenlik Kalesi';
  if (hasMedia) return 'Ultra 4K Stream & Medya İstasyonu';
  if (hasSecurity) return 'Zero-Trust Güvenli Ev Bulutu';
  return `${nodeList.length} Servisli Self-Host Mimarisi`;
}

export function StoryCardModal({ isOpen, onClose, onToast }: StoryCardModalProps) {
  const nodes = useArchitectStore((s) => s.nodes);
  const conflictCount = useArchitectStore((s) => s.conflictMap.size);

  const cardRef = useRef<HTMLDivElement>(null);

  const [activeTheme, setActiveTheme] = useState<ThemeKey>('cyberpunk');
  const [customTitle, setCustomTitle] = useState<string | null>(null);
  const [architectName, setArchitectName] = useState('Alperen');
  const [isDownloading, setIsDownloading] = useState(false);
  const [isCopying, setIsCopying] = useState(false);
  const [isCopied, setIsCopied] = useState(false);
  const [isSharing, setIsSharing] = useState(false);

  // Dynamic preview scaling based on screen size
  const [previewScale, setPreviewScale] = useState(0.31);

  const theme = THEMES[activeTheme];

  // Fallback sample nodes for empty canvas preview calculation
  const sampleNodesFallback = useMemo(
    () => [
      { id: 'sample-plex', data: { moduleId: 'plex', label: 'Plex Media Server' } },
      { id: 'sample-npm', data: { moduleId: 'nginx-proxy-manager', label: 'Nginx Proxy Manager' } },
      { id: 'sample-adguard', data: { moduleId: 'adguard-home', label: 'AdGuard Home' } },
      { id: 'sample-nextcloud', data: { moduleId: 'nextcloud', label: 'Nextcloud Hub' } },
      { id: 'sample-vaultwarden', data: { moduleId: 'vaultwarden', label: 'Vaultwarden' } },
      { id: 'sample-immich', data: { moduleId: 'immich', label: 'Immich Fotoğraf Yedek' } },
    ],
    []
  );

  const effectiveNodes = useMemo(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    () => (nodes.length > 0 ? nodes : (sampleNodesFallback as any)),
    [nodes, sampleNodesFallback]
  );

  // Derive hardware estimation and security audit
  const hardware = useMemo(() => calculateHardwareEstimate(effectiveNodes), [effectiveNodes]);
  const security = useMemo(() => auditStackSecurity(effectiveNodes), [effectiveNodes]);

  // Derived title (either user-customized or smart default)
  const stackTitle = customTitle ?? computeDefaultStackTitle(effectiveNodes);

  // Generate unique stack ID hash deterministically from node IDs
  const stackHash = useMemo(() => {
    const raw = nodes.map((n) => n.id).join('-') || 'xivizley-default';
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      hash = (hash << 5) - hash + raw.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16).toUpperCase().padStart(6, '0').slice(0, 6);
  }, [nodes]);

  // Adjust preview scale for viewport
  useEffect(() => {
    const updateScale = () => {
      if (typeof window === 'undefined') return;
      const vh = window.innerHeight;
      const vw = window.innerWidth;
      const maxH = vw < 768 ? vh * 0.48 : Math.min(vh * 0.76, 680);
      const maxW = vw < 768 ? vw - 48 : 380;
      const calculated = Math.min(maxH / 1920, maxW / 1080);
      setPreviewScale(Math.max(0.18, Math.min(0.35, calculated)));
    };
    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, []);

  // Keyboard shortcut: Esc to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Process services list to render
  const servicesToRender = useMemo(() => {
    if (nodes.length === 0) {
      return SAMPLE_MODULES;
    }
    return nodes.map((node) => {
      const def = MODULE_CATALOG.find((m) => m.id === node.data.moduleId);
      const customPort = node.data.isCustom && node.data.customPorts && node.data.customPorts.length > 0
        ? node.data.customPorts[0]?.host
        : undefined;
      const firstPort = def?.ports && def.ports.length > 0 ? def.ports[0] : undefined;
      const defPort = firstPort
        ? (node.data.portOverrides?.[firstPort.internal] ?? firstPort.default)
        : undefined;
      const port = customPort ?? defPort;

      return {
        id: node.id,
        name: node.data.label || def?.name || 'Özel Konteyner',
        category: def?.category || (node.data.isCustom ? 'custom' : 'app'),
        color: def?.color || (node.data.isCustom ? '#00f2fe' : '#6366f1'),
        icon: def?.icon || 'Box',
        port,
      };
    });
  }, [nodes]);

  // Max 12 cards shown in grid to preserve perfect 9:16 layout
  const visibleServices = useMemo(() => {
    if (servicesToRender.length <= 12) return servicesToRender;
    return servicesToRender.slice(0, 11);
  }, [servicesToRender]);

  const hiddenCount = servicesToRender.length > 12 ? servicesToRender.length - 11 : 0;

  // ─── Export Handler: Download PNG (1080x1920) ────────────────
  const handleDownloadPng = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      setIsDownloading(true);
      const dataUrl = await toPng(cardRef.current, {
        width: 1080,
        height: 1920,
        canvasWidth: 1080,
        canvasHeight: 1920,
        pixelRatio: 1,
        backgroundColor: theme.bgHex,
      });
      const filename = `xivizley-story-${Date.now()}.png`;
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = filename;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      onToast?.(
        'success',
        'Story Kartı İndirildi! 📸',
        '1080x1920 kristal çözünürlüklü görsel hazır. Instagram Stories veya WhatsApp Durum\'da paylaşabilirsiniz!'
      );
    } catch (err) {
      console.error('[Story Export] Failed to generate PNG:', err);
      onToast?.('error', 'Dışa Aktarma Hatası', 'Görsel oluşturulurken bir problem yaşandı.');
    } finally {
      setIsDownloading(false);
    }
  }, [theme.bgHex, onToast]);

  // ─── Export Handler: Copy to Clipboard ──────────────────────
  const handleCopyImage = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      setIsCopying(true);
      const exportOptions = {
        width: 1080,
        height: 1920,
        canvasWidth: 1080,
        canvasHeight: 1920,
        pixelRatio: 1,
        backgroundColor: theme.bgHex,
      };

      if (navigator.clipboard && typeof ClipboardItem !== 'undefined') {
        try {
          // Modern Safari & Chromium: pass promise to preserve user activation gesture
          const blobPromise = toBlob(cardRef.current, exportOptions).then((b) => {
            if (!b) throw new Error('Blob oluşturulamadı.');
            return b;
          });
          const item = new ClipboardItem({ 'image/png': blobPromise });
          await navigator.clipboard.write([item]);
        } catch {
          // Fallback for older browsers: await blob before creating ClipboardItem
          const blob = await toBlob(cardRef.current, exportOptions);
          if (!blob) throw new Error('Blob oluşturulamadı.');
          await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
        }

        setIsCopied(true);
        onToast?.(
          'success',
          'Panoya Kopyalandı! 📋',
          'Kimlik kartı panoya kopyalandı. Instagram Web veya WhatsApp Web\'e doğrudan Ctrl+V ile yapıştırabilirsiniz!'
        );
        setTimeout(() => setIsCopied(false), 3000);
      } else {
        // Fallback: trigger standard download
        await handleDownloadPng();
      }
    } catch (err) {
      console.error('[Story Export] Failed to copy image:', err);
      // Gracefully fall back to download if clipboard write is blocked by browser permissions
      await handleDownloadPng();
      onToast?.('info', 'Görsel İndirildi', 'Tarayıcınız panoya kopyalamayı kısıtladığı için görsel otomatik olarak cihazınıza indirildi.');
    } finally {
      setIsCopying(false);
    }
  }, [theme.bgHex, handleDownloadPng, onToast]);

  // ─── Export Handler: Mobile Web Share API ───────────────────
  const handleShareMobile = useCallback(async () => {
    if (!cardRef.current) return;
    try {
      setIsSharing(true);
      const blob = await toBlob(cardRef.current, {
        width: 1080,
        height: 1920,
        canvasWidth: 1080,
        canvasHeight: 1920,
        pixelRatio: 1,
        backgroundColor: theme.bgHex,
      });
      if (!blob) throw new Error('Blob oluşturulamadı.');

      const file = new File([blob], `xivizley-story-${Date.now()}.png`, { type: 'image/png' });
      if (typeof navigator !== 'undefined' && navigator.canShare && navigator.canShare({ files: [file] })) {
        await navigator.share({
          files: [file],
          title: 'XIVIZLEY Mimari Kimlik Kartı',
          text: 'Kendi Self-Host mimarini görsel olarak tasarla: https://xivizley.com.tr @xivizley',
        });
        onToast?.('success', 'Paylaşıldı! 🚀', 'Paylaşım menüsü açıldı.');
        return;
      }
      await handleDownloadPng();
    } catch (err: unknown) {
      const error = err as { name?: string };
      if (error?.name !== 'AbortError') {
        console.error('[Story Export] Mobile share error:', err);
        await handleDownloadPng();
      }
    } finally {
      setIsSharing(false);
    }
  }, [theme.bgHex, handleDownloadPng, onToast]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="story-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/90 backdrop-blur-xl animate-in fade-in duration-200 overflow-y-auto"
    >
      {/* Background ambient spots */}
      <div className="fixed -top-40 -right-40 w-96 h-96 bg-cyan-500/15 rounded-full blur-3xl pointer-events-none" />
      <div className="fixed -bottom-40 -left-40 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="relative w-full max-w-5xl rounded-3xl border border-slate-800/90 bg-[#0a0e1a]/95 shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Modal Top Bar */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80 bg-[#0c1222]/80 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-tr from-pink-500/20 to-purple-500/20 border border-pink-500/40 text-pink-400">
              <InstagramIcon className="h-4 w-4" />
            </div>
            <div>
              <h2 id="story-modal-title" className="text-sm sm:text-base font-extrabold text-white flex items-center gap-2">
                Instagram Story Mimari Kimlik Kartı
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-pink-500/10 border border-pink-500/30 text-pink-300">
                  9:16 (1080x1920)
                </span>
              </h2>
              <p className="text-xs text-slate-400 hidden sm:block">
                Spotify Wrapped tarzı viral dikey görsel. Stories, WhatsApp ve TikTok için hazır!
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Kapat (Esc)"
            aria-label="Kapat"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Content Body: 2 Columns on Desktop */}
        <div className="flex-1 flex flex-col md:flex-row overflow-y-auto md:overflow-hidden">
          {/* Left Column: Scaled Story Card Live Preview */}
          <div className="flex-1 flex flex-col items-center justify-center p-4 sm:p-6 bg-[#070b14]/90 overflow-y-auto border-b md:border-b-0 md:border-r border-slate-800/80">
            {nodes.length === 0 && (
              <div className="mb-3 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-[11px] font-medium flex items-center gap-1.5 max-w-sm text-center">
                <Sparkles className="h-3.5 w-3.5 shrink-0" />
                <span>Tuvaliniz henüz boş. Aşağıda örnek önizleme gösterilmektedir.</span>
              </div>
            )}

            {/* Simulated Phone Frame with Glowing Glass */}
            <div
              className="relative rounded-[28px] p-2 bg-gradient-to-b from-slate-700/60 via-slate-800/40 to-slate-900/80 shadow-2xl border border-white/10 ring-1 ring-cyan-500/30 transition-transform duration-200"
              style={{
                width: Math.round(1080 * previewScale) + 16,
                height: Math.round(1920 * previewScale) + 16,
              }}
            >
              {/* Phone Speaker Notch */}
              <div className="absolute top-3.5 left-1/2 -translate-x-1/2 w-16 h-1.5 bg-slate-700/80 rounded-full z-20 pointer-events-none" />

              {/* Viewport Clipping Box */}
              <div
                className="relative overflow-hidden rounded-[20px] bg-[#070b14]"
                style={{
                  width: Math.round(1080 * previewScale),
                  height: Math.round(1920 * previewScale),
                }}
              >
                {/* Scaled Inner Wrapper */}
                <div
                  style={{
                    width: '1080px',
                    height: '1920px',
                    transform: `scale(${previewScale})`,
                    transformOrigin: 'top left',
                  }}
                >
                  {/* ──────────────────────────────────────────────────────────
                      ACTUAL 1080x1920 CARD (Target for html-to-image capture)
                      ────────────────────────────────────────────────────────── */}
                  <div
                    ref={cardRef}
                    style={{
                      width: '1080px',
                      height: '1920px',
                      backgroundColor: theme.bgHex,
                    }}
                    className={cn(
                      'relative flex flex-col justify-between overflow-hidden select-none',
                      'p-16 text-slate-100 font-sans'
                    )}
                  >
                    {/* Background Neon Glows */}
                    <div className={cn('absolute -top-36 -right-36 w-[620px] h-[620px] rounded-full blur-[130px] pointer-events-none', theme.glowA)} />
                    <div className={cn('absolute -bottom-36 -left-36 w-[620px] h-[620px] rounded-full blur-[130px] pointer-events-none', theme.glowB)} />
                    <div className={cn('absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[540px] h-[540px] rounded-full blur-[150px] pointer-events-none', theme.glowC)} />

                    {/* Cyber Grid Pattern Overlay */}
                    <div
                      className="absolute inset-0 opacity-[0.07] pointer-events-none"
                      style={{
                        backgroundImage: `linear-gradient(to right, #ffffff 1px, transparent 1px), linear-gradient(to bottom, #ffffff 1px, transparent 1px)`,
                        backgroundSize: '48px 48px',
                      }}
                    />

                    {/* Corner HUD Brackets */}
                    <div className="absolute top-8 left-8 text-cyan-400/50 font-mono text-xl pointer-events-none font-bold">┌ &nbsp; ┐</div>
                    <div className="absolute top-8 right-8 text-cyan-400/50 font-mono text-xl pointer-events-none font-bold">┌ &nbsp; ┐</div>
                    <div className="absolute bottom-8 left-8 text-cyan-400/50 font-mono text-xl pointer-events-none font-bold">└ &nbsp; ┘</div>
                    <div className="absolute bottom-8 right-8 text-cyan-400/50 font-mono text-xl pointer-events-none font-bold">└ &nbsp; ┘</div>

                    {/* ── 1. Top HUD Status Bar ── */}
                    <div className="relative z-10 flex items-center justify-between pb-6 border-b border-white/10 text-slate-400 font-mono text-sm tracking-widest uppercase">
                      <div className="flex items-center gap-2">
                        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/80" />
                        <span className="text-white font-bold">ID: #XIV-{stackHash}</span>
                        <span className="text-slate-600">/</span>
                        <span className="text-cyan-400">SELF-HOST IDENTITY</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-slate-300 font-semibold text-xs">
                          {theme.badge}
                        </span>
                        <span className="text-slate-400">{new Date().toLocaleDateString('tr-TR')}</span>
                      </div>
                    </div>

                    {/* ── 2. Branding & Stack Header ── */}
                    <div className="relative z-10 my-4">
                      {/* Top Tiny Pill */}
                      <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/15 text-xs font-mono font-bold tracking-wider text-slate-300 mb-4 backdrop-blur-md">
                        <Sparkles className="h-4 w-4 text-cyan-400" />
                        <span>OFFICIAL SELF-HOST ARCHITECTURE</span>
                      </div>

                      {/* Main Title & Brand */}
                      <div className="flex items-baseline justify-between gap-4">
                        <div>
                          <div className="h-[76px] flex items-center">
                            <svg className="w-[360px] h-[76px]" viewBox="0 0 360 76" fill="none" aria-label="XIVIZLEY">
                              <defs>
                                <linearGradient id={`brand-grad-${activeTheme}`} x1="0%" y1="0%" x2="100%" y2="0%">
                                  <stop offset="0%" stopColor={theme.gradStops[0]} />
                                  <stop offset="50%" stopColor={theme.gradStops[1]} />
                                  <stop offset="100%" stopColor={theme.gradStops[2]} />
                                </linearGradient>
                              </defs>
                              <text
                                x="0"
                                y="60"
                                fill={`url(#brand-grad-${activeTheme})`}
                                style={{
                                  fontFamily: 'var(--font-sans), "Plus Jakarta Sans", system-ui, sans-serif',
                                  fontSize: '68px',
                                  fontWeight: 900,
                                  letterSpacing: '-0.03em',
                                  textTransform: 'uppercase',
                                }}
                              >
                                XIVIZLEY
                              </text>
                            </svg>
                          </div>
                          <p className="text-2xl font-bold text-slate-300 tracking-wide mt-1">
                            SELF-HOST KİMLİK KARTI
                          </p>
                        </div>
                        <div className="text-right">
                          <div className="px-5 py-2 rounded-2xl bg-black/60 border border-white/15 font-mono text-right backdrop-blur-md">
                            <span className="text-xs text-slate-400 block">MİMAR</span>
                            <span className="text-xl font-bold text-white tracking-wide">
                              @{architectName || 'xivizley'}
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* User Custom Stack Title */}
                      <div className="mt-5 p-5 rounded-3xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
                        <span className="text-xs font-mono tracking-widest text-slate-400 uppercase block mb-1">
                          STACK BAŞLIĞI
                        </span>
                        <h3 className="text-3xl font-extrabold text-white leading-tight">
                          {stackTitle || 'Özel Self-Host Mimarisi'}
                        </h3>
                        <p className="text-sm font-medium text-slate-400 mt-1 flex items-center gap-2">
                          <span>Docker Compose v2</span>
                          <span>•</span>
                          <span>İzole Köprü Ağı</span>
                          <span>•</span>
                          <span className="text-cyan-400">1-Tık Kurulabilir</span>
                        </p>
                      </div>
                    </div>

                    {/* ── 3. High-Impact Stat Matrix (4 Stat Cards) ── */}
                    <div className="relative z-10 grid grid-cols-4 gap-4 my-2">
                      {/* Stat 1: Total Services */}
                      <div className="rounded-3xl bg-[#0c1222]/90 border border-white/10 p-5 text-center flex flex-col justify-between backdrop-blur-md shadow-xl">
                        <div className="flex items-center justify-center text-cyan-400 mb-2">
                          <Layers className="h-7 w-7" />
                        </div>
                        <div>
                          <div className="text-4xl font-black font-mono text-white">
                            {servicesToRender.length}
                          </div>
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">
                            Toplam Servis
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-cyan-300 mt-2 block">
                          Konteyner / Host
                        </span>
                      </div>

                      {/* Stat 2: Estimated RAM */}
                      <div className="rounded-3xl bg-[#0c1222]/90 border border-white/10 p-5 text-center flex flex-col justify-between backdrop-blur-md shadow-xl">
                        <div className="flex items-center justify-center text-emerald-400 mb-2">
                          <MemoryStick className="h-7 w-7" />
                        </div>
                        <div>
                          <div className="text-4xl font-black font-mono text-white">
                            {hardware.totalRamGB} <span className="text-xl">GB</span>
                          </div>
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">
                            Tahmini RAM
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-300 mt-2 block">
                          Önerilen Bellek
                        </span>
                      </div>

                      {/* Stat 3: CPU Cores */}
                      <div className="rounded-3xl bg-[#0c1222]/90 border border-white/10 p-5 text-center flex flex-col justify-between backdrop-blur-md shadow-xl">
                        <div className="flex items-center justify-center text-purple-400 mb-2">
                          <Cpu className="h-7 w-7" />
                        </div>
                        <div>
                          <div className="text-4xl font-black font-mono text-white">
                            {hardware.totalCpuCores} <span className="text-xl">Core</span>
                          </div>
                          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider mt-1">
                            CPU Gücü
                          </div>
                        </div>
                        <span className="text-[10px] font-mono text-purple-300 mt-2 block">
                          İşlemci Çekirdeği
                        </span>
                      </div>

                      {/* Stat 4: Port Conflict Status */}
                      <div
                        className={cn(
                          'rounded-3xl border p-5 text-center flex flex-col justify-between backdrop-blur-md shadow-xl',
                          conflictCount === 0
                            ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300'
                            : 'bg-red-950/40 border-red-500/40 text-red-300'
                        )}
                      >
                        <div className="flex items-center justify-center mb-2">
                          {conflictCount === 0 ? (
                            <ShieldCheck className="h-7 w-7 text-emerald-400" />
                          ) : (
                            <ShieldAlert className="h-7 w-7 text-red-400" />
                          )}
                        </div>
                        <div>
                          <div className="text-3xl font-black font-mono">
                            {conflictCount === 0 ? '%100' : `${conflictCount}`}
                          </div>
                          <div className="text-xs font-bold uppercase tracking-wider mt-1">
                            {conflictCount === 0 ? 'Sıfır Çakışma' : 'Port Çakışması'}
                          </div>
                        </div>
                        <span className="text-[10px] font-mono opacity-80 mt-2 block">
                          {conflictCount === 0 ? 'Tam Uyumlu Port' : 'Çözüm Gerekli'}
                        </span>
                      </div>
                    </div>

                    {/* Hardware Recommendation Pill */}
                    <div className="relative z-10 flex items-center justify-between px-6 py-3 rounded-2xl bg-white/[0.04] border border-white/10 text-xs font-mono text-slate-300 backdrop-blur-md">
                      <div className="flex items-center gap-2">
                        <Server className="h-4 w-4 text-cyan-400" />
                        <span>
                          <strong>Önerilen Donanım:</strong> {hardware.recommendation.title}
                        </span>
                      </div>
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1.5 text-amber-300">
                          <HardDrive className="h-3.5 w-3.5" />
                          <span>{hardware.totalDiskGB} GB Disk</span>
                        </span>
                        <span>•</span>
                        <span className="flex items-center gap-1.5 text-emerald-400 font-bold">
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          <span>Güvenlik: {security.score}/100 ({security.grade})</span>
                        </span>
                      </div>
                    </div>

                    {/* ── 4. Active Services Grid (Badges) ── */}
                    <div className="relative z-10 my-4 flex-1 flex flex-col justify-center">
                      <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
                        <span className="text-sm font-mono font-bold tracking-widest text-slate-300 uppercase flex items-center gap-2">
                          <Terminal className="h-4 w-4 text-cyan-400" />
                          <span>YÜKLÜ SELF-HOST MODÜLLERİ</span>
                        </span>
                        <span className="text-xs font-mono px-3 py-0.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 font-bold">
                          {servicesToRender.length} MODÜL DEVREDE
                        </span>
                      </div>

                      {/* Responsive Dynamic Badge Grid */}
                      <div
                        className={cn(
                          'grid gap-3.5',
                          visibleServices.length === 1
                            ? 'grid-cols-1 max-w-lg mx-auto w-full'
                            : visibleServices.length === 2 || visibleServices.length === 4
                            ? 'grid-cols-2'
                            : 'grid-cols-3'
                        )}
                      >
                        {visibleServices.map((svc) => {
                          const IconComp = ICON_MAP[svc.icon] || Server;
                          return (
                            <div
                              key={svc.id}
                              className="relative group flex items-center gap-3.5 p-3.5 rounded-2xl bg-[#0c1222]/90 border border-white/10 backdrop-blur-md shadow-lg overflow-hidden transition-all"
                              style={{
                                borderColor: `${svc.color}40`,
                              }}
                            >
                              {/* Left Icon with Brand Color Glow */}
                              <div
                                className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border shadow-md"
                                style={{
                                  backgroundColor: `${svc.color}1A`,
                                  borderColor: `${svc.color}60`,
                                  color: svc.color,
                                }}
                              >
                                <IconComp className="h-5 w-5" />
                              </div>

                              {/* Details */}
                              <div className="min-w-0 flex-1">
                                <h4 className="text-sm font-bold text-white truncate tracking-tight">
                                  {svc.name}
                                </h4>
                                <div className="flex items-center gap-2 mt-0.5">
                                  <span className="text-[10px] font-mono uppercase px-1.5 py-0.2 rounded bg-white/5 text-slate-400 border border-white/10">
                                    {svc.category}
                                  </span>
                                  {svc.port !== undefined && svc.port !== null && (
                                    <span className="text-[11px] font-mono font-bold text-cyan-300">
                                      :{svc.port}
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                          );
                        })}

                        {/* Extra services badge if more than 12 */}
                        {hiddenCount > 0 && (
                          <div className="flex items-center justify-center gap-2 p-3.5 rounded-2xl bg-cyan-950/30 border border-cyan-500/40 text-center font-mono">
                            <Layers className="h-5 w-5 text-cyan-400" />
                            <span className="text-sm font-bold text-cyan-300">
                              +{hiddenCount} DİĞER SERVİS
                            </span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* ── 5. Cyber Arch Spec Stamp ── */}
                    <div className="relative z-10 py-3 px-6 rounded-2xl bg-black/50 border border-white/10 flex items-center justify-between font-mono text-xs text-slate-400">
                      <span className="flex items-center gap-2 text-slate-300">
                        <span className="h-2 w-2 rounded-full bg-cyan-400" />
                        <span>ZERO-CONFLICT ENGINE</span>
                      </span>
                      <span>•</span>
                      <span>REVERSE PROXY & AUTOMATIC SSL</span>
                      <span>•</span>
                      <span className="text-cyan-400 font-bold">XIVIZLEY.COM.TR</span>
                    </div>

                    {/* ── 6. Viral Promo Footer ── */}
                    <div className="relative z-10 pt-6 mt-4 border-t border-white/10 flex items-center justify-between">
                      {/* Left: Instagram & Platform URL */}
                      <div>
                        <div className="flex items-center gap-2.5 mb-1.5">
                          <span className="flex h-7 w-7 items-center justify-center rounded-xl bg-gradient-to-tr from-pink-500 to-purple-600 text-white shadow-lg shadow-pink-500/30">
                            <InstagramIcon className="h-4 w-4" />
                          </span>
                          <span className="text-2xl font-black text-pink-400 tracking-tight">
                            @xivizley
                          </span>
                          <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-pink-500/20 text-pink-300 border border-pink-500/30">
                            Story&apos;de Etiketle ⚡
                          </span>
                        </div>
                        <p className="text-sm font-medium text-slate-400">
                          Kendi Self-Host mimarini ücretsiz görsel olarak tasarla:
                        </p>
                        <p className="text-2xl font-mono font-black text-cyan-300 tracking-tight mt-0.5">
                          xivizley.com.tr
                        </p>
                      </div>

                      {/* Right: Cyber Matrix Code */}
                      <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                          <span className="text-[10px] font-mono text-slate-500 block uppercase">
                            MİMARİ DOĞRULANDI
                          </span>
                          <span className="text-xs font-mono font-bold text-slate-300 block">
                            SCAN TO DEPLOY
                          </span>
                          <span className="text-[9px] font-mono text-cyan-400">
                            #XIV-STORY-V2
                          </span>
                        </div>
                        <CyberMatrixBadge theme={theme} />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p className="mt-3 text-[11px] text-slate-500 text-center font-mono">
              💡 Tam çözünürlük 1080x1920 kristal PNG olarak dışa aktarılır.
            </p>
          </div>

          {/* Right Column: Customization Controls & Download Studio */}
          <div className="w-full md:w-80 lg:w-96 p-5 sm:p-6 bg-[#0c111e]/95 flex flex-col justify-between overflow-y-auto space-y-5 shrink-0">
            {/* Control Panel Header */}
            <div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-300 text-xs font-bold mb-3">
                <Palette className="h-3.5 w-3.5 text-cyan-400" />
                <span>KARTINI ÖZELLEŞTİR</span>
              </div>
              <h3 className="text-lg font-bold text-white">
                Story Kartını Kişiselleştir
              </h3>
              <p className="text-xs text-slate-400 mt-1">
                Arkadaşlarınla paylaşmadan önce başlığını, mimar adını ve görsel temasını belirle.
              </p>
            </div>

            {/* Controls Form */}
            <div className="space-y-4 text-xs">
              {/* Stack Title Input */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Stack / Mimari Başlığı
                </label>
                <input
                  type="text"
                  value={stackTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                  maxLength={48}
                  placeholder="Örn: 4K Medya & Bulut Kalesi"
                  className="w-full px-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-medium transition-all"
                />
              </div>

              {/* Architect Name Input */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Mimar Adı veya Instagram Kullanıcı Adı
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-slate-500 font-mono">@</span>
                  <input
                    type="text"
                    value={architectName}
                    onChange={(e) => setArchitectName(e.target.value.replace(/[@\s]/g, ''))}
                    maxLength={24}
                    placeholder="architect"
                    className="w-full pl-7 pr-3 py-2 rounded-xl bg-slate-900/90 border border-slate-700 text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400 font-mono transition-all"
                  />
                </div>
              </div>

              {/* Theme Vibe Selector */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5">
                  Görsel Tema & Neon Havası
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {(Object.keys(THEMES) as ThemeKey[]).map((key) => {
                    const th = THEMES[key];
                    const isSelected = activeTheme === key;
                    return (
                      <button
                        key={key}
                        onClick={() => setActiveTheme(key)}
                        className={cn(
                          'flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all',
                          isSelected
                            ? 'bg-slate-800 border-cyan-400 text-white shadow-md ring-1 ring-cyan-400/50'
                            : 'bg-slate-900/70 border-slate-800 text-slate-400 hover:bg-slate-800/80 hover:text-slate-200'
                        )}
                      >
                        <span
                          className="h-3.5 w-3.5 rounded-full border border-white/20 shrink-0"
                          style={{ backgroundColor: th.bgHex === '#000000' ? '#38bdf8' : th.bgHex }}
                        />
                        <span className="truncate font-medium">{th.label}</span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Action Buttons Studio */}
            <div className="space-y-2.5 pt-4 border-t border-slate-800/80">
              {/* Primary: Download PNG 1080x1920 */}
              <button
                onClick={handleDownloadPng}
                disabled={isDownloading}
                className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-2xl font-extrabold text-xs text-white bg-gradient-to-r from-pink-600 via-purple-600 to-cyan-500 hover:from-pink-500 hover:to-cyan-400 active:scale-[0.98] transition-all shadow-lg shadow-pink-500/20 disabled:opacity-50"
              >
                <Download className="h-4 w-4" />
                <span>{isDownloading ? 'Oluşturuluyor...' : 'Story Görselini İndir (1080x1920)'}</span>
              </button>

              {/* Secondary: Copy to Clipboard */}
              <button
                onClick={handleCopyImage}
                disabled={isCopying}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl font-bold text-xs text-slate-200 bg-slate-800/90 hover:bg-slate-700/90 border border-slate-700 active:scale-[0.98] transition-all disabled:opacity-50"
              >
                {isCopied ? (
                  <>
                    <Check className="h-4 w-4 text-emerald-400" />
                    <span className="text-emerald-400">Panoya Kopyalandı!</span>
                  </>
                ) : (
                  <>
                    <Copy className="h-4 w-4 text-slate-400" />
                    <span>{isCopying ? 'Kopyalanıyor...' : 'Resmi Panoya Kopyala'}</span>
                  </>
                )}
              </button>

              {/* Tertiary: Mobile Native Share (if supported) */}
              {typeof navigator !== 'undefined' && typeof navigator.canShare === 'function' && (
                <button
                  onClick={handleShareMobile}
                  disabled={isSharing}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-2xl font-bold text-xs text-cyan-300 bg-cyan-950/40 hover:bg-cyan-900/50 border border-cyan-500/40 active:scale-[0.98] transition-all disabled:opacity-50"
                >
                  <Share2 className="h-4 w-4" />
                  <span>{isSharing ? 'Açılıyor...' : 'Instagram / Durumda Paylaş'}</span>
                </button>
              )}
            </div>

            {/* Instagram Community Callout */}
            <div className="p-3.5 rounded-2xl bg-gradient-to-tr from-pink-950/30 to-purple-950/20 border border-pink-500/25 text-[11px] text-slate-300">
              <div className="flex items-center gap-2 text-pink-400 font-bold mb-1">
                <InstagramIcon className="h-3.5 w-3.5" />
                <span>Bizi Etiketle, Repost Edelim!</span>
              </div>
              <p className="text-slate-400 leading-relaxed">
                Hikayeni paylaşırken <strong className="text-white">@xivizley</strong> hesabını etiketle; mimarini topluluğumuzla paylaşalım!
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
