// ============================================================
// XIVIZLEY — Zustand Architecture Store (Production Grade with Undo/Redo & History)
// store/useArchitectStore.ts
//
// Client-side ONLY. All port conflict detection, code generation,
// undo/redo history, and canvas operations happen in this store.
// ============================================================

'use client';

import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';
import {
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type NodeChange,
  type EdgeChange,
  type Connection,
} from 'reactflow';
import { nanoid } from 'nanoid';
import { detectConflicts, nodeHasConflict, getNodeConflicts } from '@/lib/engines/conflictDetector';
import { MODULE_CATALOG } from '@/lib/data/modules';
import { PREDEFINED_TEMPLATES, STACK_TEMPLATES } from '@/lib/data/templates';
import { toServiceName } from '@/lib/generators/composeGenerator';
import type {
  ArchitectNode,
  ArchitectEdge,
  ConflictMap,
  CustomPortDef,
  CustomVolumeDef,
  ModuleNodeData,
} from '@/lib/types';

// ─── Custom Stack Input Definition ───────────────────────────

export interface CustomStackNodeInput {
  id: string;
  moduleId: string;
  x: number;
  y: number;
  label?: string | undefined;
  portOverrides?: Record<number, number> | undefined;
  envOverrides?: Record<string, string> | undefined;
  advancedSettings?: Record<string, unknown> | undefined;
  selectedPlugins?: string[] | undefined;
  isCustom?: boolean | undefined;
  customImage?: string | undefined;
  customContainerName?: string | undefined;
  customPorts?: CustomPortDef[] | undefined;
  customVolumes?: CustomVolumeDef[] | undefined;
  customEnv?: Record<string, string> | undefined;
  customRestart?: string | undefined;
  customNetworks?: string[] | undefined;
}

export interface HistorySnapshot {
  nodes: ArchitectNode[];
  edges: ArchitectEdge[];
}

// ─── Store Shape ─────────────────────────────────────────────

interface ArchitectState {
  // Canvas State
  nodes: ArchitectNode[];
  edges: ArchitectEdge[];

  // Conflict State (derived — recomputed on every node change)
  conflictMap: ConflictMap;

  // History / Undo / Redo
  past: HistorySnapshot[];
  future: HistorySnapshot[];

  // Grid & Snap State
  snapToGrid: boolean;

  // UI State
  selectedNodeId: string | null;
  isPanelOpen: boolean;

  // ── History Actions ──
  recordSnapshot: () => void;
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;

  // ── ReactFlow Handlers ──
  onNodesChange: (changes: NodeChange[]) => void;
  onEdgesChange: (changes: EdgeChange[]) => void;
  onConnect: (connection: Connection) => void;
  onNodeDragStart: () => void;

  // ── Module Actions ──
  addModule: (moduleId: string, position?: { x: number; y: number }) => void;
  addCustomContainer: (container: {
    label: string;
    image: string;
    ports?: CustomPortDef[];
    volumes?: CustomVolumeDef[];
    env?: Record<string, string>;
    restart?: string;
    networks?: string[];
    position?: { x: number; y: number };
  }) => void;
  duplicateNode: (nodeId: string) => void;
  duplicateSelected: () => void;
  removeNode: (nodeId: string) => void;
  removeNodes: (nodeIds: string[]) => void;
  deleteSelected: () => void;
  updateNodeLabel: (nodeId: string, label: string) => void;
  updatePortOverride: (nodeId: string, internalPort: number, newHostPort: number) => void;
  updateEnvOverride: (nodeId: string, key: string, value: string) => void;
  updateAdvancedSetting: (nodeId: string, key: string, value: unknown) => void;
  updateCustomContainer: (nodeId: string, updates: Partial<ModuleNodeData>) => void;
  togglePlugin: (nodeId: string, pluginId: string) => void;
  setNodePlugins: (nodeId: string, pluginIds: string[]) => void;
  clearCanvas: () => void;

  // ── Selection & Settings ──
  selectNode: (nodeId: string | null) => void;
  togglePanel: () => void;
  toggleSnapToGrid: () => void;
  setSnapToGrid: (snap: boolean) => void;
  autoLayout: () => void;

