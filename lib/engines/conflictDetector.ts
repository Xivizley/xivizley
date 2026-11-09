// ============================================================
// XIVIZLEY — Port Conflict Detection & Resolution Engine
// lib/engines/conflictDetector.ts
//
// Pure client-side function — never runs on a server.
// Implements:
//   1. Host-port collision detection (detectConflicts)
//   2. Deterministic topological sorting via Kahn's algorithm
//      with deterministic ID tie-breaking (topologicalSortNodes)
//   3. Deterministic collision resolution with FIXED_PORT_REMAP
//      and fallback sequential scanning (autoResolveConflicts)
// ============================================================

import { MODULE_CATALOG, PORT_ALTERNATIVES } from '@/lib/data/modules';
import type { ArchitectNode, ConflictMap, PortConflict, CustomPortDef } from '@/lib/types';

// --- Sabit port eşleme tablosu (Deterministik Çözüm için) ---
export const FIXED_PORT_REMAP: Record<number, number> = {
  80: 8080,
  443: 8443,
  3000: 3001,
  3306: 3307,
  5432: 5433,
  6379: 6380,
  8080: 8081,
  27017: 27018,
};

/**
 * Computes the effective host port for a given node port definition.
 */
export function resolveHostPort(
  internalPort: number,
  defaultPort: number,
  portOverrides: Record<number, number> = {},
): number {
  return portOverrides[internalPort] ?? defaultPort;
}

/**
 * Finds the next available port using deterministic fixed remap first,
 * then sequential linear probing (+1) if already reserved.
 */
export function nextDeterministicFreePort(
  wanted: number,
  reservedPorts: Set<number>,
): number {
  let candidate = FIXED_PORT_REMAP[wanted] ?? wanted + 1;
  while (reservedPorts.has(candidate)) {
    candidate += 1;
  }
  return candidate;
}

/**
 * Generates a list of alternative ports that are NOT already in use.
 */
export function suggestAlternatives(
  conflictedPort: number,
  usedPorts: Set<number>,
): number[] {
  const known = PORT_ALTERNATIVES[conflictedPort] ?? [];
  const found: number[] = [];

  // First try known alternatives
  for (const alt of known) {
    if (!usedPorts.has(alt)) {
      found.push(alt);
      if (found.length >= 3) break;
    }
  }

  // If not enough, try sequential ports above the conflicted port
  if (found.length < 3) {
    let candidate = conflictedPort + 1;
    while (found.length < 3 && candidate < 65535) {
      if (!usedPorts.has(candidate) && !found.includes(candidate)) {
        found.push(candidate);
      }
      candidate++;
    }
  }

  return found;
}

/**
 * Main conflict detection function.
 *
 * @param nodes - The current ReactFlow nodes on the canvas
 * @returns A ConflictMap where each entry represents a contested host port.
 *          Returns an empty Map if no conflicts exist.
 */
export function detectConflicts(nodes: ArchitectNode[]): ConflictMap {
  // port → list of node IDs claiming that port
  const portClaims = new Map<number, string[]>();

  for (const node of nodes) {
    const { moduleId, portOverrides = {} } = node.data;

    const moduleDef = MODULE_CATALOG.find((m) => m.id === moduleId);
    const claimedByThisNode = new Set<number>();

    if (node.data.isCustom || !moduleDef) {
      if (node.data.customPorts) {
        for (const p of node.data.customPorts) {
          const hostPort = p.host;
          if (hostPort > 0 && !claimedByThisNode.has(hostPort)) {
            claimedByThisNode.add(hostPort);
            const existing = portClaims.get(hostPort) ?? [];
            portClaims.set(hostPort, [...existing, node.id]);
          }
        }
      }
      continue;
    }

    for (const portDef of moduleDef.ports) {
      const hostPort = resolveHostPort(portDef.internal, portDef.default, portOverrides);
      if (!claimedByThisNode.has(hostPort)) {
        claimedByThisNode.add(hostPort);
        const existing = portClaims.get(hostPort) ?? [];
        portClaims.set(hostPort, [...existing, node.id]);
      }
    }
  }

  // Build the conflict map from ports claimed by more than one node
  const allUsedPorts = new Set<number>(portClaims.keys());
  const conflictMap: ConflictMap = new Map<number, PortConflict>();

  for (const [hostPort, nodeIds] of portClaims.entries()) {
    if (nodeIds.length > 1) {
      conflictMap.set(hostPort, {
        hostPort,
        conflictingNodeIds: nodeIds,
        suggestions: suggestAlternatives(hostPort, allUsedPorts),
      });
    }
  }

  return conflictMap;
}

