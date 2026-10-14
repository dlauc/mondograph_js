import { resolveTheme, readThemeTokens, mergeTheme } from './theme.js';
import { createSpringNode } from './spring.js';
import { Renderer } from './renderer.js';
import { Tooltip, escapeHtml } from './tooltip.js';
import { hitTest, hitRadius } from './hittest.js';
import { hitTestEdges } from './edges.js';
import { hitTestChips } from './chips.js';
import { placeLabels } from './labels.js';
import { layouts, placeAround } from './layouts/index.js';
import { normalizeEdges, normalizeNodes } from './graphutil.js';
import { jitter } from './hash.js';
import { A11yMirror } from './a11y.js';
import { sceneToSVG } from './svg.js';

export { preload as preloadFlags, configureFlagBase, clearFlagCache } from './flagStore.js';
export { layouts, registerLayout, rings, sectors, layered, similarity, placeAround } from './layouts/index.js';
export { resolveTheme, readThemeTokens } from './theme.js';
export { hitTest, hitRadius } from './hittest.js';
export { hitTestEdges, pointSegmentDistance, resolveEdgeStyle, computeEdgeGeometry } from './edges.js';
export { layoutChips, hitTestChips } from './chips.js';
export { placeLabels, truncateToWidth } from './labels.js';
export { convexHull, hullPolygon } from './hulls.js';
export { sceneToSVG } from './svg.js';
export { defaultDescribeNode, defaultDescribeEdge } from './a11y.js';
export { hashString, jitter } from './hash.js';
export { visualRadius } from './renderer.js';

export const VERSION = '0.2.1';

const EDGE_TOL_MOUSE = 6;
const EDGE_TOL_TOUCH = 14;
const DRAG_THRESHOLD = 4;

function prefersReducedMotion() {
  try {
    return typeof window !== 'undefined' && !!window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  } catch { return false; }
}

export class MondoGraph {
  /**
   * See index.d.ts for the full option list.
   * @param {object} opts
   */
  constructor(opts) {
    this._opts = { ...opts };
    this._container = typeof opts.container === 'string'
      ? document.querySelector(opts.container)
      : opts.container;
    if (!this._container) throw new Error('mondograph: container not found');
    if (getComputedStyle(this._container).position === 'static') this._container.style.position = 'relative';

    this._baseTheme = resolveTheme(opts.theme);
    this._theme = this._baseTheme;
    this._renderer = new Renderer(this._container, this._theme, opts.perf);
    this._tooltip  = new Tooltip(this._container);
    if (opts.renderTooltip) this._tooltip.setRenderFn(opts.renderTooltip);

    this._all = { nodes: [], edges: [], groups: [] };
    this._nodeById = new Map();
    this._edgeById = new Map();
    this._scene = { nodes: [], edges: [], groups: [] };
    this._sceneNodeById = new Map();
    this._layoutName = opts.layout ?? 'rings';
    this._layoutOpts = { ...(opts.layoutOptions ?? {}) };
    this._layoutResult = new Map();
    this._layoutVersion = 0;
    this._targets = new Map();
    this._sectorExtra = {};
    this._centerId = null;
    this._history = [];
    this._filter = null;
    this._faded = new Set();
    this._fadedEdges = new Set();
    this._highlight = null;
    this._selectedEdgeId = null;
    this._isTouch = false;
    this._setCenterSeq = 0;

    const r = this._renderer;
    r.showSuppressed = !!opts.showSuppressed;
    r.chipsFor = opts.chipsFor ?? 'all';
    r.chipMax = opts.maxChips ?? 4;
    r.showRings = this._layoutName === 'rings';
    r.onFrame = opts.onFrame ?? null;
    r.nodeAlpha = (id) => this._nodeAlphaOf(id);
    r.edgeAlpha = (e) => this._edgeAlphaOf(e);

    this._rmMode = opts.reducedMotion ?? 'auto';
    this._applyReducedMotion();
    if (this._rmMode === 'auto' && typeof window !== 'undefined' && window.matchMedia) {
      try {
        this._rmQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        this._onRm = () => this._applyReducedMotion();
        this._rmQuery.addEventListener?.('change', this._onRm);
      } catch { /* old browsers */ }
    }

    this.refreshTheme();

    r.onResize = () => {
      if (this._centerId == null) return;
      this._relayout({ announce: false });
      this._tooltip.setContainerSize(r.W, r.H);
    };

    if (opts.a11y !== false) {
      this._mirror = new A11yMirror(this._container, this._a11yHost(), {
        label: opts.ariaLabel, roleDescription: opts.ariaRoleDescription,
        describeNode: opts.describeNode, describeEdge: opts.describeEdge, drawerId: opts.drawerId,
      });
    }

    this._bindEvents();
    r.start();

    if (opts.data) this.setData(opts.data, opts.centerId ?? opts.data.nodes?.[0]?.id);
  }

