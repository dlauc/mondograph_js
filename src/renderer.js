import { tickSprings } from './spring.js';
import { drawEdges, computeEdgeGeometry, resolveEdgeStyle } from './edges.js';
import { drawNode, drawDiscBatch, isBatchableDisc, labelFontSize, insideLabelOffset } from './renderers/text.js';
import { drawFlagNode }  from './renderers/flag.js';
import { drawImageNode } from './renderers/image.js';
import { layoutChips, drawChip, drawChipBatch, CHIP_FONT_PX } from './chips.js';
import { hullPolygon, traceSmooth, smoothPathD, hullTop } from './hulls.js';
import { hashString, seededRandom } from './hash.js';
import { langColor } from './theme.js';

/** Visual radius used for edge clipping (not hit-testing). Scales with popularity. */
export function visualRadius(node, isCenter) {
  let base;
  const type = node ? node.type : 'text';
  if (isCenter)                    base = 38;
  else if (type === 'attestation') base = 8;
  else if (type === 'concept')     base = 18;
  else if (type === 'referent')    base = 20;
  else if (type === 'element')     base = 12;
  else if (type === 'stub')        base = 16;
  else                             base = 22;

  const popularity = node && node.popularity != null ? node.popularity : 0.5;
  return base * (0.7 + 0.6 * popularity);
}

/** Node types whose main label is drawn by the disc renderer (and so placed by the label pass). */
const NON_DISC_TYPES = new Set(['surname', 'concept', 'referent', 'element', 'attestation', 'flag', 'image', 'stub']);
export function hasDiscLabel(node) { return !NON_DISC_TYPES.has(node.type); }

export const DEFAULT_PERF = {
  maxDpr:          2,     // cap device pixel ratio (fill cost grows with dpr²)
  shadowMaxNodes:  80,    // above this many nodes, node drop shadows are skipped
  labelMinScale:   0.5,   // below this zoom, only the centre keeps its label
  chipMinScale:    0.7,   // below this zoom, chips are not drawn
  hullQuantum:     4,     // hull outlines are recomputed only when members move this far (px)
  idleRedrawMs:    250,   // when nothing moves, redraw at most this often (late image loads)
  floatMaxNodes:   80,    // the theme's resting float is switched off above this many nodes
  layerCache:      true,  // when nothing moves, the scene is drawn once to an offscreen layer and blitted
  layerMaxPixels:  3,     // layer budget, in multiples of the on-screen canvas area
  motionLOD:       true,  // while a large scene animates: no chips, sub-labels or edge marks, dashes drawn solid
  lodMinNodes:     150,
};

export class Renderer {
  /**
   * @param {HTMLElement} container
   * @param {object}      theme  resolveTheme() output
   * @param {object}      [perf] overrides of DEFAULT_PERF
   */
  constructor(container, theme, perf = {}) {
    this.theme    = theme;
    this.perf     = { ...DEFAULT_PERF, ...perf };
    this.canvas   = document.createElement('canvas');
    this.canvas.style.cssText = 'width:100%;height:100%;display:block;touch-action:none;';
    container.appendChild(this.canvas);

    this.ctx      = this.canvas.getContext('2d');
    this._dpr     = Math.min(this.perf.maxDpr, (typeof window !== 'undefined' && window.devicePixelRatio) || 1);
    this._rafId   = null;

    // Viewport transform (pan / zoom)
    this._panX  = 0;
    this._panY  = 0;
    this._scale = 1;

    // Scene (set by MondoGraph)
    this.springNodes = new Map();
    this.nodes       = [];
    this.edges       = [];
    this.groups      = [];
    this.centerId    = null;
    this.loading     = false;
    this.hoveredId   = null;
    this.focusedId   = null;
    this.hoveredEdgeId  = null;
    this.selectedEdgeId = null;
    this.focusedEdgeId  = null;
    this.hoveredChip    = null;   // {nodeId, chipId}
    this.focusedChip    = null;
    this.highlightSet   = null;   // Set of node ids (null = none)
    this.nodeAlpha      = null;   // (id) => multiplier
    this.edgeAlpha      = null;   // (edge) => multiplier
    this.labelPlacement = new Map();
    this.backEdges      = new Set();
    this.showSuppressed = false;
    this.chipsFor       = 'all';  // 'all' | 'focus' | 'none'
    this.chipMax        = 4;
    this.showRings      = true;
    this.reducedMotion  = false;
    this.onFrame        = null;   // ({drawMs, nodes, edges}) => void

    // Per-frame products, read by hit-testing
    this.nodeState  = new Map();
    this.edgeGeom   = new Map();
    this.chipBoxes  = [];

    this._styles     = null;
    this._chipCache  = new Map();
    this._hullCache  = new Map();
    this._measureCache = new Map();
    this._dirty      = true;
    this._lastDraw   = 0;
    this._sceneVersion = 0;
    this._motionSeq  = 0;
    this._layer      = null;
    this._lastScaleChange = -1e9;
    this._lastScale  = 1;
    this.interacting = false;   // set while the user drags / pinches / wheels
    this._rand       = seededRandom(hashString('mondograph-idle'));

    this.W = 0; this.H = 0;
    this.onResize = null;
    this._resize();

    this._ro = new ResizeObserver(() => this._resize());
    this._ro.observe(container);
  }

