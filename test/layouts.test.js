import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { layouts, sectors, layered, similarity, rings, placeAround, registerLayout } from '../src/layouts/index.js';
import { normalizeEdges } from '../src/graphutil.js';

const W = 800, H = 600;
const near = (a, b, eps = 1e-6) => Math.abs(a - b) < eps;
const angleOf = (p) => Math.atan2(p.y - H / 2, p.x - W / 2);
const radiusOf = (p) => Math.hypot(p.x - W / 2, p.y - H / 2);

function star(families) {
  // centre c + n nodes per family, joined to c by an edge of that family
  const nodes = [{ id: 'c' }], edges = [];
  for (const [fam, n] of Object.entries(families)) {
    for (let i = 0; i < n; i++) {
      const id = `${fam}-${i}`;
      nodes.push({ id, popularity: 1 - i / (n + 1) });
      edges.push({ from: 'c', to: id, family: fam });
    }
  }
  return { nodes, edges: normalizeEdges(edges) };
}

test('registry exposes the four built-in layouts', () => {
  for (const k of ['rings', 'sectors', 'layered', 'similarity']) assert.equal(typeof layouts[k], 'function');
  registerLayout('custom-test', () => new Map());
  assert.equal(typeof layouts['custom-test'], 'function');
  assert.throws(() => registerLayout('bad', 42));
});

test('rings plug-in matches the legacy computeTargets', () => {
  const g = star({ A: 3 });
  const m = rings(g, { W, H, centerId: 'c' });
  assert.deepEqual(m.get('c'), { x: 400, y: 300 });
  assert.equal(m.size, 4);
});

test('sectors: deterministic (same input → identical output)', () => {
  const g = star({ F2: 6, F3: 3, F5: 2 });
  const a = sectors(g, { W, H, centerId: 'c' });
  const b = sectors(structuredClone(g), { W, H, centerId: 'c' });
  assert.deepEqual([...a.entries()], [...b.entries()]);
});

test('sectors: nodes of one family share one contiguous angular sector', () => {
  const g = star({ F2: 6, F3: 3, F5: 2 });
  const m = sectors(g, { W, H, centerId: 'c' });
  assert.deepEqual(m.sectors.map(s => s.family), ['F2', 'F3', 'F5']);
  for (const s of m.sectors) {
    for (const n of g.nodes.filter(n => n.id.startsWith(s.family + '-'))) {
      let a = angleOf(m.get(n.id));
      while (a < s.start) a += 2 * Math.PI;
      while (a > s.end) a -= 2 * Math.PI;
      assert.ok(a >= s.start - 1e-9 && a <= s.end + 1e-9, `${n.id} outside sector ${s.family}`);
      assert.equal(m.family.get(n.id), s.family);
    }
  }
});

test('sectors: sector width is proportional to node count (above the minimum)', () => {
  const g = star({ big: 12, small: 4 });
  const m = sectors(g, { W, H, centerId: 'c', minSectorAngle: 0 });
  const w = Object.fromEntries(m.sectors.map(s => [s.family, s.end - s.start]));
  assert.ok(near(w.big / w.small, 3, 1e-9));
});

test('sectors: sectorOrder controls order and multi-family centre edges', () => {
  const g = star({ F7: 2, F2: 2 });
  g.edges.push(...normalizeEdges([{ from: 'F7-0', to: 'c', family: 'F2' }]));
  const m = sectors(g, { W, H, centerId: 'c', sectorOrder: ['F2', 'F7'] });
  assert.equal(m.sectors[0].family, 'F2');
  assert.equal(m.family.get('F7-0'), 'F2', 'earliest family in sectorOrder wins');
  assert.equal(m.family.get('F7-1'), 'F7');
});

