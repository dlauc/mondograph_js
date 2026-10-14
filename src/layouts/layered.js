/**
 * Layered (Sugiyama-lite) layout for small DAGs (≤ ~100 nodes).
 *
 * 1. Directed edges (`isDirected(edge)`, default `edge.directed === true`)
 *    point from an upper layer to a lower one (`from` above `to`).
 * 2. Cycles: a deterministic DFS marks back-edges; they are treated as
 *    undirected (returned in `.backEdges`, drawn without arrows).
 * 3. Longest-path layering over the remaining DAG. Nodes with no directed
 *    edge take the layer of their nearest undirected neighbour that has one.
 * 4. Barycentre ordering sweeps (down, then up) reduce crossings.
 * 5. Layers are spaced `layerGap` px apart, nodes `nodeGap` px apart,
 *    shrunk to fit the canvas. `direction: 'LR'` lays layers left to right.
 *
 * Pure and deterministic. The returned Map carries `.layers` (Map id → layer)
 * and `.backEdges` (Set of edge ids).
 *
 * For larger or prettier layouts a caller can pass `layoutAdapter` to
 * `setLayout('layered', {layoutAdapter})` (e.g. a lazily imported elkjs);
 * this built-in result is shown until the adapter resolves.
 *
 * @param {{nodes:object[], edges:object[]}} graph
 * @param {{W:number,H:number,centerId?:string, isDirected?:Function, sweeps?:number,
 *   layerGap?:number, nodeGap?:number, margin?:number, direction?:'TB'|'LR'}} opts
 */
export function layered(graph, opts) {
  const nodes = graph.nodes;
  const ids = nodes.map(n => n.id);
  const index = new Map(ids.map((id, i) => [id, i]));
  const isDirected = opts.isDirected ?? ((e) => e.directed === true);
  const sweeps = opts.sweeps ?? 4;
  const LR = opts.direction === 'LR';
  const W = LR ? opts.H : opts.W, H = LR ? opts.W : opts.H;
  const margin = opts.margin ?? 48;

  const out = new Map();
  out.layers = new Map();
  out.backEdges = new Set();
  if (!nodes.length) return out;

  const usable = graph.edges.filter(e => index.has(e.from) && index.has(e.to) && e.from !== e.to);
  const directed = usable.filter(e => isDirected(e));
  const outAdj = new Map(ids.map(id => [id, []]));
  for (const e of directed) outAdj.get(e.from).push(e);

  // ── Cycle breaking: iterative DFS, back-edges become undirected ──────────
  const state = new Map();        // 1 = on stack, 2 = done
  const roots = opts.centerId != null && index.has(opts.centerId)
    ? [opts.centerId, ...ids.filter(id => id !== opts.centerId)] : ids;
  for (const root of roots) {
    if (state.has(root)) continue;
    const stack = [[root, 0]];
    state.set(root, 1);
    while (stack.length) {
      const top = stack[stack.length - 1];
      const list = outAdj.get(top[0]);
      if (top[1] >= list.length) { state.set(top[0], 2); stack.pop(); continue; }
      const e = list[top[1]++];
      const st = state.get(e.to);
      if (st === 1) out.backEdges.add(e.id);
      else if (st == null) { state.set(e.to, 1); stack.push([e.to, 0]); }
    }
  }
  const dag = directed.filter(e => !out.backEdges.has(e.id));

  // ── Longest-path layering (Kahn over the DAG) ────────────────────────────
  const indeg = new Map(ids.map(id => [id, 0]));
  const succ = new Map(ids.map(id => [id, []]));
  const hasDir = new Set();
  for (const e of dag) {
    indeg.set(e.to, indeg.get(e.to) + 1);
    succ.get(e.from).push(e.to);
    hasDir.add(e.from); hasDir.add(e.to);
  }
  const layer = new Map();
  const queue = ids.filter(id => indeg.get(id) === 0);
  for (const id of queue) layer.set(id, 0);
  for (let qi = 0; qi < queue.length; qi++) {
    const u = queue[qi];
    for (const v of succ.get(u)) {
      layer.set(v, Math.max(layer.get(v) ?? 0, layer.get(u) + 1));
      indeg.set(v, indeg.get(v) - 1);
      if (indeg.get(v) === 0) queue.push(v);
    }
  }

  // Undirected neighbours (all usable edges) for the rest.
  const undAdj = new Map(ids.map(id => [id, []]));
  for (const e of usable) { undAdj.get(e.from).push(e.to); undAdj.get(e.to).push(e.from); }
  const placed = new Set(ids.filter(id => hasDir.has(id)));
  const bq = ids.filter(id => placed.has(id));
  for (let qi = 0; qi < bq.length; qi++) {
    const u = bq[qi];
    for (const v of undAdj.get(u)) {
      if (placed.has(v)) continue;
      placed.add(v);
      layer.set(v, layer.get(u));
      bq.push(v);
    }
  }
  for (const id of ids) if (!placed.has(id)) layer.set(id, 0);

  const minL = Math.min(...layer.values());
  for (const id of ids) layer.set(id, layer.get(id) - minL);
  const L = Math.max(...layer.values()) + 1;
  const layers = Array.from({ length: L }, () => []);
  for (const id of ids) layers[layer.get(id)].push(id);

  // ── Barycentre sweeps ────────────────────────────────────────────────────
  const pos = new Map();
  const reindex = (l) => layers[l].forEach((id, i) => pos.set(id, i));
  for (let l = 0; l < L; l++) reindex(l);
  const sweep = (l, above) => {
    const bary = new Map();
    for (const id of layers[l]) {
      let sum = 0, cnt = 0;
      for (const v of undAdj.get(id)) {
        const lv = layer.get(v);
        if (above ? lv < l : lv > l) {
          // normalise by layer width so wide layers do not dominate
          sum += pos.get(v) / Math.max(1, layers[lv].length - 1 || 1);
          cnt++;
        }
      }
      bary.set(id, cnt ? sum / cnt : pos.get(id) / Math.max(1, layers[l].length - 1 || 1));
    }
    layers[l].sort((a, b) => bary.get(a) - bary.get(b) || pos.get(a) - pos.get(b));
    reindex(l);
  };
  for (let s = 0; s < sweeps; s++) {
    for (let l = 1; l < L; l++) sweep(l, true);
    for (let l = L - 2; l >= 0; l--) sweep(l, false);
  }

  // ── Coordinates ──────────────────────────────────────────────────────────
  const cx = W / 2, cy = H / 2;
  const layerGap = L > 1 ? Math.min(opts.layerGap ?? 120, (H - 2 * margin) / (L - 1)) : 0;
  for (let l = 0; l < L; l++) {
    const row = layers[l];
    const n = row.length;
    const nodeGap = n > 1 ? Math.min(opts.nodeGap ?? 120, (W - 2 * margin) / (n - 1)) : 0;
    const y = cy + (l - (L - 1) / 2) * layerGap;
    row.forEach((id, i) => {
      const x = cx + (i - (n - 1) / 2) * nodeGap;
      out.set(id, LR ? { x: y, y: x } : { x, y });
      out.layers.set(id, l);
    });
  }
  return out;
}
