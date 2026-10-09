// ============================================================
// XIVIZLEY — Hardware Resource Estimator
// lib/utils/hardwareEstimator.ts
// ============================================================

import { MODULE_CATALOG, type ResourceRequirement } from '@/lib/data/modules';
import type { ArchitectNode } from '@/lib/types';

// Default / fallback resource requirements mapped by module id
export const DEFAULT_MODULE_RESOURCES: Record<string, ResourceRequirement> = {
  'ubuntu-server': { ramMB: 512, cpuCores: 1, diskGB: 10 },
  'debian': { ramMB: 256, cpuCores: 1, diskGB: 5 },
  'docker': { ramMB: 256, cpuCores: 0.5, diskGB: 5 },
  'casaos': { ramMB: 512, cpuCores: 0.5, diskGB: 5 },
  'adguard-home': { ramMB: 256, cpuCores: 0.5, diskGB: 2 },
  'nginx-proxy-manager': { ramMB: 512, cpuCores: 0.5, diskGB: 2 },
  'cloudflared': { ramMB: 128, cpuCores: 0.2, diskGB: 1 },
  'nextcloud': { ramMB: 1536, cpuCores: 1.5, diskGB: 20 },
  'immich': { ramMB: 2048, cpuCores: 2, diskGB: 30 },
  'jellyfin': { ramMB: 2048, cpuCores: 2, diskGB: 20 },
  'vaultwarden': { ramMB: 128, cpuCores: 0.2, diskGB: 1 },
  '2fauth': { ramMB: 128, cpuCores: 0.2, diskGB: 1 },
  'minecraft-paperm': { ramMB: 4096, cpuCores: 2, diskGB: 10 },
  'fivem': { ramMB: 4096, cpuCores: 4, diskGB: 25 },
  'palworld': { ramMB: 8192, cpuCores: 4, diskGB: 30 },
  'rust-server': { ramMB: 6144, cpuCores: 4, diskGB: 25 },
  'valheim': { ramMB: 3072, cpuCores: 2, diskGB: 10 },
  'project-zomboid': { ramMB: 4096, cpuCores: 2, diskGB: 15 },
  'cs2-server': { ramMB: 4096, cpuCores: 2, diskGB: 40 },
  'terraria': { ramMB: 1024, cpuCores: 1, diskGB: 5 },
  'assetto-corsa': { ramMB: 2048, cpuCores: 2, diskGB: 15 },
  'ark-survival': { ramMB: 8192, cpuCores: 4, diskGB: 40 },
  'wordpress': { ramMB: 512, cpuCores: 0.5, diskGB: 5 },
  'mysql': { ramMB: 512, cpuCores: 0.5, diskGB: 10 },
  'postgresql': { ramMB: 512, cpuCores: 0.5, diskGB: 10 },
  'pgadmin': { ramMB: 256, cpuCores: 0.2, diskGB: 2 },
  'redis': { ramMB: 128, cpuCores: 0.2, diskGB: 2 },
  'watchtower': { ramMB: 64, cpuCores: 0.1, diskGB: 1 },
  'pi-hole': { ramMB: 256, cpuCores: 0.5, diskGB: 2 },
  'wireguard': { ramMB: 128, cpuCores: 0.2, diskGB: 1 },
  'tailscale': { ramMB: 128, cpuCores: 0.2, diskGB: 1 },
  'portainer': { ramMB: 256, cpuCores: 0.2, diskGB: 1 },
  'plex': { ramMB: 2048, cpuCores: 2, diskGB: 20 },
  'qbittorrent': { ramMB: 512, cpuCores: 0.5, diskGB: 50 },
  'uptime-kuma': { ramMB: 256, cpuCores: 0.2, diskGB: 2 },
  'heimdall': { ramMB: 128, cpuCores: 0.2, diskGB: 1 },
  'duplicati': { ramMB: 512, cpuCores: 0.5, diskGB: 5 },
  'overseerr': { ramMB: 512, cpuCores: 0.5, diskGB: 2 },
  'radarr': { ramMB: 512, cpuCores: 0.5, diskGB: 5 },
  'sonarr': { ramMB: 512, cpuCores: 0.5, diskGB: 5 },
  'n8n': { ramMB: 512, cpuCores: 0.5, diskGB: 2 },
  'glances': { ramMB: 128, cpuCores: 0.2, diskGB: 1 },
  'mealie': { ramMB: 512, cpuCores: 0.5, diskGB: 2 },
  'audiobookshelf': { ramMB: 512, cpuCores: 0.5, diskGB: 10 },
  'romm': { ramMB: 1024, cpuCores: 1, diskGB: 15 },
};

