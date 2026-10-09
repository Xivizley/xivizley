// ============================================================
// XIVIZLEY — Docker Compose YAML Generator (Production Grade)
// lib/generators/composeGenerator.ts
//
// Pure client-side function — zero server dependencies.
// Takes the current canvas nodes and edges, validates, deduplicates
// service names, resolves depends_on, and emits a standard,
// runnable docker-compose.yml string.
// ============================================================

import { MODULE_CATALOG, MINECRAFT_PLUGINS, FIVEM_PLUGINS } from '@/lib/data/modules';
import { generateVdsDeployScript } from './deploymentGenerator';
import type { ArchitectNode, ArchitectEdge, GeneratedCode } from '@/lib/types';

// ─── Helpers ────────────────────────────────────────────────

function indent(str: string, spaces: number): string {
  const pad = ' '.repeat(spaces);
  return str
    .split('\n')
    .map((line) => (line.trim() === '' ? '' : pad + line))
    .join('\n');
}

const FORBIDDEN_VOLUME_PATTERNS = [
  'docker.sock',
  '/var/run',
  '/run',
  '/etc',
  '/root',
  '/proc',
  '/sys',
  '/dev',
  '/bin',
  '/sbin',
  '/usr',
  '/lib',
  '/var/lib/docker',
  '..',
];

export function isSafeVolumeHostPath(pathStr: string): boolean {
  if (!pathStr || typeof pathStr !== 'string') return false;
  const lower = pathStr.toLowerCase().trim();
  if (lower === '/' || lower === '/root' || lower === '/etc') return false;
  for (const forbidden of FORBIDDEN_VOLUME_PATTERNS) {
    if (lower.includes(forbidden)) return false;
  }
  return /^(\.\/|\/mnt\/|\/opt\/|\/data\/|[a-zA-Z0-9_-]+)[a-zA-Z0-9_.-/]*$/.test(pathStr.trim());
}

