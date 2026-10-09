// ============================================================
// XIVIZLEY — ReactFlow Architecture Canvas (Production Grade with History, Snap & Shortcuts)
// components/canvas/ArchitectCanvas.tsx
// ============================================================

'use client';

import React, { useCallback, useEffect, useState } from 'react';
import ReactFlow, {
  Background,
  BackgroundVariant,
  Controls,
  MiniMap,
  ReactFlowProvider,
  useReactFlow,
  type ReactFlowInstance,
} from 'reactflow';
import { NodeCard } from './NodeCard';
import { HardwareEstimator } from './HardwareEstimator';
import { QuickSearchModal } from './QuickSearchModal';
import { QuickStackPacksModal, STACK_PACKS } from './QuickStackPacksModal';
import { useArchitectStore, selectCanUndo, selectCanRedo } from '@/store/useArchitectStore';
import { StoryCardModal } from '@/components/modals/StoryCardModal';
import { MODULE_CATALOG } from '@/lib/data/modules';
import type { ModuleNodeData } from '@/lib/types';
import { useTranslation, useI18nStore } from '@/lib/i18n/store';
import { cn } from '@/lib/utils';
import {
  Undo2,
  Redo2,
  Copy,
  Trash2,
  Grid,
  Maximize2,
  ImageDown,
  FileCode2,
  Keyboard,
  X,
  Sparkles,
  Shield,
  Palette,
  Wand2,
  Package,
  ExternalLink,
} from 'lucide-react';
import { toPng, toSvg } from 'html-to-image';
import { auditStackSecurity, generateSecureSecret } from '@/lib/utils/securityAuditor';
import { downloadProjectZip } from '@/lib/generators/zipGenerator';
import { generateCode } from '@/lib/generators/composeGenerator';
import { generateEnvFile } from '@/lib/generators/envGenerator';
import { generateVdsDeployScript } from '@/lib/generators/deploymentGenerator';
import { CyberEdge } from './CyberEdge';
import { ClusterTelemetryRadar } from './ClusterTelemetryRadar';
import { PulseTelemetryPill } from './PulseTelemetryPill';
import { parseDockerComposeYaml } from '@/lib/parsers/composeParser';

// ─── Custom Node & Edge Types ────────────────────────────────

const nodeTypes = { moduleNode: NodeCard };
const edgeTypes = {
  cyberEdge: CyberEdge,
  default: CyberEdge,
};

// Quick preset modules for empty canvas
const QUICK_PRESETS = [
  { templateId: 'adguard', moduleId: 'adguard-home', emoji: '🛡️', label: 'AdGuard Home' },
  { templateId: 'nginx', moduleId: 'nginx-proxy-manager', emoji: '🔀', label: 'Nginx Proxy' },
  { templateId: 'nextcloud', moduleId: 'nextcloud', emoji: '☁️', label: 'Nextcloud' },
  { templateId: 'jellyfin', moduleId: 'jellyfin', emoji: '🎬', label: 'Jellyfin' },
  { templateId: 'vaultwarden', moduleId: 'vaultwarden', emoji: '🔐', label: 'Vaultwarden' },
];

// ─── Export Buttons ──────────────────────────────────────────

function ExportButtons({
  hasNodes,
  onOpenStoryCard,
}: {
  hasNodes: boolean;
  onOpenStoryCard?: () => void;
}) {
  const { nodes, edges } = useArchitectStore();
  const [isZipping, setIsZipping] = useState(false);
  const lang = useI18nStore((s) => s.lang);
  const isTr = lang === 'tr';
  const isPt = lang === 'pt';

  if (!hasNodes) return null;

  const download = (dataUrl: string, filename: string) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    a.click();
  };

  const handlePng = async () => {
    const el = document.querySelector<HTMLElement>('.react-flow__viewport');
    if (!el) return;
    try {
      const dataUrl = await toPng(el, { backgroundColor: '#0a0f1a', quality: 0.95 });
      download(dataUrl, `xivizley-${Date.now()}.png`);
    } catch (e) {
      console.error('PNG export failed', e);
    }
  };

  const handleSvg = async () => {
    const el = document.querySelector<HTMLElement>('.react-flow__viewport');
    if (!el) return;
    try {
      const dataUrl = await toSvg(el, { backgroundColor: '#0a0f1a' });
      download(dataUrl, `xivizley-${Date.now()}.svg`);
    } catch (e) {
      console.error('SVG export failed', e);
    }
  };

  const handleZip = async () => {
    try {
      setIsZipping(true);
      const { dockerCompose } = generateCode(nodes, edges);
      const envContent = generateEnvFile(nodes);
      const deployScript = generateVdsDeployScript(nodes, edges);
      await downloadProjectZip({
        composeYaml: dockerCompose,
        envContent,
        bashScript: deployScript,
        nodes,
      });
    } catch (e) {
      console.error('ZIP export failed', e);
    } finally {
      setIsZipping(false);
    }
  };

  return (
    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-1.5 rounded-2xl liquid-glass p-1.5 ring-1 ring-cyan-500/25 shadow-2xl">
      {/* 9:16 Story Card Generator */}
      <button
        onClick={onOpenStoryCard}
        className="flex h-7 items-center gap-1.5 px-3 rounded-xl text-[10px] font-extrabold bg-gradient-to-r from-pink-500/20 via-purple-500/20 to-cyan-500/20 text-pink-300 hover:text-white border border-pink-500/40 hover:border-pink-400 hover:shadow-lg hover:shadow-pink-500/20 transition-all active:scale-95"
        title={isTr ? 'Instagram Story Formatında (9:16) Self-Host Kimlik Kartı Oluştur' : isPt ? 'Criar Cartão de Identidade Self-Host (9:16) formato Story' : 'Create 9:16 Story Card Self-Host ID'}
      >
        <Sparkles className="h-3.5 w-3.5 text-pink-400" />
        <span>{isTr ? '📸 Story Kartı' : isPt ? '📸 Cartão Story' : '📸 Story Card'}</span>
      </button>

      <div className="h-4 w-px bg-white/10" />

      <button
        onClick={handlePng}
        className="flex h-7 items-center gap-1.5 px-2.5 rounded-xl text-[10px] font-semibold text-slate-300 hover:bg-cyan-500/10 hover:text-cyan-300 transition-all active:scale-95"
        title={isTr ? 'PNG olarak indir' : isPt ? 'Baixar como PNG' : 'Download as PNG'}
      >
        <ImageDown className="h-3.5 w-3.5 text-cyan-400" />
        PNG
      </button>
      <div className="h-4 w-px bg-white/10" />
      <button
        onClick={handleSvg}
        className="flex h-7 items-center gap-1.5 px-2.5 rounded-xl text-[10px] font-semibold text-slate-300 hover:bg-purple-500/10 hover:text-purple-300 transition-all active:scale-95"
        title={isTr ? 'SVG olarak indir' : isPt ? 'Baixar como SVG' : 'Download as SVG'}
      >
        <FileCode2 className="h-3.5 w-3.5 text-purple-400" />
        SVG
      </button>
      <div className="h-4 w-px bg-white/10" />
      <button
        onClick={handleZip}
        disabled={isZipping}
        className="flex h-7 items-center gap-1.5 px-2.5 rounded-xl text-[10px] font-semibold text-emerald-300 hover:bg-emerald-950/40 hover:text-emerald-200 transition-all active:scale-95 disabled:opacity-50"
        title={isTr ? "Tüm stack'i (docker-compose, .env, setup.sh, README) tek tıkla ZIP olarak indir" : isPt ? "Baixar stack completo (docker-compose, .env, setup.sh, README) em ZIP" : "Download full stack (docker-compose, .env, setup.sh, README) as ZIP"}
      >
        <Package className="h-3.5 w-3.5 text-emerald-400" />
        <span>{isZipping ? (isTr ? 'Paketleniyor...' : isPt ? 'Empacotando...' : 'Zipping...') : 'Stack .ZIP'}</span>
      </button>
    </div>
  );
}

