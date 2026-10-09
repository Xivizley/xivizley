'use client';

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Search, Sparkles, LayoutGrid, UploadCloud, Download, Terminal, Crown, Trash2, Box, type LucideIcon } from 'lucide-react';
import { MODULE_CATALOG } from '@/lib/data/modules';
import { PREDEFINED_TEMPLATES } from '@/lib/data/templates';
import { useArchitectStore } from '@/store/useArchitectStore';
import { useI18nStore } from '@/lib/i18n/store';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenImport: () => void;
  onOpenDeploy: () => void;
  onOpenPro: () => void;
  onExportPng: () => void;
  onExportSvg: () => void;
  onToast?: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

interface PaletteItem {
  id: string;
  name: string;
  desc?: string;
  category: string;
  icon: LucideIcon;
  color?: string;
  run: () => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onOpenImport,
  onOpenDeploy,
  onOpenPro,
  onExportPng,
  onExportSvg,
  onToast,
}: CommandPaletteProps) {
  const lang = useI18nStore((s) => s.lang);
  const isTr = lang === 'tr';
  const isPt = lang === 'pt';

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  const addModule = useArchitectStore((s) => s.addModule);
  const autoLayout = useArchitectStore((s) => s.autoLayout);
  const clearCanvas = useArchitectStore((s) => s.clearCanvas);
  const loadTemplate = useArchitectStore((s) => s.loadTemplate);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setQuery('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Actions list
  const actions: PaletteItem[] = useMemo(
    () => [
      {
        id: 'act-layout',
        name: isTr ? 'Akıllı Otomatik Hizalama (Auto-Layout)' : isPt ? 'Auto-Organização Inteligente (Auto-Layout)' : 'Smart Auto-Layout',
        category: isTr ? 'Aksiyonlar' : isPt ? 'Ações' : 'Actions',
        icon: LayoutGrid,
        run: () => {
          autoLayout();
          onToast?.('success', isTr ? 'Düzenlendi!' : isPt ? 'Organizado!' : 'Organized!', isTr ? 'Modüller simetrik olarak dizildi.' : isPt ? 'Módulos organizados simetricamente.' : 'Modules arranged symmetrically.');
        },
      },
      {
        id: 'act-import',
        name: isTr ? 'Docker Compose YAML İçe Aktar' : isPt ? 'Importar Docker Compose YAML' : 'Import Docker Compose YAML',
        category: isTr ? 'Aksiyonlar' : isPt ? 'Ações' : 'Actions',
        icon: UploadCloud,
        run: () => onOpenImport(),
      },
      {
        id: 'act-export-png',
        name: isTr ? 'Mimariyi 4K PNG Olarak İndir' : isPt ? 'Baixar Arquitetura como PNG 4K' : 'Download Architecture as 4K PNG',
        category: isTr ? 'Aksiyonlar' : isPt ? 'Ações' : 'Actions',
        icon: Download,
        run: () => onExportPng(),
      },
      {
        id: 'act-export-svg',
        name: isTr ? 'Mimariyi SVG Vektörel Olarak İndir' : isPt ? 'Baixar Arquitetura como SVG Vetorial' : 'Download Architecture as SVG Vector',
        category: isTr ? 'Aksiyonlar' : isPt ? 'Ações' : 'Actions',
        icon: Download,
        run: () => onExportSvg(),
      },
      {
        id: 'act-deploy',
        name: isTr ? 'Tek Tıkla VDS Kurulum Scripti (SSH)' : isPt ? 'Script de Implantação VDS em 1-Clique (SSH)' : '1-Click VDS Deploy Script (SSH)',
        category: isTr ? 'Aksiyonlar' : isPt ? 'Ações' : 'Actions',
        icon: Terminal,
        run: () => onOpenDeploy(),
      },
      {
        id: 'act-clear',
        name: isTr ? 'Tuvali Temizle' : isPt ? 'Limpar Canvas' : 'Clear Canvas',
        category: isTr ? 'Aksiyonlar' : isPt ? 'Ações' : 'Actions',
        icon: Trash2,
        run: () => {
          clearCanvas();
          onToast?.('info', isTr ? 'Temizlendi' : isPt ? 'Limpo' : 'Cleared', isTr ? 'Tuval sıfırlandı.' : isPt ? 'O canvas foi redefinido.' : 'Canvas reset.');
        },
      },
    ],
    [autoLayout, clearCanvas, onOpenImport, onOpenDeploy, onOpenPro, onExportPng, onExportSvg, onToast, isTr, isPt]
  );

  // Filtered items
  const filteredItems: PaletteItem[] = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) {
      const defaultModules: PaletteItem[] = MODULE_CATALOG.slice(0, 8).map((m) => ({
        id: `mod-${m.id}`,
        name: isTr ? `${m.name} Ekle` : isPt ? `Adicionar ${m.name}` : `Add ${m.name}`,
        desc: m.description,
        category: isTr ? 'Modüller' : isPt ? 'Módulos' : 'Modules',
        icon: Box,
        color: m.color,
        run: () => {
          addModule(m.id);
          onToast?.('success', isTr ? `${m.name} eklendi` : isPt ? `${m.name} adicionado` : `${m.name} added`, isTr ? 'Modül tuvale yerleştirildi.' : isPt ? 'Módulo posicionado no canvas.' : 'Module placed on canvas.');
        },
      }));
      return [...actions, ...defaultModules];
    }

    const filteredActions = actions.filter((a) => a.name.toLowerCase().includes(q));
    const filteredModules: PaletteItem[] = MODULE_CATALOG.filter(
      (m) => m.name.toLowerCase().includes(q) || m.description.toLowerCase().includes(q) || m.id.includes(q)
    ).map((m) => ({
      id: `mod-${m.id}`,
      name: isTr ? `${m.name} Ekle` : isPt ? `Adicionar ${m.name}` : `Add ${m.name}`,
      desc: m.description,
      category: isTr ? 'Modüller' : isPt ? 'Módulos' : 'Modules',
      icon: Box,
      color: m.color,
      run: () => {
        addModule(m.id);
        onToast?.('success', isTr ? `${m.name} eklendi` : isPt ? `${m.name} adicionado` : `${m.name} added`, isTr ? 'Modül tuvale yerleştirildi.' : isPt ? 'Módulo posicionado no canvas.' : 'Module placed on canvas.');
      },
    }));

    const filteredTemplates: PaletteItem[] = PREDEFINED_TEMPLATES.filter(
      (t) => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q)
    ).map((t) => ({
      id: `tpl-${t.id}`,
      name: isTr ? `${t.name} Şablonunu Yükle` : isPt ? `Carregar Modelo ${t.name}` : `Load ${t.name} Template`,
      desc: t.description,
      category: isTr ? 'Şablonlar' : isPt ? 'Modelos' : 'Templates',
      icon: Sparkles,
      color: t.color,
      run: () => {
        loadTemplate(t.id);
        onToast?.('success', isTr ? `${t.name} yüklendi` : isPt ? `${t.name} carregado` : `${t.name} loaded`, isTr ? 'Şablon tuvale yerleştirildi.' : isPt ? 'Modelo carregado no canvas.' : 'Template loaded onto canvas.');
      },
    }));

    return [...filteredActions, ...filteredModules, ...filteredTemplates];
  }, [query, actions, addModule, loadTemplate, onToast, isTr, isPt]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % (filteredItems.length || 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + filteredItems.length) % (filteredItems.length || 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      const item = filteredItems[selectedIndex];
      if (item) {
        item.run();
        onClose();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-150">
      <div className="relative w-full max-w-xl rounded-3xl border border-slate-800 bg-[#0e111a] shadow-2xl overflow-hidden ring-1 ring-indigo-500/20">
        {/* Search input header */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-slate-800/80 bg-[#08090e]">
          <Search className="h-4 w-4 text-indigo-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder={isTr ? "Komut ara, modül ekle veya şablon yükle..." : isPt ? "Buscar comandos, adicionar módulos ou modelos..." : "Search commands, add modules or load templates..."}
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <kbd className="hidden sm:inline-flex items-center px-2 py-0.5 text-[10px] font-mono text-slate-400 bg-[#131724] border border-slate-700 rounded-lg">
            ESC
          </kbd>
        </div>

        {/* Results List */}
        <div className="max-h-80 overflow-y-auto p-2 space-y-1 scrollbar-thin scrollbar-thumb-slate-700">
          {filteredItems.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-500">
              {isTr ? 'Eşleşen komut veya modül bulunamadı.' : isPt ? 'Nenhum comando ou módulo correspondente encontrado.' : 'No matching commands or modules found.'}
            </div>
          ) : (
            filteredItems.map((item, index) => {
              const Icon = item.icon;
              const isSelected = index === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    item.run();
                    onClose();
                  }}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center justify-between px-3 py-2.5 rounded-2xl cursor-pointer transition-all ${
                    isSelected ? 'bg-indigo-500/20 text-indigo-200 border border-indigo-500/40 shadow-sm' : 'text-slate-300 hover:bg-[#131724] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className="p-1.5 rounded-xl bg-[#08090e] border border-slate-800 shrink-0"
                      style={item.color ? { borderColor: item.color + '44', color: item.color } : {}}
                    >
                      <Icon className="h-3.5 w-3.5" />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-semibold truncate">{item.name}</p>
                      {item.desc && <p className="text-[10px] text-slate-500 truncate">{item.desc}</p>}
                    </div>
                  </div>
                  <span className="text-[10px] font-medium text-slate-500 uppercase tracking-wider shrink-0 ml-2">
                    {item.category}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-[#08090e] border-t border-slate-800/80 text-[10px] text-slate-500 font-mono">
          <span>{isTr ? '↑↓ ile gezin' : isPt ? '↑↓ para navegar' : '↑↓ to navigate'}</span>
          <span>{isTr ? 'ENTER ile çalıştır' : isPt ? 'ENTER para executar' : 'ENTER to run'}</span>
        </div>
      </div>
    </div>
  );
}
