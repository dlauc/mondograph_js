import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { installFakeDom, makeContainer } from './helpers/fakedom.js';

installFakeDom();
const { MondoGraph, ThinkGraph } = await import('../src/index.js');

const DATA = {
  nodes: [
    { id: 'ivan', label: 'Ivan', lang: 'hrv', popularity: 0.9, chips: [
      { id: 'ch1', label: 'Иван', assertionId: 'as-1' }, { id: 'ch2', label: 'Iwan', assertionId: 'as-2', status: 'disputed' },
      { id: 'ch3', label: 'Yvan', assertionId: 'as-3', status: 'suppressed' } ] },
    { id: 'juan', label: 'Juan', lang: 'spa' },
    { id: 'john', label: 'John', lang: 'eng' },
    { id: 'giovanni', label: 'Giovanni', lang: 'ita' },
    { id: 'vanja', label: 'Vanja', lang: 'hrv' },
    { id: 'ioannes', label: 'Iohannes', lang: 'lat', type: 'etymon' },
  ],
  edges: [
    { id: 'e1', from: 'ivan', to: 'juan', family: 'F2', provenance: 'recorded', label: 'Spanish form of' },
    { id: 'e2', from: 'ivan', to: 'john', family: 'F2', provenance: 'modelled', certainty: 'uncertain' },
    { id: 'e3', from: 'ivan', to: 'giovanni', family: 'F2', status: 'disputed' },
    { id: 'e4', from: 'vanja', to: 'ivan', family: 'F5', directed: true },
    { id: 'e5', from: 'ioannes', to: 'ivan', family: 'F8', directed: true },
    { id: 'e6', from: 'juan', to: 'john', family: 'F9', status: 'suppressed' },
  ],
  groups: [{ id: 'slavic', members: ['ivan', 'vanja'], label: 'Slavic' }],
};

let el, g, calls;
function make(extra = {}) {
  el = makeContainer();
  calls = { edge: [], chip: [], stub: [], select: [], center: [] };
  g = new MondoGraph({
    container: el, layout: 'sectors', theme: 'editorialLight',
    onEdgeSelect: (e) => calls.edge.push(e?.id ?? null),
    onChipSelect: (n, c) => calls.chip.push([n.id, c.id]),
    onStubSelect: (s) => calls.stub.push(s.id),
    onSelect: (n) => calls.select.push(n.id),
    onCenterChange: (id, info) => calls.center.push([id, info.reason]),
    ...extra,
  });
  return g;
}
beforeEach(() => { make(); });

const tick = () => new Promise(r => setTimeout(r, 0));

test('ThinkGraph is an alias of MondoGraph', () => {
  assert.equal(ThinkGraph, MondoGraph);
});

test('setData lays out every node deterministically, without getNeighbors', () => {
  g.setData(DATA, 'ivan');
  assert.equal(g.centerId, 'ivan');
  assert.deepEqual(g.positionOf('ivan'), { x: 400, y: 300 });
  const a = DATA.nodes.map(n => g.positionOf(n.id));
  const g2 = make(); g2.setData(DATA, 'ivan');
  assert.deepEqual(DATA.nodes.map(n => g2.positionOf(n.id)), a);
  assert.deepEqual(calls.select, ['ivan']);
});

test('history: setCenter pushes, back() pops', async () => {
  g.setData(DATA, 'ivan');
  await g.setCenter('juan');
  await g.setCenter('john');
  assert.deepEqual(g.history, ['ivan', 'juan']);
  assert.equal(g.canGoBack, true);
  assert.equal(g.back(), true);
  await tick();
  assert.equal(g.centerId, 'juan');
  assert.deepEqual(g.history, ['ivan']);
  g.back(); await tick();
  assert.equal(g.centerId, 'ivan');
  assert.equal(g.back(), false);
  assert.deepEqual(calls.center.map(c => c[1]), ['data', 'api', 'api', 'back', 'back']);
});

test('setCenter with getNeighbors fetches and replaces the scene', async () => {
  const fetched = [];
  make({ getNeighbors: async (id) => { fetched.push(id); return { nodes: DATA.nodes.slice(0, 3), edges: DATA.edges.slice(0, 2) }; } });
  await g.setCenter('juan');
  assert.deepEqual(fetched, ['juan']);
  assert.equal(g.getScene().nodes.length, 3);
});