  // ── Public: data ─────────────────────────────────────────────────────────

  /**
   * Re-centre on `id`. With `getNeighbors` the neighbourhood is fetched and
   * replaces the scene; without it the current data is laid out around `id`.
   * Pushes the previous centre onto the history stack (see back()).
   * @param {string} id
   * @param {{push?:boolean, reason?:string}} [o]
   */
  async setCenter(id, o = {}) {
    id = String(id);
    const seq = ++this._setCenterSeq;
    const prev = this._centerId;
    if (o.push !== false && prev != null && prev !== id) this._history.push(prev);
    this._centerId = id;
    this._renderer.centerId = id;
    this._renderer.invalidateStyles();

    const { W, H } = this._renderer.containerSize;
    const existing = this._renderer.springNodes.get(id);
    if (existing) { existing.targetX = W / 2; existing.targetY = H / 2; existing.targetOpacity = 1; }

    if (this._opts.getNeighbors) {
      const spinnerTimer = setTimeout(() => { this._renderer.loading = true; }, 150);
      let data;
      try { data = await this._opts.getNeighbors(id); }
      finally { clearTimeout(spinnerTimer); if (seq === this._setCenterSeq) this._renderer.loading = false; }
      if (seq !== this._setCenterSeq) return;
      this._replaceData(data);
    }
    this._sectorExtra = {};
    this._relayout({ announce: true });
    this._afterCenter(o.reason ?? 'api');
  }

  /** Replace the whole graph (for callers that fetch themselves) and centre on `centerId`. */
  setData(data, centerId, o = {}) {
    this._replaceData(data);
    const id = centerId != null ? String(centerId) : (this._centerId ?? this._all.nodes[0]?.id ?? null);
    const prev = this._centerId;
    if (o.push !== false && prev != null && id != null && prev !== id) this._history.push(prev);
    this._centerId = id;
    this._renderer.centerId = id;
    this._sectorExtra = {};
    this.refreshTheme();
    this._relayout({ announce: prev !== id });
    if (prev !== id) this._afterCenter(o.reason ?? 'data');
  }

  /**
   * Merge more nodes/edges/groups next to `anchorId` without re-centring.
   * New nodes are placed in a fan beside the anchor; nothing else moves.
   */
  addNeighbors(anchorId, data = {}) {
    anchorId = String(anchorId);
    const before = new Set(this._scene.nodes.map(n => n.id));
    const incoming = normalizeNodes(data.nodes);
    for (const n of incoming) {
      const cur = this._nodeById.get(n.id);
      if (cur) Object.assign(cur, n);
      else { this._all.nodes.push(n); this._nodeById.set(n.id, n); }
    }
    for (const e of normalizeEdges(data.edges)) {
      const cur = this._edgeById.get(e.id);
      if (cur) Object.assign(cur, e);
      else { this._all.edges.push(e); this._edgeById.set(e.id, e); }
    }
    this._mergeGroups(data.groups);

    // un-collapse anything that arrived explicitly
    const collapsed = this._layoutResult.collapsed;
    const fresh = [];
    for (const n of incoming) {
      if (collapsed?.has(n.id)) {
        const stubId = collapsed.get(n.id);
        collapsed.delete(n.id);
        const stub = this._layoutResult.stubs?.find(s => s.id === stubId);
        if (stub) {
          stub.members = stub.members.filter(m => m !== n.id);
          stub.count = stub.members.length;
          stub.label = `+${stub.count}`;
          if (!stub.count) this._layoutResult.stubs = this._layoutResult.stubs.filter(s => s !== stub);
        }
      }
      if (!before.has(n.id)) fresh.push(n.id);
    }
    const a = this._targets.get(anchorId) ?? this._renderer.springNodes.get(anchorId);
    const c = this._targets.get(this._centerId) ?? { x: this._renderer.W / 2, y: this._renderer.H / 2 };
    if (a && fresh.length) {
      const pos = placeAround({ x: a.x ?? a.targetX, y: a.y ?? a.targetY }, c, fresh, this._opts.addNeighborsPlacement);
      for (const [id, p] of pos) this._targets.set(id, p);
    }
    this._buildScene();
    this._applyTargets(a ? { x: a.x ?? a.targetX, y: a.y ?? a.targetY } : null);
    this._placeLabels();
    this._applyFilter();
    this._mirror?.sync();
    if (fresh.length) this._mirror?.announce(`${fresh.length} more linked to ${this._nodeById.get(anchorId)?.label ?? anchorId}`);
  }

