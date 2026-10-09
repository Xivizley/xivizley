'use client';

// XIVIZLEY ModuleSidebar v3.2.1 — Clean 60-Module Dynamic Index
import React, { useCallback } from 'react';
import { cn } from '@/lib/utils';
import { MODULE_CATALOG, getAllCategories, getCategoryLabel } from '@/lib/data/modules';
import { STACK_TEMPLATES } from '@/lib/data/templates';
import { useArchitectStore } from '@/store/useArchitectStore';
import {
  Server, Search, Package, LayoutTemplate,
  ChevronLeft, ChevronRight, Box, Trash2, Sparkles, X,
} from 'lucide-react';


import { useTranslation, useI18nStore } from '@/lib/i18n/store';
import { getTemplateSponsor } from '@/lib/config/sponsors';
import { AIGeneratorModal } from './AIGeneratorModal';
import { CustomModuleModal } from '@/components/modals/CustomModuleModal';
import type { ModuleDefinition } from '@/lib/data/modules';

// ─── Individual draggable module chip ────────────────────────

interface DraggableModuleProps {
  moduleId: string;
}

function DraggableModule({ moduleId }: DraggableModuleProps) {
  const { t } = useTranslation();
  const addModule = useArchitectStore((s) => s.addModule);
  const moduleDef = MODULE_CATALOG.find((m) => m.id === moduleId);

  const onDragStart = useCallback(
    (event: React.DragEvent<HTMLDivElement>) => {
      event.dataTransfer.setData('application/xivizley-module', moduleId);
      event.dataTransfer.effectAllowed = 'copy';
    },
    [moduleId],
  );

  const onClick = useCallback(() => {
    addModule(moduleId);
  }, [addModule, moduleId]);

  if (!moduleDef) return null;

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onClick={onClick}
      role="button"
      tabIndex={0}
      onKeyDown={(e) => e.key === 'Enter' && onClick()}
      aria-label={`${moduleDef.name} ${t('architect.addModuleToCanvas')}`}
      className={cn(
        'group flex cursor-grab items-center gap-2.5 rounded-[2px] border border-[#2B1A42]',
        'bg-[#120A21] px-3 py-2 transition-all duration-150 select-none',
        'hover:border-[#8B5CF6] hover:bg-[#150C28] hover:shadow-lg hover:shadow-[#8B5CF6]/10',
        'active:cursor-grabbing active:scale-95',
        'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-[#8B5CF6]',
      )}
    >
      {/* Colour indicator */}
      <div
        className="h-2 w-2 shrink-0 rounded-[1px] shadow-sm"
        style={{ background: moduleDef.color, boxShadow: `0 0 6px ${moduleDef.color}` }}
        aria-hidden
      />
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-mono font-semibold text-[#F5F3FF] group-hover:text-white transition-colors">
          {moduleDef.name}
        </p>
        {moduleDef.ports.length > 0 && (
          <p className="font-mono text-[10px] text-[#8B7D9E] group-hover:text-[#C084FC] transition-colors truncate">
            {moduleDef.ports
              .slice(0, 3)
              .map((p) => p.default)
              .join(', ')}
            {moduleDef.ports.length > 3 ? '…' : ''}
          </p>
        )}
      </div>
      <Package className="h-3.5 w-3.5 shrink-0 text-[#8B7D9E] group-hover:text-[#C084FC] transition-colors" />
    </div>
  );
}

// ─── Module Sidebar ───────────────────────────────────────────

