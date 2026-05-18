# ThinkGraph — Design Spec
*2026-05-19*

## Overview

ThinkGraph is a zero-dependency JavaScript library that renders interactive radial
graph visualisations on an HTML Canvas. It targets the ThinkMap / Visual Thesaurus
interaction idiom: a focus node at centre, neighbours arranged on rings by graph
distance, smooth spring-animated re-centring on click. It is styled with the
Mondonomo design system out of the box.

**Primary use cases (all served by the same library):**
1. **Etymology explorer** — directed word-heritage graph, node = word in a language,
   edge types: `derives_from`, `cognate_of`, `means`, `refers_to`, `attested_as`
2. **Name around the world** — node = country (flag image), edge = `popular_in`,
   weight encodes bearer count
3. **Name variants** — node = spelling variant in a language, edge = `variant_of`
4. Surnames and other proper-name data following the same typed-graph schema

---

## 1. Public API

### Initialisation

```js
import { ThinkGraph } from 'thinkgraph';

const graph = new ThinkGraph({
  container:    '#etymology-graph',   // CSS selector or HTMLElement
  getNeighbors: async (nodeId) => {   // required async callback
    const res = await fetch(`/api/etymology/${nodeId}`);
    return res.json();                // must resolve to { nodes, edges }
  },
  onSelect: (node) => { ... },        // optional — fired on click / tap
  theme:    'mondonomo',              // built-in string, or partial theme object
});

graph.setCenter('mary');   // load first neighbourhood and begin animation
graph.destroy();           // remove canvas, cancel rAF, remove listeners
```

### Node schema

```js
{
  id:       string,           // unique within the graph — used as cache key
  label:    string,           // primary display text
  type:     'text'            // word / name variant — circle + text label
          | 'flag'            // country node — circle clipped to flag image
          | 'image'           // person avatar — circle clipped to photo
          | 'concept'         // meaning / semantic node — ellipse, dashed stroke
          | 'referent'        // real-world entity — diamond, dashed stroke
          | 'element'         // morphological piece (root, suffix) — pill shape
          | 'attestation',    // dated citation — small fixed-radius pin

  // type-specific fields
  lang:     string?,          // ISO 639-3 or proto-code — maps to colour hue
  iso2:     string?,          // ISO 3166-1 alpha-2 — metadata only, not used by renderer
  imageUrl: string?,          // URL for flag or avatar image (both 'flag' and 'image' types)

  // optional visual hints
  period:   number?,          // year / era — biases ring index outward for older nodes
  quality:  1|2|3|4?,         // provenance tier — 1 = canonical, 4 = user edit → opacity

  meta:     object?,          // arbitrary payload passed through to onSelect; not
                               // interpreted by the library
}
```

### Edge schema

```js
{
  from:   string,             // node id
  to:     string,             // node id
  type:   string,             // key into theme.edgeTypes (open-ended)
  weight: number?,            // 0–1, defaults 1.0 — scales edge stroke-width and opacity
}
```

### Instance methods

| Method | Description |
|--------|-------------|
| `setCenter(id)` | Animate to new centre, call `getNeighbors(id)`, animate in new neighbourhood |
| `destroy()` | Cancel animation loop, remove canvas and tooltip div, remove all event listeners |
| `setTheme(t)` | Hot-swap theme at runtime — deep-merges with current theme |
| `resetView()` | Return pan/zoom to 1× centred on focus node |

---

## 2. Layout Engine

Layout is computed once per `setCenter` call. It is not a physics simulation — nodes
have fixed target positions that are updated only when the centre changes.

### Algorithm

1. **BFS** from the new centre node over the undirected adjacency of `edges`. Every
   node receives a ring index equal to its BFS distance (0, 1, 2, 3). Nodes beyond
   distance 3 are placed on ring 3.

2. **Ring placement**: nodes within each ring are distributed evenly by angle.
   - Ring 0 (centre): `(W/2, H/2)`
   - Rings 1–3: radius = `min(W,H) × [0.22, 0.38, 0.50]`
   - Angular start offset per ring is staggered to reduce label collision between
     adjacent rings
   - If a node carries `period`, its ring index is nudged by +1 for every 500 years
     before the present (capped at ring 3) — older etymons drift outward