  /** Switch layout (a registered name or a layout function) and animate to it. */
  setLayout(name, opts = {}) {
    this._layoutName = name;
    this._layoutOpts = { ...opts };
    this._sectorExtra = {};
    this._renderer.showRings = name === 'rings';
    this._relayout({ announce: false });
  }

  /** Fold `by` more nodes of a stub's sector out of the stub (sectors layout). */
  expandStub(stubId, by = 20) {
    const stub = this._layoutResult.stubs?.find(s => s.id === stubId);
    if (!stub) return false;
    this._sectorExtra[stub.family] = (this._sectorExtra[stub.family] ?? 0) + by;
    this._relayout({ announce: false });
    this._mirror?.announce(`Showing ${Math.min(by, stub.count)} more`);
    return true;
  }

  /**
   * Fade non-matching nodes/edges in place. `fn(item, kind)` with kind
   * 'node' | 'edge', or {node?:fn, edge?:fn}; null clears.
   */
  setFilter(fn) {
    this._filter = fn ?? null;
    this._applyFilter();
    this._mirror?.sync();
  }

  /** Emphasise a set of node and/or edge ids (others dim); null clears. */
  highlight(ids) {
    this._highlight = ids ? new Set([...ids].map(String)) : null;
    this._renderer.highlightSet = this._highlight
      ? new Set([...this._highlight].filter(id => this._sceneNodeById.has(id))) : null;
    this._renderer.invalidate();
  }

  /** Select an edge by id (null clears). Does not fire onEdgeSelect. */
  selectEdge(id) {
    this._selectedEdgeId = id == null ? null : String(id);
    this._renderer.selectedEdgeId = this._selectedEdgeId;
    this._touchEdgeFocus();
  }

  get selectedEdge() { return this._selectedEdgeId ? this._edgeById.get(this._selectedEdgeId) ?? null : null; }

  /** Pop the history stack and re-centre there. Returns false when empty. */
  back() {
    const prev = this._history.pop();
    if (prev == null) return false;
    this.setCenter(prev, { push: false, reason: 'back' });
    return true;
  }

  get canGoBack() { return this._history.length > 0; }
  get history() { return this._history.slice(); }
  get centerId() { return this._centerId; }

  /** Show or hide suppressed/excluded edges and chips. */
  setShowSuppressed(on) {
    this._renderer.showSuppressed = !!on;
    this._renderer.invalidateStyles();
    this._placeLabels();
    this._mirror?.sync();
  }

  /** The visible scene (stubs included, collapsed nodes excluded). */
  getScene() {
    return { nodes: this._scene.nodes.slice(), edges: this._scene.edges.slice(), groups: this._scene.groups.slice(), centerId: this._centerId };
  }

  /** Current target position of a node (layout coordinates). */
  positionOf(id) { const t = this._targets.get(String(id)); return t ? { x: t.x, y: t.y } : null; }

  // ── Public: view, theme, export ──────────────────────────────────────────

  setTheme(t) {
    this._baseTheme = resolveTheme(typeof t === 'object' && t ? mergeTheme(this._baseTheme, t) : t);
    this.refreshTheme();
  }

  /** Re-read the `--mg-*` CSS custom properties (call after a dark-mode toggle). */
  refreshTheme() {
    let theme = this._baseTheme;
    if (this._opts.cssTokens !== false && typeof getComputedStyle !== 'undefined') {
      const cs = getComputedStyle(this._container);
      const families = new Set(Object.keys(theme.edgeFamilies ?? {}));
      const langs = new Set(Object.keys(theme.langColors ?? {}));
      for (const e of this._all.edges) if (e.family != null) families.add(String(e.family));
      for (const n of this._all.nodes) if (n.lang != null) langs.add(String(n.lang));
      const tokens = readThemeTokens((name) => cs.getPropertyValue(name), { families, langs });
      theme = mergeTheme(theme, tokens);
    }
    this._theme = theme;
    this._renderer.theme = theme;
    this._applyReducedMotion();
    this._renderer._measureCache.clear();
    this._renderer.invalidateStyles();
    if (this._centerId != null) this._placeLabels();
  }

  get theme() { return this._theme; }

