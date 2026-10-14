import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pointSegmentDistance, hitTestEdges, computeEdgeGeometry, resolveEdgeStyle } from '../src/edges.js';
import { layoutChips, hitTestChips } from '../src/chips.js';
import { placeLabels, truncateToWidth } from '../src/labels.js';
import { convexHull, hullPolygon } from '../src/hulls.js';
import { readThemeTokens, resolveTheme } from '../src/theme.js';
import { sceneToSVG } from '../src/svg.js';

const ns = (pts) => new Map(Object.entries(pts).map(([id, [x, y, r = 10]]) => [id, { x, y, opacity: 1, visualRadius: r }]));

// ── Edges ──────────────────────────────────────────────────────────────────
test('pointSegmentDistance: perpendicular, endpoint and degenerate cases', () => {
  assert.equal(pointSegmentDistance(5, 3, 0, 0, 10, 0), 3);
  assert.equal(pointSegmentDistance(13, 4, 0, 0, 10, 0), 5);
  assert.equal(pointSegmentDistance(3, 4, 0, 0, 0, 0), 5);
});

test('computeEdgeGeometry clips both ends to node radii', () => {
  const g = computeEdgeGeometry([{ id: 'e', from: 'a', to: 'b' }], ns({ a: [0, 0, 10], b: [100, 0, 20] }));
  const e = g.get('e');
  assert.equal(e.x1, 10); assert.equal(e.x2, 80);
  assert.equal(e.mx, 45);
});

test('computeEdgeGeometry offsets parallel edges so each stays hittable', () => {
  const edges = [{ id: 'p1', from: 'a', to: 'b' }, { id: 'p2', from: 'b', to: 'a' }];
  const g = computeEdgeGeometry(edges, ns({ a: [0, 0], b: [100, 0] }));
  assert.notEqual(g.get('p1').y1, g.get('p2').y1);
  assert.equal(hitTestEdges(50, g.get('p1').y1, g, 2), 'p1');
  assert.equal(hitTestEdges(50, g.get('p2').y1, g, 2), 'p2');
});

test('hitTestEdges: nearest edge within tolerance, null outside, accept filter', () => {
  const edges = [{ id: 'h', from: 'a', to: 'b' }, { id: 'v', from: 'c', to: 'd' }];
  const g = computeEdgeGeometry(edges, ns({ a: [0, 0], b: [200, 0], c: [100, -100], d: [100, 100] }));
  assert.equal(hitTestEdges(50, 4, g, 6), 'h');
  assert.equal(hitTestEdges(50, 9, g, 6), null);
  assert.equal(hitTestEdges(50, 9, g, 14), 'h', 'touch tolerance');
  assert.equal(hitTestEdges(103, 50, g, 6), 'v');
  assert.equal(hitTestEdges(50, 4, g, 6, (id) => id !== 'h'), null);
  assert.equal(hitTestEdges(50, 4, [...g.entries()].map(([id, x]) => ({ id, ...x })), 6), 'h', 'array form');
});

test('resolveEdgeStyle: provenance × status × certainty × direction', () => {
  const t = resolveTheme('editorialLight');
  const base = { id: 'e', from: 'a', to: 'b', family: 'F2' };
  assert.deepEqual(resolveEdgeStyle({ ...base, provenance: 'recorded' }, t).dash, []);
  assert.deepEqual(resolveEdgeStyle({ ...base, provenance: 'modelled' }, t).dash, [6, 4]);
  const com = resolveEdgeStyle({ ...base, provenance: 'community' }, t);
  assert.deepEqual(com.dash, []); assert.equal(com.mark, 'community');
  assert.deepEqual(resolveEdgeStyle({ ...base, provenance: 'unknown' }, t).dash, [1.5, 3.5]);
  assert.equal(resolveEdgeStyle({ ...base, status: 'disputed' }, t).strike, true);
  assert.equal(resolveEdgeStyle({ ...base, status: 'suppressed' }, t).hidden, true);
  assert.equal(resolveEdgeStyle({ ...base, status: 'suppressed' }, t, { showSuppressed: true }).hidden, false);
  assert.equal(resolveEdgeStyle({ ...base, certainty: 'uncertain' }, t).uncertain, true);
  assert.equal(resolveEdgeStyle({ ...base, directed: true }, t).arrow, true);
  assert.equal(resolveEdgeStyle({ ...base, directed: true }, t, { backEdges: new Set(['e']) }).arrow, false);
  assert.equal(resolveEdgeStyle(base, t).stroke, t.edgeFamilies.F2.stroke);
  assert.equal(resolveEdgeStyle({ ...base, family: 'nope' }, t).stroke, t.edgeFamilies._default.stroke);
});

