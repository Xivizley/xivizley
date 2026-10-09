'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import {
  Compass,
  Sparkles,
  Rocket,
  Save,
  Share2,
  FileUp,
  Command,
  BookOpen,
  Camera,
  Terminal,
  Wrench,
  Box,
  ChevronDown,
  LifeBuoy,
  Globe,
  Radio,
  Boxes,
  Menu,
  X,
  ArrowRight,
  Gift,
  FileText,
  Crown,
} from 'lucide-react';
import { usePathname } from 'next/navigation';
import { signOut, useSession } from 'next-auth/react';
import { useI18nStore, useTranslation } from '@/lib/i18n/store';
import { useArchitectStore } from '@/store/useArchitectStore';
import { useLiveAgentStore } from '@/store/useLiveAgentStore';
import { PLATFORM_STATS } from '@/lib/constants/stats';
import { ThemeSelector } from './ThemeSelector';
import { exportCanvasAsPng } from '@/lib/utils/exportCanvasImage';
import { openLeadMagnetModal } from './LeadMagnetModal';
import { InstagramIcon } from '@/components/modals/StoryCardModal';

interface NavbarProps {
  conflictCount?: number;
  onOpenAI?: () => void;
  onOpenDeploy?: () => void;
  onOpenBlueprint?: () => void;
  onOpenImport?: () => void;
  onOpenAIDoctor?: () => void;
  onOpenCustomContainer?: () => void;
  onOpenCommandPalette?: () => void;
  onOpenTerminalSimulator?: () => void;
  onOpenPro?: () => void;
  onOpenDomainWizard?: () => void;
  onOpenLiveAgent?: () => void;
  onOpenShare?: () => void;
  onOpenStoryCard?: (() => void) | undefined;
  onOpenStackPacks?: () => void;
  onToast?: ((type: 'success' | 'error' | 'info', title: string, desc?: string) => void) | undefined;
}

