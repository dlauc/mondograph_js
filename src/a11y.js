// Accessibility: a DOM mirror of the canvas.
//
// A visually hidden, focusable structure kept in sync with the scene:
//   div[role=application]  ← keyboard model lives here
//     ul > li[data-id] > button.mg-node      (roving tabindex: one is 0)
//                      + button.mg-edge / button.mg-chip (only for the
//                        focused node; Tab reaches them)
//   div[role=status][aria-live=polite]      ← announcements
//
// Keys on a node:  ←/→ previous/next neighbour of the anchor,
//                  ↓ step into the focused node's neighbours, ↑ step back out,
//                  Home centre, Enter/Space re-centre (or expand a stub),
//                  Esc back().
// Keys on an edge/chip: Enter/Space activate (onEdgeSelect / onChipSelect),
//                  Esc returns to its node.

const HIDDEN = [
  'position:absolute', 'width:1px', 'height:1px', 'margin:-1px', 'padding:0',
  'overflow:hidden', 'clip:rect(0 0 0 0)', 'clip-path:inset(50%)',
  'white-space:nowrap', 'border:0',
].join(';');

export function defaultDescribeNode(node, ctx = {}) {
  const parts = [String(node.label ?? node.id)];
  if (node.type === 'stub') parts[0] = `${node.count ?? ''} more ${node.family ?? ''}`.replace(/\s+/g, ' ').trim();
  if (ctx.isCenter) parts.push('centre');
  if (ctx.edge && ctx.anchor) parts.push(ctx.describeEdge ? ctx.describeEdge(ctx.edge, ctx) : defaultDescribeEdge(ctx.edge, ctx));
  else if (node.lang) parts.push(String(node.lang));
  if (ctx.index != null && ctx.total != null) parts.push(`${ctx.index} of ${ctx.total}`);
  return parts.join(', ');
}

export function defaultDescribeEdge(edge, ctx = {}) {
  const other = ctx.anchor ? ctx.anchor.label ?? ctx.anchor.id : null;
  const rel = edge.label ?? String(edge.family ?? edge.type ?? 'related').replace(/[-_]/g, ' ');
  const extra = [];
  if (edge.provenance) extra.push(edge.provenance);
  if (edge.certainty === 'uncertain') extra.push('uncertain');
  if (edge.status && edge.status !== 'open') extra.push(edge.status);
  return (other ? `${rel} ${other}` : rel) + (extra.length ? ` (${extra.join(', ')})` : '');
}

export class A11yMirror {
  /**
   * @param {HTMLElement} container
   * @param {object} host  callbacks: getScene(), neighbours(id), recentre(id),
   *   back(), activateEdge(edge), activateChip(node, chip), setFocus(id|null),
   *   setFocusedEdge(id|null), setFocusedChip(nodeId, chipId|null)
   * @param {{label?:string, describeNode?:Function, describeEdge?:Function, drawerId?:string}} opts
   */
  constructor(container, host, opts = {}) {
    this.host = host;
    this.opts = opts;
    this.root = document.createElement('div');
    this.root.className = 'mg-a11y';
    this.root.setAttribute('role', 'application');
    this.root.setAttribute('aria-roledescription', opts.roleDescription ?? 'graph');
    this.root.setAttribute('aria-label', opts.label ?? 'Graph');
    this.root.style.cssText = HIDDEN;
    this.list = document.createElement('ul');
    this.list.setAttribute('role', 'list');
    this.root.appendChild(this.list);
    this.live = document.createElement('div');
    this.live.setAttribute('role', 'status');
    this.live.setAttribute('aria-live', 'polite');
    this.live.setAttribute('aria-atomic', 'true');
    this.live.style.cssText = HIDDEN;
    container.appendChild(this.root);
    container.appendChild(this.live);

    this.items = new Map();      // id → {li, btn}
    this.focusId = null;
    this.anchorId = null;
    this.anchorStack = [];
    this._liveTimer = null;

    this._onKey = (e) => this._key(e);
    this._onFocusIn = (e) => this._focusIn(e);
    this._onFocusOut = (e) => {
      if (!this.root.contains(e.relatedTarget)) { this.host.setFocusedEdge(null); this.host.setFocusedChip(null, null); }
    };
    this.root.addEventListener('keydown', this._onKey);
    this.root.addEventListener('focusin', this._onFocusIn);
    this.root.addEventListener('focusout', this._onFocusOut);
  }

  get hasFocus() { return typeof document !== 'undefined' && this.root.contains(document.activeElement); }

  _describeNode(node, ctx) {
    const fn = this.opts.describeNode ?? defaultDescribeNode;
    return fn(node, { ...ctx, describeEdge: this.opts.describeEdge ?? defaultDescribeEdge });
  }
  _describeEdge(edge, ctx) {
    return (this.opts.describeEdge ?? defaultDescribeEdge)(edge, ctx);
  }

