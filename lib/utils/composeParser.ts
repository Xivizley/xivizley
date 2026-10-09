import jsyaml from 'js-yaml';
import { nanoid } from 'nanoid';
import { MODULE_CATALOG } from '@/lib/data/modules';
import type { ModuleNodeData } from '@/lib/types';
import type { Node, Edge } from 'reactflow';

export interface ParseResult {
  nodes: Node<ModuleNodeData>[];
  edges: Edge[];
  detectedCount: number;
  unmatchedCount: number;
}

export function parseComposeToCanvas(yamlText: string): ParseResult {
  let doc: any;
  try {
    doc = jsyaml.load(yamlText);
  } catch (err: any) {
    throw new Error('YAML formatı hatalı: ' + err.message);
  }

  if (!doc || typeof doc !== 'object') {
    throw new Error('Geçerli bir docker-compose.yml yapısı bulunamadı.');
  }

  const services = doc.services || doc;
  if (!services || typeof services !== 'object') {
    throw new Error("YAML içinde 'services' bölümü bulunamadı.");
  }

  const serviceKeys = Object.keys(services);
  const nodes: Node<ModuleNodeData>[] = [];
  const edges: Edge[] = [];
  const serviceIdMap: Record<string, string> = {};

  let detectedCount = 0;
  let unmatchedCount = 0;

  const START_X = 100;
  const START_Y = 120;
  const COL_GAP = 280;
  const ROW_GAP = 240;
  const COLS = Math.ceil(Math.sqrt(serviceKeys.length)) || 3;

  serviceKeys.forEach((key, index) => {
    const s = services[key];
    const image = s.image || '';
    const imageName = image.split(':')[0].toLowerCase();

    const matchedModule = MODULE_CATALOG.find((m) => {
      const modImg = m.dockerImage?.toLowerCase() || '';
      return (
        m.id.toLowerCase() === key.toLowerCase() ||
        (modImg && (modImg === imageName || modImg.includes(key.toLowerCase()) || imageName.includes(m.id.toLowerCase())))
      );
    });

    const nodeId = `node_${nanoid(6)}`;
    serviceIdMap[key] = nodeId;

    const col = index % COLS;
    const row = Math.floor(index / COLS);
    const x = START_X + col * COL_GAP;
    const y = START_Y + row * ROW_GAP;

    const portOverrides: Record<number, number> = {};
    if (Array.isArray(s.ports)) {
      s.ports.forEach((p: any) => {
        const portStr = String(p || '');
        const parts = portStr.split(':');
        if (parts.length === 2 && parts[0] && parts[1]) {
          const hostPort = parseInt(parts[0], 10);
          const containerPort = parseInt(parts[1].split('/')[0] || '', 10);
          if (!isNaN(hostPort) && !isNaN(containerPort)) {
            portOverrides[containerPort] = hostPort;
          }
        }
      });
    }

    const envOverrides: Record<string, string> = {};
    if (Array.isArray(s.environment)) {
      s.environment.forEach((env: any) => {
        const [k, ...v] = String(env).split('=');
        if (k) envOverrides[k.trim()] = v.join('=').trim();
      });
    } else if (s.environment && typeof s.environment === 'object') {
      Object.entries(s.environment).forEach(([k, v]) => {
        envOverrides[k] = String(v);
      });
    }

    if (matchedModule) {
      detectedCount++;
      nodes.push({
        id: nodeId,
        type: 'moduleNode',
        position: { x, y },
        data: {
          moduleId: matchedModule.id,
          label: s.container_name || matchedModule.name || key,
          portOverrides,
          envOverrides,
          selectedPlugins: [],
          advancedSettings: {},
          hasConflict: false,
          conflicts: [],
        },
      });
    } else {
      unmatchedCount++;
      nodes.push({
        id: nodeId,
        type: 'moduleNode',
        position: { x, y },
        data: {
          moduleId: 'custom',
          label: s.container_name || key,
          isCustom: true,
          customImage: image || 'custom:latest',
          customContainerName: s.container_name || key,
          portOverrides,
          envOverrides,
          selectedPlugins: [],
          advancedSettings: {},
          hasConflict: false,
          conflicts: [],
        },
      });
    }
  });

  serviceKeys.forEach((key) => {
    const s = services[key];
    const sourceNodeId = serviceIdMap[key];
    if (!sourceNodeId) return;

    const deps = Array.isArray(s.depends_on)
      ? s.depends_on
      : (s.depends_on && typeof s.depends_on === 'object')
      ? Object.keys(s.depends_on)
      : [];

    deps.forEach((dep: string) => {
      const targetNodeId = serviceIdMap[dep];
      if (targetNodeId) {
        edges.push({
          id: `edge_${nanoid(6)}`,
          source: targetNodeId,
          target: sourceNodeId,
          animated: true,
          style: { stroke: '#8B5CF6', strokeWidth: 2 },
        });
      }
    });
  });

  return { nodes, edges, detectedCount, unmatchedCount };
}
