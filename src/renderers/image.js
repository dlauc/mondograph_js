const cache = new Map();

/**
 * Draw an image node (person avatar). Falls back to initials if image is
 * unavailable or loading.
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} node   must have imageUrl?, label, _opacity
 * @param {number} x
 * @param {number} y
 * @param {boolean} isCenter
 * @param {object} theme  resolveTheme() output
 */
export function drawImageNode(ctx, node, x, y, isCenter, theme) {
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
    ctx.fillStyle = theme.nodeFill ?? '#020f20';
    ctx.fill();
    _drawInitials(ctx, node.label, x, y, r, theme);
    if (node.imageUrl && bitmap !== 'loading' && bitmap !== 'error') _load(node.imageUrl);
  }

  ctx.strokeStyle = theme.nodeTypes.image.stroke;
  ctx.lineWidth   = isCenter ? 2.5 : 1.7;
  ctx.setLineDash([]);
  ctx.stroke();

  ctx.restore();
}

function _drawInitials(ctx, label, x, y, r, theme) {
  const initials = (label ?? '?')
    .split(' ')
    .map(w => w[0] ?? '')
    .join('')
    .slice(0, 2)
    .toUpperCase();
  ctx.fillStyle    = theme.centerGlow;
  ctx.font         = `700 ${Math.round(r * 0.6)}px ${theme.font}`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(initials, x, y);
}

function _load(url) {
  cache.set(url, 'loading');
  fetch(url)
    .then(r => r.blob())
    .then(blob => createImageBitmap(blob))
    .then(bitmap => cache.set(url, bitmap))
    .catch(() => cache.set(url, 'error'));
}

export function clearImageCache() { cache.clear(); }