  /** Rebuild the mirror from the scene (keyed: existing elements are reused). */
  sync() {
    const { nodes, centerId } = this.host.getScene();
    const hadFocus = this.hasFocus;
    const keep = new Set();
    for (const n of nodes) {
      keep.add(n.id);
      let it = this.items.get(n.id);
      if (!it) {
        const li = document.createElement('li');
        li.dataset.id = n.id;
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'mg-node';
        btn.dataset.id = n.id;
        btn.tabIndex = -1;
        li.appendChild(btn);
        it = { li, btn };
        this.items.set(n.id, it);
        this.list.appendChild(li);     // existing items are never moved: moving blurs focus
      }
      it.btn.textContent = this._describeNode(n, { isCenter: n.id === centerId });
      if (n.id === centerId) it.btn.setAttribute('aria-current', 'true'); else it.btn.removeAttribute('aria-current');
    }
    for (const [id, it] of this.items) {
      if (!keep.has(id)) { it.li.remove(); this.items.delete(id); }
    }
    if (!this.focusId || !this.items.has(this.focusId)) {
      this.focusId = centerId && this.items.has(centerId) ? centerId : (nodes[0]?.id ?? null);
      this.anchorId = this.focusId;
      this.anchorStack = [];
    }
    if (this.anchorId && !this.items.has(this.anchorId)) { this.anchorId = centerId; this.anchorStack = []; }
    this._roving();
    const active = typeof document !== 'undefined' ? document.activeElement : null;
    const onDetail = hadFocus && active && active.classList?.contains('mg-detail') ? active.dataset : null;
    this._details();
    if (hadFocus && !this.hasFocus && this.focusId) {
      // re-rendering the details removed the focused edge/chip button: restore it
      let target = null;
      if (onDetail?.edgeId) target = this.root.querySelector(`button.mg-edge[data-edge-id="${cssEscape(onDetail.edgeId)}"]`);
      else if (onDetail?.chipId) target = this.root.querySelector(`button.mg-chip[data-chip-id="${cssEscape(onDetail.chipId)}"]`);
      (target ?? this.items.get(this.focusId).btn).focus({ preventScroll: true });
    }
  }

  /** The centre changed: anchor and focus follow it. */
  recentred(centerId, hadFocus = this.hasFocus) {
    this.anchorStack = [];
    this.anchorId = centerId;
    this.focusId = this.items.has(centerId) ? centerId : this.focusId;
    this._roving();
    this._details();
    if (hadFocus && this.focusId) this.items.get(this.focusId).btn.focus({ preventScroll: true });
    const { nodes } = this.host.getScene();
    const c = nodes.find(n => n.id === centerId);
    if (c) {
      const total = this.host.neighbours(centerId).length;
      this.announce(`${this._describeNode(c, { isCenter: true })}, ${total} linked`);
    }
  }

  focusNode(id, { announce = true, move = true } = {}) {
    if (!this.items.has(id)) return false;
    this.focusId = id;
    this._roving();
    this._details();
    if (move) this.items.get(id).btn.focus({ preventScroll: true });
    this.host.setFocus(id);
    if (announce) this.announce(this._contextText(id));
    return true;
  }

  focusEdge(edgeId) {
    const b = this.root.querySelector(`button.mg-edge[data-edge-id="${cssEscape(edgeId)}"]`);
    if (b) { b.focus({ preventScroll: true }); return true; }
    return false;
  }

  _contextText(id) {
    const { nodes, centerId } = this.host.getScene();
    const node = nodes.find(n => n.id === id);
    if (!node) return '';
    if (this.anchorId && this.anchorId !== id) {
      const nbs = this.host.neighbours(this.anchorId);
      const i = nbs.findIndex(x => x.id === id);
      const anchor = nodes.find(n => n.id === this.anchorId);
      if (i >= 0) return this._describeNode(node, { edge: nbs[i].edge, anchor, index: i + 1, total: nbs.length, isCenter: id === centerId });
    }
    return this._describeNode(node, { isCenter: id === centerId });
  }

  _roving() {
    for (const [id, it] of this.items) it.btn.tabIndex = id === this.focusId ? 0 : -1;
  }

