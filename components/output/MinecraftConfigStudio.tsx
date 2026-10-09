'use client';

import React, { useState, useMemo } from 'react';
import { useArchitectStore } from '@/store/useArchitectStore';
import { MINECRAFT_PLUGINS } from '@/lib/data/modules';
import { Gamepad2, Download, Copy, Check, Sparkles, Shield, Users, Sword, Lock } from 'lucide-react';
import { cn } from '@/lib/utils';

// Minecraft Color Code to HTML Color Mapper
const MC_COLORS: Record<string, string> = {
  '0': '#000000', // Black
  '1': '#0000AA', // Dark Blue
  '2': '#00AA00', // Dark Green
  '3': '#00AAAA', // Dark Aqua
  '4': '#AA0000', // Dark Red
  '5': '#AA00AA', // Dark Purple
  '6': '#FFAA00', // Gold
  '7': '#AAAAAA', // Gray
  '8': '#555555', // Dark Gray
  '9': '#5555FF', // Blue
  'a': '#55FF55', // Green
  'b': '#55FFFF', // Aqua
  'c': '#FF5555', // Red
  'd': '#FF55FF', // Light Purple
  'e': '#FFFF55', // Yellow
  'f': '#FFFFFF', // White
};

function renderMinecraftMotd(motd: string) {
  const parts = motd.split(/(§[0-9a-fk-or])/g);
  let currentColor = '#FFFFFF';
  let isBold = false;

  return (
    <div className="font-mono text-xs leading-relaxed bg-[#111622] p-3 rounded-xl border border-slate-800 shadow-inner">
      <div className="text-[10px] text-slate-500 uppercase tracking-wider mb-1 font-sans flex items-center gap-1">
        <Sparkles className="h-3 w-3 text-cyan-400" /> Çok Oyunculu Liste Önizlemesi (MOTD):
      </div>
      <div className="flex items-center gap-2">
        <div className="w-8 h-8 rounded bg-emerald-600 flex items-center justify-center text-sm font-bold shadow">
          ⛏️
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex justify-between items-center text-[10px] text-slate-400 pb-0.5">
            <span className="font-bold text-slate-200">XIVIZLEY PaperMC Sunucusu</span>
            <span className="text-emerald-400 font-mono">● 5ms</span>
          </div>
          <div className="break-words">
            {parts.map((part, idx) => {
              if (part.startsWith('§')) {
                const code = (part[1] || '').toLowerCase();
                if (MC_COLORS[code]) {
                  currentColor = MC_COLORS[code];
                } else if (code === 'l') {
                  isBold = true;
                } else if (code === 'r') {
                  currentColor = '#FFFFFF';
                  isBold = false;
                }
                return null;
              }
              return (
                <span
                  key={idx}
                  style={{ color: currentColor, fontWeight: isBold ? 'bold' : 'normal' }}
                >
                  {part}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

export function MinecraftConfigStudio() {
  const nodes = useArchitectStore((s) => s.nodes);
  const mcNode = nodes.find((n) => n.data.moduleId === 'minecraft-paperm');
  const updateEnvOverride = useArchitectStore((s) => s.updateEnvOverride);

  // Local config states
  const [serverType, setServerType] = useState('PURPUR');
  const [version, setVersion] = useState('1.21.11');
  const [motd, setMotd] = useState('§6§lXIVIZLEY §eHomelab Sunucusu §7- §a1.21.11 Purpur §fAktif!');
  const [memory, setMemory] = useState('3G');
  const [maxPlayers, setMaxPlayers] = useState(20);
  const [difficulty, setDifficulty] = useState('hard');
  const [gamemode, setGamemode] = useState('survival');
  const [pvp, setPvp] = useState(false);
  const [onlineMode, setOnlineMode] = useState(false); // Default cracked for TR
  const [viewDistance, setViewDistance] = useState(6);
  const [selectedPlugins, setSelectedPlugins] = useState<string[]>([
    'veinminer',
    'smoothtimber',
    'actionhealth',
    'gsit',
    'voicechat',
    'geysermc',
    'essentialsx',
    'authme',
    'viaversion',
    'skinsrestorer',
  ]);
  const [copied, setCopied] = useState(false);

  // Generate server.properties content
  const serverProperties = useMemo(() => {
    return `# ========================================================
# 🎮 XIVIZLEY Minecraft ${serverType} ${version} Sunucu Konfigürasyonu
# 🌐 https://xivizley.com.tr
# ========================================================
server-port=25565
motd=${motd}
max-players=${maxPlayers}
difficulty=${difficulty}
gamemode=${gamemode}
pvp=${pvp}
online-mode=${onlineMode}
enable-command-block=true
view-distance=${viewDistance}
simulation-distance=4
spawn-protection=0
allow-flight=true
network-compression-threshold=256
`;
  }, [serverType, version, motd, maxPlayers, difficulty, gamemode, pvp, onlineMode, viewDistance]);

  const togglePlugin = (pluginId: string) => {
    setSelectedPlugins((prev) =>
      prev.includes(pluginId) ? prev.filter((p) => p !== pluginId) : [...prev, pluginId]
    );
  };

  const handleApplyToStack = () => {
    if (!mcNode) return;
    updateEnvOverride(mcNode.id, 'TYPE', serverType);
    updateEnvOverride(mcNode.id, 'VERSION', version);
    updateEnvOverride(mcNode.id, 'MEMORY', memory);
    updateEnvOverride(mcNode.id, 'USE_AIKAR_FLAGS', 'true');
    updateEnvOverride(mcNode.id, 'ONLINE_MODE', String(onlineMode).toUpperCase());
    updateEnvOverride(mcNode.id, 'MOTD', motd);
    updateEnvOverride(mcNode.id, 'PVP', String(pvp).toUpperCase());
    updateEnvOverride(mcNode.id, 'DIFFICULTY', difficulty);
    updateEnvOverride(mcNode.id, 'VIEW_DISTANCE', String(viewDistance));
    updateEnvOverride(mcNode.id, 'ALLOW_FLIGHT', 'TRUE');
  };

  const handleDownloadProps = () => {
    const blob = new Blob([serverProperties], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'server.properties';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(serverProperties);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-4 p-4 text-slate-200">
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Gamepad2 className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-slate-100">Minecraft Stüdyosu</h3>
            <p className="text-[10px] text-slate-400">Çekirdek motor, sürüm ve canlı ayar yöneticisi</p>
          </div>
        </div>
        <button
          onClick={handleApplyToStack}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-xs font-bold text-white shadow-sm transition-all active:scale-95"
        >
          <Sparkles className="h-3 w-3" />
          <span>Tuvale Uygula</span>
        </button>
      </div>

      {/* Engine & Version Selector */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 rounded-xl border border-slate-800 bg-[#08090E]">
        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-semibold text-slate-300">
              Sunucu Çekirdeği (Engine)
            </label>
            <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-1.5 py-0.5 rounded">
              ⭐ Purpur Önerilen
            </span>
          </div>
          <select
            value={serverType}
            onChange={(e) => setServerType(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-100 font-semibold focus:outline-none focus:ring-1 focus:ring-emerald-500"
          >
            <option value="PURPUR">Purpur (⭐ En Yüksek FPS & TPS)</option>
            <option value="PAPER">PaperMC (Standart & Kararlı)</option>
            <option value="SPIGOT">Spigot (Klasik Bukkit)</option>
            <option value="FABRIC">Fabric (Modlu / Sodium)</option>
            <option value="VANILLA">Vanilla (Saf Mojang)</option>
          </select>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1">
            <label className="text-[11px] font-semibold text-slate-300">
              Minecraft Sürümü
            </label>
            <span className="text-[9px] font-mono text-cyan-400 bg-cyan-950/60 border border-cyan-500/30 px-1.5 py-0.5 rounded">
              Mızraklar & Gürz 🗡️
            </span>
          </div>
          <select
            value={version}
            onChange={(e) => setVersion(e.target.value)}
            className="w-full rounded-lg border border-slate-700 bg-slate-900 px-2.5 py-1.5 text-xs text-slate-100 font-semibold focus:outline-none focus:ring-1 focus:ring-cyan-500"
          >
            <option value="1.21.11">1.21.11 (⭐ En Yeni - Mızraklar & Gürz)</option>
            <option value="1.21.4">1.21.4 (Güncel Java Sürümü)</option>
            <option value="1.21.1">1.21.1 (Geniş Eklenti Uyumluluğu)</option>
            <option value="1.20.4">1.20.4 (Kararlı 1.20)</option>
            <option value="1.19.4">1.19.4 (The Wild Update)</option>
            <option value="1.16.5">1.16.5 (Nether & PvP Klasiği)</option>
            <option value="1.12.2">1.12.2 (Büyük Mod Paketleri)</option>
            <option value="1.8.9">1.8.9 (Klasik Eski PvP)</option>
          </select>
        </div>
      </div>

      {/* Live MOTD Preview */}
      {renderMinecraftMotd(motd)}

      {/* MOTD Input & Quick Colors */}
      <div className="space-y-1.5">
        <label className="block text-[11px] font-semibold text-slate-300">
          Sunucu Başlığı (MOTD)
        </label>
        <input
          type="text"
          value={motd}
          onChange={(e) => setMotd(e.target.value)}
          placeholder="§6§lXIVIZLEY §aSunucusu"
          className="w-full rounded-xl border border-slate-700 bg-[#08090E] px-3 py-1.5 text-xs font-mono text-slate-100 focus:outline-none focus:ring-1 focus:ring-indigo-500"
        />
        <div className="flex flex-wrap gap-1 pt-1">
          {Object.entries(MC_COLORS).map(([code, hex]) => (
            <button
              key={code}
              type="button"
              onClick={() => setMotd((prev) => prev + `§${code}`)}
              className="h-4 w-4 rounded border border-white/20 text-[9px] font-mono flex items-center justify-center"
              style={{ backgroundColor: hex }}
              title={`§${code}`}
            >
              {code}
            </button>
          ))}
          <button
            type="button"
            onClick={() => setMotd((prev) => prev + '§l')}
            className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-[9px] font-bold text-slate-200"
          >
            Kalın (§l)
          </button>
        </div>
      </div>

      {/* Grid Controls */}
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div>
          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
            Ayrılan RAM
          </label>
          <select
            value={memory}
            onChange={(e) => setMemory(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-[#08090E] px-2.5 py-1.5 text-xs text-slate-100"
          >
            <option value="2G">2 GB RAM (Küçük Ekip)</option>
            <option value="3G">3 GB RAM (⭐ 20.0 TPS Optimize)</option>
            <option value="4G">4 GB RAM (Standart)</option>
            <option value="6G">6 GB RAM (Büyük Sunucu)</option>
            <option value="8G">8 GB RAM (Çoklu Dünya)</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
            Maksimum Oyuncu
          </label>
          <input
            type="number"
            value={maxPlayers}
            onChange={(e) => setMaxPlayers(parseInt(e.target.value, 10) || 1)}
            className="w-full rounded-xl border border-slate-700 bg-[#08090E] px-2.5 py-1.5 text-xs text-slate-100 font-mono"
          />
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
            Zorluk Seviyesi
          </label>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-[#08090E] px-2.5 py-1.5 text-xs text-slate-100"
          >
            <option value="peaceful">Barışçıl (Peaceful)</option>
            <option value="easy">Kolay (Easy)</option>
            <option value="normal">Normal</option>
            <option value="hard">Zor (Hard 💀)</option>
          </select>
        </div>

        <div>
          <label className="block text-[11px] font-semibold text-slate-300 mb-1">
            Oyun Modu
          </label>
          <select
            value={gamemode}
            onChange={(e) => setGamemode(e.target.value)}
            className="w-full rounded-xl border border-slate-700 bg-[#08090E] px-2.5 py-1.5 text-xs text-slate-100"
          >
            <option value="survival">Hayatta Kalma (Survival)</option>
            <option value="creative">Yaratıcı (Creative)</option>
            <option value="adventure">Macera (Adventure)</option>
            <option value="spectator">İzleyici (Spectator)</option>
          </select>
        </div>
      </div>

      {/* Switches: Online Mode & PVP */}
      <div className="grid grid-cols-2 gap-2 pt-1">
        <button
          type="button"
          onClick={() => setOnlineMode(!onlineMode)}
          className={cn(
            'flex items-center justify-between p-2 rounded-xl border text-xs font-semibold transition-all',
            onlineMode
              ? 'border-emerald-500/50 bg-emerald-950/30 text-emerald-300'
              : 'border-amber-500/50 bg-amber-950/30 text-amber-300'
          )}
        >
          <span>Giriş Türü:</span>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-black/40">
            {onlineMode ? 'Premium' : 'Cracked (Serbest)'}
          </span>
        </button>

        <button
          type="button"
          onClick={() => setPvp(!pvp)}
          className={cn(
            'flex items-center justify-between p-2 rounded-xl border text-xs font-semibold transition-all',
            pvp
              ? 'border-red-500/50 bg-red-950/30 text-red-300'
              : 'border-slate-700 bg-slate-800 text-slate-400'
          )}
        >
          <span>PVP (Savaş):</span>
          <span className="text-[10px] uppercase font-mono px-1.5 py-0.5 rounded bg-black/40">
            {pvp ? 'Açık ⚔️' : 'Kapalı 🛡️'}
          </span>
        </button>
      </div>

      {/* Plugins Section */}
      <div className="space-y-2 pt-2 border-t border-slate-800">
        <label className="block text-[11px] font-semibold text-slate-300">
          Otomatik İndirilecek Eklentiler (Plugins):
        </label>
        <div className="grid grid-cols-1 gap-1.5">
          {MINECRAFT_PLUGINS.map((plug) => {
            const isSelected = selectedPlugins.includes(plug.id);
            return (
              <button
                key={plug.id}
                type="button"
                onClick={() => togglePlugin(plug.id)}
                className={cn(
                  'flex items-center justify-between p-2 rounded-xl border text-left text-xs transition-all',
                  isSelected
                    ? 'border-cyan-500/40 bg-cyan-950/30 text-cyan-200'
                    : 'border-slate-800 bg-slate-900/60 text-slate-400 hover:border-slate-700'
                )}
              >
                <div>
                  <p className="font-bold text-slate-200">{plug.name}</p>
                  <p className="text-[10px] text-slate-400 line-clamp-1">{plug.description}</p>
                </div>
                <div
                  className={cn(
                    'h-4 w-4 rounded flex items-center justify-center text-[10px] border',
                    isSelected
                      ? 'bg-cyan-500 border-cyan-400 text-black'
                      : 'border-slate-700 bg-slate-800'
                  )}
                >
                  {isSelected && '✓'}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Actions */}
      <div className="flex gap-2 pt-2 border-t border-slate-800">
        <button
          onClick={handleCopy}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl border border-slate-700 bg-slate-800/80 hover:bg-slate-700 text-xs font-semibold text-slate-200 transition-all"
        >
          {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          <span>{copied ? 'Kopyalandı!' : 'Properties Kopyala'}</span>
        </button>
        <button
          onClick={handleDownloadProps}
          className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-xs font-bold text-white shadow-md transition-all"
        >
          <Download className="h-3.5 w-3.5" />
          <span>.properties İndir</span>
        </button>
      </div>
    </div>
  );
}
