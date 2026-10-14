import { bfs } from '../graphutil.js';

const TAU = Math.PI * 2;

function priorityOf(n) {
  return n.importance ?? n.popularity ?? 0;
}

/**
 * Sectored radial layout: angle = family, ring = closeness.
 *
 * - A node's family is `node.family`, else the family (`edge.family ?? edge.type`)
 *   of its edge to the centre (when several, the one earliest in `sectorOrder`),
 *   else its BFS parent's family; unreachable nodes go to `'_other'`.
 * - Its ring is `node.ring`, else the hop distance from the centre (capped at `maxRing`).
 * - Sector width is proportional to the number of nodes drawn in it, never
 *   narrower than `minSectorAngle`.
 * - Within a ring, neighbours closer than `minLabelGap` px of arc are staggered
 *   radially (up to `maxRows` rows) so labels do not collide.
 * - Past `maxPerSector` (+ `sectorExtra[family]`), the lowest-priority nodes
 *   (outer ring first, then low `importance ?? popularity`) collapse into a stub
 *   `{id:'more:<family>', type:'stub', family, count, members, label:'+N'}`.
 *
 * Pure and deterministic. The returned Map carries extra fields:
 * `stubs` (stub nodes, positioned in the Map), `collapsed` (Map id → stub id),
 * `family` (Map id → family), `sectors` ([{family,start,end,count,collapsed}]).
 *
 * @param {{nodes:object[], edges:object[]}} graph
 * @param {{W:number,H:number,centerId:string, sectorOrder?:string[], maxPerSector?:number,
 *   sectorExtra?:Object<string,number>, minLabelGap?:number, sectorGap?:number,
 *   minSectorAngle?:number, startAngle?:number, maxRing?:number, maxRows?:number,
 *   rowStep?:number, margin?:number, familyOf?:Function}} opts
 */