test('sectors: node.family and node.ring override; hop-2 nodes inherit their parent sector', () => {
  const nodes = [{ id: 'c' }, { id: 'a' }, { id: 'b', family: 'X', ring: 2 }, { id: 'a2' }];
  const edges = normalizeEdges([{ from: 'c', to: 'a', family: 'F5' }, { from: 'c', to: 'b', family: 'F5' }, { from: 'a', to: 'a2', family: 'F9' }]);
  const m = sectors({ nodes, edges }, { W, H, centerId: 'c' });
  assert.equal(m.family.get('b'), 'X');
  assert.equal(m.family.get('a2'), 'F5');
  assert.ok(radiusOf(m.get('a2')) > radiusOf(m.get('a')) + 1, 'hop-2 sits on an outer ring');
  assert.ok(radiusOf(m.get('b')) > radiusOf(m.get('a')) + 1, 'explicit ring honoured');
});

test('sectors: overflow past maxPerSector collapses into a stub', () => {
  const g = star({ F2: 10, F3: 2 });
  const m = sectors(g, { W, H, centerId: 'c', maxPerSector: 4 });
  assert.equal(m.stubs.length, 1);
  const stub = m.stubs[0];
  assert.equal(stub.id, 'more:F2');
  assert.equal(stub.type, 'stub');
  assert.equal(stub.count, 6);
  assert.equal(stub.members.length, 6);
  assert.ok(m.has(stub.id), 'stub is positioned');
  // highest-popularity nodes stay visible
  for (let i = 0; i < 4; i++) assert.ok(m.has(`F2-${i}`));
  for (let i = 4; i < 10; i++) { assert.ok(!m.has(`F2-${i}`)); assert.equal(m.collapsed.get(`F2-${i}`), 'more:F2'); }
  assert.ok(m.has('F3-0') && m.has('F3-1'));
});

test('sectors: sectorExtra expands a collapsed sector', () => {
  const g = star({ F2: 10 });
  const m = sectors(g, { W, H, centerId: 'c', maxPerSector: 4, sectorExtra: { F2: 20 } });
  assert.equal(m.stubs.length, 0);
  assert.equal(m.size, 11);
});

test('sectors: crowded rings stagger radially to keep a label gap', () => {
  const g = star({ only: 40 });
  const m = sectors(g, { W, H, centerId: 'c', minLabelGap: 64, maxRows: 3 });
  const radii = new Set(g.nodes.slice(1).map(n => Math.round(radiusOf(m.get(n.id)))));
  assert.ok(radii.size > 1, 'more than one radius used');
});

test('layered: longest-path layering puts ancestors above descendants', () => {
  const nodes = ['root', 'a', 'b', 'leaf', 'side'].map(id => ({ id }));
  const edges = normalizeEdges([
    { from: 'root', to: 'a', directed: true }, { from: 'a', to: 'leaf', directed: true },
    { from: 'root', to: 'b', directed: true }, { from: 'b', to: 'leaf', directed: true },
    { from: 'root', to: 'leaf', directed: true },
    { from: 'side', to: 'a' },              // undirected: same layer as a
  ]);
  const m = layered({ nodes, edges }, { W, H, centerId: 'leaf' });
  assert.equal(m.layers.get('root'), 0);
  assert.equal(m.layers.get('a'), 1);
  assert.equal(m.layers.get('b'), 1);
  assert.equal(m.layers.get('leaf'), 2, 'longest path, not shortest');
  assert.equal(m.layers.get('side'), 1);
  assert.ok(m.get('root').y < m.get('a').y && m.get('a').y < m.get('leaf').y);
  assert.equal(m.backEdges.size, 0);
});

test('layered: cycles become undirected back-edges and layering still terminates', () => {
  const nodes = ['x', 'y', 'z'].map(id => ({ id }));
  const edges = normalizeEdges([
    { id: 'xy', from: 'x', to: 'y', directed: true },
    { id: 'yz', from: 'y', to: 'z', directed: true },
    { id: 'zx', from: 'z', to: 'x', directed: true },
  ]);
  const m = layered({ nodes, edges }, { W, H, centerId: 'x' });
  assert.deepEqual([...m.backEdges], ['zx']);
  assert.equal(m.layers.get('x'), 0);
  assert.equal(m.layers.get('y'), 1);
  assert.equal(m.layers.get('z'), 2);
});

