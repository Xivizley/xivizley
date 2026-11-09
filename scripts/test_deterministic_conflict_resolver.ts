import assert from 'node:assert';
import {
  FIXED_PORT_REMAP,
  nextDeterministicFreePort,
  topologicalSortNodes,
  autoResolveConflicts,
} from '../lib/engines/conflictDetector';
import { useArchitectStore } from '../store/useArchitectStore';
import { validateRoundTrip } from '../lib/engines/roundTrip';
import type { ArchitectNode } from '../lib/types';

console.log('====================================================');
console.log('🧪 TESTING DETERMINISTIC RESOLVER & KAHN ALGORITHM');
console.log('====================================================');

// Test 1: Fixed Remap & nextDeterministicFreePort
assert.strictEqual(FIXED_PORT_REMAP[80], 8080);
assert.strictEqual(FIXED_PORT_REMAP[443], 8443);
assert.strictEqual(FIXED_PORT_REMAP[5432], 5433);

const reserved = new Set([80, 8080]);
const shifted80 = nextDeterministicFreePort(80, reserved);
assert.strictEqual(shifted80, 8081, 'Port 80 should remap to 8081 when 8080 is reserved');
console.log('✅ [PASS] FIXED_PORT_REMAP and nextDeterministicFreePort verified');

// Test 2: Kahn's Algorithm Topological Sort with Tie-Breaking
const mockNodeA: ArchitectNode = {
  id: 'node-app',
  type: 'moduleNode',
  position: { x: 0, y: 0 },
  data: {
    moduleId: 'node-app',
    label: 'App',
    portOverrides: { 3000: 3000 },
    envOverrides: {},
    hasConflict: false,
    conflicts: [],
    selectedPlugins: [],
    advancedSettings: {},
  },
};

const mockNodeDB: ArchitectNode = {
  id: 'node-db',
  type: 'moduleNode',
  position: { x: 100, y: 0 },
  data: {
    moduleId: 'postgres',
    label: 'Postgres',
    portOverrides: { 5432: 5432 },
    envOverrides: {},
    hasConflict: false,
    conflicts: [],
    selectedPlugins: [],
    advancedSettings: {},
  },
};

// Edge: node-app depends on node-db
const edges = [{ source: 'node-app', target: 'node-db' }];
const { sorted, hasCycle, cycleNodeIds } = topologicalSortNodes([mockNodeA, mockNodeDB], edges);
assert.strictEqual(hasCycle, false, 'DAG without cycle must report hasCycle=false');
assert.strictEqual(sorted[0]!.id, 'node-db', 'Prerequisite node-db must come first in Kahn order');
assert.strictEqual(sorted[1]!.id, 'node-app', 'Dependent node-app must come second');
console.log('✅ [PASS] Kahn topological sort respects dependency edge direction');

// Test 2b: Cycle detection in Kahn topological sort
const cyclicEdges = [
  { source: 'node-a', target: 'node-b' },
  { source: 'node-b', target: 'node-a' },
];
const cycleResult = topologicalSortNodes(
  [
    { id: 'node-a', type: 'moduleNode', position: { x: 0, y: 0 }, data: { moduleId: 'nginx' } } as any,
    { id: 'node-b', type: 'moduleNode', position: { x: 50, y: 0 }, data: { moduleId: 'redis' } } as any,
  ],
  cyclicEdges,
);
assert.strictEqual(cycleResult.hasCycle, true, 'Circular graph must trigger hasCycle=true');
assert.strictEqual(cycleResult.cycleNodeIds.length, 2, 'Both cyclic nodes must be identified');
console.log('✅ [PASS] Cycle detection successfully identifies cyclic nodes in topological sort');