export function ModuleSidebar() {
  const { t } = useTranslation();
  const lang = useI18nStore((s) => s.lang);
  const isTr = lang === 'tr';
  const isPt = lang === 'pt';
  const [isCollapsed, setIsCollapsed] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState<'modules' | 'templates'>('modules');
  const [search, setSearch] = React.useState('');
  const [activeCategory, setActiveCategory] = React.useState<string | null>(null);

  // Shortcut: Cmd/Ctrl + B to toggle sidebar
  React.useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'b') {
        e.preventDefault();
        setIsCollapsed((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  const [pendingTemplateId, setPendingTemplateId] = React.useState<string | null>(null);
  const [aiModalOpen, setAiModalOpen] = React.useState(false);
  const [customModalOpen, setCustomModalOpen] = React.useState(false);
  const [customModules, setCustomModules] = React.useState<ModuleDefinition[]>(() => {
    if (typeof window === 'undefined') return [];
    try {
      const saved = localStorage.getItem('xivizley_custom_modules');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const handleAddCustomModule = React.useCallback((newModule: ModuleDefinition) => {
    setCustomModules((prev) => {
      const updated = [...prev, newModule];
      try {
        localStorage.setItem('xivizley_custom_modules', JSON.stringify(updated));
      } catch {}
      return updated;
    });

    // Also register in MODULE_CATALOG in memory if not already present
    if (!MODULE_CATALOG.some((m) => m.id === newModule.id)) {
      MODULE_CATALOG.push(newModule);
    }
  }, []);
  
  const applyAiResult = React.useCallback(
    (
      nodes: Array<{ id: string; moduleId: string; x: number; y: number }>,
      edges: Array<{ source: string; target: string }>,
    ) => {
    const store = useArchitectStore.getState();
    const idMap = new Map<string, string>();

    nodes.forEach(node => {
      store.addModule(node.moduleId, { x: node.x, y: node.y });
      const addedNodeId = useArchitectStore.getState().selectedNodeId;
      if (addedNodeId) {
        idMap.set(node.id, addedNodeId);
      }
    });

    edges.forEach(edge => {
      const source = idMap.get(edge.source);
      const target = idMap.get(edge.target);
      if (source && target) {
        store.onConnect({ source, target, sourceHandle: null, targetHandle: null });
      }
    });
  }, []);
  
  const conflictCount = useArchitectStore((s) => s.conflictMap.size);
  const nodeCount = useArchitectStore((s) => s.nodes.length);
  const clearCanvas = useArchitectStore((s) => s.clearCanvas);
  const loadTemplate = useArchitectStore((s) => s.loadTemplate);

  const categories = getAllCategories();

  const filteredByCategory = React.useMemo(() => {
    const q = search.toLowerCase();
    return categories.map((cat) => ({
      category: cat,
      label: getCategoryLabel(cat, lang),
      modules: MODULE_CATALOG.filter(
        (m) =>
          m.category === cat &&
          (activeCategory === null || m.category === activeCategory) &&
          (q === '' || m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q)),
      ),
    })).filter((g) => g.modules.length > 0);
  }, [search, categories, activeCategory, lang]);

  const filteredTemplates = React.useMemo(() => {
    const q = search.toLowerCase().trim();
    return STACK_TEMPLATES.filter(
      (t) =>
        q === '' ||
        t.title.toLowerCase().includes(q) ||
        t.subtitle.toLowerCase().includes(q) ||
        t.description.toLowerCase().includes(q) ||
        t.tags.some((s) => s.toLowerCase().includes(q))
    );
  }, [search]);


  const handleTemplateClick = (templateId: string) => {
    if (nodeCount > 0) {
      setPendingTemplateId(templateId);
    } else {
      loadTemplate(templateId);
    }
  };

  const confirmTemplateLoad = () => {
    if (pendingTemplateId) {
      loadTemplate(pendingTemplateId);
      setPendingTemplateId(null);
    }
  };

  if (isCollapsed) {
    return (
      <aside
        className="flex h-full w-12 shrink-0 flex-col items-center justify-between border-r border-[#2B1A42] bg-[#0D0719] backdrop-blur-md py-3 z-20"
        aria-label={isTr ? 'Kompakt Menü' : isPt ? 'Menu Compacto' : 'Compact Menu'}
      >
        <div className="flex flex-col items-center gap-3">
          {/* Expand toggle */}
          <button
            onClick={() => setIsCollapsed(false)}
            className="flex h-8 w-8 items-center justify-center rounded-[2px] text-[#8B7D9E] hover:bg-[#1E1235] hover:text-[#C084FC] transition-all"
            title={isTr ? 'Menüyü Genişlet (⌘B)' : isPt ? 'Expandir Menu (⌘B)' : 'Expand Menu (⌘B)'}
          >
            <ChevronRight className="h-4 w-4" />
          </button>

          <div className="h-px w-6 bg-[#2B1A42] my-1" />

          {/* Modules shortcut */}
          <button
            onClick={() => {
              setIsCollapsed(false);
              setActiveTab('modules');
            }}
            className="flex h-8 w-8 items-center justify-center rounded-[2px] text-[#8B7D9E] hover:bg-[#1E1235] hover:text-[#C084FC] transition-all"
            title={isTr ? 'Modül Kütüphanesi' : isPt ? 'Biblioteca de Módulos' : 'Module Library'}
          >
            <Package className="h-4 w-4" />
          </button>

          {/* Templates shortcut */}
          <button
            onClick={() => {
              setIsCollapsed(false);
              setActiveTab('templates');
            }}
            className="flex h-8 w-8 items-center justify-center rounded-[2px] text-[#8B7D9E] hover:bg-[#1E1235] hover:text-[#C084FC] transition-all"
            title={isTr ? 'Hazır Şablonlar' : isPt ? 'Modelos Prontos' : 'Ready Templates'}
          >
            <LayoutTemplate className="h-4 w-4" />
          </button>

          {/* AI Generator shortcut */}
          <button
            onClick={() => setAiModalOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-[2px] text-[#C084FC] hover:bg-[#1E1235] transition-all"
            title={isTr ? 'AI Mimar ile Tasarla' : isPt ? 'Criar com Arquiteto IA' : 'Design with AI Architect'}
          >
            <Sparkles className="h-4 w-4" />
          </button>

          {/* Custom Module shortcut */}
          <button
            onClick={() => setCustomModalOpen(true)}
            className="flex h-8 w-8 items-center justify-center rounded-[2px] text-[#C084FC] hover:bg-[#1E1235] transition-all"
            title={isTr ? '+ Özel Docker Modülü Ekle' : isPt ? '+ Adicionar Módulo Docker' : '+ Add Custom Docker Module'}
          >
            <Box className="h-4 w-4" />
          </button>
        </div>

        {/* Clear canvas shortcut */}
        <button
          onClick={clearCanvas}
          disabled={nodeCount === 0}
          className="flex h-8 w-8 items-center justify-center rounded-[2px] text-[#8B7D9E] hover:text-red-400 hover:bg-red-950/30 disabled:opacity-30 disabled:cursor-not-allowed transition-all"
          title={isTr ? 'Tuvali Temizle' : isPt ? 'Limpar Canvas' : 'Clear Canvas'}
        >
          <Trash2 className="h-4 w-4" />
        </button>

        <AIGeneratorModal 
          isOpen={aiModalOpen} 
          onClose={() => setAiModalOpen(false)} 
          onApply={applyAiResult} 
        />

        <CustomModuleModal
          isOpen={customModalOpen}
          onClose={() => setCustomModalOpen(false)}
          onAddModule={handleAddCustomModule}
        />
      </aside>
    );
  }

  return (
    <aside
      className={cn(
        'flex h-full w-60 lg:w-64 shrink-0 flex-col border-r border-[#2B1A42]',
        'bg-[#0D0719] backdrop-blur-md transition-all duration-200',
      )}
      aria-label={t('architect.moduleLibrary')}
    >
      {/* Header */}
      <div className="border-b border-[#2B1A42] px-3.5 py-3">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-2">
            <Server className="h-4 w-4 text-[#C084FC]" />
            <h2 className="text-sm font-mono font-semibold text-[#F5F3FF]">{t('architect.moduleLibrary')}</h2>
          </div>
          <button
            onClick={() => setIsCollapsed(true)}
            className="flex h-6 w-6 items-center justify-center rounded-[2px] text-[#8B7D9E] hover:bg-[#1E1235] hover:text-[#F5F3FF] transition-colors"
            title={isTr ? 'Menüyü Daralt (⌘B)' : isPt ? 'Recolher Menu (⌘B)' : 'Collapse Menu (⌘B)'}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
        </div>

        {/* Stats bar */}
        <div className="flex gap-2 text-[10px] mb-3 font-mono">
          <span className="rounded-[2px] bg-[#090514] border border-[#2B1A42] px-2 py-1 text-[#A19BAF]">
            <span className="text-[#F5F3FF] font-semibold">{nodeCount}</span> {t('architect.nodes')}
          </span>
          {conflictCount > 0 && (
            <span className="rounded-[2px] bg-red-950/60 border border-red-500/50 px-2 py-1 text-red-400">
              <span className="text-red-300 font-semibold">{conflictCount}</span> {t('architect.conflicts')}
            </span>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-[#090514] p-1 rounded-[2px] border border-[#2B1A42] mb-3">
          <button
            onClick={() => setActiveTab('modules')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-mono font-semibold rounded-[2px] transition-all',
              activeTab === 'modules' ? 'bg-[#7C3AED] text-white shadow-sm' : 'text-[#A19BAF] hover:text-[#F5F3FF]'
            )}
          >
            <Package className="h-3.5 w-3.5" />
            {isTr ? 'Modüller' : isPt ? 'Módulos' : 'Modules'}
          </button>
          <button
            onClick={() => setActiveTab('templates')}
            className={cn(
              'flex-1 flex items-center justify-center gap-2 py-1.5 text-xs font-mono font-semibold rounded-[2px] transition-all',
              activeTab === 'templates' ? 'bg-[#7C3AED] text-white shadow-sm' : 'text-[#A19BAF] hover:text-[#F5F3FF]'
            )}
          >
            <LayoutTemplate className="h-3.5 w-3.5" />
            {isTr ? 'Şablonlar' : isPt ? 'Modelos' : 'Templates'}
          </button>
        </div>

        {/* AI Button */}
        <button
          onClick={() => setAiModalOpen(true)}
          className="w-full mb-3 flex items-center justify-center gap-2 rounded-[2px] bg-[#120A21] border border-[#8B5CF6]/50 py-2 text-xs font-mono font-bold text-[#C084FC] shadow-sm transition-all hover:bg-[#1E1235] hover:border-[#8B5CF6] hover:text-white active:scale-95"
        >
          <Sparkles className="h-3.5 w-3.5 text-[#C084FC]" />
          {isTr ? 'AI ile Oluştur' : isPt ? 'Criar com IA' : 'Generate with AI'}
        </button>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8B7D9E] pointer-events-none" />
          <input
            type="search"
            id="module-search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={t('architect.searchModules')}
            className={cn(
              'w-full rounded-[2px] border border-[#2B1A42] bg-[#090514] pl-8 py-1.5',
              search ? 'pr-7' : 'pr-3',
              'text-xs font-mono text-[#F5F3FF] placeholder-[#5E4E77]',
              'focus:outline-none focus:border-[#8B5CF6]',
              'transition-colors',
            )}
          />
          {search && (
            <button
              onClick={() => setSearch('')}
              className="absolute right-2 top-1/2 -translate-y-1/2 text-[#8B7D9E] hover:text-[#F5F3FF] transition-colors"
              aria-label={isTr ? 'Aramayı temizle' : isPt ? 'Limpar busca' : 'Clear search'}
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>

        {/* Category filter chips */}
        <div className="mt-2 flex gap-1 overflow-x-auto scrollbar-none pb-0.5">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(activeCategory === cat ? null : cat)}
              className={cn(
                'shrink-0 rounded-[2px] border px-2.5 py-1 text-[10px] font-mono font-medium transition-all',
                activeCategory === cat
                  ? 'bg-[#7C3AED] border-[#8B5CF6] text-white shadow-sm'
                  : 'border-[#2B1A42] bg-[#120A21] text-[#A19BAF] hover:text-[#F5F3FF] hover:border-[#8B5CF6]'
              )}
            >
              {getCategoryLabel(cat, lang)}
            </button>
          ))}
        </div>

        {/* Quick Add Custom Container Button */}
        {activeTab === 'modules' && (
          <button
            onClick={() => setCustomModalOpen(true)}
            className="mt-2.5 w-full flex items-center justify-center gap-1.5 rounded-[2px] border border-dashed border-[#8B5CF6]/40 bg-[#120A21] hover:bg-[#1E1235] hover:border-[#8B5CF6] py-1.5 text-[11px] font-mono font-semibold text-[#C084FC] hover:text-white transition-all shadow-sm"
          >
            <Sparkles className="h-3 w-3 text-[#C084FC]" />
            <span>{isTr ? '+ Özel Docker Modülü Ekle' : isPt ? '+ Adicionar Módulo Docker' : '+ Add Custom Docker Module'}</span>
          </button>
        )}
      </div>

      {/* List Container */}
      <div className="flex-1 overflow-y-auto py-2 scrollbar-thin scrollbar-thumb-[#2B1A42] scrollbar-track-transparent">
        {activeTab === 'modules' ? (
          <>
            {/* Custom Modules Section if any */}
            {customModules.length > 0 && (
              <div className="mb-2">
                <p className="px-4 py-1.5 text-[10px] font-mono font-bold uppercase tracking-widest text-[#C084FC] flex items-center gap-1.5">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#C084FC] animate-pulse"></span>
                  {isTr ? 'Özel Modüllerim' : isPt ? 'Meus Módulos' : 'Custom Modules'} ({customModules.length})
                </p>
                <div className="px-3 space-y-1">
                  {customModules.map((m) => (
                    <DraggableModule key={m.id} moduleId={m.id} />
                  ))}
                </div>
              </div>
            )}

            {filteredByCategory.length === 0 && customModules.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs font-mono text-[#8B7D9E]">
                {t('architect.noModulesFound')}
              </div>
            ) : (
              filteredByCategory.map(({ category, label, modules }) => (
                <div key={category} className="mb-1">
                  <p className="px-4 py-1.5 text-[10px] font-mono font-semibold uppercase tracking-widest text-[#8B7D9E]">
                    {label}
                  </p>
                  <div className="px-3 space-y-1">
                    {modules.map((m) => (
                      <DraggableModule key={m.id} moduleId={m.id} />
                    ))}
                  </div>
                </div>
              ))
            )}
          </>
        ) : (
          /* Templates List */
          <div className="px-3 space-y-2 pb-2">
            {filteredTemplates.length === 0 ? (
              <div className="px-4 py-8 text-center text-xs font-mono text-[#8B7D9E]">
                {isTr ? 'Şablon bulunamadı.' : isPt ? 'Nenhum modelo encontrado.' : 'No templates found.'}
              </div>
            ) : (
              filteredTemplates.map((tpl) => {
                return (
                  <button
                    key={tpl.id}
                    onClick={() => handleTemplateClick(tpl.id)}
                    className="w-full text-left group flex flex-col gap-2 rounded-[2px] border border-[#2B1A42] bg-[#120A21] p-3 transition-all duration-150 hover:border-[#8B5CF6] hover:bg-[#150C28] focus:outline-none focus:border-[#8B5CF6]"
                  >
                    <div className="flex items-center justify-between gap-1">
                      <div className="flex items-center gap-2 min-w-0">
                        <div
                          className="flex h-7 w-7 items-center justify-center rounded-[2px] border text-sm shrink-0"
                          style={{
                            background: tpl.color + '22',
                            borderColor: tpl.color + '55',
                          }}
                        >
                          {tpl.icon}
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-mono font-semibold text-[#F5F3FF] group-hover:text-[#C084FC] truncate">
                            {tpl.title}
                          </p>
                          <p className="text-[9px] text-[#8B7D9E] font-mono truncate">{tpl.subtitle}</p>
                        </div>
                      </div>
                      {(() => {
                        const sponsor = getTemplateSponsor(tpl.id);
                        if (sponsor) {
                          return (
                            <span className="shrink-0 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-[2px] border border-[#8B5CF6]/40 bg-[#120A21] text-[#C084FC]">
                              ⚡ {sponsor.sponsorName}
                            </span>
                          );
                        }
                        if (tpl.isPro) {
                          return (
                            <span className="shrink-0 text-[8px] font-mono font-bold px-1.5 py-0.5 rounded-[2px] border border-[#8B5CF6]/40 bg-[#120A21] text-[#C084FC]">
                              {isTr ? 'Gelişmiş' : isPt ? 'Avançado' : 'Advanced'}
                            </span>
                          );
                        }
                        return (
                          <span className="shrink-0 text-[8px] font-mono font-semibold px-1.5 py-0.5 rounded-[2px] border border-[#2B1A42] bg-[#090514] text-[#8B7D9E]">
                            {tpl.difficulty}
                          </span>
                        );
                      })()}
                    </div>
                    {getTemplateSponsor(tpl.id) && (
                      <p className="text-[9px] text-[#C084FC] font-mono font-medium mb-1">
                        {isTr ? '🤝 Sponsorlu / İş Ortaklığı' : isPt ? '🤝 Patrocinado / Parceria' : '🤝 Sponsored / Partner'}
                      </p>
                    )}
                    <p className="text-[10px] leading-relaxed text-[#A19BAF] line-clamp-2">
                      {tpl.description}
                    </p>
                    <div className="flex items-center justify-between text-[10px] text-[#8B7D9E] pt-1 border-t border-[#2B1A42] font-mono">
                      <span>{tpl.moduleIds.length} {isTr ? 'servis' : isPt ? 'serviços' : 'services'} • Min {tpl.minRamGB}GB</span>
                      <span className="text-[#C084FC] font-bold group-hover:underline">{isTr ? 'Yükle (Ücretsiz) →' : isPt ? 'Carregar (Grátis) →' : 'Load (Free) →'}</span>
                    </div>
                  </button>
                );
              })
            )}
          </div>
        )}
      </div>

      {/* Footer actions */}
      <div className="border-t border-[#2B1A42] px-3 py-2">
        <button
          onClick={clearCanvas}
          disabled={nodeCount === 0}
          className={cn(
            'w-full rounded-[2px] border px-3 py-1.5 text-xs font-mono font-medium transition-all',
            nodeCount === 0
              ? 'border-[#2B1A42] text-[#5E4E77] cursor-not-allowed'
              : 'border-red-900/60 text-red-400 hover:bg-red-950/40 hover:border-red-800',
          )}
          aria-label={t('architect.clearCanvasAria')}
        >
          {t('architect.clearCanvas')}
        </button>
      </div>

      {/* Confirmation Modal */}
      {pendingTemplateId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-[2px] border border-[#2B1A42] bg-[#120A21] p-5 shadow-2xl">
            <h3 className="mb-2 text-lg font-mono font-semibold text-[#F5F3FF]">{isTr ? 'Tuvali Temizle?' : isPt ? 'Limpar Canvas?' : 'Clear Canvas?'}</h3>
            <p className="mb-6 text-sm font-mono text-[#A19BAF]">
              {isTr ? 'Şablonu yüklediğinizde mevcut tuvaldeki tüm mimari temizlenecektir. Devam etmek istediğinize emin misiniz?' : isPt ? 'Carregar o modelo substituirá a arquitetura atual. Tem certeza de que deseja continuar?' : 'Loading this template will clear your current canvas. Are you sure you want to continue?'}
            </p>
            <div className="flex justify-end gap-3 font-mono">
              <button
                onClick={() => setPendingTemplateId(null)}
                className="rounded-[2px] px-4 py-2 text-sm font-medium text-[#A19BAF] hover:bg-[#1E1235] hover:text-[#F5F3FF] border border-[#2B1A42] transition-colors"
              >
                {isTr ? 'İptal' : isPt ? 'Cancelar' : 'Cancel'}
              </button>
              <button
                onClick={confirmTemplateLoad}
                className="rounded-[2px] bg-[#8B5CF6] hover:bg-[#7C3AED] px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors"
              >
                {isTr ? 'Evet, Şablonu Yükle' : isPt ? 'Sim, Carregar Modelo' : 'Yes, Load Template'}
              </button>
            </div>
          </div>
        </div>
      )}

      <AIGeneratorModal 
        isOpen={aiModalOpen} 
        onClose={() => setAiModalOpen(false)} 
        onApply={applyAiResult} 
      />

      <CustomModuleModal
        isOpen={customModalOpen}
        onClose={() => setCustomModalOpen(false)}
        onAddModule={handleAddCustomModule}
      />
    </aside>
  );
}