  // ── Templates & AI ──
  loadTemplate: (templateId: string) => void;
  loadCustomStack: (
    nodes: CustomStackNodeInput[],
    edges?: Array<{ source: string; target: string }>
  ) => void;
  mergeCustomStack: (
    nodes: CustomStackNodeInput[],
    edges?: Array<{ source: string; target: string }>
  ) => void;

  // ── Persistence ──
  loadFromJson: (json: string) => void;
  exportToJson: () => string;
}

// ─── Helpers ─────────────────────────────────────────────────

function defaultPosition(index: number): { x: number; y: number } {
  const GRID = 240;
  const cols = 4;
  const col = index % cols;
  const row = Math.floor(index / cols);
  return {
    x: 60 + col * GRID,
    y: 60 + row * GRID,
  };
}

function cloneSnapshot(nodes: ArchitectNode[], edges: ArchitectEdge[]): HistorySnapshot {
  return {
    nodes: JSON.parse(JSON.stringify(nodes)),
    edges: JSON.parse(JSON.stringify(edges)),
  };
}

function pushHistory(get: () => ArchitectState, set: (partial: Partial<ArchitectState>) => void) {
  const current = cloneSnapshot(get().nodes, get().edges);
  const past = [...get().past, current];
  if (past.length > 50) {
    past.shift();
  }
  set({ past, future: [] });
}

function recomputeConflicts(nodes: ArchitectNode[]): {
  conflictMap: ConflictMap;
  updatedNodes: ArchitectNode[];
} {
  const conflictMap = detectConflicts(nodes);

  const updatedNodes = nodes.map((node) => {
    const hasConflict = nodeHasConflict(node.id, conflictMap);
    const conflicts = getNodeConflicts(node.id, conflictMap);
    const dataChanged =
      node.data.hasConflict !== hasConflict ||
      JSON.stringify(node.data.conflicts) !== JSON.stringify(conflicts);

    if (!dataChanged) return node;

    return {
      ...node,
      data: {
        ...node.data,
        hasConflict,
        conflicts,
      },
    };
  });

  return { conflictMap, updatedNodes };
}

// ─── Store Definition ────────────────────────────────────────

