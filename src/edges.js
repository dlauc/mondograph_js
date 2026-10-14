// Edge geometry, styling, drawing and hit-testing.
//
// Edge schema (all optional except from/to):
//   { id, from, to, type, family, provenance, status, certainty, directed,
//     label, weight, assertionId }
// Style is keyed by family (colour) × provenance (stroke pattern) × status
// (struck / hidden) × certainty ("?" glyph); `directed` draws an arrow.

/**
 * Shorten a line so its endpoint sits on the boundary of a circle.
 * Returns the original (x2,y2) if the distance is less than r + 1 (one-pixel tolerance).
 */
export function clipToRadius(x1, y1, x2, y2, r) {
  const dx = x2 - x1, dy = y2 - y1;
  const len = Math.hypot(dx, dy);
  if (len < r + 1) return { x: x2, y: y2 };
  return { x: x2 - (dx / len) * r, y: y2 - (dy / len) * r };
}

/** Euclidean distance from point (px,py) to segment (x1,y1)-(x2,y2). */
export function pointSegmentDistance(px, py, x1, y1, x2, y2) {
  const dx = x2 - x1, dy = y2 - y1;
  const len2 = dx * dx + dy * dy;
  let t = len2 > 0 ? ((px - x1) * dx + (py - y1) * dy) / len2 : 0;
  t = Math.max(0, Math.min(1, t));
  return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
}

const PROVENANCE_DASH = {
  recorded:  [],
  modelled:  [6, 4],
  modeled:   [6, 4],
  community: [],
  unknown:   [1.5, 3.5],
};

/**
 * Resolve the drawing style of an edge.
 * @param {object} edge
 * @param {object} theme  resolveTheme() output (edgeFamilies, edgeTypes)
 * @param {{showSuppressed?:boolean, backEdges?:Set<string>}} [state]
 */
export function resolveEdgeStyle(edge, theme, state = {}) {
  const fam = edge.family != null ? theme.edgeFamilies?.[edge.family] : null;
  const typ = theme.edgeTypes?.[edge.type];
  const base = fam ?? typ ?? theme.edgeFamilies?._default ?? theme.edgeTypes?._fallback
    ?? { stroke: '#64748b', dash: [3, 3], width: 1, arrow: false };
  const status = edge.status ?? 'open';
  const suppressed = status === 'suppressed' || status === 'excluded';
  let dash = base.dash ?? [];
  if (edge.provenance != null) dash = PROVENANCE_DASH[edge.provenance] ?? PROVENANCE_DASH.unknown;
  const back = state.backEdges?.has(edge.id);
  return {
    stroke:    base.stroke,
    width:     base.width ?? 1,
    dash,
    arrow:     !back && (edge.directed === true || (edge.directed == null && !!base.arrow)),
    animate:   !!base.animate,
    mark:      edge.provenance === 'community' ? 'community' : null,
    strike:    status === 'disputed',
    uncertain: edge.certainty === 'uncertain',
    hidden:    suppressed && !state.showSuppressed,
    alpha:     suppressed ? 0.4 : 1,
  };
}

const PARALLEL_SPACING = 6;
const ARROW_SIZE = 7;

/**
 * Screen geometry for every drawable edge: both ends clipped to the node
 * radii, parallel edges between the same pair offset sideways.
 * @param {object[]} edges
 * @param {Map<string,{x,y,visualRadius}>} nodeState
 * @param {(edge)=>boolean} [hasArrow]
 * @returns {Map<string,{x1,y1,x2,y2,mx,my,edge}>}
 */
export function computeEdgeGeometry(edges, nodeState, hasArrow) {
  const pairs = new Map();
  for (const e of edges) {
    if (!nodeState.has(e.from) || !nodeState.has(e.to)) continue;
    const k = e.from < e.to ? e.from + '\u0000' + e.to : e.to + '\u0000' + e.from;
    let arr = pairs.get(k);
    if (!arr) pairs.set(k, arr = []);
    arr.push(e);
  }
  const out = new Map();
  for (const arr of pairs.values()) {
    const n = arr.length;
    arr.forEach((e, i) => {
      const a = nodeState.get(e.from), b = nodeState.get(e.to);
      let dx = b.x - a.x, dy = b.y - a.y;
      const len = Math.hypot(dx, dy);
      if (len < 1) return;
      const ux = dx / len, uy = dy / len;
      // perpendicular offset relative to a canonical direction so A→B and B→A separate
      const sgn = e.from < e.to ? 1 : -1;
      const off = n > 1 ? (i - (n - 1) / 2) * PARALLEL_SPACING * sgn : 0;
      const ox = -uy * off, oy = ux * off;
      const ra = a.visualRadius ?? 0;
      const rb = (b.visualRadius ?? 0) + (hasArrow && hasArrow(e) ? ARROW_SIZE : 0);
      if (len < ra + rb + 2) return;
      const x1 = a.x + ux * ra + ox, y1 = a.y + uy * ra + oy;
      const x2 = b.x - ux * rb + ox, y2 = b.y - uy * rb + oy;
      out.set(e.id, { x1, y1, x2, y2, mx: (x1 + x2) / 2, my: (y1 + y2) / 2, ux, uy, edge: e });
    });
  }
  return out;
}

