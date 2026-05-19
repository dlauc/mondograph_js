# ThinkGraph Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build `thinkgraph` — a zero-dependency Canvas 2D JavaScript library that renders ThinkMap-style radial graph visualisations with spring-animated re-centring, an async neighbor callback, and a Mondonomo design theme.

**Architecture:** Nodes are placed on BFS-distance rings (0 = focus, 1–3 = neighbours) around a fixed centre. When the user clicks a new centre, `getNeighbors(id)` is called, new ring targets are computed, and a per-node damped spring interpolates every node to its new position at 60 fps on a Canvas 2D context. Rendering is split across pure functions (layout, spring math, hit testing) and stateful classes (Renderer, ThinkGraph).

**Tech Stack:** Vanilla ES modules, Canvas 2D API, Node built-in test runner (`node:test` + `node:assert`), esbuild for bundling.

---

## File Map

```
thinkgraph/
├── src/
│   ├── index.js            ThinkGraph class — public API, event wiring
│   ├── layout.js           BFS + radial ring position computation (pure)
│   ├── spring.js           Per-node spring state + tick (pure)
│   ├── hittest.js          Pointer → node resolution (pure)
│   ├── theme.js            Mondonomo tokens + deep-merge (pure)
│   ├── edges.js            Edge line + arrowhead draw calls
│   ├── renderer.js         Renderer class — rAF loop, pan/zoom, draw order
│   ├── tooltip.js          Tooltip class — absolute HTML div
│   └── renderers/
│       ├── text.js         text/concept/referent/element/attestation nodes
│       ├── flag.js         flag image nodes (async load + clip)
│       └── image.js        avatar image nodes (async load + initials fallback)
├── test/
│   ├── theme.test.js
│   ├── layout.test.js
│   ├── spring.test.js
│   ├── hittest.test.js
│   └── edges.test.js
├── examples/
│   ├── etymology/index.html
│   └── world/index.html
├── package.json
└── build.js
```

---

## Task 1: Project Scaffold

**Files:**
- Create: `package.json`
- Create: `build.js`
- Create: `.gitignore`

- [ ] **Step 1: Write `package.json`**

```json
{
  "name": "thinkgraph",
  "version": "0.1.0",
  "type": "module",
  "main": "dist/thinkgraph.umd.js",
  "module": "dist/thinkgraph.esm.js",
  "exports": {
    ".": {
      "import": "./dist/thinkgraph.esm.js",
      "default": "./dist/thinkgraph.umd.js"
    }
  },
  "scripts": {
    "test":  "node --test test/**/*.test.js",
    "build": "node build.js",
    "dev":   "node --watch --test test/**/*.test.js"
  },
  "devDependencies": {
    "esbuild": "^0.21.0"
  }
}
```

- [ ] **Step 2: Install dev dependency**

```bash
cd /Users/davor/projekti/ThinkMap_clone && npm install
```

Expected: `node_modules/esbuild` present, no errors.

- [ ] **Step 3: Write `build.js`**

```js
import * as esbuild from 'esbuild';

const shared = {
  entryPoints: ['src/index.js'],
  bundle: true,
  sourcemap: true,
  target: ['es2020'],
};

await esbuild.build({ ...shared, format: 'esm',  outfile: 'dist/thinkgraph.esm.js' });
await esbuild.build({ ...shared, format: 'iife', globalName: 'ThinkGraphLib', outfile: 'dist/thinkgraph.umd.js' });

console.log('Build complete.');
```

- [ ] **Step 4: Write `.gitignore`**

```
node_modules/
dist/
.superpowers/
```

- [ ] **Step 5: Create src and test directories**

```bash
mkdir -p src/renderers test examples/etymology examples/world
```

- [ ] **Step 6: Commit**

```bash
git add package.json build.js .gitignore
git commit -m "chore: project scaffold (package.json, esbuild, gitignore)"
```

---

## Task 2: `src/theme.js`

**Files:**
- Create: `src/theme.js`
- Create: `test/theme.test.js`

- [ ] **Step 1: Write the failing tests**

```js
// test/theme.test.js
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { resolveTheme, langColor } from '../src/theme.js';

test('resolveTheme("mondonomo") returns full token object', () => {
  const t = resolveTheme('mondonomo');
  assert.equal(t.background, '#020f20');
  assert.equal(t.spring.K, 0.10);
  assert.ok(t.edgeTypes.derives_from);
  assert.ok(t.nodeTypes.text);
  assert.ok(t.nodeTypes.concept);
});

test('resolveTheme(null) returns mondonomo defaults', () => {
  const t = resolveTheme(null);
  assert.equal(t.background, '#020f20');
});

test('resolveTheme partial override deep-merges', () => {
  const t = resolveTheme({ background: '#fff', spring: { K: 0.5 } });
  assert.equal(t.background, '#fff');
  assert.equal(t.spring.K, 0.5);
  assert.equal(t.spring.damping, 0.74); // mondonomo default preserved
  assert.equal(t.centerGlow, '#02b9b9'); // unrelated key preserved
});

test('resolveTheme returns a fresh clone each call', () => {
  const a = resolveTheme('mondonomo');
  const b = resolveTheme('mondonomo');
  a.background = 'mutated';
  assert.equal(b.background, '#020f20');
});

test('langColor returns brand teal for English', () => {
  const t = resolveTheme('mondonomo');
  assert.equal(langColor(t, 'English'), '#02b9b9');
});

test('langColor returns fallback grey for unknown lang', () => {
  const t = resolveTheme('mondonomo');
  assert.equal(langColor(t, 'Klingon'), '#888888');
});

test('edgeTypes._fallback exists for unknown edge type', () => {
  const t = resolveTheme('mondonomo');
  assert.ok(t.edgeTypes._fallback);
  assert.equal(t.edgeTypes._fallback.stroke, '#666666');
});
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npm test -- --test-name-pattern="theme"
```

Expected: `ERR_MODULE_NOT_FOUND` for `../src/theme.js`.

- [ ] **Step 3: Write `src/theme.js`**

```js
const MONDONOMO = {
  background:   '#020f20',
  ringStroke:   '#02b9b9',
  centerGlow:   '#02b9b9',
  font:         '"Noto Sans", sans-serif',
  fontWeight:   { label: 700, sub: 400 },
  spring:       { K: 0.10, damping: 0.74 },
  opacitySpring:{ K: 0.12, damping: 0.80 },

  langColors: {
    English:      '#02b9b9',
    French:       '#7E4067',
    Spanish:      '#9a5080',
    Latin:        '#c99ab8',
    Greek:        '#add8f3',
    Hebrew:       '#6ac9df',
    'Proto-Sem.': '#557799',
  },

  edgeTypes: {
    derives_from: { stroke: '#02b9b9', dash: [],    width: 1.8, arrow: true  },
    cognate_of:   { stroke: '#7E4067', dash: [5,3], width: 1.4, arrow: false },
    means:        { stroke: '#e8b84b', dash: [2,4], width: 1.1, arrow: true  },
    refers_to:    { stroke: '#c16b9a', dash: [2,4], width: 1.1, arrow: false },
    attested_as:  { stroke: '#e07050', dash: [2,3], width: 0.9, arrow: false },
    popular_in:   { stroke: '#02b9b9', dash: [],    width: 1.4, arrow: false },
    variant_of:   { stroke: '#7E4067', dash: [4,3], width: 1.2, arrow: false },
    _fallback:    { stroke: '#666666', dash: [3,3], width: 1.0, arrow: false },
  },

  nodeTypes: {
    text:        { fill: '#020f20', stroke: 'langColor', shape: 'circle'  },
    flag:        { fill: 'image',   stroke: '#02b9b9',   shape: 'circle'  },
    image:       { fill: 'image',   stroke: '#02b9b9',   shape: 'circle'  },
    concept:     { fill: '#020f20', stroke: '#e8b84b',   shape: 'ellipse', dash: [3,2] },
    referent:    { fill: '#020f20', stroke: '#c16b9a',   shape: 'diamond', dash: [3,2] },
    element:     { fill: '#020f20', stroke: 'langColor', shape: 'pill',    opacity: 0.6 },
    attestation: { fill: '#020f20', stroke: '#e07050',   shape: 'pin'     },
  },

  qualityOpacity: [1.0, 0.85, 0.65, 0.45],
};

function deepMerge(base, override) {
  const result = { ...base };
  for (const key of Object.keys(override)) {
    const bv = base[key], ov = override[key];
    if (ov !== null && typeof ov === 'object' && !Array.isArray(ov)
        && bv !== null && typeof bv === 'object' && !Array.isArray(bv)) {
      result[key] = deepMerge(bv, ov);
    } else {
      result[key] = ov;
    }
  }
  return result;
}

export function resolveTheme(input) {
  if (!input || input === 'mondonomo') return structuredClone(MONDONOMO);
  return deepMerge(structuredClone(MONDONOMO), input);
}

export function langColor(theme, lang) {
  return theme.langColors[lang] ?? '#888888';
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npm test -- --test-name-pattern="theme"
```