  /** Return pan/zoom to 1× at canvas centre. */
  resetView() {
    this._renderer._panX = 0;
    this._renderer._panY = 0;
    this._renderer._scale = 1;
    this._renderer.invalidateOverlay();
  }

  panBy(dx, dy) {
    this._renderer._panX += dx;
    this._renderer._panY += dy;
    this._renderer.invalidateOverlay();
  }

  /** Zoom to `scale`, keeping screen point (sx, sy) fixed (default: canvas centre). */
  zoomTo(scale, sx, sy) {
    const r = this._renderer;
    const s = Math.max(0.2, Math.min(5, scale));
    sx = sx ?? r.W / 2; sy = sy ?? r.H / 2;
    const wx = (sx - r._panX) / r._scale, wy = (sy - r._panY) / r._scale;
    r._scale = s;
    r._panX = sx - wx * s;
    r._panY = sy - wy * s;
    r.invalidateOverlay();
  }

  get view() { const r = this._renderer; return { panX: r._panX, panY: r._panY, scale: r._scale }; }

  /** Vector snapshot (hulls, edges, nodes, labels, chips) as an SVG string. */
  toSVG(o = {}) {
    return sceneToSVG(this._renderer.snapshotScene(o));
  }

  /** Raster snapshot of the current view as a PNG Blob (`scale` × logical size). */
  toPNG(scale = 2) {
    const c = this._renderer.renderToCanvas(scale);
    return new Promise((resolve, reject) => {
      if (c.toBlob) c.toBlob((b) => (b ? resolve(b) : reject(new Error('toBlob failed'))), 'image/png');
      else resolve(c.toDataURL('image/png'));
    });
  }

  /** Move keyboard focus into the graph (the focused node's mirror button). */
  focus(id) {
    if (!this._mirror) return false;
    return this._mirror.focusNode(id != null ? String(id) : (this._mirror.focusId ?? this._centerId), { announce: true });
  }

  /** Move keyboard focus to an edge's mirror button (e.g. when a drawer closes). */
  focusEdge(id) {
    if (!this._mirror) return false;
    const e = this._edgeById.get(String(id));
    if (!e) return false;
    const nodeId = this._mirror.focusId === e.to ? e.to : e.from;
    this._mirror.focusNode(nodeId, { announce: false });
    return this._mirror.focusEdge(String(id));
  }

  /** Measured performance hook target: the renderer (exposed for benchmarks). */
  get renderer() { return this._renderer; }

  destroy() {
    this._unbindEvents();
    this._rmQuery?.removeEventListener?.('change', this._onRm);
    this._mirror?.destroy();
    this._renderer.destroy();
    this._tooltip.destroy();
  }

  // ── Private: data & layout ───────────────────────────────────────────────

  _replaceData(data = {}) {
    this._all.nodes = normalizeNodes(data.nodes);
    this._all.edges = normalizeEdges(data.edges);
    this._all.groups = [];
    this._nodeById = new Map(this._all.nodes.map(n => [n.id, n]));
    this._edgeById = new Map(this._all.edges.map(e => [e.id, e]));
    this._mergeGroups(data.groups);
    if (this._selectedEdgeId && !this._edgeById.has(this._selectedEdgeId)) this.selectEdge(null);
  }

  _mergeGroups(groups) {
    for (const g of groups ?? []) {
      if (!g || g.id == null) continue;
      const id = String(g.id);
      const cur = this._all.groups.find(x => x.id === id);
      const members = (g.members ?? []).map(String);
      if (cur) { Object.assign(cur, g, { id, members: [...new Set([...cur.members, ...members])] }); }
      else this._all.groups.push({ ...g, id, members });
    }
  }

  _layoutFn() {
    const name = this._layoutName;
    if (typeof name === 'function') return name;
    const fn = layouts[name];
    if (!fn) throw new Error(`mondograph: unknown layout "${name}"`);
    return fn;
  }

