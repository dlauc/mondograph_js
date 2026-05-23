// Module-level cache: imageUrl → ImageBitmap | 'loading' | 'error'
const cache = new Map();

/**
 * Resolves country ISO-2 code or URL.
 * @param {string} val Country ISO code (e.g. "US", "GB") or direct URL
 * @returns {string}
 */
export function resolveFlagUrl(val) {
  if (!val) return '';
  if (val.startsWith('http://') || val.startsWith('https://')) return val;
  return `https://flagcdn.com/w40/${val.toLowerCase()}.png`;
}

/**
 * Draw a flag node (country circle with flag image fill).
 * Shows a glowing teal placeholder while loading.
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} node   must have imageUrl or iso2, label, _opacity
 * @param {number} x
 * @param {number} y
 * @param {boolean} isCenter
 * @param {object} theme  resolveTheme() output
 */
export function drawFlagNode(ctx, node, x, y, isCenter, theme) {
  // Dynamically scale radius by popularity if present
  const pop = node.popularity ?? 0.5;
  const baseR = isCenter ? 38 : 22;
  const r = baseR * (0.7 + 0.6 * pop);

  const url = resolveFlagUrl(node.imageUrl || node.iso2 || node.id);
  const bitmap = cache.get(url);

  ctx.save();
  ctx.globalAlpha = node._opacity ?? 1;

  // Outer glossy ring glow
  if (isCenter) {
    ctx.save();
    const grad = ctx.createRadialGradient(x, y, r - 4, x, y, r + 8);
    grad.addColorStop(0, 'rgba(2,185,185,0.4)');
    grad.addColorStop(1, 'rgba(2,185,185,0)');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r + 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Draw circular flag
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);

  if (bitmap && bitmap !== 'loading' && bitmap !== 'error') {
    ctx.save();
    ctx.clip();
    ctx.drawImage(bitmap, x - r, y - r, r * 2, r * 2);
    ctx.restore();
  } else {
    if (bitmap === 'error') {
      ctx.fillStyle = '#2a3a4a';
    } else {
      ctx.fillStyle = theme.centerGlow;  // teal placeholder
    }
    ctx.fill();
    if (url && bitmap !== 'loading' && bitmap !== 'error') _load(url);
  }

  // Crisp outline border
  ctx.strokeStyle = theme.nodeTypes.flag.stroke;
  ctx.lineWidth   = isCenter ? 2.8 : 1.8;
  ctx.setLineDash([]);
  ctx.stroke();

  // Shadow overlay to give 3D depth
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  const shadowGrad = ctx.createLinearGradient(x - r, y - r, x + r, y + r);
  shadowGrad.addColorStop(0, 'rgba(255,255,255,0.15)');
  shadowGrad.addColorStop(0.5, 'rgba(0,0,0,0)');
  shadowGrad.addColorStop(1, 'rgba(0,0,0,0.3)');
  ctx.fillStyle = shadowGrad;
  ctx.fill();

  // Label text under node
  ctx.fillStyle    = 'rgba(255,255,255,.7)';
  ctx.font         = `400 8.5px ${theme.font}`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(node.label ?? '', x, y + r + 4);

  ctx.restore();
}

/**
 * Draw a mini overlapping flag avatar cluster on a node's perimeter.
 * Used for direct name node propensity representation.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array<string>} flags Array of ISO codes or URLs
 * @param {number} x Node center X
 * @param {number} y Node center Y
 * @param {number} r Node visual radius
 * @param {object} theme Theme object
 */
export function drawFlagBadgeCluster(ctx, flags, x, y, r, theme) {
  if (!flags || !flags.length) return;
  const list = flags.slice(0, 3); // max 3 badges to avoid overlap clutter

  const cx = x + r * 0.707;
  const cy = y - r * 0.707;

  const br = 8;        // badge radius
  const gap = 11;      // overlap offset distance

  list.forEach((flagItem, idx) => {
    const url = resolveFlagUrl(flagItem);
    if (!url) return;

    // Offset along the X axis for stack representation
    const bx = cx + idx * gap - (list.length - 1) * gap / 2;
    const by = cy;

    // Draw backing badge border
    ctx.save();
    ctx.beginPath();
    ctx.arc(bx, by, br + 1.2, 0, Math.PI * 2);
    ctx.fillStyle = '#020f20'; // background masking color
    ctx.fill();
    ctx.strokeStyle = theme.ringStroke;
    ctx.lineWidth = 1;
    ctx.stroke();
    ctx.restore();

    // Draw flag image inside badge
    const bitmap = cache.get(url);
    ctx.save();
    ctx.beginPath();
    ctx.arc(bx, by, br, 0, Math.PI * 2);
    ctx.clip();

    if (bitmap && bitmap !== 'loading' && bitmap !== 'error') {
      ctx.drawImage(bitmap, bx - br, by - br, br * 2, br * 2);
    } else {
      ctx.fillStyle = bitmap === 'error' ? '#2a3a4a' : theme.centerGlow;
      ctx.fill();
      if (bitmap !== 'loading' && bitmap !== 'error') {
        _load(url);
      }
    }
    ctx.restore();
  });
}

function _load(url) {
  cache.set(url, 'loading');
  fetch(url)
    .then(r => r.blob())
    .then(blob => createImageBitmap(blob))
    .then(bitmap => cache.set(url, bitmap))
    .catch(() => cache.set(url, 'error'));
}

/**
 * Draw a single circular flag badge at (x, y) with radius r.
 * Used for orbiting country propensity indicators on name nodes.
 */
export function drawFlagOrb(ctx, iso, x, y, r, theme) {
  const url = resolveFlagUrl(iso);
  if (!url) return;

  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r + 1, 0, Math.PI * 2);
  ctx.fillStyle = '#020f20';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.18)';
  ctx.lineWidth = 0.8;
  ctx.stroke();
  ctx.restore();

  const bitmap = cache.get(url);
  ctx.save();
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.clip();
  if (bitmap && bitmap !== 'loading' && bitmap !== 'error') {
    ctx.drawImage(bitmap, x - r, y - r, r * 2, r * 2);
  } else {
    ctx.fillStyle = bitmap === 'error' ? '#2a3a4a' : (theme?.centerGlow ?? '#02b9b9') + '55';
    ctx.fill();
    if (bitmap !== 'loading' && bitmap !== 'error') _load(url);
  }
  ctx.restore();
}

/** Clear the image cache. */
export function clearFlagCache() { cache.clear(); }