Expected: 7 passing.

- [ ] **Step 5: Commit**

```bash
git add src/theme.js test/theme.test.js
git commit -m "feat: theme tokens and deep-merge (resolveTheme, langColor)"
```

---

## Task 3: `src/layout.js`

**Files:**
- Create: `src/layout.js`
- Create: `test/layout.test.js`

- [ ] **Step 1: Write the failing tests**

```js
// test/layout.test.js
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
  assert.equal(rings.get('5'), 3); // capped, not 4
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
    { id: 'ancient', period: 500 },   // 1526 years ago → nudge +3 rings → capped at 3
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
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npm test -- --test-name-pattern="layout"
```

Expected: `ERR_MODULE_NOT_FOUND` for `../src/layout.js`.

- [ ] **Step 3: Write `src/layout.js`**

```js
const RING_RADIUS_FACTORS = [0, 0.22, 0.38, 0.50];
const RING_START_ANGLES   = [-Math.PI / 2, -Math.PI * 0.7, -Math.PI / 2];

/**
 * BFS from centerId over undirected edges. Returns ring index (0–3) per node.
 * @param {string} centerId
 * @param {Array<{id:string}>} nodes
 * @param {Array<{from:string,to:string}>} edges
 * @returns {Map<string,number>}
 */
export function computeRings(centerId, nodes, edges) {
  const adj = new Map(nodes.map(n => [n.id, []]));
  for (const e of edges) {
    adj.get(e.from)?.push(e.to);
    adj.get(e.to)?.push(e.from);
  }

  const dist = new Map([[centerId, 0]]);
  const queue = [centerId];
  while (queue.length) {
    const cur = queue.shift();
    for (const nb of (adj.get(cur) ?? [])) {
      if (!dist.has(nb)) {
        dist.set(nb, Math.min(dist.get(cur) + 1, 3));
        queue.push(nb);
      }
    }
  }
  return dist;
}

/**
 * Compute canvas target {x,y} for every node.
 * @param {string} centerId
 * @param {Array<{id:string,period?:number}>} nodes
 * @param {Array<{from:string,to:string}>} edges
 * @param {number} W canvas width  (logical px)
 * @param {number} H canvas height (logical px)
 * @returns {Map<string,{x:number,y:number}>}
 */
export function computeTargets(centerId, nodes, edges, W, H) {
  const rings   = computeRings(centerId, nodes, edges);
  const cx = W / 2, cy = H / 2;
  const minDim  = Math.min(W, H);
  const nowYear = new Date().getFullYear();

  // Group nodes into their (possibly period-biased) ring
  const byRing = [[], [], [], []];
  for (const node of nodes) {
    let ring = rings.get(node.id) ?? 3;
    if (node.period != null && ring > 0) {
      const yearsAgo = nowYear - node.period;
      ring = Math.min(ring + Math.floor(yearsAgo / 500), 3);
    }
    byRing[ring].push(node.id);
  }

  const targets = new Map();
  targets.set(centerId, { x: cx, y: cy });

  for (let d = 1; d <= 3; d++) {
    const ring = byRing[d];
    if (!ring.length) continue;
    const r     = minDim * RING_RADIUS_FACTORS[d];
    const start = RING_START_ANGLES[d - 1];
    const step  = (2 * Math.PI) / ring.length;
    ring.forEach((id, i) => {
      const angle = start + step * i;
      targets.set(id, { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
    });
  }

  return targets;
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npm test -- --test-name-pattern="layout"
```

Expected: 10 passing.

- [ ] **Step 5: Commit**

```bash
git add src/layout.js test/layout.test.js
git commit -m "feat: BFS radial layout engine (computeRings, computeTargets)"
```

---

## Task 4: `src/spring.js`

**Files:**
- Create: `src/spring.js`
- Create: `test/spring.test.js`

- [ ] **Step 1: Write the failing tests**

```js
// test/spring.test.js
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
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npm test -- --test-name-pattern="spring"
```

Expected: `ERR_MODULE_NOT_FOUND`.

- [ ] **Step 3: Write `src/spring.js`**

```js
/**
 * One damped spring step for a single axis.
 * @param {number} pos     current position
 * @param {number} vel     current velocity
 * @param {number} target  target position
 * @param {number} K       spring constant  (e.g. 0.10)
 * @param {number} damping damping factor   (e.g. 0.74)
 * @returns {{ pos: number, vel: number }}
 */
export function springStep(pos, vel, target, K, damping) {
  const force  = K * (target - pos);
  const newVel = (vel + force) * damping;
  return { pos: pos + newVel, vel: newVel };
}

/**
 * Create a new spring node state initialised at (x, y).
 * @param {number} x
 * @param {number} y
 * @param {number} [opacity=1]
 * @returns {{ x,y,vx,vy,opacity,vOpacity,targetX,targetY,targetOpacity }}
 */
export function createSpringNode(x, y, opacity = 1) {
  return {
    x, y, vx: 0, vy: 0,
    opacity, vOpacity: 0,
    targetX: x, targetY: y, targetOpacity: opacity,
  };
}

/**
 * Advance every spring node by one frame (mutates in place).
 * @param {Map<string, object>} springNodes
 * @param {{ K:number, damping:number }} posSpring
 * @param {{ K:number, damping:number }} opSpring
 */
export function tickSprings(springNodes, posSpring, opSpring) {
  for (const s of springNodes.values()) {
    const rx = springStep(s.x,       s.vx,       s.targetX,       posSpring.K, posSpring.damping);
    const ry = springStep(s.y,       s.vy,       s.targetY,       posSpring.K, posSpring.damping);
    const ro = springStep(s.opacity, s.vOpacity, s.targetOpacity, opSpring.K,  opSpring.damping);
    s.x = rx.pos; s.vx = rx.vel;
    s.y = ry.pos; s.vy = ry.vel;
    s.opacity = ro.pos; s.vOpacity = ro.vel;
  }
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npm test -- --test-name-pattern="spring"
```

Expected: 8 passing.

- [ ] **Step 5: Commit**

```bash
git add src/spring.js test/spring.test.js
git commit -m "feat: per-node damped spring (springStep, createSpringNode, tickSprings)"
```

---

## Task 5: `src/hittest.js`

**Files:**
- Create: `src/hittest.js`
- Create: `test/hittest.test.js`

- [ ] **Step 1: Write the failing tests**

