import { langColor } from '../theme.js';
import { drawFlagBadgeCluster, drawFlagOrb } from './flag.js';

const CENTER_R = 38;
const NODE_R   = 22;

// ISO 3166-1 alpha-2 → accent color for country glow & floating labels
const COUNTRY_COLORS = {
  HR:'#60a5fa', RS:'#818cf8', CZ:'#38bdf8', SK:'#a78bfa', BG:'#c4b5fd',
  MK:'#ddd6fe', PL:'#93c5fd', SI:'#7dd3fc', BA:'#2dd4bf', ME:'#0d9488',
  EG:'#84cc16', SA:'#a3e635', MA:'#bef264', DZ:'#d9f99d', LB:'#34d399',
  NG:'#4ade80', SN:'#86efac', TZ:'#34d399', ET:'#10b981',
  TR:'#22d3ee', AZ:'#67e8f9', IR:'#2dd4bf',
  DE:'#fb923c', AT:'#f97316', CH:'#fdba74',
  FR:'#c084fc', BE:'#a855f7', CA:'#e879f9',
  IT:'#f472b6', ES:'#f43f5e',
  GB:'#7dd3fc', US:'#38bdf8', AU:'#0ea5e9',
  RU:'#818cf8', UA:'#fbbf24',
  JP:'#fb7185', KR:'#f43f5e',
  ID:'#facc15', PK:'#fbbf24', BD:'#f59e0b',
  NL:'#f97316', SE:'#fbbf24', NO:'#fb923c',
};

function getCountryEntries(node) {
  if (!node.countriesData) return [];
  return Object.entries(node.countriesData)
    .filter(([k]) => k !== 'world')
    .map(([iso, data]) => ({ iso: iso.toUpperCase(), bearers: data?.bearers ?? 0 }))
    .filter(e => e.bearers > 0)
    .sort((a, b) => b.bearers - a.bearers)
    .slice(0, 6);
}

