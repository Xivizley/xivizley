'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useLiveAgentStore } from '@/store/useLiveAgentStore';
import { useArchitectStore } from '@/store/useArchitectStore';
import { generateCode } from '@/lib/generators/composeGenerator';
import {
  Server,
  Activity,
  Play,
  Square,
  RotateCw,
  Terminal,
  Cpu,
  HardDrive,
  Clock,
  Check,
  Copy,
  AlertCircle,
  Sparkles,
  X,
  Radio,
  Boxes,
  ExternalLink,
  ShieldCheck,
  RefreshCw,
  Lock,
  KeyRound,
  CheckCircle2,
  ChevronRight,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface LiveAgentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onToast?: (type: 'success' | 'error' | 'info', title: string, desc?: string) => void;
}

export function LiveAgentModal({ isOpen, onClose, onToast }: LiveAgentModalProps) {
  const {
    serverUrl,
    token,
    setServerUrl,
    setToken,
    isConnected,
    isConnecting,
    lastError,
    stats,
    containers,
    selectedContainerLogs,
    isLoadingLogs,
    isDeploying,
    deployLogs,
    isDeployRunning,
    deployStatus,
    isDeployTerminalOpen,
    setDeployTerminalOpen,
    connect,
    disconnect,
    fetchStats,
    fetchContainers,
    fetchDeployStatus,
    clearDeployLogs,
    executeContainerAction,
    fetchContainerLogs,
    closeLogs,
    deployYamlToLiveServer,
  } = useLiveAgentStore();

  const nodes = useArchitectStore((s) => s.nodes);
  const edges = useArchitectStore((s) => s.edges);

  const [inputUrl, setInputUrl] = useState(serverUrl);
  const [inputToken, setInputToken] = useState(token);
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [copiedCurlDeploy, setCopiedCurlDeploy] = useState(false);
  const [activeActionId, setActiveActionId] = useState<string | null>(null);

  const terminalRef = useRef<HTMLPreElement>(null);

  useEffect(() => {
    setInputUrl(serverUrl);
  }, [serverUrl]);

  useEffect(() => {
    setInputToken(token);
  }, [token]);

  // Poll stats and containers while modal is open and connected
  useEffect(() => {
    if (!isOpen || !isConnected) return;
    const interval = setInterval(() => {
      fetchStats();
      fetchContainers();
    }, 3000);
    return () => clearInterval(interval);
  }, [isOpen, isConnected, fetchStats, fetchContainers]);

  // Poll deployment status & logs while deploy is running
  useEffect(() => {
    if (!isOpen || !isConnected || !isDeployRunning) return;
    const interval = setInterval(() => {
      fetchDeployStatus();
    }, 1500);
    return () => clearInterval(interval);
  }, [isOpen, isConnected, isDeployRunning, fetchDeployStatus]);

  // Auto-scroll terminal to bottom when logs update
  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [deployLogs]);

  // Generate 1-liner curl deployment command
  const rawCurlDeployCmd = useMemo(() => {
    if (nodes.length === 0) return '';
    try {
      const dataStr = Buffer.from(JSON.stringify(nodes)).toString('base64url');
      return `curl -sSL "https://xivizley.com.tr/api/run/raw?data=${dataStr}" | bash`;
    } catch {
      return '';
    }
  }, [nodes]);

  const handleConnectToggle = async () => {
    if (isConnected) {
      disconnect();
      onToast?.('info', 'Bağlantı Kesildi', 'Canlı sunucu bağlantısı sonlandırıldı.');
    } else {
      const ok = await connect(inputUrl, inputToken);
      if (ok) {
        onToast?.('success', 'Bağlantı Başarılı! 🟢', `${inputUrl} sunucusuna canlı bağlandı.`);
      } else {
        onToast?.('error', 'Bağlantı Başarısız', 'Sunucuya ulaşılamadı veya token hatalı.');
      }
    }
  };

  const handleContainerAction = async (id: string, action: 'start' | 'stop' | 'restart') => {
    setActiveActionId(id);
    const ok = await executeContainerAction(id, action);
    setActiveActionId(null);
    if (ok) {
      onToast?.('success', 'İşlem Başarılı', `Konteyner ${action} komutu uygulandı.`);
    } else {
      onToast?.('error', 'Hata', `Konteyner ${action} işlemi başarısız oldu.`);
    }
  };

  const handleLiveDeploy = async () => {
    if (nodes.length === 0) {
      onToast?.('error', 'Tuval Boş', 'Dağıtmak için tuvale en az bir modül ekleyin.');
      return;
    }

    setDeployTerminalOpen(true);
    const { dockerCompose } = generateCode(nodes, edges);
    const res = await deployYamlToLiveServer(dockerCompose, 'XIVIZLEY Mimari');
    if (res.success) {
      onToast?.('success', 'Canlı Dağıtım Başlatıldı! 🚀', res.message);
    } else {
      onToast?.('error', 'Dağıtım Hatası', res.message);
    }
  };

  const handleCopyCurlDeploy = async () => {
    if (!rawCurlDeployCmd) return;
    await navigator.clipboard.writeText(rawCurlDeployCmd);
    setCopiedCurlDeploy(true);
    onToast?.('success', 'Kopyalandı', 'Tek satır Curl dağıtım komutu panoya kopyalandı.');
    setTimeout(() => setCopiedCurlDeploy(false), 2500);
  };

  const agentInstallCmd = 'curl -sSL https://xivizley.com.tr/api/agent/setup | bash';

  const handleCopyInstallCmd = async () => {
    await navigator.clipboard.writeText(agentInstallCmd);
    setCopiedCmd(true);
    onToast?.('success', 'Kopyalandı', 'Kurulum komutu panoya kopyalandı.');
    setTimeout(() => setCopiedCmd(false), 2000);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200">
      <div className="relative w-full max-w-4xl max-h-[92vh] flex flex-col rounded-3xl border border-cyan-500/40 bg-[#080d18] shadow-2xl overflow-hidden text-slate-100">
        
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className={cn(
              'flex h-10 w-10 items-center justify-center rounded-2xl border shadow-inner transition-all',
              isConnected
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/40 shadow-emerald-500/20 animate-pulse'
                : 'bg-cyan-500/15 text-cyan-400 border-cyan-500/30'
            )}>
              <Radio className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-100">XIVIZLEY Canlı Sunucu Ajanı (Live Control)</h2>
                <span className={cn(
                  'rounded-full px-2.5 py-0.5 text-[10px] font-bold font-mono border',
                  isConnected
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/50'
                    : 'bg-slate-800 text-slate-400 border-slate-700'
                )}>
                  {isConnected ? '● CANLI BAĞLI' : '○ BAĞLANTI YOK'}
                </span>
              </div>
              <p className="text-xs text-slate-400">VDS sunucunuzdaki konteynerleri webden canlı yönetin ve 1-tıkla dağıtın</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="rounded-xl p-2 text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scrollbar-thin scrollbar-thumb-slate-700">
          
          {/* Connection Card */}
          <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/80 space-y-3">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                  <Server className="h-3.5 w-3.5 text-cyan-400" />
                  <span>Ajan Adresi:</span>
                </label>
                <input
                  type="text"
                  value={inputUrl}
                  onChange={(e) => setInputUrl(e.target.value)}
                  placeholder="https://178.210.168.163:8050"
                  disabled={isConnected}
                  className="w-full rounded-xl border border-slate-700 bg-[#08090E] px-3.5 py-2 text-xs font-mono text-indigo-300 focus:outline-none focus:ring-1 focus:ring-indigo-500 disabled:opacity-60"
                />
              </div>

              <div className="space-y-1.5">
                <label className="flex items-center gap-1.5 text-xs font-semibold text-slate-300">
                  <KeyRound className="h-3.5 w-3.5 text-amber-400" />
                  <span>Güvenlik Tokenı (Token):</span>
                </label>
                <input
                  type="password"
                  value={inputToken}
                  onChange={(e) => setInputToken(e.target.value)}
                  placeholder="Kurulumda verilen XIV_AGENT_TOKEN"
                  disabled={isConnected}
                  className="w-full rounded-xl border border-slate-700 bg-[#08090E] px-3.5 py-2 text-xs font-mono text-amber-300 focus:outline-none focus:ring-1 focus:ring-amber-500 disabled:opacity-60"
                />
              </div>
            </div>

            <div className="flex items-center justify-end pt-1">
              <button
                onClick={handleConnectToggle}
                disabled={isConnecting}
                className={cn(
                  'flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold transition-all shadow-md active:scale-95',
                  isConnected
                    ? 'bg-red-500/20 text-red-300 border border-red-500/40 hover:bg-red-500/30'
                    : 'bg-gradient-to-r from-cyan-600 to-blue-600 text-white hover:from-cyan-500 hover:to-blue-500 shadow-cyan-500/20'
                )}
              >
                {isConnecting ? (
                  <>
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    <span>Bağlanıyor...</span>
                  </>
                ) : isConnected ? (
                  <span>Bağlantıyı Kes</span>
                ) : (
                  <>
                    <Radio className="h-3.5 w-3.5" />
                    <span>Canlı Bağlan</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {lastError && !isConnected && (
            <div className="flex items-start gap-3 p-4 rounded-2xl border border-red-500/40 bg-red-950/20 text-xs text-red-300">
              <AlertCircle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Bağlantı Hatası</p>
                <p className="text-[11px] text-red-300/80 mt-0.5">{lastError}</p>
              </div>
            </div>
          )}

          {/* Connected State */}
          {isConnected && stats ? (
            <div className="space-y-6">
              {/* Telemetry Gauges */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="font-semibold flex items-center gap-1.5"><Cpu className="h-3.5 w-3.5 text-cyan-400" /> CPU</span>
                    <span className="font-mono text-cyan-300 font-bold">%{stats.cpuUsage}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-cyan-400 transition-all duration-500 rounded-full"
                      style={{ width: `${Math.min(100, stats.cpuUsage)}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="font-semibold flex items-center gap-1.5"><Activity className="h-3.5 w-3.5 text-emerald-400" /> RAM</span>
                    <span className="font-mono text-emerald-300 font-bold">
                      {(stats.memoryUsedMB / 1024).toFixed(1)}/{(stats.memoryTotalMB / 1024).toFixed(1)} GB
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-emerald-400 transition-all duration-500 rounded-full"
                      style={{
                        width: `${Math.min(100, (stats.memoryUsedMB / (stats.memoryTotalMB || 1)) * 100)}%`,
                      }}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="font-semibold flex items-center gap-1.5"><HardDrive className="h-3.5 w-3.5 text-amber-400" /> Disk</span>
                    <span className="font-mono text-amber-300 font-bold">%{stats.diskUsagePercent}</span>
                  </div>
                  <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                    <div
                      className="h-full bg-amber-400 transition-all duration-500 rounded-full"
                      style={{ width: `${Math.min(100, stats.diskUsagePercent)}%` }}
                    />
                  </div>
                </div>

                <div className="p-4 rounded-2xl border border-slate-800 bg-slate-900/60 flex flex-col justify-between">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-2">
                    <span className="font-semibold flex items-center gap-1.5"><Boxes className="h-3.5 w-3.5 text-purple-400" /> Docker</span>
                    <span className="font-mono text-purple-300 font-bold">{containers.length} Servis</span>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 font-mono">
                    <span>OS: {stats.osName}</span>
                    <span>Uptime: {Math.floor(stats.uptimeSeconds / 3600)}s</span>
                  </div>
                </div>
              </div>

              {/* Action Banner: 1-Click Deploy to Live Server */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl border border-cyan-500/30 bg-gradient-to-r from-cyan-950/40 via-slate-900 to-slate-900 shadow-xl">
                <div>
                  <h4 className="text-xs font-bold text-slate-100 flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-cyan-400" />
                    Tuvaldeki Mimariyi Bu Sunucuya Dağıt ({nodes.length} Modül)
                  </h4>
                  <p className="text-[11px] text-slate-400 mt-0.5">
                    Tuvaldeki tüm servisleri doğrudan bağlı VDS sunucunuza konuşlandırır ve canlı başlatır.
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => setDeployTerminalOpen(!isDeployTerminalOpen)}
                    className={cn(
                      'flex items-center gap-1.5 px-3 py-2.5 rounded-xl border text-xs font-medium transition-all',
                      isDeployTerminalOpen
                        ? 'border-cyan-500/50 bg-cyan-950/40 text-cyan-300'
                        : 'border-slate-700 bg-slate-800 text-slate-300 hover:text-white hover:bg-slate-700'
                    )}
                    title="Canlı Konsolu Göster / Gizle"
                  >
                    <Terminal className="h-3.5 w-3.5" />
                    <span>{isDeployTerminalOpen ? 'Konsolu Gizle' : 'Canlı Konsol'}</span>
                  </button>

                  <button
                    onClick={handleLiveDeploy}
                    disabled={isDeploying || isDeployRunning || nodes.length === 0}
                    className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-xs font-extrabold text-slate-950 shadow-lg shadow-cyan-500/25 transition-all active:scale-95 disabled:opacity-50 shrink-0"
                  >
                    {isDeploying || isDeployRunning ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Sparkles className="h-4 w-4" />}
                    <span>{isDeploying || isDeployRunning ? 'Kuruluyor (Konsola Bakın)...' : '⚡ Hepsini Kur (Canlı Dağıt)'}</span>
                  </button>
                </div>
              </div>

              {/* Live Deployment Terminal & Curl Drawer */}
              {isDeployTerminalOpen && (
                <div className="rounded-2xl border border-cyan-500/40 bg-[#050812] overflow-hidden shadow-2xl animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="flex items-center justify-between px-4 py-3 border-b border-slate-800/80 bg-slate-950/80">
                    <div className="flex items-center gap-2.5">
                      <Terminal className="h-4 w-4 text-cyan-400" />
                      <span className="text-xs font-mono font-bold text-slate-200">
                        Canlı Dağıtım Konsolu (Live Terminal)
                      </span>
                      <span className={cn(
                        'text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border',
                        isDeployRunning
                          ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30 animate-pulse'
                          : deployStatus === 'success'
                          ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          : deployStatus === 'error'
                          ? 'bg-red-500/10 text-red-400 border-red-500/30'
                          : 'bg-slate-800 text-slate-400 border-slate-700'
                      )}>
                        {isDeployRunning ? '● ÇALIŞIYOR...' : deployStatus === 'success' ? '✓ TAMAMLANDI' : deployStatus === 'error' ? '✗ HATA' : '○ HAZIR'}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      {rawCurlDeployCmd && (
                        <button
                          onClick={handleCopyCurlDeploy}
                          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-[11px] font-mono text-cyan-300 transition-all"
                          title="Tek satır Curl dağıtım komutunu kopyala"
                        >
                          {copiedCurlDeploy ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                          <span>{copiedCurlDeploy ? 'Kopyalandı!' : 'Curl Komutunu Kopyala'}</span>
                        </button>
                      )}
                      <button
                        onClick={handleLiveDeploy}
                        disabled={isDeployRunning || nodes.length === 0}
                        className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-slate-700 bg-slate-800 hover:bg-slate-700 text-[11px] font-mono text-slate-300 transition-all disabled:opacity-50"
                        title="Yeniden Çalıştır"
                      >
                        <RotateCw className={cn('h-3 w-3', isDeployRunning && 'animate-spin')} />
                        <span>Tekrar Çalıştır</span>
                      </button>
                      <button
                        onClick={() => setDeployTerminalOpen(false)}
                        className="p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-slate-800 transition-colors"
                        title="Konsolu Kapat"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  {/* Terminal Body */}
                  <div className="p-4 space-y-3 font-mono text-xs">
                    {rawCurlDeployCmd && (
                      <div className="p-2.5 rounded-xl bg-slate-900/90 border border-slate-800/80 text-[11px] text-cyan-400 overflow-x-auto select-all flex items-center justify-between gap-2">
                        <div className="truncate">
                          <span className="text-amber-400">$ </span>
                          <span>{rawCurlDeployCmd}</span>
                        </div>
                        <button
                          onClick={handleCopyCurlDeploy}
                          className="shrink-0 p-1 text-slate-400 hover:text-cyan-300"
                          title="Kopyala"
                        >
                          {copiedCurlDeploy ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                        </button>
                      </div>
                    )}

                    <pre
                      ref={terminalRef}
                      className="max-h-72 overflow-y-auto rounded-xl p-3.5 bg-black/75 border border-slate-800 text-[11px] leading-relaxed text-slate-300 scrollbar-thin scrollbar-thumb-slate-700 whitespace-pre-wrap selection:bg-cyan-500 selection:text-black font-mono"
                    >
                      {deployLogs || 'Dağıtım çıktısı bekleniyor...'}
                    </pre>

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-[11px] text-slate-400">
                      <span>💡 <strong>İpucu:</strong> Bu dağıtım sunucunuzda arka planda çalışır. İsterseniz yukarıdaki tek satır <strong>curl</strong> komutunu SSH terminalinize yapıştırarak da canlı olarak izleyebilirsiniz.</span>
                      <button
                        onClick={() => fetchDeployStatus()}
                        className="text-cyan-400 hover:underline shrink-0 text-left"
                      >
                        Logları Yenile
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Containers Management Table */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-slate-200 flex items-center gap-2">
                    <Boxes className="h-4 w-4 text-cyan-400" />
                    Sunucudaki Canlı Docker Konteynerleri ({containers.length})
                  </h3>
                  <button
                    onClick={() => fetchContainers()}
                    className="flex items-center gap-1 text-[11px] text-cyan-400 hover:text-cyan-300"
                  >
                    <RefreshCw className="h-3 w-3" />
                    <span>Yenile</span>
                  </button>
                </div>

                {containers.length === 0 ? (
                  <div className="p-6 rounded-2xl border border-slate-800 bg-slate-900/40 text-center space-y-2">
                    <Boxes className="h-8 w-8 text-slate-600 mx-auto" />
                    <p className="text-xs text-slate-300 font-semibold">
                      Henüz sunucuda çalışan Docker konteyneri tespit edilmedi.
                    </p>
                    <p className="text-[11px] text-slate-500 max-w-sm mx-auto">
                      Yukarıdaki <strong>&ldquo;⚡ Hepsini Kur (Canlı Dağıt)&rdquo;</strong> butonuna tıklayarak tuvalinizdeki mimariyi hemen başlatabilirsiniz.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-slate-900/50">
                    <table className="w-full text-left text-xs">
                      <thead className="border-b border-slate-800 bg-slate-950/60 text-[11px] text-slate-400 font-mono">
                        <tr>
                          <th className="py-2.5 px-4">Konteyner Adı</th>
                          <th className="py-2.5 px-3">İmaj</th>
                          <th className="py-2.5 px-3">Durum</th>
                          <th className="py-2.5 px-3">Portlar</th>
                          <th className="py-2.5 px-4 text-right">İşlemler</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800/60 font-mono text-[11px]">
                        {containers.map((c) => {
                          const name = (c.Names?.[0] || c.Id).replace(/^\//, '');
                          const isRunning = c.State === 'running';
                          const isActionLoading = activeActionId === c.Id;

                          return (
                            <tr key={c.Id} className="hover:bg-slate-800/40 transition-colors">
                              <td className="py-3 px-4 font-bold text-slate-200">
                                {name}
                              </td>
                              <td className="py-3 px-3 text-slate-400 truncate max-w-[150px]">
                                {c.Image}
                              </td>
                              <td className="py-3 px-3">
                                <span className={cn(
                                  'inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-semibold border',
                                  isRunning
                                    ? 'bg-emerald-950/40 text-emerald-300 border-emerald-500/40'
                                    : 'bg-red-950/40 text-red-300 border-red-500/40'
                                  )}>
                                  <span className={cn('h-1.5 w-1.5 rounded-full', isRunning ? 'bg-emerald-400 animate-pulse' : 'bg-red-400')} />
                                  {c.State}
                                </span>
                              </td>
                              <td className="py-3 px-3 text-slate-400">
                                {c.Ports && c.Ports.length > 0 ? (
                                  <span className="text-cyan-300">
                                    {c.Ports.filter((p) => p.PublicPort).map((p) => `${p.PublicPort}:${p.PrivatePort}`).join(', ') || 'İç Port'}
                                  </span>
                                ) : (
                                  '—'
                                )}
                              </td>
                              <td className="py-3 px-4 text-right">
                                <div className="flex items-center justify-end gap-1.5">
                                  {isRunning ? (
                                    <button
                                      onClick={() => handleContainerAction(c.Id, 'stop')}
                                      disabled={isActionLoading}
                                      className="p-1.5 rounded-lg bg-red-500/15 text-red-300 hover:bg-red-500/30 border border-red-500/30 transition-all"
                                      title="Konteyneri Durdur"
                                    >
                                      <Square className="h-3 w-3" />
                                    </button>
                                  ) : (
                                    <button
                                      onClick={() => handleContainerAction(c.Id, 'start')}
                                      disabled={isActionLoading}
                                      className="p-1.5 rounded-lg bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/30 border border-emerald-500/30 transition-all"
                                      title="Konteyneri Başlat"
                                    >
                                      <Play className="h-3 w-3" />
                                    </button>
                                  )}

                                  <button
                                    onClick={() => handleContainerAction(c.Id, 'restart')}
                                    disabled={isActionLoading}
                                    className="p-1.5 rounded-lg bg-amber-500/15 text-amber-300 hover:bg-amber-500/30 border border-amber-500/30 transition-all"
                                    title="Yeniden Başlat"
                                  >
                                    <RotateCw className="h-3 w-3" />
                                  </button>

                                  <button
                                    onClick={() => fetchContainerLogs(c.Id, name)}
                                    className="p-1.5 rounded-lg bg-cyan-500/15 text-cyan-300 hover:bg-cyan-500/30 border border-cyan-500/30 transition-all"
                                    title="Canlı Logları Oku"
                                  >
                                    <Terminal className="h-3 w-3" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>

              {/* Live Terminal Log Modal Drawer */}
              {selectedContainerLogs && (
                <div className="rounded-2xl border border-indigo-500/40 bg-[#08090E] overflow-hidden shadow-2xl">
                  <div className="flex items-center justify-between px-4 py-2.5 border-b border-slate-800 bg-[#0e111a] text-xs">
                    <span className="font-mono text-indigo-300 flex items-center gap-2">
                      <Terminal className="h-3.5 w-3.5 text-indigo-400" />
                      Canlı Konsol Logları: <strong className="text-white">{selectedContainerLogs.name}</strong>
                    </span>
                    <button
                      onClick={closeLogs}
                      className="p-1 rounded text-slate-400 hover:text-white"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                  <pre className="p-4 text-[11px] font-mono text-slate-300 max-h-60 overflow-y-auto whitespace-pre-wrap scrollbar-thin scrollbar-thumb-slate-700 selection:bg-indigo-500 selection:text-white">
                    {isLoadingLogs ? 'Loglar sunucudan canlı aktarılıyor...' : selectedContainerLogs.logs}
                  </pre>
                </div>
              )}
            </div>
          ) : (
            /* Disconnected Setup Guide */
            <div className="space-y-4 rounded-2xl border border-slate-800 bg-[#0e111a] p-6 text-center">
              <div className="h-12 w-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto">
                <Radio className="h-6 w-6" />
              </div>
              <div className="max-w-md mx-auto">
                <h3 className="text-sm font-bold text-slate-100">Sunucunuzda XIVIZLEY Ajanını Başlatın</h3>
                <p className="text-xs text-slate-400 mt-1">
                  VDS sunucunuzda ajanı aktif etmek için aşağıdaki komutu bir kez terminalde çalıştırmanız yeterlidir.
                </p>
              </div>

              <div className="flex items-center justify-between p-3 rounded-xl border border-slate-700/80 bg-[#08090E] max-w-xl mx-auto text-xs font-mono text-indigo-300">
                <span className="truncate">{agentInstallCmd}</span>
                <button
                  onClick={handleCopyInstallCmd}
                  className="flex items-center gap-1 ml-3 px-3 py-1.5 rounded-lg bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 hover:bg-gradient-to-r hover:from-indigo-500 hover:via-purple-500 hover:to-cyan-500 hover:text-white hover:border-transparent font-bold transition-all shrink-0"
                >
                  {copiedCmd ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedCmd ? 'Kopyalandı' : 'Kopyala'}</span>
                </button>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950/60 flex items-center justify-between text-xs text-slate-400">
          <span className="font-mono text-[11px]">
            {isConnected ? `Bağlı: ${serverUrl}` : 'Durum: Çevrimdışı'}
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-all"
          >
            Kapat
          </button>
        </div>

      </div>
    </div>
  );
}