```js
// test/hittest.test.js
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
  // pointer at exactly hitRadius distance
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
  assert.equal(hitRadius('attestation', false, false), 20); // max(8, 20) = 20
});

test('hitRadius: concept node has radius 20 (max(18,20))', () => {
  assert.equal(hitRadius('concept', false, false), 20);
});

test('hitRadius: touch adds 8px', () => {
  assert.equal(hitRadius('text', false, true), 30); // max(22,20)+8
});

test('hitRadius: regular text node is 22, above min 20', () => {
  assert.equal(hitRadius('text', false, false), 22);
});
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npm test -- --test-name-pattern="hittest"
```

Expected: `ERR_MODULE_NOT_FOUND`.

- [ ] **Step 3: Write `src/hittest.js`**

```js
const MIN_HIT    = 20;
const TOUCH_EXTRA = 8;

/**
 * Resolve which node (if any) the pointer is over.
 * Iterates front-to-back (highest index = topmost).
 * @param {number} px pointer x (logical px)
 * @param {number} py pointer y (logical px)
 * @param {Array<{id:string, x:number, y:number, hitRadius:number}>} nodes
 * @returns {string|null}
 */
export function hitTest(px, py, nodes) {
  for (let i = nodes.length - 1; i >= 0; i--) {
    const n  = nodes[i];
    const dx = px - n.x, dy = py - n.y;
    if (dx * dx + dy * dy < n.hitRadius * n.hitRadius) return n.id;
  }
  return null;
}

/**
 * Compute hit radius for a node.
 * @param {string}  type      node type
 * @param {boolean} isCenter
 * @param {boolean} isTouch
 * @returns {number}
 */
export function hitRadius(type, isCenter, isTouch) {
  let r;
  if (isCenter)              r = 38;
  else if (type === 'attestation') r = 8;
  else if (type === 'concept')     r = 18;
  else if (type === 'referent')    r = 20;
  else if (type === 'element')     r = 12;
  else                             r = 22;
  return Math.max(r, MIN_HIT) + (isTouch ? TOUCH_EXTRA : 0);
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npm test -- --test-name-pattern="hittest"
```

Expected: 9 passing.

- [ ] **Step 5: Commit**

```bash
git add src/hittest.js test/hittest.test.js
git commit -m "feat: canvas hit testing (hitTest, hitRadius)"
```

---

## Task 6: `src/edges.js`

**Files:**
- Create: `src/edges.js`
- Create: `test/edges.test.js`

- [ ] **Step 1: Write the failing tests**

```js
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
```

- [ ] **Step 2: Run tests — verify they fail**

```bash
npm test -- --test-name-pattern="edges"
```

Expected: `ERR_MODULE_NOT_FOUND`.

- [ ] **Step 3: Write `src/edges.js`**

```js
/**
 * Shorten a line so its endpoint sits on the boundary of a circle.
 * Returns the original (x2,y2) if the distance is less than r.
 * @param {number} x1 @param {number} y1  start point
 * @param {number} x2 @param {number} y2  end point (near the node)
 * @param {number} r  node visual radius
 * @returns {{ x:number, y:number }}
 */
export function clipToRadius(x1, y1, x2, y2, r) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < r + 1) return { x: x2, y: y2 };
  return { x: x2 - (dx / len) * r, y: y2 - (dy / len) * r };
}

function drawArrowhead(ctx, x1, y1, x2, y2, color) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const size  = 7;
  ctx.save();
  ctx.fillStyle = color;
  ctx.translate(x2, y2);
  ctx.rotate(angle);
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(-size,  size / 2);
  ctx.lineTo(-size, -size / 2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

/**
 * Draw all edges for the current frame.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array<{from:string,to:string,type:string,weight?:number}>} edges
 * @param {Map<string,{x:number,y:number,opacity:number,visualRadius:number}>} nodeState
 * @param {object} theme  resolveTheme() output
 */
export function drawEdges(ctx, edges, nodeState, theme) {
  for (const edge of edges) {
    const from = nodeState.get(edge.from);
    const to   = nodeState.get(edge.to);
    if (!from || !to) continue;

    const cfg    = theme.edgeTypes[edge.type] ?? theme.edgeTypes._fallback;
    const weight = edge.weight ?? 1.0;
    const alpha  = Math.min(from.opacity, to.opacity) * weight;

    const extraR = cfg.arrow ? 7 : 0;
    const ep     = clipToRadius(from.x, from.y, to.x, to.y, to.visualRadius + extraR);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = cfg.stroke;
    ctx.lineWidth   = cfg.width * weight;
    ctx.setLineDash(cfg.dash);
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(ep.x, ep.y);
    ctx.stroke();

    if (cfg.arrow) drawArrowhead(ctx, from.x, from.y, ep.x, ep.y, cfg.stroke);

    ctx.restore();
  }
}
```

- [ ] **Step 4: Run tests — verify they pass**

```bash
npm test -- --test-name-pattern="edges"
```

Expected: 5 passing.

- [ ] **Step 5: Commit**

```bash
git add src/edges.js test/edges.test.js
git commit -m "feat: edge drawing with arrowheads and fallback style (drawEdges, clipToRadius)"
```

---

## Task 7: `src/renderers/text.js`

Handles `text`, `concept`, `referent`, `element`, and `attestation` node types (all text-based shapes).

**Files:**
- Create: `src/renderers/text.js`

No automated test for canvas draw calls — verified visually via the etymology example in Task 13.

- [ ] **Step 1: Write `src/renderers/text.js`**

```js
import { langColor } from '../theme.js';

const CENTER_R = 38;
const NODE_R   = 22;

/**
 * Draw a text-family node (text, concept, referent, element, attestation).
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} node         node data (id, label, type, lang, _opacity)
 * @param {number} x            centre x (logical px)
 * @param {number} y            centre y (logical px)
 * @param {boolean} isCenter
 * @param {object} theme        resolveTheme() output
 */
export function drawNode(ctx, node, x, y, isCenter, theme) {
  ctx.save();
  ctx.globalAlpha = node._opacity ?? 1;

  switch (node.type) {
    case 'concept':     drawConcept(ctx, node, x, y, theme);     break;
    case 'referent':    drawReferent(ctx, node, x, y, theme);    break;
    case 'element':     drawElement(ctx, node, x, y, theme);     break;
    case 'attestation': drawAttestation(ctx, node, x, y, theme); break;
    default:            drawText(ctx, node, x, y, isCenter, theme);
  }

  ctx.restore();
}

function drawText(ctx, node, x, y, isCenter, theme) {
  const r      = isCenter ? CENTER_R : NODE_R;
  const stroke = langColor(theme, node.lang);

  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = theme.nodeTypes.text.fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth   = isCenter ? 2.5 : 1.7;
  ctx.setLineDash([]);
  ctx.stroke();

  const fontSize  = isCenter ? 19 : (node.label.length > 7 ? 10 : 13);
  const fontWeight = isCenter ? 700 : 500;
  ctx.fillStyle    = isCenter ? stroke : '#A8E0DE';
  ctx.font         = `${fontWeight} ${fontSize}px ${theme.font}`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(node.label, x, y - (isCenter ? 4 : 3));

  const sub = node.lang ? node.lang.toUpperCase() : node.type.toUpperCase();
  ctx.fillStyle    = isCenter ? 'rgba(2,185,185,.5)' : 'rgba(255,255,255,.22)';
  ctx.font         = `400 7px ${theme.font}`;
  ctx.textBaseline = 'middle';
  ctx.fillText(sub, x, y + (isCenter ? 13 : 11));
}

function drawConcept(ctx, node, x, y, theme) {
  const cfg = theme.nodeTypes.concept;
  ctx.beginPath();
  ctx.ellipse(x, y, 46, 17, 0, 0, Math.PI * 2);
  ctx.fillStyle   = cfg.fill;
  ctx.fill();
  ctx.strokeStyle = cfg.stroke;
  ctx.lineWidth   = 1.2;
  ctx.setLineDash(cfg.dash ?? [3, 2]);
  ctx.stroke();

  ctx.fillStyle    = cfg.stroke;
  ctx.font         = `italic 9px ${theme.font}`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(node.label, x, y - 3);

  ctx.fillStyle = 'rgba(232,184,75,.45)';
  ctx.font      = `400 7px ${theme.font}`;
  ctx.fillText('CONCEPT', x, y + 10);
}

function drawReferent(ctx, node, x, y, theme) {
  const cfg = theme.nodeTypes.referent;
  ctx.beginPath();
  ctx.moveTo(x, y - 20);
  ctx.lineTo(x + 22, y);
  ctx.lineTo(x, y + 20);
  ctx.lineTo(x - 22, y);
  ctx.closePath();
  ctx.fillStyle   = cfg.fill;
  ctx.fill();
  ctx.strokeStyle = cfg.stroke;
  ctx.lineWidth   = 1.2;
  ctx.setLineDash(cfg.dash ?? [3, 2]);
  ctx.stroke();

  ctx.fillStyle    = cfg.stroke;
  ctx.font         = `400 8.5px ${theme.font}`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(node.label, x, y - 2);

  ctx.fillStyle = 'rgba(193,107,154,.5)';
  ctx.font      = `400 6.5px ${theme.font}`;
  ctx.fillText('REFERENT', x, y + 12);
}

function drawElement(ctx, node, x, y, theme) {
  const stroke = langColor(theme, node.lang);
  ctx.save();
  ctx.globalAlpha *= theme.nodeTypes.element.opacity ?? 0.6;
  ctx.beginPath();
  ctx.rect(x - 44, y - 11, 88, 22);
  ctx.fillStyle   = theme.nodeTypes.element.fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth   = 1;
  ctx.setLineDash([]);
  ctx.stroke();

  ctx.fillStyle    = stroke;
  ctx.font         = `italic 8px ${theme.font}`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(node.label, x, y + 3);
  ctx.restore();
}

function drawAttestation(ctx, node, x, y, theme) {
  ctx.beginPath();
  ctx.arc(x, y, 8, 0, Math.PI * 2);
  ctx.fillStyle   = theme.nodeTypes.attestation.fill;
  ctx.fill();
  ctx.strokeStyle = theme.nodeTypes.attestation.stroke;
  ctx.lineWidth   = 1.1;
  ctx.setLineDash([]);
  ctx.stroke();

  ctx.fillStyle    = theme.nodeTypes.attestation.stroke;
  ctx.font         = `500 6.5px ${theme.font}`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(node.label, x, y + 2.5);
}
```

