import { langColor } from '../theme.js';
import { drawFlagBadgeCluster, drawFlagOrb } from './flag.js';

const CENTER_R = 38;
const NODE_R   = 22;

/** Top-N countries by bearer count for a node's orbiting flags. */
function getCountryEntries(node) {
  if (!node.countriesData) return [];
  return Object.entries(node.countriesData)
    .filter(([k]) => k !== 'world')
    .map(([iso, data]) => ({ iso: iso.toUpperCase(), bearers: data?.bearers ?? 0 }))
    .filter(e => e.bearers > 0)
    .sort((a, b) => b.bearers - a.bearers)
    .slice(0, 3);
}

/** Orbiting flag badges, sized by relative bearer count, around the node rim. */
function drawCountryFlags(ctx, node, x, y, r, theme) {
  const entries = getCountryEntries(node);
  if (entries.length === 0) return;
  const maxB = entries[0].bearers;
  entries.forEach((e, i) => {
    const angle  = (i / entries.length) * Math.PI * 2 - Math.PI / 2;
    const ratio  = Math.sqrt(e.bearers / maxB);
    const badgeR = Math.max(4, 4 + ratio * 4);   // 4–8 px
    const dist   = r + badgeR + 5;
    const lx = x + Math.cos(angle) * dist;
    const ly = y + Math.sin(angle) * dist;
    drawFlagOrb(ctx, e.iso, lx, ly, badgeR, theme);
  });
}

/** Orbiting flags from explicit country data, else a compact badge cluster. */
function drawNodeFlags(ctx, node, x, y, r, theme) {
  if (node.countriesData) drawCountryFlags(ctx, node, x, y, r, theme);
  else drawFlagBadgeCluster(ctx, node.flags || node.countries, x, y, r, theme);
}

/**
 * Paint a paper-white name disc: soft drop shadow, white fill, thin coloured
 * ring. The centre node gets a faint accent halo and a heavier ring.
 */
