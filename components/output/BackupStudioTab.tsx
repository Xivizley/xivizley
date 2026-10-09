'use client';

// ============================================================
// XIVIZLEY — Master Auto-Backup & Disaster Recovery Studio
// components/output/BackupStudioTab.tsx
// Design: Obsidian Violet DIN 40719 Industrial Specification
// ============================================================

import React, { useState, useMemo } from 'react';
import { useArchitectStore } from '@/store/useArchitectStore';
import { generateBackupSuite } from '@/lib/generators/backupGenerator';
import { useI18nStore } from '@/lib/i18n/store';
import {
  Archive,
  Copy,
  Check,
  Download,
  Clock,
  Shield,
  Lock,
  Bell,
  Database,
  FolderArchive,
  RefreshCw,
  Terminal,
} from 'lucide-react';
import { cn } from '@/lib/utils';

export function BackupStudioTab() {
  const lang = useI18nStore((s) => s.lang);
  const isTr = lang === 'tr';
  const isPt = lang === 'pt';

  const nodes = useArchitectStore((s) => s.nodes);

  // Backup Configuration State
  const [schedule, setSchedule] = useState<'daily' | 'twice_daily' | 'weekly' | 'custom'>('daily');
  const [customCron, setCustomCron] = useState('0 3 * * *');
  const [retentionDays, setRetentionDays] = useState(7);
  const [backupDir, setBackupDir] = useState('/var/backups/xivizley');
  const [enableEncryption, setEnableEncryption] = useState(false);
  const [encryptionPassword, setEncryptionPassword] = useState('XIV-SECRET-BACKUP-KEY-2026!');
  const [discordWebhook, setDiscordWebhook] = useState('');
  const [copiedType, setCopiedType] = useState<string | null>(null);
  const [activeView, setActiveView] = useState<'backup' | 'restore' | 'cron'>('backup');

  const cronSchedule = useMemo(() => {
    switch (schedule) {
      case 'daily':
        return '0 3 * * *';
      case 'twice_daily':
        return '0 3,15 * * *';
      case 'weekly':
        return '0 4 * * 0';
      case 'custom':
        return customCron;
    }
  }, [schedule, customCron]);

  const scheduleLabel = useMemo(() => {
    switch (schedule) {
      case 'daily':
        return isTr ? 'Her Gece 03:00 (Önerilen)' : isPt ? 'Todas as noites às 03:00 (Recomendado)' : 'Nightly at 03:00 (Recommended)';
      case 'twice_daily':
        return isTr ? 'Günde 2 Kez (03:00 & 15:00)' : isPt ? '2x ao dia (03:00 & 15:00)' : 'Twice daily (03:00 & 15:00)';
      case 'weekly':
        return isTr ? 'Haftalık (Pazar 04:00)' : isPt ? 'Semanal (Domingo 04:00)' : 'Weekly (Sunday 04:00)';
      case 'custom':
        return isTr ? `Özel Zamanlama (${customCron})` : isPt ? `Agendamento Personalizado (${customCron})` : `Custom Cron (${customCron})`;
    }
  }, [schedule, customCron, isTr, isPt]);

  const backupSuite = useMemo(() => {
    return generateBackupSuite(nodes, {
      backupDir,
      cronSchedule,
      scheduleLabel,
      retentionDays,
      enableEncryption,
      encryptionPassword,
      discordWebhook,
    });
  }, [
    nodes,
    backupDir,
    cronSchedule,
    scheduleLabel,
    retentionDays,
    enableEncryption,
    encryptionPassword,
    discordWebhook,
  ]);

  const handleCopy = async (text: string, type: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textarea = document.createElement('textarea');
        textarea.value = text;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.focus();
        textarea.select();
        document.execCommand('copy');
        document.body.removeChild(textarea);
      }
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    } catch {
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    }
  };

  const handleDownload = (content: string, filename: string) => {
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-4 space-y-4 bg-[#090514] text-[#F5F3FF] font-mono scrollbar-thin scrollbar-thumb-[#2B1A42]">
      {/* ── Header Banner (DIN 40719 Spec) ── */}
      <div className="rounded-[2px] border border-[#2B1A42] bg-[#120A21] p-3.5 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-[2px] bg-[#06030D] text-[#C084FC] border border-[#2B1A42]">
            <Archive className="h-4 w-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-xs font-bold text-[#F5F3FF] tracking-wide uppercase">
                {isTr ? 'Yedekleme & Kurtarma (Disaster Recovery)' : 'Backup & Disaster Recovery Studio'}
              </h3>
              <span className="rounded-[2px] bg-[#1E1235] px-1.5 py-0.5 text-[9px] font-bold text-[#C084FC] border border-[#2B1A42]">
                DIN-DR
              </span>
            </div>
            <p className="text-[10px] text-[#8B7D9E] mt-0.5">
              {isTr
                ? 'Veritabanı dökümleri (Postgres, MariaDB, MySQL, SQLite), kalıcı disk birimleri ve tek tıkla geri yükleme.'
                : 'Automated database dumps (Postgres, MariaDB, MySQL, SQLite), persistent volumes and 1-command recovery.'}
            </p>
          </div>
        </div>

        {/* Quick Summary Badges */}
        <div className="flex flex-wrap items-center gap-2 mt-3 pt-2.5 border-t border-[#2B1A42] text-[10px]">
          <span className="flex items-center gap-1 text-emerald-400 bg-[#06030D] px-2 py-0.5 rounded-[2px] border border-[#2B1A42]">
            <Database className="h-3 w-3" />
            {backupSuite.detectedDatabases.length} {isTr ? 'Veritabanı' : 'Databases'}
          </span>
          <span className="flex items-center gap-1 text-[#C4B5FD] bg-[#06030D] px-2 py-0.5 rounded-[2px] border border-[#2B1A42]">
            <FolderArchive className="h-3 w-3" />
            {backupSuite.detectedVolumes.length} {isTr ? 'Birim' : 'Volumes'}
          </span>
          <span className="flex items-center gap-1 text-amber-400 bg-[#06030D] px-2 py-0.5 rounded-[2px] border border-[#2B1A42] ml-auto">
            <Clock className="h-3 w-3" />
            {retentionDays} {isTr ? 'Gün Saklama' : 'Days Retention'}
          </span>
        </div>
      </div>

      {/* ── Configuration Controls ── */}
      <div className="rounded-[2px] border border-[#2B1A42] bg-[#120A21] p-3.5 space-y-3 shadow-md">
        <div className="flex items-center justify-between border-b border-[#2B1A42] pb-2">
          <span className="text-xs font-bold text-[#F5F3FF]">
            {isTr ? 'Zamanlama & Saklama Parametreleri' : 'Scheduling & Retention Parameters'}
          </span>
          <span className="text-[10px] text-[#8B7D9E]">/var/backups/xivizley</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
          {/* Schedule Select */}
          <div>
            <label className="block text-[10px] text-[#8B7D9E] uppercase mb-1">
              {isTr ? 'Yedekleme Sıklığı' : 'Backup Frequency'}
            </label>
            <select
              value={schedule}
              onChange={(e) => setSchedule(e.target.value as any)}
              className="w-full rounded-[2px] border border-[#2B1A42] bg-[#06030D] px-2.5 py-1.5 text-xs text-[#F5F3FF] focus:outline-none focus:border-[#8B5CF6]"
            >
              <option value="daily">{isTr ? 'Her Gece 03:00 (Önerilen)' : 'Nightly at 03:00 (Recommended)'}</option>
              <option value="twice_daily">{isTr ? 'Günde 2 Kez (03:00 & 15:00)' : 'Twice daily (03:00 & 15:00)'}</option>
              <option value="weekly">{isTr ? 'Haftalık (Pazar 04:00)' : 'Weekly (Sunday 04:00)'}</option>
              <option value="custom">{isTr ? 'Özel Cron İfadesi' : 'Custom Cron Expression'}</option>
            </select>
          </div>

          {/* Retention Days */}
          <div>
            <label className="block text-[10px] text-[#8B7D9E] uppercase mb-1">
              {isTr ? 'Eski Yedekleri Saklama (Gün)' : 'Retention (Days)'}
            </label>
            <select
              value={retentionDays}
              onChange={(e) => setRetentionDays(Number(e.target.value))}
              className="w-full rounded-[2px] border border-[#2B1A42] bg-[#06030D] px-2.5 py-1.5 text-xs text-[#F5F3FF] focus:outline-none focus:border-[#8B5CF6]"
            >
              <option value={7}>{isTr ? '7 Gün (Haftalık Döngü)' : '7 Days (Weekly Cycle)'}</option>
              <option value={14}>{isTr ? '14 Gün (2 Hafta)' : '14 Days (Bi-weekly)'}</option>
              <option value={30}>{isTr ? '30 Gün (Aylık)' : '30 Days (Monthly Archive)'}</option>
            </select>
          </div>
        </div>

        {/* Custom Cron Input */}
        {schedule === 'custom' && (
          <div>
            <label className="block text-[10px] text-[#8B7D9E] uppercase mb-1">
              {isTr ? 'Özel Cron İfadesi' : 'Custom Cron Expression'}
            </label>
            <input
              type="text"
              value={customCron}
              onChange={(e) => setCustomCron(e.target.value)}
              placeholder="0 3 * * *"
              className="w-full rounded-[2px] border border-[#2B1A42] bg-[#06030D] px-2.5 py-1 text-xs text-[#C4B5FD] focus:outline-none focus:border-[#8B5CF6]"
            />
          </div>
        )}

        {/* AES-256 Encryption Toggle */}
        <div className="pt-2 border-t border-[#2B1A42]">
          <div className="flex items-center justify-between">
            <label className="flex items-center gap-2 cursor-pointer text-xs text-[#A19BAF]">
              <input
                type="checkbox"
                checked={enableEncryption}
                onChange={(e) => setEnableEncryption(e.target.checked)}
                className="h-3.5 w-3.5 rounded-[2px] border-[#2B1A42] bg-[#06030D] text-[#8B5CF6]"
              />
              <span className="flex items-center gap-1.5">
                <Lock className="h-3 w-3 text-amber-400" />
                <span>{isTr ? 'AES-256 CBC Şifreleme Uygula' : 'Apply AES-256 CBC Encryption'}</span>
              </span>
            </label>
            {enableEncryption && (
              <span className="text-[10px] text-amber-400 bg-amber-950/40 px-1.5 py-0.5 rounded-[2px] border border-amber-800/40">
                AES-256
              </span>
            )}
          </div>

          {enableEncryption && (
            <div className="mt-2">
              <input
                type="text"
                value={encryptionPassword}
                onChange={(e) => setEncryptionPassword(e.target.value)}
                placeholder="Şifreleme parolası"
                className="w-full rounded-[2px] border border-amber-500/40 bg-[#06030D] px-2.5 py-1 text-xs text-amber-300 focus:outline-none"
              />
            </div>
          )}
        </div>
      </div>

      {/* ── Script Selector Tabs ── */}
      <div className="flex border border-[#2B1A42] bg-[#06030D] rounded-[2px] p-0.5 gap-1">
        <button
          onClick={() => setActiveView('backup')}
          className={cn(
            'flex-1 py-1.5 rounded-[2px] text-xs font-bold transition-all flex items-center justify-center gap-1.5',
            activeView === 'backup'
              ? 'bg-[#8B5CF6] text-white shadow-sm'
              : 'text-[#8B7D9E] hover:text-[#F5F3FF]'
          )}
        >
          <Archive className="h-3 w-3" />
          <span>backup.sh</span>
        </button>

        <button
          onClick={() => setActiveView('cron')}
          className={cn(
            'flex-1 py-1.5 rounded-[2px] text-xs font-bold transition-all flex items-center justify-center gap-1.5',
            activeView === 'cron'
              ? 'bg-[#8B5CF6] text-white shadow-sm'
              : 'text-[#8B7D9E] hover:text-[#F5F3FF]'
          )}
        >
          <Clock className="h-3 w-3" />
          <span>crontab</span>
        </button>

        <button
          onClick={() => setActiveView('restore')}
          className={cn(
            'flex-1 py-1.5 rounded-[2px] text-xs font-bold transition-all flex items-center justify-center gap-1.5',
            activeView === 'restore'
              ? 'bg-[#8B5CF6] text-white shadow-sm'
              : 'text-[#8B7D9E] hover:text-[#F5F3FF]'
          )}
        >
          <RefreshCw className="h-3 w-3" />
          <span>restore.sh</span>
        </button>
      </div>

      {/* ── Active Tab Content ── */}
      {activeView === 'backup' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#8B7D9E] flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-[#C084FC]" />
              <span>/var/backups/xivizley/backup.sh</span>
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleCopy(backupSuite.backupScript, 'backup')}
                className="flex items-center gap-1 rounded-[2px] bg-[#1E1235] hover:bg-[#8B5CF6] hover:text-white border border-[#2B1A42] px-2.5 py-1 text-xs text-[#C084FC] transition-all cursor-pointer"
              >
                {copiedType === 'backup' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copiedType === 'backup' ? (isTr ? 'Kopyalandı' : 'Copied') : (isTr ? 'Kopyala' : 'Copy')}</span>
              </button>
              <button
                onClick={() => handleDownload(backupSuite.backupScript, 'backup.sh')}
                className="flex items-center gap-1 rounded-[2px] bg-[#120A21] hover:bg-[#1E1235] border border-[#2B1A42] px-2.5 py-1 text-xs text-[#A19BAF] transition-all cursor-pointer"
              >
                <Download className="h-3 w-3" />
                <span>{isTr ? 'İndir' : 'Download'}</span>
              </button>
            </div>
          </div>
          <pre className="rounded-[2px] border border-[#2B1A42] bg-[#06030D] p-3 text-[11px] font-mono text-[#C4B5FD] overflow-x-auto max-h-72 scrollbar-thin scrollbar-thumb-[#2B1A42]">
            {backupSuite.backupScript}
          </pre>
        </div>
      )}

      {activeView === 'cron' && (
        <div className="space-y-3 rounded-[2px] border border-[#2B1A42] bg-[#120A21] p-3.5 shadow-md">
          <div className="flex items-center justify-between">
            <h4 className="text-xs font-bold text-[#F5F3FF] flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-emerald-400" />
              <span>{isTr ? "Otomatik Crontab Kurulum Komutu" : 'Automated Crontab Setup Command'}</span>
            </h4>
            <button
              onClick={() => handleCopy(backupSuite.cronCommand, 'cron')}
              className="flex items-center gap-1.5 rounded-[2px] bg-[#8B5CF6] hover:bg-[#7C3AED] text-white px-2.5 py-1 text-xs font-bold transition-all shadow-[0_0_10px_rgba(139,92,246,0.3)] active:scale-95 cursor-pointer"
            >
              {copiedType === 'cron' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
              <span>{copiedType === 'cron' ? (isTr ? 'Kopyalandı' : 'Copied') : (isTr ? 'Kopyala' : 'Copy')}</span>
            </button>
          </div>
          <p className="text-[11px] text-[#8B7D9E] leading-relaxed">
            {isTr
              ? "Sunucunuzun terminalinde (SSH) bu tek satırlık komutu çalıştırarak her gece 03:00'te otomatik yedeklemeyi başlatın:"
              : 'Run this single-line command in your server terminal (SSH) to enable automated nightly backups:'}
          </p>
          <pre className="rounded-[2px] border border-[#2B1A42] bg-[#06030D] p-3 text-xs font-mono text-emerald-400 overflow-x-auto">
            {backupSuite.cronCommand}
          </pre>
        </div>
      )}

      {activeView === 'restore' && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-[11px] text-[#8B7D9E] flex items-center gap-1.5">
              <RefreshCw className="h-3.5 w-3.5 text-[#C084FC]" />
              <span>/var/backups/xivizley/restore.sh</span>
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleCopy(backupSuite.restoreScript, 'restore')}
                className="flex items-center gap-1 rounded-[2px] bg-[#1E1235] hover:bg-[#8B5CF6] hover:text-white border border-[#2B1A42] px-2.5 py-1 text-xs text-[#C084FC] transition-all cursor-pointer"
              >
                {copiedType === 'restore' ? <Check className="h-3 w-3 text-emerald-400" /> : <Copy className="h-3 w-3" />}
                <span>{copiedType === 'restore' ? (isTr ? 'Kopyalandı' : 'Copied') : (isTr ? 'Kopyala' : 'Copy')}</span>
              </button>
              <button
                onClick={() => handleDownload(backupSuite.restoreScript, 'restore.sh')}
                className="flex items-center gap-1 rounded-[2px] bg-[#120A21] hover:bg-[#1E1235] border border-[#2B1A42] px-2.5 py-1 text-xs text-[#A19BAF] transition-all cursor-pointer"
              >
                <Download className="h-3 w-3" />
                <span>{isTr ? 'İndir' : 'Download'}</span>
              </button>
            </div>
          </div>
          <p className="text-[11px] text-[#8B7D9E]">
            {isTr
              ? 'Sunucu çöktüğünde veya veritabanı bozulduğunda tek satırda geri yüklemek için:'
              : 'To restore in a single line if your server crashes or database is corrupted:'}
            <code className="ml-1.5 px-1.5 py-0.5 rounded-[2px] bg-[#06030D] border border-[#2B1A42] text-[#C4B5FD] font-mono text-[10px]">
              bash restore.sh /var/backups/xivizley/xivizley_backup_...tar.gz
            </code>
          </p>
          <pre className="rounded-[2px] border border-[#2B1A42] bg-[#06030D] p-3 text-[11px] font-mono text-[#C4B5FD] overflow-x-auto max-h-72 scrollbar-thin scrollbar-thumb-[#2B1A42]">
            {backupSuite.restoreScript}
          </pre>
        </div>
      )}
    </div>
  );
}
