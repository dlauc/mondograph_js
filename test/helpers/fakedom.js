// Minimal DOM + canvas stand-in so MondoGraph can run under `node --test`.
// Only what the library touches is implemented.

function fakeCtx() {
  const ctx = {
    font: '10px sans-serif',
    measureText(text) {
      const m = /([\d.]+)px/.exec(this.font);
      const px = m ? parseFloat(m[1]) : 10;
      return { width: String(text).length * px * 0.55 };
    },
    createRadialGradient() { return { addColorStop() {} }; },
  };
  for (const k of ['save', 'restore', 'beginPath', 'closePath', 'moveTo', 'lineTo', 'arc', 'ellipse', 'rect',
    'roundRect', 'fill', 'stroke', 'fillRect', 'clearRect', 'fillText', 'strokeText', 'translate', 'rotate',
    'scale', 'setTransform', 'setLineDash', 'quadraticCurveTo', 'clip', 'drawImage']) ctx[k] = () => {};
  return ctx;
}

class FakeClassList {
  constructor(el) { this.el = el; }
  contains(c) { return (this.el.className || '').split(/\s+/).includes(c); }
  add(c) { if (!this.contains(c)) this.el.className = ((this.el.className || '') + ' ' + c).trim(); }
}

export class FakeElement {
  constructor(tag) {
    this.tagName = tag.toUpperCase();
    this.children = [];
    this.parentElement = null;
    this.style = { cssText: '' };
    this.dataset = {};
    this.attributes = {};
    this.className = '';
    this.classList = new FakeClassList(this);
    this.listeners = {};
    this.textContent = '';
    this.tabIndex = -1;
    this.offsetWidth = 800;
    this.offsetHeight = 600;
    if (tag === 'canvas') { this.width = 0; this.height = 0; this._ctx = fakeCtx(); }
  }
  getContext() { return this._ctx; }
  appendChild(c) {
    if (c.parentElement) c.remove();
    c.parentElement = this;
    this.children.push(c);
    return c;
  }
  remove() {
    const p = this.parentElement;
    if (!p) return;
    p.children = p.children.filter(x => x !== this);
    this.parentElement = null;
    if (globalThis.document.activeElement === this || this.contains(globalThis.document.activeElement)) {
      globalThis.document.activeElement = null;
    }
  }
  contains(o) {
    if (!o) return false;
    for (let n = o; n; n = n.parentElement) if (n === this) return true;
    return false;
  }
  setAttribute(k, v) { this.attributes[k] = String(v); }
  getAttribute(k) { return this.attributes[k] ?? null; }
  removeAttribute(k) { delete this.attributes[k]; }
  addEventListener(t, fn) { (this.listeners[t] ??= []).push(fn); }
  removeEventListener(t, fn) { this.listeners[t] = (this.listeners[t] ?? []).filter(f => f !== fn); }
  dispatch(type, ev = {}) {
    const e = { type, target: this, preventDefault() { this.defaultPrevented = true; }, ...ev };
    for (let n = this; n; n = n.parentElement) for (const fn of n.listeners[type] ?? []) fn(e);
    return e;
  }
  focus() {
    const prev = globalThis.document.activeElement;
    if (prev === this) return;
    globalThis.document.activeElement = this;
    this.dispatch('focusin', { relatedTarget: prev });
  }
  getBoundingClientRect() { return { left: 0, top: 0, width: this.offsetWidth, height: this.offsetHeight }; }
  *walk() { for (const c of this.children) { yield c; yield* c.walk(); } }
  querySelectorAll(sel) {
    // supports "tag.class", ".class", "tag.class[data-x=\"v\"]"
    const m = /^([a-z]*)((?:\.[\w-]+)*)(?:\[data-([\w-]+)="(.*)"\])?$/.exec(sel);
    if (!m) return [];
    const tag = m[1].toUpperCase(), classes = m[2].split('.').filter(Boolean);
    const key = m[3] && m[3].replace(/-(\w)/g, (_, c) => c.toUpperCase());
    return [...this.walk()].filter(el =>
      (!tag || el.tagName === tag) && classes.every(c => el.classList.contains(c))
      && (!key || el.dataset[key] === m[4].replace(/\\(.)/g, '$1')));
  }
  querySelector(sel) { return this.querySelectorAll(sel)[0] ?? null; }
}

export function installFakeDom() {
  const document = {
    activeElement: null,
    createElement: (t) => new FakeElement(t),
    querySelector: () => null,
  };
  globalThis.document = document;
  globalThis.window = { devicePixelRatio: 1, matchMedia: () => ({ matches: false, addEventListener() {}, removeEventListener() {} }) };
  globalThis.getComputedStyle = (el) => ({
    position: 'relative',
    getPropertyValue: (name) => (el.cssVars ?? {})[name] ?? '',
  });
  globalThis.ResizeObserver = class { observe() {} disconnect() {} };
  globalThis.requestAnimationFrame = () => 0;
  globalThis.cancelAnimationFrame = () => {};
  return document;
}

export function makeContainer() {
  const el = new FakeElement('div');
  el.cssVars = {};
  return el;
}
