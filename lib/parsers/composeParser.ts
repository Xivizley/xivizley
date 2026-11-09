// ============================================================
// XIVIZLEY — Universal Reverse Engineering & Compose Parser
// lib/parsers/composeParser.ts
//
// Converts docker-compose.yml, docker run commands, or bash
// install scripts into 3-tier DIN EN 61082-1 visual canvas schematics.
// ============================================================

import * as yaml from 'js-yaml';
import { nanoid } from 'nanoid';
import { MODULE_CATALOG } from '@/lib/data/modules';
import type { CustomStackNodeInput } from '@/store/useArchitectStore';
import type { CustomPortDef, CustomVolumeDef } from '@/lib/types';

export type DetectedInputFormat = 'compose' | 'docker-run' | 'bash-script';

export interface PortConflictItem {
  port: number;
  services: string[];
}

export interface ParsedCompose {
  stackNodes: CustomStackNodeInput[];
  stackEdges: Array<{ source: string; target: string }>;
  errors: string[];
  detectedServicesCount: number;
  implicitDependenciesCount: number;
  detectedFormat?: DetectedInputFormat;
  ingressRoutesCount?: number;
  vpnTunnelsCount?: number;
  catalogMatchedCount?: number;
  customImagesCount?: number;
  portConflicts?: PortConflictItem[];
}

// Regular expressions to categorize services into 3 industrial tiers
const PROXY_REGEX = /^(?:.*\/)?(?:nginx|caddy|traefik|haproxy|envoy|cloudflare|tunnel|swag|npm|nginx-proxy-manager|gluetun|wireguard|tailscale|headscale|openvpn)(?::.*)?$/i;
const DB_CACHE_REGEX = /^(?:.*\/)?(?:postgres|postgresql|mysql|mariadb|redis|valkey|mongo|mongodb|couchdb|clickhouse|sqlite|minio|rabbitmq|kafka|elasticsearch|typesense|meilisearch|qdrant|weaviate|chroma|memcached)(?::.*)?$/i;

