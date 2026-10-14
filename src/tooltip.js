const STYLE = [
  'position:absolute',
  'pointer-events:none',
  'top:0', 'left:0',
  'background:#011838',
  'border:1px solid rgba(2,185,185,.25)',
  'border-left:3px solid #02b9b9',
  'padding:8px 12px',
  'font-family:"Noto Sans",sans-serif',
  'font-size:12px',
  'color:#fff',
  'max-width:220px',
  'line-height:1.5',
  'z-index:10',
  'opacity:0',
  'transition:opacity .15s',
].join(';');

export function escapeHtml(s) {
  return String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}

function defaultRender(node) {
  const sub = node.lang
    ? `<div style="font-size:10px;opacity:.45;text-transform:uppercase;letter-spacing:.06em;margin-top:2px">${escapeHtml(node.lang)} · ${escapeHtml(node.type)}</div>`
    : '';
  const ipa = node.meta?.ipa
    ? `<div style="color:#02b9b9;font-size:11px;margin-top:2px">${escapeHtml(node.meta.ipa)}</div>`
    : '';
  const q = node.quality != null
    ? `<span style="font-size:9px;background:rgba(2,185,185,.1);color:#02b9b9;padding:1px 4px;margin-top:4px;display:inline-block">quality: ${escapeHtml(node.quality)}</span>`
    : '';
  return `<strong>${escapeHtml(node.label)}</strong>${sub}${ipa}${q}`;
}

export class Tooltip {
  constructor(container) {
    this._el = document.createElement('div');
    this._el.style.cssText = STYLE;
    container.appendChild(this._el);
    this._renderFn = defaultRender;
    this._W = 0;
    this._H = 0;
  }

  /** Override the default HTML renderer. */
  setRenderFn(fn) { this._renderFn = fn; }

  /** Update container dimensions (call after resize). */
  setContainerSize(W, H) { this._W = W; this._H = H; }

  show(node, canvasX, canvasY) {
    this.showHTML(this._renderFn(node), canvasX, canvasY);
  }

  /** Show caller-rendered HTML (already escaped) at a canvas position. */
  showHTML(html, canvasX, canvasY) {
    if (!html) { this.hide(); return; }
    this._el.innerHTML = html;
    let x = canvasX + 28, y = canvasY - 10;
    if (this._W && x + 230 > this._W) x = canvasX - 240;
    if (this._H && y + 100 > this._H) y = Math.max(0, this._H - 110);
    this._el.style.transform = `translate(${x}px,${y}px)`;
    this._el.style.opacity   = '1';
  }

  hide() { this._el.style.opacity = '0'; }

  destroy() { this._el.remove(); }
}
