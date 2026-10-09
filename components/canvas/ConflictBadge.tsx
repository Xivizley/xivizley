'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import type { PortConflict } from '@/lib/types';
import { AlertTriangle, ChevronDown, ChevronUp } from 'lucide-react';
import { useI18nStore } from '@/lib/i18n/store';

interface ConflictBadgeProps {
  conflicts: PortConflict[];
  className?: string;
}

export function ConflictBadge({ conflicts, className }: ConflictBadgeProps) {
  const [expanded, setExpanded] = React.useState(false);
  const { lang } = useI18nStore();
  const isTr = lang === 'tr';
  const isPt = lang === 'pt';

  if (conflicts.length === 0) return null;

  return (
    <div
      className={cn(
        'conflict-badge rounded-[2px] border border-rose-500/60 bg-rose-950/80 backdrop-blur-sm',
        'shadow-[0_0_12px_rgba(244,63,94,0.25)] text-xs',
        className,
      )}
    >
      {/* Header */}
      <button
        onClick={(e) => {
          e.stopPropagation();
          setExpanded((v) => !v);
        }}
        className="flex w-full items-center gap-1.5 px-2 py-1 text-rose-300 hover:text-rose-200 font-mono text-[10px] transition-colors"
        aria-expanded={expanded}
        aria-label={isTr ? 'Çakışma detaylarını göster/gizle' : isPt ? 'Mostrar/ocultar detalhes do conflito' : 'Toggle conflict details'}
      >
        <AlertTriangle className="h-3 w-3 shrink-0 animate-pulse text-rose-400" />
        <span className="font-semibold uppercase tracking-wider">
          {conflicts.length} {isTr ? 'Port Çakışması' : isPt ? 'Conflitos de Porta' : 'Port Conflicts'}
        </span>
        <span className="ml-auto">
          {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
        </span>
      </button>

      {/* Details */}
      {expanded && (
        <div className="border-t border-rose-500/30 px-2 pb-2 pt-1 space-y-1.5 text-[10px] font-mono">
          {conflicts.map((c) => (
            <div key={c.hostPort} className="space-y-0.5">
              <p className="text-rose-300 font-mono">
                Port <span className="text-rose-100 font-bold">{c.hostPort}</span> {isTr ? 'kullanılıyor' : isPt ? 'está em uso' : 'is in use'}
              </p>
              {c.suggestions.length > 0 && (
                <p className="text-[#8B7D9E]">
                  {isTr ? 'Alternatif:' : isPt ? 'Alternativa:' : 'Alternative:'}{' '}
                  {c.suggestions.map((s, i) => (
                    <span key={s}>
                      <span className="text-[#A78BFA] font-mono font-semibold">{s}</span>
                      {i < c.suggestions.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