// ── Chips ──────────────────────────────────────────────────────────────────
const measure = (s) => s.length * 5;

test('layoutChips: max visible + "+k" overflow chip; suppressed hidden unless asked', () => {
  const chips = ['Иван', 'Ivan', 'Iwan', 'Yvan', 'Ivann', 'Ivane'].map((l, i) => ({ id: `c${i}`, label: l, assertionId: `a${i}` }));
  const boxes = layoutChips(chips, 100, 100, 20, { max: 4, measure });
  assert.equal(boxes.length, 4);
  const over = boxes[3].chip;
  assert.equal(over.overflow, true); assert.equal(over.count, 3); assert.equal(over.label, '+3');
  assert.ok(boxes.every(b => b.y >= 100 + 20), 'below the node');
  const sup = [{ id: 's', label: 'x', status: 'suppressed' }, { id: 'o', label: 'y' }];
  assert.equal(layoutChips(sup, 0, 0, 10, { measure }).length, 1);
  assert.equal(layoutChips(sup, 0, 0, 10, { measure, showSuppressed: true }).length, 2);
});

test('layoutChips: chips never overlap each other', () => {
  const chips = Array.from({ length: 8 }, (_, i) => ({ id: `c${i}`, label: 'Spelling' + i }));
  const b = layoutChips(chips, 0, 0, 20, { max: 8, measure });
  for (let i = 0; i < b.length; i++) for (let j = i + 1; j < b.length; j++) {
    const o = b[i].x < b[j].x + b[j].w && b[i].x + b[i].w > b[j].x && b[i].y < b[j].y + b[j].h && b[i].y + b[i].h > b[j].y;
    assert.ok(!o, `chips ${i} and ${j} overlap`);
  }
});

test('hitTestChips: returns node + chip, honours touch padding', () => {
  const chips = [{ id: 'c1', label: 'Ivan' }, { id: 'c2', label: 'Iwan' }];
  const boxes = layoutChips(chips, 100, 100, 20, { measure }).map(b => ({ ...b, nodeId: 'n' }));
  const b = boxes[1];
  assert.deepEqual(hitTestChips(b.x + 2, b.y + 2, boxes), { nodeId: 'n', chip: chips[1] });
  assert.equal(hitTestChips(b.x + b.w + 3, b.y + 2, boxes), null);
  assert.equal(hitTestChips(b.x + b.w + 3, b.y + 2, boxes, 6).chip.id, 'c2');
});

// ── Labels ─────────────────────────────────────────────────────────────────
const lm = (text, size) => text.length * size * 0.55;
const overlap = (a, b) => a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0;

test('placeLabels: isolated labels stay inside, full length', () => {
  const m = placeLabels([{ id: 'a', x: 0, y: 0, r: 22, text: 'Ivan', size: 12 }, { id: 'b', x: 300, y: 0, r: 22, text: 'Juan', size: 12 }], { measure: lm });
  assert.deepEqual([m.get('a').inside, m.get('a').text, m.get('a').truncated], [true, 'Ivan', false]);
});

test('placeLabels: a long label that would hit a neighbour moves or truncates, never overlaps', () => {
  const items = [
    { id: 'c', x: 0, y: 0, r: 30, text: 'Muhammad', size: 19, fixed: true },
    { id: 'n1', x: 70, y: 0, r: 20, text: 'Mohammed al-Something', size: 12, priority: 0.9 },
    { id: 'n2', x: 70, y: 40, r: 20, text: 'Mehmet', size: 12, priority: 0.5 },
    { id: 'n3', x: 70, y: -40, r: 20, text: 'Mamadou', size: 12, priority: 0.1 },
  ];
  const m = placeLabels(items, { measure: lm });
  assert.equal(m.get('c').text, 'Muhammad');
  const boxes = [...m.values()].filter(p => !p.hidden).map(p => p.box);
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) assert.ok(!overlap(boxes[i], boxes[j]));
  const n1 = m.get('n1');
  assert.ok(!n1.inside || n1.truncated || n1.hidden, 'n1 cannot stay inside at full length');
});

