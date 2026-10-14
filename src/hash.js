// Deterministic hashing / pseudo-randomness. Nothing in the library calls
// an unseeded random source: every "random" offset is derived from a node id, so the same
// data always produces the same picture (and the same snapshot tests).

/** FNV-1a 32-bit hash of a string → uint32. */
export function hashString(str) {
  let h = 0x811c9dc5;
  const s = String(str);
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

/** mulberry32 PRNG seeded with a uint32 → () => float in [0,1). */
export function seededRandom(seed) {
  let a = seed >>> 0;
  return function () {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * Deterministic 2-D jitter for an id: {dx, dy} each in [-amp/2, amp/2].
 * @param {string} id
 * @param {number} amp
 */
export function jitter(id, amp) {
  const r = seededRandom(hashString(id));
  return { dx: (r() - 0.5) * amp, dy: (r() - 0.5) * amp };
}