3. **Quality → opacity**: `quality` tier maps to opacity `[1.0, 0.85, 0.65, 0.45]`.
   Opacity is a spring target, not a hard cut — it transitions smoothly.

4. Target positions are stored per node. The spring system interpolates to them.

### Radii are responsive

All ring radii are computed from `min(containerWidth, containerHeight)` on every
resize. A `ResizeObserver` on the container triggers a radius recompute and
re-applies targets; the spring system transitions smoothly without a jump.

---

## 3. Spring Animation

A single `requestAnimationFrame` loop runs continuously. Per node, per frame:

```
force    = K × (target.x − pos.x)
velocity = (velocity.x + force) × DAMPING
pos.x    = pos.x + velocity.x
```

Same for y. Default constants (exposed in theme for tuning):

| Constant | Default | Effect |
|----------|---------|--------|
| `K`      | 0.10    | Spring stiffness — higher = snappier |
| `DAMPING`| 0.74    | Energy loss — lower = more overshoot |

These produce a slight overshoot on arrival, matching Mondonomo's
`cubic-bezier(0,0,.43,1.49)` easing feel.

**Opacity spring** uses separate constants (`K=0.12, DAMPING=0.80`) — faster fade
than position so departing nodes don't linger.

### Transition sequence on `setCenter(id)`

1. Clicked node's target moves to `(W/2, H/2)` — it springs to centre.
2. `getNeighbors(id)` fires immediately (non-blocking).
3. Nodes absent from the new neighbourhood get `opacityTarget = 0`; once opacity
   reaches < 0.01 they are removed from the draw list.
4. If `getNeighbors` takes > 150ms, a spinner arc appears at centre.
5. On resolution: new nodes initialise at `(W/2, H/2)` with a small random velocity
   jitter, then spring outward to their ring targets — the "bloom" effect.

---

## 4. Canvas Rendering

### Draw order (every frame)

1. `clearRect` entire canvas
2. Ring guide circles — `strokeStyle = theme.ringStroke`, very low opacity
3. Edges — per-type style (colour, dash pattern, stroke-width × `weight`)
4. Arrowheads — filled triangles, clipped so tip touches node boundary
5. Nodes — shape fill, then image/flag if applicable, then text labels
6. Loading spinner — arc at centre position, only while fetch is pending
7. Hover highlight — bright ring drawn last so always on top
8. Reset-view button — drawn in screen space (unaffected by pan/zoom transform)

### Node renderers

Each renderer is `(ctx, node, x, y, r, opts) => void`.

**`text`**
- Circle: `fill = theme.nodeTypes.text.fill`, `stroke = langColor(node.lang)`
- Centre label: `theme.font`, weight 700 for focus, 500 otherwise
- Sub-label: lang name in small caps, 7px, low opacity

**`flag`**
- `ctx.save()` → `ctx.beginPath()` → `ctx.arc(x,y,r)` → `ctx.clip()`
- `ctx.drawImage(flagBitmap, x-r, y-r, 2r, 2r)`
- `ctx.restore()`
- Country code label below
- Flags fetched once via `fetch` + `createImageBitmap` using `node.imageUrl`, stored in
  `Map<imageUrl, ImageBitmap>`. While loading: teal circle placeholder.
- The caller is responsible for providing the correct `imageUrl` — the library does not
  resolve ISO codes to asset paths. Mondonomo callers set
  `imageUrl: `/static/lang_flags/${iso2}.svg`` before passing nodes in.

**`image`**
- Same clip technique as flag
- On load failure: initials drawn as text inside the circle (never blank)

### Specialised node shapes

| Node type | Shape | Notes |
|-----------|-------|-------|
| `concept` | Ellipse | Dashed stroke, italic label |
| `referent` | Diamond (polygon) | Dashed stroke |
| `element` | Rounded rect (pill) | Italic label, lower opacity |
| `attestation` | Small circle (pin) | Fixed 8px radius regardless of ring |

### Hit testing

On every `pointermove` / `pointerdown`, iterate visible nodes back-to-front:

```
if distance(pointer, node.center) < node.hitRadius → hit
```

`hitRadius = max(node.radius, 20)` — minimum 20px tap target on all devices.
On touch, inflated by additional 8px.