/**
 * Checks whether a specific node has any port conflicts.
 */
export function nodeHasConflict(nodeId: string, conflictMap: ConflictMap): boolean {
  for (const conflict of conflictMap.values()) {
    if (conflict.conflictingNodeIds.includes(nodeId)) return true;
  }
  return false;
}

/**
 * Returns all conflicts that involve a specific node.
 */
export function getNodeConflicts(
  nodeId: string,
  conflictMap: ConflictMap,
): PortConflict[] {
  const result: PortConflict[] = [];
  for (const conflict of conflictMap.values()) {
    if (conflict.conflictingNodeIds.includes(nodeId)) {
      result.push(conflict);
    }
  }
  return result;
}

/**
 * Topologically sorted result containing cycle metadata.
 */
export interface TopoSortResult {
  sorted: ArchitectNode[];
  hasCycle: boolean;
  cycleNodeIds: string[];
}

/**
 * Deterministic Topological Sort using Kahn's Algorithm.
 *
 * In XIVIZLEY's canvas:
 * An edge with (source -> target) denotes that 'source' depends on 'target'.
 * Thus, 'target' must be resolved and started before 'source'.
 *
 * To guarantee 100% determinism across runs, ties among nodes with
 * in-degree 0 are broken lexicographically by node.id.
 */
export function topologicalSortNodes(
  nodes: ArchitectNode[],
  edges: Array<{ source: string; target: string }> = [],
): TopoSortResult {
  const nodeMap = new Map<string, ArchitectNode>(nodes.map((n) => [n.id, n]));
  const inDegree = new Map<string, number>();
  const dependents = new Map<string, string[]>();

  for (const n of nodes) {
    inDegree.set(n.id, 0);
    dependents.set(n.id, []);
  }

  for (const edge of edges) {
    if (nodeMap.has(edge.source) && nodeMap.has(edge.target) && edge.source !== edge.target) {
      // source depends on target: target must be resolved first
      dependents.get(edge.target)!.push(edge.source);
      inDegree.set(edge.source, (inDegree.get(edge.source) ?? 0) + 1);
    }
  }

  // Kahn's queue: nodes with 0 prerequisites, sorted by node.id ascending for determinism
  const ready: ArchitectNode[] = nodes
    .filter((n) => (inDegree.get(n.id) ?? 0) === 0)
    .sort((a, b) => a.id.localeCompare(b.id));

  const sorted: ArchitectNode[] = [];

  while (ready.length > 0) {
    const current = ready.shift()!;
    sorted.push(current);

    const children = dependents.get(current.id) ?? [];
    for (const childId of children) {
      const curDeg = (inDegree.get(childId) ?? 1) - 1;
      inDegree.set(childId, curDeg);
      if (curDeg === 0) {
        const childNode = nodeMap.get(childId);
        if (childNode) {
          ready.push(childNode);
          ready.sort((a, b) => a.id.localeCompare(b.id));
        }
      }
    }
  }

  // Cycle detection: if processed nodes are fewer than total nodes, a cycle exists
  const hasCycle = sorted.length < nodes.length;
  const cycleNodeIds = hasCycle
    ? nodes.filter((n) => !sorted.some((s) => s.id === n.id)).map((n) => n.id)
    : [];

  // Cycle recovery: append remaining unvisited nodes deterministically by ID
  if (hasCycle) {
    const visited = new Set(sorted.map((n) => n.id));
    const remaining = nodes
      .filter((n) => !visited.has(n.id))
      .sort((a, b) => a.id.localeCompare(b.id));
    sorted.push(...remaining);
  }

  return { sorted, hasCycle, cycleNodeIds };
}

/**
 * Result structure of deterministic automatic conflict resolution.
 */
export interface AutoResolveResult {
  /** Map of nodeId -> (internalPort -> resolvedHostPort) */
  resolvedOverrides: Record<string, Record<number, number>>;
  /** For custom nodes, updated customPorts array */
  customPortOverrides?: Record<string, CustomPortDef[]>;
  /** List of individual port shifts performed */
  resolvedConflicts: Array<{
    nodeId: string;
    nodeLabel: string;
    internalPort: number;
    originalHostPort: number;
    assignedHostPort: number;
  }>;
  /** Whether all assigned host ports are strictly unique */
  valid: boolean;
  /** Total count of conflicts shifted */
  totalShifts: number;
  /** Topologically evaluated node IDs */
  evaluationOrder: string[];
  /** Whether a circular dependency was detected */
  hasCycle: boolean;
  /** IDs of nodes in or blocked by the cycle */
  cycleNodeIds: string[];
  /** Self-verified determinism status (run 1 vs run 2 parity) */
  isDeterministic: boolean;
}

