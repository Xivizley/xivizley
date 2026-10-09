'use client';

// ============================================================
// XIVIZLEY — Hardware Resource Estimator Component
// components/canvas/HardwareEstimator.tsx
// ============================================================

import React, { useState, useMemo } from 'react';
import { useArchitectStore } from '@/store/useArchitectStore';
import { calculateHardwareEstimate } from '@/lib/utils/hardwareEstimator';
import { useI18nStore } from '@/lib/i18n/store';
import { cn } from '@/lib/utils';
import { Cpu, HardDrive, MemoryStick, ChevronDown, ChevronUp, AlertCircle, Sparkles, Server } from 'lucide-react';

export function HardwareEstimator() {
  const lang = useI18nStore((s) => s.lang);
  const isTr = lang === 'tr';
  const isPt = lang === 'pt';

  const nodes = useArchitectStore((s) => s.nodes);
  const [isExpanded, setIsExpanded] = useState(false);

  const estimate = useMemo(() => calculateHardwareEstimate(nodes, lang), [nodes, lang]);

  if (nodes.length === 0) return null;

  return (
    <div className="absolute top-4 right-4 z-40 flex flex-col items-end">
      {/* Mini Bar */}
      <div
        onClick={() => setIsExpanded(!isExpanded)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === 'Enter' && setIsExpanded(!isExpanded)}
        className={cn(
          'group flex items-center gap-3.5 rounded-2xl liquid-glass px-4 py-2 select-none cursor-pointer transition-all duration-200',
          'ring-1 ring-cyan-500/20 hover:ring-cyan-500/50 hover:shadow-[0_0_28px_rgba(6,182,212,0.22)] hover:scale-[1.01]',
          isExpanded && 'ring-cyan-400/60 shadow-[0_0_30px_rgba(6,182,212,0.3)]'
        )}
      >
        <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-200">
          <Server className="h-3.5 w-3.5 text-cyan-400 animate-pulse" />
          <span className="hidden sm:inline text-[11px] text-slate-400">
            {isTr ? 'Donanım:' : isPt ? 'Hardware:' : 'Hardware:'}
          </span>
          <span className="text-cyan-300 text-[11px] font-bold tracking-tight">{estimate.recommendation.title.split('/')[0]}</span>
        </div>

        <div className="h-3.5 w-px bg-white/10" />

        {/* RAM */}
        <div className="flex items-center gap-1 text-[11px] font-mono text-slate-200">
          <MemoryStick className="h-3 w-3 text-emerald-400" />
          <span className="font-semibold text-emerald-300">{estimate.totalRamGB} GB</span>
        </div>

        {/* CPU */}
        <div className="flex items-center gap-1 text-[11px] font-mono text-slate-200">
          <Cpu className="h-3 w-3 text-cyan-400" />
          <span className="font-semibold text-cyan-300">{estimate.totalCpuCores}C</span>
        </div>

        {/* Storage */}
        <div className="flex items-center gap-1 text-[11px] font-mono text-slate-200">
          <HardDrive className="h-3 w-3 text-amber-400" />
          <span className="font-semibold text-amber-300">{estimate.totalDiskGB} GB</span>
        </div>

        <div className="text-slate-400 group-hover:text-cyan-300 transition-colors">
          {isExpanded ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
        </div>
      </div>

      {/* Expanded Details Card */}
      {isExpanded && (
        <div className="mt-2 w-84 rounded-2xl liquid-glass-card p-4.5 shadow-2xl animate-in fade-in zoom-in-95 duration-150 ring-1 ring-cyan-500/20">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800/80">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-indigo-400" />
              <span className="text-xs font-semibold text-slate-200">
                {isTr ? 'Sistem Kaynak Analizi' : isPt ? 'Análise de Recursos do Sistema' : 'System Resource Analysis'}
              </span>
            </div>
            <span className={cn('text-[10px] font-semibold px-2 py-0.5 rounded-full border', estimate.recommendation.badgeBg, estimate.recommendation.badgeColor, estimate.recommendation.badgeBorder)}>
              {estimate.recommendation.category}
            </span>
          </div>

          {/* Metrics grid */}
          <div className="grid grid-cols-3 gap-2 mb-3">
            <div className="rounded-lg bg-slate-900/80 border border-slate-800 p-2 text-center">
              <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 mb-0.5">
                <MemoryStick className="h-3 w-3 text-emerald-400" /> RAM
              </div>
              <p className="text-xs font-bold font-mono text-slate-200">{estimate.totalRamGB} GB</p>
              <p className="text-[9px] text-slate-500 font-mono">({estimate.totalRamMB} MB)</p>
            </div>

            <div className="rounded-lg bg-slate-900/80 border border-slate-800 p-2 text-center">
              <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 mb-0.5">
                <Cpu className="h-3 w-3 text-cyan-400" /> CPU
              </div>
              <p className="text-xs font-bold font-mono text-slate-200">{estimate.totalCpuCores} {isTr ? 'Çekirdek' : isPt ? 'Núcleos' : 'Cores'}</p>
              <p className="text-[9px] text-slate-500 font-mono">{isTr ? 'Önerilen' : isPt ? 'Recomendado' : 'Recommended'}</p>
            </div>

            <div className="rounded-lg bg-slate-900/80 border border-slate-800 p-2 text-center">
              <div className="flex items-center justify-center gap-1 text-[10px] text-slate-400 mb-0.5">
                <HardDrive className="h-3 w-3 text-amber-400" /> {isTr ? 'Depolama' : isPt ? 'Armazenamento' : 'Storage'}
              </div>
              <p className="text-xs font-bold font-mono text-slate-200">{estimate.totalDiskGB} GB</p>
              <p className="text-[9px] text-slate-500 font-mono">{isTr ? 'Min. Alan' : isPt ? 'Espaço Mín.' : 'Min. Space'}</p>
            </div>
          </div>

          {/* Recommendation */}
          <div className="rounded-lg border border-slate-800/80 bg-slate-900/60 p-3 mb-2.5">
            <p className="text-xs font-semibold text-cyan-300 mb-1">
              💡 {isTr ? 'Önerilen Cihaz:' : isPt ? 'Dispositivo Recomendado:' : 'Recommended Device:'} {estimate.recommendation.title}
            </p>
            <p className="text-[11px] leading-relaxed text-slate-400">
              {estimate.recommendation.description}
            </p>
          </div>

          {/* Top Resource Consumers Breakdown */}
          {estimate.topConsumers.length > 0 && (
            <div className="rounded-lg border border-slate-800/70 bg-slate-900/40 p-2.5 mb-2.5">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
                {isTr ? 'En Çok Kaynak Tüketenler' : isPt ? 'Maiores Consumidores de Recursos' : 'Top Resource Consumers'}
              </p>
              <div className="space-y-1">
                {estimate.topConsumers.map((c, idx) => (
                  <div key={idx} className="flex items-center justify-between text-[11px]">
                    <span className="text-slate-300 truncate max-w-[140px]">{c.name}</span>
                    <span className="text-[10px] font-mono text-cyan-400">
                      {c.ramMB >= 1024 ? `${(c.ramMB / 1024).toFixed(1)} GB` : `${c.ramMB} MB`} RAM
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* OWEB TR Cloud 10 Gbps VDS Compatibility Badge */}
          <div className="rounded-xl border border-cyan-500/40 bg-cyan-950/30 p-2.5 mb-2 flex items-center justify-between shadow-md">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-100">
                <span>⚡ OWEB (TR Cloud 10 Gbps NVMe)</span>
                <span className="text-[10px] font-semibold text-cyan-300 font-mono">
                  ({estimate.totalRamGB} GB / 8.0 GB)
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {parseFloat(estimate.totalRamGB) <= 8.0
                  ? (isTr ? '✓ 10 Gbps Port & Datacenter NVMe ile %100 sıfır gecikme.' : isPt ? '✓ 100% zero latência com porta 10 Gbps e Datacenter NVMe.' : '✓ 100% zero latency with 10 Gbps Port & Datacenter NVMe.')
                  : (isTr ? '⚠ OWEB TR Cloud 16 GB+ Datacenter NVMe VDS paketi önerilir.' : isPt ? '⚠ Recomenda-se plano OWEB TR Cloud 16 GB+ Datacenter NVMe VDS.' : '⚠ OWEB TR Cloud 16 GB+ Datacenter NVMe VDS plan recommended.')}
              </p>
            </div>
            <a
              href="https://www.oweb.net.tr/aff.php?aff=975"
              target="_blank"
              rel="noopener noreferrer sponsored"
              className="rounded-lg bg-cyan-500 hover:bg-cyan-400 px-2.5 py-1 text-[10px] font-bold text-slate-950 transition-all shrink-0 ml-2 shadow-sm"
            >
              TR Cloud
            </a>
          </div>

          {/* Hosting.com.tr VPS Partner Badge */}
          <div className="rounded-xl border border-indigo-500/40 bg-indigo-950/30 p-2.5 mb-2.5 flex items-center justify-between shadow-md">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-slate-100">
                <span>🚀 Hosting.com.tr VDS</span>
                <span className="text-[10px] font-semibold text-indigo-300 font-mono">
                  {parseFloat(estimate.totalRamGB) <= 2.0 ? 'VDS 1' : parseFloat(estimate.totalRamGB) <= 4.0 ? 'VDS 2' : 'VDS 3'}
                </span>
              </div>
              <p className="text-[10px] text-slate-400 mt-0.5">
                {parseFloat(estimate.totalRamGB) <= 2.0
                  ? (isTr ? '✓ 2 GB RAM Otomatik Kurulumlu VDS 1 tam uyumlu.' : isPt ? '✓ 100% compatível com VDS 1 (2 GB RAM) com auto-deploy.' : '✓ 100% compatible with VDS 1 (2 GB RAM) auto-deploy.')
                  : parseFloat(estimate.totalRamGB) <= 4.0
                  ? (isTr ? '✓ 4 GB RAM Otomatik Kurulumlu VDS 2 tam uyumlu.' : isPt ? '✓ 100% compatível com VDS 2 (4 GB RAM) com auto-deploy.' : '✓ 100% compatible with VDS 2 (4 GB RAM) auto-deploy.')
                  : (isTr ? '✓ 8 GB RAM Otomatik Kurulumlu VDS 3 tam uyumlu.' : isPt ? '✓ 100% compatível com VDS 3 (8 GB RAM) com auto-deploy.' : '✓ 100% compatible with VDS 3 (8 GB RAM) auto-deploy.')}
              </p>
            </div>
            <a
              href="https://www.hosting.com.tr/aff.php?aff=1702"
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-lg bg-gradient-to-r from-indigo-600 to-purple-600 hover:brightness-110 px-2.5 py-1 text-[10px] font-bold text-white transition-all shrink-0 ml-2 shadow-sm"
            >
              {isTr ? '%50 İndirim ↗' : isPt ? '50% Desconto ↗' : '50% Off ↗'}
            </a>
          </div>

          {/* Warnings */}
          {estimate.warnings.length > 0 && (
            <div className="space-y-1.5 pt-1">
              {estimate.warnings.map((w, i) => (
                <div key={i} className="flex items-start gap-1.5 text-[10px] text-amber-400/90 leading-tight">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0 text-amber-400 mt-0.5" />
                  <span>{w}</span>
                </div>
              ))}
            </div>
          )}

        </div>
      )}
    </div>
  );
}