test('setFilter fades non-matching nodes and their edges in place', () => {
  g.setData(DATA, 'ivan');
  const before = DATA.nodes.map(n => g.positionOf(n.id));
  g.setFilter((item, kind) => kind === 'node' ? item.lang !== 'hrv' : item.family !== 'F8');
  assert.deepEqual(DATA.nodes.map(n => g.positionOf(n.id)), before, 'positions unchanged');
  const r = g.renderer;
  assert.ok(r.nodeAlpha('vanja') < 0.5, 'vanja faded');
  assert.equal(r.nodeAlpha('ivan'), 1, 'centre never fades');
  assert.equal(r.nodeAlpha('juan'), 1);
  assert.ok(r.edgeAlpha(g.getScene().edges.find(e => e.id === 'e4')) < 0.5, 'edge to faded node faded');
  assert.ok(r.edgeAlpha(g.getScene().edges.find(e => e.id === 'e5')) < 0.5, 'filtered edge faded');
  g.setFilter({ node: (n) => n.id !== 'john' });
  assert.equal(r.nodeAlpha('vanja'), 1);
  assert.ok(r.nodeAlpha('john') < 0.5);
  g.setFilter(null);
  assert.equal(r.nodeAlpha('john'), 1);
});

test('highlight dims everything else; null clears', () => {
  g.setData(DATA, 'ivan');
  g.highlight(['juan', 'e1']);
  assert.equal(g.renderer.nodeAlpha('juan'), 1);
  assert.ok(g.renderer.nodeAlpha('john') < 1);
  assert.equal(g.renderer.edgeAlpha({ id: 'e1', from: 'ivan', to: 'juan' }), 1);
  g.highlight(null);
  assert.equal(g.renderer.nodeAlpha('john'), 1);
});

test('addNeighbors merges without re-centring and places new nodes near the anchor', () => {
  g.setData(DATA, 'ivan');
  const before = DATA.nodes.map(n => g.positionOf(n.id));
  const anchor = g.positionOf('juan');
  g.addNeighbors('juan', {
    nodes: [{ id: 'juana', label: 'Juana' }, { id: 'juan', label: 'Juan', popularity: 0.7 }],
    edges: [{ id: 'e7', from: 'juan', to: 'juana', family: 'F6' }],
    groups: [{ id: 'slavic', members: ['juana'] }],
  });
  assert.equal(g.centerId, 'ivan');
  assert.deepEqual(DATA.nodes.map(n => g.positionOf(n.id)), before, 'existing nodes keep their places');
  const p = g.positionOf('juana');
  assert.ok(Math.hypot(p.x - anchor.x, p.y - anchor.y) < 150, 'new node near its anchor');
  const sc = g.getScene();
  assert.ok(sc.nodes.find(n => n.id === 'juana'));
  assert.ok(sc.edges.find(e => e.id === 'e7'));
  assert.equal(sc.edges.filter(e => e.id === 'e1').length, 1, 'no duplicate edges');
  assert.deepEqual(sc.groups.find(x => x.id === 'slavic').members, ['ivan', 'vanja', 'juana']);
});

test('sectors stubs: maxPerSector collapses, stub click → onStubSelect, expandStub reveals', () => {
  const nodes = [{ id: 'c' }], edges = [];
  for (let i = 0; i < 12; i++) { nodes.push({ id: `n${i}`, popularity: 1 - i / 20 }); edges.push({ from: 'c', to: `n${i}`, family: 'F2' }); }
  g.setLayout('sectors', { maxPerSector: 5 });
  g.setData({ nodes, edges }, 'c');
  let sc = g.getScene();
  const stub = sc.nodes.find(n => n.type === 'stub');
  assert.equal(stub.id, 'more:F2');
  assert.equal(stub.count, 7);
  assert.equal(sc.nodes.length, 1 + 5 + 1);
  g._activateNode(stub.id, 'click');
  assert.deepEqual(calls.stub, ['more:F2']);
  assert.equal(g.expandStub('more:F2', 20), true);
  sc = g.getScene();
  assert.equal(sc.nodes.length, 13);
  assert.ok(!sc.nodes.find(n => n.type === 'stub'));
});