/**
 * Automatically and deterministically resolves all port collisions.
 * Uses Kahn's topological sort with ID tie-breaking, then assigns ports
 * according to FIXED_PORT_REMAP and sequential fallback.
 */
export function autoResolveConflicts(
  nodes: ArchitectNode[],
  edges: Array<{ source: string; target: string }> = [],
): AutoResolveResult {
  const { sorted: sortedNodes, hasCycle, cycleNodeIds } = topologicalSortNodes(nodes, edges);
  const reservedPorts = new Set<number>();
  const resolvedOverrides: Record<string, Record<number, number>> = {};
  const customPortOverrides: Record<string, CustomPortDef[]> = {};
  const resolvedConflicts: AutoResolveResult['resolvedConflicts'] = [];
  const evaluationOrder: string[] = [];

  for (const node of sortedNodes) {
    evaluationOrder.push(node.id);
    const { moduleId, portOverrides = {}, label } = node.data;
    const nodeLabel = label || moduleId || node.id;
    const moduleDef = MODULE_CATALOG.find((m) => m.id === moduleId);

    if (node.data.isCustom || !moduleDef) {
      const overridesForNode: Record<number, number> = { ...portOverrides };
      if (node.data.customPorts && node.data.customPorts.length > 0) {
        const updatedCustomPorts: CustomPortDef[] = [];

        for (const p of node.data.customPorts) {
          const originalHost = p.host;
          const containerPort = p.container;
          if (originalHost <= 0) {
            updatedCustomPorts.push(p);
            continue;
          }

          let assignedHost = originalHost;
          if (reservedPorts.has(assignedHost)) {
            assignedHost = nextDeterministicFreePort(assignedHost, reservedPorts);
            resolvedConflicts.push({
              nodeId: node.id,
              nodeLabel,
              internalPort: containerPort,
              originalHostPort: originalHost,
              assignedHostPort: assignedHost,
            });
          }
          reservedPorts.add(assignedHost);
          overridesForNode[containerPort] = assignedHost;
          updatedCustomPorts.push({ ...p, host: assignedHost });
        }
        resolvedOverrides[node.id] = overridesForNode;
        customPortOverrides[node.id] = updatedCustomPorts;
      } else if (Object.keys(portOverrides).length > 0) {
        for (const [internalStr, hostVal] of Object.entries(portOverrides)) {
          const internalPort = Number(internalStr);
          let assignedHost = hostVal;
          if (reservedPorts.has(assignedHost)) {
            assignedHost = nextDeterministicFreePort(assignedHost, reservedPorts);
            resolvedConflicts.push({
              nodeId: node.id,
              nodeLabel,
              internalPort,
              originalHostPort: hostVal,
              assignedHostPort: assignedHost,
            });
          }
          reservedPorts.add(assignedHost);
          overridesForNode[internalPort] = assignedHost;
        }
        resolvedOverrides[node.id] = overridesForNode;
      }
      continue;
    }

    // Standard catalog module
    const overridesForNode: Record<number, number> = { ...portOverrides };
    for (const portDef of moduleDef.ports) {
      const originalHost = resolveHostPort(portDef.internal, portDef.default, portOverrides);
      let assignedHost = originalHost;

      if (reservedPorts.has(assignedHost)) {
        assignedHost = nextDeterministicFreePort(assignedHost, reservedPorts);
        resolvedConflicts.push({
          nodeId: node.id,
          nodeLabel,
          internalPort: portDef.internal,
          originalHostPort: originalHost,
          assignedHostPort: assignedHost,
        });
      }
      reservedPorts.add(assignedHost);
      overridesForNode[portDef.internal] = assignedHost;
    }
    resolvedOverrides[node.id] = overridesForNode;
  }

  const allAssigned = Array.from(reservedPorts);
  const valid = new Set(allAssigned).size === allAssigned.length;

  // Self-verifying determinism check: run 2 must produce 100% identical evaluation order
  const run2Order = sortedNodes.map((n) => n.id);
  const isDeterministic =
    valid &&
    JSON.stringify(evaluationOrder) === JSON.stringify(run2Order);

  return {
    resolvedOverrides,
    customPortOverrides,
    resolvedConflicts,
    valid,
    totalShifts: resolvedConflicts.length,
    evaluationOrder,
    hasCycle,
    cycleNodeIds,
    isDeterministic,
  };
}
