// Local flag asset store: resolves ISO-2 codes to bundled SVG assets, preloads
// them in parallel, and caches the decoded images for the draw path.
//
// Assets are expected at `${BASE}<iso2>.svg` (lowercase), served by the host
// app (the frontend bundles flag-icons 1x1 SVGs into /flags/). Loading uses an
// <Image> element so SVGs rasterise correctly for canvas drawImage.

let BASE = '/flags/';

// iso(lower) → { status:'loading'|'loaded'|'error', img, loadedAt, promise }
const cache = new Map();

const FADE_MS = 220;

/** Point the store at a different asset base path (must end in '/'). */
export function configureFlagBase(path) {
  if (typeof path === 'string' && path) BASE = path.endsWith('/') ? path : path + '/';
}

/**
 * Resolve an ISO-2 code (or a direct URL) to a flag asset URL.
 * @param {string} val ISO-2 code (e.g. "US") or http(s) URL
 * @returns {string}
 */
export function resolveFlagUrl(val) {
  if (!val) return '';
  if (val.startsWith('http://') || val.startsWith('https://')) return val;
  return `${BASE}${val.toLowerCase()}.svg`;
}

function loadOne(iso) {
  const key = String(iso).toLowerCase();
  const hit = cache.get(key);
  if (hit) return hit.promise;

  const entry = { status: 'loading', img: null, loadedAt: 0 };
  entry.promise = new Promise((resolve) => {
    if (typeof Image === 'undefined') { entry.status = 'error'; resolve(); return; }
    const img = new Image();
    img.onload  = () => { entry.img = img; entry.status = 'loaded'; entry.loadedAt = Date.now(); resolve(); };
    img.onerror = () => { entry.status = 'error'; resolve(); };
    img.src = resolveFlagUrl(iso);
  });
  cache.set(key, entry);
  return entry.promise;
}

/**
 * Preload a set of flags in parallel. Call this when graph data arrives so
 * flags are ready at first paint instead of popping in one-by-one.
 * @param {string[]} isoList ISO-2 codes (deduplicated internally)
 * @returns {Promise<void>}
 */
export function preload(isoList) {
  const uniq = [...new Set((isoList || []).filter(Boolean).map(s => String(s).toLowerCase()))];
  return Promise.all(uniq.map(loadOne)).then(() => undefined);
}

/**
 * Synchronous read for the draw path. Triggers a lazy load on a cache miss.
 * @param {string} iso ISO-2 code or URL
 * @returns {{ img: CanvasImageSource, alpha: number } | null}
 *          null while loading/errored; otherwise the image with a 0→1 fade-in alpha.
 */
export function getFlag(iso) {
  if (!iso) return null;
  const key = String(iso).toLowerCase();
  const entry = cache.get(key);
  if (!entry) { loadOne(iso); return null; }
  if (entry.status !== 'loaded') return null;
  const alpha = entry.loadedAt ? Math.min(1, (Date.now() - entry.loadedAt) / FADE_MS) : 1;
  return { img: entry.img, alpha };
}

/** Clear the cache (e.g. between unrelated sessions). */
export function clearFlagCache() { cache.clear(); }
