'use client';

import React, { useMemo } from 'react';
import { Sparkles, Plus, X } from 'lucide-react';
import { useArchitectStore } from '@/store/useArchitectStore';
import { useI18nStore } from '@/lib/i18n/store';

interface TipRecommendation {
  id: string;
  targetModuleId: string;
  targetName: string;
  message: string;
}

export function SmartTipsBanner() {
  const { lang } = useI18nStore();
  const isTr = lang === 'tr';
  const isPt = lang === 'pt';

  const nodes = useArchitectStore((s) => s.nodes);
  const addModule = useArchitectStore((s) => s.addModule);
  const [dismissed, setDismissed] = React.useState<string[]>([]);

  const activeModuleIds = useMemo(() => new Set(nodes.map((n) => n.data.moduleId)), [nodes]);

  const activeTip = useMemo<TipRecommendation | null>(() => {
    if (nodes.length === 0) return null;

    // 1. Nextcloud checks
    if (activeModuleIds.has('nextcloud')) {
      if (!activeModuleIds.has('postgresql') && !dismissed.includes('nc-pg')) {
        return {
          id: 'nc-pg',
          targetModuleId: 'postgresql',
          targetName: 'PostgreSQL',
          message: isTr
            ? 'PostgreSQL eklemek Nextcloud dosya işleme performansını 5 kat hızlandırır.'
            : isPt
            ? 'Adicionar PostgreSQL acelera o processamento de arquivos do Nextcloud em até 5x.'
            : 'Adding PostgreSQL speeds up Nextcloud file processing performance by 5x.',
        };
      }
      if (!activeModuleIds.has('redis') && !dismissed.includes('nc-redis')) {
        return {
          id: 'nc-redis',
          targetModuleId: 'redis',
          targetName: 'Redis',
          message: isTr
            ? 'Redis önbelleği ekleyerek Nextcloud kilitlenme ve işlem kuyruğunu optimize edin.'
            : isPt
            ? 'Adicione cache Redis para otimizar filas de transações e travas no Nextcloud.'
            : 'Add Redis cache to optimize file locking and background queues in Nextcloud.',
        };
      }
    }

    // 2. Immich checks
    if (activeModuleIds.has('immich')) {
      if (!activeModuleIds.has('redis') && !dismissed.includes('immich-redis')) {
        return {
          id: 'immich-redis',
          targetModuleId: 'redis',
          targetName: 'Redis',
          message: isTr
            ? 'Immich yapay zeka yüz tanıma ve makine öğrenimi kuyruğu için Redis gereklidir.'
            : isPt
            ? 'O Redis é essencial para filas de IA e reconhecimento facial no Immich.'
            : 'Redis is required for Immich AI facial recognition and ML job queues.',
        };
      }
      if (!activeModuleIds.has('postgresql') && !dismissed.includes('immich-pg')) {
        return {
          id: 'immich-pg',
          targetModuleId: 'postgresql',
          targetName: 'PostgreSQL',
          message: isTr
            ? 'Immich fotoğraf meta veritabanı için PostgreSQL ekleyin.'
            : isPt
            ? 'Adicione PostgreSQL para o banco de metadados de fotos do Immich.'
            : 'Add PostgreSQL database for Immich photo metadata storage.',
        };
      }
    }

    // 3. Media checks
    if (activeModuleIds.has('plex') || activeModuleIds.has('jellyfin')) {
      if (!activeModuleIds.has('radarr') && !dismissed.includes('media-radarr')) {
        return {
          id: 'media-radarr',
          targetModuleId: 'radarr',
          targetName: 'Radarr',
          message: isTr
            ? 'Medyalarınızı otomatik takip edip indirmek için Radarr ekleyebilirsiniz.'
            : isPt
            ? 'Adicione o Radarr para monitorar e organizar filmes automaticamente.'
            : 'Add Radarr to automatically track and manage movies in your library.',
        };
      }
    }

    // 4. Reverse proxy check
    if (nodes.length >= 2 && !activeModuleIds.has('nginx-proxy-manager') && !dismissed.includes('all-npm')) {
      return {
        id: 'all-npm',
        targetModuleId: 'nginx-proxy-manager',
        targetName: 'Nginx Proxy Manager',
        message: isTr
          ? 'Tüm servislerinize tek tıkla SSL sertifikası ve alan adı bağlamak için Nginx Proxy Manager ekleyin.'
          : isPt
          ? 'Adicione o Nginx Proxy Manager para gerenciar domínios e certificados SSL em 1 clique.'
          : 'Add Nginx Proxy Manager to attach custom domains and SSL certs in 1-click.',
      };
    }

    return null;
  }, [nodes, activeModuleIds, dismissed, isTr, isPt]);

  if (!activeTip) return null;

  return (
    <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2.5 px-4 py-2 rounded-xl border border-cyan-500/30 bg-slate-950/90 backdrop-blur-md shadow-2xl animate-in slide-in-from-top-2 duration-200">
      <div className="flex items-center gap-1.5 text-xs text-cyan-400 font-medium">
        <Sparkles className="h-3.5 w-3.5 animate-pulse text-cyan-400 shrink-0" />
        <span className="text-[11px] text-slate-200">{activeTip.message}</span>
      </div>

      <button
        onClick={() => addModule(activeTip.targetModuleId)}
        className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-cyan-600/80 hover:bg-cyan-500 text-[11px] font-bold text-white shadow-sm transition-all"
      >
        <Plus className="h-3 w-3" />
        <span>
          {isTr
            ? `${activeTip.targetName} Ekle`
            : isPt
            ? `Adicionar ${activeTip.targetName}`
            : `Add ${activeTip.targetName}`}
        </span>
      </button>

      <button
        onClick={() => setDismissed((prev) => [...prev, activeTip.id])}
        className="text-slate-500 hover:text-slate-300 p-0.5"
        title={isTr ? 'Kapat' : isPt ? 'Fechar' : 'Dismiss'}
      >
        <X className="h-3 w-3" />
      </button>
    </div>
  );
}
