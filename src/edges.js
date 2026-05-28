/**
 * Shorten a line so its endpoint sits on the boundary of a circle.
 * Returns the original (x2,y2) if the distance is less than r + 1 (one-pixel tolerance).
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

// Generate a deterministic visual offset for edge animations based on node names
function getEdgeHash(s1, s2) {
  let hash = 0;
  const str = s1 + s2;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash) / 1000;
}

/**
 * Draw all edges for the current frame, including custom relationships and crawling particles.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array<{from:string,to:string,type:string,weight?:number}>} edges
 * @param {Map<string,{x:number,y:number,opacity:number,visualRadius:number}>} nodeState
 * @param {object} theme  resolveTheme() output
 */
export function drawEdges(ctx, edges, nodeState, theme) {
  const now = Date.now();

  for (const edge of edges) {
    const from = nodeState.get(edge.from);
    const to   = nodeState.get(edge.to);
    if (!from || !to) continue;

    // Skip zero-length edges (from and to at same position)
    const dx0 = to.x - from.x, dy0 = to.y - from.y;
    if (dx0 * dx0 + dy0 * dy0 < 1) continue;

    const cfg    = theme.edgeTypes[edge.type] ?? theme.edgeTypes._fallback;
    const weight = edge.weight ?? 1.0;
    const alpha  = Math.min(from.opacity, to.opacity) * weight;

    const extraR = cfg.arrow ? 7 : 0;
    const ep     = clipToRadius(from.x, from.y, to.x, to.y, to.visualRadius + extraR);

    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.strokeStyle = cfg.stroke;
    ctx.lineWidth   = cfg.width * weight;
    ctx.setLineDash(cfg.dash ?? []);
    ctx.beginPath();
    ctx.moveTo(from.x, from.y);
    ctx.lineTo(ep.x, ep.y);
    ctx.stroke();

    if (cfg.arrow) drawArrowhead(ctx, from.x, from.y, ep.x, ep.y, cfg.stroke);
    ctx.restore();

    // crawling light particle flow animation
    if (cfg.animate && alpha > 0.05) {
      const hashOffset = getEdgeHash(edge.from, edge.to);
      const cycleMs = 2800; // time in ms for a full crawl across the line
      const t = ((now / cycleMs) + hashOffset) % 1.0;

      // coordinates of particle crawling from 'from' to 'to'
      const px = from.x + t * (ep.x - from.x);
      const py = from.y + t * (ep.y - from.y);

      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      const pRadius = (cfg.width * weight * 1.2) + 1.0;
      ctx.arc(px, py, pRadius, 0, Math.PI * 2);
      ctx.fillStyle = theme.edgeParticle ?? cfg.stroke;
      ctx.shadowColor = cfg.stroke;
      ctx.shadowBlur = 6;
      ctx.fill();
      ctx.restore();
    }
  }
}