export interface DeviceRecommendation {
  title: string;
  category: string;
  description: string;
  badgeColor: string;
  badgeBg: string;
  badgeBorder: string;
  iconName: string;
}

export interface ServiceResourceBreakdown {
  name: string;
  ramMB: number;
  cpuCores: number;
  diskGB: number;
}

export interface HardwareEstimate {
  totalRamMB: number;
  totalRamGB: string;
  totalCpuCores: number;
  totalDiskGB: number;
  serviceCount: number;
  recommendation: DeviceRecommendation;
  warnings: string[];
  topConsumers: ServiceResourceBreakdown[];
}

export function calculateHardwareEstimate(nodes: ArchitectNode[], lang: 'tr' | 'en' | 'pt' = 'tr'): HardwareEstimate {
  const isTr = lang === 'tr';
  const isPt = lang === 'pt';

  let ramMB = 0;
  let cpuCores = 0;
  let diskGB = 0;
  const warnings: string[] = [];
  const consumers: ServiceResourceBreakdown[] = [];

  for (const node of nodes) {
    const modDef = MODULE_CATALOG.find((m) => m.id === node.data.moduleId);
    const res = modDef?.resources ?? DEFAULT_MODULE_RESOURCES[node.data.moduleId] ?? {
      ramMB: 256,
      cpuCores: 0.5,
      diskGB: 2,
    };

    ramMB += res.ramMB;
    cpuCores += res.cpuCores;
    diskGB += res.diskGB;

    consumers.push({
      name: node.data.label || modDef?.name || (isTr ? 'Konteyner' : isPt ? 'Contêiner' : 'Container'),
      ramMB: res.ramMB,
      cpuCores: res.cpuCores,
      diskGB: res.diskGB,
    });

    // Specific module checks
    if (node.data.moduleId === 'minecraft-paperm' || node.data.moduleId === 'palworld' || node.data.moduleId === 'rust-server') {
      if (!warnings.some((w) => w.includes('RAM') || w.includes('oyuncu'))) {
        warnings.push(
          isTr
            ? 'Oyun sunucuları yoğun oyuncu girişlerinde ani RAM ve CPU pikleri yapabilir.'
            : isPt
            ? 'Servidores de jogos podem sofrer picos repentinos de RAM e CPU com muitos jogadores.'
            : 'Game servers may experience sudden RAM and CPU spikes during high player traffic.'
        );
      }
    }
    if (node.data.moduleId === 'immich' || node.data.moduleId === 'jellyfin' || node.data.moduleId === 'plex') {
      if (!warnings.some((w) => w.includes('Transcoding') || w.includes('iGPU'))) {
        warnings.push(
          isTr
            ? 'Medya & Fotoğraf işleme (Transcoding/ML) için Intel QuickSync destekli iGPU önerilir.'
            : isPt
            ? 'Recomenda-se uma iGPU com suporte a Intel QuickSync para transcodificação de mídia e ML.'
            : 'An Intel QuickSync supported iGPU is recommended for media & photo processing (Transcoding/ML).'
        );
      }
    }
  }

  // Base OS overhead if no OS module explicitly placed
  const hasOS = nodes.some((n) => {
    const mod = MODULE_CATALOG.find((m) => m.id === n.data.moduleId);
    return mod?.isOS;
  });
  if (!hasOS && nodes.length > 0) {
    ramMB += 256;
    cpuCores = Math.max(cpuCores, 1);
    diskGB += 5;
  }

  // Sort top consumers by RAM usage
  consumers.sort((a, b) => b.ramMB - a.ramMB);

  // Determine Recommendation
  let recommendation: DeviceRecommendation;

  if (nodes.length === 0) {
    recommendation = {
      title: isTr ? 'Boş Tuval' : isPt ? 'Canvas Vazio' : 'Empty Canvas',
      category: isTr ? 'Bekleniyor' : isPt ? 'Aguardando' : 'Waiting',
      description: isTr
        ? 'Hesaplama için sol menüden veya şablonlardan servis ekleyin.'
        : isPt
        ? 'Adicione serviços da barra lateral ou modelos para calcular.'
        : 'Add services from the sidebar or templates to calculate.',
      badgeColor: 'text-slate-400',
      badgeBg: 'bg-slate-800/60',
      badgeBorder: 'border-slate-700',
      iconName: 'Server',
    };
  } else if (ramMB <= 2048 && cpuCores <= 2) {
    recommendation = {
      title: 'Raspberry Pi 4 / Mini PC',
      category: isTr ? 'Hafif Yük (Ultra Düşük Güç)' : isPt ? 'Carga Leve (Ultra Baixo Consumo)' : 'Light Load (Ultra Low Power)',
      description: isTr
        ? 'Raspberry Pi 4 (2GB-4GB), Orange Pi veya eski bir Thin Client ile sessizce çalışır (3-7W güç tüketimi).'
        : isPt
        ? 'Funciona silenciosamente em Raspberry Pi 4 (2GB-4GB), Orange Pi ou Thin Client (3-7W de consumo).'
        : 'Runs silently on Raspberry Pi 4 (2GB-4GB), Orange Pi, or a Thin Client (3-7W power draw).',
      badgeColor: 'text-emerald-400',
      badgeBg: 'bg-emerald-950/40',
      badgeBorder: 'border-emerald-500/40',
      iconName: 'Cpu',
    };
  } else if (ramMB <= 8192 && cpuCores <= 4) {
    recommendation = {
      title: 'Intel N100 / Beelink Mini PC',
      category: isTr ? 'İdeal Homelab (Önerilen)' : isPt ? 'Homelab Ideal (Recomendado)' : 'Ideal Homelab (Recommended)',
      description: isTr
        ? 'Intel N100 / N95 Mini PC (16GB RAM, NVMe SSD) bu mimari için en ekonomik ve performanslı seçenektir.'
        : isPt
        ? 'Intel N100 / N95 Mini PC (16GB RAM, SSD NVMe) é a opção mais econômica e eficiente para esta arquitetura.'
        : 'Intel N100 / N95 Mini PC (16GB RAM, NVMe SSD) is the most cost-effective and performant choice for this stack.',
      badgeColor: 'text-cyan-400',
      badgeBg: 'bg-cyan-950/40',
      badgeBorder: 'border-cyan-500/40',
      iconName: 'Zap',
    };
  } else if (ramMB <= 16384 && cpuCores <= 8) {
    recommendation = {
      title: isTr ? 'Orta Segment Sunucu / Masaüstü' : isPt ? 'Servidor Médio / Desktop' : 'Mid-Range Server / Desktop',
      category: isTr ? 'Gelişmiş Homelab' : isPt ? 'Homelab Avançado' : 'Advanced Homelab',
      description: isTr
        ? 'Intel i5/Ryzen 5 (32GB RAM) mini sunucu veya orta segment bir VDS sunucusu önerilir.'
        : isPt
        ? 'Recomenda-se um mini servidor Intel i5/Ryzen 5 (32GB RAM) ou servidor VDS intermediário.'
        : 'An Intel i5/Ryzen 5 (32GB RAM) mini server or mid-range VDS is recommended.',
      badgeColor: 'text-amber-400',
      badgeBg: 'bg-amber-950/40',
      badgeBorder: 'border-amber-500/40',
      iconName: 'Server',
    };
  } else {
    recommendation = {
      title: isTr ? 'Özel Adanmış Sunucu (Dedicated)' : isPt ? 'Servidor Dedicado' : 'Dedicated Server',
      category: isTr ? 'Yüksek Performans / Enterprise' : isPt ? 'Alta Performance / Enterprise' : 'High Performance / Enterprise',
      description: isTr
        ? '64GB+ RAM, 8+ Çekirdek CPU ve NVMe depolama içeren güçlü bir Dedicated Sunucu veya Proxmox Cluster gerektirir.'
        : isPt
        ? 'Exige um servidor dedicado potente ou cluster Proxmox com 64GB+ RAM, 8+ núcleos de CPU e armazenamento NVMe.'
        : 'Requires a powerful Dedicated Server or Proxmox Cluster with 64GB+ RAM, 8+ CPU cores, and NVMe storage.',
      badgeColor: 'text-red-400',
      badgeBg: 'bg-red-950/40',
      badgeBorder: 'border-red-500/40',
      iconName: 'HardDrive',
    };
  }

  const totalRamGB = (ramMB / 1024).toFixed(1).replace('.0', '');

  return {
    totalRamMB: ramMB,
    totalRamGB,
    totalCpuCores: Math.ceil(cpuCores),
    totalDiskGB: diskGB,
    serviceCount: nodes.length,
    recommendation,
    warnings,
    topConsumers: consumers.slice(0, 4),
  };
}