### High-DPI

Canvas `width` / `height` attributes are set to `logical × devicePixelRatio`.
CSS size matches the container. All coordinates in the draw loop are logical —
a single `ctx.scale(dpr, dpr)` call at setup handles everything.

---

## 5. Theming

The library ships one built-in theme: `'mondonomo'`. Callers pass a string or a
partial object that deep-merges with the built-in.

### `mondonomo` theme (abridged)

```js
{
  background:  '#020f20',
  ringStroke:  '#02b9b9',
  centerGlow:  '#02b9b9',
  font:        '"Noto Sans", sans-serif',
  fontWeight:  { label: 700, sub: 400 },
  spring:      { K: 0.10, damping: 0.74 },

  langColors: {
    English:    '#02b9b9',
    French:     '#7E4067',
    Spanish:    '#9a5080',
    Latin:      '#c99ab8',
    Greek:      '#add8f3',
    Hebrew:     '#6ac9df',
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
}
```

Unknown `edge.type` values fall back to a neutral grey style — the library never
throws on unrecognised types.

---

## 6. Interaction Model

### Desktop

| Event | Behaviour |
|-------|-----------|
| `pointermove` | Hit test → hover highlight + tooltip repositioned |
| `click` | Hit test → `setCenter(id)` + `onSelect(node)` |
| `wheel` | Zoom canvas transform (no layout recompute) |
| `pointerdown` + `pointermove` | Pan canvas transform |

### Mobile / touch

| Gesture | Behaviour |
|---------|-----------|
| Tap (no movement) | Same as click |
| One-finger drag | Pan |
| Two-finger pinch | Zoom |

### Keyboard (accessibility)

| Key | Behaviour |
|-----|-----------|
| `Tab` / `Shift+Tab` | Cycle focus through visible nodes |
| `Enter` / `Space` | Re-centre on focused node |
| `Escape` | Reset view |

Focused node receives a visible focus ring (drawn on Canvas, not CSS outline).

### Tooltip

A single `<div>` positioned absolutely above the canvas via
`transform: translate(x, y)`. Updated on hover. Contains rich HTML — the
library sets `innerHTML` from a template function that callers can override:

```js
new ThinkGraph({
  // ...
  renderTooltip: (node) => `<strong>${node.label}</strong><br>${node.meta?.ipa ?? ''}`,
});
```

Default template renders `label`, `lang · type`, `ipa` if present, and a quality
badge.

---

## 7. File Structure

```
thinkgraph/
├── src/
│   ├── index.js          // ThinkGraph class — public API only
│   ├── layout.js         // BFS + radial ring placement + resize handling
│   ├── spring.js         // per-node spring state, tick(), opacity spring
│   ├── renderer.js       // rAF loop, draw order, pan/zoom transform
│   ├── renderers/
│   │   ├── text.js       // circle + label
│   │   ├── flag.js       // flag image cache + clip render
│   │   └── image.js      // avatar image + initials fallback
│   ├── edges.js          // line + arrowhead drawing, per-type styles
│   ├── hittest.js        // pointer → node, touch inflation
│   ├── theme.js          // mondonomo built-in + deep-merge
│   └── tooltip.js        // absolute div, innerHTML template
├── dist/
│   ├── thinkgraph.esm.js // ES module (tree-shakeable)
│   └── thinkgraph.umd.js // UMD for CDN <script src>
├── examples/
│   ├── etymology/        // wired to real Wiktionary TSV data
│   └── world/            // name-around-world with country flags
├── package.json          // name: "thinkgraph", no runtime dependencies
└── build.js              // esbuild config (~20 lines)
```

**Build**: esbuild only — no Babel, no TypeScript compiler, no Webpack.  
**Types**: JSDoc `@typedef` throughout — IDEs get autocomplete, no `.ts` files.  
**Bundle target**: < 25 KB gzipped (ESM).  
**Distribution**: npm + CDN (`window.ThinkGraph` via UMD).

---

## 8. Out of Scope (v1)

- Server-side rendering
- Graph editing (add/remove nodes)
- Force-directed or freeform layout
- 3D rendering
- Collaborative cursors
- Export to SVG/PNG (can be added trivially via `canvas.toDataURL`)