- [ ] **Step 2: Commit**

```bash
git add src/renderers/text.js
git commit -m "feat: text node renderer (text/concept/referent/element/attestation shapes)"
```

---

## Task 8: `src/renderers/flag.js`

**Files:**
- Create: `src/renderers/flag.js`

- [ ] **Step 1: Write `src/renderers/flag.js`**

```js
// Module-level cache: imageUrl → ImageBitmap | 'loading' | 'error'
const cache = new Map();

/**
 * Draw a flag node (country circle with flag image fill).
 * While the image loads, shows a teal placeholder circle.
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} node   must have imageUrl, label, _opacity
 * @param {number} x
 * @param {number} y
 * @param {boolean} isCenter
 * @param {object} theme  resolveTheme() output
 */
export function drawFlagNode(ctx, node, x, y, isCenter, theme) {
  const r      = isCenter ? 38 : 22;
  const bitmap = cache.get(node.imageUrl);

  ctx.save();
  ctx.globalAlpha = node._opacity ?? 1;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);

  if (bitmap && bitmap !== 'loading' && bitmap !== 'error') {
    ctx.save();
    ctx.clip();
    ctx.drawImage(bitmap, x - r, y - r, r * 2, r * 2);
    ctx.restore();
  } else {
    ctx.fillStyle = '#020f20';
    ctx.fill();
    if (node.imageUrl && bitmap !== 'loading') _load(node.imageUrl);
  }

  ctx.strokeStyle = theme.nodeTypes.flag.stroke;
  ctx.lineWidth   = isCenter ? 2.5 : 1.7;
  ctx.setLineDash([]);
  ctx.stroke();

  ctx.fillStyle    = 'rgba(255,255,255,.6)';
  ctx.font         = `400 7px ${theme.font}`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(node.label, x, y + r + 3);

  ctx.restore();
}

function _load(url) {
  cache.set(url, 'loading');
  fetch(url)
    .then(r => r.blob())
    .then(blob => createImageBitmap(blob))
    .then(bitmap => cache.set(url, bitmap))
    .catch(() => cache.set(url, 'error'));
}

/** Clear the image cache — call between test runs or on destroy. */
export function clearFlagCache() { cache.clear(); }
```

- [ ] **Step 2: Commit**

```bash
git add src/renderers/flag.js
git commit -m "feat: flag node renderer with async image cache"
```

---

## Task 9: `src/renderers/image.js`

**Files:**
- Create: `src/renderers/image.js`

- [ ] **Step 1: Write `src/renderers/image.js`**

```js
const cache = new Map();

/**
 * Draw an image node (person avatar). Falls back to initials if image is
 * unavailable or loading.
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} node   must have imageUrl?, label, _opacity
 * @param {number} x
 * @param {number} y
 * @param {boolean} isCenter
 * @param {object} theme  resolveTheme() output
 */
export function drawImageNode(ctx, node, x, y, isCenter, theme) {
  const r      = isCenter ? 38 : 22;
  const bitmap = cache.get(node.imageUrl);

  ctx.save();
  ctx.globalAlpha = node._opacity ?? 1;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);

  if (bitmap && bitmap !== 'loading' && bitmap !== 'error') {
    ctx.save();
    ctx.clip();
    ctx.drawImage(bitmap, x - r, y - r, r * 2, r * 2);
    ctx.restore();
  } else {
    ctx.fillStyle = '#020f20';
    ctx.fill();
    _drawInitials(ctx, node.label, x, y, r, theme);
    if (node.imageUrl && bitmap !== 'loading') _load(node.imageUrl);
  }

  ctx.strokeStyle = theme.nodeTypes.image.stroke;
  ctx.lineWidth   = isCenter ? 2.5 : 1.7;
  ctx.setLineDash([]);
  ctx.stroke();

  ctx.restore();
}

function _drawInitials(ctx, label, x, y, r, theme) {
  const initials = (label ?? '?')
    .split(' ')
    .map(w => w[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
  ctx.fillStyle    = theme.centerGlow;
  ctx.font         = `700 ${Math.round(r * 0.6)}px ${theme.font}`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials, x, y);
}

function _load(url) {
  cache.set(url, 'loading');
  fetch(url)
    .then(r => r.blob())
    .then(blob => createImageBitmap(blob))
    .then(bitmap => cache.set(url, bitmap))
    .catch(() => cache.set(url, 'error'));
}

export function clearImageCache() { cache.clear(); }
```

- [ ] **Step 2: Commit**

```bash
git add src/renderers/image.js
git commit -m "feat: image node renderer with initials fallback"
```

---

## Task 10: `src/tooltip.js`

**Files:**
- Create: `src/tooltip.js`

- [ ] **Step 1: Write `src/tooltip.js`**

