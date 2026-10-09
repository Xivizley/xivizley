'use client';

// ============================================================
// Architect Page — /app/(builder)/architect/page.tsx
// Fully synchronized with Master 60-Module Catalog
// ReactFlow + Zustand client-side architecture canvas
// ============================================================

import React, { useState } from 'react';
import dynamic from 'next/dynamic';
import { Navbar } from '@/components/shared/Navbar';
import { ModuleSidebar } from '@/components/sidebar/ModuleSidebar';
import { OutputPanel } from '@/components/output/OutputPanel';
import { useArchitectStore } from '@/store/useArchitectStore';
import { Loader2 } from 'lucide-react';
import { ToastContainer } from '@/components/shared/Toast';
import { useToast } from '@/lib/hooks/useToast';
import { MobileNoticeBanner } from '@/components/shared/MobileNoticeBanner';

import { useI18nStore } from '@/lib/i18n/store';

function CanvasLoading() {
  const { lang } = useI18nStore();
  const text = lang === 'tr' ? 'Tuval yükleniyor...' : lang === 'pt' ? 'Carregando tela...' : 'Loading canvas...';
  return (
    <div className="flex h-full w-full items-center justify-center bg-[#090514]">
      <div className="flex flex-col items-center gap-3 text-[#8B7D9E]">
        <Loader2 className="h-8 w-8 animate-spin text-[#8B5CF6]" />
        <p className="text-sm font-mono font-medium text-[#A19BAF]">{text}</p>
      </div>
    </div>
  );
}

// Dynamically import ReactFlow to avoid SSR issues and reduce initial bundle size
const ArchitectCanvas = dynamic(
  () => import('@/components/canvas/ArchitectCanvas').then((m) => m.ArchitectCanvas),
  {
    ssr: false,
    loading: () => <CanvasLoading />,
  },
);

import { DeployModal } from '@/components/modals/DeployModal';
import { AIAssistantModal } from '@/components/modals/AIAssistantModal';
import { CommandPalette } from '@/components/modals/CommandPalette';
import { ComposeImportModal } from '@/components/modals/ComposeImportModal';
import { CustomContainerModal } from '@/components/modals/CustomContainerModal';
import { AIDoctorModal } from '@/components/modals/AIDoctorModal';
import { TerminalSimulatorModal } from '@/components/modals/TerminalSimulatorModal';
import { ProModal } from '@/components/modals/ProModal';
import { DomainWizardModal } from '@/components/modals/DomainWizardModal';
import { LiveAgentModal } from '@/components/modals/LiveAgentModal';
import { ShareModal } from '@/components/modals/ShareModal';
import { StoryCardModal } from '@/components/modals/StoryCardModal';
import { QuickStackPacksModal } from '@/components/canvas/QuickStackPacksModal';
import { OnboardingTour } from '@/components/onboarding/OnboardingTour';
import { BlueprintModal } from '@/components/modals/BlueprintModal';

