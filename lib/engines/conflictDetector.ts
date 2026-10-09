// ============================================================
// XIVIZLEY — Port Conflict Detection Engine
// lib/engines/conflictDetector.ts
//
// Pure client-side function — never runs on a server.
// Given the current canvas nodes, it detects all host-port
// collisions and suggests alternative ports.
// ============================================================

import { MODULE_CATALOG, PORT_ALTERNATIVES } from '@/lib/data/modules';
import type { ArchitectNode, ConflictMap, PortConflict } from '@/lib/types';

/**
 * Computes the effective host port for a given node port definition.
 */
function resolveHostPort(
  internalPort: number,
  defaultPort: number,
  portOverrides: Record<number, number>,
): number {
  return portOverrides[internalPort] ?? defaultPort;
}

/**
 * Generates a list of alternative ports that are NOT already in use.
 */
function suggestAlternatives(
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
    const { moduleId, portOverrides } = node.data;

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