test('layered: two-cycle (both directions asserted)', () => {
  const nodes = [{ id: 'p' }, { id: 'q' }];
  const edges = normalizeEdges([{ id: 'pq', from: 'p', to: 'q', directed: true }, { id: 'qp', from: 'q', to: 'p', directed: true }]);
  const m = layered({ nodes, edges }, { W, H, centerId: 'p' });
  assert.equal(m.backEdges.size, 1);
  assert.notEqual(m.layers.get('p'), m.layers.get('q'));
});

test('layered: barycentre ordering removes an avoidable crossing', () => {
  const nodes = ['r1', 'r2', 'c1', 'c2'].map(id => ({ id }));
  // input order makes r1→c2 and r2→c1 cross
  const edges = normalizeEdges([{ from: 'r1', to: 'c2', directed: true }, { from: 'r2', to: 'c1', directed: true }]);
  const m = layered({ nodes, edges }, { W, H });
  const order = (a, b) => Math.sign(m.get(a).x - m.get(b).x);
  assert.equal(order('r1', 'r2'), order('c2', 'c1'), 'children follow their parents');
});

test('layered: deterministic, LR direction swaps axes', () => {
  const nodes = ['a', 'b', 'c'].map(id => ({ id }));
  const edges = normalizeEdges([{ from: 'a', to: 'b', directed: true }, { from: 'b', to: 'c', directed: true }]);
  const tb = layered({ nodes, edges }, { W, H });
  assert.deepEqual([...tb], [...layered({ nodes, edges }, { W, H })]);
  const lr = layered({ nodes, edges }, { W, H, direction: 'LR' });
  assert.ok(lr.get('a').x < lr.get('b').x && lr.get('b').x < lr.get('c').x);
  assert.ok(near(lr.get('a').y, lr.get('c').y));
});

test('similarity: radius = minRadius + (1 − score)·(R − minRadius)', () => {
  const nodes = [{ id: 'c' }, { id: 'hi', score: 1 }, { id: 'mid', score: 0.5 }, { id: 'lo', score: 0 }, { id: 'e' }];
  const edges = normalizeEdges([{ from: 'c', to: 'e', score: 0.75 }]);
  const m = similarity({ nodes, edges }, { W, H, centerId: 'c', minRadius: 60, margin: 40 });
  const R = Math.min(W, H) / 2 - 40;
  assert.ok(near(m.radius.get('hi'), 60));
  assert.ok(near(m.radius.get('lo'), R));
  assert.ok(near(m.radius.get('mid'), 60 + 0.5 * (R - 60)));
  assert.ok(near(m.radius.get('e'), 60 + 0.25 * (R - 60)), 'edge score used when node has none');
  assert.ok(near(radiusOf(m.get('mid')), m.radius.get('mid'), 1e-9));
  assert.deepEqual(m.get('c'), { x: 400, y: 300 });
});

test('placeAround: fans new nodes on the far side of the anchor', () => {
  const m = placeAround({ x: 600, y: 300 }, { x: 400, y: 300 }, ['n1', 'n2', 'n3']);
  for (const p of m.values()) assert.ok(p.x > 600 - 1e-6, 'away from the centre');
  assert.deepEqual([...m], [...placeAround({ x: 600, y: 300 }, { x: 400, y: 300 }, ['n1', 'n2', 'n3'])]);
});

test('no Math.random anywhere in src/', () => {
  const root = join(dirname(fileURLToPath(import.meta.url)), '..', 'src');
  const walk = (d) => readdirSync(d).flatMap(f => {
    const p = join(d, f);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
  for (const f of walk(root).filter(f => f.endsWith('.js'))) {
    assert.ok(!/Math\.random/.test(readFileSync(f, 'utf8')), `Math.random in ${f}`);
  }
});