  /** The scene changed (data, styles, labels, filter, theme): redraw and drop the cached layer. */
  invalidate() { this._dirty = true; this._sceneVersion++; }

  /** Only overlays changed (hover, focus, selection): the cached layer stays valid. */
  invalidateOverlay() { this._dirty = true; }

  /** Edge styles depend on theme, showSuppressed and backEdges: recompute lazily. */
  invalidateStyles() { this._styles = null; this._chipCache.clear(); this.invalidate(); }

  /** Cached text width for a CSS font string. */
  measure(text, font) {
    const key = font + '\u0000' + text;
    let w = this._measureCache.get(key);
    if (w == null) {
      this.ctx.font = font;
      w = this.ctx.measureText(text).width;
      if (this._measureCache.size > 20000) this._measureCache.clear();
      this._measureCache.set(key, w);
    }
    return w;
  }

  _resize() {
    const dpr = this._dpr;
    const W   = this.canvas.offsetWidth  || this.canvas.parentElement?.offsetWidth  || 600;
    const H   = this.canvas.offsetHeight || this.canvas.parentElement?.offsetHeight || 400;
    if (W === this.W && H === this.H && this.canvas.width === Math.round(W * dpr)) return;
    this.canvas.width  = Math.round(W * dpr);
    this.canvas.height = Math.round(H * dpr);
    this.W = W; this.H = H;
    this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    this._dirty = true;
    if (this.onResize) this.onResize(this.W, this.H);
  }

  get containerSize() { return { W: this.W, H: this.H }; }

  start() {
    if (this._rafId != null) return;
    const loop = (now) => {
      this._rafId = requestAnimationFrame(loop);
      this.frame(now);
    };
    this._rafId = requestAnimationFrame(loop);
  }

