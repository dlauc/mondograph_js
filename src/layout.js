const RING_RADIUS_FACTORS = [0, 0.22, 0.38, 0.50];
const RING_START_ANGLES   = [-Math.PI / 2, -Math.PI * 0.7, -Math.PI / 2];

/**
 * BFS from centerId over undirected edges. Returns ring index (0–3) per node.
 * @param {string} centerId
 * @param {Array<{id:string}>} nodes
 * @param {Array<{from:string,to:string}>} edges
 * @returns {Map<string,number>}
 */
export function computeRings(centerId, nodes, edges) {
  const adj = new Map(nodes.map(n => [n.id, []]));
  for (const e of edges) {
    adj.get(e.from)?.push(e.to);
    adj.get(e.to)?.push(e.from);
  }

  const dist = new Map([[centerId, 0]]);
  const queue = [centerId];
  while (queue.length) {
    const cur = queue.shift();
    for (const nb of (adj.get(cur) ?? [])) {
      if (!dist.has(nb)) {
        dist.set(nb, Math.min(dist.get(cur) + 1, 3));
        queue.push(nb);
      }
    }
  }
  return dist;
}

/**
 * Compute canvas target {x,y} for every node.
 * @param {string} centerId
 * @param {Array<{id:string,period?:number}>} nodes
 * @param {Array<{from:string,to:string}>} edges
 * @param {number} W canvas width  (logical px)
 * @param {number} H canvas height (logical px)
 * @returns {Map<string,{x:number,y:number}>}
 */
export function computeTargets(centerId, nodes, edges, W, H) {
  const rings   = computeRings(centerId, nodes, edges);
  const cx = W / 2, cy = H / 2;
  const minDim  = Math.min(W, H);
  const nowYear = new Date().getFullYear();

  const byRing = [[], [], [], []];
  for (const node of nodes) {
    let ring = rings.get(node.id) ?? 3;
    if (node.period != null && ring > 0) {
      const yearsAgo = nowYear - node.period;
      ring = Math.min(ring + Math.floor(yearsAgo / 500), 3);
    }
    byRing[ring].push(node.id);
  }

  const targets = new Map();
  targets.set(centerId, { x: cx, y: cy });

  for (let d = 1; d <= 3; d++) {
    const ring = byRing[d];
    if (!ring.length) continue;
    const r     = minDim * RING_RADIUS_FACTORS[d];
    const start = RING_START_ANGLES[d - 1];
    const step  = (2 * Math.PI) / ring.length;
    ring.forEach((id, i) => {
      const angle = start + step * i;
      targets.set(id, { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
    });
  }

  return targets;
}
