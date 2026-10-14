# mondograph

A zero-dependency canvas library for exploring name families: one name at the
centre, everything connected to it around it. It draws sectored, layered and
similarity layouts; it makes edges and spelling chips selectable; it draws
hulls around language groups; and it keeps a keyboard and screen-reader DOM
mirror in sync with the canvas. Theming comes from CSS custom properties, and
snapshots export as SVG or PNG.

It was called `thinkgraph` until 0.1. Version 0.2 renames it. The old import
path (`mondograph/thinkgraph`, `dist/thinkgraph.esm.js`) and the `ThinkGraph`
class name still work for this version.

## Install

```bash
npm i github:dlauc/mondograph_js#v0.2.0
```

`dist/` (ESM and UMD) and `index.d.ts` are committed, so an install runs no
build step. The library has no runtime dependencies.

```js
import { MondoGraph } from 'mondograph';            // ESM
const { MondoGraph } = require('mondograph');      // CommonJS (UMD build)
// <script src="dist/mondograph.umd.cjs"></script>  → window.MondoGraphLib
```

## Quick start

```js
const graph = new MondoGraph({
  container: '#graph',
  theme: 'editorialLight',
  layout: 'sectors',
  layoutOptions: { maxPerSector: 12, sectorOrder: ['F2', 'F3', 'F5', 'F6', 'F7', 'F4'] },
  onEdgeSelect: (edge) => openDrawer(edge),          // edge.assertionId etc.
  onChipSelect: (node, chip) => openDrawer(chip),
  onCenterChange: (id, { reason }) => history.pushState({}, '', `/family/${id}`),
  describeNode: (node, ctx) => ctx.edge
    ? `${node.label}, ${ctx.edge.label} ${ctx.anchor.label}, ${ctx.index} of ${ctx.total}`
    : node.label,
  drawerId: 'drawer',
});

graph.setData({ nodes, edges, groups }, 'ivan');    // you fetch
// or: new MondoGraph({ getNeighbors: async (id) => fetchFamily(id), ... }); graph.setCenter('ivan');
```

## Data

```ts
node  = { id, label?, type?, lang?, gender?, popularity?, importance?, ipa?,
          family?, ring?, score?, period?, chips?: Chip[] }
edge  = { id?, from, to, family?, type?, provenance?, status?, certainty?,
          directed?, label?, assertionId?, score?, weight? }      // src/dst/predicate accepted too
chip  = { id, label, assertionId?, status? }
group = { id, members: string[], label?, color?, padding? }
```

Edges are styled by **family** (colour) × **provenance** × **status** × **certainty**:

| field | value | drawn as |
|---|---|---|
| provenance | `recorded` | solid |
| | `modelled` | dashed |
| | `community` | solid with a small ring mark |
| | `unknown` | dotted |
| status | `disputed` | two strike marks across the middle |
| | `suppressed`, `excluded` | hidden unless `showSuppressed` |
| certainty | `uncertain` | "?" at the midpoint |
| directed | `true` | arrow from → to |

`edge.label` is drawn on hover, selection and keyboard focus.

Chips are pills under a node. At most `maxChips` are shown, and the rest fold
into a `+k` chip. Each chip is hit-testable and carries its `assertionId`
back to you.

`labels: 'inside'` keeps every name inside its own disc: the font shrinks to
70% (never under 7 px) and past that the name is truncated with "…". A label
is never drawn away from its disc; the full name stays in the tooltip and the
DOM mirror. The default, `'auto'`, moves a label that does not fit beside its
disc when there is room.

`edgeFocus: true` (or an alpha, default 0.12) draws only the centre's edges,
and those of the hovered or keyboard-focused node and the selected edge, at
full strength; every other edge stays faint until its node is in hand.

## Layouts

Each layout is a pure, deterministic function
`(graph, { W, H, centerId, ...options }) → Map<id, {x, y}>`. Nothing in the
library calls `Math.random`. Initial jitter is seeded from the node id.

- **`sectors`**: angle is the family and ring is closeness. A node's family
  is `node.family`, else the family of its edge to the centre, else its BFS
  parent's family. Its ring is `node.ring`, else its hop distance. Sector
  width is proportional to the number of nodes in the sector. Crowded rings
  stagger radially to keep `minLabelGap`. Past `maxPerSector`, the
  lowest-priority nodes collapse into a stub
  `{ id: 'more:<family>', type: 'stub', count, members }`. Clicking the stub
  calls `onStubSelect(stub)`; by default it runs `expandStub(id, 20)`.