// Test 3: C1 Scenario — 3 nodes requesting port 80
const n1: ArchitectNode = {
  id: 'a',
  type: 'moduleNode',
  position: { x: 0, y: 0 },
  data: {
    moduleId: 'nginx',
    label: 'Proxy A',
    portOverrides: { 80: 80 },
    envOverrides: {},
    hasConflict: false,
    conflicts: [],
    selectedPlugins: [],
    advancedSettings: {},
  },
};
const n2: ArchitectNode = {
  id: 'b',
  type: 'moduleNode',
  position: { x: 50, y: 0 },
  data: {
    moduleId: 'nginx',
    label: 'Proxy B',
    portOverrides: { 80: 80 },
    envOverrides: {},
    hasConflict: false,
    conflicts: [],
    selectedPlugins: [],
    advancedSettings: {},
  },
};
const n3: ArchitectNode = {
  id: 'c',
  type: 'moduleNode',
  position: { x: 100, y: 0 },
  data: {
    moduleId: 'nginx',
    label: 'Proxy C',
    portOverrides: { 80: 80 },
    envOverrides: {},
    hasConflict: false,
    conflicts: [],
    selectedPlugins: [],
    advancedSettings: {},
  },
};

const resC1 = autoResolveConflicts([n1, n2, n3], []);
assert.strictEqual(resC1.valid, true, 'Resolution must be completely conflict-free');
assert.strictEqual(resC1.resolvedOverrides['a']![80], 80, 'Node a keeps port 80');
assert.strictEqual(resC1.resolvedOverrides['b']![80], 8080, 'Node b shifts to 8080');
assert.strictEqual(resC1.resolvedOverrides['c']![80], 8081, 'Node c shifts to 8081');
console.log('✅ [PASS] C1 Special Test: 3 nodes requesting port 80 resolve to 80, 8080, 8081');

// Test 4: useArchitectStore autoResolveAllConflicts integration
useArchitectStore.setState({
  nodes: [n1, n2, n3],
  edges: [],
  conflictMap: new Map(),
  past: [],
  future: [],
});

const storeResult = useArchitectStore.getState().autoResolveAllConflicts();
assert.strictEqual(storeResult.valid, true);
assert.strictEqual(useArchitectStore.getState().conflictMap.size, 0, 'Conflicts must be 0 after auto-resolve');

const updatedStateNodes = useArchitectStore.getState().nodes;
assert.strictEqual(updatedStateNodes.find((n) => n.id === 'a')?.data.portOverrides?.[80], 80);
assert.strictEqual(updatedStateNodes.find((n) => n.id === 'b')?.data.portOverrides?.[80], 8080);
assert.strictEqual(updatedStateNodes.find((n) => n.id === 'c')?.data.portOverrides?.[80], 8081);

const resolveReport = useArchitectStore.getState().resolveReport;
assert.notStrictEqual(resolveReport, null, 'resolveReport must be populated in store');
assert.strictEqual(resolveReport?.valid, true, 'resolveReport.valid must be true');
assert.strictEqual(resolveReport?.totalShifts, 2, 'resolveReport.totalShifts must be 2');
assert.strictEqual(resolveReport?.isDeterministic, true, 'resolveReport.isDeterministic must be true');
assert.strictEqual(resolveReport?.hasCycle, false, 'resolveReport.hasCycle must be false');
assert.deepStrictEqual(resolveReport?.evaluationOrder, ['a', 'b', 'c'], 'resolveReport.evaluationOrder must match stable alphabetical order');
console.log('✅ [PASS] useArchitectStore.autoResolveAllConflicts stores resolveReport in state');

// Test 5: Round-trip validation (AS1 Lossless Modeling)
const rtResult = validateRoundTrip([n1, n2, n3], []);
assert.strictEqual(rtResult.ok, true, 'Round-trip validation must succeed');
assert.strictEqual(rtResult.nodeCount, 3, 'Node count must match');
assert.strictEqual(rtResult.edgeCount, 0, 'Edge count must match');
console.log('✅ [PASS] AS1 Lossless Modeling round-trip validation confirmed');

console.log('====================================================');
console.log('🎉 ALL DETERMINISTIC CONFLICT RESOLVER TESTS PASSED!');
console.log('====================================================');
