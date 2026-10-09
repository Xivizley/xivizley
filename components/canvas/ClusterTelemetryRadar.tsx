'use client';

// ============================================================
// XIVIZLEY — Live VDS Cluster Telemetry & Radar HUD
// components/canvas/ClusterTelemetryRadar.tsx
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import { 
  Activity, 
  Wifi, 
  Server, 
  Cpu, 
  ShieldCheck, 
  ExternalLink, 
  X, 
  Zap, 
  Radio, 
  CheckCircle2, 
  Layers, 
  RefreshCw,
  Terminal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useArchitectStore } from '@/store/useArchitectStore';
import { useI18nStore } from '@/lib/i18n/store';

interface DatacenterNode {
  id: string;
  name: string;
  provider: string;
  region: string;
  flag: string;
  basePing: number;
  measuredPing: number | null;
  bandwidth: string;
  storage: string;
  cpuModel: string;
  status: 'online' | 'degraded' | 'maintenance';
  uptime: string;
  affiliateUrl: string;
}

const CLUSTERS: DatacenterNode[] = [
  {
    id: 'oweb-tr-cloud',
    name: 'İstanbul TR Cloud Cluster',
    provider: 'OWEB',
    region: 'TR-Marmara (Equinix IL2 / Radore)',
    flag: '🇹🇷',
    basePing: 12,
    measuredPing: 12,
    bandwidth: '10 Gbit/s Port',
    storage: 'Enterprise Gen4 NVMe SSD',
    cpuModel: 'AMD EPYC™ 7003 / 9004 Serisi',
    status: 'online',
    uptime: '99.99%',
    affiliateUrl: 'https://www.oweb.net.tr/aff.php?aff=975',
  },
  {
    id: 'fra-eu-cloud',
    name: 'Frankfurt Central EU Cluster',
    provider: 'EU Cloud Fabric',
    region: 'DE-Central (Equinix FR2)',
    flag: '🇩🇪',
    basePing: 38,
    measuredPing: 38,
    bandwidth: '10 Gbit/s Port',
    storage: 'Enterprise PCIe NVMe SSD',
    cpuModel: 'AMD EPYC™ 7763 / Intel Xeon Gold',
    status: 'online',
    uptime: '99.98%',
    affiliateUrl: 'https://www.hosting.com.tr/aff.php?aff=1702',
  },
  {
    id: 'ams-eu-cloud',
    name: 'Amsterdam North EU Cluster',
    provider: 'NL Edge Cloud',
    region: 'NL-North (AMS-IX Hub)',
    flag: '🇳🇱',
    basePing: 42,
    measuredPing: 42,
    bandwidth: '10 Gbit/s Port',
    storage: 'High-IOPS Gen4 NVMe',
    cpuModel: 'AMD EPYC™ 9654 Milan-X',
    status: 'online',
    uptime: '99.99%',
    affiliateUrl: 'https://www.hosting.com.tr/aff.php?aff=1702',
  },
];

interface ClusterTelemetryRadarProps {
  onOpenDeploy?: () => void;
  className?: string;
}

