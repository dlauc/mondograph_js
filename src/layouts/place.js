/**
 * Positions for nodes added next to an anchor (addNeighbors): a fan of arcs
 * on the side of the anchor facing away from the centre, so the existing
 * picture does not move. Pure and deterministic.
 *
 * @param {{x:number,y:number}} anchor
 * @param {{x:number,y:number}} center
 * @param {string[]} ids
 * @param {{radius?:number, spacing?:number, spread?:number}} [opts]
 * @returns {Map<string,{x:number,y:number}>}
 */
export function placeAround(anchor, center, ids, opts = {}) {
  const radius  = opts.radius ?? 90;
  const spacing = opts.spacing ?? 48;
  const spread  = opts.spread ?? Math.PI * 0.9;
  const dx = anchor.x - center.x, dy = anchor.y - center.y;
  const base = Math.hypot(dx, dy) < 1 ? -Math.PI / 2 : Math.atan2(dy, dx);
  const out = new Map();
  let i = 0, ring = 0;
  while (i < ids.length) {
    const r = radius + ring * spacing;
    const cap = Math.max(1, Math.floor((spread * r) / spacing) + 1);
    const n = Math.min(cap, ids.length - i);
    for (let k = 0; k < n; k++, i++) {
      const t = n === 1 ? 0 : (k / (n - 1) - 0.5);
      const a = base + t * spread * Math.min(1, n / cap);
      out.set(ids[i], { x: anchor.x + r * Math.cos(a), y: anchor.y + r * Math.sin(a) });
    }
    ring++;
  }
  return out;
}
