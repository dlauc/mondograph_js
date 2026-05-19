// test/edges.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { drawEdges, clipToRadius } from '../src/edges.js';

function makeMockCtx() {
  const calls = [];
  const ctx = {
    calls,
    save:        ()        => calls.push('save'),
    restore:     ()        => calls.push('restore'),
    beginPath:   ()        => calls.push('beginPath'),
    moveTo:      (x, y)    => calls.push(['moveTo', x, y]),
    lineTo:      (x, y)    => calls.push(['lineTo', x, y]),
    stroke:      ()        => calls.push('stroke'),
    fill:        ()        => calls.push('fill'),
    translate:   (x, y)    => calls.push(['translate', x, y]),
    rotate:      (a)       => calls.push(['rotate', a]),
    closePath:   ()        => calls.push('closePath'),
    setLineDash: (d)       => calls.push(['setLineDash', d]),
    globalAlpha: 1,
    strokeStyle: '',
    lineWidth:   1,
    fillStyle:   '',
  };
  return ctx;
}

test('clipToRadius: clips point to boundary circle', () => {
  // from (0,0) to (100,0), clip 10px from (100,0)
  const p = clipToRadius(0, 0, 100, 0, 10);
  assert.ok(Math.abs(p.x - 90) < 0.01);
  assert.ok(Math.abs(p.y) < 0.01);
});

test('clipToRadius: returns target when distance < radius', () => {
  const p = clipToRadius(0, 0, 5, 0, 20);
  assert.equal(p.x, 5);
  assert.equal(p.y, 0);
});

test('drawEdges: skips edge if from-node missing', () => {
  const ctx = makeMockCtx();
  const nodeState = new Map([['b', { x:200, y:200, opacity:1, visualRadius:22 }]]);
  const theme = {
    edgeTypes: {
      _fallback: { stroke:'#666', dash:[], width:1, arrow:false },
    },
  };
  drawEdges(ctx, [{ from:'a', to:'b', type:'derives_from' }], nodeState, theme);
  assert.ok(!ctx.calls.includes('stroke'), 'should not draw when from-node absent');
});

test('drawEdges: skips edge if to-node missing', () => {
  const ctx = makeMockCtx();
  const nodeState = new Map([['a', { x:100, y:100, opacity:1, visualRadius:22 }]]);
  const theme = {
    edgeTypes: {
      _fallback: { stroke:'#666', dash:[], width:1, arrow:false },
    },
  };
  drawEdges(ctx, [{ from:'a', to:'b', type:'derives_from' }], nodeState, theme);
  assert.ok(!ctx.calls.includes('stroke'));
});

test('drawEdges: calls stroke for a valid edge', () => {
  const ctx = makeMockCtx();
  const nodeState = new Map([
    ['a', { x:100, y:100, opacity:1, visualRadius:22 }],
    ['b', { x:200, y:200, opacity:1, visualRadius:22 }],
  ]);
  const theme = {
    edgeTypes: {
      derives_from: { stroke:'#02b9b9', dash:[], width:1.8, arrow:false },
      _fallback:    { stroke:'#666',    dash:[], width:1.0, arrow:false },
    },
  };
  drawEdges(ctx, [{ from:'a', to:'b', type:'derives_from' }], nodeState, theme);
  assert.ok(ctx.calls.includes('stroke'));
});

test('drawEdges: uses _fallback for unknown edge type', () => {
  const ctx = makeMockCtx();
  const nodeState = new Map([
    ['a', { x:100, y:100, opacity:1, visualRadius:22 }],
    ['b', { x:200, y:200, opacity:1, visualRadius:22 }],
  ]);
  const theme = {
    edgeTypes: {
      _fallback: { stroke:'#666', dash:[3,3], width:1.0, arrow:false },
    },
  };
  drawEdges(ctx, [{ from:'a', to:'b', type:'unknown_type' }], nodeState, theme);
  // Should still call stroke (used _fallback)
  assert.ok(ctx.calls.includes('stroke'));
});
