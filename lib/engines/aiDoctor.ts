import { nanoid } from 'nanoid';
import { MODULE_CATALOG, PORT_ALTERNATIVES } from '@/lib/data/modules';
import type { ArchitectNode, ArchitectEdge } from '@/lib/types';
import type { CustomStackNodeInput } from '@/store/useArchitectStore';

interface DoctorReport {
  stackNodes: CustomStackNodeInput[];
  stackEdges: Array<{ source: string; target: string }>;
  actionsTaken: string[];
}

export function runAIDoctor(
  currentNodes: ArchitectNode[],
  currentEdges: ArchitectEdge[],
  lang: 'tr' | 'en' | 'pt' = 'tr'
): DoctorReport {
  const actionsTaken: string[] = [];
  let nodes: ArchitectNode[] = JSON.parse(JSON.stringify(currentNodes));
  let edges: ArchitectEdge[] = JSON.parse(JSON.stringify(currentEdges));

  const isTr = lang === 'tr';
  const isPt = lang === 'pt';

  if (nodes.length === 0) {
    return {
      stackNodes: [],
      stackEdges: [],
      actionsTaken: [
        isTr
          ? 'Tuval boş olduğu için optimize edilecek servis bulunamadı.'
          : isPt
          ? 'A tela está vazia, nenhum serviço encontrado para otimização.'
          : 'Canvas is empty. No services found to optimize.',
      ],
    };
  }

  const moduleIdsOnCanvas = new Set(nodes.map((n) => n.data.moduleId));

  // 1. Dependency Auto-Addition
  // Check Nextcloud -> Add PostgreSQL if missing
  if (moduleIdsOnCanvas.has('nextcloud') && !moduleIdsOnCanvas.has('postgresql') && !moduleIdsOnCanvas.has('mariadb')) {
    const pgDef = MODULE_CATALOG.find((m) => m.id === 'postgresql');
    if (pgDef) {
      const pgId = nanoid();
      nodes.push({
        id: pgId,
        type: 'moduleNode',
        position: { x: 750, y: 150 },
        data: {
          moduleId: 'postgresql',
          label: 'PostgreSQL DB',
          portOverrides: { 5432: 5432 },
          envOverrides: { POSTGRES_DB: 'nextcloud', POSTGRES_USER: 'nextcloud', POSTGRES_PASSWORD: 'secure_password_123' },
          conflicts: [],
          hasConflict: false,
          selectedPlugins: [],
          advancedSettings: {},
          isCustom: false,
        },
      });
      const nextcloudNode = nodes.find((n) => n.data.moduleId === 'nextcloud');
      if (nextcloudNode) {
        edges.push({
          id: `edge-${nextcloudNode.id}-${pgId}`,
          source: pgId,
          target: nextcloudNode.id,
          animated: true,
          style: { stroke: '#336791', strokeWidth: 2 },
        });
      }
      actionsTaken.push(
        isTr
          ? 'Nextcloud için PostgreSQL veritabanı eklendi ve bağlandı.'
          : isPt
          ? 'Banco de dados PostgreSQL adicionado e conectado para o Nextcloud.'
          : 'PostgreSQL database added and connected for Nextcloud.'
      );
    }
  }

  // Check Immich -> Add Redis / Postgres
  if (moduleIdsOnCanvas.has('immich') && !moduleIdsOnCanvas.has('redis')) {
    const redisDef = MODULE_CATALOG.find((m) => m.id === 'redis');
    if (redisDef) {
      const redisId = nanoid();
      nodes.push({
        id: redisId,
        type: 'moduleNode',
        position: { x: 750, y: 350 },
        data: {
          moduleId: 'redis',
          label: 'Redis Cache',
          portOverrides: { 6379: 6379 },
          envOverrides: {},
          conflicts: [],
          hasConflict: false,
          selectedPlugins: [],
          advancedSettings: {},
          isCustom: false,
        },
      });
      const immichNode = nodes.find((n) => n.data.moduleId === 'immich');
      if (immichNode) {
        edges.push({
          id: `edge-${immichNode.id}-${redisId}`,
          source: redisId,
          target: immichNode.id,
          animated: true,
          style: { stroke: '#DC382D', strokeWidth: 2 },
        });
      }
      actionsTaken.push(
        isTr
          ? 'Immich mikroservisleri için Redis önbellek sunucusu eklendi.'
          : isPt
          ? 'Servidor de cache Redis adicionado para os microsserviços do Immich.'
          : 'Redis cache server added for Immich microservices.'
      );
    }
  }

  // 2. Resolve Port Collisions
  const usedPorts = new Map<number, string>();
  for (const node of nodes) {
    const modDef = MODULE_CATALOG.find((m) => m.id === node.data.moduleId);
    if (!modDef) continue;

    for (const portDef of modDef.ports) {
      const hostPort = node.data.portOverrides[portDef.internal] ?? portDef.default;
      if (usedPorts.has(hostPort)) {
        // Collision!
        const existingNodeLabel = usedPorts.get(hostPort);
        const alts = PORT_ALTERNATIVES[hostPort] || [hostPort + 1, hostPort + 10, hostPort + 100];
        const newPort = alts.find((p) => !usedPorts.has(p)) || (hostPort + 10);

        node.data.portOverrides[portDef.internal] = newPort;
        usedPorts.set(newPort, node.data.label);
        actionsTaken.push(
          isTr
            ? `Port ${hostPort} çakışması tespit edildi (${existingNodeLabel} & ${node.data.label}) -> ${node.data.label} için Port ${newPort} olarak otomatik düzeltildi.`
            : isPt
            ? `Conflito de porta ${hostPort} detectado (${existingNodeLabel} & ${node.data.label}) -> Corrigido automaticamente para a porta ${newPort} em ${node.data.label}.`
            : `Port ${hostPort} conflict detected (${existingNodeLabel} & ${node.data.label}) -> Automatically resolved to port ${newPort} for ${node.data.label}.`
        );
      } else {
        usedPorts.set(hostPort, node.data.label);
      }
    }
  }

  if (actionsTaken.length === 0) {
    actionsTaken.push(
      isTr
        ? 'Mimarınız mükemmel durumda! Herhangi bir çakışma veya eksik bağımlılık tespit edilmedi.'
        : isPt
        ? 'Sua arquitetura está excelente! Nenhum conflito ou dependência ausente encontrada.'
        : 'Your architecture looks great! No conflicts or missing dependencies detected.'
    );
  }

  const stackNodes: CustomStackNodeInput[] = nodes.map((n) => ({
    id: n.id,
    moduleId: n.data.moduleId,
    x: n.position.x,
    y: n.position.y,
    label: n.data.label,
    portOverrides: n.data.portOverrides,
    envOverrides: n.data.envOverrides,
    advancedSettings: n.data.advancedSettings,
    selectedPlugins: n.data.selectedPlugins,
    isCustom: n.data.isCustom,
    customImage: n.data.customImage,
    customContainerName: n.data.customContainerName,
    customPorts: n.data.customPorts,
    customVolumes: n.data.customVolumes,
    customEnv: n.data.customEnv,
    customRestart: n.data.customRestart,
  }));

  const stackEdges = edges.map((e) => ({
    source: e.source,
    target: e.target,
  }));

  return {
    stackNodes,
    stackEdges,
    actionsTaken,
  };
}