test('pick(): chips, then nodes, then edges', () => {
  make({ reducedMotion: true });
  g.setData(DATA, 'ivan');
  g.renderer.frame(1e9);
  const r = g.renderer;
  const box = r.chipBoxes.find(b => b.nodeId === 'ivan');
  assert.ok(box, 'centre chips laid out');
  assert.ok(!r.chipBoxes.some(b => b.chip.id === 'ch3'), 'suppressed chip hidden');
  const hit = g.pick(box.x + 3, box.y + 3);
  assert.equal(hit.kind, 'chip');
  assert.equal(hit.nodeId, 'ivan');
  const j = g.positionOf('juan');
  assert.deepEqual(g.pick(j.x, j.y), { kind: 'node', id: 'juan' });
  const geo = r.edgeGeom.get('e1');
  assert.deepEqual(g.pick(geo.mx, geo.my), { kind: 'edge', id: 'e1' });
  assert.equal(r.edgeGeom.has('e6'), true);
  const g6 = r.edgeGeom.get('e6');
  assert.notEqual(g.pick(g6.mx, g6.my)?.id, 'e6', 'suppressed edge not hittable');
});

test('clicks: edge → onEdgeSelect + selected state; chip → onChipSelect; background clears', () => {
  make({ reducedMotion: true });
  g.setData(DATA, 'ivan');
  g.renderer.frame(1e9);
  const canvas = g.renderer.canvas;
  const click = (x, y) => { canvas.dispatch('pointerdown', { pointerId: 1, clientX: x, clientY: y }); canvas.dispatch('pointerup', { pointerId: 1 }); canvas.dispatch('click', { clientX: x, clientY: y }); };
  const geo = g.renderer.edgeGeom.get('e1');
  click(geo.mx, geo.my);
  assert.deepEqual(calls.edge, ['e1']);
  assert.equal(g.selectedEdge.id, 'e1');
  assert.equal(g.renderer.selectedEdgeId, 'e1');
  const box = g.renderer.chipBoxes.find(b => b.chip.id === 'ch1');
  click(box.x + 2, box.y + 2);
  assert.deepEqual(calls.chip, [['ivan', 'ch1']]);
  click(5, 590);
  assert.deepEqual(calls.edge, ['e1', null]);
  assert.equal(g.selectedEdge, null);
  g.selectEdge('e2');
  assert.equal(g.renderer.selectedEdgeId, 'e2');
  assert.deepEqual(calls.edge, ['e1', null], 'programmatic select does not fire');
});

test('showSuppressed reveals suppressed edges and chips', () => {
  make({ reducedMotion: true });
  g.setData(DATA, 'ivan');
  g.setShowSuppressed(true);
  g.renderer.frame(1e9);
  assert.ok(g.renderer.chipBoxes.some(b => b.chip.id === 'ch3'));
  const g6 = g.renderer.edgeGeom.get('e6');
  assert.equal(g.pick(g6.mx, g6.my)?.id, 'e6');
});

test('labels are placed for the scene and never overlap', () => {
  g.setData(DATA, 'ivan');
  const boxes = [...g.renderer.labelPlacement.values()].filter(p => !p.hidden).map(p => p.box);
  assert.ok(boxes.length >= 5);
  for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
    const a = boxes[i], b = boxes[j];
    assert.ok(!(a.x0 < b.x1 && a.x1 > b.x0 && a.y0 < b.y1 && a.y1 > b.y0));
  }
});

test('layered layout via setLayout; back-edges drawn undirected', () => {
  g.setLayout('layered');
  g.setData({ nodes: [{ id: 'a' }, { id: 'b' }], edges: [{ id: 'ab', from: 'a', to: 'b', directed: true }, { id: 'ba', from: 'b', to: 'a', directed: true }] }, 'a');
  assert.equal(g.renderer.backEdges.size, 1);
  assert.ok(g.positionOf('a').y < g.positionOf('b').y);
});

test('layoutAdapter: async positions replace the built-in ones', async () => {
  g.setLayout('layered', { layoutAdapter: async (graph) => new Map(graph.nodes.map((n, i) => [n.id, { x: 10 + i, y: 20 }])) });
  g.setData(DATA, 'ivan');
  await tick();
  assert.deepEqual(g.positionOf('ivan'), { x: 10, y: 20 });
});

test('reduced motion: springs jump straight to their targets', () => {
  make({ reducedMotion: true });
  g.setData(DATA, 'ivan');
  g.renderer.frame(1e9);
  const s = g.renderer.springNodes.get('juan');
  const t = g.positionOf('juan');
  assert.equal(s.x, t.x); assert.equal(s.y, t.y); assert.equal(s.opacity, 1);
});