```js
const STYLE = [
  'position:absolute',
  'pointer-events:none',
  'top:0', 'left:0',
  'background:#011838',
  'border:1px solid rgba(2,185,185,.25)',
  'border-left:3px solid #02b9b9',
  'padding:8px 12px',
  'font-family:"Noto Sans",sans-serif',
  'font-size:12px',
  'color:#fff',
  'max-width:220px',
  'line-height:1.5',
  'z-index:10',
  'opacity:0',
  'transition:opacity .15s',
].join(';');

function defaultRender(node) {
  const sub = node.lang
    ? `<div style="font-size:10px;opacity:.45;text-transform:uppercase;letter-spacing:.06em;margin-top:2px">${node.lang} · ${node.type}</div>`
    : '';
  const ipa = node.meta?.ipa
    ? `<div style="color:#02b9b9;font-size:11px;margin-top:2px">${node.meta.ipa}</div>`
    : '';
  const q = node.quality != null
    ? `<span style="font-size:9px;background:rgba(2,185,185,.1);color:#02b9b9;padding:1px 4px;margin-top:4px;display:inline-block">quality: ${node.quality}</span>`
    : '';
  return `<strong>${node.label}</strong>${sub}${ipa}${q}`;
}

export class Tooltip {
  constructor(container) {
    this._el = document.createElement('div');
    this._el.style.cssText = STYLE;
    container.appendChild(this._el);
    this._renderFn = defaultRender;
    this._W = 0;
    this._H = 0;
  }

  /** Override the default HTML renderer. */
  setRenderFn(fn) { this._renderFn = fn; }

  /** Update container dimensions (call after resize). */
  setContainerSize(W, H) { this._W = W; this._H = H; }

  show(node, canvasX, canvasY) {
    this._el.innerHTML = this._el.innerHTML = this._renderFn(node);
    let x = canvasX + 28, y = canvasY - 10;
    if (this._W && x + 230 > this._W) x = canvasX - 240;
    if (this._H && y + 100 > this._H) y = Math.max(0, this._H - 110);
    this._el.style.transform = `translate(${x}px,${y}px)`;
    this._el.style.opacity   = '1';
  }

  hide() { this._el.style.opacity = '0'; }

  destroy() { this._el.remove(); }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/tooltip.js
git commit -m "feat: HTML tooltip (absolute div, custom render fn, edge-flip positioning)"
```

---

## Task 11: `src/renderer.js`

**Files:**
- Create: `src/renderer.js`

- [ ] **Step 1: Write `src/renderer.js`**

```js
import { tickSprings } from './spring.js';
import { drawEdges }   from './edges.js';
import { drawNode  }   from './renderers/text.js';
import { drawFlagNode }  from './renderers/flag.js';
import { drawImageNode } from './renderers/image.js';

/** Visual radius used for edge clipping (not hit-testing). */
function visualRadius(type, isCenter) {
  if (isCenter)                    return 38;
  if (type === 'attestation')      return 8;
  if (type === 'concept')          return 18;
  if (type === 'referent')         return 20;
  if (type === 'element')          return 12;
  return 22;
}

export class Renderer {
  /**
   * @param {HTMLElement} container
   * @param {object}      theme  resolveTheme() output
   */
  constructor(container, theme) {
    this.theme    = theme;
    this.canvas   = document.createElement('canvas');
    this.canvas.style.cssText = 'width:100%;height:100%;display:block;';
    container.appendChild(this.canvas);

    this.ctx      = this.canvas.getContext('2d');
    this._dpr     = window.devicePixelRatio || 1;
    this._rafId   = null;

    // Viewport transform (pan / zoom)
    this._panX  = 0;
    this._panY  = 0;
    this._scale = 1;

    // Graph state (set externally by ThinkGraph)
    this.springNodes = new Map();  // id → spring node object
    this.nodes       = [];          // raw node data
    this.edges       = [];          // raw edge data
    this.centerId    = null;
    this.loading     = false;
    this.hoveredId   = null;

    this.W = 0; this.H = 0;
    this._resize();

    this._ro = new ResizeObserver(() => this._resize());
    this._ro.observe(container);
  }

  _resize() {
    const dpr = this._dpr;
    const W   = this.canvas.offsetWidth  || this.canvas.parentElement?.offsetWidth  || 600;
    const H   = this.canvas.offsetHeight || this.canvas.parentElement?.offsetHeight || 400;
    this.canvas.width  = W * dpr;
    this.canvas.height = H * dpr;
    this.W = W; this.H = H;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  get containerSize() { return { W: this.W, H: this.H }; }

  start() {
    const loop = () => {
      tickSprings(this.springNodes, this.theme.spring, this.theme.opacitySpring);
      this._draw();
      this._rafId = requestAnimationFrame(loop);
    };
    this._rafId = requestAnimationFrame(loop);
  }

  stop() {
    if (this._rafId != null) cancelAnimationFrame(this._rafId);
    this._rafId = null;
  }

  _draw() {
    const { ctx, W, H } = this;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = this.theme.background;
    ctx.fillRect(0, 0, W, H);

    ctx.save();
    ctx.translate(this._panX, this._panY);
    ctx.scale(this._scale, this._scale);

    this._drawRings(ctx, W, H);

    // Build nodeState for edge drawing
    const nodeState = new Map();
    for (const n of this.nodes) {
      const s = this.springNodes.get(n.id);
      if (!s) continue;
      nodeState.set(n.id, {
        x: s.x, y: s.y,
        opacity:      s.opacity,
        visualRadius: visualRadius(n.type, n.id === this.centerId),
      });
    }

    drawEdges(ctx, this.edges, nodeState, this.theme);
    this._drawNodes(ctx);

    ctx.restore();

    if (this.loading)    this._drawSpinner(ctx, W / 2, H / 2);
    this._drawResetBtn(ctx, W, H);
  }

  _drawRings(ctx, W, H) {
    const min = Math.min(W, H);
    [0.22, 0.38, 0.50].forEach((f, i) => {
      ctx.save();
      ctx.globalAlpha = 0.12 - i * 0.03;
      ctx.strokeStyle = this.theme.ringStroke;
      ctx.lineWidth   = 0.5;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(W / 2, H / 2, min * f, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    });
    // Soft aura at centre
    ctx.save();
    const cp = this.springNodes.get(this.centerId);
    if (cp) {
      const grad = ctx.createRadialGradient(cp.x, cp.y, 0, cp.x, cp.y, min * 0.18);
      grad.addColorStop(0,   'rgba(2,185,185,.18)');
      grad.addColorStop(1,   'rgba(2,185,185,0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cp.x, cp.y, min * 0.18, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  _drawNodes(ctx) {
    for (const node of this.nodes) {
      const s = this.springNodes.get(node.id);
      if (!s || s.opacity < 0.01) continue;

      const isCenter = node.id === this.centerId;
      const drawData = { ...node, _opacity: s.opacity };

      if (node.type === 'flag') {
        drawFlagNode(ctx, drawData, s.x, s.y, isCenter, this.theme);
      } else if (node.type === 'image') {
        drawImageNode(ctx, drawData, s.x, s.y, isCenter, this.theme);
      } else {
        drawNode(ctx, drawData, s.x, s.y, isCenter, this.theme);
      }

      if (node.id === this.hoveredId && !isCenter) {
        ctx.save();
        ctx.globalAlpha = 0.45;
        ctx.strokeStyle = this.theme.centerGlow;
        ctx.lineWidth   = 2;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(s.x, s.y, visualRadius(node.type, false) + 6, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      }
    }
  }

  _drawSpinner(ctx, x, y) {
    const t = Date.now() / 1000;
    ctx.save();
    ctx.globalAlpha = 0.7;
    ctx.strokeStyle = this.theme.centerGlow;
    ctx.lineWidth   = 2.5;
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(x, y, 20, t * 3, t * 3 + 2);
    ctx.stroke();
    ctx.restore();
  }

  _drawResetBtn(ctx, W, H) {
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.strokeStyle = this.theme.ringStroke;
    ctx.fillStyle   = this.theme.ringStroke;
    ctx.lineWidth   = 1.5;
    ctx.setLineDash([]);
    const bx = W - 22, by = 22;
    ctx.beginPath();
    ctx.arc(bx, by, 10, -Math.PI * 0.8, Math.PI * 0.8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(bx + 8, by);
    ctx.lineTo(bx + 4, by - 4);
    ctx.lineTo(bx + 4, by + 4);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

  destroy() {
    this.stop();
    this._ro.disconnect();
    this.canvas.remove();
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/renderer.js
git commit -m "feat: Renderer class — rAF loop, Canvas draw order, pan/zoom, HiDPI"
```

