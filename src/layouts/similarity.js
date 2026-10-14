/**
 * Similarity layout: the centre in the middle, every other node at
 * radius = minRadius + (1 − score) · (R − minRadius), so a score of 1 sits
 * nearest the centre and 0 on the outer rim. Nodes are spread evenly in angle,
 * ordered by score (highest first) then input order.
 *
 * score = opts.scoreOf(node) ?? node.score ?? (score|weight of the edge to the
 * centre) ?? 0, clamped to [0,1].
 *
 * @param {{nodes:object[], edges:object[]}} graph
 * @param {{W:number,H:number,centerId:string, scoreOf?:Function, minRadius?:number,
 *   margin?:number, startAngle?:number}} opts
 * @returns {Map<string,{x:number,y:number}>} (+ `.radius`: Map id → radius, `.score`: Map id → score)
 */
export function similarity(graph, opts) {
  const { W, H, centerId } = opts;
  const cx = W / 2, cy = H / 2;
  const margin = opts.margin ?? 40;
  const R = Math.max(40, Math.min(W, H) / 2 - margin);
  const rMin = Math.min(R, opts.minRadius ?? Math.max(56, R * 0.18));
  const startAngle = opts.startAngle ?? -Math.PI / 2;

  const edgeScore = new Map();
  for (const e of graph.edges) {
    const other = e.from === centerId ? e.to : e.to === centerId ? e.from : null;
    if (other == null) continue;
    const s = e.score ?? e.weight;
    if (s != null && !(edgeScore.get(other) >= s)) edgeScore.set(other, s);
  }
  const clamp = (v) => Math.max(0, Math.min(1, Number.isFinite(v) ? v : 0));

  const out = new Map();
  out.radius = new Map();
  out.score = new Map();
  const index = new Map(graph.nodes.map((n, i) => [n.id, i]));
  if (index.has(centerId)) out.set(centerId, { x: cx, y: cy });

  const others = graph.nodes.filter(n => n.id !== centerId).map(n => {
    let s = opts.scoreOf ? opts.scoreOf(n) : undefined;
    if (s == null) s = n.score;
    if (s == null) s = edgeScore.get(n.id);
    return { id: n.id, s: clamp(s ?? 0) };
  });
  others.sort((a, b) => b.s - a.s || index.get(a.id) - index.get(b.id));
  const n = others.length;
  others.forEach((o, i) => {
    const r = rMin + (1 - o.s) * (R - rMin);
    const ang = startAngle + (i * Math.PI * 2) / Math.max(1, n);
    out.set(o.id, { x: cx + r * Math.cos(ang), y: cy + r * Math.sin(ang) });
    out.radius.set(o.id, r);
    out.score.set(o.id, o.s);
  });
  return out;
}