test('CSS tokens: --mg-* read at construction and on refreshTheme()', () => {
  el = makeContainer();
  el.cssVars = { '--mg-background': '#101010', '--mg-edge-f2': 'rgb(1, 2, 3)' };
  g = new MondoGraph({ container: el, theme: 'editorialLight' });
  g.setData(DATA, 'ivan');
  assert.equal(g.theme.background, '#101010');
  assert.equal(g.theme.edgeFamilies.F2.stroke, 'rgb(1, 2, 3)');
  assert.equal(g.theme.edgeFamilies.F2.width, 1.3, 'preset fills the rest');
  el.cssVars['--mg-background'] = '#fafafa';
  g.refreshTheme();
  assert.equal(g.theme.background, '#fafafa');
  delete el.cssVars['--mg-background'];
  g.refreshTheme();
  assert.equal(g.theme.background, '#fbfaf8', 'falls back to the preset');
});

test('toSVG: vector snapshot of the scene', () => {
  make({ reducedMotion: true });
  g.setData(DATA, 'ivan');
  g.renderer.frame(1e9);
  const svg = g.toSVG();
  assert.match(svg, /^<svg /);
  for (const l of ['Ivan', 'Juan', 'Giovanni', 'Slavic', 'Иван']) assert.ok(svg.includes(l), l);
  assert.ok(!svg.includes('Yvan'), 'suppressed chip omitted');
  assert.ok((svg.match(/<line /g) ?? []).length >= 5);
});

// ── Accessibility mirror ───────────────────────────────────────────────────
function mirror() { return el.children.find(c => c.attributes.role === 'application'); }
function live() { return el.children.find(c => c.attributes['aria-live'] === 'polite'); }
function nodeBtn(id) { return mirror().querySelector(`button.mg-node[data-id="${id}"]`); }
const key = (target, k) => target.dispatch('keydown', { key: k });

test('a11y: mirror lists every visible node; roving tabindex on the centre', () => {
  g.setData(DATA, 'ivan');
  const btns = mirror().querySelectorAll('button.mg-node');
  assert.equal(btns.length, DATA.nodes.length);
  assert.equal(nodeBtn('ivan').tabIndex, 0);
  assert.equal(nodeBtn('juan').tabIndex, -1);
  assert.equal(nodeBtn('ivan').attributes['aria-current'], 'true');
  // focused node exposes its edges and chips as tabbable buttons
  const edges = mirror().querySelectorAll('button.mg-edge');
  const chips = mirror().querySelectorAll('button.mg-chip');
  assert.equal(edges.length, 5, 'suppressed edge e6 is not incident to ivan; 5 links');
  assert.equal(chips.length, 2, 'suppressed chip omitted');
});

test('a11y: arrows walk neighbours, Enter re-centres, Esc goes back, announcements', async () => {
  g.setData(DATA, 'ivan');
  nodeBtn('ivan').focus();
  key(nodeBtn('ivan'), 'ArrowRight');
  const first = document.activeElement;
  assert.equal(first.classList.contains('mg-node'), true);
  assert.notEqual(first.dataset.id, 'ivan');
  assert.equal(g.renderer.focusedId, first.dataset.id);
  await new Promise(r => setTimeout(r, 40));
  assert.match(live().textContent, / of 5$/);
  key(first, 'ArrowRight');
  const second = document.activeElement;
  assert.notEqual(second.dataset.id, first.dataset.id);
  key(second, 'ArrowLeft');
  assert.equal(document.activeElement.dataset.id, first.dataset.id);
  const target = document.activeElement.dataset.id;
  key(document.activeElement, 'Enter');
  await tick();
  assert.equal(g.centerId, target);
  key(document.activeElement, 'Escape');
  await tick();
  assert.equal(g.centerId, 'ivan');
});

test('a11y: describeNode / describeEdge hooks shape the announcement', async () => {
  make({ describeNode: (n, ctx) => ctx.edge ? `${n.label}, ${ctx.edge.label ?? 'link'} ${ctx.anchor.label}, ${ctx.index} of ${ctx.total}` : n.label });
  g.setData(DATA, 'ivan');
  nodeBtn('ivan').focus();
  g.focus('juan');
  await new Promise(r => setTimeout(r, 40));
  assert.equal(live().textContent, 'Juan, Spanish form of Ivan, ' + live().textContent.split(', ').slice(-1)[0]);
  assert.match(live().textContent, /^Juan, Spanish form of Ivan, \d of 5$/);
});