  /** One animation step + draw when needed. Exposed for tests/benchmarks. */
  frame(now = (typeof performance !== 'undefined' ? performance.now() : Date.now())) {
    let moving = false;
    // While the user pans or zooms, a scene that has only its resting float
    // left is frozen in place so the cached layer can be blitted.
    const frozen = this.interacting && this._settled();
    const floating = frozen ? false : this._applyMotion();
    if (frozen) {
      for (const s of this.springNodes.values()) { s.vx = 0; s.vy = 0; }
    } else if (this.reducedMotion) {
      for (const s of this.springNodes.values()) {
        if (s.x !== s.targetX || s.y !== s.targetY || s.opacity !== s.targetOpacity) {
          s.x = s.targetX; s.y = s.targetY; s.opacity = s.targetOpacity; s.vx = s.vy = s.vOpacity = 0;
          moving = true;
        }
      }
    } else {
      tickSprings(this.springNodes, this.theme.spring, this.theme.opacitySpring);
      for (const s of this.springNodes.values()) {
        if (Math.abs(s.vx) > 0.01 || Math.abs(s.vy) > 0.01 || Math.abs(s.opacity - s.targetOpacity) > 0.004) { moving = true; break; }
      }
    }
    // Prune fully-faded departed nodes to prevent unbounded Map growth
    for (const [id, s] of this.springNodes) {
      if (s.opacity < 0.01 && s.targetOpacity === 0) this.springNodes.delete(id);
    }
    if (moving || floating) this._motionSeq++;
    this._movingNow = moving || floating;
    if (this._scale !== this._lastScale) { this._lastScale = this._scale; this._lastScaleChange = now; }
    this._now = now;
    const idle = !(moving || floating || this._dirty || this.loading || this._animatedEdges);
    if (idle && now - this._lastDraw < this.perf.idleRedrawMs) return false;
    this._dirty = false;
    this._lastDraw = now;
    const t0 = typeof performance !== 'undefined' ? performance.now() : Date.now();
    this._draw(this.ctx, this.W, this.H, { overlays: true });
    if (this.onFrame) {
      const t1 = typeof performance !== 'undefined' ? performance.now() : Date.now();
      this.onFrame({ drawMs: t1 - t0, nodes: this.nodes.length, edges: this.edges.length });
    }
    return true;
  }

  /** True when every node is near its target (the resting float stays within this) and faded in/out. */
  _settled() {
    for (const s of this.springNodes.values()) {
      if (Math.abs(s.x - s.targetX) > 8 || Math.abs(s.y - s.targetY) > 8 || Math.abs(s.opacity - s.targetOpacity) > 0.02) return false;
    }
    return true;
  }

  stop() {
    if (this._rafId != null) cancelAnimationFrame(this._rafId);
    this._rafId = null;
  }

  _styleMap() {
    if (!this._styles) {
      const st = new Map();
      const state = { showSuppressed: this.showSuppressed, backEdges: this.backEdges };
      let animated = false;
      for (const e of this.edges) {
        const s = resolveEdgeStyle(e, this.theme, state);
        if (s.animate) animated = true;
        st.set(e.id, s);
      }
      this._styles = st;
      this._animatedEdges = animated;
    }
    return this._styles;
  }

  /** Recompute node state, edge geometry and chip boxes for the current positions. */
  _updateGeometry() {
    const ns = this.nodeState;
    const live = new Set();
    for (const n of this.nodes) {
      const s = this.springNodes.get(n.id);
      if (!s) continue;
      live.add(n.id);
      let o = ns.get(n.id);
      if (!o) ns.set(n.id, o = { x: 0, y: 0, opacity: 1, visualRadius: 0 });
      o.x = s.x; o.y = s.y;
      o.opacity = s.opacity * (this.nodeAlpha ? this.nodeAlpha(n.id) : 1);
      o.visualRadius = visualRadius(n, n.id === this.centerId);
    }
    for (const id of ns.keys()) if (!live.has(id)) ns.delete(id);
    const styles = this._styleMap();
    this.edgeGeom = computeEdgeGeometry(this.edges, ns, (e) => styles.get(e.id)?.arrow ?? false);
    this._updateChips();
  }

  _chipsVisibleFor(n) {
    if (!n.chips || !n.chips.length || this.chipsFor === 'none') return false;
    if (this.chipsFor === 'focus') {
      return n.id === this.centerId || n.id === this.hoveredId || n.id === this.focusedId
        || (this.hoveredChip && this.hoveredChip.nodeId === n.id);
    }
    return true;
  }

  /** Chip boxes relative to a node, cached per node until styles change. */
  chipOffsets(n) {
    let c = this._chipCache.get(n.id);
    if (c && c.chips === n.chips && c.center === (n.id === this.centerId)) return c.boxes;
    const r = visualRadius(n, n.id === this.centerId);
    const font = `500 ${CHIP_FONT_PX}px ${this.theme.font}`;
    const boxes = layoutChips(n.chips, 0, 0, r, {
      max: this.chipMax, showSuppressed: this.showSuppressed,
      measure: (t) => this.measure(t, font),
    });
    this._chipCache.set(n.id, { chips: n.chips, center: n.id === this.centerId, boxes });
    return boxes;
  }