export const useArchitectStore = create<ArchitectState>()(
  subscribeWithSelector((set, get) => ({
    nodes: [],
    edges: [],
    conflictMap: new Map(),
    past: [],
    future: [],
    snapToGrid: true,
    selectedNodeId: null,
    isPanelOpen: true,

    // ── History Actions ──

    recordSnapshot() {
      pushHistory(get, set);
    },

    undo() {
      const { past, future, nodes, edges } = get();
      if (past.length === 0) return;

      const previous = past[past.length - 1];
      if (!previous) return;

      const newPast = past.slice(0, -1);
      const current = cloneSnapshot(nodes, edges);
      const newFuture = [current, ...future];

      const { conflictMap, updatedNodes } = recomputeConflicts(previous.nodes);
      set({
        nodes: updatedNodes,
        edges: previous.edges,
        conflictMap,
        past: newPast,
        future: newFuture,
        selectedNodeId: null,
      });
    },

    redo() {
      const { past, future, nodes, edges } = get();
      if (future.length === 0) return;

      const next = future[0];
      if (!next) return;

      const newFuture = future.slice(1);
      const current = cloneSnapshot(nodes, edges);
      const newPast = [...past, current];

      const { conflictMap, updatedNodes } = recomputeConflicts(next.nodes);
      set({
        nodes: updatedNodes,
        edges: next.edges,
        conflictMap,
        past: newPast,
        future: newFuture,
        selectedNodeId: null,
      });
    },

    canUndo() {
      return get().past.length > 0;
    },

    canRedo() {
      return get().future.length > 0;
    },

    // ── ReactFlow Handlers ──

    onNodeDragStart() {
      pushHistory(get, set);
    },

    onNodesChange(changes) {
      const hasRemove = changes.some((c) => c.type === 'remove');
      if (hasRemove) {
        pushHistory(get, set);
      }
      const rawNodes = applyNodeChanges(changes, get().nodes) as ArchitectNode[];
      const { conflictMap, updatedNodes } = recomputeConflicts(rawNodes);
      set({ nodes: updatedNodes, conflictMap });
    },

    onEdgesChange(changes) {
      const hasRemove = changes.some((c) => c.type === 'remove');
      if (hasRemove) {
        pushHistory(get, set);
      }
      set({ edges: applyEdgeChanges(changes, get().edges) as ArchitectEdge[] });
    },

    onConnect(connection) {
      pushHistory(get, set);
      set({
        edges: addEdge(
          {
            ...connection,
            animated: true,
            style: { stroke: '#8B5CF6', strokeWidth: 2 },
          },
          get().edges
        ) as ArchitectEdge[],
      });
    },

    // ── Module Actions ──

    addModule(moduleId, position) {
      const moduleDef = MODULE_CATALOG.find((m) => m.id === moduleId);
      if (!moduleDef) return;

      pushHistory(get, set);

      const nodeId = nanoid();
      const pos = position ?? defaultPosition(get().nodes.length);

      // Build default port overrides map (identity — host == container default)
      const portOverrides: Record<number, number> = {};
      for (const portDef of moduleDef.ports) {
        portOverrides[portDef.internal] = portDef.default;
      }

      const advancedSettings: Record<string, unknown> = {};
      if (moduleDef.settings) {
        for (const setting of moduleDef.settings) {
          advancedSettings[setting.id] = setting.defaultValue;
        }
      }

      const newNode: ArchitectNode = {
        id: nodeId,
        type: 'moduleNode',
        position: pos,
        data: {
          moduleId,
          label: moduleDef.name,
          portOverrides,
          envOverrides: {},
          hasConflict: false,
          conflicts: [],
          selectedPlugins: [],
          advancedSettings,
        },
      };

      const rawNodes = [...get().nodes, newNode];
      const { conflictMap, updatedNodes } = recomputeConflicts(rawNodes);
      set({ nodes: updatedNodes, conflictMap, selectedNodeId: nodeId });
    },

    addCustomContainer(container) {
      pushHistory(get, set);

      const nodeId = nanoid();
      const pos = container.position ?? defaultPosition(get().nodes.length);

      const newNode: ArchitectNode = {
        id: nodeId,
        type: 'moduleNode',
        position: pos,
        data: {
          moduleId: 'custom',
          label: container.label || 'Özel Konteyner',
          portOverrides: {},
          envOverrides: container.env || {},
          hasConflict: false,
          conflicts: [],
          selectedPlugins: [],
          advancedSettings: {},
          isCustom: true,
          customImage: container.image,
          customContainerName: toServiceName(container.label),
          customPorts: container.ports || [],
          customVolumes: container.volumes || [],
          customEnv: container.env || {},
          customRestart: container.restart || 'unless-stopped',
          customNetworks: container.networks || ['xivizley_net'],
        },
      };

      const rawNodes = [...get().nodes, newNode];
      const { conflictMap, updatedNodes } = recomputeConflicts(rawNodes);
      set({ nodes: updatedNodes, conflictMap, selectedNodeId: nodeId });
    },

    duplicateNode(nodeId) {
      const original = get().nodes.find((n) => n.id === nodeId);
      if (!original) return;

      pushHistory(get, set);

      const newId = nanoid();
      const offset = get().snapToGrid ? 20 : 40;
      const newPos = {
        x: original.position.x + offset,
        y: original.position.y + offset,
      };

      const duplicatedNode: ArchitectNode = {
        ...original,
        id: newId,
        position: newPos,
        data: {
          ...original.data,
          label: `${original.data.label} (Kopya)`,
          portOverrides: { ...original.data.portOverrides },
          envOverrides: { ...original.data.envOverrides },
          advancedSettings: { ...original.data.advancedSettings },
          selectedPlugins: [...(original.data.selectedPlugins || [])],
          customPorts: original.data.customPorts ? [...original.data.customPorts] : undefined,
          customVolumes: original.data.customVolumes ? [...original.data.customVolumes] : undefined,
          customEnv: original.data.customEnv ? { ...original.data.customEnv } : undefined,
          customNetworks: original.data.customNetworks ? [...original.data.customNetworks] : undefined,
        },
      };

      const rawNodes = [...get().nodes, duplicatedNode];
      const { conflictMap, updatedNodes } = recomputeConflicts(rawNodes);
      set({ nodes: updatedNodes, conflictMap, selectedNodeId: newId });
    },

    duplicateSelected() {
      const selected = get().nodes.filter((n) => n.selected || n.id === get().selectedNodeId);
      if (selected.length === 0) return;

      pushHistory(get, set);

      const offset = get().snapToGrid ? 20 : 40;
      const newNodes: ArchitectNode[] = [];

      for (const original of selected) {
        const newId = nanoid();
        const newPos = {
          x: original.position.x + offset,
          y: original.position.y + offset,
        };

        newNodes.push({
          ...original,
          id: newId,
          position: newPos,
          selected: true,
          data: {
            ...original.data,
            label: `${original.data.label} (Kopya)`,
            portOverrides: { ...original.data.portOverrides },
            envOverrides: { ...original.data.envOverrides },
            advancedSettings: { ...original.data.advancedSettings },
            selectedPlugins: [...(original.data.selectedPlugins || [])],
            customPorts: original.data.customPorts ? [...original.data.customPorts] : undefined,
            customVolumes: original.data.customVolumes ? [...original.data.customVolumes] : undefined,
            customEnv: original.data.customEnv ? { ...original.data.customEnv } : undefined,
            customNetworks: original.data.customNetworks ? [...original.data.customNetworks] : undefined,
          },
        });
      }

      const unselectedOriginals = get().nodes.map((n) => ({ ...n, selected: false }));
      const rawNodes = [...unselectedOriginals, ...newNodes];
      const { conflictMap, updatedNodes } = recomputeConflicts(rawNodes);
      set({
        nodes: updatedNodes,
        conflictMap,
        selectedNodeId: newNodes.length === 1 && newNodes[0] ? newNodes[0].id : null,
      });
    },

    removeNode(nodeId) {
      pushHistory(get, set);

      const rawNodes = get().nodes.filter((n) => n.id !== nodeId);
      const edges = get().edges.filter(
        (e) => e.source !== nodeId && e.target !== nodeId,
      );
      const { conflictMap, updatedNodes } = recomputeConflicts(rawNodes);
      set({
        nodes: updatedNodes,
        edges,
        conflictMap,
        selectedNodeId: get().selectedNodeId === nodeId ? null : get().selectedNodeId,
      });
    },

    removeNodes(nodeIds) {
      if (nodeIds.length === 0) return;

      pushHistory(get, set);

      const idSet = new Set(nodeIds);
      const rawNodes = get().nodes.filter((n) => !idSet.has(n.id));
      const edges = get().edges.filter(
        (e) => !idSet.has(e.source) && !idSet.has(e.target),
      );
      const { conflictMap, updatedNodes } = recomputeConflicts(rawNodes);
      set({
        nodes: updatedNodes,
        edges,
        conflictMap,
        selectedNodeId: get().selectedNodeId && idSet.has(get().selectedNodeId!) ? null : get().selectedNodeId,
      });
    },

    deleteSelected() {
      const selectedNodeIds = new Set(
        get().nodes.filter((n) => n.selected || n.id === get().selectedNodeId).map((n) => n.id)
      );
      const selectedEdgeIds = new Set(
        get().edges.filter((e) => e.selected).map((e) => e.id)
      );

      if (selectedNodeIds.size === 0 && selectedEdgeIds.size === 0) return;

      pushHistory(get, set);

      const rawNodes = get().nodes.filter((n) => !selectedNodeIds.has(n.id));
      const remainingEdges = get().edges.filter(
        (e) => !selectedEdgeIds.has(e.id) && !selectedNodeIds.has(e.source) && !selectedNodeIds.has(e.target)
      );

      const { conflictMap, updatedNodes } = recomputeConflicts(rawNodes);
      set({
        nodes: updatedNodes,
        edges: remainingEdges,
        conflictMap,
        selectedNodeId: null,
      });
    },

    updateNodeLabel(nodeId, label) {
      pushHistory(get, set);
      set({
        nodes: get().nodes.map((n) =>
          n.id === nodeId ? { ...n, data: { ...n.data, label } } : n,
        ),
      });
    },

    updatePortOverride(nodeId, internalPort, newHostPort) {
      pushHistory(get, set);
      const rawNodes = get().nodes.map((n) => {
        if (n.id !== nodeId) return n;
        return {
          ...n,
          data: {
            ...n.data,
            portOverrides: { ...n.data.portOverrides, [internalPort]: newHostPort },
          },
        };
      });
      const { conflictMap, updatedNodes } = recomputeConflicts(rawNodes);
      set({ nodes: updatedNodes, conflictMap });
    },

    updateEnvOverride(nodeId, key, value) {
      pushHistory(get, set);
      set({
        nodes: get().nodes.map((n) =>
          n.id === nodeId
            ? { ...n, data: { ...n.data, envOverrides: { ...n.data.envOverrides, [key]: value } } }
            : n,
        ),
      });
    },

    updateAdvancedSetting(nodeId, key, value: unknown) {
      pushHistory(get, set);
      set({
        nodes: get().nodes.map((n) =>
          n.id === nodeId
            ? { ...n, data: { ...n.data, advancedSettings: { ...n.data.advancedSettings, [key]: value } } }
            : n,
        ),
      });
    },

    updateCustomContainer(nodeId, updates) {
      pushHistory(get, set);
      const rawNodes = get().nodes.map((n) => {
        if (n.id !== nodeId) return n;
        return {
          ...n,
          data: {
            ...n.data,
            ...updates,
          },
        };
      });
      const { conflictMap, updatedNodes } = recomputeConflicts(rawNodes);
      set({ nodes: updatedNodes, conflictMap });
    },

    togglePlugin(nodeId, pluginId) {
      pushHistory(get, set);
      set({
        nodes: get().nodes.map((n) => {
          if (n.id !== nodeId) return n;
          const current = n.data.selectedPlugins;
          const updated = current.includes(pluginId)
            ? current.filter((id) => id !== pluginId)
            : [...current, pluginId];
          return { ...n, data: { ...n.data, selectedPlugins: updated } };
        }),
      });
    },

    setNodePlugins(nodeId, pluginIds) {
      pushHistory(get, set);
      set({
        nodes: get().nodes.map((n) => {
          if (n.id !== nodeId) return n;
          return { ...n, data: { ...n.data, selectedPlugins: [...pluginIds] } };
        }),
      });
    },

    clearCanvas() {
      if (get().nodes.length === 0 && get().edges.length === 0) return;
      pushHistory(get, set);
      set({ nodes: [], edges: [], conflictMap: new Map(), selectedNodeId: null });
    },

    // ── Selection & Settings ──

    selectNode(nodeId) {
      set({ selectedNodeId: nodeId });
    },

    togglePanel() {
      set({ isPanelOpen: !get().isPanelOpen });
    },

    toggleSnapToGrid() {
      set({ snapToGrid: !get().snapToGrid });
    },

    setSnapToGrid(snap) {
      set({ snapToGrid: snap });
    },

    autoLayout() {
      const state = get();
      if (state.nodes.length === 0) return;
      pushHistory(get, set);

      // Group nodes by category column
      const colOrder: Record<string, number> = {
        os: 0,
        platform: 1,
        network: 1,
        app: 2,
        media: 2,
        storage: 2,
        game: 2,
        proxy: 3,
        tunnel: 3,
        security: 3,
      };

      const columns: [ArchitectNode[], ArchitectNode[], ArchitectNode[], ArchitectNode[]] = [
        [],
        [],
        [],
        [],
      ];

      state.nodes.forEach((node) => {
        const def = MODULE_CATALOG.find((m) => m.id === node.data.moduleId);
        const colIdx = (def ? colOrder[def.category] ?? 2 : 2) as 0 | 1 | 2 | 3;
        columns[colIdx].push(node);
      });

      const newNodes = state.nodes.map((node) => {
        const def = MODULE_CATALOG.find((m) => m.id === node.data.moduleId);
        const colIdx = (def ? colOrder[def.category] ?? 2 : 2) as 0 | 1 | 2 | 3;
        const rowIdx = columns[colIdx].findIndex((n) => n.id === node.id);

        const x = 80 + colIdx * 300;
        const y = 80 + rowIdx * 190;

        return {
          ...node,
          position: { x, y },
        };
      });

      const { conflictMap, updatedNodes } = recomputeConflicts(newNodes);
      set({ nodes: updatedNodes, conflictMap });
    },

    // ── Templates & AI ──

    loadTemplate(templateId) {
      // 1. Check STACK_TEMPLATES
      const stack = STACK_TEMPLATES.find((s) => s.id === templateId);
      if (stack) {
        const osModules = ['ubuntu-server', 'debian'];
        const platformModules = ['docker', 'casaos'];
        const proxyModules = ['nginx-proxy-manager', 'caddy', 'traefik', 'adguard-home', 'pi-hole', 'wireguard', 'tailscale'];
        const dbModules = ['mysql', 'postgresql', 'redis', 'pgadmin'];

        const col0: string[] = []; // OS & Docker
        const col1: string[] = []; // Proxy & Management
        const col2: string[] = []; // Primary Apps
        const col3: string[] = []; // Databases & Aux

        stack.moduleIds.forEach((mId) => {
          if (osModules.includes(mId) || platformModules.includes(mId)) {
            col0.push(mId);
          } else if (proxyModules.includes(mId) || mId === 'portainer') {
            col1.push(mId);
          } else if (dbModules.includes(mId)) {
            col3.push(mId);
          } else {
            col2.push(mId);
          }
        });

        // Fallback if empty cols
        if (col1.length === 0 && col2.length > 2) {
          col1.push(col2.shift()!);
        }

        const templateNodes: Array<{ id: string; moduleId: string; x: number; y: number }> = [];
        let nodeIdx = 1;

        const addColNodes = (colList: string[], xPos: number) => {
          colList.forEach((modId, rIdx) => {
            templateNodes.push({
              id: `n-${nodeIdx++}`,
              moduleId: modId,
              x: xPos,
              y: 100 + rIdx * 200,
            });
          });
        };

        addColNodes(col0, 80);
        addColNodes(col1, 380);
        addColNodes(col2, 680);
        addColNodes(col3, 980);

        // Intelligent hierarchical edges
        const templateEdges: Array<{ id: string; source: string; target: string }> = [];

        // Connect OS -> Docker
        const osNode = templateNodes.find((n) => osModules.includes(n.moduleId));
        const dockerNode = templateNodes.find((n) => platformModules.includes(n.moduleId));
        if (osNode && dockerNode) {
          templateEdges.push({ id: `e-${osNode.id}-${dockerNode.id}`, source: osNode.id, target: dockerNode.id });
        }

        // Connect Docker -> col1 nodes
        const parentPlatform = dockerNode || osNode;
        if (parentPlatform) {
          templateNodes.filter((n) => col1.includes(n.moduleId)).forEach((col1Node) => {
            templateEdges.push({ id: `e-${parentPlatform.id}-${col1Node.id}`, source: parentPlatform.id, target: col1Node.id });
          });
        }

        // Connect col1 / Platform -> col2 nodes
        const proxyNode = templateNodes.find((n) => proxyModules.includes(n.moduleId)) || parentPlatform;
        if (proxyNode) {
          templateNodes.filter((n) => col2.includes(n.moduleId)).forEach((appNode) => {
            templateEdges.push({ id: `e-${proxyNode.id}-${appNode.id}`, source: proxyNode.id, target: appNode.id });
          });
        }

        // Connect col2 -> col3 (Apps -> DBs)
        const primaryApp = templateNodes.find((n) => col2.includes(n.moduleId)) || proxyNode;
        if (primaryApp) {
          templateNodes.filter((n) => col3.includes(n.moduleId)).forEach((dbNode) => {
            templateEdges.push({ id: `e-${primaryApp.id}-${dbNode.id}`, source: primaryApp.id, target: dbNode.id });
          });
        }

        get().loadCustomStack(templateNodes, templateEdges);
        return;
      }

      // 2. Check legacy PREDEFINED_TEMPLATES
      const template = PREDEFINED_TEMPLATES.find((t) => t.id === templateId);
      if (!template) return;
      get().loadCustomStack(template.nodes, template.edges);
    },

    loadCustomStack(templateNodes, templateEdges = []) {
      pushHistory(get, set);

      const newNodes: ArchitectNode[] = [];
      const newEdges: ArchitectEdge[] = [];
      const idMap = new Map<string, string>();

      // Create Nodes
      for (const tNode of templateNodes) {
        const moduleDef = MODULE_CATALOG.find((m) => m.id === tNode.moduleId);
        const nodeId = nanoid();
        idMap.set(tNode.id, nodeId);

        if (tNode.isCustom || !moduleDef || tNode.moduleId === 'custom') {
          newNodes.push({
            id: nodeId,
            type: 'moduleNode',
            position: { x: tNode.x, y: tNode.y },
            data: {
              moduleId: tNode.moduleId || 'custom',
              label: tNode.label || 'Özel Konteyner',
              portOverrides: tNode.portOverrides || {},
              envOverrides: tNode.envOverrides || {},
              hasConflict: false,
              conflicts: [],
              selectedPlugins: tNode.selectedPlugins || [],
              advancedSettings: tNode.advancedSettings || {},
              isCustom: true,
              customImage: tNode.customImage || 'alpine:latest',
              customContainerName: tNode.customContainerName || toServiceName(tNode.label || 'custom'),
              customPorts: tNode.customPorts || [],
              customVolumes: tNode.customVolumes || [],
              customEnv: tNode.customEnv || {},
              customRestart: tNode.customRestart || 'unless-stopped',
              customNetworks: tNode.customNetworks || ['xivizley_net'],
            },
          });
          continue;
        }

        const portOverrides: Record<number, number> = { ...(tNode.portOverrides || {}) };
        for (const portDef of moduleDef.ports) {
          if (portOverrides[portDef.internal] === undefined) {
            portOverrides[portDef.internal] = portDef.default;
          }
        }

        const advancedSettings: Record<string, unknown> = { ...(tNode.advancedSettings || {}) };
        if (moduleDef.settings) {
          for (const setting of moduleDef.settings) {
            if (advancedSettings[setting.id] === undefined) {
              advancedSettings[setting.id] = setting.defaultValue;
            }
          }
        }

        newNodes.push({
          id: nodeId,
          type: 'moduleNode',
          position: { x: tNode.x, y: tNode.y },
          data: {
            moduleId: moduleDef.id,
            label: tNode.label || moduleDef.name,
            portOverrides,
            envOverrides: tNode.envOverrides || {},
            hasConflict: false,
            conflicts: [],
            selectedPlugins: tNode.selectedPlugins || [],
            advancedSettings,
            isCustom: false,
          },
        });
      }

      // Create Edges (source -> target means source depends on target)
      if (templateEdges) {
        for (const tEdge of templateEdges) {
          const sourceId = idMap.get(tEdge.source);
          const targetId = idMap.get(tEdge.target);
          if (sourceId && targetId) {
            newEdges.push({
              id: nanoid(),
              source: sourceId,
              target: targetId,
              animated: true,
              style: { stroke: '#8B5CF6', strokeWidth: 2 },
            });
          }
        }
      }

      const { conflictMap, updatedNodes } = recomputeConflicts(newNodes);
      set({ nodes: updatedNodes, edges: newEdges, conflictMap, selectedNodeId: null });
    },

    mergeCustomStack(templateNodes, templateEdges = []) {
      pushHistory(get, set);
      const existingNodes = get().nodes;
      const existingEdges = get().edges;

      let maxEndX = 0;
      existingNodes.forEach((n) => {
        if (n.position.x > maxEndX) maxEndX = n.position.x;
      });
      const offsetX = existingNodes.length > 0 ? maxEndX + 350 : 0;

      const newNodes: ArchitectNode[] = [];
      const newEdges: ArchitectEdge[] = [];
      const idMap = new Map<string, string>();

      // Create Nodes
      for (const tNode of templateNodes) {
        const moduleDef = MODULE_CATALOG.find((m) => m.id === tNode.moduleId);
        const nodeId = nanoid();
        idMap.set(tNode.id, nodeId);

        if (tNode.isCustom || !moduleDef || tNode.moduleId === 'custom') {
          newNodes.push({
            id: nodeId,
            type: 'moduleNode',
            position: { x: tNode.x + offsetX, y: tNode.y },
            data: {
              moduleId: tNode.moduleId || 'custom',
              label: tNode.label || 'Özel Konteyner',
              portOverrides: tNode.portOverrides || {},
              envOverrides: tNode.envOverrides || {},
              hasConflict: false,
              conflicts: [],
              selectedPlugins: tNode.selectedPlugins || [],
              advancedSettings: tNode.advancedSettings || {},
              isCustom: true,
              customImage: tNode.customImage || 'alpine:latest',
              customContainerName: tNode.customContainerName || toServiceName(tNode.label || 'custom'),
              customPorts: tNode.customPorts || [],
              customVolumes: tNode.customVolumes || [],
              customEnv: tNode.customEnv || {},
              customRestart: tNode.customRestart || 'unless-stopped',
              customNetworks: tNode.customNetworks || ['xivizley_net'],
            },
          });
          continue;
        }

        const portOverrides: Record<number, number> = { ...(tNode.portOverrides || {}) };
        for (const portDef of moduleDef.ports) {
          if (portOverrides[portDef.internal] === undefined) {
            portOverrides[portDef.internal] = portDef.default;
          }
        }

        const advancedSettings: Record<string, unknown> = { ...(tNode.advancedSettings || {}) };
        if (moduleDef.settings) {
          for (const setting of moduleDef.settings) {
            if (advancedSettings[setting.id] === undefined) {
              advancedSettings[setting.id] = setting.defaultValue;
            }
          }
        }

        newNodes.push({
          id: nodeId,
          type: 'moduleNode',
          position: { x: tNode.x + offsetX, y: tNode.y },
          data: {
            moduleId: moduleDef.id,
            label: tNode.label || moduleDef.name,
            portOverrides,
            envOverrides: tNode.envOverrides || {},
            hasConflict: false,
            conflicts: [],
            selectedPlugins: tNode.selectedPlugins || [],
            advancedSettings,
            isCustom: false,
          },
        });
      }

      // Create Edges
      for (const tEdge of templateEdges) {
        const sourceId = idMap.get(tEdge.source);
        const targetId = idMap.get(tEdge.target);
        if (sourceId && targetId) {
          newEdges.push({
            id: `e_${sourceId}_${targetId}`,
            source: sourceId,
            target: targetId,
            animated: true,
            style: { stroke: '#8B5CF6', strokeWidth: 2 },
          });
        }
      }

      const combinedNodes = [...existingNodes, ...newNodes];
      const combinedEdges = [...existingEdges, ...newEdges];
      const { conflictMap, updatedNodes } = recomputeConflicts(combinedNodes);
      set({ nodes: updatedNodes, edges: combinedEdges, conflictMap, selectedNodeId: null });
    },

    // ── Persistence ──

    loadFromJson(json: string) {
      try {
        const parsed = JSON.parse(json) as { nodes: ArchitectNode[]; edges: ArchitectEdge[] };
        const { conflictMap, updatedNodes } = recomputeConflicts(parsed.nodes);
        pushHistory(get, set);
        set({ nodes: updatedNodes, edges: parsed.edges || [], conflictMap });
      } catch {
        console.error('[XIVIZLEY] Failed to load canvas from JSON');
      }
    },

    exportToJson() {
      const { nodes, edges } = get();
      return JSON.stringify({ nodes, edges, savedAt: new Date().toISOString() }, null, 2);
    },
  })),
);

// ─── Convenience Selectors ───────────────────────────────────

export const selectNodes = (s: ArchitectState) => s.nodes;
export const selectEdges = (s: ArchitectState) => s.edges;
export const selectConflictMap = (s: ArchitectState) => s.conflictMap;
export const selectConflictCount = (s: ArchitectState) => s.conflictMap.size;
export const selectSelectedNodeId = (s: ArchitectState) => s.selectedNodeId;
export const selectSelectedNode = (s: ArchitectState) =>
  s.nodes.find((n) => n.id === s.selectedNodeId) ?? null;
export const selectCanUndo = (s: ArchitectState) => s.past.length > 0;
export const selectCanRedo = (s: ArchitectState) => s.future.length > 0;
export const selectSnapToGrid = (s: ArchitectState) => s.snapToGrid;