export function yamlString(value: string): string {
  if (value === '') return '""';
  if (value === 'true' || value === 'false' || value === 'null' || value === 'yes' || value === 'no' || /^\d+$/.test(value)) {
    return JSON.stringify(value);
  }
  if (
    /[\s:#{}[\]&*,?!|>%@`$'"\n\r\t\\]/.test(value) ||
    value.startsWith('-') ||
    value.startsWith('?')
  ) {
    return JSON.stringify(value);
  }
  return value;
}

export function toServiceName(label: string): string {
  const clean = label
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9_-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
  return clean || 'service';
}

// ─── Service Name Resolver with Deduplication ────────────────

export interface ResolvedServiceInfo {
  nodeId: string;
  serviceName: string;
  isHostInstall: boolean;
}

export function resolveServiceNames(nodes: ArchitectNode[]): Map<string, ResolvedServiceInfo> {
  const serviceMap = new Map<string, ResolvedServiceInfo>();
  const seenNamesCount = new Map<string, number>();

  for (const node of nodes) {
    const { moduleId, label, isCustom, customContainerName } = node.data;
    const moduleDef = MODULE_CATALOG.find((m) => m.id === moduleId);

    const isHost = !isCustom && Boolean(moduleDef?.isHostInstall);
    if (isHost) {
      serviceMap.set(node.id, {
        nodeId: node.id,
        serviceName: toServiceName(label || moduleDef?.name || 'host'),
        isHostInstall: true,
      });
      continue;
    }

    const baseName = toServiceName(customContainerName || label || moduleDef?.name || 'service');
    const count = seenNamesCount.get(baseName) || 0;
    const nextCount = count + 1;
    seenNamesCount.set(baseName, nextCount);

    const serviceName = nextCount === 1 ? baseName : `${baseName}-${nextCount}`;

    serviceMap.set(node.id, {
      nodeId: node.id,
      serviceName,
      isHostInstall: false,
    });
  }

  return serviceMap;
}

// ─── Per-Service Block Generator ────────────────────────────

function generateSingleServiceBlock(
  node: ArchitectNode,
  serviceInfo: ResolvedServiceInfo,
  serviceMap: Map<string, ResolvedServiceInfo>,
  edges: ArchitectEdge[],
  allNodes: ArchitectNode[] = []
): { block: string; networks: Set<string>; namedVolumes: Set<string> } | null {
  if (serviceInfo.isHostInstall) return null;

  const {
    moduleId,
    portOverrides = {},
    envOverrides = {},
    advancedSettings = {},
    isCustom,
    customImage,
    customPorts,
    customVolumes,
    customEnv,
    customRestart,
    customNetworks,
  } = node.data;

  const moduleDef = MODULE_CATALOG.find((m) => m.id === moduleId);
  if (!isCustom && !moduleDef) return null;

  const serviceName = serviceInfo.serviceName;
  const lines: string[] = [];
  const networksUsed = new Set<string>();
  const namedVolumesUsed = new Set<string>();

  lines.push(`${serviceName}:`);

  // 1. Image
  if (isCustom || !moduleDef) {
    const img = customImage?.trim() || 'alpine:latest';
    lines.push(`  image: ${img}`);
  } else {
    lines.push(`  image: ${moduleDef.dockerImage}:${moduleDef.defaultTag}`);
  }

  // 2. Container name
  lines.push(`  container_name: ${serviceName}`);

  // 3. Restart policy
  const restartPolicy = customRestart || 'unless-stopped';
  lines.push(`  restart: ${restartPolicy}`);

  // 3.0 Interactive Console (TTY / STDIN) for Game Servers (FiveM, Minecraft, etc.) to prevent EOF auto-exit
  if (moduleDef?.category === 'game' || moduleId === 'fivem' || moduleId === 'minecraft-papermc') {
    lines.push(`  tty: true`);
    lines.push(`  stdin_open: true`);
  }

  // 3.1 Custom Commands & Capabilities (WireGuard, Tailscale, Cloudflare)
  if (moduleId === 'cloudflare-tunnel' || moduleId === 'cloudflared') {
    lines.push(`  command: tunnel run`);
  }

  if (moduleId === 'wireguard') {
    lines.push(`  cap_add:`);
    lines.push(`    - NET_ADMIN`);
    lines.push(`    - SYS_MODULE`);
  } else if (moduleId === 'tailscale') {
    lines.push(`  cap_add:`);
    lines.push(`    - NET_ADMIN`);
    lines.push(`    - NET_RAW`);
  }

  // 4. Ports
  const portEntries: string[] = [];
  const seenHostPorts = new Set<string>();

  if (isCustom && customPorts && customPorts.length > 0) {
    for (const p of customPorts) {
      const hostPort = p.host;
      const containerPort = p.container;
      const proto = p.protocol === 'udp' ? '/udp' : '/tcp';
      const key = `${hostPort}:${containerPort}${proto}`;
      if (!seenHostPorts.has(key)) {
        seenHostPorts.add(key);
        portEntries.push(`"${hostPort}:${containerPort}${proto}"`);
      }
    }
  } else if (moduleDef && moduleDef.ports.length > 0) {
    for (const portDef of moduleDef.ports) {
      const hostPort = portOverrides[portDef.internal] ?? portDef.default;
      const proto = portDef.protocol === 'udp' ? '/udp' : '/tcp';
      const key = `${hostPort}:${portDef.internal}${proto}`;
      if (!seenHostPorts.has(key)) {
        seenHostPorts.add(key);
        portEntries.push(`"${hostPort}:${portDef.internal}${proto}"`);
      }
    }
  }

  if (portEntries.length > 0) {
    lines.push(`  ports:`);
    for (const entry of portEntries) {
      lines.push(`    - ${entry}`);
    }
  }

  // 5. Environment Variables
  const envList: Array<{ key: string; value: string }> = [];

  if (isCustom && customEnv) {
    for (const [k, v] of Object.entries(customEnv)) {
      if (k.trim()) envList.push({ key: k.trim(), value: String(v) });
    }
  } else if (moduleDef) {
    for (const envDef of moduleDef.environment) {
      const val = envOverrides[envDef.key] ?? envDef.defaultValue ?? '';
      envList.push({ key: envDef.key, value: String(val) });
    }
  }

  // Advanced settings additions
  if (moduleId === 'cloudflared' && advancedSettings.tunnelToken) {
    envList.push({ key: 'TUNNEL_TOKEN', value: String(advancedSettings.tunnelToken) });
  }

  if (moduleId === 'vaultwarden') {
    if (advancedSettings.enableAdmin === false) {
      const idx = envList.findIndex((e) => e.key === 'ADMIN_TOKEN');
      if (idx !== -1) envList.splice(idx, 1);
    }
    if (advancedSettings.allowSignups !== undefined) {
      const existing = envList.find((e) => e.key === 'SIGNUPS_ALLOWED');
      if (existing) existing.value = String(advancedSettings.allowSignups);
      else envList.push({ key: 'SIGNUPS_ALLOWED', value: String(advancedSettings.allowSignups) });
    }
  }

  if (moduleId === 'nextcloud') {
    if (advancedSettings.dbType === 'sqlite') {
      const filtered = envList.filter((e) => !e.key.startsWith('MYSQL_'));
      envList.length = 0;
      envList.push(...filtered, { key: 'SQLITE_DATABASE', value: 'nextcloud' });
    } else if (advancedSettings.dbType === 'postgres') {
      for (const e of envList) {
        if (e.key === 'MYSQL_HOST') e.key = 'POSTGRES_HOST';
        if (e.key === 'MYSQL_DATABASE') e.key = 'POSTGRES_DB';
        if (e.key === 'MYSQL_USER') e.key = 'POSTGRES_USER';
        if (e.key === 'MYSQL_PASSWORD') e.key = 'POSTGRES_PASSWORD';
      }
    }
  }

  if (envList.length > 0) {
    lines.push(`  environment:`);
    const seenEnvKeys = new Set<string>();
    for (const { key, value } of envList) {
      const safeKey = key.trim().replace(/[^a-zA-Z0-9_]/g, '');
      if (safeKey && !seenEnvKeys.has(safeKey)) {
        seenEnvKeys.add(safeKey);
        lines.push(`    ${safeKey}: ${yamlString(value)}`);
      }
    }
  }

  // 6. Volumes
  const volumeEntries: string[] = [];

  if (isCustom && customVolumes && customVolumes.length > 0) {
    for (const vol of customVolumes) {
      const hostP = vol.hostPath.trim();
      const contP = vol.containerPath.trim();
      if (hostP && contP && isSafeVolumeHostPath(hostP)) {
        const ro = vol.readOnly ? ':ro' : '';
        volumeEntries.push(`${hostP}:${contP}${ro}`);
        // Check if named volume
        if (!hostP.startsWith('/') && !hostP.startsWith('./') && !hostP.startsWith('~/') && !hostP.startsWith('.')) {
          namedVolumesUsed.add(hostP);
        }
      }
    }
  } else if (moduleDef && moduleDef.volumes.length > 0) {
    for (const vol of moduleDef.volumes) {
      let finalHostPath = vol.hostPath;
      if (advancedSettings.dataPath && typeof advancedSettings.dataPath === 'string' && (vol.label.toLowerCase().includes('data') || vol.label.toLowerCase().includes('files') || vol.label.toLowerCase().includes('library'))) {
        if (isSafeVolumeHostPath(advancedSettings.dataPath)) {
          finalHostPath = advancedSettings.dataPath;
        }
      }
      if (advancedSettings.mediaPath && typeof advancedSettings.mediaPath === 'string' && vol.label.toLowerCase().includes('media')) {
        if (isSafeVolumeHostPath(advancedSettings.mediaPath)) {
          finalHostPath = advancedSettings.mediaPath;
        }
      }
      volumeEntries.push(`${finalHostPath}:${vol.containerPath}`);
      if (!finalHostPath.startsWith('/') && !finalHostPath.startsWith('./') && !finalHostPath.startsWith('~/') && !finalHostPath.startsWith('.')) {
        namedVolumesUsed.add(finalHostPath);
      }
    }
  }

  if (volumeEntries.length > 0) {
    lines.push(`  volumes:`);
    for (const entry of volumeEntries) {
      lines.push(`    - ${entry}`);
    }
  }

  // 7. Devices (Hardware Acceleration)
  if (advancedSettings.hardwareAcceleration) {
    lines.push(`  devices:`);
    lines.push(`    - /dev/dri:/dev/dri`);
  }

  // 8. depends_on (from Canvas Edges: source -> target means source depends on target)
  const outgoingEdges = edges.filter((e) => e.source === node.id);
  const dependencyNames = new Set<string>();

  for (const edge of outgoingEdges) {
    const targetInfo = serviceMap.get(edge.target);
    if (targetInfo && !targetInfo.isHostInstall && targetInfo.serviceName !== serviceName) {
      dependencyNames.add(targetInfo.serviceName);
    }
  }

  // 9. Check if routed through a VPN Container (VPN Glue mode)
  const incomingEdges = edges.filter((e) => e.target === node.id);
  let vpnServiceName: string | null = null;
  for (const edge of incomingEdges) {
    const sourceNode = allNodes.find((n) => n.id === edge.source);
    if (
      sourceNode &&
      (sourceNode.data.moduleId === 'wireguard' ||
        sourceNode.data.moduleId === 'tailscale' ||
        sourceNode.data.moduleId === 'gluetun')
    ) {
      const sourceInfo = serviceMap.get(edge.source);
      if (sourceInfo && !sourceInfo.isHostInstall) {
        vpnServiceName = sourceInfo.serviceName;
        dependencyNames.add(sourceInfo.serviceName);
        break;
      }
    }
  }

  if (dependencyNames.size > 0) {
    lines.push(`  depends_on:`);
    for (const dep of Array.from(dependencyNames).sort()) {
      lines.push(`    - ${dep}`);
    }
  }

  // 10. Networks / Network Mode
  if (vpnServiceName && vpnServiceName !== serviceName) {
    lines.push(`  network_mode: "service:${vpnServiceName}"`);
  } else {
    const serviceNetworks = customNetworks && customNetworks.length > 0 ? customNetworks : ['xivizley_net'];
    lines.push(`  networks:`);
    for (const net of serviceNetworks) {
      const cleanNet = net.trim() || 'xivizley_net';
      networksUsed.add(cleanNet);
      lines.push(`    - ${cleanNet}`);
    }
  }

  return {
    block: lines.join('\n'),
    networks: networksUsed,
    namedVolumes: namedVolumesUsed,
  };
}

// ─── Bash Script Generator ───────────────────────────────────

export function generateBashScript(nodes: ArchitectNode[]): string {
  const moduleIds = nodes.map((n) => n.data.moduleId);
  const hasDebian = moduleIds.includes('debian');
  const hasCasaOS = moduleIds.includes('casaos');
  const hasDocker = moduleIds.includes('docker') || nodes.length > 0;

  const lines: string[] = [
    `#!/usr/bin/env bash`,
    `# ============================================================`,
    `# XIVIZLEY — Otomatik Kurulum Scripti`,
    `# XIVIZLEY Server Architect tarafından üretilmiştir.`,
    `# ⚠️  Çalıştırmadan önce değişkenleri kontrol edin!`,
    `# ============================================================`,
    `set -euo pipefail`,
    ``,
    `# ── Sistem Güncellemesi ──`,
    `echo "Sistem paketleri güncelleniyor..."`,
    `sudo apt-get update -y && sudo apt-get upgrade -y`,
    ``,
    `# ── Temel Bağımlılıklar ──`,
    `sudo apt-get install -y \\`,
    `  curl wget git ca-certificates gnupg lsb-release \\`,
    `  apt-transport-https software-properties-common`,
    ``,
  ];

  if (hasDocker && !hasCasaOS) {
    lines.push(
      `# ── Docker Engine (Resmi Kurulum) ──`,
      `echo "Docker Engine kuruluyor..."`,
      `curl -fsSL https://download.docker.com/linux/${hasDebian ? 'debian' : 'ubuntu'}/gpg \\`,
      `  | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg`,
      `echo "deb [arch=\$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] \\`,
      `  https://download.docker.com/linux/${hasDebian ? 'debian' : 'ubuntu'} \\`,
      `  \$(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null`,
      `sudo apt-get update -y`,
      `sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin`,
      `sudo usermod -aG docker \${USER}`,
      `echo "Docker kuruldu. Grup değişikliklerinin geçerli olması için oturumu kapatıp açın."`,
      ``,
    );
  }

  if (hasCasaOS) {
    lines.push(
      `# ── CasaOS (Docker dahil) ──`,
      `echo "CasaOS kuruluyor..."`,
      `curl -fsSL https://get.casaos.io | sudo bash`,
      ``,
    );
  }

  // AdGuard / Pi-hole: systemd-resolved'ı devre dışı bırak
  if (moduleIds.includes('adguard-home') || moduleIds.includes('pi-hole') || moduleIds.includes('pihole')) {
    lines.push(
      `# ── DNS Servisi: systemd-resolved devre dışı bırakılıyor (port 53 serbest kalacak) ──`,
      `echo "systemd-resolved devre dışı bırakılıyor (port 53 için gerekli)..."`,
      `sudo systemctl disable --now systemd-resolved || true`,
      `sudo rm -f /etc/resolv.conf`,
      `echo "nameserver 8.8.8.8" | sudo tee /etc/resolv.conf`,
      ``,
    );
  }

  // Volume klasörlerini oluştur
  const customPaths = new Set<string>();
  for (const node of nodes) {
    const advSettings = node.data.advancedSettings || {};
    if (advSettings.dataPath && typeof advSettings.dataPath === 'string' && advSettings.dataPath.startsWith('/')) {
      customPaths.add(advSettings.dataPath);
    }
    if (advSettings.mediaPath && typeof advSettings.mediaPath === 'string' && advSettings.mediaPath.startsWith('/')) {
      customPaths.add(advSettings.mediaPath);
    }
    if (node.data.customVolumes) {
      for (const v of node.data.customVolumes) {
        if (v.hostPath && v.hostPath.startsWith('/')) {
          customPaths.add(v.hostPath);
        }
      }
    }
  }

  if (customPaths.size > 0) {
    lines.push(
      `# ── Özel Klasör Yolları ──`,
      `echo "Özel volume klasörleri oluşturuluyor..."`
    );
    for (const path of customPaths) {
      lines.push(`sudo mkdir -p "${path}"`);
    }
    lines.push(``);
  }

  // Minecraft PaperMC plugin indirme
  const mcNodes = nodes.filter((n) => n.data.moduleId === 'minecraft-paperm');
  for (const mcNode of mcNodes) {
    const plugins = mcNode.data.selectedPlugins;
    if (plugins && plugins.length > 0) {
      lines.push(
        `# ── Minecraft PaperMC Eklentileri (${mcNode.data.label}) ──`,
        `echo "Minecraft eklentileri indiriliyor..."`,
        `mkdir -p ./minecraft/plugins`,
        ``,
      );

      for (const pluginId of plugins) {
        const plugin = MINECRAFT_PLUGINS.find((p) => p.id === pluginId);
        if (plugin) {
          lines.push(
            `# ${plugin.name}`,
            `echo "${plugin.name} indiriliyor..."`,
            `wget -q -O ./minecraft/plugins/${plugin.fileName} \\`,
            `  "${plugin.jarUrl}" || echo "⚠️  ${plugin.name} indirilemedi, manuel kontrol edin."`,
            ``,
          );
        }
      }
    }
  }

  // FiveM Plugins indirme
  const fivemNodes = nodes.filter((n) => n.data.moduleId === 'fivem');
  for (const fmNode of fivemNodes) {
    const plugins = fmNode.data.selectedPlugins;
    if (plugins && plugins.length > 0) {
      lines.push(
        `# ── FiveM Mod & Eklentileri (${fmNode.data.label}) ──`,
        `echo "FiveM mod ve eklentileri indiriliyor..."`,
        `command -v unzip &>/dev/null || ( sudo apt-get update -qq && sudo apt-get install -y -qq unzip curl &>/dev/null )`,
        `mkdir -p ./fivem/data/resources ./fivem/resources`,
        `touch ./fivem/data/server.cfg 2>/dev/null || true`,
        ``,
      );

      for (const pluginId of plugins) {
        const plugin = FIVEM_PLUGINS.find((p) => p.id === pluginId);
        if (plugin) {
          lines.push(
            `# ${plugin.name}`,
            `echo "${plugin.name} yükleniyor..."`,
            `rm -rf /tmp/fivem_dl /tmp/fivem_plug.zip`,
            `mkdir -p /tmp/fivem_dl`,
            `curl -sSL "${plugin.downloadUrl}" -o /tmp/fivem_plug.zip`,
            `unzip -q -o /tmp/fivem_plug.zip -d /tmp/fivem_dl`,
            `mkdir -p "./fivem/data/resources/${plugin.folderName}" "./fivem/resources/${plugin.folderName}"`,
            `MANIFEST_FILE="$(find /tmp/fivem_dl \\( -name "fxmanifest.lua" -o -name "__resource.lua" \\) 2>/dev/null | head -n1)"`,
            `if [[ -n "\${MANIFEST_FILE}" ]]; then`,
            `  MANIFEST_DIR="\$(dirname "\${MANIFEST_FILE}")"`,
            `  cp -rf "\${MANIFEST_DIR}/"* "./fivem/data/resources/${plugin.folderName}/" 2>/dev/null || true`,
            `  cp -rf "\${MANIFEST_DIR}/"* "./fivem/resources/${plugin.folderName}/" 2>/dev/null || true`,
            `else`,
            `  cp -rf /tmp/fivem_dl/* "./fivem/data/resources/${plugin.folderName}/" 2>/dev/null || true`,
            `  cp -rf /tmp/fivem_dl/* "./fivem/resources/${plugin.folderName}/" 2>/dev/null || true`,
            `fi`,
            `rm -rf /tmp/fivem_dl /tmp/fivem_plug.zip`,
            `grep -q "${plugin.ensureCommand}" ./fivem/data/server.cfg 2>/dev/null || echo -e "\n${plugin.ensureCommand}" >> ./fivem/data/server.cfg`,
          );

          if (plugin.id === 'vmenu') {
            lines.push(
              `# vMenu Permissions & Admin Bypass`,
              `if [[ -f "./fivem/data/resources/vMenu/config/permissions.cfg" ]]; then`,
              `  cp -f "./fivem/data/resources/vMenu/config/permissions.cfg" "./fivem/data/permissions.cfg" 2>/dev/null || true`,
              `fi`,
              `if [[ -f "./fivem/data/permissions.cfg" ]]; then`,
              `  grep -q 'add_ace builtin.everyone "vMenu.Everything" allow' ./fivem/data/permissions.cfg 2>/dev/null || \\`,
              `    echo -e '\nadd_ace builtin.everyone "vMenu.Everything" allow' >> ./fivem/data/permissions.cfg`,
              `fi`,
              `grep -q "exec permissions.cfg" ./fivem/data/server.cfg 2>/dev/null || \\`,
              `  sed -i '1s/^/exec permissions.cfg\\n/' ./fivem/data/server.cfg 2>/dev/null || \\`,
              `  echo -e 'exec permissions.cfg' >> ./fivem/data/server.cfg`,
            );
          }

          lines.push(
            `echo "✓ ${plugin.name} hazır!"`,
            ``,
          );
        }
      }
    }
  }

  lines.push(
    `# ── Stack Dağıtımı ──`,
    `echo "Docker Compose stack başlatılıyor..."`,
    `mkdir -p ~/xivizley && cd ~/xivizley`,
    `# Oluşturulan docker-compose.yml dosyasını bu klasöre kopyalayın, ardından:`,
    `docker compose up -d`,
    ``,
    `echo "✅  Kurulum tamamlandı! Servis durumunu kontrol etmek için: docker compose ps"`,
  );

  return lines.join('\n');
}

// ─── Main Compose Generator ──────────────────────────────────

/**
 * Generates both docker-compose.yml and a bash install script
 * from the current canvas nodes and edges state.
 *
 * This is a PURE function — zero side effects and zero network requests.
 */
export function generateCode(nodes: ArchitectNode[], edges: ArchitectEdge[] = []): GeneratedCode {
  const serviceMap = resolveServiceNames(nodes);
  const serviceBlocks: string[] = [];
  const allNetworks = new Set<string>();
  const allNamedVolumes = new Set<string>();

  for (const node of nodes) {
    const serviceInfo = serviceMap.get(node.id);
    if (!serviceInfo) continue;

    const result = generateSingleServiceBlock(node, serviceInfo, serviceMap, edges, nodes);
    if (result) {
      serviceBlocks.push(result.block);
      result.networks.forEach((n) => allNetworks.add(n));
      result.namedVolumes.forEach((v) => allNamedVolumes.add(v));
    }
  }

  const composeLines: string[] = [
    `# ============================================================`,
    `# docker-compose.yml — XIVIZLEY Server Architect`,
    `# ⚠️  Dağıtımdan önce ortam değişkenlerini ve portları kontrol edin!`,
    `# ============================================================`,
    ``,
    `services:`,
  ];

  if (serviceBlocks.length === 0) {
    composeLines.push(`  xivizley_placeholder:`);
    composeLines.push(`    image: alpine:latest`);
    composeLines.push(`    container_name: xivizley_placeholder`);
    composeLines.push(`    command: "echo XIVIZLEY Host Stack Ready"`);
  } else {
    for (const block of serviceBlocks) {
      composeLines.push(indent(block, 2));
      composeLines.push('');
    }
  }

  // Networks Section
  if (allNetworks.size > 0) {
    composeLines.push(`networks:`);
    for (const net of Array.from(allNetworks).sort()) {
      composeLines.push(`  ${net}:`);
      composeLines.push(`    driver: bridge`);
    }
  } else {
    composeLines.push(`networks:`);
    composeLines.push(`  xivizley_net:`);
    composeLines.push(`    driver: bridge`);
  }

  // Named Volumes Section
  if (allNamedVolumes.size > 0) {
    composeLines.push(``);
    composeLines.push(`volumes:`);
    for (const vol of Array.from(allNamedVolumes).sort()) {
      composeLines.push(`  ${vol}:`);
    }
  }

  return {
    dockerCompose: composeLines.join('\n'),
    bashInstall: generateBashScript(nodes),
  };
}

/**
 * Standalone Bash deploy script embedding docker-compose.yml
 * Uses the complete P3 VDS Smart Deployment Generator.
 */
export function generateStandaloneDeployScript(
  nodes: ArchitectNode[],
  edgesOrTitle?: ArchitectEdge[] | string,
  maybeTitle?: string
): string {
  const edges: ArchitectEdge[] = Array.isArray(edgesOrTitle) ? edgesOrTitle : [];
  const title: string = typeof edgesOrTitle === 'string' ? edgesOrTitle : (maybeTitle || 'XIVIZLEY Homelab');
  return generateVdsDeployScript(nodes, edges, { title });
}
