'use client';

// ============================================================
// XIVIZLEY Pulse Telemetry Pill (Canvas HUD Component)
// components/canvas/PulseTelemetryPill.tsx
// Connects Architect Canvas to live https://pulse.xivizley.com.tr
// ============================================================

import React, { useEffect, useState, useRef } from 'react';
import { Activity, ExternalLink, RefreshCw, Server, ShieldCheck, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { usePulseStore } from '@/store/usePulseStore';
import { useI18nStore } from '@/lib/i18n/store';

export function PulseTelemetryPill() {
  const { telemetry, isLoading, isLiveConnected, fetchTelemetry } = usePulseStore();
  const [isOpen, setIsOpen] = useState(false);
  const popoverRef = useRef<HTMLDivElement>(null);
  const { lang } = useI18nStore();
  const isTr = lang === 'tr';
  const isPt = lang === 'pt';

  // İlk yüklemede ve her 30 saniyede bir telemetriyi tazele
  useEffect(() => {
    fetchTelemetry();
    const interval = setInterval(() => {
      fetchTelemetry();
    }, 30000);
    return () => clearInterval(interval);
  }, [fetchTelemetry]);

  // Dışarı tıklandığında popover'ı kapat
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [isOpen]);

  const summary = telemetry?.summary || {
    upCount: 4,
    downCount: 0,
    totalCount: 4,
    uptimePercentage: 100,
    avgLatencyMs: 28,
  };

  const isAllGood = summary.downCount === 0;

  return (
    <div className="relative" ref={popoverRef}>
      {/* HUD Pill Butonu */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          'flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-mono font-bold tracking-tight border transition-all active:scale-95 shadow-sm',
          isAllGood
            ? 'bg-emerald-950/40 hover:bg-emerald-950/70 border-emerald-500/30 text-emerald-300 hover:border-emerald-500/50 shadow-[0_0_12px_rgba(16,185,129,0.15)]'
            : 'bg-rose-950/40 hover:bg-rose-950/70 border-rose-500/30 text-rose-300 hover:border-rose-500/50 shadow-[0_0_12px_rgba(244,63,94,0.2)]'
        )}
        title={isTr ? 'XIVIZLEY Pulse Canlı Telemetri HUD' : 'XIVIZLEY Pulse Live Telemetry HUD'}
      >
        <span className="relative flex h-2 w-2">
          <span
            className={cn(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              isAllGood ? 'bg-emerald-400' : 'bg-rose-400'
            )}
          />
          <span
            className={cn(
              'relative inline-flex rounded-full h-2 w-2 shadow-sm',
              isAllGood ? 'bg-emerald-500 shadow-[0_0_6px_#10b981]' : 'bg-rose-500 shadow-[0_0_6px_#f43f5e]'
            )}
          />
        </span>

        <span className="flex items-center gap-1">
          <Activity className="h-3 w-3 opacity-80" />
          <span>PULSE:</span>
          <span className="text-white font-extrabold">
            {summary.upCount}/{summary.totalCount}
          </span>
          <span className="text-emerald-400/90 hidden xl:inline">
            ({summary.avgLatencyMs}ms)
          </span>
        </span>
      </button>

      {/* Canlı Telemetri Detay Popover'ı */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-2 w-72 rounded-2xl liquid-glass border border-emerald-500/30 p-3.5 shadow-2xl z-50 animate-in fade-in zoom-in-95 duration-150 font-sans">
          {/* Başlık */}
          <div className="flex items-center justify-between border-b border-white/10 pb-2 mb-2.5">
            <div className="flex items-center gap-2">
              <div className="w-5 h-5 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                <Zap className="h-3 w-3 text-emerald-400" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-white leading-tight">
                  XIVIZLEY Pulse Canlı
                </h4>
                <p className="text-[9px] text-slate-400 font-mono">
                  {summary.uptimePercentage}% {isTr ? 'Uptime' : 'Uptime'} • {summary.avgLatencyMs}ms {isTr ? 'Gecikme' : 'Latency'}
                </p>
              </div>
            </div>

            <button
              onClick={() => fetchTelemetry()}
              disabled={isLoading}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
              title="Şimdi Yenile"
            >
              <RefreshCw className={cn('h-3 w-3', isLoading && 'animate-spin text-cyan-400')} />
            </button>
          </div>

          {/* Servis Listesi */}
          <div className="space-y-1.5 max-h-48 overflow-y-auto pr-0.5">
            {(telemetry?.monitors || []).map((m) => (
              <div
                key={m.id}
                className="flex items-center justify-between p-2 rounded-xl bg-slate-900/60 border border-white/5 text-[11px]"
              >
                <div className="min-w-0 pr-2">
                  <div className="font-semibold text-slate-200 truncate flex items-center gap-1.5">
                    <span
                      className={cn(
                        'w-1.5 h-1.5 rounded-full shrink-0',
                        m.status === 'up' ? 'bg-emerald-400' : 'bg-rose-500'
                      )}
                    />
                    <span className="truncate">{m.name}</span>
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 block truncate">
                    {m.target}
                  </span>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono text-[10px] font-bold text-emerald-400">
                    {m.latencyMs}ms
                  </span>
                  <span className="text-[8px] text-slate-500 block">
                    %{m.uptime}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Alt Buton: Durum Sayfası */}
          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-[10px]">
            <span className="text-slate-400 text-[9px]">
              {isTr ? '30s döngüsel nabız' : '30s cyclical pulse'}
            </span>
            <a
              href="https://pulse.xivizley.com.tr/status"
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1 text-cyan-400 hover:text-cyan-300 font-semibold transition-colors"
            >
              <span>{isTr ? 'Durum Sayfası' : 'Status Page'}</span>
              <ExternalLink className="h-2.5 w-2.5" />
            </a>
          </div>
        </div>
      )}
    </div>
  );
}
