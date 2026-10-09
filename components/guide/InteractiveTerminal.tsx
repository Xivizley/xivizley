// ============================================================
// XIVIZLEY — Interactive Live CLI Terminal Simulator
// components/guide/InteractiveTerminal.tsx
// ============================================================

'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Terminal as TerminalIcon, Play, RefreshCw, Copy, Check, Sparkles } from 'lucide-react';

interface HistoryItem {
  command: string;
  output: string[];
  type?: 'info' | 'success' | 'warning' | 'error';
}

export function InteractiveTerminal() {
  const [input, setInput] = useState('');
  const [history, setHistory] = useState<HistoryItem[]>([
    {
      command: 'xivizley durum',
      output: [
        '🔍 XIVIZLEY Aurora CLI v3.2.2 Engine — Sunucu Durumu',
        '------------------------------------------------',
        '✅ Docker Engine: v26.1.4 (Ubuntu 22.04 LTS)',
        '🌐 Nginx Proxy Manager [80:8080, 443:8443] — RUNNING (Up 3 days)',
        '🐘 PostgreSQL 16 DB     [5432:5432]         — RUNNING (Up 3 days)',
        '☁️ Nextcloud 28        [8080:8080]         — RUNNING (Up 3 days)',
        '📊 Uptime Kuma          [3001:3001]         — RUNNING (Up 3 days)',
        '------------------------------------------------',
        '💡 İpucu: Komut simülatöründe "xivizley kur nextcloud" veya "xivizley kur minecraft" deneyin.',
      ],
      type: 'success',
    },
  ]);

  const [copied, setCopied] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [history]);

  const handleCommand = (cmdStr: string) => {
    const raw = cmdStr.trim();
    if (!raw) return;

    const lower = raw.toLowerCase();
    let responseLines: string[] = [];
    let type: HistoryItem['type'] = 'info';

    if (lower === 'clear' || lower === 'temizle') {
      setHistory([]);
      setInput('');
      return;
    }

    if (lower === 'help' || lower === 'yardim' || lower === 'yardım') {
      responseLines = [
        '📌 XIVIZLEY CLI Simülatör Komutları:',
        '  - xivizley durum          : Çalışan sunucu ve konteyner durumunu gösterir.',
        '  - xivizley kur nextcloud  : Nextcloud + PostgreSQL + Redis stack paketini simüle eder.',
        '  - xivizley kur minecraft  : Minecraft PaperMC 1.21.4 sunucu kurulumunu başlatır.',
        '  - xivizley kur jellyfin   : Jellyfin 4K Medya Sunucusu kurulumunu simüle eder.',
        '  - clear                   : Terminal ekranını temizler.',
      ];
    } else if (lower.startsWith('xivizley kur nextcloud')) {
      type = 'success';
      responseLines = [
        '🚀 XIVIZLEY Smart Deployer: Nextcloud Stack',
        '------------------------------------------',
        '[1/4] 📦 Docker Compose YAML şablonu indiriliyor...',
        '[2/4] 🛡️ Port çakışması kontrol ediliyor (Port 80 -> 8080 otomatik atandı)...',
        '[3/4] 🐘 PostgreSQL 16 ve Redis önbellek konteynerleri başlatılıyor...',
        '[4/4] 🔐 Let\'s Encrypt SSL sertifikaları oluşturuluyor...',
        '------------------------------------------',
        '✨ Başarılı! Nextcloud 28 sunucunuz hazır: http://sunucu_ip:8080',
      ];
    } else if (lower.startsWith('xivizley kur minecraft')) {
      type = 'success';
      responseLines = [
        '⛏️ XIVIZLEY Minecraft PaperMC 1.21.4 Deployer',
        '------------------------------------------',
        '[1/4] ☕ Eclipse Temurin Java 21 Runtime hazırlanıyor...',
        '[2/4] 📄 PaperMC 1.21.4 Build #128 indiriliyor...',
        '[3/4] 🔌 ViaVersion, AuthMe, EssentialsX eklentileri yükleniyor...',
        '[4/4] 🌐 Port 25565 (TCP/UDP) güvenlik duvarında açılıyor...',
        '------------------------------------------',
        '🎮 Minecraft Sunucunuz 20 TPS ile Hazır! IP: sunucu_ip:25565',
      ];
    } else if (lower.startsWith('xivizley kur jellyfin')) {
      type = 'success';
      responseLines = [
        '🎬 XIVIZLEY Jellyfin 4K Media Stack',
        '------------------------------------------',
        '[1/3] 🍿 Jellyfin Medya Sunucusu imajı çekiliyor...',
        '[2/3] ⚙️ NVENC / VAAPI Donanım İvmesi (/dev/dri) haritalanıyor...',
        '[3/3] 📁 /mnt/media depolama dizini bağlanıyor...',
        '------------------------------------------',
        '🎉 Jellyfin 4K Sinemanız Hazır: http://sunucu_ip:8096',
      ];
    } else if (lower.startsWith('xivizley durum') || lower === 'durum') {
      type = 'success';
      responseLines = [
        '🔍 XIVIZLEY Aurora CLI v3.2.2 Engine — Sunucu Durumu',
        '------------------------------------------------',
        '✅ Docker Engine: v26.1.4 (Ubuntu 22.04 LTS)',
        '🌐 Nginx Proxy Manager [80:8080, 443:8443] — RUNNING (Up 3 days)',
        '🐘 PostgreSQL 16 DB     [5432:5432]         — RUNNING (Up 3 days)',
        '☁️ Nextcloud 28        [8080:8080]         — RUNNING (Up 3 days)',
        '📊 Uptime Kuma          [3001:3001]         — RUNNING (Up 3 days)',
      ];
    } else if (lower.includes('trusted') || lower.includes('domain') || lower.includes('güven') || lower.includes('guven')) {
      type = 'success';
      responseLines = [
        '🔐 Nextcloud Trusted Domain (Güvenilmeyen Etki Alanı) Çözümü:',
        '------------------------------------------------------------',
        '⚡ Sunucu terminalinizde çalıştıracağınız TEK komut:',
        'docker exec -u www-data nextcloud php occ config:system:set trusted_domains 1 --value="*"',
        '------------------------------------------------------------',
        '✨ Sayfayı yenileyin; Nextcloud artık tüm IP ve domainlerden erişime açık!',
      ];
    } else {
      type = 'warning';
      responseLines = [
        `⚠️ Tanınmayan komut: "${raw}"`,
        'Mevcut komutları görmek için "help" veya "xivizley durum" yazabilirsiniz.',
      ];
    }

    setHistory((prev) => [...prev, { command: raw, output: responseLines, type }]);
    setInput('');
  };

  const handleCopyInstallScript = () => {
    navigator.clipboard.writeText('curl -fsSL https://xivizley.com.tr/durum | bash');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="rounded-3xl border border-slate-800 bg-[#08090E] shadow-2xl overflow-hidden font-mono text-xs my-8">
      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between border-b border-slate-800 bg-[#0e111a] px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="h-3 w-3 rounded-full bg-red-500/80" />
            <div className="h-3 w-3 rounded-full bg-amber-500/80" />
            <div className="h-3 w-3 rounded-full bg-emerald-500/80" />
          </div>
          <span className="text-[11px] font-bold text-slate-400 ml-2 flex items-center gap-1.5">
            <TerminalIcon className="h-3.5 w-3.5 text-indigo-400" />
            root@vds-server:~ (XIVIZLEY CLI Live Simulator)
          </span>
        </div>

        <button
          onClick={handleCopyInstallScript}
          className="flex items-center gap-1.5 rounded-xl border border-indigo-500/30 bg-indigo-950/40 hover:bg-indigo-900/50 px-3 py-1 text-[11px] font-bold text-indigo-300 transition-all"
        >
          {copied ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
          <span>{copied ? 'Kopyalandı!' : '1-Tık Kurulum Komutunu Kopyala'}</span>
        </button>
      </div>

      {/* Terminal Body */}
      <div className="p-4 sm:p-6 space-y-4 max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-slate-800 bg-[#08090E]/95">
        {history.map((item, idx) => (
          <div key={idx} className="space-y-1">
            <div className="flex items-center gap-2 text-cyan-400">
              <span className="text-emerald-400">root@xivizley-vds:~#</span>
              <span className="font-semibold text-slate-100">{item.command}</span>
            </div>
            <div className="pl-4 space-y-0.5 text-slate-300 leading-relaxed">
              {item.output.map((line, lIdx) => (
                <div
                  key={lIdx}
                  className={
                    item.type === 'success'
                      ? 'text-slate-200'
                      : item.type === 'warning'
                      ? 'text-amber-400'
                      : 'text-slate-300'
                  }
                >
                  {line}
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Input Prompt */}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleCommand(input);
          }}
          className="flex items-center gap-2 pt-2"
        >
          <span className="text-emerald-400 shrink-0">root@xivizley-vds:~#</span>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="komut yazın (örn: xivizley kur minecraft)..."
            className="flex-1 bg-transparent text-slate-100 placeholder-slate-600 focus:outline-none font-mono text-xs"
          />
        </form>
        <div ref={bottomRef} />
      </div>

      {/* Quick command buttons */}
      <div className="border-t border-slate-800/80 bg-[#0e111a] p-3 flex flex-wrap items-center gap-2 text-[11px]">
        <span className="text-slate-500 font-sans font-medium">Hızlı Deneme:</span>
        <button
          onClick={() => handleCommand('xivizley kur nextcloud')}
          className="rounded-lg border border-slate-800 bg-[#131724] hover:bg-slate-800 px-2.5 py-1 text-slate-300 hover:text-cyan-300 transition-colors"
        >
          ☁️ xivizley kur nextcloud
        </button>
        <button
          onClick={() => handleCommand('xivizley kur minecraft')}
          className="rounded-lg border border-slate-800 bg-[#131724] hover:bg-slate-800 px-2.5 py-1 text-slate-300 hover:text-emerald-300 transition-colors"
        >
          ⛏️ xivizley kur minecraft
        </button>
        <button
          onClick={() => handleCommand('xivizley kur jellyfin')}
          className="rounded-lg border border-slate-800 bg-[#131724] hover:bg-slate-800 px-2.5 py-1 text-slate-300 hover:text-purple-300 transition-colors"
        >
          🎬 xivizley kur jellyfin
        </button>
        <button
          onClick={() => handleCommand('xivizley durum')}
          className="rounded-lg border border-slate-800 bg-[#131724] hover:bg-slate-800 px-2.5 py-1 text-slate-300 hover:text-amber-300 transition-colors"
        >
          🔍 xivizley durum
        </button>
      </div>
    </div>
  );
}
