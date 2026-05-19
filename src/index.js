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

    this._nodes      = [];
    this._edges      = [];
    this._centerId   = null;
    this._isTouch    = false;
    this._setCenterSeq = 0;

    this._bindEvents();
    this._renderer.start();
  }

  /** Load the neighbourhood of `id` and animate to it. */
  async setCenter(id) {
    const seq = ++this._setCenterSeq;
    this._centerId          = id;
    this._renderer.centerId = id;
    this._renderer.loading  = true;

    const { nodes, edges } = await this._opts.getNeighbors(id);

    if (seq !== this._setCenterSeq) return;

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
    this._theme          = resolveTheme(typeof t === 'object' && t ? { ...this._theme, ...t } : t);
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

    // Keyboard navigation
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
    canvas.addEventListener('pointermove',  this._onMove);
    canvas.addEventListener('click',        this._onClick);
    canvas.addEventListener('pointerdown',  this._onDown);
    canvas.addEventListener('pointerup',    this._onUp);
    canvas.addEventListener('pointermove',  this._onDrag);
    canvas.addEventListener('wheel',        this._onWheel, { passive: false });
    canvas.addEventListener('touchstart',   this._onTouchStart, { passive: true });
    this._container.addEventListener('keydown', this._onKeyDown);
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
    this._container.removeEventListener('keydown', this._onKeyDown);
  }
}
