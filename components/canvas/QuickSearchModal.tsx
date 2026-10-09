// ============================================================
// XIVIZLEY — Quick Module Search Modal (Cmd/Ctrl + K)
// components/canvas/QuickSearchModal.tsx
// ============================================================

'use client';

import React, { useState, useMemo, useEffect } from 'react';
import { MODULE_CATALOG, getCategoryLabel } from '@/lib/data/modules';
import { useArchitectStore } from '@/store/useArchitectStore';
import { useI18nStore } from '@/lib/i18n/store';
import { Search, X, Server, Plus, Command } from 'lucide-react';

interface Props {
  isOpen: boolean;
  onClose: () => void;
}

export function QuickSearchModal({ isOpen, onClose }: Props) {
  const { lang } = useI18nStore();
  const isTr = lang === 'tr';
  const isPt = lang === 'pt';

  const [search, setSearch] = useState('');
  const addModule = useArchitectStore((s) => s.addModule);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  const filteredModules = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return MODULE_CATALOG;
    return MODULE_CATALOG.filter(
      (m) =>
        m.name.toLowerCase().includes(q) ||
        m.id.toLowerCase().includes(q) ||
        m.description.toLowerCase().includes(q) ||
        m.category.toLowerCase().includes(q)
    );
  }, [search]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-[#090514]/85 backdrop-blur-md animate-in fade-in duration-150">
      <div className="w-full max-w-xl rounded-[2px] border border-[#2B1A42] bg-[#0D0719] shadow-2xl overflow-hidden flex flex-col max-h-[80vh] text-[#F5F3FF]">
        {/* Search Header */}
        <div className="relative border-b border-[#2B1A42] p-4 bg-[#090514]">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-[#8B5CF6] pointer-events-none" />
          <input
            type="text"
            autoFocus
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={
              isTr
                ? 'Modül ara (örn: Nextcloud, PostgreSQL, AdGuard)... Esc ile kapat'
                : isPt
                ? 'Buscar módulo (ex: Nextcloud, PostgreSQL, AdGuard)... Esc para fechar'
                : 'Search module (e.g. Nextcloud, PostgreSQL, AdGuard)... Esc to close'
            }
            className="w-full rounded-[2px] border border-[#2B1A42] bg-[#06030D] pl-10 pr-10 py-3 text-xs sm:text-sm text-[#F5F3FF] placeholder-[#8B7D9E] font-mono focus:border-[#8B5CF6] focus:outline-none focus:ring-1 focus:ring-[#8B5CF6]/50"
          />
          <button
            onClick={onClose}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-[#8B7D9E] hover:text-[#F5F3FF] transition-colors"
            aria-label={isTr ? 'Kapat' : isPt ? 'Fechar' : 'Close'}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Module List */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1.5 scrollbar-thin scrollbar-thumb-[#2B1A42]">
          {filteredModules.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#8B7D9E] font-mono">
              {isTr
                ? 'Aradığınız kriterde modül bulunamadı.'
                : isPt
                ? 'Nenhum módulo encontrado para a busca.'
                : 'No modules found matching your search.'}
            </div>
          ) : (
            filteredModules.map((m) => (
              <div
                key={m.id}
                onClick={() => {
                  addModule(m.id);
                  onClose();
                }}
                className="flex items-center justify-between gap-3 p-3 rounded-[2px] border border-[#2B1A42] bg-[#120A21] hover:bg-[#1E1235] hover:border-[#8B5CF6] cursor-pointer transition-all group"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div
                    className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[2px] border text-sm font-bold shadow-inner"
                    style={{
                      background: m.color + '22',
                      borderColor: m.color + '55',
                      color: m.color,
                    }}
                  >
                    <Server className="h-4 w-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-bold text-[#F5F3FF] group-hover:text-[#C084FC] transition-colors truncate">
                        {m.name}
                      </h4>
                      <span className="rounded-[2px] bg-[#090514] border border-[#2B1A42] px-2 py-0.5 text-[9px] text-[#8B7D9E] font-mono">
                        {getCategoryLabel(m.category, lang)}
                      </span>
                    </div>
                    <p className="text-[11px] text-[#A19BAF] line-clamp-1 mt-0.5">
                      {m.description}
                    </p>
                  </div>
                </div>

                <button className="shrink-0 flex items-center gap-1 rounded-[2px] bg-[#8B5CF6] hover:bg-[#7C3AED] px-3 py-1.5 text-xs font-mono font-bold text-white transition-all">
                  <Plus className="h-3.5 w-3.5" />
                  <span>{isTr ? 'Ekle' : isPt ? 'Adicionar' : 'Add'}</span>
                </button>
              </div>
            ))
          )}
        </div>

        {/* Footer info */}
        <div className="p-3 border-t border-[#2B1A42] bg-[#090514] text-[10px] text-[#8B7D9E] font-mono flex items-center justify-between">
          <span className="flex items-center gap-1">
            <Command className="h-3 w-3 text-[#A78BFA]" />{' '}
            {isTr
              ? '+ K ile dilediğiniz an açabilirsiniz'
              : isPt
              ? '+ K para abrir a qualquer momento'
              : '+ K to open anytime'}
          </span>
          <span>
            {isTr
              ? `Toplam ${filteredModules.length} modül`
              : isPt
              ? `Total de ${filteredModules.length} módulos`
              : `Total ${filteredModules.length} modules`}
          </span>
        </div>
      </div>
    </div>
  );
}
