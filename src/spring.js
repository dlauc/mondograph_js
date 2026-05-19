/**
 * One damped spring step for a single axis.
 * @param {number} pos     current position
 * @param {number} vel     current velocity
 * @param {number} target  target position
 * @param {number} K       spring constant  (e.g. 0.10)
 * @param {number} damping damping factor   (e.g. 0.74)
 * @returns {{ pos: number, vel: number }}
 */
export function springStep(pos, vel, target, K, damping) {
  const force  = K * (target - pos);
  const newVel = (vel + force) * damping;
  return { pos: pos + newVel, vel: newVel };
}

/**
 * Create a new spring node state initialised at (x, y).
 * @param {number} x
 * @param {number} y
 * @param {number} [opacity=1]
 * @returns {{ x,y,vx,vy,opacity,vOpacity,targetX,targetY,targetOpacity }}
 */
export function createSpringNode(x, y, opacity = 1) {
  return {
    x, y, vx: 0, vy: 0,
    opacity, vOpacity: 0,
    targetX: x, targetY: y, targetOpacity: opacity,
  };
}

/**
 * Advance every spring node by one frame (mutates in place).
 * @param {Map<string, object>} springNodes
 * @param {{ K:number, damping:number }} posSpring
 * @param {{ K:number, damping:number }} opSpring
 */
export function tickSprings(springNodes, posSpring, opSpring) {
  for (const s of springNodes.values()) {
    const rx = springStep(s.x,       s.vx,       s.targetX,       posSpring.K, posSpring.damping);
    const ry = springStep(s.y,       s.vy,       s.targetY,       posSpring.K, posSpring.damping);
    const ro = springStep(s.opacity, s.vOpacity, s.targetOpacity, opSpring.K,  opSpring.damping);
    s.x = rx.pos; s.vx = rx.vel;
    s.y = ry.pos; s.vy = ry.vel;
    s.opacity = ro.pos; s.vOpacity = ro.vel;
  }
}