/**
 * Nearest edge within `tolerance` of (px,py), or null.
 * @param {number} px @param {number} py
 * @param {Map<string,{x1,y1,x2,y2}>|Array<{id,x1,y1,x2,y2}>} geometry
 * @param {number} tolerance
 * @param {(id:string)=>boolean} [accept]  filter (e.g. skip faded edges)
 * @returns {string|null}
 */
export function hitTestEdges(px, py, geometry, tolerance = 6, accept) {
  let best = null, bestD = tolerance;
  const entries = geometry instanceof Map ? geometry.entries() : geometry.map(g => [g.id, g]);
  for (const [id, g] of entries) {
    if (accept && !accept(id)) continue;
    // cheap bbox reject
    if (px < Math.min(g.x1, g.x2) - bestD || px > Math.max(g.x1, g.x2) + bestD ||
        py < Math.min(g.y1, g.y2) - bestD || py > Math.max(g.y1, g.y2) + bestD) continue;
    const d = pointSegmentDistance(px, py, g.x1, g.y1, g.x2, g.y2);
    if (d <= bestD) { bestD = d; best = id; }
  }
  return best;
}

function drawArrowhead(ctx, x1, y1, x2, y2, color) {
  const angle = Math.atan2(y2 - y1, x2 - x1);
  const size  = ARROW_SIZE;
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

// Deterministic phase offset for the legacy crawling-particle animation.
function getEdgeHash(s1, s2) {
  let hash = 0;
  const str = s1 + s2;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) / 1000;
}

function drawStrike(ctx, g, color) {
  // two short slashes across the midpoint: "disputed"
  ctx.save();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.6;
  ctx.setLineDash([]);
  ctx.beginPath();
  strikePath(ctx, g);
  ctx.stroke();
  ctx.restore();
}

function drawCommunityMark(ctx, g, color, bg) {
  const t = 0.3;
  const x = g.x1 + (g.x2 - g.x1) * t, y = g.y1 + (g.y2 - g.y1) * t;
  ctx.save();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.arc(x, y, 3.2, 0, Math.PI * 2);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.lineWidth = 1.4;
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.restore();
}