export default function ArchitectPage() {
  const conflictCount = useArchitectStore((s) => s.conflictMap.size);
  const isPanelOpen = useArchitectStore((s) => s.isPanelOpen);
  const togglePanel = useArchitectStore((s) => s.togglePanel);

  const [isDeployOpen, setIsDeployOpen] = useState(false);
  const [isBlueprintOpen, setIsBlueprintOpen] = useState(false);
  const [isAIOpen, setIsAIOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);
  const [isImportOpen, setIsImportOpen] = useState(false);
  const [isDoctorOpen, setIsDoctorOpen] = useState(false);
  const [isCustomContainerOpen, setIsCustomContainerOpen] = useState(false);
  const [isSimulatorOpen, setIsSimulatorOpen] = useState(false);
  const [isProOpen, setIsProOpen] = useState(false);
  const [isDomainWizardOpen, setIsDomainWizardOpen] = useState(false);
  const [isLiveAgentOpen, setIsLiveAgentOpen] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);
  const [isStoryCardOpen, setIsStoryCardOpen] = useState(false);
  const [isStackPacksOpen, setIsStackPacksOpen] = useState(false);

  const { toasts, toast, dismiss } = useToast();
  const loadFromJson = useArchitectStore((s) => s.loadFromJson);

  // Global Ctrl+K / Cmd+K listener
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Load from URL param on mount
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    const canvasParam = params.get('canvas');
    if (canvasParam) {
      try {
        const json = decodeURIComponent(escape(atob(
          canvasParam.replace(/-/g, '+').replace(/_/g, '/') + '=='.slice((canvasParam.length * 3) % 3 === 0 ? 0 : 1)
        )));
        loadFromJson(json);
        return;
      } catch {
        console.warn('[XIVIZLEY] Invalid canvas URL param');
      }
    }

    // Template query param (e.g. ?template=ai-studio)
    const templateParam = params.get('template');
    if (templateParam) {
      useArchitectStore.getState().loadTemplate(templateParam);
      return;
    }

    // Modules query param (e.g. ?modules=jellyfin,radarr,sonarr)
    const modulesParam = params.get('modules');
    if (modulesParam) {
      const moduleIds = modulesParam.split(',').map((s) => s.trim()).filter(Boolean);
      if (moduleIds.length > 0) {
        useArchitectStore.getState().clearCanvas();
        moduleIds.forEach((id, idx) => {
          const col = idx % 3;
          const row = Math.floor(idx / 3);
          useArchitectStore.getState().addModule(id, { x: 100 + col * 260, y: 100 + row * 240 });
        });
      }
    }
  }, [loadFromJson]);

  // Load autosave on first mount (only if no URL param)
  React.useEffect(() => {
    if (typeof window === 'undefined') return;
    const params = new URLSearchParams(window.location.search);
    if (params.get('canvas') || params.get('modules') || params.get('template')) return; // URL param takes priority
    const saved = localStorage.getItem('xivizley_autosave');
    if (saved) {
      try {
        loadFromJson(saved);
      } catch {
        // ignore
      }
    }
  }, [loadFromJson]);

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#090514]">
      {/* Top navbar with Command, Import, AI, Deploy & Simulator hooks */}
      <Navbar
        conflictCount={conflictCount}
        onOpenAI={() => setIsAIOpen(true)}
        onOpenDeploy={() => setIsDeployOpen(true)}
        onOpenBlueprint={() => setIsBlueprintOpen(true)}
        onOpenImport={() => setIsImportOpen(true)}
        onOpenAIDoctor={() => setIsDoctorOpen(true)}
        onOpenCustomContainer={() => setIsCustomContainerOpen(true)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
        onOpenTerminalSimulator={() => setIsSimulatorOpen(true)}
        onOpenPro={() => setIsProOpen(true)}
        onOpenDomainWizard={() => setIsDomainWizardOpen(true)}
        onOpenLiveAgent={() => setIsLiveAgentOpen(true)}
        onOpenShare={() => setIsShareOpen(true)}
        onOpenStoryCard={() => setIsStoryCardOpen(true)}
        onOpenStackPacks={() => setIsStackPacksOpen(true)}
        onToast={toast}
      />

      {/* Mobile viewport notice */}
      <MobileNoticeBanner />

      {/* Main 3-column layout */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left: Module sidebar */}
        <ModuleSidebar />

        {/* Center: ReactFlow canvas */}
        <main className="relative flex-1 overflow-hidden">
          <h1 className="sr-only">XIVIZLEY — Görsel Homelab & Docker Compose Mimarı</h1>
          <ArchitectCanvas
            onOpenStoryCard={() => setIsStoryCardOpen(true)}
            onOpenStackPacks={() => setIsStackPacksOpen(true)}
            onToast={toast}
          />
        </main>

        {/* Right: Output / Configure panel */}
        <OutputPanel
          isOpen={isPanelOpen}
          onToggle={togglePanel}
          onOpenDeploy={() => setIsDeployOpen(true)}
        />
      </div>

      {/* Modals */}
      <DeployModal isOpen={isDeployOpen} onClose={() => setIsDeployOpen(false)} />
      <BlueprintModal isOpen={isBlueprintOpen} onClose={() => setIsBlueprintOpen(false)} />
      <AIAssistantModal isOpen={isAIOpen} onClose={() => setIsAIOpen(false)} />
      <AIDoctorModal
        isOpen={isDoctorOpen}
        onClose={() => setIsDoctorOpen(false)}
        onToast={toast}
      />
      <CustomContainerModal
        isOpen={isCustomContainerOpen}
        onClose={() => setIsCustomContainerOpen(false)}
        onToast={toast}
      />
      <TerminalSimulatorModal isOpen={isSimulatorOpen} onClose={() => setIsSimulatorOpen(false)} />
      <ProModal
        isOpen={isProOpen}
        onClose={() => setIsProOpen(false)}
        onOpenStoryCard={() => {
          setIsProOpen(false);
          setIsStoryCardOpen(true);
        }}
      />
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        onOpenStoryCard={() => setIsStoryCardOpen(true)}
        onToast={toast}
      />
      <StoryCardModal
        isOpen={isStoryCardOpen}
        onClose={() => setIsStoryCardOpen(false)}
        onToast={toast}
      />
      <QuickStackPacksModal
        isOpen={isStackPacksOpen}
        onClose={() => setIsStackPacksOpen(false)}
      />
      <DomainWizardModal
        isOpen={isDomainWizardOpen}
        onClose={() => setIsDomainWizardOpen(false)}
        onToast={toast}
      />
      <LiveAgentModal
        isOpen={isLiveAgentOpen}
        onClose={() => setIsLiveAgentOpen(false)}
        onToast={toast}
      />
      <CommandPalette
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
        onOpenAI={() => setIsAIOpen(true)}
        onOpenDeploy={() => setIsDeployOpen(true)}
        onToast={toast}
      />
      <ComposeImportModal
        isOpen={isImportOpen}
        onClose={() => setIsImportOpen(false)}
        onToast={toast}
      />
      <ToastContainer toasts={toasts} onDismiss={dismiss} />
      <OnboardingTour />
    </div>
  );
}