  _updateChips() {
    const out = [];
    if (this._scale >= this.perf.chipMinScale) {
      for (const n of this.nodes) {
        if (!this._chipsVisibleFor(n)) continue;
        const o = this.nodeState.get(n.id);
        if (!o || o.opacity < 0.3) continue;
        for (const b of this.chipOffsets(n)) {
          out.push({ nodeId: n.id, chip: b.chip, x: o.x + b.x, y: o.y + b.y, w: b.w, h: b.h, opacity: o.opacity });
        }
      }
    }
    this.chipBoxes = out;
  }

  /**
   * Draw one frame into `ctx` (logical W×H; the caller sets the device transform).
   * @param {{overlays?:boolean}} opts  overlays = spinner + reset button
   */
  _draw(ctx, W, H, opts = {}) {
    const theme = this.theme;
    this._updateGeometry();
    theme._noShadow = this.nodes.length > this.perf.shadowMaxNodes;

    ctx.clearRect(0, 0, W, H);
    ctx.fillStyle = theme.background;
    ctx.fillRect(0, 0, W, H);

    const layer = opts.overlays && this._cacheable() ? this._ensureLayer(W, H) : null;
    if (layer) {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      const dpr = this._dpr;
      ctx.drawImage(layer.canvas, Math.round((this._panX + layer.x0 * this._scale) * dpr),
        Math.round((this._panY + layer.y0 * this._scale) * dpr));
      ctx.restore();
      this.layerHits = (this.layerHits ?? 0) + 1;
    } else {
      const lod = this.perf.motionLOD && this._movingNow && this.nodes.length > this.perf.lodMinNodes;
      ctx.save();
      ctx.translate(this._panX, this._panY);
      ctx.scale(this._scale, this._scale);
      this._drawBase(ctx, W, H, lod);
      ctx.restore();
    }

    ctx.save();
    ctx.translate(this._panX, this._panY);
    ctx.scale(this._scale, this._scale);
    this._drawOverlay(ctx);
    ctx.restore();

    if (opts.overlays) {
      if (this.loading) this._drawSpinner(ctx, W / 2, H / 2);
      this._drawResetBtn(ctx, W, H);
    }
  }

  /** Everything that does not depend on hover / focus / selection (world coordinates). */
  _drawBase(ctx, W, H, lod = false) {
    if (this.showRings) this._drawRings(ctx, W, H);
    else this._drawAura(ctx, Math.min(W, H));
    this._drawHulls(ctx);
    drawEdges(ctx, this.edges, this.nodeState, this.theme, {
      geometry: this.edgeGeom, styles: this._styleMap(), edgeAlpha: this.edgeAlpha, lod,
    });
    this._drawNodes(ctx, lod);
    if (!lod) this._drawChips(ctx);
  }

  /** Hovered / selected / focused edges and chips, highlight, hover and focus rings. */
  _drawOverlay(ctx) {
    const ids = [this.hoveredEdgeId, this.selectedEdgeId, this.focusedEdgeId].filter(Boolean);
    if (ids.length) {
      const set = new Set(ids);
      const list = this.edges.filter(e => set.has(e.id));
      drawEdges(ctx, list, this.nodeState, this.theme, {
        geometry: this.edgeGeom, styles: this._styleMap(), edgeAlpha: this.edgeAlpha,
        hoveredEdgeId: this.hoveredEdgeId, selectedEdgeId: this.selectedEdgeId, focusedEdgeId: this.focusedEdgeId,
      });
    }
    const hc = this.hoveredChip, fc = this.focusedChip;
    if (hc || fc) {
      for (const b of this.chipBoxes) {
        const active = (hc && hc.nodeId === b.nodeId && hc.chipId === b.chip.id)
          || (fc && fc.nodeId === b.nodeId && fc.chipId === b.chip.id);
        if (!active) continue;
        ctx.save();
        ctx.globalAlpha = b.opacity;
        drawChip(ctx, b, this.theme, { active: true });
        ctx.restore();
      }
    }
    this._drawHighlights(ctx);
    this._drawHoverRing(ctx);
    this._drawFocusRing(ctx);
  }