// ─── Floating Canvas Action Toolbar ──────────────────────────

function CanvasToolbar({ onOpenStackPacks }: { onOpenStackPacks?: () => void }) {
  const { fitView } = useReactFlow();
  const lang = useI18nStore((s) => s.lang);
  const isTr = lang === 'tr';
  const isPt = lang === 'pt';
  const canUndo = useArchitectStore(selectCanUndo);
  const canRedo = useArchitectStore(selectCanRedo);
  const undo = useArchitectStore((s) => s.undo);
  const redo = useArchitectStore((s) => s.redo);
  const duplicateSelected = useArchitectStore((s) => s.duplicateSelected);
  const deleteSelected = useArchitectStore((s) => s.deleteSelected);
  const snapToGrid = useArchitectStore((s) => s.snapToGrid);
  const toggleSnapToGrid = useArchitectStore((s) => s.toggleSnapToGrid);
  const autoLayout = useArchitectStore((s) => s.autoLayout);
  const nodes = useArchitectStore((s) => s.nodes);
  const selectedNodeId = useArchitectStore((s) => s.selectedNodeId);
  const hasSelection = useArchitectStore((s) => s.nodes.some((n) => n.selected) || Boolean(selectedNodeId));
  const [showShortcuts, setShowShortcuts] = useState(false);

  const handleFitView = useCallback(() => {
    try {
      fitView({ padding: 0.2, duration: 300 });
    } catch {
      // Safe fallback
    }
  }, [fitView]);

  return (
    <>
      <div className="absolute top-4 left-4 z-20 flex items-center gap-1 rounded-2xl liquid-glass p-1.5 ring-1 ring-cyan-500/25 shadow-2xl">
        {/* Studio HUD Badge Pod */}
        <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-cyan-500/10 border border-cyan-500/25 text-[10px] font-mono font-bold text-cyan-300 mr-0.5 select-none">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
          </span>
          <span>STUDIO</span>
        </div>

        <div className="hidden xl:block h-4 w-px bg-white/10" />

        {/* Live VDS Cluster Telemetry Radar Pill */}
        <div className="hidden md:block">
          <ClusterTelemetryRadar />
        </div>

        <div className="hidden md:block h-4 w-px bg-white/10" />

        {/* Live XIVIZLEY Pulse Telemetry HUD */}
        <div className="hidden sm:block">
          <PulseTelemetryPill />
        </div>

        <div className="hidden sm:block h-4 w-px bg-white/10" />

        {/* Undo */}
        <button
          onClick={undo}
          disabled={!canUndo}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-xl transition-all',
            canUndo
              ? 'text-slate-300 hover:bg-slate-800 hover:text-indigo-300 active:scale-95'
              : 'text-slate-700 cursor-not-allowed opacity-40'
          )}
          title={isTr ? 'Geri Al (Ctrl+Z)' : isPt ? 'Desfazer (Ctrl+Z)' : 'Undo (Ctrl+Z)'}
          aria-label={isTr ? 'Geri Al' : isPt ? 'Desfazer' : 'Undo'}
        >
          <Undo2 className="h-3.5 w-3.5" />
        </button>

        {/* Redo */}
        <button
          onClick={redo}
          disabled={!canRedo}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-xl transition-all',
            canRedo
              ? 'text-slate-300 hover:bg-slate-800 hover:text-indigo-300 active:scale-95'
              : 'text-slate-700 cursor-not-allowed opacity-40'
          )}
          title={isTr ? 'İleri Al (Ctrl+Shift+Z / Ctrl+Y)' : isPt ? 'Refazer (Ctrl+Shift+Z / Ctrl+Y)' : 'Redo (Ctrl+Shift+Z / Ctrl+Y)'}
          aria-label={isTr ? 'İleri Al' : isPt ? 'Refazer' : 'Redo'}
        >
          <Redo2 className="h-3.5 w-3.5" />
        </button>

        <div className="h-4 w-px bg-slate-800" />

        {/* Duplicate Selected */}
        <button
          onClick={duplicateSelected}
          disabled={!hasSelection}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-xl transition-all',
            hasSelection
              ? 'text-slate-300 hover:bg-slate-800 hover:text-indigo-300 active:scale-95'
              : 'text-slate-700 cursor-not-allowed opacity-40'
          )}
          title={isTr ? 'Seçiliyi Çoğalt (Ctrl+D)' : isPt ? 'Duplicar Seleção (Ctrl+D)' : 'Duplicate Selected (Ctrl+D)'}
          aria-label={isTr ? 'Seçiliyi Çoğalt' : isPt ? 'Duplicar Seleção' : 'Duplicate Selected'}
        >
          <Copy className="h-3.5 w-3.5" />
        </button>

        {/* Delete Selected */}
        <button
          onClick={deleteSelected}
          disabled={!hasSelection}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-xl transition-all',
            hasSelection
              ? 'text-slate-300 hover:bg-red-950/40 hover:text-red-400 active:scale-95'
              : 'text-slate-700 cursor-not-allowed opacity-40'
          )}
          title={isTr ? 'Sil (Delete / Backspace)' : isPt ? 'Excluir (Delete / Backspace)' : 'Delete (Delete / Backspace)'}
          aria-label={isTr ? 'Seçiliyi Sil' : isPt ? 'Excluir Seleção' : 'Delete Selected'}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>

        <div className="h-4 w-px bg-slate-800" />

        {/* Snap to Grid */}
        <button
          onClick={toggleSnapToGrid}
          className={cn(
            'flex h-7 items-center gap-1 px-2.5 rounded-xl text-[10px] font-semibold transition-all',
            snapToGrid
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-500 hover:bg-slate-800 hover:text-slate-300'
          )}
          title={snapToGrid ? (isTr ? 'Grid Snap Açık (20px)' : isPt ? 'Snap à Grade Ativo (20px)' : 'Grid Snap On (20px)') : (isTr ? 'Grid Snap Kapalı' : isPt ? 'Snap à Grade Desativado' : 'Grid Snap Off')}
          aria-label="Grid Snap"
        >
          <Grid className="h-3 w-3" />
          <span>Snap</span>
        </button>

        {/* Auto Layout */}
        <button
          onClick={() => {
            autoLayout();
            setTimeout(() => handleFitView(), 50);
          }}
          disabled={nodes.length === 0}
          className="flex h-7 items-center gap-1.5 px-2.5 rounded-xl text-[10px] font-bold bg-gradient-to-r from-indigo-500/20 via-purple-500/20 to-cyan-500/20 text-indigo-300 border border-indigo-500/40 hover:border-indigo-400 hover:text-white transition-all active:scale-95 disabled:opacity-30 disabled:cursor-not-allowed shadow-sm"
          title={isTr ? 'Modülleri Otomatik Hizala & Düzenle (Auto-Layout)' : isPt ? 'Alinhar e Organizar Módulos Automaticamente' : 'Auto Align & Layout Modules'}
          aria-label="Auto Layout"
        >
          <Sparkles className="h-3 w-3 text-indigo-400" />
          <span>{isTr ? 'Düzenle' : isPt ? 'Organizar' : 'Layout'}</span>
        </button>

        {/* Stack Packs Button */}
        {onOpenStackPacks && (
          <button
            onClick={onOpenStackPacks}
            className="flex h-7 items-center gap-1.5 px-2.5 rounded-xl text-[10px] font-bold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-500/30 hover:text-white transition-all active:scale-95 shadow-sm"
            title={isTr ? 'Hazır Mimari Paketleri (4K Medya, Siber Güvenlik, Minecraft...)' : isPt ? 'Pacotes de Arquitetura Prontos' : 'Ready Architecture Packs'}
            aria-label={isTr ? 'Hazır Paketler' : isPt ? 'Pacotes Prontos' : 'Ready Packs'}
          >
            <Package className="h-3 w-3 text-indigo-400" />
            <span>{isTr ? 'Paketler' : isPt ? 'Pacotes' : 'Packs'}</span>
          </button>
        )}

        {/* Fit View */}
        <button
          onClick={handleFitView}
          className="flex h-7 w-7 items-center justify-center rounded-xl text-slate-400 hover:bg-slate-800 hover:text-indigo-300 transition-all active:scale-95"
          title={isTr ? 'Görünümü Ekrana Sığdır (Fit View)' : isPt ? 'Ajustar à Tela (Fit View)' : 'Fit to Screen (Fit View)'}
          aria-label="Fit View"
        >
          <Maximize2 className="h-3.5 w-3.5" />
        </button>

        <div className="h-4 w-px bg-slate-800" />

        {/* Theme Selector */}
        <div className="relative group">
          <button
            className="flex h-7 items-center gap-1 px-2 rounded-lg text-[10px] font-medium text-slate-400 hover:bg-slate-800 hover:text-cyan-400 transition-all"
            title={isTr ? 'Görsel Tuval Teması' : isPt ? 'Tema Visual do Canvas' : 'Visual Canvas Theme'}
            aria-label={isTr ? 'Tuval Teması' : isPt ? 'Tema do Canvas' : 'Canvas Theme'}
          >
            <Palette className="h-3 w-3" />
            <span className="hidden sm:inline">{isTr ? 'Tema' : isPt ? 'Tema' : 'Theme'}</span>
          </button>
          <div className="absolute top-full left-0 mt-1 hidden group-hover:flex flex-col w-36 rounded-xl border border-slate-800 bg-[#0d1522]/95 p-1 shadow-2xl backdrop-blur-md z-50 text-[11px]">
            <button
              onClick={() => localStorage.setItem('xivizley_theme', 'cyberpunk')}
              className="px-2 py-1.5 text-left rounded-lg hover:bg-cyan-500/20 text-cyan-300 font-medium transition-colors"
            >
              🌌 Cyberpunk
            </button>
            <button
              onClick={() => localStorage.setItem('xivizley_theme', 'matrix')}
              className="px-2 py-1.5 text-left rounded-lg hover:bg-emerald-500/20 text-emerald-400 font-medium transition-colors"
            >
              🟢 Matrix
            </button>
            <button
              onClick={() => localStorage.setItem('xivizley_theme', 'violet')}
              className="px-2 py-1.5 text-left rounded-lg hover:bg-purple-500/20 text-purple-300 font-medium transition-colors"
            >
              🟣 Hyper Violet
            </button>
            <button
              onClick={() => localStorage.setItem('xivizley_theme', 'blueprint')}
              className="px-2 py-1.5 text-left rounded-lg hover:bg-blue-500/20 text-blue-300 font-medium transition-colors"
            >
              📐 Blueprint
            </button>
          </div>
        </div>

        <div className="h-4 w-px bg-slate-800" />

        {/* Shortcuts Help */}
        <button
          onClick={() => setShowShortcuts(!showShortcuts)}
          className={cn(
            'flex h-7 w-7 items-center justify-center rounded-lg transition-all',
            showShortcuts
              ? 'bg-cyan-500/20 text-cyan-300'
              : 'text-slate-400 hover:bg-slate-800 hover:text-cyan-400'
          )}
          title={isTr ? 'Klavye Kısayolları' : isPt ? 'Atalhos de Teclado' : 'Keyboard Shortcuts'}
          aria-label={isTr ? 'Klavye Kısayolları' : isPt ? 'Atalhos de Teclado' : 'Keyboard Shortcuts'}
        >
          <Keyboard className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Shortcuts Modal Card */}
      {showShortcuts && (
        <div className="absolute top-16 left-4 z-40 w-72 rounded-2xl border border-slate-800 bg-[#0d1522]/95 p-4 shadow-2xl backdrop-blur-md animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
              <Keyboard className="h-3.5 w-3.5 text-cyan-400" /> {isTr ? 'Klavye Kısayolları' : isPt ? 'Atalhos de Teclado' : 'Keyboard Shortcuts'}
            </span>
            <button onClick={() => setShowShortcuts(false)} className="text-slate-500 hover:text-slate-300">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
          <div className="space-y-1.5 text-[11px]">
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-400">{isTr ? 'Komut Paleti' : isPt ? 'Paleta de Comandos' : 'Command Palette'}</span>
              <kbd className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-cyan-300">Ctrl + K</kbd>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-400">{isTr ? 'Geri Al' : isPt ? 'Desfazer' : 'Undo'}</span>
              <kbd className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-300">Ctrl + Z</kbd>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-400">{isTr ? 'İleri Al' : isPt ? 'Refazer' : 'Redo'}</span>
              <kbd className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-300">Ctrl + Y</kbd>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-400">{isTr ? 'Seçiliyi Çoğalt' : isPt ? 'Duplicar Seleção' : 'Duplicate Selected'}</span>
              <kbd className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-300">Ctrl + D</kbd>
            </div>
            <div className="flex items-center justify-between py-1">
              <span className="text-slate-400">{isTr ? 'Seçiliyi Sil' : isPt ? 'Excluir Seleção' : 'Delete Selected'}</span>
              <kbd className="rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-[10px] font-mono text-slate-300">Del / Backspace</kbd>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

interface CanvasContentProps {
  onInit?: (instance: ReactFlowInstance) => void;
  onOpenStoryCard?: () => void;
  onOpenStackPacks?: () => void;
  onToast?: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
  isEmbed?: boolean;
}

function CanvasContent({ onInit, onOpenStoryCard, onOpenStackPacks, onToast, isEmbed = false }: CanvasContentProps) {
  const { t } = useTranslation();
  const lang = useI18nStore((s) => s.lang);
  const isTr = lang === 'tr';
  const isPt = lang === 'pt';
  const nodes = useArchitectStore((s) => s.nodes);
  const edges = useArchitectStore((s) => s.edges);
  const snapToGrid = useArchitectStore((s) => s.snapToGrid);
  const onNodesChange = useArchitectStore((s) => s.onNodesChange);
  const onEdgesChange = useArchitectStore((s) => s.onEdgesChange);
  const onConnect = useArchitectStore((s) => s.onConnect);
  const onNodeDragStart = useArchitectStore((s) => s.onNodeDragStart);
  const addModule = useArchitectStore((s) => s.addModule);
  const undo = useArchitectStore((s) => s.undo);
  const redo = useArchitectStore((s) => s.redo);
  const duplicateSelected = useArchitectStore((s) => s.duplicateSelected);
  const deleteSelected = useArchitectStore((s) => s.deleteSelected);
  const loadTemplate = useArchitectStore((s) => s.loadTemplate);
  const loadCustomStack = useArchitectStore((s) => s.loadCustomStack);

  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const dragCounter = React.useRef(0);

  const [isQuickSearchOpen, setIsQuickSearchOpen] = useState(false);
  const [isStackPacksOpen, setIsStackPacksOpen] = useState(false);
  const [isInternalStoryOpen, setIsInternalStoryOpen] = useState(false);

  const handleStoryCardTrigger = onOpenStoryCard || (() => setIsInternalStoryOpen(true));
  const handleStackPacksTrigger = onOpenStackPacks || (() => setIsStackPacksOpen(true));

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // 1. Safety check for input, textarea, contenteditable
      const target = e.target as HTMLElement | null;
      const isInput =
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable ||
          Boolean(target.closest('input, textarea, [contenteditable="true"]')));

      if (isInput) return;

      const isMac = typeof navigator !== 'undefined' && navigator.platform.toUpperCase().includes('MAC');
      const mod = isMac ? e.metaKey : e.ctrlKey;

      // Quick Search: Ctrl/Cmd + K
      if (mod && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsQuickSearchOpen((prev) => !prev);
        return;
      }

      // Undo: Ctrl/Cmd + Z
      if (mod && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
        return;
      }

      // Redo: Ctrl/Cmd + Shift + Z OR Ctrl/Cmd + Y
      if ((mod && e.key.toLowerCase() === 'z' && e.shiftKey) || (mod && e.key.toLowerCase() === 'y')) {
        e.preventDefault();
        redo();
        return;
      }

      // Duplicate: Ctrl/Cmd + D
      if (mod && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        duplicateSelected();
        return;
      }

      // Delete / Backspace: Delete selected nodes/edges
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        deleteSelected();
        return;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [undo, redo, duplicateSelected, deleteSelected]);

  // Drag and drop listeners for external compose files (.yml) & internal sidebar modules
  const handleDragEnter = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current += 1;
    if (e.dataTransfer.items && e.dataTransfer.items.length > 0) {
      for (let i = 0; i < e.dataTransfer.items.length; i++) {
        const item = e.dataTransfer.items[i];
        if (item && item.kind === 'file') {
          setIsDraggingFile(true);
          break;
        }
      }
    }
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    dragCounter.current -= 1;
    if (dragCounter.current <= 0) {
      dragCounter.current = 0;
      setIsDraggingFile(false);
    }
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    e.dataTransfer.dropEffect = 'copy';
  }, []);

  const handleDrop = useCallback(
    async (event: React.DragEvent<HTMLDivElement>) => {
      event.preventDefault();
      event.stopPropagation();
      dragCounter.current = 0;
      setIsDraggingFile(false);

      // 1. Check if user dropped a file (e.g. docker-compose.yml)
      if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
        const file = event.dataTransfer.files[0];
        if (!file) return;

        const fileName = (file.name || '').toLowerCase();
        const fileType = file.type || '';
        const isYaml =
          fileName.endsWith('.yml') ||
          fileName.endsWith('.yaml') ||
          fileType.includes('yaml') ||
          fileType.includes('text') ||
          fileName.includes('compose');

        if (!isYaml) {
          onToast?.(
            'error',
            isTr ? 'Desteklenmeyen Dosya Türü' : isPt ? 'Tipo de Arquivo Não Suportado' : 'Unsupported File Type',
            isTr
              ? 'Lütfen geçerli bir .yml veya .yaml Docker Compose dosyası sürükleyin.'
              : isPt
              ? 'Por favor, solte um arquivo .yml ou .yaml Docker Compose válido.'
              : 'Please drop a valid .yml or .yaml Docker Compose file.'
          );
          return;
        }

        try {
          const yamlText = await file.text();
          const result = parseDockerComposeYaml(yamlText);

          if (result.errors.length > 0) {
            onToast?.(
              'error',
              isTr ? 'YAML Ayrıştırma Hatası' : isPt ? 'Erro ao Analisar YAML' : 'YAML Parsing Error',
              result.errors[0]
            );
            return;
          }

          if (result.stackNodes.length === 0) {
            onToast?.(
              'error',
              isTr ? 'Geçerli Servis Bulunamadı' : isPt ? 'Nenhum Serviço Válido' : 'No Valid Services Found',
              isTr
                ? 'Dosya içinde ayrıştırılabilecek bir Docker servisi bulunamadı.'
                : isPt
                ? 'Nenhum serviço Docker analisável foi encontrado no arquivo.'
                : 'No parsable Docker services found in the file.'
            );
            return;
          }

          loadCustomStack(result.stackNodes, result.stackEdges);

          onToast?.(
            'success',
            isTr ? 'Compose İçe Aktarıldı! 🚀' : isPt ? 'Compose Importado! 🚀' : 'Compose Imported! 🚀',
            isTr
              ? `${result.stackNodes.length} servis tuvale yerleştirildi ve bağımlılıklar bağlandı.`
              : isPt
              ? `${result.stackNodes.length} serviços posicionados no canvas com dependências conectadas.`
              : `${result.stackNodes.length} services successfully placed on canvas.`
          );
          return;
        } catch (err: any) {
          onToast?.(
            'error',
            isTr ? 'Dosya Okunamadı' : isPt ? 'Erro ao Ler Arquivo' : 'Failed to Read File',
            err?.message ||
              (isTr ? 'Dosya okunurken bir hata oluştu.' : isPt ? 'Ocorreu um erro ao ler o arquivo.' : 'An error occurred while reading the file.')
          );
          return;
        }
      }

      // 2. Fallback to sidebar module drag
      const moduleId = event.dataTransfer.getData('application/xivizley-module');
      if (!moduleId) return;

      const target = event.currentTarget.getBoundingClientRect();
      const rawX = event.clientX - target.left - 100;
      const rawY = event.clientY - target.top - 40;

      const position = snapToGrid
        ? { x: Math.round(rawX / 20) * 20, y: Math.round(rawY / 20) * 20 }
        : { x: rawX, y: rawY };

      addModule(moduleId, position);
    },
    [snapToGrid, addModule, loadCustomStack, onToast, isTr, isPt]
  );

  // Minimap node colour based on module category
  const minimapNodeColor = useCallback((node: { data?: ModuleNodeData }) => {
    if (!node.data) return '#334155';
    const mod = MODULE_CATALOG.find((m) => m.id === node.data?.moduleId);
    return mod?.color ?? '#334155';
  }, []);

  const securityAudit = React.useMemo(() => auditStackSecurity(nodes), [nodes]);
  const updateEnvOverride = useArchitectStore((s) => s.updateEnvOverride);

  const handleAutoHarden = useCallback(() => {
    securityAudit.issues.forEach((issue) => {
      if (issue.autoFixable && issue.nodeId !== 'global' && issue.field) {
        const strongPass = generateSecureSecret(32);
        updateEnvOverride(issue.nodeId, issue.field, strongPass);
      }
    });
  }, [securityAudit, updateEnvOverride]);

  return (
    <div
      className="relative h-full w-full"
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragEnter={handleDragEnter}
      onDragLeave={handleDragLeave}
    >
      {/* High-Tech Drag & Drop Glowing Overlay */}
      {isDraggingFile && (
        <div className="pointer-events-none absolute inset-4 z-50 flex flex-col items-center justify-center rounded-[2px] border-2 border-dashed border-[#8B5CF6] bg-[#090514]/92 text-[#F5F3FF] shadow-[0_0_30px_rgba(139,92,246,0.2)] backdrop-blur-xl animate-in fade-in zoom-in-95 duration-150">
          <div className="relative mb-5 flex h-24 w-24 items-center justify-center rounded-[2px] border border-[#2B1A42] bg-[#120A21] ring-1 ring-[#8B5CF6]/50 shadow-2xl">
            <div className="absolute inset-0 rounded-[2px] bg-[#8B5CF6]/20 blur-xl animate-pulse" />
            <FileCode2 className="h-12 w-12 text-[#C084FC] animate-bounce" />
          </div>
          <div className="text-center px-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[2px] bg-[#120A21] border border-[#2B1A42] text-[#C084FC] text-xs font-mono font-bold mb-3 shadow-inner">
              <Sparkles className="h-3.5 w-3.5 text-[#8B5CF6]" />
              <span>DOCKER COMPOSE REVERSE ENGINEER</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-extrabold text-[#F5F3FF] tracking-tight">
              {isTr
                ? 'Docker Compose Dosyanızı Buraya Bırakın'
                : isPt
                ? 'Solte o Arquivo Docker Compose Aqui'
                : 'Drop Your Docker Compose File Here'}
            </h3>
            <p className="mt-2 text-xs sm:text-sm text-[#A19BAF] max-w-md mx-auto leading-relaxed">
              {isTr
                ? '.yml veya .yaml dosyanız saniyeler içinde görsel tuval mimarisine ve port bağlantı haritasına dönüştürülecektir.'
                : isPt
                ? 'Seu arquivo .yml ou .yaml será convertido em segundos na arquitetura visual e mapa de conexões.'
                : 'Your .yml or .yaml file will be converted into visual canvas topology and port map in seconds.'}
            </p>
          </div>
        </div>
      )}

      {/* Floating Canvas Action Toolbar */}
      {!isEmbed && <CanvasToolbar onOpenStackPacks={handleStackPacksTrigger} />}

      {/* Export Buttons */}
      {!isEmbed && <ExportButtons hasNodes={nodes.length > 0} onOpenStoryCard={handleStoryCardTrigger} />}

      {/* Embed Mode HUD */}
      {isEmbed && (
        <>
          {/* Top-left Branding Pill */}
          <div className="absolute top-3.5 left-3.5 z-30 flex items-center gap-2 rounded-xl border border-slate-800 bg-[#0a0f1a]/95 backdrop-blur-md px-3.5 py-1.5 shadow-2xl ring-1 ring-white/5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-400 shadow-[0_0_8px_#22d3ee]" />
            </span>
            <span className="text-xs font-extrabold text-white tracking-wider">XIVIZLEY</span>
            <span className="text-[10px] font-mono text-cyan-300 border-l border-slate-800 pl-2">
              {nodes.length} {isTr ? 'Servis' : isPt ? 'Serviços' : 'Services'}
            </span>
          </div>

          {/* Bottom-right Action Pill */}
          <div className="absolute bottom-3.5 right-3.5 z-30 flex items-center gap-2">
            <a
              href={`/architect${typeof window !== 'undefined' ? window.location.search : ''}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1.5 rounded-xl border border-cyan-500/40 bg-gradient-to-r from-cyan-950/90 to-blue-950/90 hover:from-cyan-900/90 hover:to-blue-900/90 backdrop-blur-md px-3.5 py-1.5 text-xs font-bold text-cyan-300 transition-all shadow-xl active:scale-95 group"
            >
              <span>{isTr ? 'Tuvali Stüdyoda Aç' : isPt ? 'Abrir no Studio' : 'Open in Studio'}</span>
              <ExternalLink className="h-3.5 w-3.5 text-cyan-400 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </a>
          </div>
        </>
      )}

      {/* Live Security Badge */}
      {!isEmbed && nodes.length > 0 && (
        <div className="hidden sm:flex absolute bottom-4 left-16 z-30 items-center gap-2.5 rounded-xl border border-slate-800 bg-[#0a0f1a]/95 backdrop-blur-md px-3.5 py-2 shadow-2xl ring-1 ring-white/5">
          <div
            className={cn(
              'flex h-7 w-7 items-center justify-center rounded-lg font-bold text-xs shadow-inner',
              securityAudit.score >= 85
                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                : securityAudit.score >= 60
                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                : 'bg-red-500/20 text-red-400 border border-red-500/30'
            )}
          >
            {securityAudit.grade}
          </div>
          <div className="text-left">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
              <Shield className="h-3 w-3 text-cyan-400" />
              <span>{isTr ? 'Güvenlik:' : isPt ? 'Segurança:' : 'Security:'}</span>
              <span
                className={cn(
                  'font-mono font-bold',
                  securityAudit.score >= 85
                    ? 'text-emerald-400'
                    : securityAudit.score >= 60
                    ? 'text-amber-400'
                    : 'text-red-400'
                )}
              >
                %{securityAudit.score}
              </span>
            </div>
            <p className="text-[10px] text-slate-500">
              {securityAudit.criticalCount > 0
                ? (isTr ? `${securityAudit.criticalCount} zayıf parola tespit edildi` : isPt ? `${securityAudit.criticalCount} senhas fracas detectadas` : `${securityAudit.criticalCount} weak passwords detected`)
                : (isTr ? 'Tüm kontroller onaylandı' : isPt ? 'Todas as verificações passaram' : 'All checks passed')}
            </p>
          </div>

          {securityAudit.issues.some((i) => i.autoFixable) && (
            <button
              onClick={handleAutoHarden}
              className="ml-1.5 flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-[11px] font-bold text-white shadow-md active:scale-95 transition-all"
              title={isTr ? 'Zayıf parolaları 32 karakterlik güçlü anahtarlarla otomatik değiştir' : isPt ? 'Substituir senhas fracas por chaves seguras de 32 caracteres' : 'Replace weak passwords with 32-char secure keys'}
            >
              <Wand2 className="h-3 w-3" />
              <span>{isTr ? 'Sağlamlaştır' : isPt ? 'Proteger' : 'Harden'}</span>
            </button>
          )}
        </div>
      )}

      {/* Mobile Telemetry Radar Pill */}
      <div className="md:hidden absolute top-4 right-4 z-20">
        <ClusterTelemetryRadar />
      </div>

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onNodeDragStart={onNodeDragStart}
        onInit={onInit}
        nodeTypes={nodeTypes}
        snapToGrid={snapToGrid}
        snapGrid={[20, 20]}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        defaultEdgeOptions={{
          animated: true,
          style: { stroke: '#8B5CF6', strokeWidth: 2, opacity: 0.85 },
        }}
        proOptions={{ hideAttribution: true }}
        className="bg-[#08090e]"
      >
        {/* Layer 1: High-Tech Cyber Grid Matrix */}
        <Background
          id="bg-cyber-lines"
          variant={BackgroundVariant.Lines}
          gap={48}
          size={1}
          color="rgba(14, 165, 233, 0.07)"
        />
        {/* Layer 2: Precision Crosshairs */}
        <Background
          id="bg-cyber-cross"
          variant={BackgroundVariant.Cross}
          gap={24}
          size={1}
          color="rgba(99, 102, 241, 0.12)"
        />

        {/* Ambient radial glow aura */}
        <div
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_35%,rgba(6,182,212,0.06),rgba(99,102,241,0.03),transparent_75%)] z-0"
          aria-hidden="true"
        />

        {/* Controls panel */}
        <Controls
          className="[&>button]:!bg-[#0e111a] [&>button]:!border-slate-800 [&>button]:!text-slate-400
                     [&>button:hover]:!bg-slate-800 [&>button:hover]:!text-indigo-300
                     [&>button]:transition-colors !border !border-slate-800/90 !rounded-2xl overflow-hidden shadow-xl"
          showInteractive={false}
        />

        {/* Minimap */}
        <MiniMap
          nodeColor={minimapNodeColor as (node: object) => string}
          maskColor="rgba(8,9,14,0.85)"
          className="!bg-[#0e111a]/95 !border !border-slate-800/90 !rounded-2xl shadow-xl"
          nodeStrokeWidth={2}
          zoomable
          pannable
        />

        {/* Empty state overlay */}
        {nodes.length === 0 && (
          <div className="pointer-events-auto absolute inset-0 flex flex-col items-center justify-center gap-5 px-4 sm:px-6 max-w-4xl mx-auto overflow-y-auto py-8 z-10">
            <div className="text-center">
              <div className="mb-3">
                <span className="inline-flex p-3 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 text-3xl shadow-[0_0_25px_rgba(6,182,212,0.25)]">
                  🖥️
                </span>
              </div>
              <p className="text-xl sm:text-3xl font-extrabold tracking-tight">
                <span className="text-white">{isTr ? 'Görsel Self-Host ' : isPt ? 'Estúdio Visual de ' : 'Visual Self-Host '}</span>
                <span className="heading-metallic">{isTr ? 'Mimarlık Stüdyosu' : isPt ? 'Arquitetura Self-Host' : 'Architecture Studio'}</span>
              </p>
              <p className="mt-2 text-xs sm:text-sm text-slate-300 max-w-md mx-auto leading-relaxed">
                {isTr
                  ? 'Soldaki modülleri tuvale sürükleyin veya tek tıkla optimize edilmiş hazır bir mimari yığınını başlatın:'
                  : isPt
                  ? 'Arraste os módulos da barra lateral para o canvas ou inicie uma stack otimizada com 1 clique:'
                  : 'Drag modules from the sidebar to the canvas or launch an optimized architecture stack with 1 click:'}
              </p>

              {/* Compose Drag & Drop Tip Pill */}
              <div className="mt-3 inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-cyan-500/30 bg-cyan-950/40 text-[11px] font-medium text-cyan-300 shadow-inner">
                <FileCode2 className="h-3.5 w-3.5 text-cyan-400" />
                <span>
                  {isTr
                    ? '💡 İpucu: Elinizdeki docker-compose.yml dosyasını doğrudan tuvale sürükleyip bırakabilirsiniz!'
                    : isPt
                    ? '💡 Dica: Você pode arrastar e soltar seu arquivo docker-compose.yml diretamente aqui!'
                    : '💡 Tip: You can drag & drop your docker-compose.yml file directly onto the canvas!'}
                </span>
              </div>
            </div>

            {/* 1-Click Stack Packs Grid */}
            <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              {STACK_PACKS.slice(0, 6).map((pack) => (
                <div
                  key={pack.id}
                  onClick={() => loadTemplate(pack.templateId)}
                  className="bento-card-3d group flex flex-col justify-between rounded-2xl border border-white/[0.08] bg-[#0e111a]/95 backdrop-blur-md p-4 text-left transition-all hover:border-cyan-500/50 hover:bg-[#131724] hover:shadow-xl hover:shadow-cyan-500/10 cursor-pointer active:scale-[0.98]"
                >
                  <div>
                    <div className="flex items-center justify-between gap-1 mb-2">
                      <span className="text-2xl">{pack.emoji}</span>
                      <span className={cn('text-[9px] font-semibold px-2 py-0.5 rounded-full border', pack.badgeColor)}>
                        {pack.badge}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-100 group-hover:text-cyan-300 transition-colors">
                      {pack.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                      {pack.desc}
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-white/[0.08] flex items-center justify-between text-[10px]">
                    <span className="text-cyan-400 font-mono font-medium">{pack.sponsorText.split(' ')[1]}</span>
                    <span className="text-cyan-400 font-bold group-hover:underline">{isTr ? '1-Tık Kur →' : isPt ? 'Instalar com 1-Clique →' : '1-Click Install →'}</span>
                  </div>
                </div>
              ))}
            </div>

            {/* View All Stack Packs CTA */}
            <div className="flex items-center justify-center w-full pt-1">
              <button
                onClick={handleStackPacksTrigger}
                className="btn-premium flex items-center gap-2 rounded-xl border border-cyan-500/40 bg-cyan-500/10 px-5 py-2.5 text-xs font-bold text-cyan-300 hover:bg-cyan-500/20 hover:text-white hover:border-cyan-400 transition-all shadow-md active:scale-95 cursor-pointer animate-neon-border"
              >
                <Sparkles className="h-3.5 w-3.5 text-cyan-400" />
                <span>{isTr ? `Tüm Hazır Paketleri İncele (${STACK_PACKS.length}) →` : isPt ? `Ver Todos os Pacotes (${STACK_PACKS.length}) →` : `Browse All Ready Packs (${STACK_PACKS.length}) →`}</span>
              </button>
            </div>

            {/* Quick-start single module presets */}
            <div className="flex flex-wrap items-center justify-center gap-2 pt-2 border-t border-white/[0.08] w-full">
              <span className="text-[11px] text-slate-500 mr-1">{isTr ? 'Tekil Modüller:' : isPt ? 'Módulos Individuais:' : 'Single Modules:'}</span>
              {QUICK_PRESETS.map((preset) => (
                <button
                  key={preset.templateId}
                  onClick={() => addModule(preset.moduleId)}
                  className="flex items-center gap-1.5 rounded-xl border border-white/[0.08] bg-slate-900/60 px-3 py-1 text-[11px] font-medium text-slate-300 transition-all hover:border-cyan-500/50 hover:text-white active:scale-95"
                >
                  <span className="text-xs">{preset.emoji}</span>
                  <span>{preset.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}
      </ReactFlow>

      {/* Floating Live Hardware Estimator */}
      {!isEmbed && <HardwareEstimator />}

      {/* Cmd/Ctrl + K Quick Search Modal */}
      {!isEmbed && <QuickSearchModal isOpen={isQuickSearchOpen} onClose={() => setIsQuickSearchOpen(false)} />}

      {/* Hazır Mimari Paketleri Modalı */}
      {!isEmbed && <QuickStackPacksModal isOpen={isStackPacksOpen} onClose={() => setIsStackPacksOpen(false)} />}

      {/* 9:16 Instagram Story Homelab Kimlik Kartı Modalı */}
      {!isEmbed && <StoryCardModal isOpen={isInternalStoryOpen} onClose={() => setIsInternalStoryOpen(false)} onToast={onToast} />}
    </div>
  );
}

// ─── Exported ArchitectCanvas with Provider ──────────────────

export interface ArchitectCanvasProps {
  onInit?: (instance: ReactFlowInstance) => void;
  onOpenStoryCard?: () => void;
  onOpenStackPacks?: () => void;
  onToast?: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
  isEmbed?: boolean;
}

export function ArchitectCanvas(props: ArchitectCanvasProps) {
  return (
    <ReactFlowProvider>
      <CanvasContent {...props} />
    </ReactFlowProvider>
  );
}
