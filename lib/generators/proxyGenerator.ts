// ============================================================
// XIVIZLEY — Reverse Proxy & Subdomain Config Generator
// lib/generators/proxyGenerator.ts
// ============================================================

import type { Node } from 'reactflow';
import type { ModuleNodeData } from '@/lib/types';
import { MODULE_CATALOG } from '@/lib/data/modules';

export function generateCaddyfile(nodes: Node<ModuleNodeData>[], baseDomain = 'homelab.local'): string {
  const lines: string[] = [
    `# ============================================================`,
    `# Caddyfile — XIVIZLEY Automated Reverse Proxy Config`,
    `# Place this in /etc/caddy/Caddyfile and run: caddy reload`,
    `# ============================================================`,
    ``,
  ];

  nodes.forEach((n) => {
    const def = MODULE_CATALOG.find((m) => m.id === n.data.moduleId);
    if (!def) return;

    // Find the primary Web UI port
    const webPort = def.ports.find((p) => p.label.toLowerCase().includes('web') || p.label.toLowerCase().includes('http') || p.label.toLowerCase().includes('ui')) || def.ports[0];
    if (!webPort) return;

    const hostPort = n.data.portOverrides[webPort.internal] ?? webPort.default;
    const subdomain = `${def.id}.${baseDomain}`;

    lines.push(
      `# ── ${def.name} (${def.category}) ──`,
      `${subdomain} {`,
      `    reverse_proxy localhost:${hostPort}`,
      `    encode gzip`,
      `}`,
      ``
    );
  });

  return lines.join('\n');
}

export function generateNginxConf(nodes: Node<ModuleNodeData>[], baseDomain = 'homelab.local'): string {
  const lines: string[] = [
    `# ============================================================`,
    `# Nginx Reverse Proxy Config — XIVIZLEY`,
    `# Place in /etc/nginx/conf.d/xivizley.conf and run: nginx -s reload`,
    `# ============================================================`,
    ``,
  ];

  nodes.forEach((n) => {
    const def = MODULE_CATALOG.find((m) => m.id === n.data.moduleId);
    if (!def) return;

    const webPort = def.ports.find((p) => p.label.toLowerCase().includes('web') || p.label.toLowerCase().includes('http') || p.label.toLowerCase().includes('ui')) || def.ports[0];
    if (!webPort) return;

    const hostPort = n.data.portOverrides[webPort.internal] ?? webPort.default;
    const subdomain = `${def.id}.${baseDomain}`;

    lines.push(
      `# ── ${def.name} ──`,
      `server {`,
      `    listen 80;`,
      `    server_name ${subdomain};`,
      ``,
      `    location / {`,
      `        proxy_pass http://127.0.0.1:${hostPort};`,
      `        proxy_set_header Host $host;`,
      `        proxy_set_header X-Real-IP $remote_addr;`,
      `        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;`,
      `        proxy_set_header X-Forwarded-Proto $scheme;`,
      `        proxy_http_version 1.1;`,
      `        proxy_set_header Upgrade $http_upgrade;`,
      `        proxy_set_header Connection "upgrade";`,
      `    }`,
      `}`,
      ``
    );
  });

  return lines.join('\n');
}
