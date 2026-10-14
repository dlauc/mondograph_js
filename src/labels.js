// Greedy label placement with collision avoidance.
//
// Each label tries, in order: inside the node, below, above, right, left.
// The first box that hits neither an already placed label nor another node's
// disc (nor an obstacle such as a chip row) wins. Failing that the label is
// truncated with an ellipsis to fit inside its own disc; failing that it is
// hidden. The full label stays available in the tooltip and the DOM mirror.
//
// `insideOnly` keeps every label inside its own disc, as a name card does:
// the font shrinks (to 70%, never under 7 px) until the label fits, and past
// that it is truncated with an ellipsis. A label is never moved away from its
// disc, and never hidden while it has a character to show.

const CELL = 64;

class Grid {
  constructor() { this.cells = new Map(); }
  _keys(b) {
    const out = [];
    const x0 = Math.floor(b.x0 / CELL), x1 = Math.floor(b.x1 / CELL);
    const y0 = Math.floor(b.y0 / CELL), y1 = Math.floor(b.y1 / CELL);
    for (let i = x0; i <= x1; i++) for (let j = y0; j <= y1; j++) out.push(i + ',' + j);
    return out;
  }
  add(b) {
    for (const k of this._keys(b)) {
      let c = this.cells.get(k);
      if (!c) this.cells.set(k, c = []);
      c.push(b);
    }
  }
  hits(b, ignoreOwner) {
    for (const k of this._keys(b)) {
      const c = this.cells.get(k);
      if (!c) continue;
      for (const o of c) {
        if (ignoreOwner != null && o.owner === ignoreOwner) continue;
        if (b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0) return true;
      }
    }
    return false;
  }
}

/** Truncate `text` with "…" so measure(text) ≤ maxW (at least one char). */
export function truncateToWidth(text, maxW, measure) {
  if (measure(text) <= maxW) return text;
  let lo = 0, hi = text.length;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (measure(text.slice(0, mid) + '…') <= maxW) lo = mid; else hi = mid - 1;
  }
  return lo === 0 ? '' : text.slice(0, lo) + '…';
}

/**
 * @param {Array<{id:string, x:number, y:number, r:number, text:string, size:number,
 *   priority?:number, fixed?:boolean, insideY?:number, fitW?:number}>} items
 *   (x,y) node centre, r disc radius, size font px. `fixed` labels (the centre)
 *   are always placed inside, full length. `insideY` is the inside label's
 *   vertical offset (default 0). A label wider than `fitW` is not placed
 *   inside at full length (it moves out, or is truncated to fit).
 * @param {{measure:(text:string, size:number)=>number,
 *   obstacles?:Array<{x0,y0,x1,y1,owner?:string}>, pad?:number, insideOnly?:boolean, minScale?:number}} opts
 * @returns {Map<string,{text:string, dx:number, dy:number, inside:boolean,
 *   truncated:boolean, hidden:boolean, box:{x0,y0,x1,y1}|null, size?:number}>}
 *   `size` is the font size used, when `insideOnly` shrank it.
 */
export function placeLabels(items, opts) {
  const measure = opts.measure;
  const pad = opts.pad ?? 2;
  const out = new Map();
  const placed = new Grid();
  const discs = new Grid();
  for (const it of items) discs.add({ x0: it.x - it.r, y0: it.y - it.r, x1: it.x + it.r, y1: it.y + it.r, owner: it.id });
  for (const o of opts.obstacles ?? []) discs.add(o);

  const order = items.map((it, i) => ({ it, i }))
    .sort((a, b) => (b.it.fixed ? 1 : 0) - (a.it.fixed ? 1 : 0)
      || (b.it.priority ?? 0) - (a.it.priority ?? 0) || a.i - b.i);

  const minScale = opts.minScale ?? 0.7;
  for (const { it } of order) {
    if (opts.insideOnly) {
      const fitW = it.fitW ?? Math.max(0, 2 * it.r - 6);
      let size = it.size;
      const floor = Math.max(7, Math.round(it.size * minScale * 2) / 2);
      while (size > floor && measure(it.text, size) > fitW) size = Math.max(floor, size - 0.5);
      const t = it.fixed ? it.text : truncateToWidth(it.text, fitW, (s) => measure(s, size));
      const w = measure(t, size), h = size * 1.15, iy = it.insideY ?? 0;
      const b = t ? { x0: it.x - w / 2 - pad, x1: it.x + w / 2 + pad, y0: it.y + iy - h / 2 - pad, y1: it.y + iy + h / 2 + pad, owner: it.id } : null;
      if (b) placed.add(b);
      out.set(it.id, { text: t, dx: 0, dy: iy, inside: true, truncated: t !== it.text, hidden: !t, box: b, size });
      continue;
    }
    const h = it.size * 1.15;
    const w = measure(it.text, it.size);
    const iy = it.insideY ?? 0;
    const box = (dx, dy, ww) => ({
      x0: it.x + dx - ww / 2 - pad, x1: it.x + dx + ww / 2 + pad,
      y0: it.y + dy - h / 2 - pad,  y1: it.y + dy + h / 2 + pad, owner: it.id,
    });
    if (it.fixed) {
      const b = box(0, iy, w);
      placed.add(b);
      out.set(it.id, { text: it.text, dx: 0, dy: iy, inside: true, truncated: false, hidden: false, box: b });
      continue;
    }
    const gap = 3;
    const cands = [
      [0, iy, true],
      [0, it.r + h / 2 + gap, false],
      [0, -(it.r + h / 2 + gap), false],
      [it.r + w / 2 + gap + 1, 0, false],
      [-(it.r + w / 2 + gap + 1), 0, false],
    ];
    let done = false;
    for (const [dx, dy, inside] of cands) {
      if (inside && it.fitW != null && w > it.fitW) continue;   // too wide for its own disc
      const b = box(dx, dy, w);
      if (placed.hits(b) || discs.hits(b, it.id)) continue;
      placed.add(b);
      out.set(it.id, { text: it.text, dx, dy, inside, truncated: false, hidden: false, box: b });
      done = true;
      break;
    }
    if (done) continue;
    const maxW = Math.max(0, 2 * it.r - 6);
    const t = truncateToWidth(it.text, maxW, (s) => measure(s, it.size));
    const b = box(0, iy, measure(t, it.size));
    if (t && !placed.hits(b)) {
      placed.add(b);
      out.set(it.id, { text: t, dx: 0, dy: iy, inside: true, truncated: t !== it.text, hidden: false, box: b });
    } else {
      out.set(it.id, { text: '', dx: 0, dy: iy, inside: true, truncated: true, hidden: true, box: null });
    }
  }
  return out;
}