function drawCountryGlows(ctx, node, x, y, r) {
  const entries = getCountryEntries(node);
  if (entries.length === 0) return;
  const maxB = entries[0].bearers;
  ctx.save();
  entries.forEach((e, i) => {
    const angle = (i / entries.length) * Math.PI * 2 - Math.PI / 2;
    const gx = x + Math.cos(angle) * (r * 0.45);
    const gy = y + Math.sin(angle) * (r * 0.45);
    const ratio = Math.sqrt(e.bearers / maxB);
    const color = COUNTRY_COLORS[e.iso] ?? '#64748b';
    const alpha = Math.round(0x1a + ratio * 0x2e).toString(16).padStart(2, '0');
    const glowR = r * (1.1 + ratio * 0.55);
    const grad = ctx.createRadialGradient(gx, gy, 0, gx, gy, glowR);
    grad.addColorStop(0, color + alpha);
    grad.addColorStop(1, color + '00');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(gx, gy, glowR, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();
}

function drawCountryLabels(ctx, node, x, y, r, theme) {
  const entries = getCountryEntries(node);
  if (entries.length === 0) return;
  const maxB = entries[0].bearers;
  entries.forEach((e, i) => {
    const angle = (i / entries.length) * Math.PI * 2 - Math.PI / 2;
    const ratio = Math.sqrt(e.bearers / maxB);
    const badgeR = Math.max(4, 4 + ratio * 4);  // 4–8 px, biggest country = biggest badge
    const dist = r + badgeR + 5;
    const lx = x + Math.cos(angle) * dist;
    const ly = y + Math.sin(angle) * dist;
    drawFlagOrb(ctx, e.iso, lx, ly, badgeR, theme);
  });
}

/**
 * Draw a text-family node (given, surname, text, concept, referent, element, attestation).
 * @param {CanvasRenderingContext2D} ctx
 * @param {object} node         node data (id, label, type, lang, _opacity)
 * @param {number} x            centre x (logical px)
 * @param {number} y            centre y (logical px)
 * @param {boolean} isCenter
 * @param {object} theme        resolveTheme() output
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
    default:            drawText(ctx, node, x, y, isCenter, theme);
  }

  ctx.restore();
}

function drawGivenNode(ctx, node, x, y, isCenter, theme) {
  const popularity = node.popularity ?? 0.5;
  const baseR = isCenter ? CENTER_R : NODE_R;
  const r = baseR * (0.7 + 0.6 * popularity);

  // Country heat glows behind everything
  drawCountryGlows(ctx, node, x, y, r);

  // Resolve outline color: gender-specific or language-specific
  let stroke = langColor(theme, node.lang);
  if (node.gender && theme.genderColors[node.gender]) {
    stroke = theme.genderColors[node.gender];
  }

  // Glowing backing aura
  ctx.save();
  const glowGrad = ctx.createRadialGradient(x, y, r - 5, x, y, r + (isCenter ? 12 : 6));
  glowGrad.addColorStop(0, stroke + '44');
  glowGrad.addColorStop(1, stroke + '00');
  ctx.fillStyle = glowGrad;
  ctx.beginPath();
  ctx.arc(x, y, r + (isCenter ? 12 : 6), 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // Draw node body
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = theme.nodeTypes.given.fill || '#020f20';
  ctx.fill();

  // Draw crisp outline
  ctx.strokeStyle = stroke;
  ctx.lineWidth   = isCenter ? 2.6 : 1.8;
  ctx.setLineDash([]);
  ctx.stroke();

  const hasIPA = !!node.ipa;
  const fontSize  = isCenter ? 19 : ((node.label?.length ?? 0) > 7 ? 10 : 13);
  const scaleSize = fontSize * (0.8 + 0.4 * popularity);

  // Shift label up when IPA is present to keep all text inside the circle
  const labelY = y - (isCenter ? (hasIPA ? 9 : 4) : (hasIPA ? 7 : 3));

  ctx.fillStyle    = isCenter ? stroke : '#A8E0DE';
  ctx.font         = `700 ${scaleSize}px ${theme.font}`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(node.label ?? '', x, labelY);

  const sub = node.lang ? node.lang.toUpperCase() : 'GIVEN NAME';
  ctx.fillStyle = isCenter ? 'rgba(2,185,185,.5)' : 'rgba(255,255,255,.22)';
  ctx.font      = `400 7px ${theme.font}`;
  const subY    = labelY + (isCenter ? 14 : 11);
  ctx.fillText(sub, x, subY);

  // IPA pronunciation for non-Latin scripts
  if (hasIPA) {
    ctx.fillStyle = stroke + 'aa';
    ctx.font      = `italic 400 ${isCenter ? 8 : 6}px ${theme.font}`;
    ctx.fillText(`/${node.ipa}/`, x, subY + (isCenter ? 10 : 8));
  }

  // Floating country ISO labels (replace flag badges when country data present)
  if (node.countriesData) {
    drawCountryLabels(ctx, node, x, y, r, theme);
  } else {
    drawFlagBadgeCluster(ctx, node.flags || node.countries, x, y, r, theme);
  }
}

function drawSurnameNode(ctx, node, x, y, isCenter, theme) {
  const popularity = node.popularity ?? 0.5;
  const baseW = isCenter ? 92 : 68;
  const baseH = isCenter ? 36 : 24;
  const w = baseW * (0.8 + 0.4 * popularity);
  const h = baseH * (0.8 + 0.4 * popularity);
  const rx = x - w / 2;
  const ry = y - h / 2;
  const approxR = Math.hypot(w, h) / 2.2;

  const stroke = langColor(theme, node.lang);

  // Soft card glow
  ctx.save();
  ctx.shadowColor = stroke;
  ctx.shadowBlur = isCenter ? 12 : 6;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  // Draw rounded card
  ctx.beginPath();
  ctx.roundRect(rx, ry, w, h, h / 2);
  ctx.fillStyle = theme.nodeTypes.surname.fill || '#020f20';
  ctx.fill();

  ctx.strokeStyle = stroke;
  ctx.lineWidth   = isCenter ? 2.5 : 1.7;
  ctx.setLineDash([]);
  ctx.stroke();
  ctx.restore();

  // Name Label
  const fontSize   = isCenter ? 16 : ((node.label?.length ?? 0) > 7 ? 9.5 : 12);
  const scaleSize  = fontSize * (0.8 + 0.4 * popularity);
  ctx.fillStyle    = '#FFFFFF';
  ctx.font         = `700 ${scaleSize}px ${theme.font}`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(node.label ?? '', x, y - 3);

  // Sub Label
  ctx.fillStyle    = 'rgba(255,255,255,.3)';
  ctx.font         = `400 6.5px ${theme.font}`;
  ctx.fillText('SURNAME', x, y + h / 2 - 5);

  // Multi-flag badges
  drawFlagBadgeCluster(ctx, node.flags || node.countries, x, y, approxR, theme);
}

function drawText(ctx, node, x, y, isCenter, theme) {
  const popularity = node.popularity ?? 0.5;
  const baseR = isCenter ? CENTER_R : NODE_R;
  const r = baseR * (0.7 + 0.6 * popularity);
  const stroke = langColor(theme, node.lang);

  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = theme.nodeTypes.text.fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth   = isCenter ? 2.5 : 1.7;
  ctx.setLineDash([]);
  ctx.stroke();

  const fontSize   = isCenter ? 19 : ((node.label?.length ?? 0) > 7 ? 10 : 13);
  const scaleSize  = fontSize * (0.8 + 0.4 * popularity);
  const fontWeight = isCenter ? 700 : 500;
  ctx.fillStyle    = isCenter ? stroke : '#A8E0DE';
  ctx.font         = `${fontWeight} ${scaleSize}px ${theme.font}`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(node.label ?? '', x, y - (isCenter ? 4 : 3));

  const sub = node.lang ? node.lang.toUpperCase() : node.type.toUpperCase();
  ctx.fillStyle    = isCenter ? 'rgba(2,185,185,.5)' : 'rgba(255,255,255,.22)';
  ctx.font         = `400 7px ${theme.font}`;
  ctx.textBaseline = 'middle';
  ctx.fillText(sub, x, y + (isCenter ? 13 : 11));

  // Multi-flag badges
  drawFlagBadgeCluster(ctx, node.flags || node.countries, x, y, r, theme);
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

  ctx.fillStyle = 'rgba(232,184,75,.45)';
  ctx.font      = `400 7px ${theme.font}`;
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

  ctx.fillStyle = 'rgba(193,107,154,.5)';
  ctx.font      = `400 6.5px ${theme.font}`;
  ctx.fillText('REFERENT', x, y + 12);
}

function drawElement(ctx, node, x, y, theme) {
  const stroke = langColor(theme, node.lang);
  ctx.save();
  ctx.globalAlpha *= theme.nodeTypes.element.opacity ?? 0.6;
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
