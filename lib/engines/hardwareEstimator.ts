// ============================================================
// XIVIZLEY — Live Hardware & Resource Estimator Engine
// lib/engines/hardwareEstimator.ts
// ============================================================

import type { Node } from 'reactflow';
import type { ModuleNodeData } from '@/lib/types';
import { MODULE_CATALOG } from '@/lib/data/modules';

export interface ResourceEstimate {
  ramMB: number;
  cpuCores: number;
  diskGB: number;
}

export interface HardwareReport {
  totalRamMB: number;
  totalRamGB: number;
  totalCpuCores: number;
  totalDiskGB: number;
  recommendedServerTier: string;
  recommendedServerTierEn: string;
  serverExamples: string[];
  powerLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME';
}

const DEFAULT_RESOURCE_MAP: Record<string, ResourceEstimate> = {
  'debian': { ramMB: 128, cpuCores: 0.2, diskGB: 2 },
  'ubuntu-server': { ramMB: 256, cpuCores: 0.5, diskGB: 4 },
  'docker': { ramMB: 128, cpuCores: 0.2, diskGB: 2 },
  'casaos': { ramMB: 128, cpuCores: 0.2, diskGB: 2 },
  'adguard-home': { ramMB: 128, cpuCores: 0.2, diskGB: 2 },
  'pi-hole': { ramMB: 128, cpuCores: 0.2, diskGB: 2 },
  'wireguard': { ramMB: 64, cpuCores: 0.1, diskGB: 1 },
  'tailscale': { ramMB: 64, cpuCores: 0.1, diskGB: 1 },
  'nginx-proxy-manager': { ramMB: 256, cpuCores: 0.5, diskGB: 2 },
  'cloudflared': { ramMB: 64, cpuCores: 0.1, diskGB: 1 },
  'plex': { ramMB: 1024, cpuCores: 2.0, diskGB: 20 },
  'jellyfin': { ramMB: 1024, cpuCores: 1.5, diskGB: 15 },
  'overseerr': { ramMB: 256, cpuCores: 0.5, diskGB: 2 },
  'radarr': { ramMB: 256, cpuCores: 0.5, diskGB: 5 },
  'sonarr': { ramMB: 256, cpuCores: 0.5, diskGB: 5 },
  'qbittorrent': { ramMB: 256, cpuCores: 0.5, diskGB: 10 },
  'nextcloud': { ramMB: 512, cpuCores: 1.0, diskGB: 10 },
  'immich': { ramMB: 2048, cpuCores: 2.0, diskGB: 25 },
  'duplicati': { ramMB: 128, cpuCores: 0.2, diskGB: 2 },
  'vaultwarden': { ramMB: 64, cpuCores: 0.1, diskGB: 1 },
  '2fauth': { ramMB: 64, cpuCores: 0.1, diskGB: 1 },
  'n8n': { ramMB: 384, cpuCores: 0.5, diskGB: 2 },
  'glances': { ramMB: 64, cpuCores: 0.1, diskGB: 1 },
  'uptime-kuma': { ramMB: 128, cpuCores: 0.2, diskGB: 2 },
  'heimdall': { ramMB: 64, cpuCores: 0.1, diskGB: 1 },
  'portainer': { ramMB: 128, cpuCores: 0.2, diskGB: 2 },
  'mealie': { ramMB: 128, cpuCores: 0.2, diskGB: 2 },
  'audiobookshelf': { ramMB: 256, cpuCores: 0.5, diskGB: 5 },
  'romm': { ramMB: 256, cpuCores: 0.5, diskGB: 5 },
  'minecraft-paperm': { ramMB: 2048, cpuCores: 2.0, diskGB: 10 },
  'fivem': { ramMB: 4096, cpuCores: 4.0, diskGB: 25 },
};

export function estimateHardwareRequirements(nodes: Node<ModuleNodeData>[]): HardwareReport {
  let totalRamMB = 0;
  let totalCpuCores = 0;
  let totalDiskGB = 0;

  nodes.forEach((n) => {
    const modId = n.data.moduleId;
    const est = DEFAULT_RESOURCE_MAP[modId] || { ramMB: 256, cpuCores: 0.5, diskGB: 2 };
    totalRamMB += est.ramMB;
    totalCpuCores += est.cpuCores;
    totalDiskGB += est.diskGB;
  });

  // Base OS overhead (minimum 512 MB for host Linux kernel + systemd)
  if (nodes.length > 0) {
    totalRamMB += 512;
    totalCpuCores = Math.max(1, Math.round(totalCpuCores));
    totalDiskGB += 10;
  }

  const totalRamGB = parseFloat((totalRamMB / 1024).toFixed(1));

  let recommendedServerTier = 'Giriş Seviyesi (Mini PC / Raspberry Pi)';
  let recommendedServerTierEn = 'Entry Level (Mini PC / Raspberry Pi)';
  let serverExamples = ['Raspberry Pi 4/5 4GB', 'Intel N100 Mini PC', '1-2 Core VPS'];
  let powerLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'EXTREME' = 'LOW';

  if (totalRamGB > 8) {
    recommendedServerTier = 'Yüksek Güçlü Sunucu (Dedicated / Gaming Homelab)';
    recommendedServerTierEn = 'High Performance Dedicated Server';
    serverExamples = ['16-32 GB RAM Mini PC (Ryzen / Intel i5/i7)', 'Hetzner Dedicated Server'];
    powerLevel = 'EXTREME';
  } else if (totalRamGB > 4) {
    recommendedServerTier = 'Orta / İleri Seviye Homelab (Mini PC / VPS)';
    recommendedServerTierEn = 'Mid-Range Homelab / VPS';
    serverExamples = ['Raspberry Pi 5 8GB', 'Intel N100 / N305 16GB Mini PC', '4-Core 8GB VPS (Hetzner CPX31)'];
    powerLevel = 'HIGH';
  } else if (totalRamGB > 2) {
    recommendedServerTier = 'Standart Homelab (Raspberry Pi 5 / 4GB VPS)';
    recommendedServerTierEn = 'Standard Homelab (Raspberry Pi 5 / 4GB VPS)';
    serverExamples = ['Raspberry Pi 4/5 4GB', '2-Core 4GB VPS (Hetzner CPX21)', 'Eski Laptop / Mini PC'];
    powerLevel = 'MEDIUM';
  }

  return {
    totalRamMB,
    totalRamGB,
    totalCpuCores,
    totalDiskGB,
    recommendedServerTier,
    recommendedServerTierEn,
    serverExamples,
    powerLevel,
  };
}