---

## Task 12: `src/index.js`

**Files:**
- Create: `src/index.js`

- [ ] **Step 1: Write `src/index.js`**

```js
import { resolveTheme }    from './theme.js';
import { computeTargets }  from './layout.js';
import { createSpringNode } from './spring.js';
import { Renderer }        from './renderer.js';
import { Tooltip }         from './tooltip.js';
import { hitTest, hitRadius } from './hittest.js';

export class ThinkGraph {
  /**
   * @param {{
   *   container:    string | HTMLElement,
   *   getNeighbors: (id: string) => Promise<{nodes: object[], edges: object[]}>,
   *   onSelect?:    (node: object) => void,
   *   theme?:       string | object,
   *   renderTooltip?: (node: object) => string,
   * }} opts
   */
  constructor(opts) {
    this._opts      = opts;
    this._theme     = resolveTheme(opts.theme);
    this._container = typeof opts.container === 'string'
      ? document.querySelector(opts.container)
      : opts.container;
    this._container.style.position = 'relative';

    this._renderer = new Renderer(this._container, this._theme);
    this._tooltip  = new Tooltip(this._container);
    if (opts.renderTooltip) this._tooltip.setRenderFn(opts.renderTooltip);

    this._nodes    = [];
    this._edges    = [];
    this._centerId = null;
    this._isTouch  = false;

    this._bindEvents();
    this._renderer.start();
  }

  /** Load the neighbourhood of `id` and animate to it. */
  async setCenter(id) {
    this._centerId          = id;
    this._renderer.centerId = id;
    this._renderer.loading  = true;

    const { nodes, edges } = await this._opts.getNeighbors(id);
    this._renderer.loading  = false;

    const newIds  = new Set(nodes.map(n => n.id));
    const { W, H } = this._renderer.containerSize;
    const targets  = computeTargets(id, nodes, edges, W, H);

    // Fade out nodes leaving the scene
    for (const [nid, s] of this._renderer.springNodes) {
      if (!newIds.has(nid)) s.targetOpacity = 0;
    }

    // Add / update spring state for incoming nodes
    for (const node of nodes) {
      if (!this._renderer.springNodes.has(node.id)) {
        const jitter = () => (Math.random() - 0.5) * 40;
        const s = createSpringNode(W / 2 + jitter(), H / 2 + jitter(), 0);
        s.vx = (Math.random() - 0.5) * 4;
        s.vy = (Math.random() - 0.5) * 4;
        this._renderer.springNodes.set(node.id, s);
      }
      const s = this._renderer.springNodes.get(node.id);
      const t = targets.get(node.id);
      if (t) { s.targetX = t.x; s.targetY = t.y; s.targetOpacity = 1; }
    }

    this._nodes = nodes;
    this._edges = edges;
    this._renderer.nodes = nodes;
    this._renderer.edges = edges;

    this._tooltip.setContainerSize(W, H);

    const centerNode = nodes.find(n => n.id === id);
    if (centerNode && this._opts.onSelect) this._opts.onSelect(centerNode);
  }

  /** Hot-swap theme at runtime. */
  setTheme(t) {
    this._theme          = resolveTheme(t);
    this._renderer.theme = this._theme;
  }

  /** Return pan/zoom to 1× at canvas centre. */
  resetView() {
    this._renderer._panX  = 0;
    this._renderer._panY  = 0;
    this._renderer._scale = 1;
  }

  destroy() {
    this._unbindEvents();
    this._renderer.destroy();
    this._tooltip.destroy();
  }

  // ── Private ──────────────────────────────────────────────────────────────

  _visibleNodes() {
    return this._nodes.map(n => {
      const s = this._renderer.springNodes.get(n.id);
      if (!s) return null;
      return { id: n.id, x: s.x, y: s.y,
               hitRadius: hitRadius(n.type, n.id === this._centerId, this._isTouch) };
    }).filter(Boolean);
  }

  _canvasXY(e) {
    const r = this._renderer.canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  }

  _bindEvents() {
    const canvas = this._renderer.canvas;

    this._onMove = (e) => {
      const { x, y } = this._canvasXY(e);
      const id = hitTest(x, y, this._visibleNodes());
      this._renderer.hoveredId = id;
      if (id) {
        const node = this._nodes.find(n => n.id === id);
        if (node) this._tooltip.show(node, x, y);
      } else {
        this._tooltip.hide();
      }
    };

    this._onClick = (e) => {
      const { x, y } = this._canvasXY(e);
      // Reset button area (top-right 40×40)
      const W = this._renderer.W;
      if (x > W - 40 && y < 40) { this.resetView(); return; }
      const id = hitTest(x, y, this._visibleNodes());
      if (id && id !== this._centerId) this.setCenter(id);
    };

    // Pan
    let _lastPan = null;
    this._onDown = (e) => { _lastPan = { x: e.clientX, y: e.clientY }; };
    this._onUp   = ()  => { _lastPan = null; };
    this._onDrag = (e) => {
      if (!_lastPan || e.buttons === 0) return;
      this._renderer._panX += e.clientX - _lastPan.x;
      this._renderer._panY += e.clientY - _lastPan.y;
      _lastPan = { x: e.clientX, y: e.clientY };
    };

    // Zoom
    this._onWheel = (e) => {
      e.preventDefault();
      const delta = e.deltaY > 0 ? 0.9 : 1.1;
      this._renderer._scale = Math.max(0.2, Math.min(5, this._renderer._scale * delta));
    };

    // Touch detection
    this._onTouchStart = () => { this._isTouch = true; };

    canvas.addEventListener('pointermove',  this._onMove);
    canvas.addEventListener('click',        this._onClick);
    canvas.addEventListener('pointerdown',  this._onDown);
    canvas.addEventListener('pointerup',    this._onUp);
    canvas.addEventListener('pointermove',  this._onDrag);
    canvas.addEventListener('wheel',        this._onWheel, { passive: false });
    canvas.addEventListener('touchstart',   this._onTouchStart, { passive: true });
  }

  _unbindEvents() {
    const canvas = this._renderer.canvas;
    canvas.removeEventListener('pointermove',  this._onMove);
    canvas.removeEventListener('click',        this._onClick);
    canvas.removeEventListener('pointerdown',  this._onDown);
    canvas.removeEventListener('pointerup',    this._onUp);
    canvas.removeEventListener('pointermove',  this._onDrag);
    canvas.removeEventListener('wheel',        this._onWheel);
    canvas.removeEventListener('touchstart',   this._onTouchStart);
  }
}
```

- [ ] **Step 2: Commit**

```bash
git add src/index.js
git commit -m "feat: ThinkGraph public API (setCenter, setTheme, resetView, destroy)"
```

---

## Task 13: `examples/etymology/`

Wires the library to the real Wiktionary TSV data via a tiny local server.

**Files:**
- Create: `examples/etymology/index.html`
- Create: `examples/etymology/server.mjs`

- [ ] **Step 1: Write the server**

