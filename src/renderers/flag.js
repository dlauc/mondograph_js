// Flag drawing. Image loading/caching lives in ../flagStore.js; this module
// only paints. Flags are bundled local assets, preloaded by the host app, so
// they are normally ready at first paint; a short fade-in covers any straggler.
import { getFlag, resolveFlagUrl } from '../flagStore.js';

export { resolveFlagUrl } from '../flagStore.js';
export { clearFlagCache } from '../flagStore.js';

/**
 * Paint a circular flag clipped to (x,y,r), with a fade-in alpha, or a quiet
 * placeholder disc while it loads. Returns true once the image is drawn.
 */
function paintFlagDisc(ctx, iso, x, y, r, theme) {
  const f = getFlag(iso);
  if (f) {
    ctx.save();
    ctx.globalAlpha *= f.alpha;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.clip();
    ctx.drawImage(f.img, x - r, y - r, r * 2, r * 2);
    ctx.restore();
    return f.alpha >= 1;
  }
  // placeholder: faint disc in node fill
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = theme.badgeBacking ?? '#ffffff';
  ctx.fill();
  return false;
}

/**
 * Draw a flag node (country circle with flag image fill).
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} node   must have imageUrl or iso2, label, _opacity
 * @param {number} x @param {number} y
 * @param {boolean} isCenter
 * @param {object} theme  resolveTheme() output
 */
export function drawFlagNode(ctx, node, x, y, isCenter, theme) {
  const pop = node.popularity ?? 0.5;
  const baseR = isCenter ? 38 : 22;
  const r = baseR * (0.7 + 0.6 * pop);
  const iso = node.imageUrl || node.iso2 || node.id;

  ctx.save();
  ctx.globalAlpha = node._opacity ?? 1;

  // Soft drop shadow for depth (instead of a glow)
  ctx.save();
  ctx.shadowColor   = theme.shadow ?? 'rgba(30,30,45,0.12)';
  ctx.shadowBlur    = isCenter ? 14 : 8;
  ctx.shadowOffsetY = 1.5;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = theme.badgeBacking ?? '#ffffff';
  ctx.fill();
  ctx.restore();

  paintFlagDisc(ctx, iso, x, y, r, theme);

  // Crisp hairline border
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.strokeStyle = theme.nodeTypes.flag.stroke;
  ctx.lineWidth   = isCenter ? 2.4 : 1.4;
  ctx.setLineDash([]);
  ctx.stroke();

  // Label under node
  ctx.fillStyle    = theme.nodeSubLabel ?? 'rgba(34,32,43,0.45)';
  ctx.font         = `400 8.5px ${theme.font}`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'top';
  ctx.fillText(node.label ?? '', x, y + r + 5);

  ctx.restore();
}

/**
 * Draw a small overlapping flag badge cluster on a node's upper-right perimeter.
 * @param {CanvasRenderingContext2D} ctx
 * @param {Array<string>} flags ISO codes or URLs
 * @param {number} x @param {number} y  node centre
 * @param {number} r  node visual radius
 * @param {object} theme
 */
export function drawFlagBadgeCluster(ctx, flags, x, y, r, theme) {
  if (!flags || !flags.length) return;
  const list = flags.slice(0, 3);

  const cx = x + r * 0.707;
  const cy = y - r * 0.707;
  const br = 8;
  const gap = 11;

  list.forEach((flagItem, idx) => {
    if (!flagItem) return;
    const bx = cx + idx * gap - (list.length - 1) * gap / 2;
    drawFlagOrb(ctx, flagItem, bx, cy, br, theme);
  });
}

/**
 * Draw a single circular flag badge (white backing + hairline border).
 * Used for orbiting country-propensity indicators on name nodes.
 */
export function drawFlagOrb(ctx, iso, x, y, r, theme) {
  if (!iso) return;

  // White backing with soft shadow lifts the badge off the canvas
  ctx.save();
  ctx.shadowColor   = theme.shadow ?? 'rgba(30,30,45,0.12)';
  ctx.shadowBlur    = 4;
  ctx.shadowOffsetY = 1;
  ctx.beginPath();
  ctx.arc(x, y, r + 1, 0, Math.PI * 2);
  ctx.fillStyle = theme.badgeBacking ?? '#ffffff';
  ctx.fill();
  ctx.restore();

  paintFlagDisc(ctx, iso, x, y, r, theme);

  // Hairline border
  ctx.beginPath();
  ctx.arc(x, y, r + 1, 0, Math.PI * 2);
  ctx.strokeStyle = theme.badgeBorder ?? 'rgba(20,20,30,0.14)';
  ctx.lineWidth = 0.8;
  ctx.setLineDash([]);
  ctx.stroke();
}