  _cacheable() {
    return this.perf.layerCache && !this._movingNow && !this.loading && !this._animatedEdges
      && (this._now ?? 0) - this._lastScaleChange > 150 && this.nodes.length > 0;
  }

  /** The scene drawn once into an offscreen canvas covering the content's world bounds. */
  _ensureLayer(W, H) {
    const dpr = this._dpr, sc = this._scale;
    const key = `${this._sceneVersion}|${this._motionSeq}|${sc}|${dpr}|${W}|${H}`;
    if (this._layer && this._layer.key === key) return this._layer.ok ? this._layer : null;
    let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
    for (const o of this.nodeState.values()) {
      if (o.opacity < 0.01) continue;
      const m = o.visualRadius + 90;
      x0 = Math.min(x0, o.x - m); x1 = Math.max(x1, o.x + m);
      y0 = Math.min(y0, o.y - m); y1 = Math.max(y1, o.y + m);
    }
    for (const b of this.chipBoxes) { x0 = Math.min(x0, b.x - 4); x1 = Math.max(x1, b.x + b.w + 4); y1 = Math.max(y1, b.y + b.h + 4); }
    if (this.showRings) {
      const r = Math.min(W, H) * 0.5 + 2;
      x0 = Math.min(x0, W / 2 - r); x1 = Math.max(x1, W / 2 + r); y0 = Math.min(y0, H / 2 - r); y1 = Math.max(y1, H / 2 + r);
    }
    const pw = Math.ceil((x1 - x0) * sc * dpr), ph = Math.ceil((y1 - y0) * sc * dpr);
    const budget = this.perf.layerMaxPixels * this.canvas.width * this.canvas.height;
    if (!(pw > 0 && ph > 0) || pw * ph > budget || pw > 8192 || ph > 8192) {
      this._layer = { key, ok: false };
      return null;
    }
    let canvas = this._layer?.canvas;
    if (!canvas) canvas = document.createElement('canvas');
    if (canvas.width !== pw || canvas.height !== ph) { canvas.width = pw; canvas.height = ph; }
    const lctx = canvas.getContext('2d');
    lctx.setTransform(1, 0, 0, 1, 0, 0);
    lctx.clearRect(0, 0, pw, ph);
    lctx.setTransform(sc * dpr, 0, 0, sc * dpr, -x0 * sc * dpr, -y0 * sc * dpr);
    this._drawBase(lctx, W, H);
    this._layer = { key, ok: true, canvas, x0, y0 };
    this.layerBuilds = (this.layerBuilds ?? 0) + 1;
    return this._layer;
  }

  _drawAura(ctx, min) {
    const cp = this.springNodes.get(this.centerId);
    if (!cp || !this.theme.centerAura) return;
    ctx.save();
    const aura = this.theme.centerAura;
    const grad = ctx.createRadialGradient(cp.x, cp.y, 0, cp.x, cp.y, min * 0.18);
    grad.addColorStop(0, aura);
    grad.addColorStop(1, aura.replace(/[\d.]+\)$/, '0)'));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(cp.x, cp.y, min * 0.18, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
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
    ctx.save();
    const cp = this.springNodes.get(this.centerId);
    if (cp) {
      const aura = this.theme.centerAura ?? 'rgba(2,185,185,.18)';
      const grad = ctx.createRadialGradient(cp.x, cp.y, 0, cp.x, cp.y, min * 0.18);
      grad.addColorStop(0,   aura);
      grad.addColorStop(1,   aura.replace(/[\d.]+\)$/, '0)'));
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cp.x, cp.y, min * 0.18, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  }