  _relayout({ announce }) {
    const { W, H } = this._renderer.containerSize;
    const graph = { nodes: this._all.nodes, edges: this._all.edges, groups: this._all.groups };
    const lopts = { ...this._layoutOpts, W, H, centerId: this._centerId, sectorExtra: this._sectorExtra };
    delete lopts.layoutAdapter;
    const version = ++this._layoutVersion;
    let result = this._layoutFn()(graph, lopts);
    if (!(result instanceof Map)) result = new Map(Object.entries(result ?? {}));
    this._layoutResult = result;
    this._targets = new Map(result);
    this._renderer.backEdges = result.backEdges ?? new Set();
    this._buildScene();
    this._applyTargets(null);
    this._placeLabels();
    this._applyFilter();
    this.highlight(this._highlight);
    this._mirror?.sync();
    if (announce) this._mirror?.recentred(this._centerId);

    const adapter = this._layoutOpts.layoutAdapter;
    if (typeof adapter === 'function') {
      Promise.resolve(adapter(graph, lopts)).then((pos) => {
        if (version !== this._layoutVersion || !pos) return;
        const m = pos instanceof Map ? pos : new Map(Object.entries(pos));
        for (const [id, p] of m) this._targets.set(String(id), { x: p.x, y: p.y });
        this._applyTargets(null);
        this._placeLabels();
      }).catch((err) => { if (this._opts.onError) this._opts.onError(err); });
    }
  }

  _buildScene() {
    const res = this._layoutResult;
    const collapsed = res.collapsed ?? new Map();
    const nodes = this._all.nodes.filter(n => !collapsed.has(n.id));
    for (const s of res.stubs ?? []) nodes.push({ ...s, label: s.label ?? `+${s.count}` });
    const ids = new Set(nodes.map(n => n.id));
    const edges = this._all.edges.filter(e => ids.has(e.from) && ids.has(e.to));
    const groups = this._all.groups;
    this._scene = { nodes, edges, groups };
    this._sceneNodeById = new Map(nodes.map(n => [n.id, n]));
    const r = this._renderer;
    r.nodes = nodes;
    r.edges = edges;
    r.groups = groups;
    r.invalidateStyles();
  }

  /** Point every spring at its target; new nodes start at `origin` (or the centre). */
  _applyTargets(origin) {
    const r = this._renderer;
    const { W, H } = r.containerSize;
    const cx = W / 2, cy = H / 2;
    const reduced = r.reducedMotion;
    const inScene = new Set(this._scene.nodes.map(n => n.id));
    for (const [id, s] of r.springNodes) if (!inScene.has(id)) s.targetOpacity = 0;
    for (const n of this._scene.nodes) {
      let t = this._targets.get(n.id);
      if (!t) {
        // a layout that did not place a node: deterministic spot near the centre
        const j = jitter(n.id, Math.min(W, H) * 0.8);
        t = { x: cx + j.dx, y: cy + j.dy };
        this._targets.set(n.id, t);
      }
      let s = r.springNodes.get(n.id);
      if (!s) {
        const o = origin ?? { x: cx, y: cy };
        const j = jitter(n.id, 40);
        s = createSpringNode(o.x + j.dx, o.y + j.dy, 0);
        const v = jitter(n.id + '#v', 4);
        s.vx = v.dx; s.vy = v.dy;
        r.springNodes.set(n.id, s);
      }
      s.targetX = t.x; s.targetY = t.y; s.targetOpacity = 1;
      if (reduced) { s.x = t.x; s.y = t.y; s.opacity = 1; s.vx = s.vy = 0; }
    }
    r.invalidate();
  }

  _placeLabels() {
    const r = this._renderer;
    const obstacles = [];
    for (const n of this._scene.nodes) {
      if (!n.chips || !n.chips.length || r.chipsFor !== 'all') continue;
      const t = this._targets.get(n.id);
      if (!t) continue;
      for (const b of r.chipOffsets(n)) obstacles.push({ x0: t.x + b.x, y0: t.y + b.y, x1: t.x + b.x + b.w, y1: t.y + b.y + b.h, owner: '#chip' });
    }
    const font = this._theme.font;
    r.labelPlacement = placeLabels(r.labelItems(this._targets), {
      measure: (text, size) => r.measure(text, `700 ${size}px ${font}`),
      obstacles,
      insideOnly: this._opts.labels === 'inside',
    });
    r.invalidate();
  }

  _matches(item, kind) {
    const f = this._filter;
    if (!f) return true;
    if (typeof f === 'function') return !!f(item, kind);
    const g = f[kind];
    return g ? !!g(item) : true;
  }

  _applyFilter() {
    const faded = new Set();
    const fadedEdges = new Set();
    if (this._filter) {
      for (const n of this._scene.nodes) {
        if (n.id === this._centerId) continue;
        if (!this._matches(n, 'node')) faded.add(n.id);
      }
      for (const e of this._scene.edges) {
        if (faded.has(e.from) || faded.has(e.to) || !this._matches(e, 'edge')) fadedEdges.add(e.id);
      }
    }
    this._faded = faded;
    this._fadedEdges = fadedEdges;
    this._renderer.invalidate();
  }

