// Vector snapshot: turns a scene snapshot (positions already resolved by the
// renderer) into a standalone SVG string. Pure: no DOM needed.

export function escapeXml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&apos;' }[c]));
}

const f = (v) => Math.round(v * 10) / 10;

/**
 * @param {{W:number, H:number, background:string, font:string,
 *   hulls:Array<{d:string, color:string, alpha:number, label?:string, lx?:number, ly?:number}>,
 *   edges:Array<{x1,y1,x2,y2, stroke, width, dash:number[], alpha, arrow?:boolean, strike?:boolean, uncertain?:boolean, label?:string}>,
 *   nodes:Array<{id, x, y, r, shape?:'circle'|'pill', w?:number, h?:number, fill, stroke, strokeWidth?:number,
 *     label?:string, labelX?:number, labelY?:number, labelSize?:number, ink:string, sub?:string, subInk?:string, alpha?:number}>,
 *   chips:Array<{x,y,w,h,label, fill, stroke, ink}>}} scene
 * @returns {string}
 */
export function sceneToSVG(scene) {
  const out = [];
  const font = escapeXml(scene.font ?? 'sans-serif');
  out.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${f(scene.W)}" height="${f(scene.H)}" viewBox="${f(scene.vx ?? 0)} ${f(scene.vy ?? 0)} ${f(scene.W)} ${f(scene.H)}" font-family="${font}">`);
  out.push(`<rect x="${f(scene.vx ?? 0)}" y="${f(scene.vy ?? 0)}" width="${f(scene.W)}" height="${f(scene.H)}" fill="${escapeXml(scene.background)}"/>`);

  out.push('<g class="mg-hulls">');
  for (const h of scene.hulls ?? []) {
    out.push(`<path d="${h.d}" fill="${escapeXml(h.color)}" fill-opacity="${f(h.alpha)}" stroke="${escapeXml(h.color)}" stroke-opacity="${f(Math.min(1, h.alpha * 3))}" stroke-width="1"/>`);
    if (h.label) out.push(`<text x="${f(h.lx)}" y="${f(h.ly - 4)}" text-anchor="middle" font-size="10" font-weight="600" fill="${escapeXml(h.color)}">${escapeXml(h.label)}</text>`);
  }
  out.push('</g>');

  out.push('<g class="mg-edges">');
  for (const e of scene.edges ?? []) {
    const dash = e.dash && e.dash.length ? ` stroke-dasharray="${e.dash.join(' ')}"` : '';
    out.push(`<line x1="${f(e.x1)}" y1="${f(e.y1)}" x2="${f(e.x2)}" y2="${f(e.y2)}" stroke="${escapeXml(e.stroke)}" stroke-width="${f(e.width)}" stroke-opacity="${f(e.alpha ?? 1)}"${dash}/>`);
    if (e.arrow) {
      const a = Math.atan2(e.y2 - e.y1, e.x2 - e.x1), s = 7;
      const p = (dx, dy) => `${f(e.x2 + dx * Math.cos(a) - dy * Math.sin(a))},${f(e.y2 + dx * Math.sin(a) + dy * Math.cos(a))}`;
      out.push(`<polygon points="${p(0, 0)} ${p(-s, s / 2)} ${p(-s, -s / 2)}" fill="${escapeXml(e.stroke)}" fill-opacity="${f(e.alpha ?? 1)}"/>`);
    }
    const mx = (e.x1 + e.x2) / 2, my = (e.y1 + e.y2) / 2;
    if (e.strike) {
      const len = Math.hypot(e.x2 - e.x1, e.y2 - e.y1) || 1;
      const px = -(e.y2 - e.y1) / len * 6, py = (e.x2 - e.x1) / len * 6;
      out.push(`<line x1="${f(mx + px)}" y1="${f(my + py)}" x2="${f(mx - px)}" y2="${f(my - py)}" stroke="${escapeXml(e.stroke)}" stroke-width="1.6"/>`);
    }
    if (e.uncertain) {
      out.push(`<circle cx="${f(mx)}" cy="${f(my)}" r="6.5" fill="${escapeXml(scene.background)}" stroke="${escapeXml(e.stroke)}"/>`);
      out.push(`<text x="${f(mx)}" y="${f(my + 3)}" text-anchor="middle" font-size="9" font-weight="700" fill="${escapeXml(e.stroke)}">?</text>`);
    }
    if (e.label) out.push(`<text x="${f(mx)}" y="${f(my - 8)}" text-anchor="middle" font-size="10" fill="${escapeXml(scene.ink)}">${escapeXml(e.label)}</text>`);
  }
  out.push('</g>');

  out.push('<g class="mg-nodes">');
  for (const n of scene.nodes ?? []) {
    const op = n.alpha != null && n.alpha < 1 ? ` opacity="${f(n.alpha)}"` : '';
    out.push(`<g data-id="${escapeXml(n.id)}"${op}>`);
    if (n.shape === 'pill') {
      out.push(`<rect x="${f(n.x - n.w / 2)}" y="${f(n.y - n.h / 2)}" width="${f(n.w)}" height="${f(n.h)}" rx="${f(n.h / 2)}" fill="${escapeXml(n.fill)}" stroke="${escapeXml(n.stroke)}" stroke-width="${f(n.strokeWidth ?? 1.4)}"/>`);
    } else {
      out.push(`<circle cx="${f(n.x)}" cy="${f(n.y)}" r="${f(n.r)}" fill="${escapeXml(n.fill)}" stroke="${escapeXml(n.stroke)}" stroke-width="${f(n.strokeWidth ?? 1.6)}"/>`);
    }
    if (n.label) {
      out.push(`<text x="${f(n.labelX ?? n.x)}" y="${f(n.labelY ?? n.y)}" text-anchor="middle" dominant-baseline="middle" font-size="${f(n.labelSize ?? 12)}" font-weight="700" fill="${escapeXml(n.ink)}">${escapeXml(n.label)}</text>`);
    }
    if (n.sub) {
      out.push(`<text x="${f(n.x)}" y="${f(n.subY ?? n.y + 11)}" text-anchor="middle" dominant-baseline="middle" font-size="7" font-weight="500" fill="${escapeXml(n.subInk ?? n.ink)}">${escapeXml(n.sub)}</text>`);
    }
    out.push('</g>');
  }
  out.push('</g>');

  out.push('<g class="mg-chips">');
  for (const c of scene.chips ?? []) {
    out.push(`<rect x="${f(c.x)}" y="${f(c.y)}" width="${f(c.w)}" height="${f(c.h)}" rx="${f(c.h / 2)}" fill="${escapeXml(c.fill)}" stroke="${escapeXml(c.stroke)}" stroke-width="0.9"/>`);
    out.push(`<text x="${f(c.x + c.w / 2)}" y="${f(c.y + c.h / 2)}" text-anchor="middle" dominant-baseline="middle" font-size="9" fill="${escapeXml(c.ink)}">${escapeXml(c.label)}</text>`);
  }
  out.push('</g>');
  out.push('</svg>');
  return out.join('\n');
}
