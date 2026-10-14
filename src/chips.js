// Chips: small pills around a node (e.g. the F1 "same name, other spelling"
// assertions). Each chip is hit-testable on its own.
//
// Chip schema: { id, label, assertionId?, status? ('open'|'disputed'|'suppressed') }

export const CHIP_H = 15;
export const CHIP_FONT_PX = 9;

/**
 * Lay out a node's chips in centred rows under the node.
 * At most `max` chips are shown; the rest fold into an overflow chip
 * `{id:'+more', label:'+k', overflow:true, count:k, hidden:[chips]}`.
 *
 * @param {object[]} chips
 * @param {number} x @param {number} y  node centre (world px)
 * @param {number} r  node visual radius
 * @param {{max?:number, measure:(text:string)=>number, showSuppressed?:boolean,
 *   rowWidth?:number, gap?:number, padX?:number}} opts
 * @returns {Array<{chip:object, x:number, y:number, w:number, h:number}>}  x,y = top-left
 */
export function layoutChips(chips, x, y, r, opts) {
  if (!chips || !chips.length) return [];
  const max = opts.max ?? 4;
  const gap = opts.gap ?? 3;
  const padX = opts.padX ?? 5;
  const h = CHIP_H;
  const shown = chips.filter(c => c && (opts.showSuppressed || (c.status !== 'suppressed' && c.status !== 'excluded')));
  if (!shown.length) return [];
  let list = shown;
  if (shown.length > max) {
    const keep = shown.slice(0, Math.max(0, max - 1));
    const rest = shown.slice(keep.length);
    list = [...keep, { id: '+more', label: `+${rest.length}`, overflow: true, count: rest.length, hidden: rest }];
  }
  const items = list.map(c => ({ chip: c, w: Math.ceil(opts.measure(String(c.label ?? '')) + padX * 2), h }));
  const rowWidth = opts.rowWidth ?? Math.max(2 * r + 48, 120);
  const rows = [];
  let cur = [], curW = 0;
  for (const it of items) {
    const add = (cur.length ? gap : 0) + it.w;
    if (cur.length && curW + add > rowWidth) { rows.push({ items: cur, w: curW }); cur = []; curW = 0; }
    curW += (cur.length ? gap : 0) + it.w;
    cur.push(it);
  }
  if (cur.length) rows.push({ items: cur, w: curW });
  const out = [];
  let top = y + r + 5;
  for (const row of rows) {
    let left = x - row.w / 2;
    for (const it of row.items) {
      out.push({ chip: it.chip, x: left, y: top, w: it.w, h });
      left += it.w + gap;
    }
    top += h + gap;
  }
  return out;
}

/**
 * Hit-test chip boxes (front-most last). `pad` widens each box (touch).
 * @param {number} px @param {number} py
 * @param {Array<{nodeId:string, chip:object, x,y,w,h}>} boxes
 * @param {number} [pad=0]
 * @returns {{nodeId:string, chip:object}|null}
 */
export function hitTestChips(px, py, boxes, pad = 0) {
  for (let i = boxes.length - 1; i >= 0; i--) {
    const b = boxes[i];
    if (px >= b.x - pad && px <= b.x + b.w + pad && py >= b.y - pad && py <= b.y + b.h + pad) {
      return { nodeId: b.nodeId, chip: b.chip };
    }
  }
  return null;
}

/** Paint one chip box. */
export function drawChip(ctx, box, theme, state = {}) {
  const { x, y, w, h, chip } = box;
  const active = state.active;
  ctx.save();
  ctx.setLineDash(chip.overflow ? [2, 2] : []);
  ctx.beginPath();
  if (ctx.roundRect) ctx.roundRect(x, y, w, h, h / 2); else ctx.rect(x, y, w, h);
  ctx.fillStyle = active ? (theme.accent ?? theme.centerGlow) : (theme.chipFill ?? theme.nodeFill ?? '#fff');
  ctx.fill();
  ctx.lineWidth = active ? 1.4 : 0.9;
  ctx.strokeStyle = active ? (theme.accent ?? theme.centerGlow) : (theme.chipStroke ?? theme.badgeBorder ?? 'rgba(20,20,30,0.2)');
  ctx.stroke();
  ctx.fillStyle = active ? (theme.chipActiveInk ?? '#fff') : (theme.chipInk ?? theme.nodeLabel ?? '#22202b');
  ctx.font = `500 ${CHIP_FONT_PX}px ${theme.font}`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(String(chip.label ?? ''), x + w / 2, y + h / 2 + 0.5);
  if (chip.status === 'disputed' || chip.status === 'suppressed' || chip.status === 'excluded') {
    ctx.beginPath();
    ctx.moveTo(x + 4, y + h / 2);
    ctx.lineTo(x + w - 4, y + h / 2);
    ctx.lineWidth = 1;
    ctx.strokeStyle = ctx.fillStyle;
    ctx.stroke();
  }
  ctx.restore();
}

/** Draw many (inactive) chips with one fill, one stroke and one font per opacity bucket. */
export function drawChipBatch(ctx, boxes, theme) {
  const buckets = new Map();
  for (const b of boxes) {
    const a = Math.round((b.opacity ?? 1) * 20) / 20;
    if (a <= 0) continue;
    let l = buckets.get(a);
    if (!l) buckets.set(a, l = []);
    l.push(b);
  }
  const rr = (b) => { if (ctx.roundRect) ctx.roundRect(b.x, b.y, b.w, b.h, b.h / 2); else ctx.rect(b.x, b.y, b.w, b.h); };
  ctx.save();
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.font = `500 ${CHIP_FONT_PX}px ${theme.font}`;
  for (const [a, list] of buckets) {
    ctx.globalAlpha = a;
    ctx.beginPath();
    for (const b of list) rr(b);
    ctx.fillStyle = theme.chipFill ?? theme.nodeFill ?? '#fff';
    ctx.fill();
    ctx.lineWidth = 0.9;
    ctx.strokeStyle = theme.chipStroke ?? theme.badgeBorder ?? 'rgba(20,20,30,0.2)';
    ctx.beginPath();
    let dashed = false;
    for (const b of list) { if (b.chip.overflow) dashed = true; else rr(b); }
    ctx.setLineDash([]);
    ctx.stroke();
    if (dashed) {
      ctx.beginPath();
      for (const b of list) if (b.chip.overflow) rr(b);
      ctx.setLineDash([2, 2]);
      ctx.stroke();
      ctx.setLineDash([]);
    }
    ctx.fillStyle = theme.chipInk ?? theme.nodeLabel ?? '#22202b';
    let struck = false;
    for (const b of list) {
      ctx.fillText(String(b.chip.label ?? ''), b.x + b.w / 2, b.y + b.h / 2 + 0.5);
      const st = b.chip.status;
      if (st === 'disputed' || st === 'suppressed' || st === 'excluded') struck = true;
    }
    if (struck) {
      ctx.beginPath();
      for (const b of list) {
        const st = b.chip.status;
        if (st !== 'disputed' && st !== 'suppressed' && st !== 'excluded') continue;
        ctx.moveTo(b.x + 4, b.y + b.h / 2); ctx.lineTo(b.x + b.w - 4, b.y + b.h / 2);
      }
      ctx.lineWidth = 1;
      ctx.strokeStyle = ctx.fillStyle;
      ctx.stroke();
    }
  }
  ctx.restore();
}