function determineServiceTier(serviceName: string, imageName: string, category?: string): 0 | 1 | 2 {
  const normName = serviceName.toLowerCase();
  const normImg = imageName.toLowerCase();

  // Tier 0: Ingress / Reverse Proxy / Network Tunnel (x: 100)
  if (
    category === 'reverse-proxy' ||
    category === 'proxy' ||
    category === 'tunnel' ||
    category === 'network' ||
    PROXY_REGEX.test(normName) ||
    PROXY_REGEX.test(normImg)
  ) {
    return 0;
  }

  // Tier 2: Database / Cache / Storage / Queue (x: 940)
  if (
    category === 'database' ||
    category === 'storage' ||
    DB_CACHE_REGEX.test(normName) ||
    DB_CACHE_REGEX.test(normImg)
  ) {
    return 2;
  }

  // Tier 1: Application / Backend / Core (x: 520)
  return 1;
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Extracts docker-compose YAML embedded in bash heredocs (e.g. cat << 'EOF' > docker-compose.yml)
 */
function extractComposeFromBash(script: string): string | null {
  const heredocRegex = /cat\s*<<-?\s*['"]?([A-Za-z0-9_-]+)['"]?\s*(?:>\s*[^;\n]+)?\r?\n([\s\S]*?)\r?\n\s*\1/i;
  const match = heredocRegex.exec(script);
  if (match && match[2] && (match[2].includes('services:') || match[2].includes('version:'))) {
    return match[2];
  }
  return null;
}

/**
 * Replaces ${VAR:-default} and ${VAR:default} interpolation with fallback defaults
 */
function interpolateEnvVariables(content: string): string {
  return content.replace(/\$\{([A-Za-z0-9_]+)(?::?-([^}]*))?\}/g, (_, varName, defaultVal) => {
    return defaultVal !== undefined ? defaultVal : `\${${varName}}`;
  });
}

/**
 * Parses single or multiple `docker run` / `podman run` commands into a normalized Compose service structure
 */
function parseDockerRunCommands(input: string): Record<string, any> | null {
  const normalized = input.replace(/\\\r?\n/g, ' ');
  const runRegex = /(?:^|[;&\n])\s*(?:sudo\s+)?(?:docker|podman)\s+run\s+([^;\n&]+)/gi;
  const matches: string[] = [];
  let m: RegExpExecArray | null;

  while ((m = runRegex.exec(normalized)) !== null) {
    if (m[1]) matches.push(m[1].trim());
  }

  if (matches.length === 0) return null;

  const services: Record<string, any> = {};

  matches.forEach((rawArgs, idx) => {
    const tokens: string[] = [];
    const tokenRegex = /[^\s"']+|"([^"]*)"|'([^']*)'/g;
    let t: RegExpExecArray | null;
    while ((t = tokenRegex.exec(rawArgs)) !== null) {
      tokens.push(t[1] ?? t[2] ?? t[0]);
    }

    let serviceName = '';
    let image = '';
    const ports: string[] = [];
    const environment: Record<string, string> = {};
    const volumes: string[] = [];
    const labels: string[] = [];
    let restart = 'unless-stopped';
    let network = '';
    let networkMode = '';
    const dependsOn: string[] = [];

    let i = 0;
    while (i < tokens.length) {
      const tok = tokens[i];
      if (!tok) {
        i++;
        continue;
      }

      if (
        tok === '-d' ||
        tok === '--detach' ||
        tok === '-it' ||
        tok === '-i' ||
        tok === '-t' ||
        tok === '--rm' ||
        tok === '--privileged' ||
        tok === '--init'
      ) {
        i++;
      } else if (tok === '--name' || tok === '--hostname') {
        serviceName = tokens[i + 1] ?? '';
        i += 2;
      } else if (tok.startsWith('--name=')) {
        serviceName = tok.slice(7);
        i++;
      } else if (tok === '-p' || tok === '--publish') {
        const nextTok = tokens[i + 1];
        if (nextTok) ports.push(nextTok);
        i += 2;
      } else if (tok.startsWith('-p=') || tok.startsWith('--publish=')) {
        ports.push(tok.split('=')[1] ?? '');
        i++;
      } else if (tok === '-v' || tok === '--volume') {
        const nextTok = tokens[i + 1];
        if (nextTok) volumes.push(nextTok);
        i += 2;
      } else if (tok.startsWith('-v=') || tok.startsWith('--volume=')) {
        volumes.push(tok.split('=')[1] ?? '');
        i++;
      } else if (tok === '-e' || tok === '--env') {
        const envVal = tokens[i + 1] ?? '';
        const eqIdx = envVal.indexOf('=');
        if (eqIdx !== -1) {
          environment[envVal.slice(0, eqIdx)] = envVal.slice(eqIdx + 1);
        } else if (envVal) {
          environment[envVal] = '';
        }
        i += 2;
      } else if (tok.startsWith('-e=') || tok.startsWith('--env=')) {
        const envVal = tok.split('=')[1] ?? '';
        const eqIdx = envVal.indexOf('=');
        if (eqIdx !== -1) {
          environment[envVal.slice(0, eqIdx)] = envVal.slice(eqIdx + 1);
        } else if (envVal) {
          environment[envVal] = '';
        }
        i++;
      } else if (tok === '--restart') {
        restart = tokens[i + 1] ?? 'unless-stopped';
        i += 2;
      } else if (tok.startsWith('--restart=')) {
        restart = tok.slice(10);
        i++;
      } else if (tok === '--network' || tok === '--net') {
        network = tokens[i + 1] ?? '';
        if (network.startsWith('container:') || network.startsWith('service:')) {
          networkMode = network;
        }
        i += 2;
      } else if (tok.startsWith('--network=') || tok.startsWith('--net=')) {
        network = tok.split('=')[1] ?? '';
        if (network.startsWith('container:') || network.startsWith('service:')) {
          networkMode = network;
        }
        i++;
      } else if (tok === '--link') {
        const nextTok = tokens[i + 1];
        if (nextTok) {
          const target = nextTok.split(':')[0];
          if (target) dependsOn.push(target);
        }
        i += 2;
      } else if (tok === '-l' || tok === '--label') {
        const nextTok = tokens[i + 1];
        if (nextTok) labels.push(nextTok);
        i += 2;
      } else if (tok.startsWith('-l=') || tok.startsWith('--label=')) {
        labels.push(tok.split('=')[1] ?? '');
        i++;
      } else if (!tok.startsWith('-')) {
        if (!image) {
          image = tok;
        }
        i++;
      } else {
        i++;
      }
    }

    if (!image && !serviceName) return;

    if (!serviceName) {
      const rawImg = (image.split(':')[0] || '').split('/').pop() || `service_${idx + 1}`;
      serviceName = rawImg.replace(/[^a-zA-Z0-9_-]/g, '_');
    }

    services[serviceName] = {
      image: image || 'alpine:latest',
      container_name: serviceName,
      ports: ports.length > 0 ? ports : undefined,
      environment: Object.keys(environment).length > 0 ? environment : undefined,
      volumes: volumes.length > 0 ? volumes : undefined,
      restart,
      network_mode: networkMode || undefined,
      networks: network && !networkMode ? [network] : undefined,
      labels: labels.length > 0 ? labels : undefined,
      depends_on: dependsOn.length > 0 ? dependsOn : undefined,
    };
  });

  return Object.keys(services).length > 0 ? services : null;
}

export function parseDockerComposeYaml(yamlContent: string): ParsedCompose {
  const errors: string[] = [];
  const stackNodes: CustomStackNodeInput[] = [];
  const stackEdges: Array<{ source: string; target: string }> = [];

  let detectedFormat: DetectedInputFormat = 'compose';
  let doc: any = null;

  // 1. Check for bash heredoc compose script
  const extractedCompose = extractComposeFromBash(yamlContent);
  const contentToParse = extractedCompose || yamlContent;
  if (extractedCompose) {
    detectedFormat = 'bash-script';
  }

  // 2. Check for docker run CLI commands
  const hasDockerRun = /(?:^|[;&\n])\s*(?:sudo\s+)?(?:docker|podman)\s+run\s+/i.test(contentToParse);

  if (hasDockerRun && !contentToParse.includes('services:')) {
    const runServices = parseDockerRunCommands(contentToParse);
    if (runServices) {
      doc = { services: runServices };
      detectedFormat = 'docker-run';
    }
  }

  // 3. Fallback to YAML parse with environment interpolation
  if (!doc) {
    const interpolated = interpolateEnvVariables(contentToParse);
    try {
      doc = yaml.load(interpolated);
    } catch (err: any) {
      // If YAML load failed, check if there was a docker run command embedded in error text
      const fallbackRun = parseDockerRunCommands(contentToParse);
      if (fallbackRun) {
        doc = { services: fallbackRun };
        detectedFormat = 'docker-run';
      } else {
        return {
          stackNodes: [],
          stackEdges: [],
          errors: [`Geçersiz YAML formatı: ${err.message}`],
          detectedServicesCount: 0,
          implicitDependenciesCount: 0,
        };
      }
    }
  }

  if (!doc || typeof doc !== 'object' || !doc.services) {
    return {
      stackNodes: [],
      stackEdges: [],
      errors: ['YAML dosyasında "services:" anahtarı bulunamadı.'],
      detectedServicesCount: 0,
      implicitDependenciesCount: 0,
    };
  }

  const serviceKeys = Object.keys(doc.services);
  const serviceToNodeId: Record<string, string> = {};
  const serviceEnvValues: Record<string, string[]> = {};
  const serviceExplicitDeps: Record<string, string[]> = {};
  const serviceHasIngressLabels: Record<string, boolean> = {};
  const serviceVpnTargets: Record<string, string> = {};

  // Track row counts per tier for clean 3-column DIN EN 61082-1 positioning
  const rowCountPerTier: [number, number, number] = [0, 0, 0];
  const TIER_X_COORDS = [100, 520, 940] as const; // Ingress (100) -> App (520) -> DB/Cache (940)
  const ROW_HEIGHT = 240;

  let catalogMatchedCount = 0;
  let customImagesCount = 0;

  // Track host ports to detect port collisions across services
  const hostPortUsage: Record<number, string[]> = {};

  for (const serviceName of serviceKeys) {
    const srv = doc.services[serviceName];
    if (!srv || typeof srv !== 'object') continue;

    const nodeId = nanoid();
    serviceToNodeId[serviceName] = nodeId;

    const imageStr = String(srv.image || '');
    const cleanImage = (imageStr.split(':')[0] ?? '').toLowerCase();

    // Match with MODULE_CATALOG
    const matchedModule = MODULE_CATALOG.find((m) => {
      const modImg = m.dockerImage?.toLowerCase();
      if (!modImg) return false;
      return (
        cleanImage === modImg ||
        cleanImage.endsWith(`/${modImg}`) ||
        modImg.endsWith(`/${cleanImage}`) ||
        m.id.toLowerCase() === serviceName.toLowerCase()
      );
    });

    if (matchedModule) {
      catalogMatchedCount++;
    } else {
      customImagesCount++;
    }

    const tier = determineServiceTier(serviceName, cleanImage, matchedModule?.category);
    const posX = TIER_X_COORDS[tier];
    const posY = 100 + rowCountPerTier[tier] * ROW_HEIGHT;
    rowCountPerTier[tier]++;

    const portOverrides: Record<number, number> = {};
    const customPorts: CustomPortDef[] = [];

    if (Array.isArray(srv.ports)) {
      for (const p of srv.ports) {
        const pStr = String(p);
        const parts = pStr.split(':');
        if (parts.length >= 2) {
          const hostPart = parts[parts.length - 2] ?? '';
          const containerPart = parts[parts.length - 1] ?? '';
          const hostPort = parseInt(hostPart, 10);
          const proto: 'tcp' | 'udp' = containerPart.includes('/udp') ? 'udp' : 'tcp';
          const containerPort = parseInt(containerPart.replace('/tcp', '').replace('/udp', ''), 10);

          if (!isNaN(hostPort) && !isNaN(containerPort)) {
            if (matchedModule) {
              portOverrides[containerPort] = hostPort;
            }
            customPorts.push({ host: hostPort, container: containerPort, protocol: proto });

            // Collect host port collision data
            if (!hostPortUsage[hostPort]) hostPortUsage[hostPort] = [];
            if (!hostPortUsage[hostPort].includes(serviceName)) {
              hostPortUsage[hostPort].push(serviceName);
            }
          }
        }
      }
    }

    // Environment variables extraction & collection of values for implicit dependency scanning
    const envOverrides: Record<string, string> = {};
    const rawValuesList: string[] = [];

    if (Array.isArray(srv.environment)) {
      for (const e of srv.environment) {
        const strVal = String(e);
        const eqIdx = strVal.indexOf('=');
        if (eqIdx !== -1) {
          const k = strVal.substring(0, eqIdx);
          const v = strVal.substring(eqIdx + 1);
          envOverrides[k] = v;
          rawValuesList.push(v);
        }
      }
    } else if (srv.environment && typeof srv.environment === 'object') {
      for (const [k, v] of Object.entries(srv.environment)) {
        const valStr = String(v ?? '');
        envOverrides[k] = valStr;
        rawValuesList.push(valStr);
      }
    }
    serviceEnvValues[serviceName] = rawValuesList;

    // Explicit dependencies (depends_on + links)
    const explicitDeps: string[] = [];
    if (srv.depends_on) {
      const deps = Array.isArray(srv.depends_on)
        ? srv.depends_on
        : typeof srv.depends_on === 'object'
        ? Object.keys(srv.depends_on)
        : [String(srv.depends_on)];
      for (const d of deps) explicitDeps.push(String(d));
    }
    if (Array.isArray(srv.links)) {
      for (const l of srv.links) {
        const linkTarget = String(l).split(':')[0];
        if (linkTarget) explicitDeps.push(linkTarget);
      }
    }
    serviceExplicitDeps[serviceName] = explicitDeps;

    // Ingress & Router labels scanning (Traefik, NPM, Caddy, Coolify)
    let hasIngress = false;
    const rawLabels: string[] = [];
    if (Array.isArray(srv.labels)) {
      for (const l of srv.labels) rawLabels.push(String(l));
    } else if (srv.labels && typeof srv.labels === 'object') {
      for (const [k, v] of Object.entries(srv.labels)) {
        rawLabels.push(`${k}=${v}`);
      }
    }
    for (const l of rawLabels) {
      if (/traefik\.http\.routers|traefik\.enable|caddy|virtual\.host|coolify/i.test(l)) {
        hasIngress = true;
        break;
      }
    }
    serviceHasIngressLabels[serviceName] = hasIngress;

    // VPN Tunnel detection (network_mode: service:gluetun)
    const netMode = String(srv.network_mode || '');
    if (netMode.startsWith('service:')) {
      serviceVpnTargets[serviceName] = netMode.replace('service:', '').trim();
    } else if (netMode.startsWith('container:')) {
      serviceVpnTargets[serviceName] = netMode.replace('container:', '').trim();
    }

    // Volumes
    const customVolumes: CustomVolumeDef[] = [];
    if (Array.isArray(srv.volumes)) {
      for (const v of srv.volumes) {
        const vStr = String(v);
        const parts = vStr.split(':');
        if (parts.length >= 2 && parts[0] && parts[1]) {
          customVolumes.push({ hostPath: parts[0], containerPath: parts[1] });
        }
      }
    }

    if (matchedModule) {
      stackNodes.push({
        id: nodeId,
        moduleId: matchedModule.id,
        x: posX,
        y: posY,
        label: srv.container_name || serviceName,
        portOverrides,
        envOverrides,
        isCustom: false,
      });
    } else {
      stackNodes.push({
        id: nodeId,
        moduleId: 'custom',
        x: posX,
        y: posY,
        label: srv.container_name || serviceName,
        portOverrides,
        envOverrides,
        isCustom: true,
        customImage: imageStr || 'alpine:latest',
        customContainerName: srv.container_name || serviceName,
        customPorts,
        customVolumes,
        customEnv: envOverrides,
        customRestart: srv.restart || 'unless-stopped',
      });
    }
  }

  // ── Edge Creation: Explicit, Implicit, Ingress Routes & VPN Tunnels ──
  const createdEdgeSet = new Set<string>();
  let implicitDependenciesCount = 0;
  let ingressRoutesCount = 0;
  let vpnTunnelsCount = 0;

  // Sort candidate services by length descending to prevent substring collisions
  const sortedCandidateServices = [...serviceKeys].sort((a, b) => b.length - a.length);

  for (const serviceName of serviceKeys) {
    const fromNodeId = serviceToNodeId[serviceName];
    if (!fromNodeId) continue;

    const fromNode = stackNodes.find((n) => n.id === fromNodeId);
    if (!fromNode) continue;

    // 1. Explicit dependencies (depends_on and links)
    const explicitList = serviceExplicitDeps[serviceName] || [];
    for (const dep of explicitList) {
      const toNodeId = serviceToNodeId[dep];
      if (toNodeId && toNodeId !== fromNodeId) {
        const toNode = stackNodes.find((n) => n.id === toNodeId);
        const isFromLeft = fromNode.x <= (toNode?.x ?? fromNode.x);
        const source = isFromLeft ? fromNodeId : toNodeId;
        const target = isFromLeft ? toNodeId : fromNodeId;
        const edgeKey = `${source}->${target}`;

        if (!createdEdgeSet.has(edgeKey)) {
          createdEdgeSet.add(edgeKey);
          stackEdges.push({ source, target });
        }
      }
    }

    // 2. Implicit dependencies (Host / URL references inside environment values)
    const envValues = serviceEnvValues[serviceName] || [];
    for (const candidate of sortedCandidateServices) {
      if (candidate === serviceName) continue;

      const candidateNodeId = serviceToNodeId[candidate];
      if (!candidateNodeId) continue;

      const escapedCand = escapeRegex(candidate);
      const hostPattern = new RegExp(`(?:^|[://@\\s])${escapedCand}(?::[0-9]+|/|[?#\\s]|$)`, 'i');

      let hasMatch = false;
      for (const val of envValues) {
        if (hostPattern.test(val)) {
          hasMatch = true;
          break;
        }
      }

      if (hasMatch) {
        const toNode = stackNodes.find((n) => n.id === candidateNodeId);
        const isFromLeft = fromNode.x <= (toNode?.x ?? fromNode.x);
        const source = isFromLeft ? fromNodeId : candidateNodeId;
        const target = isFromLeft ? candidateNodeId : fromNodeId;
        const edgeKey = `${source}->${target}`;

        if (!createdEdgeSet.has(edgeKey)) {
          createdEdgeSet.add(edgeKey);
          stackEdges.push({ source, target });
          implicitDependenciesCount++;
        }
      }
    }

    // 3. Ingress Proxy Route Edges (Traefik / NPM / Caddy -> Application)
    if (serviceHasIngressLabels[serviceName]) {
      const proxyService = serviceKeys.find((s) => {
        if (s === serviceName) return false;
        const sNodeId = serviceToNodeId[s];
        const sNode = stackNodes.find((n) => n.id === sNodeId);
        return sNode && sNode.x === TIER_X_COORDS[0]; // Tier 0 Ingress
      });

      if (proxyService) {
        const proxyNodeId = serviceToNodeId[proxyService];
        if (proxyNodeId) {
          const edgeKey = `${proxyNodeId}->${fromNodeId}`;
          if (!createdEdgeSet.has(edgeKey)) {
            createdEdgeSet.add(edgeKey);
            stackEdges.push({ source: proxyNodeId, target: fromNodeId });
            ingressRoutesCount++;
          }
        }
      }
    }

    // 4. VPN Tunnel Edges (Gluetun / Wireguard -> App Node)
    const vpnTarget = serviceVpnTargets[serviceName];
    if (vpnTarget && serviceToNodeId[vpnTarget]) {
      const vpnNodeId = serviceToNodeId[vpnTarget];
      const edgeKey = `${vpnNodeId}->${fromNodeId}`;
      if (!createdEdgeSet.has(edgeKey)) {
        createdEdgeSet.add(edgeKey);
        stackEdges.push({ source: vpnNodeId, target: fromNodeId });
        vpnTunnelsCount++;
      }
    }
  }

  // Calculate port conflicts
  const portConflicts: PortConflictItem[] = [];
  for (const [portStr, srvList] of Object.entries(hostPortUsage)) {
    if (srvList.length > 1) {
      portConflicts.push({ port: parseInt(portStr, 10), services: srvList });
    }
  }

  return {
    stackNodes,
    stackEdges,
    errors,
    detectedServicesCount: stackNodes.length,
    implicitDependenciesCount,
    detectedFormat,
    ingressRoutesCount,
    vpnTunnelsCount,
    catalogMatchedCount,
    customImagesCount,
    portConflicts,
  };
}