```js
// examples/etymology/server.mjs
// Run: node examples/etymology/server.mjs
// Serves GET /api/etymology/:word → { nodes, edges }
// Reads from /Users/davor/projekti/nelma/etymology/wiktionary_etymology_names.tsv

import http from 'node:http';
import fs   from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const TSV_PATH = '/Users/davor/projekti/nelma/etymology/wiktionary_etymology_names.tsv';

// Parse the TSV once at startup into a Map: word → [{lang, etymData}]
const wordMap = new Map();
for (const line of fs.readFileSync(TSV_PATH, 'utf8').split('\n')) {
  const [word, lang, raw] = line.split('\t');
  if (!word) continue;
  const key = word.toLowerCase();
  if (!wordMap.has(key)) wordMap.set(key, []);
  wordMap.get(key).push({ lang, raw });
}

function buildGraph(word) {
  const entries = wordMap.get(word.toLowerCase()) ?? [];
  const nodes = [], edges = [], seen = new Set();

  const centerId = `${word}::root`;
  nodes.push({ id: centerId, label: word, type: 'text', lang: 'English',
               meta: { note: `Etymology of "${word}"` } });
  seen.add(centerId);

  for (const { lang, raw } of entries.slice(0, 6)) {
    let parsed;
    try { parsed = JSON.parse(raw.replace(/'/g, '"')); } catch { continue; }
    for (const [_key, data] of Object.entries(parsed)) {
      const chain = data.inheritance ?? [];
      let prevId = centerId;
      for (const step of chain.slice(0, 4)) {
        const [stepLang, stepLabel] = Array.isArray(step) ? step : [lang, step];
        if (!stepLabel || typeof stepLabel !== 'string') continue;
        const nid = `${stepLabel}::${stepLang}`;
        if (!seen.has(nid)) {
          seen.add(nid);
          nodes.push({ id: nid, label: stepLabel, type: 'text', lang: stepLang });
        }
        if (!edges.find(e => e.from === prevId && e.to === nid)) {
          edges.push({ from: prevId, to: nid, type: 'derives_from' });
        }
        prevId = nid;
      }
    }
  }
  return { nodes, edges };
}

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  const m = req.url.match(/^\/api\/etymology\/(.+)$/);
  if (m) {
    const word = decodeURIComponent(m[1]);
    res.setHeader('Content-Type', 'application/json');
    res.end(JSON.stringify(buildGraph(word)));
    return;
  }
  // Serve static files
  const __dir = path.dirname(fileURLToPath(import.meta.url));
  const file  = req.url === '/' ? '/index.html' : req.url;
  const full  = path.join(__dir, file);
  try {
    res.end(fs.readFileSync(full));
  } catch {
    res.writeHead(404); res.end('Not found');
  }
});

server.listen(3001, () => console.log('Etymology example: http://localhost:3001'));
```

- [ ] **Step 2: Write the example page**

```html
<!-- examples/etymology/index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Etymology Explorer — ThinkGraph</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #011838; color: #fff; font-family: "Noto Sans", sans-serif;
         display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
  .bar { display: flex; align-items: center; gap: 8px; padding: 10px 16px;
         border-bottom: 1px solid rgba(2,185,185,.15); flex-shrink: 0; }
  .brand { color: #02b9b9; font-weight: 700; text-transform: uppercase;
           letter-spacing: .06em; font-size: .9rem; }
  input  { height: 2.2rem; border: 1px solid rgba(2,185,185,.4); border-right: none;
           background: rgba(255,255,255,.05); color: #fff; font-size: .9rem;
           padding: 0 .8rem; outline: 0; flex: 1; max-width: 280px; }
  button { height: 2.2rem; background: #02b9b9; color: #fff; border: 0;
           font-weight: 700; padding: 0 1rem; cursor: pointer; }
  button:hover { background: #019b9b; }
  #graph { flex: 1; }
  #info  { position: fixed; bottom: 16px; left: 16px; background: #011838;
           border: 1px solid rgba(2,185,185,.2); border-left: 3px solid #02b9b9;
           padding: 10px 14px; max-width: 260px; font-size: .8rem; line-height: 1.6; }
  #info h3 { color: #02b9b9; margin-bottom: 4px; }
</style>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;700&display=swap" rel="stylesheet">
</head>
<body>
<div class="bar">
  <span class="brand">Mondonomo</span>
  <span style="color:rgba(255,255,255,.2)">·</span>
  <span style="color:rgba(255,255,255,.4);font-size:.8rem">Etymology Explorer</span>
  <input id="word" type="text" value="mary" placeholder="Enter a name…">
  <button id="go">Explore</button>
</div>
<div id="graph"></div>
<div id="info"><h3 id="info-name">Mary</h3><p id="info-note">Click any node to re-centre.</p></div>

<script type="module">
import { ThinkGraph } from '/dist/thinkgraph.esm.js';

const graph = new ThinkGraph({
  container: '#graph',
  getNeighbors: async (id) => {
    const word = id.split('::')[0];
    const r = await fetch(`/api/etymology/${encodeURIComponent(word)}`);
    return r.json();
  },
  onSelect: (node) => {
    document.getElementById('info-name').textContent = node.label;
    document.getElementById('info-note').textContent =
      node.meta?.note ?? `${node.lang ?? ''} · ${node.type}`;
  },
});

graph.setCenter('mary::root');

document.getElementById('go').addEventListener('click', () => {
  const w = document.getElementById('word').value.trim().toLowerCase();
  if (w) graph.setCenter(`${w}::root`);
});
document.getElementById('word').addEventListener('keydown', e => {
  if (e.key === 'Enter') document.getElementById('go').click();
});
</script>
</body>
</html>
```

- [ ] **Step 3: Build the library and verify**

```bash
npm run build
```

Expected: `dist/thinkgraph.esm.js` and `dist/thinkgraph.umd.js` created, "Build complete." printed.

- [ ] **Step 4: Run the server and open in browser**

```bash
node examples/etymology/server.mjs
```

Open `http://localhost:3001`. Verify:
- Graph blooms outward from "mary" on load
- Clicking a node re-centres with spring animation
- Info box updates on click
- Search for "raven", "fabian" works

- [ ] **Step 5: Commit**

```bash
git add examples/etymology/
git commit -m "feat: etymology example wired to Wiktionary TSV data"
```

---

## Task 14: `examples/world/`

Demonstrates the `flag` node type with country popularity data.

**Files:**
- Create: `examples/world/index.html`
- Create: `examples/world/data.js`

- [ ] **Step 1: Write static data for the world example**

```js
// examples/world/data.js
// Static sample — replace with a real API call in production.
export const WORLD_DATA = {
  mary: {
    nodes: [
      { id: 'mary',   label: 'Mary',    type: 'text', lang: 'English' },
      { id: 'GB',     label: 'UK',      type: 'flag', iso2: 'GB',
        imageUrl: 'https://flagcdn.com/w40/gb.png' },
      { id: 'US',     label: 'USA',     type: 'flag', iso2: 'US',
        imageUrl: 'https://flagcdn.com/w40/us.png' },
      { id: 'AU',     label: 'Australia', type: 'flag', iso2: 'AU',
        imageUrl: 'https://flagcdn.com/w40/au.png' },
      { id: 'IE',     label: 'Ireland', type: 'flag', iso2: 'IE',
        imageUrl: 'https://flagcdn.com/w40/ie.png' },
      { id: 'marie',  label: 'Marie',   type: 'text', lang: 'French'  },
      { id: 'FR',     label: 'France',  type: 'flag', iso2: 'FR',
        imageUrl: 'https://flagcdn.com/w40/fr.png' },
      { id: 'maria',  label: 'María',   type: 'text', lang: 'Spanish' },
      { id: 'ES',     label: 'Spain',   type: 'flag', iso2: 'ES',
        imageUrl: 'https://flagcdn.com/w40/es.png' },
    ],
    edges: [
      { from: 'mary',  to: 'GB',    type: 'popular_in', weight: 0.95 },
      { from: 'mary',  to: 'US',    type: 'popular_in', weight: 0.90 },
      { from: 'mary',  to: 'AU',    type: 'popular_in', weight: 0.80 },
      { from: 'mary',  to: 'IE',    type: 'popular_in', weight: 0.85 },
      { from: 'mary',  to: 'marie', type: 'variant_of', weight: 0.90 },
      { from: 'marie', to: 'FR',    type: 'popular_in', weight: 0.95 },
      { from: 'mary',  to: 'maria', type: 'variant_of', weight: 0.85 },
      { from: 'maria', to: 'ES',    type: 'popular_in', weight: 0.90 },
    ],
  },
};
```

