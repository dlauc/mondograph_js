import { langColor } from '../theme.js';

const CENTER_R = 38;
const NODE_R   = 22;

/**
 * Draw a text-family node (text, concept, referent, element, attestation).
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
    case 'concept':     drawConcept(ctx, node, x, y, theme);     break;
    case 'referent':    drawReferent(ctx, node, x, y, theme);    break;
    case 'element':     drawElement(ctx, node, x, y, theme);     break;
    case 'attestation': drawAttestation(ctx, node, x, y, theme); break;
    default:            drawText(ctx, node, x, y, isCenter, theme);
  }

  ctx.restore();
}

function drawText(ctx, node, x, y, isCenter, theme) {
  const r      = isCenter ? CENTER_R : NODE_R;
  const stroke = langColor(theme, node.lang);

  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fillStyle = theme.nodeTypes.text.fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth   = isCenter ? 2.5 : 1.7;
  ctx.setLineDash([]);
  ctx.stroke();

  const fontSize   = isCenter ? 19 : (node.label.length > 7 ? 10 : 13);
  const fontWeight = isCenter ? 700 : 500;
  ctx.fillStyle    = isCenter ? stroke : '#A8E0DE';
  ctx.font         = `${fontWeight} ${fontSize}px ${theme.font}`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(node.label, x, y - (isCenter ? 4 : 3));

  const sub = node.lang ? node.lang.toUpperCase() : node.type.toUpperCase();
  ctx.fillStyle    = isCenter ? 'rgba(2,185,185,.5)' : 'rgba(255,255,255,.22)';
  ctx.font         = `400 7px ${theme.font}`;
  ctx.textBaseline = 'middle';
  ctx.fillText(sub, x, y + (isCenter ? 13 : 11));
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
  ctx.font         = `italic 9px ${theme.font}`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(node.label, x, y - 3);

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
  ctx.fillText(node.label, x, y - 2);

  ctx.fillStyle = 'rgba(193,107,154,.5)';
  ctx.font      = `400 6.5px ${theme.font}`;
  ctx.fillText('REFERENT', x, y + 12);
}

function drawElement(ctx, node, x, y, theme) {
  const stroke = langColor(theme, node.lang);
  ctx.save();
  ctx.globalAlpha *= theme.nodeTypes.element.opacity ?? 0.6;
  ctx.beginPath();
  ctx.rect(x - 44, y - 11, 88, 22);
  ctx.fillStyle   = theme.nodeTypes.element.fill;
  ctx.fill();
  ctx.strokeStyle = stroke;
  ctx.lineWidth   = 1;
  ctx.setLineDash([]);
  ctx.stroke();

  ctx.fillStyle    = stroke;
  ctx.font         = `italic 8px ${theme.font}`;
  ctx.textAlign    = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(node.label, x, y + 3);
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
  ctx.fillText(node.label, x, y + 2.5);
}