  /** Hull polygons for the current frame (cached while members stay within hullQuantum px). */
  hullShapes() {
    const out = [];
    const q = this.perf.hullQuantum;
    const keep = new Set();
    for (const g of this.groups || []) {
      const circles = [];
      let sig = '';
      let alpha = 0;
      for (const id of g.members || []) {
        const o = this.nodeState.get(id);
        if (!o || o.opacity < 0.05) continue;
        circles.push({ x: o.x, y: o.y, r: o.visualRadius });
        sig += id + ':' + Math.round(o.x / q) + ',' + Math.round(o.y / q) + ';';
        alpha = Math.max(alpha, o.opacity);
      }
      if (!circles.length) continue;
      keep.add(g.id);
      let c = this._hullCache.get(g.id);
      if (!c || c.sig !== sig) {
        const poly = hullPolygon(circles, g.padding ?? 12);
        c = { sig, poly, top: hullTop(poly) };
        this._hullCache.set(g.id, c);
      }
      out.push({ group: g, poly: c.poly, top: c.top, alpha });
    }
    for (const id of this._hullCache.keys()) if (!keep.has(id)) this._hullCache.delete(id);
    return out;
  }

  _drawHulls(ctx) {
    if (!this.groups || !this.groups.length) return;
    const theme = this.theme;
    const a = theme.hullAlpha ?? 0.08;
    for (const h of this.hullShapes()) {
      const color = h.group.color ?? theme.hullColor ?? theme.accent ?? '#0d9488';
      ctx.save();
      ctx.beginPath();
      traceSmooth(ctx, h.poly);
      ctx.globalAlpha = a * h.alpha;
      ctx.fillStyle = color;
      ctx.fill();
      ctx.globalAlpha = Math.min(1, a * 3) * h.alpha;
      ctx.strokeStyle = color;
      ctx.lineWidth = 1;
      ctx.setLineDash([]);
      ctx.stroke();
      if (h.group.label && this._scale >= this.perf.labelMinScale) {
        ctx.globalAlpha = Math.min(1, 0.85 * h.alpha);
        ctx.fillStyle = color;
        ctx.font = `600 10px ${theme.font}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillText(String(h.group.label), h.top[0], h.top[1] - 3);
      }
      ctx.restore();
    }
  }

  _drawNodes(ctx, lod = false) {
    const lowZoom = this._scale < this.perf.labelMinScale;
    const batch = this.theme._noShadow ? [] : null;
    for (const node of this.nodes) {
      const s = this.springNodes.get(node.id);
      const o = this.nodeState.get(node.id);
      if (!s || !o || o.opacity < 0.01) continue;

      const isCenter = node.id === this.centerId;
      node._opacity = o.opacity;
      node._lp = this.labelPlacement.get(node.id) ?? null;
      node._noLabel = lowZoom && !isCenter;
      node._noSub = lod;

      if (batch && !isCenter && isBatchableDisc(node)) {
        batch.push({ node, x: s.x, y: s.y, r: o.visualRadius, opacity: o.opacity });
        continue;
      }
      if (batch && batch.length) { drawDiscBatch(ctx, batch, this.theme); batch.length = 0; }
      if (node.type === 'flag') {
        drawFlagNode(ctx, node, s.x, s.y, isCenter, this.theme);
      } else if (node.type === 'image') {
        drawImageNode(ctx, node, s.x, s.y, isCenter, this.theme);
      } else {
        drawNode(ctx, node, s.x, s.y, isCenter, this.theme);
      }
    }
    if (batch && batch.length) drawDiscBatch(ctx, batch, this.theme);
  }

  _drawChips(ctx) {
    if (this.chipBoxes.length) drawChipBatch(ctx, this.chipBoxes, this.theme);
  }

  _ring(ctx, id, extra, color, alpha, dash, width = 2) {
    const node = this.nodes.find(n => n.id === id);
    if (!node) return;
    const o = this.nodeState.get(id);
    if (!o || o.opacity < 0.01) return;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = color;
    ctx.lineWidth   = width;
    ctx.setLineDash(dash);
    ctx.beginPath();
    ctx.arc(o.x, o.y, o.visualRadius + extra, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();
  }

  _drawHighlights(ctx) {
    if (!this.highlightSet) return;
    for (const id of this.highlightSet) {
      if (this.nodeState.has(id)) this._ring(ctx, id, 4, this.theme.accent ?? this.theme.centerGlow, 0.9, [], 2.2);
    }
  }

  _drawHoverRing(ctx) {
    if (!this.hoveredId || this.hoveredId === this.centerId) return;
    this._ring(ctx, this.hoveredId, 6, this.theme.centerGlow, 0.45, []);
  }

  _drawFocusRing(ctx) {
    if (!this.focusedId) return;
    this._ring(ctx, this.focusedId, 9, this.theme.focusRing ?? '#fff', 0.85, [3, 3]);
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

  _drawResetBtn(ctx, W) {
    ctx.save();
    ctx.globalAlpha = 0.35;
    ctx.strokeStyle = this.theme.uiMuted ?? this.theme.ringStroke;
    ctx.fillStyle   = this.theme.uiMuted ?? this.theme.ringStroke;
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

  /**
   * Subtle resting motion: a calm deterministic float (smooth sine drift per
   * node). The legacy idle noise (theme.spring.idleNoise) now draws from a
   * seeded generator (no unseeded randomness). Disabled under reduced motion.
   * @returns {boolean} whether anything was nudged
   */
  _applyMotion() {
    if (this.reducedMotion) return false;
    const fl = this.theme.float;
    if (fl && fl.amp && this.nodes.length <= this.perf.floatMaxNodes) {
      this._t = (this._t ?? 0) + 1;
      let i = 0;
      for (const [id, s] of this.springNodes) {
        if (id === this.centerId || s.targetOpacity === 0) { i++; continue; }
        const phase = id.length * 1.7 + i * 0.9;
        s.vx += Math.cos(this._t * fl.speed + phase) * fl.amp;
        s.vy += Math.sin(this._t * fl.speed * 1.3 + phase) * fl.amp;
        i++;
      }
      return this.springNodes.size > 1;
    }
    const amp = this.theme.spring.idleNoise ?? 0;
    if (amp === 0 || this.nodes.length > this.perf.floatMaxNodes) return false;
    for (const [id, s] of this.springNodes) {
      if (id === this.centerId || s.targetOpacity === 0) continue;
      s.vx += (this._rand() - 0.5) * 2 * amp;
      s.vy += (this._rand() - 0.5) * 2 * amp;
    }
    return this.springNodes.size > 1;
  }

  /** Label placement inputs for the current scene at the given positions. */
  labelItems(positions) {
    const items = [];
    for (const n of this.nodes) {
      if (!hasDiscLabel(n)) continue;
      const p = positions.get(n.id);
      if (!p) continue;
      const isCenter = n.id === this.centerId;
      items.push({
        id: n.id, x: p.x, y: p.y, r: visualRadius(n, isCenter),
        text: String(n.label ?? ''), size: labelFontSize(n, isCenter),
        insideY: insideLabelOffset(n, isCenter), fixed: isCenter, fitW: 2 * visualRadius(n, isCenter) - 4,
        priority: (n.importance ?? n.popularity ?? 0.5),
      });
    }
    return items;
  }

  /** A resolved, renderer-independent description of the current frame (for SVG export). */
  snapshotScene({ fit = true, margin = 24 } = {}) {
    this._updateGeometry();
    const theme = this.theme;
    const styles = this._styleMap();
    const scene = { W: this.W, H: this.H, vx: 0, vy: 0, background: theme.background, font: theme.font,
      ink: theme.nodeLabel ?? '#22202b', hulls: [], edges: [], nodes: [], chips: [] };
    const ha = theme.hullAlpha ?? 0.08;
    for (const h of this.hullShapes()) {
      scene.hulls.push({ d: smoothPathD(h.poly), color: h.group.color ?? theme.hullColor ?? theme.accent,
        alpha: ha * h.alpha, label: h.group.label, lx: h.top[0], ly: h.top[1] });
    }
    const active = new Set([this.hoveredEdgeId, this.selectedEdgeId, this.focusedEdgeId].filter(Boolean));
    for (const e of this.edges) {
      const st = styles.get(e.id), g = this.edgeGeom.get(e.id);
      if (!st || st.hidden || !g) continue;
      const a = this.nodeState.get(e.from), b = this.nodeState.get(e.to);
      const alpha = Math.min(a.opacity, b.opacity) * st.alpha * (this.edgeAlpha ? this.edgeAlpha(e) : 1);
      if (alpha < 0.01) continue;
      scene.edges.push({ x1: g.x1, y1: g.y1, x2: g.x2, y2: g.y2, stroke: active.has(e.id) ? (theme.accent ?? st.stroke) : st.stroke,
        width: st.width, dash: st.dash, alpha, arrow: st.arrow, strike: st.strike, uncertain: st.uncertain,
        label: active.has(e.id) ? e.label : undefined });
    }
    for (const n of this.nodes) {
      const o = this.nodeState.get(n.id);
      if (!o || o.opacity < 0.01) continue;
      const isCenter = n.id === this.centerId;
      const lp = this.labelPlacement.get(n.id);
      let stroke = langColor(theme, n.lang);
      if (n.gender && theme.genderColors?.[n.gender]) stroke = theme.genderColors[n.gender];
      const size = labelFontSize(n, isCenter);
      const node = { id: n.id, x: o.x, y: o.y, r: o.visualRadius, fill: theme.nodeFill ?? '#ffffff', stroke,
        strokeWidth: isCenter ? 2.6 : 1.6, ink: theme.nodeLabel ?? '#22202b', subInk: theme.nodeSubLabel, alpha: o.opacity,
        labelSize: size };
      if (n.type === 'stub') {
        Object.assign(node, { shape: 'pill', w: 40, h: 22, stroke: theme.accent ?? theme.centerGlow, label: n.label, labelSize: 11 });
      } else if (lp && !lp.hidden) {
        node.label = lp.text;
        if (lp.size) node.labelSize = lp.size;
        node.labelX = o.x + lp.dx; node.labelY = o.y + lp.dy;
        if (lp.inside) { node.sub = n.lang ? String(n.lang).toUpperCase() : undefined; node.subY = o.y + lp.dy + (isCenter ? 14 : 11); }
      } else if (!lp) {
        node.label = n.label;
        node.labelY = o.y + (hasDiscLabel(n) ? insideLabelOffset(n, isCenter) : o.visualRadius + 9);
      }
      scene.nodes.push(node);
    }
    for (const b of this.chipBoxes) {
      scene.chips.push({ x: b.x, y: b.y, w: b.w, h: b.h, label: b.chip.label,
        fill: theme.chipFill ?? '#fff', stroke: theme.chipStroke ?? 'rgba(20,20,30,0.2)', ink: theme.chipInk ?? '#22202b' });
    }
    if (fit && scene.nodes.length) {
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (const n of scene.nodes) {
        x0 = Math.min(x0, n.x - n.r - 40); x1 = Math.max(x1, n.x + n.r + 40);
        y0 = Math.min(y0, n.y - n.r - 20); y1 = Math.max(y1, n.y + n.r + 30);
      }
      for (const c of scene.chips) { y1 = Math.max(y1, c.y + c.h); x0 = Math.min(x0, c.x); x1 = Math.max(x1, c.x + c.w); }
      scene.vx = x0 - margin; scene.vy = y0 - margin;
      scene.W = x1 - x0 + 2 * margin; scene.H = y1 - y0 + 2 * margin;
    }
    return scene;
  }

  /** Render the current view into a new canvas at `scale` × logical size. */
  renderToCanvas(scale = 2) {
    const c = document.createElement('canvas');
    c.width = Math.round(this.W * scale);
    c.height = Math.round(this.H * scale);
    const ctx = c.getContext('2d');
    ctx.setTransform(scale, 0, 0, scale, 0, 0);
    this._draw(ctx, this.W, this.H, { overlays: false });
    this._dirty = true;
    return c;
  }

  destroy() {
    this.stop();
    this._ro.disconnect();
    this.canvas.remove();
  }
}
