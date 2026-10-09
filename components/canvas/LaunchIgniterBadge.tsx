'use client';

// ============================================================
// XIVIZLEY — LaunchIgniter Week 38 Pro Studio Floating Badge
// Official global showcase badge with liquid glass & neon pulse
// ============================================================

import React, { useState } from 'react';
import { Rocket, ExternalLink, Sparkles, Award } from 'lucide-react';
import { useI18nStore } from '@/lib/i18n/store';
import { cn } from '@/lib/utils';

interface LaunchIgniterBadgeProps {
  className?: string;
}

export function LaunchIgniterBadge({ className }: LaunchIgniterBadgeProps) {
  const { lang } = useI18nStore();
  const isTr = lang === 'tr';
  const isPt = lang === 'pt';

  const [isHovered, setIsHovered] = useState(false);

  return (
    <div
      className={cn(
        'relative group z-30 transition-all duration-300',
        className
      )}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <a
        href="https://launchigniter.com"
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          'flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-semibold select-none',
          'bg-[#0a0d16]/80 backdrop-blur-2xl border border-orange-500/40 text-slate-200',
          'shadow-[0_8px_32px_rgba(249,115,22,0.18),inset_0_1px_1px_rgba(255,255,255,0.25)]',
          'hover:border-orange-400 hover:shadow-[0_8px_32px_rgba(249,115,22,0.35),0_0_20px_rgba(249,115,22,0.2)]',
          'transition-all duration-300 hover:scale-[1.03] active:scale-95'
        )}
        title={
          isTr
            ? 'Featured on LaunchIgniter Week 38 (14-20 Eylül Global Vitrin)'
            : isPt
            ? 'Destaque no LaunchIgniter Semana 38 (Vitrine Global)'
            : 'Featured on LaunchIgniter Week 38 (Global Showcase)'
        }
      >
        {/* Animated Live Ping Indicator */}
        <span className="relative flex h-2 w-2 shrink-0">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-orange-500 shadow-[0_0_8px_#f97316]" />
        </span>

        {/* Icon & Brand Name */}
        <div className="flex items-center gap-1.5">
          <div className="p-1 rounded-full bg-orange-500/20 text-orange-400">
            <Rocket className="h-3 w-3" />
          </div>
          <span className="font-extrabold tracking-tight bg-gradient-to-r from-orange-400 via-amber-300 to-yellow-400 bg-clip-text text-transparent">
            LaunchIgniter
          </span>
        </div>

        <span className="text-slate-600">•</span>

        {/* Week 38 Badge */}
        <span className="text-[11px] font-bold text-orange-200">
          Week 38
        </span>

        {/* Metric Pill */}
        <span className="hidden sm:inline-flex items-center gap-0.5 rounded-md bg-orange-500/20 border border-orange-500/30 px-1.5 py-0.5 text-[9px] font-mono font-bold text-orange-300">
          <Award className="h-2.5 w-2.5 text-amber-300" />
          DR 74
        </span>

        <ExternalLink className="h-3 w-3 text-slate-500 group-hover:text-orange-400 transition-colors" />
      </a>

      {/* Floating Micro-Details Tooltip */}
      {isHovered && (
        <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-64 p-3 rounded-xl bg-[#0b0f1a]/95 border border-orange-500/30 shadow-2xl backdrop-blur-xl z-50 text-[11px] animate-in fade-in zoom-in-95 duration-150">
          <div className="flex items-center gap-1.5 text-orange-400 font-bold mb-1">
            <Sparkles className="h-3.5 w-3.5" />
            <span>
              {isTr
                ? 'Küresel Lansman Vitrini'
                : isPt
                ? 'Vitrine de Lançamento Global'
                : 'Global Launch Showcase'}
            </span>
          </div>
          <p className="text-slate-300 text-[10px] leading-relaxed">
            {isTr
              ? 'XIVIZLEY, LaunchIgniter Week 38 haftalık küresel inovasyon vitrininde listelendi. Tek tıkla dünya standartlarında self-host ve bulut mimarisi oluşturun.'
              : isPt
              ? 'O XIVIZLEY foi listado na vitrine global de inovação da Semana 38 do LaunchIgniter. Crie arquiteturas self-host de classe mundial em 1 clique.'
              : 'XIVIZLEY is featured on the LaunchIgniter Week 38 global innovation showcase. Build world-class self-host and cloud stacks in 1-click.'}
          </p>
          <div className="mt-2 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[9px] text-slate-400 font-mono">
            <span>{isTr ? 'Tarih: 14-20 Eylül' : isPt ? 'Data: 14-20 Set' : 'Date: Sep 14-20'}</span>
            <span className="text-orange-400 font-bold">
              {isTr ? 'Resmi Rozet ✓' : isPt ? 'Selo Oficial ✓' : 'Official Badge ✓'}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