- **`layered`**: Sugiyama-lite for DAGs of up to about 100 nodes. It does
  longest-path layering on directed edges (`from` above `to`) and barycentre
  ordering sweeps. Back-edges of cycles become undirected and are drawn
  without arrows. Pass `layoutAdapter: async (graph, opts) => positions`
  (for example a lazily imported elkjs). The built-in result shows until the
  adapter resolves.
- **`similarity`**: radius = `minRadius + (1 − score)·(R − minRadius)`, so a
  score of 1 sits next to the centre.
- **`rings`**: the 0.1 layout (hop rings).

`registerLayout(name, fn)` adds your own.

## API

| method | |
|---|---|
| `setCenter(id, {push?})` | re-centre; pushes history; uses `getNeighbors` when given |
| `setData({nodes, edges, groups}, centerId)` | replace the graph |
| `addNeighbors(anchorId, {nodes, edges, groups})` | merge beside the anchor, no re-centre |
| `setLayout(name, options)` | switch layout (animated) |
| `expandStub(stubId, by = 20)` | reveal more of a collapsed sector |
| `setFilter(fn \| {node, edge} \| null)` | fade non-matching items in place |
| `highlight(ids \| null)` | emphasise node/edge ids |
| `selectEdge(id \| null)`, `selectedEdge` | selected edge state |
| `back()`, `canGoBack`, `history` | the re-centre history |
| `setShowSuppressed(bool)` | show suppressed edges and chips |
| `refreshTheme()` | re-read `--mg-*` tokens (after a dark-mode toggle) |
| `setTheme(nameOrObject)` | change the preset |
| `toSVG({fit?})`, `toPNG(scale = 2)` | snapshots (string / Promise<Blob>) |
| `focus(id?)`, `focusEdge(id)` | move keyboard focus into the graph |
| `pick(x, y)` | hit-test a canvas point: chip, then node, then edge |
| `panBy`, `zoomTo`, `resetView`, `getScene`, `positionOf`, `destroy` | |

Callbacks: `onSelect(node)`, `onCenterChange(id, {reason, canGoBack})`,
`onEdgeSelect(edge | null)`, `onChipSelect(node, chip)`, `onStubSelect(stub)`,
`onFrame({drawMs})`, `onError(err)`. The full option list with types is in
[`index.d.ts`](index.d.ts).

## Accessibility

A visually hidden `role="application"` region mirrors the canvas, with one
button per visible node and a roving tabindex. When the graph has focus:

- **← / →** move to the previous or next neighbour of the current anchor.
- **↓** steps into the focused node's own links.
- **↑** steps back out.
- **Home** returns to the centre.
- **Enter** re-centres on the focused node.
- **Esc** calls `back()`.
- **Tab** moves from the focused node to its edges and chips (buttons with
  `aria-controls` pointing at `drawerId`). **Enter** on one of them fires
  `onEdgeSelect` / `onChipSelect`, and **Esc** returns to the node.

Announcements go to an `aria-live="polite"` region. They are built by
`describeNode(node, {edge, anchor, index, total})` and `describeEdge(edge)`.
With `prefers-reduced-motion`, nodes jump straight to their places and the
resting float is off.

## Theming

Presets are `mondonomo` (dark) and `editorialLight`. Any `--mg-*` custom
property set on the container, or inherited by it, overrides the preset:

`--mg-background --mg-ink --mg-muted --mg-accent --mg-aura --mg-node-fill
--mg-ring --mg-shadow --mg-font --mg-label-bg --mg-focus --mg-chip-fill
--mg-chip-ink --mg-chip-stroke --mg-hull --mg-hull-alpha --mg-fade-alpha
--mg-edge --mg-edge-<family> (e.g. --mg-edge-f2) --mg-lang-<lang>
--mg-gender-m/-f/-u`

Call `graph.refreshTheme()` after the page switches theme.

## Performance

The gate is 400 nodes, 800 edges, labels, hulls, chips, edge hit-testing and
the DOM mirror, all at once (`examples/bench/`). When nothing moves, the scene
is drawn once to an offscreen layer. Panning and hovering then blit that layer
and draw only the overlays (hover, focus, selection). While a finger drags, a
settled scene is frozen.

Above 80 nodes, drop shadows and the resting float are off, and plain name
discs are drawn in batches. While a scene of more than 150 nodes animates, chips,
sub-labels and edge marks are skipped and dashes are drawn solid. Below zoom 0.5, labels are
dropped, and below 0.7 chips are dropped. These thresholds are in the `perf`
option.

```bash
npm i -D playwright
node examples/bench/run.mjs          # phone profile (CPU ×4) + desktop
```

## Development

```bash
npm test            # node --test
npm run build       # esbuild → dist/ (commit it)
npm run serve       # http://127.0.0.1:8017/examples/family/
```

MIT licence.