function paintNameDisc(ctx, x, y, r, stroke, isCenter, theme) {
  if (isCenter && theme.centerAura) {
    ctx.save();
    const grad = ctx.createRadialGradient(x, y, r, x, y, r + 18);
    grad.addColorStop(0, theme.centerAura);
    grad.addColorStop(1, theme.centerAura.replace(/[\d.]+\)$/, '0)'));
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(x, y, r + 18, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  ctx.save();
  ctx.shadowColor   = theme.shadow ?? 'rgba(30,30,45,0.12)';
  ctx.shadowBlur    = isCenter ? 16 : 9;
  ctx.shadowOffsetY = 1.5;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = theme.nodeFill ?? '#ffffff';
  ctx.fill();
  ctx.restore();

  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.strokeStyle = stroke;
  ctx.lineWidth   = isCenter ? 2.6 : 1.6;
  ctx.setLineDash([]);
  ctx.stroke();
}

/** Ink label + muted sub-label (+ optional IPA) centred in a disc. */
function paintDiscText(ctx, node, x, y, isCenter, theme, { sub, popularity }) {
  const hasIPA   = !!node.ipa;
  const fontSize = isCenter ? 19 : ((node.label?.length ?? 0) > 7 ? 10.5 : 13);
  const scale    = fontSize * (0.85 + 0.3 * popularity);
  const labelY   = y - (isCenter ? (hasIPA ? 9 : 3) : (hasIPA ? 7 : 2));

  ctx.fillStyle    = theme.nodeLabel ?? '#22202b';
  ctx.font         = `700 ${scale}px ${theme.font}`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(node.label ?? '', x, labelY);

  ctx.fillStyle = theme.nodeSubLabel ?? 'rgba(34,32,43,0.45)';
  ctx.font      = `500 7px ${theme.font}`;
  const subY    = labelY + (isCenter ? 14 : 11);
  ctx.fillText(sub, x, subY);

  if (hasIPA) {
    ctx.fillStyle = theme.nodeSubLabel ?? 'rgba(34,32,43,0.45)';
    ctx.font      = `italic 400 ${isCenter ? 8 : 6}px ${theme.font}`;
    ctx.fillText(`/${node.ipa}/`, x, subY + (isCenter ? 10 : 8));
  }
}

/**
 * Draw a text-family node (given, surname, text, concept, referent, element, attestation).
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} node @param {number} x @param {number} y
 * @param {boolean} isCenter @param {object} theme
 */
export function drawNode(ctx, node, x, y, isCenter, theme) {
  ctx.save();
  ctx.globalAlpha = node._opacity ?? 1;

  switch (node.type) {
    case 'given':       drawGivenNode(ctx, node, x, y, isCenter, theme); break;
    case 'surname':     drawSurnameNode(ctx, node, x, y, isCenter, theme); break;
    case 'concept':     drawConcept(ctx, node, x, y, theme);     break;
    case 'referent':    drawReferent(ctx, node, x, y, theme);    break;
    case 'element':     drawElement(ctx, node, x, y, theme);     break;
    case 'attestation': drawAttestation(ctx, node, x, y, theme); break;
    default:            drawTextNode(ctx, node, x, y, isCenter, theme);
  }

  ctx.restore();
}

function drawGivenNode(ctx, node, x, y, isCenter, theme) {
  const popularity = node.popularity ?? 0.5;
  const r = (isCenter ? CENTER_R : NODE_R) * (0.7 + 0.6 * popularity);

  // Ring colour: gender accent if known, else etymology language colour
  let stroke = langColor(theme, node.lang);
  if (node.gender && theme.genderColors[node.gender]) stroke = theme.genderColors[node.gender];

  paintNameDisc(ctx, x, y, r, stroke, isCenter, theme);
  const sub = node.lang ? node.lang.toUpperCase() : 'GIVEN NAME';
  paintDiscText(ctx, node, x, y, isCenter, theme, { sub, popularity });
  drawNodeFlags(ctx, node, x, y, r, theme);
}

function drawTextNode(ctx, node, x, y, isCenter, theme) {
  const popularity = node.popularity ?? 0.5;
  const r = (isCenter ? CENTER_R : NODE_R) * (0.7 + 0.6 * popularity);
  const stroke = langColor(theme, node.lang);

  paintNameDisc(ctx, x, y, r, stroke, isCenter, theme);
  const sub = node.lang ? node.lang.toUpperCase() : node.type.toUpperCase();
  paintDiscText(ctx, node, x, y, isCenter, theme, { sub, popularity });
  drawNodeFlags(ctx, node, x, y, r, theme);
}

function drawSurnameNode(ctx, node, x, y, isCenter, theme) {
  const popularity = node.popularity ?? 0.5;
  const w = (isCenter ? 92 : 68) * (0.8 + 0.4 * popularity);
  const h = (isCenter ? 36 : 24) * (0.8 + 0.4 * popularity);
  const rx = x - w / 2, ry = y - h / 2;
  const approxR = Math.hypot(w, h) / 2.2;
  const stroke = langColor(theme, node.lang);

  // Soft drop shadow + paper card
  ctx.save();
  ctx.shadowColor   = theme.shadow ?? 'rgba(30,30,45,0.12)';
  ctx.shadowBlur    = isCenter ? 14 : 8;
  ctx.shadowOffsetY = 1.5;
  ctx.beginPath();
  ctx.roundRect(rx, ry, w, h, h / 2);
  ctx.fillStyle = theme.nodeFill ?? '#ffffff';
  ctx.fill();
  ctx.restore();

  ctx.beginPath();
  ctx.roundRect(rx, ry, w, h, h / 2);
  ctx.strokeStyle = stroke;
  ctx.lineWidth   = isCenter ? 2.4 : 1.6;
  ctx.setLineDash([]);
  ctx.stroke();

  const fontSize = isCenter ? 16 : ((node.label?.length ?? 0) > 7 ? 10 : 12);
  const scale    = fontSize * (0.85 + 0.3 * popularity);
  ctx.fillStyle    = theme.nodeLabel ?? '#22202b';
  ctx.font         = `700 ${scale}px ${theme.font}`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(node.label ?? '', x, y - 3);

  ctx.fillStyle = theme.nodeSubLabel ?? 'rgba(34,32,43,0.45)';
  ctx.font      = `500 6.5px ${theme.font}`;
  ctx.fillText('SURNAME', x, y + h / 2 - 5);

  drawFlagBadgeCluster(ctx, node.flags || node.countries, x, y, approxR, theme);
}

function drawConcept(ctx, node, x, y, theme) {
  const cfg = theme.nodeTypes.concept;
  ctx.beginPath();
  ctx.ellipse(x, y, 46, 17, 0, 0, Math.PI * 2);
  ctx.fillStyle   = cfg.fill;
  ctx.fill();
  ctx.strokeStyle = cfg.stroke;
  ctx.lineWidth   = 1.2;
  ctx.setLineDash(cfg.dash ?? [3, 2]);
  ctx.stroke();

  ctx.fillStyle    = cfg.stroke;
  ctx.font         = `italic 400 9px ${theme.font}`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(node.label ?? '', x, y - 3);

  ctx.fillStyle = theme.nodeSubLabel ?? 'rgba(34,32,43,0.45)';
  ctx.font      = `500 7px ${theme.font}`;
  ctx.setLineDash([]);
  ctx.fillText('CONCEPT', x, y + 10);
}

function drawReferent(ctx, node, x, y, theme) {
  const cfg = theme.nodeTypes.referent;
  ctx.beginPath();
  ctx.moveTo(x, y - 20);
  ctx.lineTo(x + 22, y);
  ctx.lineTo(x, y + 20);
  ctx.lineTo(x - 22, y);
  ctx.closePath();
  ctx.fillStyle   = cfg.fill;
  ctx.fill();
  ctx.strokeStyle = cfg.stroke;
  ctx.lineWidth   = 1.2;
  ctx.setLineDash(cfg.dash ?? [3, 2]);
  ctx.stroke();

  ctx.fillStyle    = cfg.stroke;
  ctx.font         = `400 8.5px ${theme.font}`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(node.label ?? '', x, y - 2);

  ctx.fillStyle = theme.nodeSubLabel ?? 'rgba(34,32,43,0.45)';
  ctx.font      = `500 6.5px ${theme.font}`;
  ctx.setLineDash([]);
  ctx.fillText('REFERENT', x, y + 12);
}

function drawElement(ctx, node, x, y, theme) {
  const stroke = langColor(theme, node.lang);
  ctx.save();
  ctx.globalAlpha *= theme.nodeTypes.element.opacity ?? 0.65;
  ctx.beginPath();
  ctx.roundRect(x - 44, y - 11, 88, 22, 11);
  ctx.fillStyle   = theme.nodeTypes.element.fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth   = 1;
  ctx.setLineDash([]);
  ctx.stroke();

  ctx.fillStyle    = stroke;
  ctx.font         = `italic 400 8px ${theme.font}`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(node.label ?? '', x, y + 3);
  ctx.restore();
}

function drawAttestation(ctx, node, x, y, theme) {
  ctx.beginPath();
  ctx.arc(x, y, 8, 0, Math.PI * 2);
  ctx.fillStyle   = theme.nodeTypes.attestation.fill;
  ctx.fill();
  ctx.strokeStyle = theme.nodeTypes.attestation.stroke;
  ctx.lineWidth   = 1.1;
  ctx.setLineDash([]);
  ctx.stroke();

  ctx.fillStyle    = theme.nodeTypes.attestation.stroke;
  ctx.font         = `500 6.5px ${theme.font}`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(node.label ?? '', x, y + 2.5);
}
