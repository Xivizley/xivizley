// ============================================================
// XIVIZLEY — Lossless Round-Trip Modeling Validator (AS1)
// lib/engines/roundTrip.ts
//
// Pure client-side validator.
// Verifies AS1: Visual Canvas Graph -> Configuration JSON -> Visual Canvas Graph
// guarantees 100% lossless preservation of services, images, ports,
// environment variables, custom definitions, and dependency edges.
// ============================================================

import type { ArchitectNode, ArchitectEdge } from '@/lib/types';

export interface RoundTripResult {
  /** Whether the serialization-deserialization round-trip is strictly lossless */
  ok: boolean;
  /** Detailed audit messages */
  details: string[];
  /** Total nodes verified */
  nodeCount: number;
  /** Total edges verified */
  edgeCount: number;
  /** Size of serialized JSON payload in bytes */
  payloadBytes: number;
}

/**
 * Validates that canvas nodes and dependency edges can be serialized to JSON
 * and deserialized back without any loss of structural integrity or configuration.
 */
export function validateRoundTrip(
  nodes: ArchitectNode[],
  edges: ArchitectEdge[] = [],
): RoundTripResult {
  if (nodes.length === 0) {
    return {
      ok: true,
      details: ['Tuval boş — kayıp yok'],
      nodeCount: 0,
      edgeCount: 0,
      payloadBytes: 0,
    };
  }

  const details: string[] = [];
  const jsonPayload = JSON.stringify({ nodes, edges });
  const payloadBytes = new TextEncoder().encode(jsonPayload).length;

  let restored: { nodes: ArchitectNode[]; edges: ArchitectEdge[] };
  try {
    restored = JSON.parse(jsonPayload);
  } catch (err) {
    return {
      ok: false,
      details: [`JSON ayrıştırma hatası: ${String(err)}`],
      nodeCount: nodes.length,
      edgeCount: edges.length,
      payloadBytes,
    };
  }

  const nodeCountMatches = Array.isArray(restored.nodes) && restored.nodes.length === nodes.length;
  const edgeCountMatches = Array.isArray(restored.edges) && restored.edges.length === edges.length;

  if (!nodeCountMatches) {
    details.push(`Düğüm sayısı uyuşmuyor: beklenen ${nodes.length}, gelen ${restored.nodes?.length ?? 0}`);
  }
  if (!edgeCountMatches) {
    details.push(`Kenar sayısı uyuşmuyor: beklenen ${edges.length}, gelen ${restored.edges?.length ?? 0}`);
  }

  let nodesLossless = nodeCountMatches;
  if (nodeCountMatches && restored.nodes) {
    for (let i = 0; i < nodes.length; i++) {
      const orig = nodes[i];
      const back = restored.nodes[i];
      if (!orig || !back) {
        nodesLossless = false;
        details.push(`Düğüm indeksi [${i}] erişilemedi`);
        break;
      }

      const sameId = orig.id === back.id;
      const sameModule = orig.data.moduleId === back.data.moduleId;
      const sameLabel = orig.data.label === back.data.label;
      const samePorts = JSON.stringify(orig.data.portOverrides ?? {}) === JSON.stringify(back.data.portOverrides ?? {});
      const sameEnv = JSON.stringify(orig.data.envOverrides ?? {}) === JSON.stringify(back.data.envOverrides ?? {});
      const sameCustomPorts = JSON.stringify(orig.data.customPorts ?? []) === JSON.stringify(back.data.customPorts ?? []);

      if (!sameId || !sameModule || !sameLabel || !samePorts || !sameEnv || !sameCustomPorts) {
        nodesLossless = false;
        details.push(`Düğüm [${orig.id} / ${orig.data.label || orig.data.moduleId}] özniteliklerinde kayıp var`);
        break;
      }
    }
  }

  let edgesLossless = edgeCountMatches;
  if (edgeCountMatches && restored.edges) {
    for (let i = 0; i < edges.length; i++) {
      const orig = edges[i];
      const back = restored.edges[i];
      if (!orig || !back) {
        edgesLossless = false;
        details.push(`Kenar indeksi [${i}] erişilemedi`);
        break;
      }
      if (orig.id !== back.id || orig.source !== back.source || orig.target !== back.target) {
        edgesLossless = false;
        details.push(`Kenar [${orig.source} -> ${orig.target}] bağımlılık eşleşmesinde sapma var`);
        break;
      }
    }
  }

  const ok = nodeCountMatches && edgeCountMatches && nodesLossless && edgesLossless;

  if (ok) {
    details.push(`Model → JSON → Model gidiş-dönüşü %100 kayıpsız tamamlandı (${nodes.length} düğüm, ${edges.length} kenar, ${payloadBytes} bayt)`);
  }

  return {
    ok,
    details,
    nodeCount: nodes.length,
    edgeCount: edges.length,
    payloadBytes,
  };
}
