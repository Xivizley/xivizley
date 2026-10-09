'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Cloud,
  KeyRound,
  Activity,
  ShieldCheck,
  Gamepad2,
  FileText,
  Terminal,
  Copy,
  Check,
  ExternalLink,
  GitBranch,
  Lock,
  Server,
  Globe,
  Sparkles,
  ArrowRight,
  CheckCircle2,
} from 'lucide-react';
import { Navbar } from '@/components/shared/Navbar';
import { useI18nStore } from '@/lib/i18n/store';
import { PLATFORM_STATS } from '@/lib/constants/stats';

export default function SuiteOpenBetaPage() {
  const { lang } = useI18nStore();
  const isTr = lang === 'tr';
  const [copiedCmd, setCopiedCmd] = useState(false);
  const [copiedInspect, setCopiedInspect] = useState(false);
  const [copiedGit, setCopiedGit] = useState(false);

  const suiteLabel = PLATFORM_STATS.suiteLabel;
  const suiteStage = PLATFORM_STATS.suiteStage;

  const installCmd = PLATFORM_STATS.suiteInstallCmd;
  const inspectCmd = 'curl -fsSL https://xivizley.com.tr/suite/install -o install.sh && less install.sh && sudo bash install.sh';
  const gitCloneCmd = 'git clone https://github.com/Xivizley/xivizley-suite.git && cd xivizley-suite && ./install.sh';

  const copyCommand = (text: string, setter: (v: boolean) => void) => {
    navigator.clipboard.writeText(text);
    setter(true);
    setTimeout(() => setter(false), 2200);
  };

  const modules = [
    {
      id: 'drive',
      title: 'XIVIZLEY Files (Drive)',
      badge: `${PLATFORM_STATS.suiteVersion} Beta`,
      icon: Cloud,
      color: 'text-sky-400',
      border: 'border-sky-500/25',
      bg: 'bg-sky-950/20',
      desc: isTr
        ? 'Nextcloud tarzı kendi sunucunuzda barınan bulut depolama. Klasör yönetimi, çöp kutusu, favoriler ve tek tıkla şifresiz/genel paylaşım linkleri (/s/token).'
        : 'Nextcloud-inspired self-hosted cloud storage on your own disk. Folder hierarchy, trash bin, favorites, and instant public share links (/s/token).',
    },
    {
      id: 'pass',
      title: 'XIVIZLEY Pass (Vault & 2FA)',
      badge: 'AES-256-GCM',
      icon: KeyRound,
      color: 'text-emerald-400',
      border: 'border-emerald-500/25',
      bg: 'bg-emerald-950/20',
      desc: isTr
        ? 'Sunucunuzdaki kendi VAULT_MASTER_KEY anahtarınızla şifrelenen parola kasası ve canlı 6 haneli TOTP (2FA) doğrulayıcı.'
        : 'Zero-knowledge password vault encrypted with your own server VAULT_MASTER_KEY plus built-in live 6-digit TOTP (2FA) authenticator.',
    },
    {
      id: 'game',
      title: 'Game Server Cockpit',
      badge: 'Minecraft 1.0 - 26.3 & FiveM',
      icon: Gamepad2,
      color: 'text-amber-400',
      border: 'border-amber-500/25',
      bg: 'bg-amber-950/20',
      desc: isTr
        ? 'Minecraft (Vanilla, PaperMC, Purpur, Fabric, Forge, NeoForge 1.0–26.3), FiveM, CS2, Rust ve Palworld için canlı konsol, dosya yöneticisi ve tek tıkla sıfırlama.'
        : 'Docker-native game server panel supporting Minecraft (1.0 to 26.3 across Paper, Purpur, Fabric, Forge, NeoForge), FiveM, CS2, live console & 1-click reset.',
    },
    {
      id: 'pulse',
      title: 'XIVIZLEY Pulse (Uptime)',
      badge: 'Gerçek Zamanlı',
      icon: Activity,
      color: 'text-cyan-400',
      border: 'border-cyan-500/25',
      bg: 'bg-cyan-950/20',
      desc: isTr
        ? 'HTTP, TCP ve Ping servis izleyicisi. Milisaniye bazlı gecikme grafikleri, 30-kalp atışı geçmişi ve kesinti anında Telegram uyarısı.'
        : 'HTTP, TCP, and ICMP Ping monitor with millisecond latency charts, 30-heartbeat history bars, and instant Telegram outage alerts.',
    },
    {
      id: 'shield',
      title: 'XIVIZLEY Shield (WAF & IPS)',
      badge: 'Otonom Koruma',
      icon: ShieldCheck,
      color: 'text-rose-400',
      border: 'border-rose-500/25',
      bg: 'bg-rose-950/20',
      desc: isTr
        ? 'SQLi, Path Traversal ve SSH Brute-Force saldırılarına karşı sezgisel WAF motoru, ülke bazlı saldırı analizi ve IP karantina yönetimi.'
        : 'Heuristic WAF & Intrusion Prevention system protecting against SQLi, Path Traversal, and scanners with IP quarantine management.',
    },
    {
      id: 'notes',
      title: 'Notes & Photos',
      badge: 'Markdown & Galeri',
      icon: FileText,
      color: 'text-purple-400',
      border: 'border-purple-500/25',
      bg: 'bg-purple-950/20',
      desc: isTr
        ? 'Kendi sunucunuzdan dışarı çıkmayan kişisel Markdown not defteri ve medya/ekran görüntüsü galerisi.'
        : 'Private Markdown notebook and photo/screenshot gallery stored strictly on your own server volumes.',
    },
  ];

  return (
    <div className="min-h-screen bg-[#08090e] text-slate-100">
      <Navbar />

      <main className="mx-auto max-w-6xl px-4 sm:px-6 py-12 sm:py-16">
        {/* ─── Hero Header ─── */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 bg-amber-500/10 px-3.5 py-1 text-xs font-bold text-amber-300 mb-5 shadow-[0_0_20px_rgba(245,158,11,0.15)]">
            <Sparkles className="h-3.5 w-3.5 text-amber-400" />
            <span>{isTr ? `SÜRÜM ${PLATFORM_STATS.suiteVersion.toUpperCase()}` : `VERSION ${PLATFORM_STATS.suiteVersion.toUpperCase()}`} • {suiteStage.toUpperCase()}</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 leading-tight">
            {isTr ? (
              <>
                Kendi Sunucunuzda, Kendi Domaininizde{' '}
                <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
                  XIVIZLEY Suite {suiteLabel}
                </span>
              </>
            ) : (
              <>
                Self-Host{' '}
                <span className="bg-gradient-to-r from-cyan-400 via-sky-400 to-indigo-400 bg-clip-text text-transparent">
                  XIVIZLEY Suite {suiteLabel}
                </span>{' '}
                on Your Own Server & Domain
              </>
            )}
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed">
            {isTr
              ? 'Nextcloud tasarım diliyle birleştirilmiş 6 temel homelab uygulaması tek bir Docker konteyner çatısında. Verileriniz, şifreleriniz ve oyun sunucularınız %100 kendi VDS/VPS sunucunuzda ve kendi alan adınızda (domain) çalışır.'
              : '6 unified homelab applications built with the Nextcloud Hub design language in a single Docker stack. Your files, passwords, and game servers run 100% on your own server, your own domain, and your own data.'}
          </p>

          <div className="mt-5 inline-flex items-start gap-2 rounded-xl border border-amber-400/30 bg-amber-500/10 px-3.5 py-2 text-xs text-amber-200 text-left">
            <ShieldCheck className="h-4 w-4 text-amber-400 shrink-0 mt-0.5" aria-hidden="true" />
            <span>
              {isTr
                ? 'Erken erişim (beta) sürümü. Üretim ortamında kullanmadan önce lütfen yedek alın; geri bildiriminiz sürümü şekillendirir.'
                : 'Early-access (beta) release. Back up before production use; your feedback shapes the release.'}
            </span>
          </div>
        </div>

        {/* ─── 1-Command Self-Hosted Installer Card ─── */}
        <div className="rounded-2xl border border-cyan-500/30 bg-[#0c111d]/90 p-6 sm:p-8 shadow-[0_0_40px_rgba(6,182,212,0.1)] mb-14">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5">
            <div>
              <span className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-cyan-400">
                <Terminal className="h-4 w-4" />
                {isTr ? '1. Tek Komutla Kendi Sunucunuza Kurun (Ubuntu / Debian)' : '1. One-Command Self-Hosted Install (Ubuntu / Debian)'}
              </span>
              <p className="text-xs text-slate-400 mt-1">
                {isTr
                  ? 'Kurulum sihirbazı kendi domaininizi sorar, Caddy ile otomatik Let’s Encrypt SSL sertifikası alır ve RS256/AES-256 anahtarlarınızı sunucunuzda üretir.'
                  : 'The setup wizard asks for your custom domain, provisions automatic Let’s Encrypt SSL via Caddy, and generates your RS256/AES-256 keys locally.'}
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <a
                href="https://suite.xivizley.com.tr/game"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-500/40 bg-emerald-950/40 px-3.5 py-2 text-xs font-bold text-emerald-300 hover:bg-emerald-900/50 transition-all"
              >
                <Gamepad2 className="h-3.5 w-3.5" />
                <span>{isTr ? `Canlı Demo (${suiteLabel})` : `Live Demo (${suiteLabel})`}</span>
                <ExternalLink className="h-3 w-3" />
              </a>
              <a
                href="https://github.com/Xivizley/xivizley-suite"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 rounded-xl border border-white/15 bg-white/5 px-3.5 py-2 text-xs font-semibold text-white hover:bg-white/10 transition-all"
              >
                <GitBranch className="h-3.5 w-3.5 text-cyan-400" />
                <span>{`GitHub (${PLATFORM_STATS.suiteVersion})`}</span>
              </a>
            </div>
          </div>

          {/* Primary Curl Command */}
          <div className="relative flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#06080f] px-4 py-3.5 font-mono text-xs sm:text-sm text-cyan-300 mb-3">
            <div className="overflow-x-auto whitespace-nowrap">
              <span className="text-slate-500 select-none">$ </span>
              {installCmd}
            </div>
            <button
              onClick={() => copyCommand(installCmd, setCopiedCmd)}
              className="inline-flex items-center gap-1.5 rounded-lg bg-cyan-500/20 border border-cyan-500/40 px-3 py-1.5 text-xs font-bold text-cyan-200 hover:bg-cyan-500/30 transition-all shrink-0 cursor-pointer"
            >
              {copiedCmd ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
              <span>{copiedCmd ? (isTr ? 'Kopyalandı!' : 'Copied!') : (isTr ? 'Kopyala' : 'Copy')}</span>
            </button>
          </div>

          {/* Inspect First Command Option */}
          <div className="relative flex items-center justify-between gap-3 rounded-xl border border-emerald-500/20 bg-[#06080f]/80 px-4 py-2.5 font-mono text-xs text-slate-300 mb-3">
            <div className="overflow-x-auto whitespace-nowrap">
              <span className="text-emerald-400 select-none"># {isTr ? 'Önce İncele & Doğrula:' : 'Inspect Before Running:'} </span>
              <span className="text-emerald-200">{inspectCmd}</span>
            </div>
            <button
              onClick={() => copyCommand(inspectCmd, setCopiedInspect)}
              className="inline-flex items-center gap-1 rounded-md bg-emerald-500/10 border border-emerald-500/30 px-2.5 py-1 text-[11px] font-medium text-emerald-300 hover:bg-emerald-500/20 transition-all shrink-0 cursor-pointer"
            >
              {copiedInspect ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              <span>{copiedInspect ? (isTr ? 'Kopyalandı' : 'Copied') : (isTr ? 'İncele' : 'Inspect')}</span>
            </button>
          </div>

          {/* Alternative Manual Git Clone */}
          <div className="relative flex items-center justify-between gap-3 rounded-xl border border-white/5 bg-[#06080f]/60 px-4 py-2.5 font-mono text-xs text-slate-300">
            <div className="overflow-x-auto whitespace-nowrap">
              <span className="text-slate-500 select-none"># Manuel Git Kurulumu: </span>
              {gitCloneCmd}
            </div>
            <button
              onClick={() => copyCommand(gitCloneCmd, setCopiedGit)}
              className="inline-flex items-center gap-1 rounded-md bg-white/5 border border-white/10 px-2.5 py-1 text-[11px] font-medium text-slate-300 hover:bg-white/10 transition-all shrink-0 cursor-pointer"
            >
              {copiedGit ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              <span>{copiedGit ? (isTr ? 'Kopyalandı' : 'Copied') : 'Git'}</span>
            </button>
          </div>

          {/* Self-Hosted Guarantees */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-5 border-t border-white/10 text-xs text-slate-300">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-cyan-400 shrink-0" />
              <span>{isTr ? 'Kendi Domaininiz + Otomatik Let’s Encrypt SSL' : 'Your Own Custom Domain + Auto SSL'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Lock className="h-4 w-4 text-emerald-400 shrink-0" />
              <span>{isTr ? 'Sunucunuza Özel RS256 JWT & AES-256 Kasa Anahtarı' : 'Locally Generated RS256 JWT & AES-256 Keys'}</span>
            </div>
            <div className="flex items-center gap-2">
              <Server className="h-4 w-4 text-amber-400 shrink-0" />
              <span>{isTr ? '%100 Kendi Diskiniz ve PostgreSQL 16 Veritabanınız' : '100% Your Own Disk Volumes & PostgreSQL 16'}</span>
            </div>
          </div>
        </div>

        {/* ─── 6 Integrated Modules Grid ─── */}
        <div className="mb-14">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              {isTr ? `${suiteLabel} İçindeki Tümleşik Uygulamalar` : `Integrated Apps in ${suiteLabel}`}
            </h2>
            <span className="text-xs font-mono text-slate-400">Nextcloud Hub UI • Tek Konteyner</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {modules.map((mod) => {
              const Icon = mod.icon;
              return (
                <div
                  key={mod.id}
                  className={`rounded-2xl border ${mod.border} ${mod.bg} p-5 flex flex-col justify-between transition-all hover:border-white/25`}
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <div className="p-2.5 rounded-xl bg-black/30 border border-white/10">
                        <Icon className={`h-5 w-5 ${mod.color}`} />
                      </div>
                      <span className="rounded-full bg-black/40 border border-white/10 px-2.5 py-0.5 text-[10px] font-mono text-slate-300">
                        {mod.badge}
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-white mb-2">{mod.title}</h3>
                    <p className="text-xs text-slate-300 leading-relaxed">{mod.desc}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ─── Release Notes Box (Public Beta) ─── */}
        <div className="rounded-2xl border border-white/10 bg-[#0C1017] p-6 sm:p-8">
          <div className="flex items-center gap-2 text-amber-300 text-xs font-bold uppercase tracking-wider mb-3">
            <CheckCircle2 className="h-4 w-4" />
            <span>{isTr ? `${suiteLabel} Sürüm Notları` : `${suiteLabel} Release Notes`}</span>
          </div>
          <ul className="space-y-2 text-xs sm:text-sm text-slate-300">
            <li>• <strong>Canlı Ağ ve Konteyner Topolojisi:</strong> WAN, Caddy WAF ve Docker köprü ağındaki tüm canlı servislerin durum ve gecikme haritası.</li>
            <li>• <strong>Domain-Bağımsız Mimari & SSL Radarı:</strong> Çerezler, dosya paylaşım linkleri (<code>/s/:token</code>) ve oyun sunucusu IP adresleri kurulum yaptığınız domaini/IP&apos;yi otomatik algılar; Let&apos;s Encrypt süre takibi sağlar.</li>
            <li>• <strong>Minecraft 1.0 – 26.3 & FiveM Desteği:</strong> Canlı konsol, eklenti yöneticisi, tek tıkla yedekleme ve sıfırlama (Reset).</li>
            <li>• <strong>Telegram & Discord Akıllı Sentinel:</strong> Sunucu CPU, RAM, disk ve konteyner arızalarında anlık akıllı uyarı ve anti-spam filtresi.</li>
            <li>• <strong>Rol Bazlı Güvenlik & Demo Kilidi:</strong> Canlı demo modunda salt-okunur koruma; yönetici oturumunda tam yetkili bağımsız self-host deneyimi.</li>
          </ul>
        </div>
      </main>
    </div>
  );
}
