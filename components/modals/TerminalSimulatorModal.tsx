'use client';

// ============================================================
// XIVIZLEY — Interactive Terminal & Docker Simulator Modal
// components/modals/TerminalSimulatorModal.tsx
// Features: Full interactive CLI with history, 'durum' CLI replica,
// 'docker ps', 'docker compose up/down', quick suggestion chips,
// and full TR / EN / PT localization.
// ============================================================

import React, { useState, useEffect, useRef } from 'react';
import { useArchitectStore } from '@/store/useArchitectStore';
import { MODULE_CATALOG } from '@/lib/data/modules';
import { useI18nStore } from '@/lib/i18n/store';
import {
  Terminal,
  Play,
  RotateCcw,
  X,
  ShieldCheck,
  CornerDownLeft,
  Trash2,
  Cpu,
  Server,
  Layers,
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface TerminalSimulatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TerminalLine {
  id: string;
  type: 'cmd' | 'output' | 'success' | 'info' | 'error' | 'header';
  text: string;
}

export function TerminalSimulatorModal({ isOpen, onClose }: TerminalSimulatorModalProps) {
  const { lang } = useI18nStore();
  const nodes = useArchitectStore((s) => s.nodes);

  const [lines, setLines] = useState<TerminalLine[]>([]);
  const [inputVal, setInputVal] = useState('');
  const [history, setHistory] = useState<string[]>([]);
  const [historyIdx, setHistoryIdx] = useState<number>(-1);
  const [isRunning, setIsRunning] = useState(false);

  const terminalEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const isTr = lang === 'tr';
  const isPt = lang === 'pt';

  // Auto-scroll on output
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [lines, isRunning]);

  // Focus input when modal opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      if (lines.length === 0) {
        initializeBanner();
      }
    }
  }, [isOpen]);

  const addLine = (type: TerminalLine['type'], text: string) => {
    setLines((prev) => [...prev, { id: `${Date.now()}-${Math.random()}`, type, text }]);
  };

  const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

  const initializeBanner = () => {
    setLines([
      {
        id: '1',
        type: 'header',
        text: '============================================================',
      },
      {
        id: '2',
        type: 'header',
        text: isTr
          ? '🚀 XIVIZLEY VDS Terminal & Docker Simülatörü v2.3'
          : isPt
          ? '🚀 Simulador de Terminal VDS & Docker XIVIZLEY v2.3'
          : '🚀 XIVIZLEY VDS Terminal & Docker Simulator v2.3',
      },
      {
        id: '3',
        type: 'info',
        text: isTr
          ? "Yardım için 'help' yazın veya aşağıdaki hazır komut butonlarına tıklayın."
          : isPt
          ? "Digite 'help' para ajuda ou clique nos botões de comando abaixo."
          : "Type 'help' for instructions or click the command chips below.",
      },
      {
        id: '4',
        type: 'header',
        text: '============================================================\n',
      },
    ]);
  };

  // Run 'docker compose up -d' simulation
  const runComposeUp = async () => {
    setIsRunning(true);
    addLine('cmd', '$ docker compose up -d --remove-orphans');
    await sleep(300);

    addLine('info', '[+] Running pre-flight system checks...');
    await sleep(250);
    addLine('success', '[✓] Docker Engine v27.0.3 detected');
    addLine('success', '[✓] Docker Compose plugin v2.28.1 OK');
    addLine('success', '[✓] Port conflict scan: 0 conflicts detected');
    await sleep(350);

    addLine('info', '\n[+] Creating isolated bridge networks and volumes...');
    addLine('success', ' ✔ Network xivizley_net           Created (10.0.0.0/24)');
    addLine('success', ' ✔ Volume xivizley_data_storage  Created');
    await sleep(400);

    addLine('info', '\n[+] Pulling container images and starting microservices...');

    const targetNodes = nodes.length > 0 ? nodes : [
      { id: '1', data: { moduleId: 'nginx-proxy-manager', label: 'Nginx Proxy Manager' } },
      { id: '2', data: { moduleId: 'portainer', label: 'Portainer CE' } },
      { id: '3', data: { moduleId: 'uptime-kuma', label: 'Uptime Kuma' } },
    ];

    for (let i = 0; i < targetNodes.length; i++) {
      const node = targetNodes[i] as any;
      const def = MODULE_CATALOG.find((m) => m.id === node.data.moduleId);
      const name = node.data.label || def?.name || node.data.moduleId;
      const img = def?.dockerImage || 'alpine';
      const tag = def?.defaultTag || 'latest';

      addLine('info', ` ⬇ [${i + 1}/${targetNodes.length}] Pulling ${img}:${tag}...`);
      await sleep(250);
      addLine('success', `   ✔ Layer complete: [sha256:${Math.random().toString(16).substring(2, 10)}]`);
      addLine('info', ` 🚀 Container ${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}  Starting...`);
      await sleep(200);
      addLine('success', `   ✔ Container ${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}  Started (healthy)`);
    }

    await sleep(300);
    addLine('header', '\n============================================================');
    addLine(
      'success',
      isTr
        ? `🎉 BAŞARILI: ${targetNodes.length} konteyner ayağa kaldırıldı ve trafiğe hazır!`
        : isPt
        ? `🎉 SUCESSO: Todos os ${targetNodes.length} containers estão online e saudáveis!`
        : `🎉 SUCCESS: All ${targetNodes.length} containers are up, healthy and routed!`
    );
    addLine('header', '============================================================\n');
    setIsRunning(false);
  };

  // Run 'durum' CLI replica
  const runDurumCLI = async () => {
    setIsRunning(true);
    addLine('cmd', '$ durum');
    await sleep(300);

    addLine('header', '============================================================');
    addLine('header', '  XIVIZLEY — Advanced VDS Status & CLI Management v2.3');
    addLine('header', '  Cryptographically Signed via Embedded NIST P-256 Public Key');
    addLine('header', '  https://xivizley.com.tr');
    addLine('header', '============================================================');
    await sleep(200);

    addLine('success', ' [✓] Trust Anchor: Embedded NIST P-256 ECDSA Verified');
    addLine('info', ' [i] Hostname: xivizley-node-bravo (Ubuntu 24.04 LTS x86_64)');
    addLine('info', ' [i] Kernel: Linux 6.8.0-45-generic');
    addLine('info', ` [i] Docker: Docker Engine 27.0.3 (Compose v2.28.1)`);
    addLine('info', ' [i] CPU Usage:  12.4% (8 vCPU @ 2.60GHz)');
    addLine('info', ' [i] Memory:     4.82 GB / 16.00 GB (30.1% used)');
    addLine('info', ' [i] Storage:    34.1 GB / 250.0 GB (13.6% used)');
    addLine('info', ' [i] WireGuard:  wg0 Active (10.10.0.1/24)');
    await sleep(250);

    addLine('header', '\n--- AKTİF DOCKER SERVİSLERİ ---');
    const containerCount = Math.max(nodes.length, 3);
    addLine('success', ` ✔ Toplam Konteyner: ${containerCount} Aktif / 0 Hatalı`);
    addLine('info', ' • Nginx Proxy Manager   [Port: 80, 443, 81]   -> SAĞLIKLI');
    addLine('info', ' • Portainer CE          [Port: 9443]           -> SAĞLIKLI');
    addLine('info', ' • Uptime Kuma           [Port: 3001]           -> SAĞLIKLI');
    if (nodes.length > 3) {
      nodes.slice(3).forEach((n) => {
        addLine('info', ` • ${n.data.label || n.data.moduleId}  -> SAĞLIKLI`);
      });
    }

    addLine('header', '\n[Komutlar: durum kur <app>, durum guncelle, durum yedek]\n');
    setIsRunning(false);
  };

  // Run 'docker ps'
  const runDockerPs = () => {
    addLine('cmd', '$ docker ps --format "table {{.ID}}\\t{{.Image}}\\t{{.Status}}\\t{{.Ports}}\\t{{.Names}}"');
    const header = 'CONTAINER ID   IMAGE                           STATUS          PORTS                               NAMES';
    addLine('header', header);

    const activeList = nodes.length > 0 ? nodes : [
      { id: 'a1b2c3d4e5f6', data: { moduleId: 'nginx-proxy-manager', label: 'npm' } },
      { id: 'f7e8d9c0b1a2', data: { moduleId: 'portainer', label: 'portainer' } },
      { id: '123456789abc', data: { moduleId: 'uptime-kuma', label: 'uptime-kuma' } },
    ];

    activeList.forEach((n, idx) => {
      const def = MODULE_CATALOG.find((m) => m.id === n.data.moduleId);
      const id = (n.id || `node-${idx}`).substring(0, 12).padEnd(12, '0');
      const img = ((def?.dockerImage || 'alpine') + ':latest').padEnd(30, ' ');
      const status = 'Up 2 hours (healthy)  ';
      const ports = '0.0.0.0:80->80/tcp                  '.substring(0, 36);
      const name = (n.data.label || n.data.moduleId || 'container').toLowerCase().replace(/[^a-z0-9]/g, '-');
      addLine('output', `${id}   ${img}  ${status}  ${ports}  ${name}`);
    });
    addLine('info', '');
  };

  // Handle User Input Submission
  const handleSubmit = async (e?: React.FormEvent) => {
    e?.preventDefault();
    const cmd = inputVal.trim();
    if (!cmd || isRunning) return;

    setHistory((prev) => [...prev, cmd]);
    setHistoryIdx(-1);
    setInputVal('');

    const lower = cmd.toLowerCase();

    if (lower === 'clear') {
      setLines([]);
      return;
    }

    if (lower === 'help') {
      addLine('cmd', `$ ${cmd}`);
      addLine('header', '=== ' + (isTr ? 'Kullanılabilir Komutlar' : isPt ? 'Comandos Disponíveis' : 'Available Commands') + ' ===');
      addLine('info', '  durum                  - ' + (isTr ? 'XIVIZLEY imzalı sistem monitörünü çalıştırır' : isPt ? 'Executa o monitor de sistema assinado XIVIZLEY' : 'Executes signed XIVIZLEY system monitor'));
      addLine('info', '  durum kur <paket>      - ' + (isTr ? 'Belirtilen servisi kurar (örnek: durum kur plex)' : isPt ? 'Instala o serviço indicado (ex: durum kur plex)' : 'Installs specified service (e.g. durum kur plex)'));
      addLine('info', '  durum guncelle         - ' + (isTr ? 'Sistem script ve imzasını doğrular ve günceller' : isPt ? 'Verifica e atualiza o script assinado' : 'Verifies signature and updates durum CLI'));
      addLine('info', '  docker ps              - ' + (isTr ? 'Aktif konteyner listesini gösterir' : isPt ? 'Lista containers Docker em execução' : 'Lists running Docker containers'));
      addLine('info', '  docker compose up      - ' + (isTr ? 'Tuvaldeki tüm servisleri ayağa kaldırır' : isPt ? 'Inicializa todos os serviços do canvas' : 'Starts all canvas services in background'));
      addLine('info', '  docker compose down    - ' + (isTr ? 'Servisleri güvenle kapatır' : isPt ? 'Encerra os containers com segurança' : 'Gracefully stops services and networks'));
      addLine('info', '  docker logs <isim>     - ' + (isTr ? 'Konteyner canlı log akışını gösterir' : isPt ? 'Exibe logs em tempo real do container' : 'Tails simulated container logs'));
      addLine('info', '  uname -a / whoami      - ' + (isTr ? 'Sistem & oturum bilgisi' : isPt ? 'Informações de sistema e usuário' : 'System and user info'));
      addLine('info', '  clear                  - ' + (isTr ? 'Terminal ekranını temizler' : isPt ? 'Limpa o terminal' : 'Clears terminal display\n'));
      return;
    }

    if (lower === 'durum') {
      await runDurumCLI();
      return;
    }

    if (lower.startsWith('durum kur')) {
      const pkg = cmd.replace(/^durum kur\s*/i, '').trim() || 'stack';
      setIsRunning(true);
      addLine('cmd', `$ ${cmd}`);
      await sleep(250);
      addLine('info', `[+] Paket aranıyor: '${pkg}'...`);
      await sleep(350);
      addLine('success', `[✓] Paket bulundu: XIVIZLEY Verified Hub / ${pkg}`);
      addLine('info', ` ⬇ Docker imajı çekiliyor ve compose konfigürasyonu enjekte ediliyor...`);
      await sleep(400);
      addLine('success', `[✓] ${pkg} başarıyla kuruldu ve başlatıldı!`);
      addLine('info', `📡 Servis URL: http://xivizley-vds.local:${Math.floor(1000 + Math.random() * 8000)}\n`);
      setIsRunning(false);
      return;
    }

    if (lower === 'durum guncelle') {
      setIsRunning(true);
      addLine('cmd', `$ ${cmd}`);
      await sleep(300);
      addLine('info', '[+] https://xivizley.com.tr/durum ve dijital imza çekiliyor...');
      await sleep(400);
      addLine('success', '[✓] NIST P-256 ECDSA İmza Doğrulandı: Verified OK');
      addLine('success', '[✓] durum CLI en son v2.3 sürümüne güncellendi.\n');
      setIsRunning(false);
      return;
    }

    if (lower === 'docker ps' || lower === 'ps') {
      runDockerPs();
      return;
    }

    if (lower === 'docker compose up' || lower === 'docker-compose up' || lower === 'up') {
      await runComposeUp();
      return;
    }

    if (lower === 'docker compose down' || lower === 'docker-compose down' || lower === 'down') {
      setIsRunning(true);
      addLine('cmd', `$ ${cmd}`);
      await sleep(300);
      addLine('info', '[+] Stopping and removing containers, networks, volumes...');
      await sleep(400);
      addLine('success', ' ✔ Container xivizley-stack-01  Stopped');
      addLine('success', ' ✔ Container xivizley-stack-02  Stopped');
      addLine('success', ' ✔ Network xivizley_net         Removed');
      addLine('info', '[✓] All services stopped gracefully.\n');
      setIsRunning(false);
      return;
    }

    if (lower.startsWith('docker logs')) {
      const target = cmd.replace(/^docker logs\s*/i, '').trim() || 'container';
      addLine('cmd', `$ ${cmd}`);
      addLine('info', `[i] Tailing logs for ${target}:`);
      addLine('output', `[2026-09-23 20:50:01] [INFO] Starting engine worker thread...`);
      addLine('output', `[2026-09-23 20:50:02] [INFO] Connected to internal SQLite database`);
      addLine('output', `[2026-09-23 20:50:03] [INFO] HTTP server listening on 0.0.0.0:8080`);
      addLine('success', `[2026-09-23 20:50:04] [READY] Health check passed (HTTP 200 OK)\n`);
      return;
    }

    if (lower === 'whoami') {
      addLine('cmd', `$ ${cmd}`);
      addLine('output', 'root\n');
      return;
    }

    if (lower === 'uname -a') {
      addLine('cmd', `$ ${cmd}`);
      addLine('output', 'Linux xivizley-vds 6.8.0-45-generic #45-Ubuntu SMP PREEMPT_DYNAMIC x86_64 GNU/Linux\n');
      return;
    }

    // Unrecognized command
    addLine('cmd', `$ ${cmd}`);
    addLine(
      'error',
      isTr
        ? `bash: ${cmd}: komut bulunamadı. Kullanılabilir komutları listelemek için 'help' yazın.`
        : isPt
        ? `bash: ${cmd}: comando não encontrado. Digite 'help' para ver os comandos disponíveis.`
        : `bash: ${cmd}: command not found. Type 'help' to see available commands.`
    );
  };

  // Keyboard navigation for history (Up/Down)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIdx = historyIdx === -1 ? history.length - 1 : Math.max(0, historyIdx - 1);
      setHistoryIdx(nextIdx);
      setInputVal(history[nextIdx] || '');
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (historyIdx === -1) return;
      const nextIdx = historyIdx + 1;
      if (nextIdx >= history.length) {
        setHistoryIdx(-1);
        setInputVal('');
      } else {
        setHistoryIdx(nextIdx);
        setInputVal(history[nextIdx] || '');
      }
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 p-3 sm:p-6 backdrop-blur-md animate-in fade-in duration-150"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="flex flex-col w-full max-w-4xl h-[560px] overflow-hidden rounded-2xl border border-slate-800 bg-[#08090E] shadow-2xl ring-1 ring-cyan-500/20">
        {/* Terminal Header */}
        <div className="flex items-center justify-between border-b border-slate-800 bg-[#0c101a] px-4 py-2.5 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex gap-1.5">
              <button
                onClick={onClose}
                aria-label="Kapat"
                className="h-3 w-3 rounded-full bg-red-500/80 hover:bg-red-400 transition-colors inline-block"
              />
              <span className="h-3 w-3 rounded-full bg-amber-500/80 inline-block" />
              <span className="h-3 w-3 rounded-full bg-emerald-500/80 inline-block" />
            </div>
            <div className="flex items-center gap-2 text-xs font-mono text-slate-300">
              <Terminal className="h-3.5 w-3.5 text-cyan-400" />
              <span className="font-semibold text-white">root@xivizley-vds</span>
              <span className="text-slate-500">:</span>
              <span className="text-cyan-400">~/selfhost</span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setLines([]);
                initializeBanner();
              }}
              title={isTr ? 'Ekranı Temizle' : isPt ? 'Limpar Tela' : 'Reset & Clear'}
              className="flex items-center gap-1 rounded-lg border border-slate-800 bg-slate-900/60 px-2.5 py-1 text-[11px] font-mono text-slate-400 hover:text-white hover:border-slate-700 transition-all"
            >
              <RotateCcw className="h-3 w-3" />
              <span className="hidden sm:inline">{isTr ? 'Sıfırla' : isPt ? 'Redefinir' : 'Reset'}</span>
            </button>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:bg-slate-800 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Quick Suggestion Chips */}
        <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-800/80 bg-[#0a0d14] overflow-x-auto text-[11px] font-mono shrink-0">
          <span className="text-slate-500 text-[10px] uppercase font-bold shrink-0">
            {isTr ? 'Hızlı Komutlar:' : isPt ? 'Comandos:' : 'Quick:'}
          </span>
          <button
            onClick={() => {
              setInputVal('durum');
              inputRef.current?.focus();
            }}
            className="rounded-md border border-cyan-500/30 bg-cyan-950/30 px-2 py-0.5 text-cyan-300 hover:bg-cyan-900/50 hover:border-cyan-400 transition-all shrink-0"
          >
            durum
          </button>
          <button
            onClick={() => {
              setInputVal('docker ps');
              inputRef.current?.focus();
            }}
            className="rounded-md border border-indigo-500/30 bg-indigo-950/30 px-2 py-0.5 text-indigo-300 hover:bg-indigo-900/50 hover:border-indigo-400 transition-all shrink-0"
          >
            docker ps
          </button>
          <button
            onClick={() => {
              setInputVal('docker compose up');
              inputRef.current?.focus();
            }}
            className="rounded-md border border-emerald-500/30 bg-emerald-950/30 px-2 py-0.5 text-emerald-300 hover:bg-emerald-900/50 hover:border-emerald-400 transition-all shrink-0"
          >
            docker compose up
          </button>
          <button
            onClick={() => {
              setInputVal('durum kur plex');
              inputRef.current?.focus();
            }}
            className="rounded-md border border-purple-500/30 bg-purple-950/30 px-2 py-0.5 text-purple-300 hover:bg-purple-900/50 hover:border-purple-400 transition-all shrink-0"
          >
            durum kur plex
          </button>
          <button
            onClick={() => {
              setInputVal('help');
              inputRef.current?.focus();
            }}
            className="rounded-md border border-slate-700 bg-slate-800/60 px-2 py-0.5 text-slate-300 hover:text-white hover:border-slate-600 transition-all shrink-0"
          >
            help
          </button>
        </div>

        {/* Terminal Output Log Area */}
        <div
          onClick={() => inputRef.current?.focus()}
          className="flex-1 overflow-y-auto p-4 font-mono text-xs leading-relaxed space-y-1 bg-[#08090E] select-text cursor-text"
        >
          {lines.map((l) => (
            <div
              key={l.id}
              className={cn(
                'break-words whitespace-pre-wrap',
                l.type === 'cmd' && 'text-amber-300 font-bold',
                l.type === 'header' && 'text-indigo-400 font-semibold',
                l.type === 'success' && 'text-emerald-400',
                l.type === 'info' && 'text-cyan-300',
                l.type === 'error' && 'text-rose-400 font-semibold',
                l.type === 'output' && 'text-slate-300'
              )}
            >
              {l.text}
            </div>
          ))}
          {isRunning && (
            <div className="flex items-center gap-2 text-cyan-400 text-xs py-1 animate-pulse">
              <span className="h-2 w-2 rounded-full bg-cyan-400" />
              <span>{isTr ? 'Komut yürütülüyor...' : isPt ? 'Executando comando...' : 'Executing command...'}</span>
            </div>
          )}
          <div ref={terminalEndRef} />
        </div>

        {/* Terminal Input Form */}
        <form
          onSubmit={handleSubmit}
          className="flex items-center gap-2 border-t border-slate-800 bg-[#0a0d14] px-4 py-2.5 shrink-0"
        >
          <span className="font-mono text-xs font-bold text-emerald-400 select-none">
            root@xivizley-vds:~$
          </span>
          <input
            ref={inputRef}
            type="text"
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isRunning}
            placeholder={
              isTr
                ? "Komut yazın (ör: 'durum', 'docker ps', 'help')..."
                : isPt
                ? "Digite um comando (ex: 'durum', 'docker ps', 'help')..."
                : "Type command (e.g. 'durum', 'docker ps', 'help')..."
            }
            className="flex-1 bg-transparent font-mono text-xs text-white placeholder-slate-600 focus:outline-none disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={isRunning || !inputVal.trim()}
            className="flex items-center gap-1 rounded-lg bg-cyan-500/20 border border-cyan-500/40 px-2.5 py-1 text-xs font-mono text-cyan-300 hover:bg-cyan-500/30 hover:border-cyan-400 disabled:opacity-30 disabled:pointer-events-none transition-all"
          >
            <span>Enter</span>
            <CornerDownLeft className="h-3 w-3" />
          </button>
        </form>
      </div>
    </div>
  );
}
