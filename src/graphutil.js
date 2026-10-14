// Graph helpers shared by layouts, the scene model and the a11y mirror.

/**
 * Normalise an edge list: shallow copies with a stable `id`, `from`, `to`.
 * Accepts the gdict-style aliases `src`/`dst`/`predicate`.
 * Duplicate ids get a `#n` suffix so every edge stays addressable.
 * @param {object[]} edges
 * @returns {object[]}
 */
export function normalizeEdges(edges) {
  const seen = new Map();
  const out = [];
  for (const e of edges || []) {
    const from = e.from ?? e.src;
    const to   = e.to ?? e.dst;
    if (from == null || to == null) continue;
    const type = e.type ?? e.predicate;
    let id = e.id ?? e.assertionId ?? `${from}|${type ?? e.family ?? ''}|${to}`;
    id = String(id);
    const n = seen.get(id) ?? 0;
    seen.set(id, n + 1);
    if (n > 0) id = `${id}#${n}`;
    out.push({ ...e, id, from: String(from), to: String(to), type });
  }
  return out;
}

/** Normalise nodes: shallow copies with string ids and a label fallback. */
export function normalizeNodes(nodes) {
  const out = [];
  const seen = new Set();
  for (const n of nodes || []) {
    if (n == null || n.id == null) continue;
    const id = String(n.id);
    if (seen.has(id)) continue;
    seen.add(id);
    out.push({ ...n, id, label: n.label ?? n.form ?? id });
  }
  return out;
}

/** Undirected adjacency: id → array of {other, edge}. */
export function adjacency(nodes, edges) {
  const adj = new Map(nodes.map(n => [n.id, []]));
  for (const e of edges) {
    if (!adj.has(e.from) || !adj.has(e.to) || e.from === e.to) continue;
    adj.get(e.from).push({ other: e.to, edge: e });
    adj.get(e.to).push({ other: e.from, edge: e });
  }
  return adj;
}

/**
 * Undirected BFS hop distance from `centerId` (unreachable nodes absent).
 * Also returns the BFS parent edge of each node.
 */
export function bfs(centerId, nodes, edges) {
  const adj = adjacency(nodes, edges);
  const dist = new Map();
  const parent = new Map();
  if (!adj.has(centerId)) return { dist, parent, adj };
  dist.set(centerId, 0);
  const queue = [centerId];
  for (let qi = 0; qi < queue.length; qi++) {
    const cur = queue[qi];
    for (const { other, edge } of adj.get(cur)) {
      if (dist.has(other)) continue;
      dist.set(other, dist.get(cur) + 1);
      parent.set(other, { id: cur, edge });
      queue.push(other);
    }
  }
  return { dist, parent, adj };
}
