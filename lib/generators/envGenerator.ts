// ============================================================
// XIVIZLEY — Environment File (.env) Generator
// lib/generators/envGenerator.ts
// ============================================================

import { MODULE_CATALOG } from '@/lib/data/modules';
import type { ArchitectNode } from '@/lib/types';
import { toServiceName } from './composeGenerator';

export function generateEnvFile(nodes: ArchitectNode[]): string {
  if (nodes.length === 0) {
    return '# XIVIZLEY Environment Configuration (.env)\n# Tuvalde henüz aktif servis bulunmuyor.\n';
  }

  const lines: string[] = [
    '# ============================================================',
    '# XIVIZLEY Server Architect — Auto-Generated .env File',
    `# Generated at: ${new Date().toISOString()}`,
    '# ============================================================',
    '',
    '# Sunucu Genel Ayarları',
    'TZ=Europe/Istanbul',
    'PUID=1000',
    'PGID=1000',
    '',
  ];

  let hasCustomVars = false;

  for (const node of nodes) {
    const moduleDef = MODULE_CATALOG.find((m) => m.id === node.data.moduleId);
    const serviceName = toServiceName(node.data.label || moduleDef?.name || node.data.moduleId);

    if (node.data.isCustom) {
      const customEnv = node.data.customEnv || {};
      const keys = Object.keys(customEnv);
      if (keys.length > 0) {
        hasCustomVars = true;
        lines.push(`# ─── ${node.data.label} (Özel Konteyner) ───`);
        for (const key of keys) {
          lines.push(`${key}=${customEnv[key]}`);
        }
        lines.push('');
      }
      continue;
    }

    if (!moduleDef || moduleDef.environment.length === 0) continue;

    hasCustomVars = true;
    lines.push(`# ─── ${moduleDef.name} (${serviceName}) ───`);
    for (const envDef of moduleDef.environment) {
      const value = node.data.envOverrides[envDef.key] ?? envDef.defaultValue;
      if (envDef.description) {
        lines.push(`# ${envDef.description}${envDef.required ? ' (Zorunlu)' : ''}`);
      }
      lines.push(`${envDef.key}=${value}`);
    }
    lines.push('');
  }

  if (!hasCustomVars) {
    lines.push('# Seçili servislerin özel bir ortam değişkeni (env) gereksinimi bulunmuyor.');
  }

  return lines.join('\n');
}
