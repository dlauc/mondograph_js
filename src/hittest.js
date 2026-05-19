const MIN_HIT    = 20;
const TOUCH_EXTRA = 8;

/**
 * Resolve which node (if any) the pointer is over.
 * Iterates front-to-back (highest index = topmost).
 * @param {number} px pointer x (logical px)
 * @param {number} py pointer y (logical px)
 * @param {Array<{id:string, x:number, y:number, hitRadius:number}>} nodes
 * @returns {string|null}
 */
export function hitTest(px, py, nodes) {
  for (let i = nodes.length - 1; i >= 0; i--) {
    const n  = nodes[i];
    const dx = px - n.x, dy = py - n.y;
    if (dx * dx + dy * dy < n.hitRadius * n.hitRadius) return n.id;
  }
  return null;
}

/**
 * Compute hit radius for a node.
 * @param {string}  type      node type
 * @param {boolean} isCenter
 * @param {boolean} isTouch
 * @returns {number}
 */
export function hitRadius(type, isCenter, isTouch) {
  let r;
  if (isCenter)                    r = 38;
  else if (type === 'attestation') r = 8;
  else if (type === 'concept')     r = 18;
  else if (type === 'referent')    r = 20;
  else if (type === 'element')     r = 12;
  else                             r = 22;
  return Math.max(r, MIN_HIT) + (isTouch ? TOUCH_EXTRA : 0);
}
