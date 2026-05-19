// Module-level cache: imageUrl → ImageBitmap | 'loading' | 'error'
const cache = new Map();

/**
 * Draw a flag node (country circle with flag image fill).
 * While the image loads, shows a teal placeholder circle.
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} node   must have imageUrl, label, _opacity
 * @param {number} x
 * @param {number} y
 * @param {boolean} isCenter
 * @param {object} theme  resolveTheme() output
 */
export function drawFlagNode(ctx, node, x, y, isCenter, theme) {
  const r      = isCenter ? 38 : 22;
  const bitmap = cache.get(node.imageUrl);

  ctx.save();
  ctx.globalAlpha = node._opacity ?? 1;
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
      ctx.fillStyle = theme.centerGlow;  // teal placeholder while loading
    }
    ctx.fill();
    if (node.imageUrl && bitmap !== 'loading' && bitmap !== 'error') _load(node.imageUrl);
  }

  ctx.strokeStyle = theme.nodeTypes.flag.stroke;
  ctx.lineWidth   = isCenter ? 2.5 : 1.7;
  ctx.setLineDash([]);
  ctx.stroke();

  ctx.fillStyle    = 'rgba(255,255,255,.6)';
  ctx.font         = `400 7px ${theme.font}`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(node.label ?? '', x, y + r + 3);

  ctx.restore();
}

function _load(url) {
  cache.set(url, 'loading');
  fetch(url)
    .then(r => r.blob())
    .then(blob => createImageBitmap(blob))
    .then(bitmap => cache.set(url, bitmap))
    .catch(() => cache.set(url, 'error'));
}

/** Clear the image cache — call between test runs or on destroy. */
export function clearFlagCache() { cache.clear(); }
