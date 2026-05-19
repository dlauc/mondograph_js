import { test } from 'node:test';
import assert from 'node:assert/strict';
import { springStep, createSpringNode, tickSprings } from '../src/spring.js';

test('springStep: moves position toward target', () => {
  const r = springStep(0, 0, 100, 0.1, 0.74);
  assert.ok(r.pos > 0, 'position should increase toward target 100');
  assert.ok(r.pos < 100, 'position should not overshoot immediately');
});

test('springStep: produces non-zero velocity', () => {
  const r = springStep(0, 0, 100, 0.1, 0.74);
  assert.ok(r.vel > 0);
});

test('springStep: converges to target after many steps', () => {
  let pos = 0, vel = 0;
  for (let i = 0; i < 200; i++) {
    ({ pos, vel } = springStep(pos, vel, 100, 0.1, 0.74));
  }
  assert.ok(Math.abs(pos - 100) < 0.01, `expected ~100, got ${pos}`);
});

test('springStep: at rest, position does not change', () => {
  const r = springStep(50, 0, 50, 0.1, 0.74);
  assert.equal(r.pos, 50);
  assert.equal(r.vel, 0);
});

test('createSpringNode: default opacity 1', () => {
  const s = createSpringNode(10, 20);
  assert.equal(s.x, 10);
  assert.equal(s.y, 20);
  assert.equal(s.opacity, 1);
  assert.equal(s.vx, 0);
});

test('createSpringNode: custom opacity', () => {
  const s = createSpringNode(0, 0, 0);
  assert.equal(s.opacity, 0);
  assert.equal(s.targetOpacity, 0);
});

test('tickSprings: advances x toward targetX', () => {
  const nodes = new Map([['n', createSpringNode(0, 0)]]);
  nodes.get('n').targetX = 100;
  nodes.get('n').targetY = 0;
  const posSpring = { K: 0.1, damping: 0.74 };
  const opSpring  = { K: 0.12, damping: 0.80 };
  tickSprings(nodes, posSpring, opSpring);
  assert.ok(nodes.get('n').x > 0);
});

test('tickSprings: advances opacity toward targetOpacity', () => {
  const nodes = new Map([['n', createSpringNode(0, 0, 0)]]);
  nodes.get('n').targetOpacity = 1;
  tickSprings(nodes, { K: 0.1, damping: 0.74 }, { K: 0.12, damping: 0.80 });
  assert.ok(nodes.get('n').opacity > 0);
});