  _nodeAlphaOf(id) {
    if (this._faded.has(id)) return this._theme.fadeAlpha ?? 0.12;
    if (this._highlight && !this._highlight.has(id) && id !== this._centerId) return 0.35;
    return 1;
  }

  _edgeAlphaOf(e) {
    if (this._fadedEdges.has(e.id)) return this._theme.fadeAlpha ?? 0.12;
    if (this._highlight && !this._highlight.has(e.id) && !(this._highlight.has(e.from) && this._highlight.has(e.to))) return 0.3;
    const ef = this._opts.edgeFocus;
    if (ef) {
      // Only the focus's own edges, and those of the node in hand (hovered,
      // keyboard-focused, or an end of the selected edge), at full strength.
      const r = this._renderer;
      const live = [this._centerId, r.hoveredId, r.focusedId];
      const sel = this._selectedEdgeId ? this._edgeById.get(this._selectedEdgeId) : null;
      if (sel) live.push(sel.from, sel.to);
      if (e.id === this._selectedEdgeId || live.includes(e.from) || live.includes(e.to)) return 1;
      return typeof ef === 'number' ? ef : 0.12;
    }
    return 1;
  }

  /** Under edgeFocus the base layer depends on the node in hand. */
  _touchEdgeFocus() {
    if (this._opts.edgeFocus) this._renderer.invalidate(); else this._renderer.invalidateOverlay();
  }

  _edgeVisible(e) {
    const st = this._renderer._styleMap().get(e.id);
    return !!st && !st.hidden && !this._fadedEdges.has(e.id);
  }

  /** Visible neighbours of `id`, clockwise from 12 o'clock around it. */
  _neighbours(id) {
    const t0 = this._targets.get(id);
    const seen = new Set();
    const out = [];
    for (const e of this._scene.edges) {
      let other = null;
      if (e.from === id) other = e.to; else if (e.to === id) other = e.from;
      if (other == null || other === id || seen.has(other) || this._faded.has(other)) continue;
      if (!this._edgeVisible(e)) continue;
      seen.add(other);
      out.push({ id: other, edge: e });
    }
    if (t0) {
      const ang = (o) => {
        const t = this._targets.get(o.id);
        if (!t) return 0;
        let a = Math.atan2(t.y - t0.y, t.x - t0.x) + Math.PI / 2;
        if (a < 0) a += Math.PI * 2;
        return a;
      };
      out.sort((a, b) => ang(a) - ang(b));
    }
    return out;
  }

  _chipsOf(node) {
    const show = this._renderer.showSuppressed;
    return (node.chips ?? []).filter(c => c && (show || (c.status !== 'suppressed' && c.status !== 'excluded')));
  }

  _a11yHost() {
    return {
      getScene: () => ({ nodes: this._scene.nodes.filter(n => !this._faded.has(n.id)), centerId: this._centerId }),
      neighbours: (id) => this._neighbours(id),
      edgesOf: (id) => this._scene.edges
        .filter(e => (e.from === id || e.to === id) && e.from !== e.to && this._edgeVisible(e)
          && !this._faded.has(e.from === id ? e.to : e.from))
        .map(e => ({ id: e.from === id ? e.to : e.from, edge: e })),
      chipsOf: (node) => this._chipsOf(node),
      recentre: (id) => this._activateNode(id, 'keyboard'),
      back: () => this.back(),
      activateEdge: (edgeId) => {
        const e = this._edgeById.get(edgeId);
        if (!e) return;
        this.selectEdge(e.id);
        this._opts.onEdgeSelect?.(e);
      },
      activateChip: (nodeId, chipId) => {
        const node = this._sceneNodeById.get(nodeId);
        const chip = node?.chips?.find(c => c.id === chipId);
        if (node && chip) this._opts.onChipSelect?.(node, chip);
      },
      setFocus: (id) => {
        const was = this._renderer.focusedId;
        this._renderer.focusedId = id;
        if (was !== id) this._touchEdgeFocus(); else this._renderer.invalidateOverlay();
      },
      setFocusedEdge: (id) => { this._renderer.focusedEdgeId = id; this._renderer.invalidateOverlay(); },
      setFocusedChip: (nodeId, chipId) => {
        this._renderer.focusedChip = chipId ? { nodeId, chipId } : null;
        this._renderer.invalidateOverlay();
      },
    };
  }

