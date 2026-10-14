// Group hulls: the convex hull of padded member circles, drawn as a smooth
// rounded outline beneath the edges.
//
// Group schema: { id, members: string[], label?, color? }

/** Andrew's monotone chain convex hull of [x,y] points (counter-clockwise). */
export function convexHull(points) {
  const pts = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
  if (pts.length <= 2) return pts;
  const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
  const lower = [];
  for (const p of pts) {
    while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
    lower.push(p);
  }
  const upper = [];
  for (let i = pts.length - 1; i >= 0; i--) {
    const p = pts[i];
    while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
    upper.push(p);
  }
  upper.pop(); lower.pop();
  return lower.concat(upper);
}

/**
 * Hull polygon around padded circles.
 * @param {Array<{x:number,y:number,r:number}>} circles
 * @param {number} [pad=12] @param {number} [samples=12] points per circle
 * @returns {Array<[number,number]>}
 */
export function hullPolygon(circles, pad = 12, samples = 12) {
  const pts = [];
  for (const c of circles) {
    const R = c.r + pad;
    for (let i = 0; i < samples; i++) {
      const a = (i / samples) * Math.PI * 2;
      pts.push([c.x + R * Math.cos(a), c.y + R * Math.sin(a)]);
    }
  }
  return convexHull(pts);
}

/** Trace a closed, smoothed path through the polygon (quadratics via midpoints). */
export function traceSmooth(ctx, poly) {
  const n = poly.length;
  if (n < 3) return;
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const m0 = mid(poly[n - 1], poly[0]);
  ctx.moveTo(m0[0], m0[1]);
  for (let i = 0; i < n; i++) {
    const p = poly[i], m = mid(p, poly[(i + 1) % n]);
    ctx.quadraticCurveTo(p[0], p[1], m[0], m[1]);
  }
  ctx.closePath();
}

/** SVG path data for the same smoothed outline. */
export function smoothPathD(poly) {
  const n = poly.length;
  if (n < 3) return '';
  const f = (v) => Math.round(v * 10) / 10;
  const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
  const m0 = mid(poly[n - 1], poly[0]);
  let d = `M${f(m0[0])} ${f(m0[1])}`;
  for (let i = 0; i < n; i++) {
    const p = poly[i], m = mid(p, poly[(i + 1) % n]);
    d += `Q${f(p[0])} ${f(p[1])} ${f(m[0])} ${f(m[1])}`;
  }
  return d + 'Z';
}

/** Top-most point of a polygon (where the hull label sits). */
export function hullTop(poly) {
  let best = poly[0];
  for (const p of poly) if (p[1] < best[1]) best = p;
  return best;
}