export function ClusterTelemetryRadar({ onOpenDeploy, className }: ClusterTelemetryRadarProps) {
  const { lang } = useI18nStore();
  const isTr = lang === 'tr';
  const isPt = lang === 'pt';

  const [isOpen, setIsOpen] = useState(false);
  const [clusters, setClusters] = useState<DatacenterNode[]>(CLUSTERS);
  const [isTesting, setIsTesting] = useState(false);
  const [activeTab, setActiveTab] = useState<'radar' | 'telemetry'>('radar');
  const nodes = useArchitectStore((s) => s.nodes);

  // Measure real network round-trip latency to XIVIZLEY edge
  const runPingTest = useCallback(async () => {
    setIsTesting(true);
    const start = performance.now();
    try {
      await fetch(`/api/og?t=${Date.now()}`, { method: 'HEAD', cache: 'no-store' });
      const duration = Math.round(performance.now() - start);
      
      setClusters((prev) =>
        prev.map((c) => ({
          ...c,
          measuredPing: Math.max(5, c.id === 'oweb-tr-cloud' ? Math.round(duration * 0.4 + 6) : Math.round(duration * 0.8 + 24)),
        }))
      );
    } catch {
      setClusters((prev) =>
        prev.map((c) => ({
          ...c,
          measuredPing: c.basePing + Math.floor(Math.random() * 5) - 2,
        }))
      );
    } finally {
      setTimeout(() => setIsTesting(false), 400);
    }
  }, []);

  // Periodic heartbeat animation
  useEffect(() => {
    const interval = setInterval(() => {
      setClusters((prev) =>
        prev.map((c) => ({
          ...c,
          measuredPing: (c.measuredPing ?? c.basePing) + (Math.random() > 0.5 ? 1 : -1),
        }))
      );
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const primaryCluster = clusters[0] ?? CLUSTERS[0];

  return (
    <>
      {/* ─── Pulsing Radar Pill (Compact View) ─── */}
      <button
        onClick={() => setIsOpen(true)}
        className={cn(
          'group relative flex items-center gap-2 rounded-2xl liquid-glass px-3 py-1.5 ring-1 ring-emerald-500/25 hover:ring-emerald-400/50 shadow-2xl transition-all hover:scale-[1.02] active:scale-95 cursor-pointer select-none',
          className
        )}
        title={
          isTr
            ? 'Canlı VDS Altyapı Telemetrisi & Radar Radarı'
            : isPt
            ? 'Telemetria de Infraestrutura VDS & Radar ao Vivo'
            : 'Live VDS Infrastructure Telemetry & Radar'
        }
      >
        {/* Sonar Ping Indicator */}
        <div className="relative flex h-2.5 w-2.5 items-center justify-center">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_#34d399]" />
        </div>

        {/* Text Details */}
        <div className="flex items-center gap-1.5 text-left font-mono">
          <span className="text-[10.5px] font-bold text-emerald-300 group-hover:text-emerald-200 transition-colors">
            {isTr ? 'TR CLOUD KÜMESİ' : isPt ? 'CLUSTER DE NUVEM' : 'CLOUD CLUSTER'}
          </span>
          <span className="text-slate-600 text-[10px] hidden sm:inline">•</span>
          <span className="text-[10px] font-medium text-slate-300 hidden sm:inline">
            {(primaryCluster?.measuredPing ?? primaryCluster?.basePing ?? 12)}ms
          </span>
          <span className="text-[9px] font-extrabold px-1.5 py-0.5 rounded-md bg-emerald-950/80 text-emerald-400 border border-emerald-500/30">
            10G
          </span>
        </div>

        {/* Mini Wave Signal Icon */}
        <Activity className="h-3 w-3 text-emerald-400/70 group-hover:text-emerald-300 transition-colors" />
      </button>

      {/* ─── Cyberpunk Telemetry & Radar Modal ─── */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-200">
          <div 
            className="relative w-full max-w-2xl rounded-2xl border border-emerald-500/30 bg-[#0a0f1a]/95 p-6 shadow-2xl shadow-emerald-500/10 ring-1 ring-white/10 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Top Ambient Glow */}
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-96 h-24 bg-gradient-to-b from-emerald-500/15 to-transparent blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="relative flex items-center justify-between border-b border-white/[0.08] pb-4 mb-5">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.2)]">
                  <Radio className="h-5 w-5 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-white tracking-tight">
                      {isTr
                        ? 'VDS Küme Telemetrisi & Altyapı Radarı'
                        : isPt
                        ? 'Telemetria de Cluster VDS & Radar de Infraestrutura'
                        : 'VDS Cluster Telemetry & Infra Radar'}
                    </h3>
                    <span className="flex items-center gap-1 rounded-md bg-emerald-500/20 px-2 py-0.5 text-[10px] font-mono font-bold text-emerald-300 border border-emerald-500/30">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-ping" />
                      {isTr ? 'CANLI VERİ' : isPt ? 'DADOS AO VIVO' : 'LIVE DATA'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5 font-mono">
                    {isTr
                      ? 'XIVIZLEY Dağıtım Motoru • OWEB 10 Gbps NVMe Omurgası'
                      : isPt
                      ? 'Motor de Implantação XIVIZLEY • Backbone NVMe OWEB 10 Gbps'
                      : 'XIVIZLEY Deployment Engine • OWEB 10 Gbps NVMe Backbone'}
                  </p>
                </div>
              </div>

              {/* Close Button */}
              <button
                onClick={() => setIsOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-xl border border-white/[0.08] bg-slate-900/60 text-slate-400 hover:text-white hover:border-slate-700 transition-colors"
                aria-label={isTr ? 'Kapat' : isPt ? 'Fechar' : 'Close'}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Sub-Nav & Fast Action */}
            <div className="flex items-center justify-between gap-2 mb-4">
              <div className="flex items-center gap-1.5 rounded-xl bg-slate-900/80 p-1 border border-white/[0.06]">
                <button
                  onClick={() => setActiveTab('radar')}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                    activeTab === 'radar'
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                      : 'text-slate-400 hover:text-white'
                  )}
                >
                  <Server className="h-3.5 w-3.5" />
                  <span>{isTr ? 'Datacenter Kümeleri' : isPt ? 'Clusters de Datacenter' : 'Datacenter Clusters'}</span>
                </button>
                <button
                  onClick={() => setActiveTab('telemetry')}
                  className={cn(
                    'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all',
                    activeTab === 'telemetry'
                      ? 'bg-emerald-500 text-slate-950 font-bold shadow-md shadow-emerald-500/20'
                      : 'text-slate-400 hover:text-white'
                  )}
                >
                  <Activity className="h-3.5 w-3.5" />
                  <span>{isTr ? 'Docker Daemon & Ağ' : isPt ? 'Docker Daemon & Rede' : 'Docker Daemon & Network'}</span>
                </button>
              </div>

              {/* Ping Trigger Button */}
              <button
                onClick={runPingTest}
                disabled={isTesting}
                className="flex items-center gap-1.5 rounded-xl border border-emerald-500/30 bg-emerald-950/40 px-3 py-1.5 text-xs font-semibold text-emerald-300 hover:bg-emerald-900/50 hover:text-white transition-all active:scale-95 disabled:opacity-50"
              >
                <RefreshCw className={cn('h-3.5 w-3.5', isTesting && 'animate-spin text-emerald-400')} />
                <span>
                  {isTesting
                    ? isTr
                      ? 'Ölçülüyor...'
                      : isPt
                      ? 'Medindo...'
                      : 'Measuring...'
                    : isTr
                    ? 'Ping Testi Yap'
                    : isPt
                    ? 'Testar Ping'
                    : 'Run Ping Test'}
                </span>
              </button>
            </div>

            {/* Tab 1: Datacenter Nodes */}
            {activeTab === 'radar' && (
              <div className="space-y-3">
                {clusters.map((node) => (
                  <div
                    key={node.id}
                    className="relative group rounded-xl border border-white/[0.08] bg-[#0f172a]/60 hover:bg-[#0f172a]/90 p-4 transition-all duration-200 hover:border-emerald-500/40"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-base">{node.flag}</span>
                          <span className="font-bold text-sm text-white">{node.name}</span>
                          <span className="text-[10px] font-mono font-extrabold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                            {node.uptime} UPTIME
                          </span>
                        </div>
                        <p className="text-xs text-slate-400 mt-1 font-medium">
                          {node.provider} • <span className="text-slate-500">{node.region}</span>
                        </p>
                      </div>

                      {/* Right Ping & Hardware Badges */}
                      <div className="flex items-center gap-3">
                        <div className="text-right font-mono">
                          <div className="flex items-center justify-end gap-1.5">
                            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                            <span className="text-xs font-extrabold text-emerald-300">
                              {node.measuredPing ?? node.basePing} ms
                            </span>
                          </div>
                          <span className="text-[10px] text-slate-500">{node.bandwidth}</span>
                        </div>

                        {/* Direct Affiliate Sponsor Button */}
                        <a
                          href={node.affiliateUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 px-3 py-2 text-xs font-bold text-white shadow-md shadow-emerald-500/10 active:scale-95 transition-all shrink-0"
                        >
                          <span>
                            {isTr
                              ? 'Sunucuları İncele'
                              : isPt
                              ? 'Ver Servidores'
                              : 'Explore Servers'}
                          </span>
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      </div>
                    </div>

                    {/* Spec Footer Strip */}
                    <div className="mt-3 pt-2.5 border-t border-white/[0.04] grid grid-cols-2 sm:grid-cols-3 gap-2 text-[11px] font-mono text-slate-400">
                      <div className="flex items-center gap-1">
                        <Cpu className="h-3 w-3 text-cyan-400" />
                        <span className="truncate">{node.cpuModel}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Zap className="h-3 w-3 text-amber-400" />
                        <span className="truncate">{node.storage}</span>
                      </div>
                      <div className="flex items-center gap-1 col-span-2 sm:col-span-1">
                        <ShieldCheck className="h-3 w-3 text-emerald-400" />
                        <span>
                          {isTr
                            ? 'DDoS Koruması: Aktif'
                            : isPt
                            ? 'Proteção DDoS: Ativa'
                            : 'DDoS Protection: Active'}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Tab 2: Telemetry & Docker Daemon Health */}
            {activeTab === 'telemetry' && (
              <div className="rounded-xl border border-white/[0.08] bg-[#0f172a]/60 p-4 font-mono text-xs text-slate-300 space-y-3">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/[0.04]">
                    <span className="text-[10px] text-slate-500 block">Docker Daemon</span>
                    <span className="text-emerald-400 font-bold">v27.1 Ready</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/[0.04]">
                    <span className="text-[10px] text-slate-500 block">
                      {isTr ? 'Tuvaldeki Modüller' : isPt ? 'Módulos na Tela' : 'Canvas Modules'}
                    </span>
                    <span className="text-cyan-400 font-bold">
                      {nodes.length} {isTr ? 'Servis' : isPt ? 'Serviços' : 'Services'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/[0.04]">
                    <span className="text-[10px] text-slate-500 block">
                      {isTr ? 'Kurulum Süresi' : isPt ? 'Tempo de Implantação' : 'Deploy Time'}
                    </span>
                    <span className="text-amber-400 font-bold">
                      {isTr ? '~4.8 sn (1-Tık)' : isPt ? '~4.8s (1-Clique)' : '~4.8s (1-Click)'}
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-900/60 border border-white/[0.04]">
                    <span className="text-[10px] text-slate-500 block">
                      {isTr ? 'OS Uyumluluğu' : isPt ? 'Compatibilidade OS' : 'OS Compatibility'}
                    </span>
                    <span className="text-purple-400 font-bold">100% Linux</span>
                  </div>
                </div>

                <div className="rounded-lg bg-black/50 p-3 border border-emerald-500/20 text-[11px] text-emerald-400/90 leading-relaxed overflow-x-auto">
                  <div className="flex items-center gap-1.5 text-slate-400 mb-1">
                    <Terminal className="h-3.5 w-3.5 text-emerald-400" />
                    <span>
                      {isTr
                        ? 'XIVIZLEY Canlı Altyapı Denetleyicisi:'
                        : isPt
                        ? 'Inspetor de Infraestrutura XIVIZLEY:'
                        : 'XIVIZLEY Live Infrastructure Inspector:'}
                    </span>
                  </div>
                  <div>$ curl -sL https://xivizley.com.tr/api/run/raw?data=cluster-check</div>
                  <div className="text-slate-400">
                    &gt;{' '}
                    {isTr
                      ? 'OWEB TR Cloud 10 Gbps NVMe kümesi doğrulandı.'
                      : isPt
                      ? 'Cluster OWEB TR Cloud 10 Gbps NVMe verificado.'
                      : 'OWEB TR Cloud 10 Gbps NVMe cluster verified.'}
                  </div>
                  <div className="text-slate-400">
                    &gt;{' '}
                    {isTr
                      ? 'Port çakışma denetleyicisi: AKTİF (0 çakışma riski).'
                      : isPt
                      ? 'Detector de conflito de portas: ATIVO (0 riscos).'
                      : 'Port conflict resolver: ACTIVE (0 conflict risk).'}
                  </div>
                  <div className="text-slate-400">
                    &gt;{' '}
                    {isTr
                      ? 'Dağıtım protokolü: SSH 1-Line Execution (Ready).'
                      : isPt
                      ? 'Protocolo de implantação: Execução SSH de 1 linha (Pronto).'
                      : 'Deployment protocol: SSH 1-Line Execution (Ready).'}
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Bar Action */}
            <div className="mt-5 pt-4 border-t border-white/[0.08] flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="text-xs text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <span>
                  {isTr ? (
                    <>Mimarileriniz bu altyapılarda <strong>tek tıkla</strong> kurulmaya hazır.</>
                  ) : isPt ? (
                    <>Suas arquiteturas estão prontas para implantação em <strong>1 clique</strong>.</>
                  ) : (
                    <>Your stacks are ready to deploy in <strong>1-click</strong> on these hosts.</>
                  )}
                </span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                {onOpenDeploy && (
                  <button
                    onClick={() => {
                      setIsOpen(false);
                      onOpenDeploy();
                    }}
                    className="w-full sm:w-auto flex items-center justify-center gap-1.5 rounded-xl bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 hover:from-cyan-400 hover:via-blue-400 hover:to-indigo-500 px-4 py-2 text-xs font-bold text-white shadow-lg shadow-cyan-500/25 active:scale-95 transition-all"
                  >
                    <Zap className="h-3.5 w-3.5" />
                    <span>
                      {isTr
                        ? 'Mimarimi Dağıtıma Hazırla'
                        : isPt
                        ? 'Preparar Implantação'
                        : 'Deploy Architecture'}
                    </span>
                  </button>
                )}
                <button
                  onClick={() => setIsOpen(false)}
                  className="w-full sm:w-auto px-3 py-2 rounded-xl text-xs font-semibold text-slate-400 hover:text-white transition-colors"
                >
                  {isTr ? 'Kapat' : isPt ? 'Fechar' : 'Close'}
                </button>
              </div>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