test('placeLabels: truncation uses an ellipsis; fully blocked labels hide', () => {
  assert.equal(truncateToWidth('Alexandrina', 30, (s) => s.length * 5), 'Alexa…');
  assert.equal(truncateToWidth('Al', 30, (s) => s.length * 5), 'Al');
  const items = [
    { id: 'big', x: 0, y: 0, r: 40, text: 'WWWWWWWWWW', size: 20, fixed: true },
    { id: 'under', x: 0, y: 0, r: 12, text: 'Hidden', size: 12 },
  ];
  const m = placeLabels(items, { measure: lm, obstacles: [{ x0: -500, x1: 500, y0: -500, y1: -20 }, { x0: -500, x1: 500, y0: 20, y1: 500 }] });
  assert.equal(m.get('under').hidden, true);
});

// ── Hulls ──────────────────────────────────────────────────────────────────
test('convexHull / hullPolygon: hull contains every padded circle', () => {
  assert.equal(convexHull([[0, 0], [1, 1], [2, 0], [1, 0.2], [1, -1]]).length, 4);
  const circles = [{ x: 0, y: 0, r: 10 }, { x: 100, y: 0, r: 10 }, { x: 50, y: 60, r: 10 }];
  const poly = hullPolygon(circles, 12);
  const inside = (px, py) => {
    for (let i = 0; i < poly.length; i++) {
      const a = poly[i], b = poly[(i + 1) % poly.length];
      if ((b[0] - a[0]) * (py - a[1]) - (b[1] - a[1]) * (px - a[0]) < -1e-6) return false;
    }
    return true;
  };
  for (const c of circles) { assert.ok(inside(c.x, c.y)); assert.ok(inside(c.x + 20, c.y)); }
  assert.ok(!inside(50, -40));
});

// ── Theme tokens ───────────────────────────────────────────────────────────
test('readThemeTokens: maps --mg-* properties and skips unset ones', () => {
  const vars = { '--mg-background': ' #111 ', '--mg-accent': '#0af', '--mg-edge-f2': 'red', '--mg-hull-alpha': '0.2', '--mg-lang-hrv': '#123' };
  const t = readThemeTokens((n) => vars[n] ?? '', { families: ['F2', 'F3'], langs: ['hrv'] });
  assert.equal(t.background, '#111');
  assert.equal(t.accent, '#0af'); assert.equal(t.centerGlow, '#0af');
  assert.deepEqual(t.edgeFamilies, { F2: { stroke: 'red' } });
  assert.equal(t.hullAlpha, 0.2);
  assert.deepEqual(t.langColors, { hrv: '#123' });
  assert.equal(t.nodeLabel, undefined);
  assert.deepEqual(readThemeTokens(() => ''), {});
});

// ── SVG ────────────────────────────────────────────────────────────────────
test('sceneToSVG: emits hulls, edges (dash, arrow, ?), nodes, chips; escapes text', () => {
  const svg = sceneToSVG({
    W: 200, H: 100, background: '#fff', font: 'Noto Sans', ink: '#000',
    hulls: [{ d: 'M0 0Q1 1 2 2Z', color: '#0a0', alpha: 0.1, label: 'Slavic', lx: 10, ly: 10 }],
    edges: [{ x1: 0, y1: 0, x2: 100, y2: 0, stroke: '#00f', width: 1, dash: [6, 4], alpha: 1, arrow: true, uncertain: true, strike: true }],
    nodes: [{ id: 'n<1>', x: 50, y: 50, r: 20, fill: '#fff', stroke: '#333', ink: '#000', label: 'A & B', labelSize: 12, sub: 'HRV' }],
    chips: [{ x: 0, y: 80, w: 30, h: 15, label: 'Иван', fill: '#fff', stroke: '#ccc', ink: '#000' }],
  });
  assert.match(svg, /^<svg xmlns="http:\/\/www.w3.org\/2000\/svg"/);
  assert.match(svg, /stroke-dasharray="6 4"/);
  assert.match(svg, /<polygon /);
  assert.match(svg, />\?<\/text>/);
  assert.match(svg, /A &amp; B/);
  assert.match(svg, /data-id="n&lt;1&gt;"/);
  assert.match(svg, /Иван/);
  assert.match(svg, /Slavic/);
  assert.match(svg, /<\/svg>$/);
});

test('placeLabels: a label wider than its disc (fitW) moves outside instead of spilling over the ring', () => {
  const m = placeLabels([{ id: 'a', x: 0, y: 0, r: 18, text: 'Radoslava', size: 11, fitW: 32 }], { measure: lm });
  const p = m.get('a');
  assert.equal(p.inside, false);
  assert.equal(p.text, 'Radoslava');
  assert.ok(p.dy > 18, 'below the disc');
});
