import { test } from 'node:test';
import assert from 'node:assert/strict';
import { computeRings, computeTargets } from '../src/layout.js';

const NODES = [
  { id: 'a' }, { id: 'b' }, { id: 'c' }, { id: 'd' }, { id: 'e' },
];
const EDGES = [
  { from: 'a', to: 'b' },
  { from: 'a', to: 'c' },
  { from: 'b', to: 'd' },
  { from: 'c', to: 'e' },
];

test('computeRings: centre is ring 0', () => {
  const rings = computeRings('a', NODES, EDGES);
  assert.equal(rings.get('a'), 0);
});

test('computeRings: direct neighbours are ring 1', () => {
  const rings = computeRings('a', NODES, EDGES);
  assert.equal(rings.get('b'), 1);
  assert.equal(rings.get('c'), 1);
});

test('computeRings: distance-2 nodes are ring 2', () => {
  const rings = computeRings('a', NODES, EDGES);
  assert.equal(rings.get('d'), 2);
  assert.equal(rings.get('e'), 2);
});

test('computeRings: edges are treated as undirected', () => {
  const rings = computeRings('d', NODES, EDGES);
  assert.equal(rings.get('d'), 0);
  assert.equal(rings.get('b'), 1);
  assert.equal(rings.get('a'), 2);
});

test('computeRings: distance capped at 3', () => {
  const longChain = [
    { id: '1' }, { id: '2' }, { id: '3' }, { id: '4' }, { id: '5' },
  ];
  const chainEdges = [
    { from: '1', to: '2' }, { from: '2', to: '3' },
    { from: '3', to: '4' }, { from: '4', to: '5' },
  ];
  const rings = computeRings('1', longChain, chainEdges);
  assert.equal(rings.get('5'), 3);
});

test('computeTargets: centre node placed at canvas centre', () => {
  const targets = computeTargets('a', NODES, EDGES, 800, 600);
  const t = targets.get('a');
  assert.equal(t.x, 400);
  assert.equal(t.y, 300);
});

test('computeTargets: ring-1 nodes are equidistant from centre', () => {
  const targets = computeTargets('a', NODES, EDGES, 800, 600);
  const b = targets.get('b'), c = targets.get('c');
  const rB = Math.hypot(b.x - 400, b.y - 300);
  const rC = Math.hypot(c.x - 400, c.y - 300);
  assert.ok(Math.abs(rB - rC) < 0.01, 'ring-1 nodes should be on the same radius');
});

test('computeTargets: ring-2 nodes are farther from centre than ring-1', () => {
  const targets = computeTargets('a', NODES, EDGES, 800, 600);
  const rB = Math.hypot(targets.get('b').x - 400, targets.get('b').y - 300);
  const rD = Math.hypot(targets.get('d').x - 400, targets.get('d').y - 300);
  assert.ok(rD > rB, 'ring-2 radius > ring-1 radius');
});

test('computeTargets: period-biased node pushed one ring further', () => {
  const nodes = [
    { id: 'center' },
    { id: 'modern', period: 2000 },
    { id: 'ancient', period: 500 },
  ];
  const edges = [
    { from: 'center', to: 'modern' },
    { from: 'center', to: 'ancient' },
  ];
  const targets = computeTargets('center', nodes, edges, 800, 600);
  const rModern = Math.hypot(targets.get('modern').x - 400, targets.get('modern').y - 300);
  const rAncient = Math.hypot(targets.get('ancient').x - 400, targets.get('ancient').y - 300);
  assert.ok(rAncient >= rModern, 'ancient node should be at same or greater radius');
});

test('computeTargets: returns a Map with an entry for every node', () => {
  const targets = computeTargets('a', NODES, EDGES, 800, 600);
  for (const n of NODES) assert.ok(targets.has(n.id), `missing target for ${n.id}`);
});