  _details() {
    for (const el of this.root.querySelectorAll('.mg-detail')) el.remove();
    if (!this.focusId) return;
    const it = this.items.get(this.focusId);
    const { nodes } = this.host.getScene();
    const node = nodes.find(n => n.id === this.focusId);
    if (!it || !node) return;
    const drawer = this.opts.drawerId;
    for (const { id: otherId, edge } of (this.host.edgesOf ?? this.host.neighbours)(this.focusId)) {
      const other = nodes.find(n => n.id === otherId);
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'mg-detail mg-edge';
      b.dataset.edgeId = edge.id;
      b.textContent = `Link: ${node.label} – ${other?.label ?? otherId}: ${this._describeEdge(edge, { anchor: other, node })}`;
      if (drawer) { b.setAttribute('aria-haspopup', 'dialog'); b.setAttribute('aria-controls', drawer); }
      it.li.appendChild(b);
    }
    for (const chip of this.host.chipsOf(node)) {
      const b = document.createElement('button');
      b.type = 'button';
      b.className = 'mg-detail mg-chip';
      b.dataset.chipId = chip.id;
      const st = chip.status && chip.status !== 'open' ? ` (${chip.status})` : '';
      b.textContent = chip.overflow ? `${chip.count} more spellings` : `Spelling: ${chip.label}${st}`;
      if (drawer) { b.setAttribute('aria-haspopup', 'dialog'); b.setAttribute('aria-controls', drawer); }
      it.li.appendChild(b);
    }
  }

  _focusIn(e) {
    const t = e.target;
    if (t.classList.contains('mg-node')) {
      const id = t.dataset.id;
      if (id !== this.focusId) { this.focusId = id; this._roving(); this._details(); t.focus({ preventScroll: true }); }
      this.host.setFocus(id);
      this.host.setFocusedEdge(null);
      this.host.setFocusedChip(null, null);
    } else if (t.classList.contains('mg-edge')) {
      this.host.setFocusedEdge(t.dataset.edgeId);
      this.host.setFocusedChip(null, null);
    } else if (t.classList.contains('mg-chip')) {
      this.host.setFocusedEdge(null);
      this.host.setFocusedChip(this.focusId, t.dataset.chipId);
    }
  }

  _key(e) {
    const t = e.target;
    const isNode = t.classList?.contains('mg-node');
    const isEdge = t.classList?.contains('mg-edge');
    const isChip = t.classList?.contains('mg-chip');
    if (!isNode && !isEdge && !isChip) return;
    const k = e.key;
    if (isEdge || isChip) {
      if (k === 'Enter' || k === ' ') {
        e.preventDefault();
        if (isEdge) this.host.activateEdge(t.dataset.edgeId);
        else this.host.activateChip(this.focusId, t.dataset.chipId);
      } else if (k === 'Escape') {
        e.preventDefault();
        this.focusNode(this.focusId, { announce: false });
      }
      return;
    }
    const id = t.dataset.id;
    const { centerId } = this.host.getScene();
    const step = (dir) => {
      if (!this.anchorId) this.anchorId = centerId;
      let nbs = this.host.neighbours(this.anchorId);
      if (!nbs.length) return;
      let i = nbs.findIndex(x => x.id === id);
      i = i < 0 ? (dir > 0 ? 0 : nbs.length - 1) : (i + dir + nbs.length) % nbs.length;
      this.focusNode(nbs[i].id);
    };
    switch (k) {
      case 'ArrowRight': e.preventDefault(); step(1); break;
      case 'ArrowLeft':  e.preventDefault(); step(-1); break;
      case 'ArrowDown': {
        e.preventDefault();
        if (id === this.anchorId) { step(1); break; }
        const nbs = this.host.neighbours(id).filter(x => x.id !== this.anchorId);
        if (!nbs.length) { this.announce(`${this._contextText(id)}; no further links`); break; }
        this.anchorStack.push(this.anchorId);
        this.anchorId = id;
        this.focusNode(nbs[0].id);
        break;
      }
      case 'ArrowUp': {
        e.preventDefault();
        if (id === this.anchorId && this.anchorStack.length) {
          const prev = this.anchorStack.pop();
          const up = this.anchorId;
          this.anchorId = prev;
          this.focusNode(up);
        } else if (this.anchorId && id !== this.anchorId) {
          this.focusNode(this.anchorId);
        }
        break;
      }
      case 'Home':
        e.preventDefault();
        this.anchorStack = []; this.anchorId = centerId;
        this.focusNode(centerId);
        break;
      case 'Enter': case ' ':
        e.preventDefault();
        this.host.recentre(id);
        break;
      case 'Escape':
        e.preventDefault();
        this.host.back();
        break;
      default: break;
    }
  }

  announce(text) {
    if (!text) return;
    clearTimeout(this._liveTimer);
    this.live.textContent = '';
    this._liveTimer = setTimeout(() => { this.live.textContent = text; }, 30);
  }

  destroy() {
    clearTimeout(this._liveTimer);
    this.root.removeEventListener('keydown', this._onKey);
    this.root.removeEventListener('focusin', this._onFocusIn);
    this.root.removeEventListener('focusout', this._onFocusOut);
    this.root.remove();
    this.live.remove();
  }
}

function cssEscape(s) {
  if (typeof CSS !== 'undefined' && CSS.escape) return CSS.escape(s);
  return String(s).replace(/["\\]/g, '\\$&');
}
