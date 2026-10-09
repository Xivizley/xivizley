import * as yaml from 'js-yaml';
import { nanoid } from 'nanoid';
import { MODULE_CATALOG } from '@/lib/data/modules';
import type { CustomStackNodeInput } from '@/store/useArchitectStore';
import type { CustomPortDef, CustomVolumeDef } from '@/lib/types';

interface ParsedCompose {
  stackNodes: CustomStackNodeInput[];
  stackEdges: Array<{ source: string; target: string }>;
  errors: string[];
}

export function parseDockerComposeYaml(yamlContent: string): ParsedCompose {
  const errors: string[] = [];
  const stackNodes: CustomStackNodeInput[] = [];
  const stackEdges: Array<{ source: string; target: string }> = [];

  let doc: any;
  try {
    doc = yaml.load(yamlContent);
  } catch (err: any) {
    return {
      stackNodes: [],
      stackEdges: [],
      errors: [`Geçersiz YAML formatı: ${err.message}`],
    };
  }

  if (!doc || typeof doc !== 'object' || !doc.services) {
    return {
      stackNodes: [],
      stackEdges: [],
      errors: ['YAML dosyasında "services:" anahtarı bulunamadı.'],
    };
  }

  const serviceKeys = Object.keys(doc.services);
  const serviceToNodeId: Record<string, string> = {};

  let col = 0;
  let row = 0;
  const COL_WIDTH = 260;
  const ROW_HEIGHT = 200;
  const MAX_PER_ROW = 3;

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
      return cleanImage === modImg || cleanImage.endsWith(`/${modImg}`) || modImg.endsWith(`/${cleanImage}`);
    });

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
          }
        }
      }
    }

    // Environment variables
    const envOverrides: Record<string, string> = {};

    if (Array.isArray(srv.environment)) {
      for (const e of srv.environment) {
        const [k, ...rest] = String(e).split('=');
        if (k) {
          const v = rest.join('=');
          envOverrides[k] = v;
        }
      }
    } else if (srv.environment && typeof srv.environment === 'object') {
      for (const [k, v] of Object.entries(srv.environment)) {
        envOverrides[k] = String(v ?? '');
      }
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

    const posX = 100 + col * COL_WIDTH;
    const posY = 100 + row * ROW_HEIGHT;

    col++;
    if (col >= MAX_PER_ROW) {
      col = 0;
      row++;
    }

    if (matchedModule) {
      stackNodes.push({
        id: nodeId,
        moduleId: matchedModule.id,
        x: posX,
        y: posY,
        label: srv.container_name || matchedModule.name,
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

  // Parse depends_on to create edges
  for (const serviceName of serviceKeys) {
    const srv = doc.services[serviceName];
    const sourceNodeId = serviceToNodeId[serviceName];
    if (!sourceNodeId || !srv) continue;

    if (srv.depends_on) {
      const deps = Array.isArray(srv.depends_on)
        ? srv.depends_on
        : typeof srv.depends_on === 'object'
        ? Object.keys(srv.depends_on)
        : [String(srv.depends_on)];

      for (const dep of deps) {
        const targetNodeId = serviceToNodeId[dep];
        if (targetNodeId && targetNodeId !== sourceNodeId) {
          stackEdges.push({
            source: targetNodeId,
            target: sourceNodeId,
          });
        }
      }
    }
  }

  return { stackNodes, stackEdges, errors };
}