export function Navbar({
  conflictCount = 0,
  onOpenAI,
  onOpenDeploy,
  onOpenBlueprint,
  onOpenImport,
  onOpenAIDoctor,
  onOpenCustomContainer,
  onOpenCommandPalette,
  onOpenTerminalSimulator,
  onOpenPro,
  onOpenDomainWizard,
  onOpenLiveAgent,
  onOpenShare,
  onOpenStoryCard,
  onOpenStackPacks,
  onToast,
}: NavbarProps) {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const isArchitect = pathname === '/architect' || !!onOpenDeploy || !!onOpenAI;

  const { data: session } = useSession();
  const { t } = useTranslation();
  const { lang, setLang } = useI18nStore();
  const isTr = lang === 'tr';
  const isPt = lang === 'pt';

  const [isToolsOpen, setIsToolsOpen] = useState(false);
  const toolsRef = useRef<HTMLDivElement>(null);

  const exportToJson = useArchitectStore((s) => s.exportToJson);
  const nodes = useArchitectStore((s) => s.nodes);

  const isLiveConnected = useLiveAgentStore((s) => s.isConnected);
  const liveStats = useLiveAgentStore((s) => s.stats);

  // Close tools dropdown on outside click
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (toolsRef.current && !toolsRef.current.contains(e.target as Node)) {
        setIsToolsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, []);

  const handleSave = () => {
    if (nodes.length === 0) {
      onToast?.(
        'error',
        isTr ? 'Canvas boş' : isPt ? 'Canvas vazio' : 'Canvas is empty',
        isTr ? 'Kaydetmek için en az bir modül ekleyin.' : isPt ? 'Adicione pelo menos um módulo antes de salvar.' : 'Add at least one module before saving.'
      );
      return;
    }
    const json = exportToJson();
    localStorage.setItem('xivizley_autosave', json);
    onToast?.(
      'success',
      isTr ? 'Kaydedildi!' : isPt ? 'Salvo!' : 'Saved!',
      isTr ? 'Canvas yerel depolama alanına kaydedildi.' : isPt ? 'Canvas salvo no armazenamento local.' : 'Canvas saved to local storage.'
    );
  };

  const handleShare = () => {
    if (nodes.length === 0) {
      onToast?.(
        'error',
        isTr ? 'Canvas boş' : isPt ? 'Canvas vazio' : 'Canvas is empty',
        isTr ? 'Paylaşmak için en az bir modül ekleyin.' : isPt ? 'Adicione pelo menos um módulo antes de compartilhar.' : 'Add at least one module before sharing.'
      );
      return;
    }
    try {
      const json = exportToJson();
      const base64 = btoa(unescape(encodeURIComponent(json)))
        .replace(/\+/g, '-')
        .replace(/\//g, '_')
        .replace(/=/g, '');
      const url = `${window.location.origin}/architect?canvas=${base64}`;
      navigator.clipboard.writeText(url);
      onToast?.(
        'info',
        isTr ? 'Bağlantı kopyalandı!' : isPt ? 'Link copiado!' : 'Link copied!',
        isTr ? "Paylaşım URL'i panoya kopyalandı." : isPt ? 'URL de compartilhamento copiada para a área de transferência.' : 'Share URL copied to clipboard.'
      );
    } catch {
      onToast?.(
        'error',
        isTr ? 'Hata' : isPt ? 'Erro' : 'Error',
        isTr ? 'URL oluşturulamadı.' : isPt ? 'Não foi possível gerar a URL.' : 'Could not generate URL.'
      );
    }
  };

  const handleExportImage = async () => {
    if (nodes.length === 0) {
      onToast?.(
        'error',
        isTr ? 'Canvas boş' : isPt ? 'Canvas vazio' : 'Canvas is empty',
        isTr ? 'Görsel indirmek için en az bir modül ekleyin.' : isPt ? 'Adicione pelo menos um módulo antes de baixar.' : 'Add at least one module before downloading.'
      );
      return;
    }
    try {
      await exportCanvasAsPng('xivizley-architecture.png');
      onToast?.(
        'success',
        isTr ? 'Görsel İndirildi!' : isPt ? 'Imagem Baixada!' : 'Image Downloaded!',
        isTr ? 'Mimari şeması PNG olarak kaydedildi.' : isPt ? 'Diagrama de arquitetura salvo como PNG.' : 'Architecture diagram saved as PNG.'
      );
    } catch {
      onToast?.(
        'error',
        isTr ? 'Hata' : isPt ? 'Erro' : 'Error',
        isTr ? 'Görsel oluşturulamadı.' : isPt ? 'Não foi possível exportar a imagem.' : 'Could not export image.'
      );
    }
  };

  return (
    <header className="sticky top-0 z-50 shrink-0 w-full border-b border-[#2B1A42] bg-[#090514]/95 backdrop-blur-md">
      <nav
        className="flex h-14 shrink-0 items-center justify-between px-3 sm:px-6"
        aria-label={isTr ? "Ana menü" : "Main menu"}
      >
        {/* ── Left: Logo & Navigation ── */}
        <div className="flex items-center gap-3 sm:gap-6 shrink-0">
          <Link
            href="/"
            className="flex items-center shrink-0 min-w-[130px] sm:min-w-[155px] hover:opacity-90 transition-opacity"
            aria-label={isTr ? "XIVIZLEY ana sayfası" : "XIVIZLEY home page"}
          >
            <Image
              src="/xivizley-logo.png"
              alt="XIVIZLEY"
              width={160}
              height={38}
              className="h-8 sm:h-9 w-[130px] sm:w-[155px] object-contain shrink-0"
              priority
              unoptimized
            />
          </Link>

          {/* Navigation Links */}
          <div className="hidden md:flex items-center gap-1 pl-4 border-l border-[#2B1A42]" role="list">
            <Link
              href="/suite"
              className={cn(
                "flex items-center gap-1.5 rounded-[2px] px-2.5 py-1 text-xs font-mono font-semibold transition-all shrink-0 border",
                pathname === '/suite'
                  ? "bg-[#1E1235] text-[#8B5CF6] border-[#8B5CF6]"
                  : "bg-[#120A21] text-[#F5F3FF] border-[#2B1A42] hover:bg-[#1E1235] hover:text-[#C084FC] hover:border-[#8B5CF6] active:text-[#8B5CF6]"
              )}
              role="listitem"
            >
              <Sparkles className="h-3.5 w-3.5 text-[#C084FC]" />
              <span>Suite</span>
              <span className="rounded-[2px] bg-[#120A21] border border-[#2B1A42] px-1.5 py-0.5 text-[9px] font-mono font-bold text-[#C084FC]">
                {PLATFORM_STATS.suiteStage}
              </span>
            </Link>

            <Link
              href="/templates"
              className={cn(
                "flex items-center gap-1.5 rounded-[2px] px-2.5 py-1 text-xs font-mono font-semibold transition-all shrink-0 border",
                pathname === '/templates'
                  ? "bg-[#1E1235] text-[#8B5CF6] border-[#8B5CF6]"
                  : "bg-[#120A21] text-[#F5F3FF] border-[#2B1A42] hover:bg-[#1E1235] hover:text-[#C084FC] hover:border-[#8B5CF6] active:text-[#8B5CF6]"
              )}
              role="listitem"
            >
              <Boxes className="h-3.5 w-3.5 text-[#C084FC]" />
              <span>{isTr ? 'Şablonlar' : isPt ? 'Modelos' : 'Templates'}</span>
              <span className="rounded-[2px] bg-[#120A21] border border-[#2B1A42] px-1.5 py-0.5 text-[9px] font-mono font-bold text-[#C084FC]">31</span>
            </Link>

            {/* In Architect canvas mode, hide marketing links to prevent crushing the logo */}
            {!isArchitect && (
              <>
                <button
                  onClick={() => openLeadMagnetModal()}
                  className="flex items-center gap-1.5 rounded-[2px] px-2.5 py-1 text-xs font-mono font-semibold text-[#F5F3FF] hover:bg-[#1E1235] hover:text-[#C084FC] hover:border-[#8B5CF6] active:text-[#8B5CF6] border border-[#2B1A42] bg-[#120A21] transition-all shrink-0 cursor-pointer"
                  role="listitem"
                  title={isTr ? 'Ücretsiz Self-Host Rehberi & Docker Şablonları' : isPt ? 'Guia Self-Hosted Grátis & Modelos Docker' : 'Free Self-Hosting Guide & Docker Templates'}
                >
                  <Gift className="h-3.5 w-3.5 text-[#C084FC]" />
                  <span>{isTr ? 'Ücretsiz Rehber' : isPt ? 'Guia Grátis' : 'Free Guide'}</span>
                </button>
                <Link
                  href="/feed"
                  className={cn(
                    "flex items-center gap-1.5 rounded-[2px] px-2.5 py-1 text-xs font-mono font-medium transition-all shrink-0",
                    pathname === '/feed'
                      ? "bg-[#120A21] text-[#8B5CF6] border border-[#2B1A42]"
                      : "text-[#A19BAF] hover:bg-[#120A21] hover:text-[#F5F3FF] active:text-[#8B5CF6]"
                  )}
                  role="listitem"
                >
                  <Compass className={cn("h-3.5 w-3.5", pathname === '/feed' ? "text-[#8B5CF6]" : "text-[#8B7D9E]")} />
                  <span>{isTr ? 'Topluluk' : isPt ? 'Comunidade' : 'Community'}</span>
                </Link>
                <Link
                  href="/guide"
                  className={cn(
                    "flex items-center gap-1.5 rounded-[2px] px-2.5 py-1 text-xs font-mono font-medium transition-all shrink-0",
                    pathname === '/guide'
                      ? "bg-[#120A21] text-[#8B5CF6] border border-[#2B1A42]"
                      : "text-[#A19BAF] hover:bg-[#120A21] hover:text-[#F5F3FF] active:text-[#8B5CF6]"
                  )}
                  role="listitem"
                >
                  <BookOpen className={cn("h-3.5 w-3.5", pathname === '/guide' ? "text-[#8B5CF6]" : "text-[#8B7D9E]")} />
                  <span>{isTr ? 'Rehber' : isPt ? 'Guia' : 'Guide'}</span>
                </Link>
                <Link
                  href="/blog"
                  className={cn(
                    "flex items-center gap-1.5 rounded-[2px] px-2.5 py-1 text-xs font-mono font-medium transition-all shrink-0",
                    pathname === '/blog' || pathname.startsWith('/blog/')
                      ? "bg-[#120A21] text-[#8B5CF6] border border-[#2B1A42]"
                      : "text-[#A19BAF] hover:bg-[#120A21] hover:text-[#F5F3FF] active:text-[#8B5CF6]"
                  )}
                  role="listitem"
                >
                  <span>Blog</span>
                </Link>
                <Link
                  href="/forum"
                  className={cn(
                    "flex items-center gap-1.5 rounded-[2px] px-2.5 py-1 text-xs font-mono font-medium transition-all shrink-0",
                    pathname === '/forum' || pathname.startsWith('/forum/')
                      ? "bg-[#120A21] text-[#8B5CF6] border border-[#2B1A42]"
                      : "text-[#A19BAF] hover:bg-[#120A21] hover:text-[#F5F3FF] active:text-[#8B5CF6]"
                  )}
                  role="listitem"
                >
                  <span>Forum</span>
                </Link>
                <Link
                  href="/destek"
                  className={cn(
                    "flex items-center gap-1.5 rounded-[2px] px-2.5 py-1 text-xs font-mono font-medium transition-all shrink-0",
                    pathname === '/destek'
                      ? "bg-[#120A21] text-[#8B5CF6] border border-[#2B1A42]"
                      : "text-[#A19BAF] hover:bg-[#120A21] hover:text-[#F5F3FF] active:text-[#8B5CF6]"
                  )}
                  role="listitem"
                >
                  <LifeBuoy className={cn("h-3.5 w-3.5", pathname === '/destek' ? "text-[#8B5CF6]" : "text-[#8B7D9E]")} />
                  <span>{isTr ? 'Destek' : isPt ? 'Suporte' : 'Support'}</span>
                </Link>
              </>
            )}
          </div>
        </div>

        {/* ── Center: Primary Actions (Canvas Mode Only) ── */}
        {isArchitect && (
          <div className="flex items-center gap-2">
            {/* 1. Primary Action: Dağıtıma Hazırla */}
            {onOpenDeploy && (
              <button
                onClick={onOpenDeploy}
                className="flex items-center gap-1.5 rounded-[2px] bg-[#8B5CF6] hover:bg-[#7C3AED] px-3.5 py-1.5 text-xs font-mono font-bold text-white shadow-[0_0_20px_rgba(139,92,246,0.35)] transition-all hover:scale-[1.02] active:scale-95"
              >
                <Rocket className="h-3.5 w-3.5 text-white" />
                <span>{isTr ? 'Dağıtıma Hazırla' : isPt ? 'Instalar no Servidor' : 'Deploy to Server'}</span>
              </button>
            )}

            {/* 2. AI Mimar */}
            {onOpenAI && (
              <button
                onClick={onOpenAI}
                className="flex items-center gap-1.5 rounded-[2px] border border-[#2B1A42] bg-[#120A21] px-3 py-1.5 text-xs font-mono font-semibold text-[#F5F3FF] shadow-sm transition-all hover:bg-[#1E1235] hover:border-[#8B5CF6] hover:text-[#C084FC] hover:scale-[1.02] active:scale-95"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#C084FC]" />
                <span className="hidden sm:inline">{isTr ? 'AI Mimar' : isPt ? 'Arquiteto IA' : 'AI Architect'}</span>
              </button>
            )}

            {/* 2.8 Canlı Sunucu (Live Agent) */}
            {onOpenLiveAgent && (
              <button
                onClick={onOpenLiveAgent}
                className={cn(
                  'flex items-center gap-1.5 rounded-[2px] border px-3 py-1.5 text-xs font-mono font-bold transition-all shadow-sm active:scale-95',
                  isLiveConnected
                    ? 'border-emerald-500/50 bg-[#120A21] text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.25)] hover:bg-[#1E1235]'
                    : 'border-[#2B1A42] bg-[#120A21] text-[#A19BAF] hover:border-[#8B5CF6] hover:text-[#F5F3FF]'
                )}
              >
                <Radio className={cn('h-3.5 w-3.5', isLiveConnected ? 'text-emerald-400 animate-pulse' : 'text-[#C084FC]')} />
                <span>{isLiveConnected ? `● ${isTr ? 'VDS Canlı' : isPt ? 'VDS Ao Vivo' : 'VDS Live'} (%${liveStats?.cpuUsage ?? 0})` : (isTr ? 'Canlı Sunucu' : isPt ? 'Servidor Ao Vivo' : 'Live Server')}</span>
              </button>
            )}

            {/* 3. Sleek Dropdown: Araçlar (Compose, Özel Docker, AI Doktor, Simülatör, Hazır Mimariler) */}
            {(onOpenImport || onOpenCustomContainer || onOpenAIDoctor || onOpenTerminalSimulator || onOpenStackPacks) && (
              <div className="relative" ref={toolsRef}>
                <button
                  onClick={() => setIsToolsOpen(!isToolsOpen)}
                  className={cn(
                    'flex items-center gap-1.5 rounded-[2px] border border-[#2B1A42] bg-[#120A21] px-3 py-1.5 text-xs font-mono font-medium text-[#F5F3FF] transition-all hover:border-[#8B5CF6] hover:text-[#C084FC]',
                    isToolsOpen && 'border-[#8B5CF6] bg-[#1E1235] text-[#C084FC]'
                  )}
                >
                  <Wrench className="h-3.5 w-3.5 text-[#C084FC]" />
                  <span>{isTr ? 'Araçlar' : isPt ? 'Ferramentas' : 'Tools'}</span>
                  <ChevronDown className={cn('h-3.5 w-3.5 text-[#8B7D9E] transition-transform', isToolsOpen && 'rotate-180')} />
                </button>

                {/* Dropdown Popover */}
                {isToolsOpen && (
                  <div className="absolute left-1/2 -translate-x-1/2 mt-2 w-56 overflow-hidden rounded-[2px] border border-[#2B1A42] bg-[#120A21] p-1.5 shadow-2xl backdrop-blur-xl animate-in fade-in slide-in-from-top-2 duration-150 z-50">
                    {onOpenStackPacks && (
                      <button
                        onClick={() => {
                          setIsToolsOpen(false);
                          onOpenStackPacks();
                        }}
                        className="flex w-full items-center gap-2.5 rounded-[2px] px-3 py-2 text-xs font-mono font-medium text-[#F5F3FF] hover:bg-[#1E1235] hover:text-[#C084FC] transition-colors text-left"
                      >
                        <Boxes className="h-4 w-4 text-[#C084FC] shrink-0" />
                        <div>
                          <p className="font-semibold leading-tight">{isTr ? 'Hazır Mimariler' : isPt ? 'Stacks Prontos' : 'Stack Packs'}</p>
                          <p className="text-[10px] text-[#8B7D9E]">{isTr ? '12 adet 1-tık mimari' : isPt ? '12 stacks de 1 clique' : '12 1-click stacks'}</p>
                        </div>
                      </button>
                    )}
                    {onOpenDomainWizard && (
                      <button
                        onClick={() => {
                          setIsToolsOpen(false);
                          onOpenDomainWizard();
                        }}
                        className="flex w-full items-center gap-2.5 rounded-[2px] px-3 py-2 text-xs font-mono font-medium text-[#F5F3FF] hover:bg-[#1E1235] hover:text-[#C084FC] transition-colors text-left"
                      >
                        <Globe className="h-4 w-4 text-[#C084FC] shrink-0" />
                        <div>
                          <p className="font-semibold leading-tight">{isTr ? 'Domain & SSL Sihirbazı' : isPt ? 'Assistente de Domínio & SSL' : 'Domain & SSL Wizard'}</p>
                          <p className="text-[10px] text-[#8B7D9E]">Cloudflare & Caddy/Nginx</p>
                        </div>
                      </button>
                    )}

                    {onOpenAIDoctor && (
                      <button
                        onClick={() => {
                          setIsToolsOpen(false);
                          onOpenAIDoctor();
                        }}
                        className="flex w-full items-center gap-2.5 rounded-[2px] px-3 py-2 text-xs font-mono font-medium text-[#F5F3FF] hover:bg-[#1E1235] hover:text-[#C084FC] transition-colors text-left"
                      >
                        <Wrench className="h-4 w-4 text-[#C084FC] shrink-0" />
                        <div>
                          <p className="font-semibold leading-tight">{isTr ? 'AI Doktor' : isPt ? 'Doutor IA' : 'AI Doctor'}</p>
                          <p className="text-[10px] text-[#8B7D9E]">{isTr ? 'Çakışma & DB oto-onar' : isPt ? 'Auto-corrigir conflitos & DB' : 'Auto-fix conflicts & DB'}</p>
                        </div>
                      </button>
                    )}

                    {onOpenImport && (
                      <button
                        onClick={() => {
                          setIsToolsOpen(false);
                          onOpenImport();
                        }}
                        className="flex w-full items-center gap-2.5 rounded-[2px] px-3 py-2 text-xs font-mono font-medium text-[#F5F3FF] hover:bg-[#1E1235] hover:text-[#C084FC] transition-colors text-left"
                      >
                        <FileUp className="h-4 w-4 text-[#C084FC] shrink-0" />
                        <div>
                          <p className="font-semibold leading-tight">{isTr ? 'Compose Yükle' : isPt ? 'Importar Compose' : 'Import Compose'}</p>
                          <p className="text-[10px] text-[#8B7D9E]">{isTr ? 'docker-compose.yml aktar' : isPt ? 'Importar docker-compose.yml' : 'Import docker-compose.yml'}</p>
                        </div>
                      </button>
                    )}

                    {onOpenCustomContainer && (
                      <button
                        onClick={() => {
                          setIsToolsOpen(false);
                          onOpenCustomContainer();
                        }}
                        className="flex w-full items-center gap-2.5 rounded-[2px] px-3 py-2 text-xs font-mono font-medium text-[#F5F3FF] hover:bg-[#1E1235] hover:text-[#C084FC] transition-colors text-left"
                      >
                        <Box className="h-4 w-4 text-[#C084FC] shrink-0" />
                        <div>
                          <p className="font-semibold leading-tight">{isTr ? '+ Özel Docker' : isPt ? '+ Container Personalizado' : '+ Custom Container'}</p>
                          <p className="text-[10px] text-[#8B7D9E]">{isTr ? 'İmaj ve port ekle' : isPt ? 'Adicionar imagem e portas' : 'Add image & ports'}</p>
                        </div>
                      </button>
                    )}

                    {onOpenTerminalSimulator && (
                      <button
                        onClick={() => {
                          setIsToolsOpen(false);
                          onOpenTerminalSimulator();
                        }}
                        className="flex w-full items-center gap-2.5 rounded-[2px] px-3 py-2 text-xs font-mono font-medium text-[#F5F3FF] hover:bg-[#1E1235] hover:text-[#C084FC] transition-colors text-left"
                      >
                        <Terminal className="h-4 w-4 text-[#C084FC] shrink-0" />
                        <div>
                          <p className="font-semibold leading-tight">{isTr ? 'Simülatör' : isPt ? 'Simulador' : 'Simulator'}</p>
                          <p className="text-[10px] text-[#8B7D9E]">{isTr ? 'Tarayıcı içi terminal' : isPt ? 'Terminal no navegador' : 'In-browser terminal'}</p>
                        </div>
                      </button>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* 4. Command Palette Trigger */}
            {onOpenCommandPalette && (
              <button
                onClick={onOpenCommandPalette}
                title={isTr ? "Komut Paleti (Ctrl+K / Cmd+K)" : isPt ? "Paleta de Comandos (Ctrl+K / Cmd+K)" : "Command Palette (Ctrl+K / Cmd+K)"}
                className="hidden md:flex items-center gap-1.5 rounded-[2px] border border-[#2B1A42] bg-[#120A21] px-2.5 py-1.5 text-xs font-mono text-[#A19BAF] hover:border-[#8B5CF6] hover:text-[#F5F3FF] transition-all"
              >
                <Command className="h-3.5 w-3.5 text-[#C084FC]" />
                <kbd className="rounded-[2px] border border-[#2B1A42] bg-[#090514] px-1 text-[10px] font-mono text-[#8B7D9E]">
                  ⌘K
                </kbd>
              </button>
            )}
          </div>
        )}

        {/* ── Right: Controls, CTAs & Profile ── */}
        <div className="flex items-center gap-2">
          {/* Canvas Controls: Only on Architect page */}
          {isArchitect && (
            <>
              <div className="flex items-center rounded-[2px] border border-[#2B1A42] bg-[#120A21] p-0.5">
                <button
                  onClick={handleSave}
                  title={isTr ? "Canvas'ı kaydet" : isPt ? "Salvar canvas" : "Save canvas"}
                  className="rounded-[2px] p-1.5 text-[#A19BAF] hover:bg-[#1E1235] hover:text-[#C084FC] transition-all"
                >
                  <Save className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={onOpenShare || handleShare}
                  title={isTr ? "Mimarini Paylaş & Dışa Aktar" : isPt ? "Compartilhar e exportar arquitetura" : "Share & export architecture"}
                  className="rounded-[2px] p-1.5 text-[#A19BAF] hover:bg-[#1E1235] hover:text-[#C084FC] transition-all"
                >
                  <Share2 className="h-3.5 w-3.5" />
                </button>
                <button
                  onClick={handleExportImage}
                  title={isTr ? "Mimariyi Görsel Olarak İndir (.PNG)" : isPt ? "Baixar arquitetura como imagem (.PNG)" : "Download architecture as image (.PNG)"}
                  className="rounded-[2px] p-1.5 text-[#A19BAF] hover:bg-[#1E1235] hover:text-[#C084FC] transition-all"
                >
                  <Camera className="h-3.5 w-3.5" />
                </button>
                {onOpenStoryCard && (
                  <button
                    onClick={onOpenStoryCard}
                    title={isTr ? "Instagram Story Mimari Kimlik Kartı (9:16)" : isPt ? "Gerar Cartão de Identidade de Arquitetura para Story (9:16)" : "Generate Instagram Story Architecture Card (9:16)"}
                    className="rounded-[2px] p-1.5 text-[#C084FC] hover:bg-[#1E1235] hover:text-[#F5F3FF] transition-all"
                  >
                    <InstagramIcon className="h-3.5 w-3.5" />
                  </button>
                )}
                {onOpenBlueprint && (
                  <button
                    onClick={onOpenBlueprint}
                    title={isTr ? "DIN 40719 Şartname & Teknik Çizim (PDF/Yazdır)" : isPt ? "Especificação Técnica DIN 40719 (PDF/Imprimir)" : "DIN 40719 Blueprint & Technical Spec (PDF/Print)"}
                    className="flex items-center gap-1.5 rounded-[2px] p-1.5 px-2.5 text-[#C084FC] hover:bg-[#1E1235] hover:text-[#F5F3FF] transition-all font-mono text-[10px] font-bold tracking-tight border-l border-[#2B1A42] cursor-pointer"
                  >
                    <FileText className="h-3.5 w-3.5 text-[#C084FC]" />
                    <span className="hidden xl:inline">[ DIN // BLUEPRINT ]</span>
                  </button>
                )}
                {onOpenPro && (
                  <button
                    onClick={onOpenPro}
                    title={isTr ? "Bizi Paylaş, Ömür Boyu VIP Lisansı Anında Kap!" : "Share & Get Free Lifetime VIP!"}
                    className="flex items-center gap-1.5 rounded-[2px] p-1.5 px-2.5 text-[#F5F3FF] bg-[#1E1235] hover:bg-[#251542] border-l border-[#2B1A42] hover:border-[#8B5CF6] transition-all font-mono text-[10px] font-bold tracking-tight shadow-[0_0_12px_rgba(139,92,246,0.15)] cursor-pointer"
                  >
                    <Crown className="h-3.5 w-3.5 text-[#C084FC]" />
                    <span>{isTr ? "VIP KAZAN" : "GET VIP"}</span>
                  </button>
                )}
              </div>

              {/* Conflict indicator */}
              {conflictCount > 0 && (
                <div
                  className="flex items-center gap-1.5 rounded-[2px] bg-red-950/60 border border-red-500/50 px-2.5 py-1"
                  role="alert"
                  aria-live="polite"
                  aria-label={isTr ? `${conflictCount} port çakışması tespit edildi` : isPt ? `${conflictCount} conflitos de porta detectados` : `${conflictCount} port conflicts detected`}
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-red-500 animate-pulse" aria-hidden />
                  <span className="text-[10px] font-mono font-semibold text-red-400">
                    {conflictCount} {isTr ? 'çakışma' : isPt ? 'conflitos' : 'conflicts'}
                  </span>
                </div>
              )}
            </>
          )}

          {/* Global CTA on marketing pages */}
          {!isArchitect && (
            <Link
              href="/architect"
              className="hidden sm:flex items-center gap-1.5 rounded-[2px] bg-[#8B5CF6] hover:bg-[#7C3AED] px-3.5 py-1.5 text-xs font-mono font-bold text-white shadow-[0_0_20px_rgba(139,92,246,0.35)] transition-all hover:scale-[1.02] active:scale-95"
            >
              <span>{isTr ? 'Tasarlamaya Başla' : isPt ? 'Começar a Criar' : 'Start Building'}</span>
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}

          {/* GitHub social proof */}
          <a
            href="https://github.com/Xivizley/xivizley"
            target="_blank"
            rel="noopener noreferrer"
            title={isTr ? 'GitHub — MIT Lisanslı Açık Kaynak' : isPt ? 'GitHub — Código Aberto MIT' : 'GitHub — MIT-licensed Open Source'}
            aria-label={isTr ? 'GitHub deposunu aç (yeni sekmede açılır)' : 'Open GitHub repository (opens in new tab)'}
            className="hidden sm:flex items-center justify-center rounded-[2px] border border-[#2B1A42] bg-[#120A21] p-1.5 text-[#A19BAF] hover:border-[#8B5CF6] hover:text-[#C084FC] transition-all"
          >
            <svg className="h-3.5 w-3.5 fill-current" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M12 .5C5.73.5.5 5.73.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.56 0-.27-.01-1.16-.02-2.1-3.2.7-3.88-1.54-3.88-1.54-.52-1.33-1.28-1.69-1.28-1.69-1.05-.72.08-.7.08-.7 1.16.08 1.77 1.19 1.77 1.19 1.03 1.77 2.7 1.26 3.36.96.1-.75.4-1.26.73-1.55-2.55-.29-5.23-1.28-5.23-5.7 0-1.26.45-2.29 1.19-3.1-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11.1 11.1 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.11 3.05.74.81 1.18 1.84 1.18 3.1 0 4.43-2.69 5.41-5.25 5.69.41.35.78 1.05.78 2.12 0 1.53-.01 2.76-.01 3.14 0 .31.2.67.8.56A11.51 11.51 0 0 0 23.5 12C23.5 5.73 18.27.5 12 .5z" />
            </svg>
          </a>

          {/* Theme Selector */}
          <ThemeSelector />

          {/* Language Switcher */}
          <button
            onClick={() => {
              const nextLang = lang === 'tr' ? 'en' : lang === 'en' ? 'pt' : 'tr';
              setLang(nextLang);
            }}
            aria-label={
              lang === 'tr'
                ? 'Switch to English'
                : lang === 'en'
                ? 'Mudar para Português'
                : 'Türkçeye geç'
            }
            className="flex h-7 w-8 items-center justify-center rounded-[2px] border border-[#2B1A42] bg-[#120A21] text-[11px] font-mono font-bold text-[#A19BAF] transition-colors hover:border-[#8B5CF6] hover:text-[#F5F3FF]"
          >
            {lang.toUpperCase()}
          </button>

          {/* User profile / Login button */}
          {session?.user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-[#2B1A42]">
              {session.user.image && (
                <Image
                  src={session.user.image}
                  alt={session.user.name || 'User'}
                  width={24}
                  height={24}
                  unoptimized
                  className="h-6 w-6 rounded-[2px] ring-1 ring-[#8B5CF6]"
                />
              )}
              <span className="text-xs font-mono text-[#F5F3FF] font-medium hidden lg:inline-block">
                {session.user.name?.split(' ')[0] || 'Kullanıcı'}
              </span>
              <button
                onClick={() => signOut({ callbackUrl: '/' })}
                className="rounded-[2px] bg-[#120A21] hover:bg-red-950/60 hover:text-red-400 hover:border-red-500/40 border border-[#2B1A42] px-2.5 py-1 text-[11px] font-mono font-medium text-[#A19BAF] transition-colors"
              >
                {t('nav.logout')}
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="rounded-[2px] border border-[#8B5CF6] bg-[#7C3AED] hover:bg-[#6D28D9] px-3 py-1 text-xs font-mono font-semibold text-white transition-colors shadow-[0_0_10px_rgba(139,92,246,0.25)]"
            >
              {t('nav.login')}
            </Link>
          )}

          {/* Mobile Hamburger Toggle (Non-Architect pages) */}
          {!isArchitect && (
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="flex md:hidden items-center justify-center rounded-[2px] border border-[#2B1A42] bg-[#120A21] p-1.5 text-[#A19BAF] hover:text-[#F5F3FF] transition-colors"
              aria-label={isTr ? "Menüyü Aç/Kapat" : isPt ? "Alternar Menu" : "Toggle Menu"}
            >
              {isMobileMenuOpen ? <X className="h-4 w-4" /> : <Menu className="h-4 w-4" />}
            </button>
          )}
        </div>
      </nav>

      {/* Mobile Navigation Drawer */}
      {isMobileMenuOpen && !isArchitect && (
        <div className="md:hidden border-t border-[#2B1A42] bg-[#090514]/98 backdrop-blur-xl px-5 py-4 space-y-2.5 animate-in fade-in slide-in-from-top-2 duration-150">
          <Link
            href="/suite"
            onClick={() => setIsMobileMenuOpen(false)}
            className={cn(
              "flex items-center justify-between py-2 text-xs font-mono font-semibold transition-colors",
              pathname === '/suite' ? "text-[#8B5CF6]" : "text-[#F5F3FF] hover:text-[#C084FC] active:text-[#8B5CF6]"
            )}
          >
            <span className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-[#C084FC]" />
              XIVIZLEY Suite (Self-Hosted)
            </span>
            <span className="rounded-[2px] bg-[#120A21] border border-[#2B1A42] px-2 py-0.5 text-[10px] font-mono font-bold text-[#C084FC]">
              {PLATFORM_STATS.suiteStage}
            </span>
          </Link>
          <Link
            href="/templates"
            onClick={() => setIsMobileMenuOpen(false)}
            className={cn(
              "flex items-center justify-between py-2 text-xs font-mono font-semibold transition-colors",
              pathname === '/templates' ? "text-[#8B5CF6]" : "text-[#F5F3FF] hover:text-[#C084FC] active:text-[#8B5CF6]"
            )}
          >
            <span className="flex items-center gap-2">
              <Boxes className="h-4 w-4 text-[#C084FC]" />
              {isTr ? 'Şablonlar' : isPt ? 'Modelos' : 'Templates'}
            </span>
            <span className="rounded-[2px] bg-[#120A21] border border-[#2B1A42] px-2 py-0.5 text-[10px] font-mono text-[#C084FC]">31</span>
          </Link>
          <button
            onClick={() => {
              setIsMobileMenuOpen(false);
              openLeadMagnetModal();
            }}
            className="flex w-full items-center justify-between py-2 text-xs font-mono font-semibold text-[#F5F3FF] hover:text-[#C084FC] active:text-[#8B5CF6] text-left"
          >
            <span className="flex items-center gap-2">
              <Gift className="h-4 w-4 text-[#C084FC]" />
              {isTr ? 'Ücretsiz Self-Host Rehberi' : isPt ? 'Guia Self-Hosted Grátis' : 'Free Self-Hosting Guide'}
            </span>
            <span className="rounded-[2px] bg-[#120A21] border border-[#2B1A42] px-2 py-0.5 text-[10px] font-mono text-[#C084FC]">{isTr ? 'Rehber' : isPt ? 'Guia' : 'Guide'}</span>
          </button>
          <Link
            href="/feed"
            onClick={() => setIsMobileMenuOpen(false)}
            className={cn(
              "flex items-center gap-2 py-2 text-xs font-mono font-medium transition-colors",
              pathname === '/feed' ? "text-[#8B5CF6]" : "text-[#A19BAF] hover:text-[#F5F3FF] active:text-[#8B5CF6]"
            )}
          >
            <Compass className={cn("h-4 w-4", pathname === '/feed' ? "text-[#8B5CF6]" : "text-[#8B7D9E]")} />
            <span>{isTr ? 'Topluluk' : isPt ? 'Comunidade' : 'Community'}</span>
          </Link>
          <Link
            href="/guide"
            onClick={() => setIsMobileMenuOpen(false)}
            className={cn(
              "flex items-center gap-2 py-2 text-xs font-mono font-medium transition-colors",
              pathname === '/guide' ? "text-[#8B5CF6]" : "text-[#A19BAF] hover:text-[#F5F3FF] active:text-[#8B5CF6]"
            )}
          >
            <BookOpen className={cn("h-4 w-4", pathname === '/guide' ? "text-[#8B5CF6]" : "text-[#8B7D9E]")} />
            <span>{isTr ? 'Rehber' : isPt ? 'Guia' : 'Guide'}</span>
          </Link>
          <Link
            href="/blog"
            onClick={() => setIsMobileMenuOpen(false)}
            className={cn(
              "block py-2 text-xs font-mono font-medium transition-colors",
              pathname === '/blog' || pathname.startsWith('/blog/') ? "text-[#8B5CF6]" : "text-[#A19BAF] hover:text-[#F5F3FF] active:text-[#8B5CF6]"
            )}
          >
            Blog
          </Link>
          <Link
            href="/forum"
            onClick={() => setIsMobileMenuOpen(false)}
            className={cn(
              "block py-2 text-xs font-mono font-medium transition-colors",
              pathname === '/forum' || pathname.startsWith('/forum/') ? "text-[#8B5CF6]" : "text-[#A19BAF] hover:text-[#F5F3FF] active:text-[#8B5CF6]"
            )}
          >
            Forum
          </Link>
          <Link
            href="/destek"
            onClick={() => setIsMobileMenuOpen(false)}
            className={cn(
              "flex items-center gap-2 py-2 text-xs font-mono font-medium transition-colors",
              pathname === '/destek' ? "text-[#8B5CF6]" : "text-[#A19BAF] hover:text-[#F5F3FF] active:text-[#8B5CF6]"
            )}
          >
            <LifeBuoy className={cn("h-4 w-4", pathname === '/destek' ? "text-[#8B5CF6]" : "text-[#8B7D9E]")} />
            <span>{isTr ? 'Destek' : isPt ? 'Suporte' : 'Support'}</span>
          </Link>
          <div className="pt-2 border-t border-[#2B1A42]">
            <Link
              href="/architect"
              onClick={() => setIsMobileMenuOpen(false)}
              className="flex w-full items-center justify-center gap-2 rounded-[2px] bg-[#8B5CF6] hover:bg-[#7C3AED] px-4 py-2.5 text-xs font-mono font-bold text-white shadow-[0_0_20px_rgba(139,92,246,0.35)]"
            >
              <span>{isTr ? 'Tasarlamaya Başla' : isPt ? 'Começar a Criar' : 'Start Building'}</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
