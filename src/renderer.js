import { tickSprings } from './spring.js';
import { drawEdges }   from './edges.js';
import { drawNode  }   from './renderers/text.js';
import { drawFlagNode }  from './renderers/flag.js';
import { drawImageNode } from './renderers/image.js';

/** Visual radius used for edge clipping (not hit-testing). */
function visualRadius(type, isCenter) {
  if (isCenter)               return 38;
  if (type === 'attestation') return 8;
  if (type === 'concept')     return 18;
  if (type === 'referent')    return 20;
  if (type === 'element')     return 12;
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
    this.focusedId   = null;

    this.W = 0; this.H = 0;
    this.onResize = null;
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
    if (this.onResize) this.onResize(this.W, this.H);
  }

  get containerSize() { return { W: this.W, H: this.H }; }

  start() {
    if (this._rafId != null) return;
    const loop = () => {
      tickSprings(this.springNodes, this.theme.spring, this.theme.opacitySpring);
      // Prune fully-faded departed nodes to prevent unbounded Map growth
      for (const [id, s] of this.springNodes) {
        if (s.opacity < 0.01 && s.targetOpacity === 0) this.springNodes.delete(id);
      }
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
    this._drawHoverRing(ctx);
    this._drawFocusRing(ctx);

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
    // Soft aura at centre node position
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
    }
  }

  _drawHoverRing(ctx) {
    if (!this.hoveredId) return;
    const node = this.nodes.find(n => n.id === this.hoveredId);
    if (!node || node.id === this.centerId) return;
    const s = this.springNodes.get(node.id);
    if (!s || s.opacity < 0.01) return;
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

  _drawFocusRing(ctx) {
    if (!this.focusedId) return;
    const node = this.nodes.find(n => n.id === this.focusedId);
    if (!node || node.id === this.centerId) return;
    const s = this.springNodes.get(node.id);
    if (!s || s.opacity < 0.01) return;
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