export function sectors(graph, opts) {
  const { W, H, centerId } = opts;
  const nodes = graph.nodes, edges = graph.edges;
  const maxPerSector = Math.max(1, opts.maxPerSector ?? Infinity);
  const extra       = opts.sectorExtra ?? {};
  const minGap      = opts.minLabelGap ?? 64;
  const gap         = opts.sectorGap ?? 0.08;
  const minAngle    = opts.minSectorAngle ?? Math.PI / 18;
  const startAngle  = opts.startAngle ?? -Math.PI / 2;
  const maxRing     = opts.maxRing ?? 3;
  const maxRows     = opts.maxRows ?? 3;
  const rowStep     = opts.rowStep ?? 30;
  const margin      = opts.margin ?? 40;
  const order       = opts.sectorOrder ?? [];
  const cx = W / 2, cy = H / 2;

  const out = new Map();
  out.stubs = [];
  out.collapsed = new Map();
  out.family = new Map();
  out.sectors = [];

  const index = new Map(nodes.map((n, i) => [n.id, i]));
  if (index.has(centerId)) out.set(centerId, { x: cx, y: cy });

  const { dist, parent } = bfs(centerId, nodes, edges);

  // Family ranking: explicit order first, then first appearance.
  const seenFam = new Map();
  const famRank = (f) => {
    const i = order.indexOf(f);
    if (i >= 0) return i;
    if (!seenFam.has(f)) seenFam.set(f, seenFam.size);
    return order.length + seenFam.get(f);
  };
  const edgeFam = (e) => String(e.family ?? e.type ?? '_other');

  // Best centre edge per direct neighbour.
  const centreFam = new Map();
  for (const e of edges) {
    let other = null;
    if (e.from === centerId) other = e.to;
    else if (e.to === centerId) other = e.from;
    if (other == null || other === centerId) continue;
    const f = edgeFam(e);
    famRank(f);
    const cur = centreFam.get(other);
    if (cur == null || famRank(f) < famRank(cur)) centreFam.set(other, f);
  }

  // Assign families in BFS order so a parent is always resolved first.
  const others = nodes.filter(n => n.id !== centerId);
  const byDist = [...others].sort((a, b) =>
    (dist.get(a.id) ?? Infinity) - (dist.get(b.id) ?? Infinity) || index.get(a.id) - index.get(b.id));
  for (const n of byDist) {
    let f;
    if (opts.familyOf) f = opts.familyOf(n);
    if (f == null) f = n.family;
    if (f == null) f = centreFam.get(n.id);
    if (f == null) {
      const p = parent.get(n.id);
      if (p && p.id !== centerId) f = out.family.get(p.id);
      else if (p) f = edgeFam(p.edge);
    }
    if (f == null) f = '_other';
    f = String(f);
    famRank(f);
    out.family.set(n.id, f);
  }

  const ringOf = (n) => {
    if (n.ring != null) return Math.max(1, Math.min(maxRing, n.ring));
    const d = dist.get(n.id);
    return d == null ? maxRing : Math.max(1, Math.min(maxRing, d));
  };

  // Group, rank, collapse.
  const groups = new Map();
  for (const n of others) {
    const f = out.family.get(n.id);
    if (!groups.has(f)) groups.set(f, []);
    groups.get(f).push(n);
  }
  const fams = [...groups.keys()].sort((a, b) => famRank(a) - famRank(b));
  const sectorItems = [];   // per family: [{id, ring}]
  let maxRingUsed = 1;
  for (const f of fams) {
    const list = groups.get(f).slice().sort((a, b) =>
      ringOf(a) - ringOf(b) || priorityOf(b) - priorityOf(a) || index.get(a.id) - index.get(b.id));
    const cap = maxPerSector + (extra[f] ?? 0);
    const visible = list.slice(0, cap);
    const hidden  = list.slice(cap);
    const items = visible.map(n => ({ id: n.id, ring: ringOf(n) }));
    let stub = null;
    if (hidden.length) {
      const ring = Math.max(...items.map(i => i.ring));
      stub = {
        id: `more:${f}`, type: 'stub', family: f, count: hidden.length,
        members: hidden.map(n => n.id), label: `+${hidden.length}`, ring,
      };
      out.stubs.push(stub);
      for (const n of hidden) out.collapsed.set(n.id, stub.id);
      out.family.set(stub.id, f);
      items.push({ id: stub.id, ring });
    }
    for (const it of items) maxRingUsed = Math.max(maxRingUsed, it.ring);
    sectorItems.push({ family: f, items, collapsed: hidden.length });
  }
  if (!sectorItems.length) return out;

  // Sector widths.
  const k = sectorItems.length;
  const g = k > 1 ? gap : 0;
  const avail = TAU - g * k;
  const base = Math.min(minAngle, avail / k);
  const total = sectorItems.reduce((s, x) => s + x.items.length, 0);
  const widths = sectorItems.map(x => base + (avail - base * k) * x.items.length / total);

  const R = Math.max(40, Math.min(W, H) / 2 - margin);
  const radius = typeof opts.ringRadius === 'function'
    ? (r) => opts.ringRadius(r, R, maxRingUsed)
    : (r) => (maxRingUsed <= 1 ? R * 0.62 : R * (0.4 + 0.6 * (r - 1) / (maxRingUsed - 1)));

  let a = startAngle - widths[0] / 2;
  sectorItems.forEach((sec, si) => {
    const w = widths[si];
    out.sectors.push({ family: sec.family, start: a, end: a + w, count: sec.items.length, collapsed: sec.collapsed });
    const byRing = new Map();
    for (const it of sec.items) {
      if (!byRing.has(it.ring)) byRing.set(it.ring, []);
      byRing.get(it.ring).push(it.id);
    }
    for (const [ring, ids] of [...byRing.entries()].sort((p, q) => p[0] - q[0])) {
      const r = radius(ring);
      const n = ids.length;
      const perNode = (w * r) / n;
      const rows = Math.max(1, Math.min(maxRows, Math.ceil(minGap / Math.max(1e-6, perNode))));
      ids.forEach((id, i) => {
        const ang = a + w * (i + 0.5) / n;
        const rr = r + (rows > 1 ? ((i % rows) - (rows - 1) / 2) * rowStep : 0);
        out.set(id, { x: cx + rr * Math.cos(ang), y: cy + rr * Math.sin(ang) });
      });
    }
    a += w + g;
  });

  return out;
}
