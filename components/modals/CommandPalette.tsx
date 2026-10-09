'use client';

// ============================================================
// XIVIZLEY — Keyboard Command Palette (Ctrl+K / Cmd+K)
// components/modals/CommandPalette.tsx
// ============================================================

import React, { useState, useCallback, useMemo } from 'react';
import { useArchitectStore } from '@/store/useArchitectStore';
import { MODULE_CATALOG, CATEGORY_LABELS } from '@/lib/data/modules';
import { PREDEFINED_TEMPLATES } from '@/lib/data/templates';
import { useI18nStore } from '@/lib/i18n/store';
import { cn } from '@/lib/utils';
import {
  Search,
  Package,
  LayoutTemplate,
  Trash2,
  Save,
  Share2,
  Sparkles,
  Rocket,
  Globe,
  Sliders,
  X,
  CornerDownLeft,
  FileCode2,
  FileText,
  Terminal,
} from 'lucide-react';
import { generateCode } from '@/lib/generators/composeGenerator';
import { generateEnvFile } from '@/lib/generators/envGenerator';
import { generateVdsDeployScript } from '@/lib/generators/deploymentGenerator';


interface CommandItem {
  id: string;
  title: string;
  subtitle?: string;
  category: 'modules' | 'templates' | 'actions' | 'settings';
  icon: React.ElementType;
  color?: string;
  action: () => void;
}

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenAI?: () => void;
  onOpenDeploy?: () => void;
  onToast?: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