test('a11y: Enter on an edge button selects it and fires onEdgeSelect; Esc returns to the node', () => {
  g.setData(DATA, 'ivan');
  nodeBtn('ivan').focus();
  const eb = mirror().querySelector('button.mg-edge[data-edge-id="e1"]');
  eb.focus();
  assert.equal(g.renderer.focusedEdgeId, 'e1');
  key(eb, 'Enter');
  assert.deepEqual(calls.edge, ['e1']);
  assert.equal(g.selectedEdge.id, 'e1');
  key(eb, 'Escape');
  assert.equal(document.activeElement, nodeBtn('ivan'));
  const cb = mirror().querySelector('button.mg-chip[data-chip-id="ch2"]');
  cb.focus();
  assert.deepEqual(g.renderer.focusedChip, { nodeId: 'ivan', chipId: 'ch2' });
  key(cb, ' ');
  assert.deepEqual(calls.chip, [['ivan', 'ch2']]);
});

test('a11y: ArrowDown steps into a neighbour\'s own links, ArrowUp steps back out', () => {
  g.setData({ nodes: [{ id: 'c' }, { id: 'a' }, { id: 'a1' }], edges: [{ from: 'c', to: 'a' }, { from: 'a', to: 'a1' }] }, 'c');
  nodeBtn('c').focus();
  key(nodeBtn('c'), 'ArrowRight');
  assert.equal(document.activeElement.dataset.id, 'a');
  key(document.activeElement, 'ArrowDown');
  assert.equal(document.activeElement.dataset.id, 'a1');
  key(document.activeElement, 'ArrowUp');
  assert.equal(document.activeElement.dataset.id, 'a');
  key(document.activeElement, 'Home');
  assert.equal(document.activeElement.dataset.id, 'c');
});

test('filtered nodes leave the mirror and keyboard walk', () => {
  g.setData(DATA, 'ivan');
  g.setFilter((x, kind) => kind !== 'node' || x.id !== 'juan');
  assert.equal(nodeBtn('juan'), null);
  assert.equal(mirror().querySelectorAll('button.mg-edge').length, 4);
});

test('destroy removes canvas, mirror and live region', () => {
  g.setData(DATA, 'ivan');
  g.destroy();
  assert.equal(el.children.length, 0);
});

test('determinism: two graphs on the same data export the identical SVG', () => {
  const svgOf = () => { make({ reducedMotion: true }); g.setData(DATA, 'ivan'); g.renderer.frame(1e9); return g.toSVG(); };
  assert.equal(svgOf(), svgOf());
});

test('a11y: every incident edge gets a button, even two between the same pair', () => {
  g.setData({ nodes: [{ id: 'a' }, { id: 'b' }], edges: [{ id: 'x1', from: 'a', to: 'b', family: 'F2' }, { id: 'x2', from: 'b', to: 'a', family: 'F3' }] }, 'a');
  assert.deepEqual(mirror().querySelectorAll('button.mg-edge').map(b => b.dataset.edgeId).sort(), ['x1', 'x2']);
});

test('edgeFocus: the centre’s edges and the node in hand stay strong, the rest faint', () => {
  const host = makeContainer();
  const fg = new MondoGraph({ container: host, data: DATA, centerId: 'ivan', edgeFocus: true, theme: 'editorialLight' });
  const e6 = fg._edgeById.get('e6'), e1 = fg._edgeById.get('e1');
  assert.equal(fg._edgeAlphaOf(e1), 1);
  assert.equal(fg._edgeAlphaOf(e6), 0.12);
  fg._renderer.hoveredId = 'juan';
  assert.equal(fg._edgeAlphaOf(e6), 1);
  fg._renderer.hoveredId = null;
  fg.selectEdge('e6');
  assert.equal(fg._edgeAlphaOf(e6), 1);
  fg.destroy();
  const plain = new MondoGraph({ container: makeContainer(), data: DATA, centerId: 'ivan', theme: 'editorialLight' });
  assert.equal(plain._edgeAlphaOf(plain._edgeById.get('e6')), 1);
  plain.destroy();
});

test('labels: "inside" passes insideOnly to placement: every label is in its disc', () => {
  const fg = new MondoGraph({ container: makeContainer(), data: DATA, centerId: 'ivan', labels: 'inside', theme: 'editorialLight' });
  assert.ok(fg._renderer.labelPlacement.size >= 5)
  for (const [, p] of fg._renderer.labelPlacement) { assert.equal(p.inside, true); assert.equal(p.dx, 0) }
  fg.destroy();
});