  _afterCenter(reason) {
    const centerNode = this._nodeById.get(this._centerId);
    if (centerNode && this._opts.onSelect) this._opts.onSelect(centerNode);
    if (this._opts.onCenterChange) this._opts.onCenterChange(this._centerId, { reason, canGoBack: this.canGoBack });
  }

  _activateNode(id, reason) {
    const n = this._sceneNodeById.get(id);
    if (!n) return;
    if (n.type === 'stub') {
      if (this._opts.onStubSelect) this._opts.onStubSelect(n);
      else this.expandStub(n.id);
      return;
    }
    if (id === this._centerId) { this._opts.onSelect?.(n); return; }
    this.setCenter(id, { reason });
  }

  _applyReducedMotion() {
    const m = this._rmMode;
    const on = m === true || (m === 'auto' && prefersReducedMotion());
    if (this._renderer) {
      this._renderer.reducedMotion = on;
      this._renderer.invalidate();
    }
  }

  // ── Private: pointer ─────────────────────────────────────────────────────

  _canvasXY(e) {
    const rect = this._renderer.canvas.getBoundingClientRect();
    return { x: e.clientX - rect.left, y: e.clientY - rect.top };
  }

  _toWorld(x, y) {
    const r = this._renderer;
    return { x: (x - r._panX) / r._scale, y: (y - r._panY) / r._scale };
  }

  /** Hit-test at a screen point → {kind:'chip'|'node'|'edge', ...} | null. */
  pick(sx, sy) {
    const r = this._renderer;
    const { x, y } = this._toWorld(sx, sy);
    const pad = this._isTouch ? 6 : 1;
    const chip = hitTestChips(x, y, r.chipBoxes, pad / r._scale);
    if (chip && !this._faded.has(chip.nodeId)) return { kind: 'chip', nodeId: chip.nodeId, chip: chip.chip };
    const list = [];
    for (const n of this._scene.nodes) {
      const s = r.springNodes.get(n.id);
      if (!s || s.opacity < 0.2 || this._faded.has(n.id)) continue;
      list.push({ id: n.id, x: s.x, y: s.y, hitRadius: hitRadius(n, n.id === this._centerId, this._isTouch) });
    }
    const id = hitTest(x, y, list);
    if (id) return { kind: 'node', id };
    const tol = (this._isTouch ? EDGE_TOL_TOUCH : EDGE_TOL_MOUSE) / r._scale;
    const eid = hitTestEdges(x, y, r.edgeGeom, tol, (edgeId) => {
      const e = this._edgeById.get(edgeId);
      return !!e && this._edgeVisible(e);
    });
    if (eid) return { kind: 'edge', id: eid };
    return null;
  }

  _bindEvents() {
    const canvas = this._renderer.canvas;
    const r = this._renderer;
    const pointers = new Map();
    let down = null, dragged = false, pinch = null, idleTimer = null;
    // While interacting, a settled scene freezes so the renderer can blit its cached layer.
    const interact = (ms) => {
      r.interacting = true;
      clearTimeout(idleTimer);
      if (ms != null) idleTimer = setTimeout(() => { r.interacting = false; }, ms);
    };
    this._interact = interact;

    this._onMove = (e) => {
      if (e.pointerType === 'touch') this._isTouch = true;
      if (pointers.has(e.pointerId)) pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pinch && pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        const d = Math.hypot(a.x - b.x, a.y - b.y);
        const rect = canvas.getBoundingClientRect();
        this.zoomTo(pinch.scale * d / pinch.d, (a.x + b.x) / 2 - rect.left, (a.y + b.y) / 2 - rect.top);
        return;
      }
      if (down && e.buttons !== 0) {
        const dx = e.clientX - down.x, dy = e.clientY - down.y;
        if (!dragged && Math.hypot(dx, dy) > DRAG_THRESHOLD) dragged = true;
        if (dragged) {
          this.panBy(e.clientX - down.lx, e.clientY - down.ly);
          down.lx = e.clientX; down.ly = e.clientY;
          this._tooltip.hide();
          return;
        }
      }
      const { x, y } = this._canvasXY(e);
      this._hover(this.pick(x, y), x, y);
    };