export function CommandPalette({
  isOpen,
  onClose,
  onOpenAI,
  onOpenDeploy,
  onToast,
}: CommandPaletteProps) {
  const { lang, setLang } = useI18nStore();
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const addModule = useArchitectStore((s) => s.addModule);
  const loadTemplate = useArchitectStore((s) => s.loadTemplate);
  const clearCanvas = useArchitectStore((s) => s.clearCanvas);
  const exportToJson = useArchitectStore((s) => s.exportToJson);
  const togglePanel = useArchitectStore((s) => s.togglePanel);
  const nodes = useArchitectStore((s) => s.nodes);
  const edges = useArchitectStore((s) => s.edges);


  // All actionable items
  const items = useMemo<CommandItem[]>(() => {
    const list: CommandItem[] = [];

    // Quick Actions
    list.push({
      id: 'action-ai',
      title: 'AI Mimar ile Tasarla',
      subtitle: 'Doğal dil ile self-host altyapısı oluşturun',
      category: 'actions',
      icon: Sparkles,
      color: '#8B5CF6',
      action: () => {
        onClose();
        onOpenAI?.();
      },
    });

    list.push({
      id: 'action-deploy',
      title: 'Sunucuya Tek Tıkla Kur (Deploy)',
      subtitle: 'Bash/Curl scripti ile sunucuya anında deploy edin',
      category: 'actions',
      icon: Rocket,
      color: '#8B5CF6',
      action: () => {
        onClose();
        onOpenDeploy?.();
      },
    });

    list.push({
      id: 'action-save',
      title: 'Canvas\'ı Kaydet (Local)',
      subtitle: 'Mevcut mimariyi tarayıcıya kaydeder',
      category: 'actions',
      icon: Save,
      color: '#10B981',
      action: () => {
        onClose();
        if (nodes.length === 0) {
          onToast?.('error', 'Canvas boş', 'Kaydedilecek modül yok.');
          return;
        }
        localStorage.setItem('xivizley_autosave', exportToJson());
        onToast?.('success', 'Kaydedildi!', 'Canvas başarıyla yerel depolamaya kaydedildi.');
      },
    });

    list.push({
      id: 'action-share',
      title: 'Mimari Bağlantısını Paylaş',
      subtitle: 'URL formatında panoya kopyalar',
      category: 'actions',
      icon: Share2,
      color: '#A78BFA',
      action: () => {
        onClose();
        if (nodes.length === 0) {
          onToast?.('error', 'Canvas boş', 'Paylaşılacak modül yok.');
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
          onToast?.('info', 'Bağlantı kopyalandı!', 'Paylaşım URL\'i panoya kopyalandı.');
        } catch {
          onToast?.('error', 'Hata', 'Paylaşım bağlantısı oluşturulamadı.');
        }
      },
    });

    list.push({
      id: 'action-panel',
      title: 'Yapılandırma / Çıktı Panelini Aç/Kapat',
      subtitle: 'Sağdaki YAML ve ayarlar panelini göster veya gizle',
      category: 'actions',
      icon: Sliders,
      color: '#C084FC',
      action: () => {
        onClose();
        togglePanel();
      },
    });

    list.push({
      id: 'action-copy-compose',
      title: 'docker-compose.yml Kopyala',
      subtitle: 'Üretilen YAML konfigürasyonunu panoya kopyalar',
      category: 'actions',
      icon: FileCode2,
      color: '#8B5CF6',
      action: () => {
        onClose();
        const { dockerCompose } = generateCode(nodes, edges);
        navigator.clipboard.writeText(dockerCompose);
        onToast?.('success', 'Kopyalandı!', 'docker-compose.yml panoya kopyalandı.');
      },
    });

    list.push({
      id: 'action-copy-env',
      title: '.env Dosyasını Kopyala',
      subtitle: 'Tüm ortam değişkenlerini (.env) panoya kopyalar',
      category: 'actions',
      icon: FileText,
      color: '#10B981',
      action: () => {
        onClose();
        const envText = generateEnvFile(nodes);
        navigator.clipboard.writeText(envText);
        onToast?.('success', 'Kopyalandı!', '.env dosyası panoya kopyalandı.');
      },
    });

    list.push({
      id: 'action-copy-bash',
      title: 'deploy.sh Scriptini Kopyala',
      subtitle: 'Otomatik kurulum bash scriptini panoya kopyalar',
      category: 'actions',
      icon: Terminal,
      color: '#8B5CF6',
      action: () => {
        onClose();
        const bashScript = generateVdsDeployScript(nodes, edges);
        navigator.clipboard.writeText(bashScript);
        onToast?.('success', 'Kopyalandı!', 'deploy.sh scripti panoya kopyalandı.');
      },
    });


    const nextLang = lang === 'tr' ? 'en' : lang === 'en' ? 'pt' : 'tr';
    const nextLangName = nextLang === 'en' ? 'English' : nextLang === 'pt' ? 'Português (Brasil)' : 'Türkçe';
    list.push({
      id: 'action-lang',
      title: lang === 'tr' ? `Dili Değiştir: ${nextLangName}` : lang === 'en' ? `Switch Language: ${nextLangName}` : `Mudar Idioma: ${nextLangName}`,
      subtitle: `Current: ${lang.toUpperCase()}`,
      category: 'settings',
      icon: Globe,
      color: '#6366F1',
      action: () => {
        onClose();
        setLang(nextLang);
      },
    });

    list.push({
      id: 'action-clear',
      title: 'Tuvali Temizle (Clear Canvas)',
      subtitle: 'Tüm modülleri tuvalden siler',
      category: 'actions',
      icon: Trash2,
      color: '#EF4444',
      action: () => {
        onClose();
        clearCanvas();
        onToast?.('info', 'Tuval temizlendi');
      },
    });

    // Modules
    for (const m of MODULE_CATALOG) {
      list.push({
        id: `module-${m.id}`,
        title: `${m.name} Ekle`,
        subtitle: `${CATEGORY_LABELS[m.category] || m.category} — ${m.description}`,
        category: 'modules',
        icon: Package,
        color: m.color,
        action: () => {
          onClose();
          addModule(m.id);
          onToast?.('success', `${m.name} eklendi`);
        },
      });
    }

    // Templates
    for (const tpl of PREDEFINED_TEMPLATES) {
      list.push({
        id: `template-${tpl.id}`,
        title: `Şablon: ${tpl.name}`,
        subtitle: tpl.description,
        category: 'templates',
        icon: LayoutTemplate,
        color: tpl.color,
        action: () => {
          onClose();
          loadTemplate(tpl.id);
          onToast?.('success', `"${tpl.name}" yüklendi`);
        },
      });
    }

    return list;
  }, [
    onClose,
    onOpenAI,
    onOpenDeploy,
    onToast,
    nodes,
    edges,
    exportToJson,

    togglePanel,
    lang,
    setLang,
    clearCanvas,
    addModule,
    loadTemplate,
  ]);

  // Filtered by search query
  const filtered = useMemo(() => {
    if (!query.trim()) return items;
    const q = query.toLowerCase();
    return items.filter(
      (item) =>
        item.title.toLowerCase().includes(q) ||
        item.subtitle?.toLowerCase().includes(q) ||
        item.category.toLowerCase().includes(q)
    );
  }, [items, query]);

  // Keyboard navigation
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selected = filtered[selectedIndex];
        if (selected) {
          selected.action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    },
    [filtered, selectedIndex, onClose]
  );

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center pt-20 bg-[#090514]/85 backdrop-blur-md p-4 animate-in fade-in duration-150"
      onClick={onClose}
    >
      <div
        className="w-full max-w-xl overflow-hidden rounded-[2px] border border-[#2B1A42] bg-[#0D0719] shadow-2xl text-[#F5F3FF]"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        {/* Search input header */}
        <div className="flex items-center gap-3 border-b border-[#2B1A42] px-4 py-3.5 bg-[#090514]">
          <Search className="h-4 w-4 text-[#8B5CF6] shrink-0" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            placeholder="Modül, şablon veya komut arayın... (Örn: Jellyfin, Medya, Temizle)"
            autoFocus
            className="flex-1 bg-transparent text-sm text-[#F5F3FF] placeholder-[#8B7D9E] font-mono focus:outline-none"
          />
          {query ? (
            <button
              onClick={() => {
                setQuery('');
                setSelectedIndex(0);
              }}
              className="text-[#8B7D9E] hover:text-[#F5F3FF] transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          ) : (
            <kbd className="rounded-[2px] border border-[#2B1A42] bg-[#120A21] px-2 py-0.5 text-[10px] font-mono text-[#8B7D9E]">
              ESC
            </kbd>
          )}
        </div>

        {/* Results List */}
        <div className="max-h-[380px] overflow-y-auto p-2 scrollbar-thin scrollbar-thumb-[#2B1A42]">
          {filtered.length === 0 ? (
            <div className="py-12 text-center text-xs text-[#8B7D9E] font-mono">
              Sonuç bulunamadı. Farklı bir terim deneyin.
            </div>
          ) : (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              const Icon = item.icon;

              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={cn(
                    'w-full flex items-center gap-3 rounded-[2px] px-3 py-2.5 text-left transition-all',
                    isSelected
                      ? 'bg-[#1E1235] text-[#F5F3FF] border-l-2 border-[#8B5CF6]'
                      : 'text-[#A19BAF] hover:bg-[#120A21] border-l-2 border-transparent'
                  )}
                >
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-[2px] border border-[#2B1A42] bg-[#120A21]"
                    style={{ color: item.color || '#A19BAF' }}
                  >
                    <Icon className="h-4 w-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-semibold text-[#F5F3FF] truncate">{item.title}</p>
                    {item.subtitle && (
                      <p className="text-[11px] text-[#8B7D9E] truncate mt-0.5">{item.subtitle}</p>
                    )}
                  </div>
                  {isSelected && (
                    <div className="flex items-center gap-1 text-[10px] font-mono text-[#C084FC] shrink-0">
                      <span>Seç</span>
                      <CornerDownLeft className="h-3 w-3" />
                    </div>
                  )}
                </button>
              );
            })
          )}
        </div>

        {/* Footer info */}
        <div className="flex items-center justify-between border-t border-[#2B1A42] bg-[#090514] px-4 py-2.5 text-[10px] text-[#8B7D9E] font-mono">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="font-mono text-[#F5F3FF]">↑↓</kbd> Gezin
            </span>
            <span>
              <kbd className="font-mono text-[#F5F3FF]">↵</kbd> Çalıştır
            </span>
            <span>
              <kbd className="font-mono text-[#F5F3FF]">ESC</kbd> Kapat
            </span>
          </div>
          <span className="font-mono">{filtered.length} sonuç</span>
        </div>
      </div>
    </div>
  );
}