- [ ] **Step 2: Write the world example page**

```html
<!-- examples/world/index.html -->
<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Name Around the World — ThinkGraph</title>
<style>
  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }
  body { background: #011838; color: #fff; font-family: "Noto Sans", sans-serif;
         display: flex; flex-direction: column; height: 100vh; overflow: hidden; }
  .bar { display: flex; align-items: center; gap: 8px; padding: 10px 16px;
         border-bottom: 1px solid rgba(2,185,185,.15); flex-shrink: 0; }
  .brand { color: #02b9b9; font-weight: 700; text-transform: uppercase;
           letter-spacing: .06em; font-size: .9rem; }
  #graph { flex: 1; }
</style>
<link href="https://fonts.googleapis.com/css2?family=Noto+Sans:wght@400;500;700&display=swap" rel="stylesheet">
</head>
<body>
<div class="bar">
  <span class="brand">Mondonomo</span>
  <span style="color:rgba(255,255,255,.2)">·</span>
  <span style="color:rgba(255,255,255,.4);font-size:.8rem">Name Around the World</span>
</div>
<div id="graph"></div>

<script type="module">
import { ThinkGraph } from '/dist/thinkgraph.esm.js';
import { WORLD_DATA  } from './data.js';

const graph = new ThinkGraph({
  container: '#graph',
  getNeighbors: async (id) => {
    const baseName = id.split('::')[0];
    return WORLD_DATA[baseName] ?? { nodes: [], edges: [] };
  },
  renderTooltip: (node) => node.type === 'flag'
    ? `<strong>${node.label}</strong><div style="font-size:10px;opacity:.5">popular in</div>`
    : `<strong>${node.label}</strong>`,
});

graph.setCenter('mary::root');
</script>
</body>
</html>
```

- [ ] **Step 3: Serve and verify flag nodes load correctly**

```bash
# from project root — examples share the dist/ build
python3 -m http.server 3002 --directory .
```

Open `http://localhost:3002/examples/world/`. Verify:
- Flag images load progressively (teal placeholder → flag)
- Edge weight (0.80 vs 0.95) is visible as stroke-width difference
- Clicking `marie` re-centres and shows France

- [ ] **Step 4: Commit**

```bash
git add examples/world/
git commit -m "feat: name-around-world example with flag nodes"
```

---

## Task 15: Run All Tests + Final Build

- [ ] **Step 1: Run the full test suite**

```bash
npm test
```

Expected output:
```
✔ resolveTheme("mondonomo") returns full token object
✔ resolveTheme(null) returns mondonomo defaults
✔ resolveTheme partial override deep-merges
✔ resolveTheme returns a fresh clone each call
✔ langColor returns brand teal for English
✔ langColor returns fallback grey for unknown lang
✔ edgeTypes._fallback exists for unknown edge type
✔ computeRings: centre is ring 0
... (all tests passing)
ℹ tests 33
ℹ pass 33
ℹ fail 0
```

- [ ] **Step 2: Build final dist**

```bash
npm run build
```

Expected:
```
Build complete.
```

Check bundle size:
```bash
gzip -c dist/thinkgraph.esm.js | wc -c
```

Expected: under 25600 bytes (25 KB gzipped).

- [ ] **Step 3: Final commit**

```bash
git add dist/
git commit -m "build: production bundles (ESM + IIFE, <25 KB gzipped)"
```

---

## Self-Review Checklist

### Spec coverage

| Spec section | Covered by task |
|---|---|
| Public API (setCenter, destroy, setTheme, resetView) | Task 12 |
| getNeighbors async callback | Task 12 |
| onSelect callback | Task 12 |
| renderTooltip override | Tasks 10, 12 |
| Node types: text, flag, image, concept, referent, element, attestation | Tasks 7, 8, 9 |
| lang/iso2/imageUrl/period/quality/meta fields | Tasks 3, 12 |
| Edge weight scaling | Task 6 |
| BFS ring layout, period bias, quality opacity | Tasks 3, 4 |
| Spring constants K + damping, opacitySpring | Task 4 |
| Bloom open (nodes spring from centre) | Task 12 |
| Fade-out of departing nodes | Task 12 |
| Loading spinner (>150ms) | Task 11 |
| Canvas draw order (rings → edges → nodes → spinner → reset btn) | Task 11 |
| HiDPI (devicePixelRatio) | Task 11 |
| Hit testing, 20px min target, touch +8px | Task 5 |
| Hover highlight | Task 11 |
| Pan + zoom (wheel + drag) | Task 12 |
| Reset view button | Tasks 11, 12 |
| Touch tap = click, one-finger drag = pan | Task 12 |
| Keyboard Tab/Enter/Escape | **Missing — add Task 16** |
| Tooltip (HTML div, edge-flip, custom renderFn) | Task 10 |
| mondonomo theme tokens (all colors, fonts, edges, shapes) | Task 2 |
| Deep-merge partial theme override | Task 2 |
| Unknown edge type → _fallback | Task 6 |
| ResizeObserver + responsive radii | Task 11 |
| Flag image cache + clip + placeholder | Task 8 |
| Image initials fallback | Task 9 |
| esbuild, ESM + IIFE output, < 25 KB | Tasks 1, 15 |
| JSDoc types | All tasks (add @param / @returns to public functions) |
| Etymology example | Task 13 |
| World example | Task 14 |

---

## Task 16: Keyboard Navigation

**Files:**
- Modify: `src/index.js`

- [ ] **Step 1: Add keyboard event handling to `_bindEvents` in `src/index.js`**

Add the following inside `_bindEvents`, after the `touchstart` listener:

```js
this._keyboardIndex = -1;

this._onKeyDown = (e) => {
  const visible = this._visibleNodes();
  if (!visible.length) return;

  if (e.key === 'Tab') {
    e.preventDefault();
    this._keyboardIndex = e.shiftKey
      ? (this._keyboardIndex - 1 + visible.length) % visible.length
      : (this._keyboardIndex + 1) % visible.length;
    this._renderer.focusedId = visible[this._keyboardIndex].id;
  }

  if ((e.key === 'Enter' || e.key === ' ') && this._keyboardIndex >= 0) {
    e.preventDefault();
    const id = visible[this._keyboardIndex].id;
    if (id !== this._centerId) this.setCenter(id);
  }

  if (e.key === 'Escape') this.resetView();
};

this._container.setAttribute('tabindex', '0');
this._container.addEventListener('keydown', this._onKeyDown);
```

- [ ] **Step 2: Add `focusedId` draw in `src/renderer.js` `_drawNodes`**

Inside the `_drawNodes` method, after the hover highlight block, add:

```js
if (node.id === this.focusedId && node.id !== this.centerId) {
  ctx.save();
  ctx.globalAlpha = 0.7;
  ctx.strokeStyle = '#fff';
  ctx.lineWidth   = 2;
  ctx.setLineDash([3, 3]);
  ctx.beginPath();
  ctx.arc(s.x, s.y, visualRadius(node.type, false) + 8, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();
}
```

Also initialise `this.focusedId = null;` in the Renderer constructor.

- [ ] **Step 3: Add keyboard listener removal to `_unbindEvents` in `src/index.js`**

```js
this._container.removeEventListener('keydown', this._onKeyDown);
```

- [ ] **Step 4: Verify manually**

Run the etymology example (`node examples/etymology/server.mjs`), click the graph container, then:
- Press `Tab` → first node gets a dashed white focus ring
- Press `Tab` again → ring moves to next node
- Press `Enter` → graph re-centres on that node
- Press `Escape` → view resets

- [ ] **Step 5: Commit**

```bash
git add src/index.js src/renderer.js
git commit -m "feat: keyboard navigation (Tab to cycle, Enter to re-centre, Escape to reset)"
```
