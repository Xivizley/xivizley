'use client';

// ============================================================
// XIVIZLEY — Live Hardware & Resource Estimator Widget
// components/canvas/HardwareEstimatorBar.tsx
// ============================================================

import React, { useState } from 'react';
import { useArchitectStore } from '@/store/useArchitectStore';
import { estimateHardwareRequirements } from '@/lib/engines/hardwareEstimator';
import { useI18nStore } from '@/lib/i18n/store';
import { Cpu, HardDrive, MemoryStick, ChevronUp, ChevronDown, Server, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

export function HardwareEstimatorBar() {
  const { lang } = useI18nStore();
  const nodes = useArchitectStore((s) => s.nodes);
  const [isExpanded, setIsExpanded] = useState(false);

  const isTr = lang === 'tr';
  const report = estimateHardwareRequirements(nodes);

  if (nodes.length === 0) return null;

  return (
    <div className="pointer-events-auto absolute bottom-4 left-4 z-20 flex flex-col items-start transition-all duration-300">
      <div className="rounded-2xl border border-slate-800 bg-[#090d16]/90 p-3 shadow-2xl backdrop-blur-xl ring-1 ring-cyan-500/20 text-xs">
        {/* Compact Bar */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 font-bold text-slate-200">
            <Server className="h-4 w-4 text-cyan-400" />
            <span className="hidden sm:inline">{isTr ? 'Tahmini Donanım:' : 'Estimated Specs:'}</span>
          </div>

          <div className="flex items-center gap-2">
            {/* RAM */}
            <div className="flex items-center gap-1 rounded-lg bg-cyan-950/40 border border-cyan-500/30 px-2 py-1 text-cyan-300 font-mono text-[11px]">
              <MemoryStick className="h-3 w-3" />
              <span>{report.totalRamGB} GB RAM</span>
            </div>

            {/* CPU */}
            <div className="flex items-center gap-1 rounded-lg bg-purple-950/40 border border-purple-500/30 px-2 py-1 text-purple-300 font-mono text-[11px]">
              <Cpu className="h-3 w-3" />
              <span>{report.totalCpuCores} CPU</span>
            </div>

            {/* Disk */}
            <div className="flex items-center gap-1 rounded-lg bg-emerald-950/40 border border-emerald-500/30 px-2 py-1 text-emerald-300 font-mono text-[11px] hidden md:flex">
              <HardDrive className="h-3 w-3" />
              <span>~{report.totalDiskGB} GB</span>
            </div>
          </div>

          {/* Toggle Details */}
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="flex items-center gap-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 px-2 py-1 text-[11px] text-slate-300 transition-colors ml-1"
          >
            <span>{isTr ? 'Tavsiye' : 'Advice'}</span>
            {isExpanded ? <ChevronDown className="h-3 w-3" /> : <ChevronUp className="h-3 w-3" />}
          </button>
        </div>

        {/* Expanded Recommendations */}
        {isExpanded && (
          <div className="mt-3 pt-3 border-t border-slate-800/80 space-y-2 animate-in fade-in duration-150 max-w-sm">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                {isTr ? 'Önerilen Sunucu Kategorisi:' : 'Recommended Tier:'}
              </p>
              <p className="text-xs font-bold text-slate-200 mt-0.5">
                {isTr ? report.recommendedServerTier : report.recommendedServerTierEn}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                {isTr ? 'Tavsiye Edilen Cihazlar / Paketler:' : 'Recommended Hardware:'}
              </p>
              <ul className="mt-1 space-y-1">
                {report.serverExamples.map((ex, i) => (
                  <li key={i} className="flex items-center gap-1.5 text-[11px] text-cyan-300/80">
                    <Sparkles className="h-3 w-3 text-cyan-400 shrink-0" />
                    <span>{ex}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