function drawQuestion(ctx, x, y, color, bg, font) {
  ctx.save();
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.arc(x, y, 6.5, 0, Math.PI * 2);
  ctx.fillStyle = bg;
  ctx.fill();
  ctx.lineWidth = 1.2;
  ctx.strokeStyle = color;
  ctx.stroke();
  ctx.fillStyle = color;
  ctx.font = `700 9px ${font}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('?', x, y + 0.5);
  ctx.restore();
}

/** Draw an edge label in a small pill at the midpoint. */
export function drawEdgeLabel(ctx, g, text, theme) {
  if (!text) return;
  ctx.save();
  ctx.setLineDash([]);
  ctx.font = `600 10px ${theme.font}`;
  const w = ctx.measureText(text).width + 10, h = 16;
  const x = g.mx - w / 2, y = g.my - h - 6;
  ctx.globalAlpha = 1;
  ctx.fillStyle = theme.labelBackground ?? theme.background;
  ctx.strokeStyle = theme.accent ?? theme.centerGlow;
  ctx.lineWidth = 1;
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, 8); else ctx.rect(x, y, w, h);
  ctx.fill();
  ctx.stroke();
  ctx.fillStyle = theme.nodeLabel ?? '#22202b';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(text, g.mx, y + h / 2 + 0.5);
  ctx.restore();
}

/**
 * Draw all edges for the current frame.
 * Plain strokes are batched by style (one path per stroke/width/dash/alpha),
 * marks, arrows and the active edge are drawn on top.
 *
 * @param {CanvasRenderingContext2D} ctx
 * @param {object[]} edges
 * @param {Map<string,{x,y,opacity,visualRadius}>} nodeState
 * @param {object} theme
 * @param {{geometry?:Map, hoveredEdgeId?:string, selectedEdgeId?:string, focusedEdgeId?:string,
 *   showSuppressed?:boolean, backEdges?:Set, edgeAlpha?:(edge)=>number, styles?:Map}} [state]
 */
export function drawEdges(ctx, edges, nodeState, theme, state = {}) {
  const now = Date.now();
  const styles = state.styles ?? new Map();
  if (!state.styles) for (const e of edges) styles.set(e.id ?? e, resolveEdgeStyle(e, theme, state));
  const styleOf = (e) => styles.get(e.id ?? e);
  const geometry = state.geometry ?? computeEdgeGeometry(
    edges.map((e, i) => (e.id != null ? e : { ...e, id: `__e${i}` })), nodeState, (e) => styleOf(e)?.arrow ?? false);
  // legacy callers pass edges without ids: map back through a temp id
  const geoOf = (e, i) => geometry.get(e.id ?? `__e${i}`);

  const active = new Set([state.hoveredEdgeId, state.selectedEdgeId, state.focusedEdgeId].filter(Boolean));
  const batches = new Map();
  const extras = [];
  edges.forEach((edge, i) => {
    const st = styleOf(edge);
    if (!st || st.hidden) return;
    const g = geoOf(edge, i);
    if (!g) return;
    const from = nodeState.get(edge.from), to = nodeState.get(edge.to);
    const weight = edge.weight ?? 1.0;
    let alpha = Math.min(from.opacity, to.opacity) * Math.min(1, weight) * st.alpha;
    if (state.edgeAlpha) alpha *= state.edgeAlpha(edge);
    if (alpha < 0.01) return;
    if (active.has(edge.id)) { extras.push({ edge, g, st, alpha, active: true }); return; }
    const width = st.width * (edge.weight != null ? Math.max(0.5, weight) : 1);
    // level of detail while a large scene animates: dashes solid, marks skipped (arrows kept)
    const dash = state.lod ? [] : st.dash;
    const key = `${st.stroke}|${width}|${dash.join(',')}|${Math.round(alpha * 20)}`;
    let b = batches.get(key);
    if (!b) batches.set(key, b = { stroke: st.stroke, width, dash, alpha: Math.round(alpha * 20) / 20, segs: [] });
    b.segs.push(g);
    if (state.lod) { if (st.arrow) extras.push({ edge, g, st: { ...st, mark: null, strike: false, uncertain: false, animate: false }, alpha, active: false }); }
    else if (st.arrow || st.mark || st.strike || st.uncertain || st.animate) extras.push({ edge, g, st, alpha, active: false });
  });

  for (const b of batches.values()) {
    ctx.save();
    ctx.globalAlpha = b.alpha;
    ctx.strokeStyle = b.stroke;
    ctx.lineWidth   = b.width;
    ctx.setLineDash(b.dash);
    if (b.dash.length && b.dash[0] < 2) ctx.lineCap = 'round';
    ctx.beginPath();
    for (const g of b.segs) { ctx.moveTo(g.x1, g.y1); ctx.lineTo(g.x2, g.y2); }
    ctx.stroke();
    ctx.restore();
  }

  const bg = theme.background;
  const accent = theme.accent ?? theme.centerGlow ?? '#0d9488';
  const font = theme.font ?? 'sans-serif';

  // Inactive decorations, batched per colour × alpha.
  const marks = new Map();
  const bucket = (color, alpha) => {
    const k = color + '|' + Math.round(alpha * 20);
    let m = marks.get(k);
    if (!m) marks.set(k, m = { color, alpha: Math.round(alpha * 20) / 20, arrows: [], community: [], strikes: [], uncertain: [] });
    return m;
  };
  const activeList = [];
  for (const x of extras) {
    if (x.active) { activeList.push(x); continue; }
    const { g, st, alpha, edge } = x;
    const m = bucket(st.stroke, alpha);
    if (st.arrow) m.arrows.push(g);
    if (st.mark === 'community') m.community.push(g);
    if (st.strike) m.strikes.push(g);
    if (st.uncertain) m.uncertain.push(g);
    if (st.animate && alpha > 0.05) drawParticle(ctx, edge, g, st, alpha, theme, now);
  }
  for (const m of marks.values()) {
    ctx.save();
    ctx.globalAlpha = m.alpha;
    ctx.setLineDash([]);
    if (m.arrows.length) {
      ctx.beginPath();
      for (const g of m.arrows) arrowPath(ctx, g);
      ctx.fillStyle = m.color;
      ctx.fill();
    }
    if (m.community.length) {
      ctx.beginPath();
      for (const g of m.community) { const p = communityPoint(g); ctx.moveTo(p.x + 3.2, p.y); ctx.arc(p.x, p.y, 3.2, 0, Math.PI * 2); }
      ctx.fillStyle = bg; ctx.fill();
      ctx.lineWidth = 1.4; ctx.strokeStyle = m.color; ctx.stroke();
    }
    if (m.strikes.length) {
      ctx.beginPath();
      for (const g of m.strikes) strikePath(ctx, g);
      ctx.lineWidth = 1.6; ctx.strokeStyle = m.color; ctx.stroke();
    }
    if (m.uncertain.length) {
      ctx.beginPath();
      for (const g of m.uncertain) { ctx.moveTo(g.mx + 6.5, g.my); ctx.arc(g.mx, g.my, 6.5, 0, Math.PI * 2); }
      ctx.fillStyle = bg; ctx.fill();
      ctx.lineWidth = 1.2; ctx.strokeStyle = m.color; ctx.stroke();
      ctx.fillStyle = m.color;
      ctx.font = `700 9px ${font}`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      for (const g of m.uncertain) ctx.fillText('?', g.mx, g.my + 0.5);
    }
    ctx.restore();
  }

  // Active (hovered / selected / focused) edges: emphasised, labelled, on top.
  for (const { edge, g, st, alpha } of activeList) {
    ctx.save();
    ctx.globalAlpha = Math.max(alpha, 0.95);
    ctx.strokeStyle = accent;
    ctx.lineWidth = st.width + 1.6;
    ctx.setLineDash(st.dash);
    ctx.beginPath();
    ctx.moveTo(g.x1, g.y1);
    ctx.lineTo(g.x2, g.y2);
    ctx.stroke();
    ctx.setLineDash([]);
    if (st.arrow) drawArrowhead(ctx, g.x1, g.y1, g.x2, g.y2, accent);
    if (st.mark === 'community') drawCommunityMark(ctx, g, accent, bg);
    if (st.strike) drawStrike(ctx, g, accent);
    if (st.uncertain) drawQuestion(ctx, g.mx, g.my, accent, bg, font);
    ctx.restore();
    if (edge.label) drawEdgeLabel(ctx, g, edge.label, theme);
  }
}

function arrowPath(ctx, g) {
  const s = ARROW_SIZE, ux = g.ux, uy = g.uy;
  const bx = g.x2 - ux * s, by = g.y2 - uy * s;
  ctx.moveTo(g.x2, g.y2);
  ctx.lineTo(bx - uy * s / 2, by + ux * s / 2);
  ctx.lineTo(bx + uy * s / 2, by - ux * s / 2);
  ctx.closePath();
}

function communityPoint(g) {
  return { x: g.x1 + (g.x2 - g.x1) * 0.3, y: g.y1 + (g.y2 - g.y1) * 0.3 };
}

function strikePath(ctx, g) {
  const px = -g.uy, py = g.ux;
  for (const s of [-3, 3]) {
    const cx = g.mx + g.ux * s, cy = g.my + g.uy * s;
    ctx.moveTo(cx + (px - g.ux * 0.6) * 6, cy + (py - g.uy * 0.6) * 6);
    ctx.lineTo(cx - (px - g.ux * 0.6) * 6, cy - (py - g.uy * 0.6) * 6);
  }
}

function drawParticle(ctx, edge, g, st, alpha, theme, now) {
  const t = ((now / 2800) + getEdgeHash(edge.from, edge.to)) % 1.0;
  const px = g.x1 + t * (g.x2 - g.x1), py = g.y1 + t * (g.y2 - g.y1);
  ctx.save();
  ctx.globalAlpha = alpha;
  ctx.beginPath();
  ctx.arc(px, py, st.width * 1.2 + 1.0, 0, Math.PI * 2);
  ctx.fillStyle = theme.edgeParticle ?? st.stroke;
  ctx.fill();
  ctx.restore();
}