    this._onDown = (e) => {
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      if (pointers.size === 2) {
        const [a, b] = [...pointers.values()];
        pinch = { d: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)), scale: r._scale };
        dragged = true;
        return;
      }
      down = { x: e.clientX, y: e.clientY, lx: e.clientX, ly: e.clientY };
      dragged = false;
      interact();
    };
    this._onUp = (e) => {
      pointers.delete(e.pointerId);
      if (pointers.size < 2) pinch = null;
      if (!pointers.size) { down = null; interact(400); }
    };

    this._onClick = (e) => {
      if (dragged) { dragged = false; return; }
      const { x, y } = this._canvasXY(e);
      if (x > r.W - 40 && y < 40) { this.resetView(); return; }
      const hit = this.pick(x, y);
      if (!hit) {
        if (this._selectedEdgeId) { this.selectEdge(null); this._opts.onEdgeSelect?.(null); }
        return;
      }
      if (hit.kind === 'chip') {
        const node = this._sceneNodeById.get(hit.nodeId);
        this._opts.onChipSelect?.(node, hit.chip);
      } else if (hit.kind === 'node') {
        this._mirror?.focusNode(hit.id, { announce: false, move: false });
        this._activateNode(hit.id, 'click');
      } else if (hit.kind === 'edge') {
        const edge = this._edgeById.get(hit.id);
        this.selectEdge(hit.id);
        this._opts.onEdgeSelect?.(edge);
      }
    };

    this._onWheel = (e) => {
      e.preventDefault();
      const { x, y } = this._canvasXY(e);
      interact(300);
      this.zoomTo(r._scale * (e.deltaY > 0 ? 0.9 : 1.1), x, y);
    };

    this._onLeave = () => { this._hover(null); };
    this._onTouchStart = () => { this._isTouch = true; };

    canvas.addEventListener('pointermove',  this._onMove);
    canvas.addEventListener('pointerdown',  this._onDown);
    canvas.addEventListener('pointerup',    this._onUp);
    canvas.addEventListener('pointercancel', this._onUp);
    canvas.addEventListener('pointerleave', this._onLeave);
    canvas.addEventListener('click',        this._onClick);
    canvas.addEventListener('wheel',        this._onWheel, { passive: false });
    canvas.addEventListener('touchstart',   this._onTouchStart, { passive: true });
  }

  _hover(hit, x, y) {
    const r = this._renderer;
    const prev = `${r.hoveredId}|${r.hoveredEdgeId}|${r.hoveredChip?.nodeId}|${r.hoveredChip?.chipId}`;
    r.hoveredId = hit?.kind === 'node' ? hit.id : null;
    r.hoveredEdgeId = hit?.kind === 'edge' ? hit.id : null;
    r.hoveredChip = hit?.kind === 'chip' ? { nodeId: hit.nodeId, chipId: hit.chip.id } : null;
    const now = `${r.hoveredId}|${r.hoveredEdgeId}|${r.hoveredChip?.nodeId}|${r.hoveredChip?.chipId}`;
    if (prev !== now) {
      if (prev.split('|')[0] !== now.split('|')[0]) this._touchEdgeFocus(); else r.invalidateOverlay();
    }
    r.canvas.style.cursor = hit ? 'pointer' : 'grab';
    if (!hit) { this._tooltip.hide(); return; }
    if (hit.kind === 'node') {
      const node = this._sceneNodeById.get(hit.id);
      if (node) this._tooltip.show(node, x, y);
    } else if (hit.kind === 'chip') {
      const c = hit.chip;
      const html = this._opts.renderChipTooltip
        ? this._opts.renderChipTooltip(this._sceneNodeById.get(hit.nodeId), c)
        : (c.overflow ? `${escapeHtml(c.count)} more` : `<strong>${escapeHtml(c.label)}</strong>${c.status && c.status !== 'open' ? ` · ${escapeHtml(c.status)}` : ''}`);
      this._tooltip.showHTML(html, x, y);
    } else if (hit.kind === 'edge') {
      const e = this._edgeById.get(hit.id);
      if (this._opts.renderEdgeTooltip) this._tooltip.showHTML(this._opts.renderEdgeTooltip(e), x, y);
      else this._tooltip.hide();
    }
  }

  _unbindEvents() {
    const canvas = this._renderer.canvas;
    canvas.removeEventListener('pointermove',  this._onMove);
    canvas.removeEventListener('pointerdown',  this._onDown);
    canvas.removeEventListener('pointerup',    this._onUp);
    canvas.removeEventListener('pointercancel', this._onUp);
    canvas.removeEventListener('pointerleave', this._onLeave);
    canvas.removeEventListener('click',        this._onClick);
    canvas.removeEventListener('wheel',        this._onWheel);
    canvas.removeEventListener('touchstart',   this._onTouchStart);
  }
}

/** @deprecated since 0.2.0: the package is now `mondograph`; `ThinkGraph` stays as an alias for one version. */
export const ThinkGraph = MondoGraph;

export default MondoGraph;
