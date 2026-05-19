import { test } from 'node:test';
import assert from 'node:assert/strict';
import { hitTest, hitRadius } from '../src/hittest.js';

const nodes = [
  { id: 'a', x: 100, y: 100, hitRadius: 22 },
  { id: 'b', x: 200, y: 200, hitRadius: 22 },
];

test('hitTest: returns id of node containing pointer', () => {
  assert.equal(hitTest(100, 100, nodes), 'a');
  assert.equal(hitTest(200, 200, nodes), 'b');
});

test('hitTest: returns null when pointer misses all nodes', () => {
  assert.equal(hitTest(400, 400, nodes), null);
});

test('hitTest: returns null on boundary edge (exclusive)', () => {
  assert.equal(hitTest(100 + 22, 100, nodes), null);
});

test('hitTest: last-drawn (highest-index) node wins on overlap', () => {
  const overlapping = [
    { id: 'back',  x: 100, y: 100, hitRadius: 30 },
    { id: 'front', x: 100, y: 100, hitRadius: 30 },
  ];
  assert.equal(hitTest(100, 100, overlapping), 'front');
});

test('hitRadius: centre node has radius 38', () => {
  assert.equal(hitRadius('text', true, false), 38);
});

test('hitRadius: attestation node has radius 20 (min enforced)', () => {
  assert.equal(hitRadius('attestation', false, false), 20);
});

test('hitRadius: concept node has radius 20 (max(18,20))', () => {
  assert.equal(hitRadius('concept', false, false), 20);
});

test('hitRadius: touch adds 8px', () => {
  assert.equal(hitRadius('text', false, true), 30);
});

test('hitRadius: regular text node is 22, above min 20', () => {
  assert.equal(hitRadius('text', false, false), 22);
});
