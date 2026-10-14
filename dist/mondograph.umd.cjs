var MondoGraphLib = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/index.js
  var src_exports = {};
  __export(src_exports, {
    MondoGraph: () => MondoGraph,
    ThinkGraph: () => ThinkGraph,
    VERSION: () => VERSION,
    clearFlagCache: () => clearFlagCache,
    computeEdgeGeometry: () => computeEdgeGeometry,
    configureFlagBase: () => configureFlagBase,
    convexHull: () => convexHull,
    default: () => src_default,
    defaultDescribeEdge: () => defaultDescribeEdge,
    defaultDescribeNode: () => defaultDescribeNode,
    hashString: () => hashString,
    hitRadius: () => hitRadius,
    hitTest: () => hitTest,
    hitTestChips: () => hitTestChips,
    hitTestEdges: () => hitTestEdges,
    hullPolygon: () => hullPolygon,
    jitter: () => jitter,
    layered: () => layered,
    layoutChips: () => layoutChips,
    layouts: () => layouts,
    placeAround: () => placeAround,
    placeLabels: () => placeLabels,
    pointSegmentDistance: () => pointSegmentDistance,
    preloadFlags: () => preload,
    readThemeTokens: () => readThemeTokens,
    registerLayout: () => registerLayout,
    resolveEdgeStyle: () => resolveEdgeStyle,
    resolveTheme: () => resolveTheme,
    rings: () => rings,
    sceneToSVG: () => sceneToSVG,
    sectors: () => sectors,
    similarity: () => similarity,
    truncateToWidth: () => truncateToWidth,
    visualRadius: () => visualRadius
  });

  // src/theme.js
  var MONDONOMO = {
    background: "#020f20",
    ringStroke: "#02b9b9",
    centerGlow: "#02b9b9",
    font: '"Noto Sans", sans-serif',
    fontWeight: { label: 700, sub: 400 },
    spring: { K: 0.08, damping: 0.78, idleNoise: 0.22 },
    opacitySpring: { K: 0.14, damping: 0.82 },
    // Brand-tailored language colors for etymology origins
    langColors: {
      English: "#38bdf8",
      French: "#fb7185",
      Spanish: "#f59e0b",
      Latin: "#a855f7",
      Greek: "#10b981",
      Hebrew: "#06b6d4",
      Germanic: "#f43f5e",
      Celtic: "#14b8a6",
      Slavic: "#ec4899",
      "Proto-Sem.": "#64748b",
      Arabic: "#84cc16",
      Italian: "#eab308"
    },
    // Premium Mondonomo database relationship types
    edgeTypes: {
      derives_from: { stroke: "#02b9b9", dash: [], width: 2, arrow: true, animate: false },
      cognate_of: { stroke: "#a855f7", dash: [4, 4], width: 1.6, arrow: false, animate: false },
      variant_of: { stroke: "#ec4899", dash: [6, 3], width: 1.8, arrow: false, animate: false },
      transliteration: { stroke: "#00d2ff", dash: [1, 2], width: 1.5, arrow: false, animate: false },
      related_name: { stroke: "#38bdf8", dash: [2, 4], width: 1.2, arrow: false, animate: false },
      means: { stroke: "#eab308", dash: [2, 4], width: 1.2, arrow: true, animate: false },
      refers_to: { stroke: "#cbd5e1", dash: [3, 3], width: 1.2, arrow: false, animate: false },
      attested_as: { stroke: "#f43f5e", dash: [2, 3], width: 1, arrow: false, animate: false },
      popular_in: { stroke: "#02b9b9", dash: [], width: 1.5, arrow: false, animate: false },
      _fallback: { stroke: "#64748b", dash: [3, 3], width: 1.2, arrow: false, animate: false }
    },
    // Display families (Name Family Explorer F1–F9). Colour per family; the
    // stroke pattern comes from provenance, not from here.
    edgeFamilies: {
      F1: { stroke: "#00d2ff", dash: [1, 2], width: 1.3, arrow: false },
      F2: { stroke: "#38bdf8", dash: [], width: 1.5, arrow: false },
      F3: { stroke: "#a855f7", dash: [], width: 1.4, arrow: false },
      F4: { stroke: "#eab308", dash: [], width: 1.3, arrow: false },
      F5: { stroke: "#fb7185", dash: [], width: 1.4, arrow: true },
      F6: { stroke: "#ec4899", dash: [], width: 1.4, arrow: false },
      F7: { stroke: "#14b8a6", dash: [], width: 1.3, arrow: false },
      F8: { stroke: "#02b9b9", dash: [], width: 1.6, arrow: true },
      F9: { stroke: "#64748b", dash: [], width: 1, arrow: false },
      _default: { stroke: "#64748b", dash: [], width: 1.2, arrow: false }
    },
    labelBackground: "#ffffff",
    chipFill: "#05213f",
    chipInk: "#e2f7f7",
    chipStroke: "rgba(2,185,185,0.35)",
    chipActiveInk: "#020f20",
    hullColor: "#02b9b9",
    hullAlpha: 0.1,
    fadeAlpha: 0.12,
    focusRing: "#ffffff",
    // Node styling definitions
    nodeTypes: {
      given: { fill: "#020f20", stroke: "langColor", shape: "circle" },
      surname: { fill: "#020f20", stroke: "langColor", shape: "capsule" },
      text: { fill: "#020f20", stroke: "langColor", shape: "circle" },
      flag: { fill: "image", stroke: "#02b9b9", shape: "circle" },
      image: { fill: "image", stroke: "#02b9b9", shape: "circle" },
      concept: { fill: "#020f20", stroke: "#eab308", shape: "ellipse", dash: [3, 2] },
      referent: { fill: "#020f20", stroke: "#ec4899", shape: "diamond", dash: [3, 2] },
      element: { fill: "#020f20", stroke: "langColor", shape: "pill", opacity: 0.6 },
      attestation: { fill: "#020f20", stroke: "#f43f5e", shape: "pin" }
    },
    // Premium gender-accent colors
    genderColors: {
      M: "#38bdf8",
      // male (glowing sky blue)
      F: "#fb7185",
      // female (glowing soft rose)
      U: "#c084fc"
      // unisex (glowing lavender/purple)
    },
    qualityOpacity: [1, 0.85, 0.65, 0.45]
  };
  var ACCENT = "#0d9488";
  var EDITORIAL_LIGHT = {
    background: "#fbfaf8",
    // warm paper
    ringStroke: "#2b2b34",
    // muted ink; rings drawn at low globalAlpha
    centerGlow: ACCENT,
    // accent used for affordances/spinner
    centerAura: "rgba(13,148,136,0.10)",
    // soft halo behind the centre node
    accent: ACCENT,
    font: '"Noto Sans", sans-serif',
    fontWeight: { label: 700, sub: 400 },
    // Node surfaces & text (light-on-light)
    nodeFill: "#ffffff",
    nodeLabel: "#22202b",
    // ink
    nodeSubLabel: "rgba(34,32,43,0.45)",
    // muted metadata
    shadow: "rgba(30,30,45,0.12)",
    // soft drop shadow for depth
    badgeBacking: "#ffffff",
    badgeBorder: "rgba(20,20,30,0.14)",
    uiMuted: "rgba(20,20,30,0.40)",
    // reset button / chrome
    edgeParticle: ACCENT,
    // Calm settle; deterministic float replaces random jitter (see renderer)
    spring: { K: 0.06, damping: 0.82, idleNoise: 0 },
    opacitySpring: { K: 0.12, damping: 0.85 },
    float: { amp: 0.18, speed: 0.018 },
    // Etymology colours retuned for legibility on a light ground
    langColors: {
      English: "#2563eb",
      French: "#db2777",
      Spanish: "#d97706",
      Latin: "#7c3aed",
      Greek: "#059669",
      Hebrew: "#0891b2",
      Germanic: "#dc2626",
      Celtic: "#0d9488",
      Slavic: "#c026d3",
      "Proto-Sem.": "#52525b",
      Arabic: "#65a30d",
      Italian: "#ca8a04"
    },
    // Quiet hairlines; colour only where it carries meaning
    edgeTypes: {
      derives_from: { stroke: ACCENT, dash: [], width: 1.6, arrow: true, animate: false },
      cognate_of: { stroke: "#7c3aed", dash: [4, 4], width: 1.2, arrow: false, animate: false },
      variant_of: { stroke: "#db2777", dash: [6, 3], width: 1.3, arrow: false, animate: false },
      transliteration: { stroke: "#0891b2", dash: [1, 3], width: 1.1, arrow: false, animate: false },
      related_name: { stroke: "#2563eb", dash: [2, 4], width: 1, arrow: false, animate: false },
      means: { stroke: "#ca8a04", dash: [2, 4], width: 1, arrow: true, animate: false },
      refers_to: { stroke: "rgba(20,20,30,0.25)", dash: [3, 3], width: 1, arrow: false, animate: false },
      attested_as: { stroke: "#dc2626", dash: [2, 3], width: 0.9, arrow: false, animate: false },
      popular_in: { stroke: ACCENT, dash: [], width: 1.2, arrow: false, animate: false },
      _fallback: { stroke: "rgba(20,20,30,0.22)", dash: [3, 3], width: 1, arrow: false, animate: false }
    },
    edgeFamilies: {
      F1: { stroke: "#0891b2", dash: [1, 3], width: 1.1, arrow: false },
      F2: { stroke: "#2563eb", dash: [], width: 1.3, arrow: false },
      F3: { stroke: "#7c3aed", dash: [], width: 1.2, arrow: false },
      F4: { stroke: "#ca8a04", dash: [], width: 1.1, arrow: false },
      F5: { stroke: "#db2777", dash: [], width: 1.2, arrow: true },
      F6: { stroke: "#c026d3", dash: [], width: 1.2, arrow: false },
      F7: { stroke: "#0d9488", dash: [], width: 1.1, arrow: false },
      F8: { stroke: "#52525b", dash: [], width: 1.4, arrow: true },
      F9: { stroke: "rgba(20,20,30,0.30)", dash: [], width: 0.9, arrow: false },
      _default: { stroke: "rgba(20,20,30,0.35)", dash: [], width: 1, arrow: false }
    },
    labelBackground: "#fbfaf8",
    chipFill: "#ffffff",
    chipInk: "#22202b",
    chipStroke: "rgba(20,20,30,0.18)",
    chipActiveInk: "#ffffff",
    hullColor: ACCENT,
    hullAlpha: 0.07,
    fadeAlpha: 0.12,
    focusRing: "#22202b",
    nodeTypes: {
      given: { fill: "#ffffff", stroke: "langColor", shape: "circle" },
      surname: { fill: "#ffffff", stroke: "langColor", shape: "capsule" },
      text: { fill: "#ffffff", stroke: "langColor", shape: "circle" },
      flag: { fill: "image", stroke: ACCENT, shape: "circle" },
      image: { fill: "#ffffff", stroke: ACCENT, shape: "circle" },
      concept: { fill: "#ffffff", stroke: "#ca8a04", shape: "ellipse", dash: [3, 2] },
      referent: { fill: "#ffffff", stroke: "#db2777", shape: "diamond", dash: [3, 2] },
      element: { fill: "#ffffff", stroke: "langColor", shape: "pill", opacity: 0.65 },
      attestation: { fill: "#ffffff", stroke: "#dc2626", shape: "pin" }
    },
    genderColors: {
      M: "#2563eb",
      // male
      F: "#db2777",
      // female
      U: "#9333ea"
      // unisex
    },
    qualityOpacity: [1, 0.85, 0.65, 0.45]
  };
  var PRESETS = { mondonomo: MONDONOMO, editorialLight: EDITORIAL_LIGHT };
  function deepMerge(base, override) {
    const result = { ...base };
    for (const key of Object.keys(override)) {
      const bv = base[key], ov = override[key];
      if (ov !== null && typeof ov === "object" && !Array.isArray(ov) && bv !== null && typeof bv === "object" && !Array.isArray(bv)) {
        result[key] = deepMerge(bv, ov);
      } else {
        result[key] = ov;
      }
    }
    return result;
  }
  function resolveTheme(input) {
    if (input == null) return structuredClone(MONDONOMO);
    if (typeof input === "string") return structuredClone(PRESETS[input] ?? MONDONOMO);
    return deepMerge(structuredClone(MONDONOMO), input);
  }
  function langColor(theme, lang) {
    return theme.langColors[lang] ?? "#64748b";
  }
  function mergeTheme(theme, override) {
    return deepMerge(theme, override || {});
  }
  function tokenSlug(key) {
    return String(key).toLowerCase().replace(/[^a-z0-9_-]+/g, "-");
  }
  function readThemeTokens(getVar, keys = {}) {
    const v = (name) => {
      const raw = getVar(name);
      return raw == null ? "" : String(raw).trim();
    };
    const t = {};
    const set = (prop, name) => {
      const x = v(name);
      if (x) t[prop] = x;
    };
    const num = (prop, name) => {
      const x = parseFloat(v(name));
      if (Number.isFinite(x)) t[prop] = x;
    };
    set("background", "--mg-background");
    set("nodeLabel", "--mg-ink");
    set("chipInk", "--mg-ink");
    set("nodeSubLabel", "--mg-muted");
    set("uiMuted", "--mg-muted");
    set("accent", "--mg-accent");
    set("centerGlow", "--mg-accent");
    set("edgeParticle", "--mg-accent");
    set("centerAura", "--mg-aura");
    set("nodeFill", "--mg-node-fill");
    set("badgeBacking", "--mg-node-fill");
    set("chipFill", "--mg-node-fill");
    set("ringStroke", "--mg-ring");
    set("shadow", "--mg-shadow");
    set("font", "--mg-font");
    set("labelBackground", "--mg-label-bg");
    if (!t.labelBackground && t.background) t.labelBackground = t.background;
    set("focusRing", "--mg-focus");
    set("chipFill", "--mg-chip-fill");
    set("chipInk", "--mg-chip-ink");
    set("chipStroke", "--mg-chip-stroke");
    set("hullColor", "--mg-hull");
    num("hullAlpha", "--mg-hull-alpha");
    num("fadeAlpha", "--mg-fade-alpha");
    const fams = {};
    const def = v("--mg-edge");
    if (def) fams._default = { stroke: def };
    for (const f2 of keys.families ?? []) {
      const c = v(`--mg-edge-${tokenSlug(f2)}`);
      if (c) fams[f2] = { stroke: c };
    }
    if (Object.keys(fams).length) t.edgeFamilies = fams;
    const langs = {};
    for (const l of keys.langs ?? []) {
      const c = v(`--mg-lang-${tokenSlug(l)}`);
      if (c) langs[l] = c;
    }
    if (Object.keys(langs).length) t.langColors = langs;
    const g = {};
    for (const k of ["m", "f", "u"]) {
      const c = v(`--mg-gender-${k}`);
      if (c) g[k.toUpperCase()] = c;
    }
    if (Object.keys(g).length) t.genderColors = g;
    return t;
  }

  // src/spring.js
  function springStep(pos, vel, target, K, damping) {
    const force = K * (target - pos);
    const newVel = (vel + force) * damping;
    return { pos: pos + newVel, vel: newVel };
  }
  function createSpringNode(x, y, opacity = 1) {
    return {
      x,
      y,
      vx: 0,
      vy: 0,
      opacity,
      vOpacity: 0,
      targetX: x,
      targetY: y,
      targetOpacity: opacity
    };
  }
  function tickSprings(springNodes, posSpring, opSpring) {
    for (const s of springNodes.values()) {
      const rx = springStep(s.x, s.vx, s.targetX, posSpring.K, posSpring.damping);
      const ry = springStep(s.y, s.vy, s.targetY, posSpring.K, posSpring.damping);
      const ro = springStep(s.opacity, s.vOpacity, s.targetOpacity, opSpring.K, opSpring.damping);
      s.x = rx.pos;
      s.vx = rx.vel;
      s.y = ry.pos;
      s.vy = ry.vel;
      s.opacity = ro.pos;
      s.vOpacity = ro.vel;
    }
  }

  // src/edges.js
  function pointSegmentDistance(px, py, x1, y1, x2, y2) {
    const dx = x2 - x1, dy = y2 - y1;
    const len2 = dx * dx + dy * dy;
    let t = len2 > 0 ? ((px - x1) * dx + (py - y1) * dy) / len2 : 0;
    t = Math.max(0, Math.min(1, t));
    return Math.hypot(px - (x1 + t * dx), py - (y1 + t * dy));
  }
  var PROVENANCE_DASH = {
    recorded: [],
    modelled: [6, 4],
    modeled: [6, 4],
    community: [],
    unknown: [1.5, 3.5]
  };
  function resolveEdgeStyle(edge, theme, state = {}) {
    const fam = edge.family != null ? theme.edgeFamilies?.[edge.family] : null;
    const typ = theme.edgeTypes?.[edge.type];
    const base = fam ?? typ ?? theme.edgeFamilies?._default ?? theme.edgeTypes?._fallback ?? { stroke: "#64748b", dash: [3, 3], width: 1, arrow: false };
    const status = edge.status ?? "open";
    const suppressed = status === "suppressed" || status === "excluded";
    let dash = base.dash ?? [];
    if (edge.provenance != null) dash = PROVENANCE_DASH[edge.provenance] ?? PROVENANCE_DASH.unknown;
    const back = state.backEdges?.has(edge.id);
    return {
      stroke: base.stroke,
      width: base.width ?? 1,
      dash,
      arrow: !back && (edge.directed === true || edge.directed == null && !!base.arrow),
      animate: !!base.animate,
      mark: edge.provenance === "community" ? "community" : null,
      strike: status === "disputed",
      uncertain: edge.certainty === "uncertain",
      hidden: suppressed && !state.showSuppressed,
      alpha: suppressed ? 0.4 : 1
    };
  }
  var PARALLEL_SPACING = 6;
  var ARROW_SIZE = 7;
  function computeEdgeGeometry(edges, nodeState, hasArrow) {
    const pairs = /* @__PURE__ */ new Map();
    for (const e of edges) {
      if (!nodeState.has(e.from) || !nodeState.has(e.to)) continue;
      const k = e.from < e.to ? e.from + "\0" + e.to : e.to + "\0" + e.from;
      let arr = pairs.get(k);
      if (!arr) pairs.set(k, arr = []);
      arr.push(e);
    }
    const out = /* @__PURE__ */ new Map();
    for (const arr of pairs.values()) {
      const n = arr.length;
      arr.forEach((e, i) => {
        const a = nodeState.get(e.from), b = nodeState.get(e.to);
        let dx = b.x - a.x, dy = b.y - a.y;
        const len = Math.hypot(dx, dy);
        if (len < 1) return;
        const ux = dx / len, uy = dy / len;
        const sgn = e.from < e.to ? 1 : -1;
        const off = n > 1 ? (i - (n - 1) / 2) * PARALLEL_SPACING * sgn : 0;
        const ox = -uy * off, oy = ux * off;
        const ra = a.visualRadius ?? 0;
        const rb = (b.visualRadius ?? 0) + (hasArrow && hasArrow(e) ? ARROW_SIZE : 0);
        if (len < ra + rb + 2) return;
        const x1 = a.x + ux * ra + ox, y1 = a.y + uy * ra + oy;
        const x2 = b.x - ux * rb + ox, y2 = b.y - uy * rb + oy;
        out.set(e.id, { x1, y1, x2, y2, mx: (x1 + x2) / 2, my: (y1 + y2) / 2, ux, uy, edge: e });
      });
    }
    return out;
  }
  function hitTestEdges(px, py, geometry, tolerance = 6, accept) {
    let best = null, bestD = tolerance;
    const entries = geometry instanceof Map ? geometry.entries() : geometry.map((g) => [g.id, g]);
    for (const [id, g] of entries) {
      if (accept && !accept(id)) continue;
      if (px < Math.min(g.x1, g.x2) - bestD || px > Math.max(g.x1, g.x2) + bestD || py < Math.min(g.y1, g.y2) - bestD || py > Math.max(g.y1, g.y2) + bestD) continue;
      const d = pointSegmentDistance(px, py, g.x1, g.y1, g.x2, g.y2);
      if (d <= bestD) {
        bestD = d;
        best = id;
      }
    }
    return best;
  }
  function drawArrowhead(ctx, x1, y1, x2, y2, color) {
    const angle = Math.atan2(y2 - y1, x2 - x1);
    const size = ARROW_SIZE;
    ctx.save();
    ctx.fillStyle = color;
    ctx.translate(x2, y2);
    ctx.rotate(angle);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(-size, size / 2);
    ctx.lineTo(-size, -size / 2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }
  function getEdgeHash(s1, s2) {
    let hash = 0;
    const str = s1 + s2;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash) / 1e3;
  }
  function drawStrike(ctx, g, color) {
    ctx.save();
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.6;
    ctx.setLineDash([]);
    ctx.beginPath();
    strikePath(ctx, g);
    ctx.stroke();
    ctx.restore();
  }
  function drawCommunityMark(ctx, g, color, bg) {
    const t = 0.3;
    const x = g.x1 + (g.x2 - g.x1) * t, y = g.y1 + (g.y2 - g.y1) * t;
    ctx.save();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(x, y, 3.2, 0, Math.PI * 2);
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.lineWidth = 1.4;
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.restore();
  }
  function drawQuestion(ctx, x, y, color, bg, font) {
    ctx.save();
    ctx.setLineDash([]);
    ctx.beginPath();
    ctx.arc(x, y, 6.5, 0, Math.PI * 2);
    ctx.fillStyle = bg;
    ctx.fill();
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = color;
    ctx.stroke();
    ctx.fillStyle = color;
    ctx.font = `700 9px ${font}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("?", x, y + 0.5);
    ctx.restore();
  }
  function drawEdgeLabel(ctx, g, text, theme) {
    if (!text) return;
    ctx.save();
    ctx.setLineDash([]);
    ctx.font = `600 10px ${theme.font}`;
    const w = ctx.measureText(text).width + 10, h = 16;
    const x = g.mx - w / 2, y = g.my - h - 6;
    ctx.globalAlpha = 1;
    ctx.fillStyle = theme.labelBackground ?? theme.background;
    ctx.strokeStyle = theme.accent ?? theme.centerGlow;
    ctx.lineWidth = 1;
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, 8);
    else ctx.rect(x, y, w, h);
    ctx.fill();
    ctx.stroke();
    ctx.fillStyle = theme.nodeLabel ?? "#22202b";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, g.mx, y + h / 2 + 0.5);
    ctx.restore();
  }
  function drawEdges(ctx, edges, nodeState, theme, state = {}) {
    const now = Date.now();
    const styles = state.styles ?? /* @__PURE__ */ new Map();
    if (!state.styles) for (const e of edges) styles.set(e.id ?? e, resolveEdgeStyle(e, theme, state));
    const styleOf = (e) => styles.get(e.id ?? e);
    const geometry = state.geometry ?? computeEdgeGeometry(
      edges.map((e, i) => e.id != null ? e : { ...e, id: `__e${i}` }),
      nodeState,
      (e) => styleOf(e)?.arrow ?? false
    );
    const geoOf = (e, i) => geometry.get(e.id ?? `__e${i}`);
    const active = new Set([state.hoveredEdgeId, state.selectedEdgeId, state.focusedEdgeId].filter(Boolean));
    const batches = /* @__PURE__ */ new Map();
    const extras = [];
    edges.forEach((edge, i) => {
      const st = styleOf(edge);
      if (!st || st.hidden) return;
      const g = geoOf(edge, i);
      if (!g) return;
      const from = nodeState.get(edge.from), to = nodeState.get(edge.to);
      const weight = edge.weight ?? 1;
      let alpha = Math.min(from.opacity, to.opacity) * Math.min(1, weight) * st.alpha;
      if (state.edgeAlpha) alpha *= state.edgeAlpha(edge);
      if (alpha < 0.01) return;
      if (active.has(edge.id)) {
        extras.push({ edge, g, st, alpha, active: true });
        return;
      }
      const width = st.width * (edge.weight != null ? Math.max(0.5, weight) : 1);
      const dash = state.lod ? [] : st.dash;
      const key = `${st.stroke}|${width}|${dash.join(",")}|${Math.round(alpha * 20)}`;
      let b = batches.get(key);
      if (!b) batches.set(key, b = { stroke: st.stroke, width, dash, alpha: Math.round(alpha * 20) / 20, segs: [] });
      b.segs.push(g);
      if (state.lod) {
        if (st.arrow) extras.push({ edge, g, st: { ...st, mark: null, strike: false, uncertain: false, animate: false }, alpha, active: false });
      } else if (st.arrow || st.mark || st.strike || st.uncertain || st.animate) extras.push({ edge, g, st, alpha, active: false });
    });
    for (const b of batches.values()) {
      ctx.save();
      ctx.globalAlpha = b.alpha;
      ctx.strokeStyle = b.stroke;
      ctx.lineWidth = b.width;
      ctx.setLineDash(b.dash);
      if (b.dash.length && b.dash[0] < 2) ctx.lineCap = "round";
      ctx.beginPath();
      for (const g of b.segs) {
        ctx.moveTo(g.x1, g.y1);
        ctx.lineTo(g.x2, g.y2);
      }
      ctx.stroke();
      ctx.restore();
    }
    const bg = theme.background;
    const accent = theme.accent ?? theme.centerGlow ?? "#0d9488";
    const font = theme.font ?? "sans-serif";
    const marks = /* @__PURE__ */ new Map();
    const bucket = (color, alpha) => {
      const k = color + "|" + Math.round(alpha * 20);
      let m = marks.get(k);
      if (!m) marks.set(k, m = { color, alpha: Math.round(alpha * 20) / 20, arrows: [], community: [], strikes: [], uncertain: [] });
      return m;
    };
    const activeList = [];
    for (const x of extras) {
      if (x.active) {
        activeList.push(x);
        continue;
      }
      const { g, st, alpha, edge } = x;
      const m = bucket(st.stroke, alpha);
      if (st.arrow) m.arrows.push(g);
      if (st.mark === "community") m.community.push(g);
      if (st.strike) m.strikes.push(g);
      if (st.uncertain) m.uncertain.push(g);
      if (st.animate && alpha > 0.05) drawParticle(ctx, edge, g, st, alpha, theme, now);
    }
    for (const m of marks.values()) {
      ctx.save();
      ctx.globalAlpha = m.alpha;
      ctx.setLineDash([]);
      if (m.arrows.length) {
        ctx.beginPath();
        for (const g of m.arrows) arrowPath(ctx, g);
        ctx.fillStyle = m.color;
        ctx.fill();
      }
      if (m.community.length) {
        ctx.beginPath();
        for (const g of m.community) {
          const p = communityPoint(g);
          ctx.moveTo(p.x + 3.2, p.y);
          ctx.arc(p.x, p.y, 3.2, 0, Math.PI * 2);
        }
        ctx.fillStyle = bg;
        ctx.fill();
        ctx.lineWidth = 1.4;
        ctx.strokeStyle = m.color;
        ctx.stroke();
      }
      if (m.strikes.length) {
        ctx.beginPath();
        for (const g of m.strikes) strikePath(ctx, g);
        ctx.lineWidth = 1.6;
        ctx.strokeStyle = m.color;
        ctx.stroke();
      }
      if (m.uncertain.length) {
        ctx.beginPath();
        for (const g of m.uncertain) {
          ctx.moveTo(g.mx + 6.5, g.my);
          ctx.arc(g.mx, g.my, 6.5, 0, Math.PI * 2);
        }
        ctx.fillStyle = bg;
        ctx.fill();
        ctx.lineWidth = 1.2;
        ctx.strokeStyle = m.color;
        ctx.stroke();
        ctx.fillStyle = m.color;
        ctx.font = `700 9px ${font}`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        for (const g of m.uncertain) ctx.fillText("?", g.mx, g.my + 0.5);
      }
      ctx.restore();
    }
    for (const { edge, g, st, alpha } of activeList) {
      ctx.save();
      ctx.globalAlpha = Math.max(alpha, 0.95);
      ctx.strokeStyle = accent;
      ctx.lineWidth = st.width + 1.6;
      ctx.setLineDash(st.dash);
      ctx.beginPath();
      ctx.moveTo(g.x1, g.y1);
      ctx.lineTo(g.x2, g.y2);
      ctx.stroke();
      ctx.setLineDash([]);
      if (st.arrow) drawArrowhead(ctx, g.x1, g.y1, g.x2, g.y2, accent);
      if (st.mark === "community") drawCommunityMark(ctx, g, accent, bg);
      if (st.strike) drawStrike(ctx, g, accent);
      if (st.uncertain) drawQuestion(ctx, g.mx, g.my, accent, bg, font);
      ctx.restore();
      if (edge.label) drawEdgeLabel(ctx, g, edge.label, theme);
    }
  }
  function arrowPath(ctx, g) {
    const s = ARROW_SIZE, ux = g.ux, uy = g.uy;
    const bx = g.x2 - ux * s, by = g.y2 - uy * s;
    ctx.moveTo(g.x2, g.y2);
    ctx.lineTo(bx - uy * s / 2, by + ux * s / 2);
    ctx.lineTo(bx + uy * s / 2, by - ux * s / 2);
    ctx.closePath();
  }
  function communityPoint(g) {
    return { x: g.x1 + (g.x2 - g.x1) * 0.3, y: g.y1 + (g.y2 - g.y1) * 0.3 };
  }
  function strikePath(ctx, g) {
    const px = -g.uy, py = g.ux;
    for (const s of [-3, 3]) {
      const cx = g.mx + g.ux * s, cy = g.my + g.uy * s;
      ctx.moveTo(cx + (px - g.ux * 0.6) * 6, cy + (py - g.uy * 0.6) * 6);
      ctx.lineTo(cx - (px - g.ux * 0.6) * 6, cy - (py - g.uy * 0.6) * 6);
    }
  }
  function drawParticle(ctx, edge, g, st, alpha, theme, now) {
    const t = (now / 2800 + getEdgeHash(edge.from, edge.to)) % 1;
    const px = g.x1 + t * (g.x2 - g.x1), py = g.y1 + t * (g.y2 - g.y1);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.beginPath();
    ctx.arc(px, py, st.width * 1.2 + 1, 0, Math.PI * 2);
    ctx.fillStyle = theme.edgeParticle ?? st.stroke;
    ctx.fill();
    ctx.restore();
  }

  // src/flagStore.js
  var BASE = "/flags/";
  var cache = /* @__PURE__ */ new Map();
  var FADE_MS = 220;
  function configureFlagBase(path) {
    if (typeof path === "string" && path) BASE = path.endsWith("/") ? path : path + "/";
  }
  function resolveFlagUrl(val) {
    if (!val) return "";
    if (val.startsWith("http://") || val.startsWith("https://")) return val;
    return `${BASE}${val.toLowerCase()}.svg`;
  }
  function loadOne(iso) {
    const key = String(iso).toLowerCase();
    const hit = cache.get(key);
    if (hit) return hit.promise;
    const entry = { status: "loading", img: null, loadedAt: 0 };
    entry.promise = new Promise((resolve) => {
      if (typeof Image === "undefined") {
        entry.status = "error";
        resolve();
        return;
      }
      const img = new Image();
      img.onload = () => {
        entry.img = img;
        entry.status = "loaded";
        entry.loadedAt = Date.now();
        resolve();
      };
      img.onerror = () => {
        entry.status = "error";
        resolve();
      };
      img.src = resolveFlagUrl(iso);
    });
    cache.set(key, entry);
    return entry.promise;
  }
  function preload(isoList) {
    const uniq = [...new Set((isoList || []).filter(Boolean).map((s) => String(s).toLowerCase()))];
    return Promise.all(uniq.map(loadOne)).then(() => void 0);
  }
  function getFlag(iso) {
    if (!iso) return null;
    const key = String(iso).toLowerCase();
    const entry = cache.get(key);
    if (!entry) {
      loadOne(iso);
      return null;
    }
    if (entry.status !== "loaded") return null;
    const alpha = entry.loadedAt ? Math.min(1, (Date.now() - entry.loadedAt) / FADE_MS) : 1;
    return { img: entry.img, alpha };
  }
  function clearFlagCache() {
    cache.clear();
  }

  // src/renderers/flag.js
  function paintFlagDisc(ctx, iso, x, y, r, theme) {
    const f2 = getFlag(iso);
    if (f2) {
      ctx.save();
      ctx.globalAlpha *= f2.alpha;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.clip();
      ctx.drawImage(f2.img, x - r, y - r, r * 2, r * 2);
      ctx.restore();
      return f2.alpha >= 1;
    }
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = theme.badgeBacking ?? "#ffffff";
    ctx.fill();
    return false;
  }
  function drawFlagNode(ctx, node, x, y, isCenter, theme) {
    const pop = node.popularity ?? 0.5;
    const baseR = isCenter ? 38 : 22;
    const r = baseR * (0.7 + 0.6 * pop);
    const iso = node.imageUrl || node.iso2 || node.id;
    ctx.save();
    ctx.globalAlpha = node._opacity ?? 1;
    ctx.save();
    if (!theme._noShadow) {
      ctx.shadowColor = theme.shadow ?? "rgba(30,30,45,0.12)";
      ctx.shadowBlur = isCenter ? 14 : 8;
      ctx.shadowOffsetY = 1.5;
    }
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = theme.badgeBacking ?? "#ffffff";
    ctx.fill();
    ctx.restore();
    paintFlagDisc(ctx, iso, x, y, r, theme);
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.strokeStyle = theme.nodeTypes.flag.stroke;
    ctx.lineWidth = isCenter ? 2.4 : 1.4;
    ctx.setLineDash([]);
    ctx.stroke();
    ctx.fillStyle = theme.nodeSubLabel ?? "rgba(34,32,43,0.45)";
    ctx.font = `400 8.5px ${theme.font}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "top";
    ctx.fillText(node.label ?? "", x, y + r + 5);
    ctx.restore();
  }
  function drawFlagBadgeCluster(ctx, flags, x, y, r, theme) {
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
  function drawFlagOrb(ctx, iso, x, y, r, theme) {
    if (!iso) return;
    ctx.save();
    if (!theme._noShadow) {
      ctx.shadowColor = theme.shadow ?? "rgba(30,30,45,0.12)";
      ctx.shadowBlur = 4;
      ctx.shadowOffsetY = 1;
    }
    ctx.beginPath();
    ctx.arc(x, y, r + 1, 0, Math.PI * 2);
    ctx.fillStyle = theme.badgeBacking ?? "#ffffff";
    ctx.fill();
    ctx.restore();
    paintFlagDisc(ctx, iso, x, y, r, theme);
    ctx.beginPath();
    ctx.arc(x, y, r + 1, 0, Math.PI * 2);
    ctx.strokeStyle = theme.badgeBorder ?? "rgba(20,20,30,0.14)";
    ctx.lineWidth = 0.8;
    ctx.setLineDash([]);
    ctx.stroke();
  }

  // src/renderers/text.js
  var CENTER_R = 38;
  var NODE_R = 22;
  function getCountryEntries(node) {
    if (!node.countriesData) return [];
    return Object.entries(node.countriesData).filter(([k]) => k !== "world").map(([iso, data]) => ({ iso: iso.toUpperCase(), bearers: data?.bearers ?? 0 })).filter((e) => e.bearers > 0).sort((a, b) => b.bearers - a.bearers).slice(0, 3);
  }
  function drawCountryFlags(ctx, node, x, y, r, theme) {
    const entries = getCountryEntries(node);
    if (entries.length === 0) return;
    const maxB = entries[0].bearers;
    entries.forEach((e, i) => {
      const angle = i / entries.length * Math.PI * 2 - Math.PI / 2;
      const ratio = Math.sqrt(e.bearers / maxB);
      const badgeR = Math.max(4, 4 + ratio * 4);
      const dist = r + badgeR + 5;
      const lx = x + Math.cos(angle) * dist;
      const ly = y + Math.sin(angle) * dist;
      drawFlagOrb(ctx, e.iso, lx, ly, badgeR, theme);
    });
  }
  function drawNodeFlags(ctx, node, x, y, r, theme) {
    if (node.countriesData) drawCountryFlags(ctx, node, x, y, r, theme);
    else drawFlagBadgeCluster(ctx, node.flags || node.countries, x, y, r, theme);
  }
  function paintNameDisc(ctx, x, y, r, stroke, isCenter, theme) {
    if (isCenter && theme.centerAura) {
      ctx.save();
      const grad = ctx.createRadialGradient(x, y, r, x, y, r + 18);
      grad.addColorStop(0, theme.centerAura);
      grad.addColorStop(1, theme.centerAura.replace(/[\d.]+\)$/, "0)"));
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(x, y, r + 18, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    ctx.save();
    if (!theme._noShadow) {
      ctx.shadowColor = theme.shadow ?? "rgba(30,30,45,0.12)";
      ctx.shadowBlur = isCenter ? 16 : 9;
      ctx.shadowOffsetY = 1.5;
    }
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fillStyle = theme.nodeFill ?? "#ffffff";
    ctx.fill();
    ctx.restore();
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.strokeStyle = stroke;
    ctx.lineWidth = isCenter ? 2.6 : 1.6;
    ctx.setLineDash([]);
    ctx.stroke();
  }
  function labelFontSize(node, isCenter) {
    const popularity = node.popularity ?? 0.5;
    const fontSize = isCenter ? 19 : String(node.label ?? "").length > 7 ? 10.5 : 13;
    return Math.round(fontSize * (0.85 + 0.3 * popularity) * 2) / 2;
  }
  function insideLabelOffset(node, isCenter) {
    const hasIPA = !!node.ipa;
    return -(isCenter ? hasIPA ? 9 : 3 : hasIPA ? 7 : 2);
  }
  function paintDiscText(ctx, node, x, y, isCenter, theme, { sub, popularity }) {
    const hasIPA = !!node.ipa;
    const scale = labelFontSize(node, isCenter);
    const labelY = y + insideLabelOffset(node, isCenter);
    const lp = node._lp;
    const text = lp ? lp.text : node.label ?? "";
    const showMain = !node._noLabel && !(lp && lp.hidden) && text;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `700 ${scale}px ${theme.font}`;
    if (showMain) {
      if (lp && !lp.inside) {
        ctx.lineWidth = 3;
        ctx.lineJoin = "round";
        ctx.strokeStyle = theme.labelBackground ?? theme.background;
        ctx.strokeText(text, x + lp.dx, y + lp.dy);
        ctx.fillStyle = theme.nodeLabel ?? "#22202b";
        ctx.fillText(text, x + lp.dx, y + lp.dy);
      } else {
        ctx.fillStyle = theme.nodeLabel ?? "#22202b";
        ctx.fillText(text, x, labelY);
      }
    }
    if (node._noLabel) return;
    const mainInside = showMain && !(lp && !lp.inside);
    ctx.fillStyle = theme.nodeSubLabel ?? "rgba(34,32,43,0.45)";
    ctx.font = `500 7px ${theme.font}`;
    const subY = mainInside ? labelY + (isCenter ? 14 : 11) : y;
    ctx.fillText(sub, x, subY);
    if (hasIPA && mainInside) {
      ctx.fillStyle = theme.nodeSubLabel ?? "rgba(34,32,43,0.45)";
      ctx.font = `italic 400 ${isCenter ? 8 : 6}px ${theme.font}`;
      ctx.fillText(`/${node.ipa}/`, x, subY + (isCenter ? 10 : 8));
    }
  }
  function drawNode(ctx, node, x, y, isCenter, theme) {
    ctx.save();
    ctx.globalAlpha = node._opacity ?? 1;
    switch (node.type) {
      case "given":
        drawGivenNode(ctx, node, x, y, isCenter, theme);
        break;
      case "surname":
        drawSurnameNode(ctx, node, x, y, isCenter, theme);
        break;
      case "concept":
        drawConcept(ctx, node, x, y, theme);
        break;
      case "referent":
        drawReferent(ctx, node, x, y, theme);
        break;
      case "element":
        drawElement(ctx, node, x, y, theme);
        break;
      case "attestation":
        drawAttestation(ctx, node, x, y, theme);
        break;
      case "stub":
        drawStub(ctx, node, x, y, theme);
        break;
      default:
        drawTextNode(ctx, node, x, y, isCenter, theme);
    }
    ctx.restore();
  }
  function drawGivenNode(ctx, node, x, y, isCenter, theme) {
    const popularity = node.popularity ?? 0.5;
    const r = (isCenter ? CENTER_R : NODE_R) * (0.7 + 0.6 * popularity);
    let stroke = langColor(theme, node.lang);
    if (node.gender && theme.genderColors[node.gender]) stroke = theme.genderColors[node.gender];
    paintNameDisc(ctx, x, y, r, stroke, isCenter, theme);
    const sub = node.lang ? node.lang.toUpperCase() : "GIVEN NAME";
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
    ctx.save();
    if (!theme._noShadow) {
      ctx.shadowColor = theme.shadow ?? "rgba(30,30,45,0.12)";
      ctx.shadowBlur = isCenter ? 14 : 8;
      ctx.shadowOffsetY = 1.5;
    }
    ctx.beginPath();
    ctx.roundRect(rx, ry, w, h, h / 2);
    ctx.fillStyle = theme.nodeFill ?? "#ffffff";
    ctx.fill();
    ctx.restore();
    ctx.beginPath();
    ctx.roundRect(rx, ry, w, h, h / 2);
    ctx.strokeStyle = stroke;
    ctx.lineWidth = isCenter ? 2.4 : 1.6;
    ctx.setLineDash([]);
    ctx.stroke();
    const fontSize = isCenter ? 16 : (node.label?.length ?? 0) > 7 ? 10 : 12;
    const scale = fontSize * (0.85 + 0.3 * popularity);
    ctx.fillStyle = theme.nodeLabel ?? "#22202b";
    ctx.font = `700 ${scale}px ${theme.font}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(node.label ?? "", x, y - 3);
    ctx.fillStyle = theme.nodeSubLabel ?? "rgba(34,32,43,0.45)";
    ctx.font = `500 6.5px ${theme.font}`;
    ctx.fillText("SURNAME", x, y + h / 2 - 5);
    drawFlagBadgeCluster(ctx, node.flags || node.countries, x, y, approxR, theme);
  }
  function drawConcept(ctx, node, x, y, theme) {
    const cfg = theme.nodeTypes.concept;
    ctx.beginPath();
    ctx.ellipse(x, y, 46, 17, 0, 0, Math.PI * 2);
    ctx.fillStyle = cfg.fill;
    ctx.fill();
    ctx.strokeStyle = cfg.stroke;
    ctx.lineWidth = 1.2;
    ctx.setLineDash(cfg.dash ?? [3, 2]);
    ctx.stroke();
    ctx.fillStyle = cfg.stroke;
    ctx.font = `italic 400 9px ${theme.font}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(node.label ?? "", x, y - 3);
    ctx.fillStyle = theme.nodeSubLabel ?? "rgba(34,32,43,0.45)";
    ctx.font = `500 7px ${theme.font}`;
    ctx.setLineDash([]);
    ctx.fillText("CONCEPT", x, y + 10);
  }
  function drawReferent(ctx, node, x, y, theme) {
    const cfg = theme.nodeTypes.referent;
    ctx.beginPath();
    ctx.moveTo(x, y - 20);
    ctx.lineTo(x + 22, y);
    ctx.lineTo(x, y + 20);
    ctx.lineTo(x - 22, y);
    ctx.closePath();
    ctx.fillStyle = cfg.fill;
    ctx.fill();
    ctx.strokeStyle = cfg.stroke;
    ctx.lineWidth = 1.2;
    ctx.setLineDash(cfg.dash ?? [3, 2]);
    ctx.stroke();
    ctx.fillStyle = cfg.stroke;
    ctx.font = `400 8.5px ${theme.font}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(node.label ?? "", x, y - 2);
    ctx.fillStyle = theme.nodeSubLabel ?? "rgba(34,32,43,0.45)";
    ctx.font = `500 6.5px ${theme.font}`;
    ctx.setLineDash([]);
    ctx.fillText("REFERENT", x, y + 12);
  }
  function drawElement(ctx, node, x, y, theme) {
    const stroke = langColor(theme, node.lang);
    ctx.save();
    ctx.globalAlpha *= theme.nodeTypes.element.opacity ?? 0.65;
    ctx.beginPath();
    ctx.roundRect(x - 44, y - 11, 88, 22, 11);
    ctx.fillStyle = theme.nodeTypes.element.fill;
    ctx.fill();
    ctx.strokeStyle = stroke;
    ctx.lineWidth = 1;
    ctx.setLineDash([]);
    ctx.stroke();
    ctx.fillStyle = stroke;
    ctx.font = `italic 400 8px ${theme.font}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(node.label ?? "", x, y + 3);
    ctx.restore();
  }
  function drawAttestation(ctx, node, x, y, theme) {
    ctx.beginPath();
    ctx.arc(x, y, 8, 0, Math.PI * 2);
    ctx.fillStyle = theme.nodeTypes.attestation.fill;
    ctx.fill();
    ctx.strokeStyle = theme.nodeTypes.attestation.stroke;
    ctx.lineWidth = 1.1;
    ctx.setLineDash([]);
    ctx.stroke();
    ctx.fillStyle = theme.nodeTypes.attestation.stroke;
    ctx.font = `500 6.5px ${theme.font}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(node.label ?? "", x, y + 2.5);
  }
  function drawStub(ctx, node, x, y, theme) {
    const text = node.label ?? `+${node.count ?? ""}`;
    ctx.font = `600 11px ${theme.font}`;
    const w = Math.max(34, ctx.measureText(text).width + 16), h = 22;
    ctx.beginPath();
    ctx.roundRect(x - w / 2, y - h / 2, w, h, h / 2);
    ctx.fillStyle = theme.nodeFill ?? "#ffffff";
    ctx.fill();
    ctx.setLineDash([3, 2]);
    ctx.lineWidth = 1.2;
    ctx.strokeStyle = theme.accent ?? theme.centerGlow;
    ctx.stroke();
    ctx.setLineDash([]);
    ctx.fillStyle = theme.accent ?? theme.centerGlow;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x, y + 0.5);
  }
  function isBatchableDisc(node) {
    const t = node.type;
    if (t === "surname" || t === "concept" || t === "referent" || t === "element" || t === "attestation" || t === "flag" || t === "image" || t === "stub") return false;
    return !node.countriesData && !(node.flags && node.flags.length) && !(node.countries && node.countries.length);
  }
  function drawDiscBatch(ctx, items, theme) {
    const buckets = /* @__PURE__ */ new Map();
    for (const it of items) {
      const a = Math.round(it.opacity * 20) / 20;
      if (a <= 0) continue;
      let b = buckets.get(a);
      if (!b) buckets.set(a, b = []);
      b.push(it);
    }
    const fill = theme.nodeFill ?? "#ffffff";
    const ink = theme.nodeLabel ?? "#22202b";
    const subInk = theme.nodeSubLabel ?? "rgba(34,32,43,0.45)";
    const halo = theme.labelBackground ?? theme.background;
    ctx.save();
    ctx.setLineDash([]);
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    for (const [a, list] of buckets) {
      ctx.globalAlpha = a;
      ctx.beginPath();
      for (const it of list) {
        ctx.moveTo(it.x + it.r, it.y);
        ctx.arc(it.x, it.y, it.r, 0, Math.PI * 2);
      }
      ctx.fillStyle = fill;
      ctx.fill();
      const byStroke = /* @__PURE__ */ new Map();
      for (const it of list) {
        const n = it.node;
        let stroke = langColor(theme, n.lang);
        if (n.type === "given" && n.gender && theme.genderColors?.[n.gender]) stroke = theme.genderColors[n.gender];
        let g = byStroke.get(stroke);
        if (!g) byStroke.set(stroke, g = []);
        g.push(it);
      }
      ctx.lineWidth = 1.6;
      for (const [stroke, g] of byStroke) {
        ctx.beginPath();
        for (const it of g) {
          ctx.moveTo(it.x + it.r, it.y);
          ctx.arc(it.x, it.y, it.r, 0, Math.PI * 2);
        }
        ctx.strokeStyle = stroke;
        ctx.stroke();
      }
      const labelled = list.filter((it) => !it.node._noLabel).map((it) => {
        const n = it.node, lp = n._lp;
        const text = lp ? lp.text : String(n.label ?? "");
        const show = !(lp && lp.hidden) && text;
        return { it, n, lp, text, show, size: labelFontSize(n, false) };
      });
      labelled.sort((p, q) => p.size - q.size);
      let font = "";
      ctx.fillStyle = ink;
      const outside = [];
      for (const L of labelled) {
        if (!L.show) continue;
        if (L.lp && !L.lp.inside) {
          outside.push(L);
          continue;
        }
        const f2 = `700 ${L.size}px ${theme.font}`;
        if (f2 !== font) {
          ctx.font = f2;
          font = f2;
        }
        ctx.fillText(L.text, L.it.x, L.it.y + insideLabelOffset(L.n, false));
      }
      if (outside.length) {
        ctx.lineWidth = 3;
        ctx.lineJoin = "round";
        ctx.strokeStyle = halo;
        for (const L of outside) {
          const f2 = `700 ${L.size}px ${theme.font}`;
          if (f2 !== font) {
            ctx.font = f2;
            font = f2;
          }
          ctx.strokeText(L.text, L.it.x + L.lp.dx, L.it.y + L.lp.dy);
          ctx.fillText(L.text, L.it.x + L.lp.dx, L.it.y + L.lp.dy);
        }
      }
      if (list[0] && list[0].node._noSub) continue;
      ctx.fillStyle = subInk;
      ctx.font = font = `500 7px ${theme.font}`;
      const ipas = [];
      for (const L of labelled) {
        const n = L.n;
        const mainInside = L.show && !(L.lp && !L.lp.inside);
        const labelY = L.it.y + insideLabelOffset(n, false);
        const subY = mainInside ? labelY + 11 : L.it.y;
        const sub = n.lang ? String(n.lang).toUpperCase() : n.type === "given" ? "GIVEN NAME" : String(n.type ?? "text").toUpperCase();
        ctx.fillText(sub, L.it.x, subY);
        if (n.ipa && mainInside) ipas.push([`/${n.ipa}/`, L.it.x, subY + 8]);
      }
      if (ipas.length) {
        ctx.font = `italic 400 6px ${theme.font}`;
        for (const [t, x, y] of ipas) ctx.fillText(t, x, y);
      }
    }
    ctx.restore();
  }

  // src/renderers/image.js
  var cache2 = /* @__PURE__ */ new Map();
  function drawImageNode(ctx, node, x, y, isCenter, theme) {
    const r = isCenter ? 38 : 22;
    const bitmap = cache2.get(node.imageUrl);
    ctx.save();
    ctx.globalAlpha = node._opacity ?? 1;
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    if (bitmap && bitmap !== "loading" && bitmap !== "error") {
      ctx.save();
      ctx.clip();
      ctx.drawImage(bitmap, x - r, y - r, r * 2, r * 2);
      ctx.restore();
    } else {
      ctx.fillStyle = theme.nodeFill ?? "#020f20";
      ctx.fill();
      _drawInitials(ctx, node.label, x, y, r, theme);
      if (node.imageUrl && bitmap !== "loading" && bitmap !== "error") _load(node.imageUrl);
    }
    ctx.strokeStyle = theme.nodeTypes.image.stroke;
    ctx.lineWidth = isCenter ? 2.5 : 1.7;
    ctx.setLineDash([]);
    ctx.stroke();
    ctx.restore();
  }
  function _drawInitials(ctx, label, x, y, r, theme) {
    const initials = (label ?? "?").split(" ").map((w) => w[0] ?? "").join("").slice(0, 2).toUpperCase();
    ctx.fillStyle = theme.centerGlow;
    ctx.font = `700 ${Math.round(r * 0.6)}px ${theme.font}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(initials, x, y);
  }
  function _load(url) {
    cache2.set(url, "loading");
    fetch(url).then((r) => r.blob()).then((blob) => createImageBitmap(blob)).then((bitmap) => cache2.set(url, bitmap)).catch(() => cache2.set(url, "error"));
  }

  // src/chips.js
  var CHIP_H = 15;
  var CHIP_FONT_PX = 9;
  function layoutChips(chips, x, y, r, opts) {
    if (!chips || !chips.length) return [];
    const max = opts.max ?? 4;
    const gap = opts.gap ?? 3;
    const padX = opts.padX ?? 5;
    const h = CHIP_H;
    const shown = chips.filter((c) => c && (opts.showSuppressed || c.status !== "suppressed" && c.status !== "excluded"));
    if (!shown.length) return [];
    let list = shown;
    if (shown.length > max) {
      const keep = shown.slice(0, Math.max(0, max - 1));
      const rest = shown.slice(keep.length);
      list = [...keep, { id: "+more", label: `+${rest.length}`, overflow: true, count: rest.length, hidden: rest }];
    }
    const items = list.map((c) => ({ chip: c, w: Math.ceil(opts.measure(String(c.label ?? "")) + padX * 2), h }));
    const rowWidth = opts.rowWidth ?? Math.max(2 * r + 48, 120);
    const rows = [];
    let cur = [], curW = 0;
    for (const it of items) {
      const add = (cur.length ? gap : 0) + it.w;
      if (cur.length && curW + add > rowWidth) {
        rows.push({ items: cur, w: curW });
        cur = [];
        curW = 0;
      }
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
  function hitTestChips(px, py, boxes, pad = 0) {
    for (let i = boxes.length - 1; i >= 0; i--) {
      const b = boxes[i];
      if (px >= b.x - pad && px <= b.x + b.w + pad && py >= b.y - pad && py <= b.y + b.h + pad) {
        return { nodeId: b.nodeId, chip: b.chip };
      }
    }
    return null;
  }
  function drawChip(ctx, box, theme, state = {}) {
    const { x, y, w, h, chip } = box;
    const active = state.active;
    ctx.save();
    ctx.setLineDash(chip.overflow ? [2, 2] : []);
    ctx.beginPath();
    if (ctx.roundRect) ctx.roundRect(x, y, w, h, h / 2);
    else ctx.rect(x, y, w, h);
    ctx.fillStyle = active ? theme.accent ?? theme.centerGlow : theme.chipFill ?? theme.nodeFill ?? "#fff";
    ctx.fill();
    ctx.lineWidth = active ? 1.4 : 0.9;
    ctx.strokeStyle = active ? theme.accent ?? theme.centerGlow : theme.chipStroke ?? theme.badgeBorder ?? "rgba(20,20,30,0.2)";
    ctx.stroke();
    ctx.fillStyle = active ? theme.chipActiveInk ?? "#fff" : theme.chipInk ?? theme.nodeLabel ?? "#22202b";
    ctx.font = `500 ${CHIP_FONT_PX}px ${theme.font}`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(String(chip.label ?? ""), x + w / 2, y + h / 2 + 0.5);
    if (chip.status === "disputed" || chip.status === "suppressed" || chip.status === "excluded") {
      ctx.beginPath();
      ctx.moveTo(x + 4, y + h / 2);
      ctx.lineTo(x + w - 4, y + h / 2);
      ctx.lineWidth = 1;
      ctx.strokeStyle = ctx.fillStyle;
      ctx.stroke();
    }
    ctx.restore();
  }
  function drawChipBatch(ctx, boxes, theme) {
    const buckets = /* @__PURE__ */ new Map();
    for (const b of boxes) {
      const a = Math.round((b.opacity ?? 1) * 20) / 20;
      if (a <= 0) continue;
      let l = buckets.get(a);
      if (!l) buckets.set(a, l = []);
      l.push(b);
    }
    const rr = (b) => {
      if (ctx.roundRect) ctx.roundRect(b.x, b.y, b.w, b.h, b.h / 2);
      else ctx.rect(b.x, b.y, b.w, b.h);
    };
    ctx.save();
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.font = `500 ${CHIP_FONT_PX}px ${theme.font}`;
    for (const [a, list] of buckets) {
      ctx.globalAlpha = a;
      ctx.beginPath();
      for (const b of list) rr(b);
      ctx.fillStyle = theme.chipFill ?? theme.nodeFill ?? "#fff";
      ctx.fill();
      ctx.lineWidth = 0.9;
      ctx.strokeStyle = theme.chipStroke ?? theme.badgeBorder ?? "rgba(20,20,30,0.2)";
      ctx.beginPath();
      let dashed = false;
      for (const b of list) {
        if (b.chip.overflow) dashed = true;
        else rr(b);
      }
      ctx.setLineDash([]);
      ctx.stroke();
      if (dashed) {
        ctx.beginPath();
        for (const b of list) if (b.chip.overflow) rr(b);
        ctx.setLineDash([2, 2]);
        ctx.stroke();
        ctx.setLineDash([]);
      }
      ctx.fillStyle = theme.chipInk ?? theme.nodeLabel ?? "#22202b";
      let struck = false;
      for (const b of list) {
        ctx.fillText(String(b.chip.label ?? ""), b.x + b.w / 2, b.y + b.h / 2 + 0.5);
        const st = b.chip.status;
        if (st === "disputed" || st === "suppressed" || st === "excluded") struck = true;
      }
      if (struck) {
        ctx.beginPath();
        for (const b of list) {
          const st = b.chip.status;
          if (st !== "disputed" && st !== "suppressed" && st !== "excluded") continue;
          ctx.moveTo(b.x + 4, b.y + b.h / 2);
          ctx.lineTo(b.x + b.w - 4, b.y + b.h / 2);
        }
        ctx.lineWidth = 1;
        ctx.strokeStyle = ctx.fillStyle;
        ctx.stroke();
      }
    }
    ctx.restore();
  }

  // src/hulls.js
  function convexHull(points) {
    const pts = points.slice().sort((a, b) => a[0] - b[0] || a[1] - b[1]);
    if (pts.length <= 2) return pts;
    const cross = (o, a, b) => (a[0] - o[0]) * (b[1] - o[1]) - (a[1] - o[1]) * (b[0] - o[0]);
    const lower = [];
    for (const p of pts) {
      while (lower.length >= 2 && cross(lower[lower.length - 2], lower[lower.length - 1], p) <= 0) lower.pop();
      lower.push(p);
    }
    const upper = [];
    for (let i = pts.length - 1; i >= 0; i--) {
      const p = pts[i];
      while (upper.length >= 2 && cross(upper[upper.length - 2], upper[upper.length - 1], p) <= 0) upper.pop();
      upper.push(p);
    }
    upper.pop();
    lower.pop();
    return lower.concat(upper);
  }
  function hullPolygon(circles, pad = 12, samples = 12) {
    const pts = [];
    for (const c of circles) {
      const R = c.r + pad;
      for (let i = 0; i < samples; i++) {
        const a = i / samples * Math.PI * 2;
        pts.push([c.x + R * Math.cos(a), c.y + R * Math.sin(a)]);
      }
    }
    return convexHull(pts);
  }
  function traceSmooth(ctx, poly) {
    const n = poly.length;
    if (n < 3) return;
    const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const m0 = mid(poly[n - 1], poly[0]);
    ctx.moveTo(m0[0], m0[1]);
    for (let i = 0; i < n; i++) {
      const p = poly[i], m = mid(p, poly[(i + 1) % n]);
      ctx.quadraticCurveTo(p[0], p[1], m[0], m[1]);
    }
    ctx.closePath();
  }
  function smoothPathD(poly) {
    const n = poly.length;
    if (n < 3) return "";
    const f2 = (v) => Math.round(v * 10) / 10;
    const mid = (a, b) => [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2];
    const m0 = mid(poly[n - 1], poly[0]);
    let d = `M${f2(m0[0])} ${f2(m0[1])}`;
    for (let i = 0; i < n; i++) {
      const p = poly[i], m = mid(p, poly[(i + 1) % n]);
      d += `Q${f2(p[0])} ${f2(p[1])} ${f2(m[0])} ${f2(m[1])}`;
    }
    return d + "Z";
  }
  function hullTop(poly) {
    let best = poly[0];
    for (const p of poly) if (p[1] < best[1]) best = p;
    return best;
  }

  // src/hash.js
  function hashString(str) {
    let h = 2166136261;
    const s = String(str);
    for (let i = 0; i < s.length; i++) {
      h ^= s.charCodeAt(i);
      h = Math.imul(h, 16777619);
    }
    return h >>> 0;
  }
  function seededRandom(seed) {
    let a = seed >>> 0;
    return function() {
      a = a + 1831565813 >>> 0;
      let t = a;
      t = Math.imul(t ^ t >>> 15, t | 1);
      t ^= t + Math.imul(t ^ t >>> 7, t | 61);
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }
  function jitter(id, amp) {
    const r = seededRandom(hashString(id));
    return { dx: (r() - 0.5) * amp, dy: (r() - 0.5) * amp };
  }

  // src/renderer.js
  function visualRadius(node, isCenter) {
    let base;
    const type = node ? node.type : "text";
    if (isCenter) base = 38;
    else if (type === "attestation") base = 8;
    else if (type === "concept") base = 18;
    else if (type === "referent") base = 20;
    else if (type === "element") base = 12;
    else if (type === "stub") base = 16;
    else base = 22;
    const popularity = node && node.popularity != null ? node.popularity : 0.5;
    return base * (0.7 + 0.6 * popularity);
  }
  var NON_DISC_TYPES = /* @__PURE__ */ new Set(["surname", "concept", "referent", "element", "attestation", "flag", "image", "stub"]);
  function hasDiscLabel(node) {
    return !NON_DISC_TYPES.has(node.type);
  }
  var DEFAULT_PERF = {
    maxDpr: 2,
    // cap device pixel ratio (fill cost grows with dpr²)
    shadowMaxNodes: 80,
    // above this many nodes, node drop shadows are skipped
    labelMinScale: 0.5,
    // below this zoom, only the centre keeps its label
    chipMinScale: 0.7,
    // below this zoom, chips are not drawn
    hullQuantum: 4,
    // hull outlines are recomputed only when members move this far (px)
    idleRedrawMs: 250,
    // when nothing moves, redraw at most this often (late image loads)
    floatMaxNodes: 80,
    // the theme's resting float is switched off above this many nodes
    layerCache: true,
    // when nothing moves, the scene is drawn once to an offscreen layer and blitted
    layerMaxPixels: 3,
    // layer budget, in multiples of the on-screen canvas area
    motionLOD: true,
    // while a large scene animates: no chips, sub-labels or edge marks, dashes drawn solid
    lodMinNodes: 150
  };
  var Renderer = class {
    /**
     * @param {HTMLElement} container
     * @param {object}      theme  resolveTheme() output
     * @param {object}      [perf] overrides of DEFAULT_PERF
     */
    constructor(container, theme, perf = {}) {
      this.theme = theme;
      this.perf = { ...DEFAULT_PERF, ...perf };
      this.canvas = document.createElement("canvas");
      this.canvas.style.cssText = "width:100%;height:100%;display:block;touch-action:none;";
      container.appendChild(this.canvas);
      this.ctx = this.canvas.getContext("2d");
      this._dpr = Math.min(this.perf.maxDpr, typeof window !== "undefined" && window.devicePixelRatio || 1);
      this._rafId = null;
      this._panX = 0;
      this._panY = 0;
      this._scale = 1;
      this.springNodes = /* @__PURE__ */ new Map();
      this.nodes = [];
      this.edges = [];
      this.groups = [];
      this.centerId = null;
      this.loading = false;
      this.hoveredId = null;
      this.focusedId = null;
      this.hoveredEdgeId = null;
      this.selectedEdgeId = null;
      this.focusedEdgeId = null;
      this.hoveredChip = null;
      this.focusedChip = null;
      this.highlightSet = null;
      this.nodeAlpha = null;
      this.edgeAlpha = null;
      this.labelPlacement = /* @__PURE__ */ new Map();
      this.backEdges = /* @__PURE__ */ new Set();
      this.showSuppressed = false;
      this.chipsFor = "all";
      this.chipMax = 4;
      this.showRings = true;
      this.reducedMotion = false;
      this.onFrame = null;
      this.nodeState = /* @__PURE__ */ new Map();
      this.edgeGeom = /* @__PURE__ */ new Map();
      this.chipBoxes = [];
      this._styles = null;
      this._chipCache = /* @__PURE__ */ new Map();
      this._hullCache = /* @__PURE__ */ new Map();
      this._measureCache = /* @__PURE__ */ new Map();
      this._dirty = true;
      this._lastDraw = 0;
      this._sceneVersion = 0;
      this._motionSeq = 0;
      this._layer = null;
      this._lastScaleChange = -1e9;
      this._lastScale = 1;
      this.interacting = false;
      this._rand = seededRandom(hashString("mondograph-idle"));
      this.W = 0;
      this.H = 0;
      this.onResize = null;
      this._resize();
      this._ro = new ResizeObserver(() => this._resize());
      this._ro.observe(container);
    }
    /** The scene changed (data, styles, labels, filter, theme): redraw and drop the cached layer. */
    invalidate() {
      this._dirty = true;
      this._sceneVersion++;
    }
    /** Only overlays changed (hover, focus, selection): the cached layer stays valid. */
    invalidateOverlay() {
      this._dirty = true;
    }
    /** Edge styles depend on theme, showSuppressed and backEdges: recompute lazily. */
    invalidateStyles() {
      this._styles = null;
      this._chipCache.clear();
      this.invalidate();
    }
    /** Cached text width for a CSS font string. */
    measure(text, font) {
      const key = font + "\0" + text;
      let w = this._measureCache.get(key);
      if (w == null) {
        this.ctx.font = font;
        w = this.ctx.measureText(text).width;
        if (this._measureCache.size > 2e4) this._measureCache.clear();
        this._measureCache.set(key, w);
      }
      return w;
    }
    _resize() {
      const dpr = this._dpr;
      const W = this.canvas.offsetWidth || this.canvas.parentElement?.offsetWidth || 600;
      const H = this.canvas.offsetHeight || this.canvas.parentElement?.offsetHeight || 400;
      if (W === this.W && H === this.H && this.canvas.width === Math.round(W * dpr)) return;
      this.canvas.width = Math.round(W * dpr);
      this.canvas.height = Math.round(H * dpr);
      this.W = W;
      this.H = H;
      this.ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      this._dirty = true;
      if (this.onResize) this.onResize(this.W, this.H);
    }
    get containerSize() {
      return { W: this.W, H: this.H };
    }
    start() {
      if (this._rafId != null) return;
      const loop = (now) => {
        this._rafId = requestAnimationFrame(loop);
        this.frame(now);
      };
      this._rafId = requestAnimationFrame(loop);
    }
    /** One animation step + draw when needed. Exposed for tests/benchmarks. */
    frame(now = typeof performance !== "undefined" ? performance.now() : Date.now()) {
      let moving = false;
      const frozen = this.interacting && this._settled();
      const floating = frozen ? false : this._applyMotion();
      if (frozen) {
        for (const s of this.springNodes.values()) {
          s.vx = 0;
          s.vy = 0;
        }
      } else if (this.reducedMotion) {
        for (const s of this.springNodes.values()) {
          if (s.x !== s.targetX || s.y !== s.targetY || s.opacity !== s.targetOpacity) {
            s.x = s.targetX;
            s.y = s.targetY;
            s.opacity = s.targetOpacity;
            s.vx = s.vy = s.vOpacity = 0;
            moving = true;
          }
        }
      } else {
        tickSprings(this.springNodes, this.theme.spring, this.theme.opacitySpring);
        for (const s of this.springNodes.values()) {
          if (Math.abs(s.vx) > 0.01 || Math.abs(s.vy) > 0.01 || Math.abs(s.opacity - s.targetOpacity) > 4e-3) {
            moving = true;
            break;
          }
        }
      }
      for (const [id, s] of this.springNodes) {
        if (s.opacity < 0.01 && s.targetOpacity === 0) this.springNodes.delete(id);
      }
      if (moving || floating) this._motionSeq++;
      this._movingNow = moving || floating;
      if (this._scale !== this._lastScale) {
        this._lastScale = this._scale;
        this._lastScaleChange = now;
      }
      this._now = now;
      const idle = !(moving || floating || this._dirty || this.loading || this._animatedEdges);
      if (idle && now - this._lastDraw < this.perf.idleRedrawMs) return false;
      this._dirty = false;
      this._lastDraw = now;
      const t0 = typeof performance !== "undefined" ? performance.now() : Date.now();
      this._draw(this.ctx, this.W, this.H, { overlays: true });
      if (this.onFrame) {
        const t1 = typeof performance !== "undefined" ? performance.now() : Date.now();
        this.onFrame({ drawMs: t1 - t0, nodes: this.nodes.length, edges: this.edges.length });
      }
      return true;
    }
    /** True when every node is near its target (the resting float stays within this) and faded in/out. */
    _settled() {
      for (const s of this.springNodes.values()) {
        if (Math.abs(s.x - s.targetX) > 8 || Math.abs(s.y - s.targetY) > 8 || Math.abs(s.opacity - s.targetOpacity) > 0.02) return false;
      }
      return true;
    }
    stop() {
      if (this._rafId != null) cancelAnimationFrame(this._rafId);
      this._rafId = null;
    }
    _styleMap() {
      if (!this._styles) {
        const st = /* @__PURE__ */ new Map();
        const state = { showSuppressed: this.showSuppressed, backEdges: this.backEdges };
        let animated = false;
        for (const e of this.edges) {
          const s = resolveEdgeStyle(e, this.theme, state);
          if (s.animate) animated = true;
          st.set(e.id, s);
        }
        this._styles = st;
        this._animatedEdges = animated;
      }
      return this._styles;
    }
    /** Recompute node state, edge geometry and chip boxes for the current positions. */
    _updateGeometry() {
      const ns = this.nodeState;
      const live = /* @__PURE__ */ new Set();
      for (const n of this.nodes) {
        const s = this.springNodes.get(n.id);
        if (!s) continue;
        live.add(n.id);
        let o = ns.get(n.id);
        if (!o) ns.set(n.id, o = { x: 0, y: 0, opacity: 1, visualRadius: 0 });
        o.x = s.x;
        o.y = s.y;
        o.opacity = s.opacity * (this.nodeAlpha ? this.nodeAlpha(n.id) : 1);
        o.visualRadius = visualRadius(n, n.id === this.centerId);
      }
      for (const id of ns.keys()) if (!live.has(id)) ns.delete(id);
      const styles = this._styleMap();
      this.edgeGeom = computeEdgeGeometry(this.edges, ns, (e) => styles.get(e.id)?.arrow ?? false);
      this._updateChips();
    }
    _chipsVisibleFor(n) {
      if (!n.chips || !n.chips.length || this.chipsFor === "none") return false;
      if (this.chipsFor === "focus") {
        return n.id === this.centerId || n.id === this.hoveredId || n.id === this.focusedId || this.hoveredChip && this.hoveredChip.nodeId === n.id;
      }
      return true;
    }
    /** Chip boxes relative to a node, cached per node until styles change. */
    chipOffsets(n) {
      let c = this._chipCache.get(n.id);
      if (c && c.chips === n.chips && c.center === (n.id === this.centerId)) return c.boxes;
      const r = visualRadius(n, n.id === this.centerId);
      const font = `500 ${CHIP_FONT_PX}px ${this.theme.font}`;
      const boxes = layoutChips(n.chips, 0, 0, r, {
        max: this.chipMax,
        showSuppressed: this.showSuppressed,
        measure: (t) => this.measure(t, font)
      });
      this._chipCache.set(n.id, { chips: n.chips, center: n.id === this.centerId, boxes });
      return boxes;
    }
    _updateChips() {
      const out = [];
      if (this._scale >= this.perf.chipMinScale) {
        for (const n of this.nodes) {
          if (!this._chipsVisibleFor(n)) continue;
          const o = this.nodeState.get(n.id);
          if (!o || o.opacity < 0.3) continue;
          for (const b of this.chipOffsets(n)) {
            out.push({ nodeId: n.id, chip: b.chip, x: o.x + b.x, y: o.y + b.y, w: b.w, h: b.h, opacity: o.opacity });
          }
        }
      }
      this.chipBoxes = out;
    }
    /**
     * Draw one frame into `ctx` (logical W×H; the caller sets the device transform).
     * @param {{overlays?:boolean}} opts  overlays = spinner + reset button
     */
    _draw(ctx, W, H, opts = {}) {
      const theme = this.theme;
      this._updateGeometry();
      theme._noShadow = this.nodes.length > this.perf.shadowMaxNodes;
      ctx.clearRect(0, 0, W, H);
      ctx.fillStyle = theme.background;
      ctx.fillRect(0, 0, W, H);
      const layer = opts.overlays && this._cacheable() ? this._ensureLayer(W, H) : null;
      if (layer) {
        ctx.save();
        ctx.setTransform(1, 0, 0, 1, 0, 0);
        const dpr = this._dpr;
        ctx.drawImage(
          layer.canvas,
          Math.round((this._panX + layer.x0 * this._scale) * dpr),
          Math.round((this._panY + layer.y0 * this._scale) * dpr)
        );
        ctx.restore();
        this.layerHits = (this.layerHits ?? 0) + 1;
      } else {
        const lod = this.perf.motionLOD && this._movingNow && this.nodes.length > this.perf.lodMinNodes;
        ctx.save();
        ctx.translate(this._panX, this._panY);
        ctx.scale(this._scale, this._scale);
        this._drawBase(ctx, W, H, lod);
        ctx.restore();
      }
      ctx.save();
      ctx.translate(this._panX, this._panY);
      ctx.scale(this._scale, this._scale);
      this._drawOverlay(ctx);
      ctx.restore();
      if (opts.overlays) {
        if (this.loading) this._drawSpinner(ctx, W / 2, H / 2);
        this._drawResetBtn(ctx, W, H);
      }
    }
    /** Everything that does not depend on hover / focus / selection (world coordinates). */
    _drawBase(ctx, W, H, lod = false) {
      if (this.showRings) this._drawRings(ctx, W, H);
      else this._drawAura(ctx, Math.min(W, H));
      this._drawHulls(ctx);
      drawEdges(ctx, this.edges, this.nodeState, this.theme, {
        geometry: this.edgeGeom,
        styles: this._styleMap(),
        edgeAlpha: this.edgeAlpha,
        lod
      });
      this._drawNodes(ctx, lod);
      if (!lod) this._drawChips(ctx);
    }
    /** Hovered / selected / focused edges and chips, highlight, hover and focus rings. */
    _drawOverlay(ctx) {
      const ids = [this.hoveredEdgeId, this.selectedEdgeId, this.focusedEdgeId].filter(Boolean);
      if (ids.length) {
        const set = new Set(ids);
        const list = this.edges.filter((e) => set.has(e.id));
        drawEdges(ctx, list, this.nodeState, this.theme, {
          geometry: this.edgeGeom,
          styles: this._styleMap(),
          edgeAlpha: this.edgeAlpha,
          hoveredEdgeId: this.hoveredEdgeId,
          selectedEdgeId: this.selectedEdgeId,
          focusedEdgeId: this.focusedEdgeId
        });
      }
      const hc = this.hoveredChip, fc = this.focusedChip;
      if (hc || fc) {
        for (const b of this.chipBoxes) {
          const active = hc && hc.nodeId === b.nodeId && hc.chipId === b.chip.id || fc && fc.nodeId === b.nodeId && fc.chipId === b.chip.id;
          if (!active) continue;
          ctx.save();
          ctx.globalAlpha = b.opacity;
          drawChip(ctx, b, this.theme, { active: true });
          ctx.restore();
        }
      }
      this._drawHighlights(ctx);
      this._drawHoverRing(ctx);
      this._drawFocusRing(ctx);
    }
    _cacheable() {
      return this.perf.layerCache && !this._movingNow && !this.loading && !this._animatedEdges && (this._now ?? 0) - this._lastScaleChange > 150 && this.nodes.length > 0;
    }
    /** The scene drawn once into an offscreen canvas covering the content's world bounds. */
    _ensureLayer(W, H) {
      const dpr = this._dpr, sc = this._scale;
      const key = `${this._sceneVersion}|${this._motionSeq}|${sc}|${dpr}|${W}|${H}`;
      if (this._layer && this._layer.key === key) return this._layer.ok ? this._layer : null;
      let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
      for (const o of this.nodeState.values()) {
        if (o.opacity < 0.01) continue;
        const m = o.visualRadius + 90;
        x0 = Math.min(x0, o.x - m);
        x1 = Math.max(x1, o.x + m);
        y0 = Math.min(y0, o.y - m);
        y1 = Math.max(y1, o.y + m);
      }
      for (const b of this.chipBoxes) {
        x0 = Math.min(x0, b.x - 4);
        x1 = Math.max(x1, b.x + b.w + 4);
        y1 = Math.max(y1, b.y + b.h + 4);
      }
      if (this.showRings) {
        const r = Math.min(W, H) * 0.5 + 2;
        x0 = Math.min(x0, W / 2 - r);
        x1 = Math.max(x1, W / 2 + r);
        y0 = Math.min(y0, H / 2 - r);
        y1 = Math.max(y1, H / 2 + r);
      }
      const pw = Math.ceil((x1 - x0) * sc * dpr), ph = Math.ceil((y1 - y0) * sc * dpr);
      const budget = this.perf.layerMaxPixels * this.canvas.width * this.canvas.height;
      if (!(pw > 0 && ph > 0) || pw * ph > budget || pw > 8192 || ph > 8192) {
        this._layer = { key, ok: false };
        return null;
      }
      let canvas = this._layer?.canvas;
      if (!canvas) canvas = document.createElement("canvas");
      if (canvas.width !== pw || canvas.height !== ph) {
        canvas.width = pw;
        canvas.height = ph;
      }
      const lctx = canvas.getContext("2d");
      lctx.setTransform(1, 0, 0, 1, 0, 0);
      lctx.clearRect(0, 0, pw, ph);
      lctx.setTransform(sc * dpr, 0, 0, sc * dpr, -x0 * sc * dpr, -y0 * sc * dpr);
      this._drawBase(lctx, W, H);
      this._layer = { key, ok: true, canvas, x0, y0 };
      this.layerBuilds = (this.layerBuilds ?? 0) + 1;
      return this._layer;
    }
    _drawAura(ctx, min) {
      const cp = this.springNodes.get(this.centerId);
      if (!cp || !this.theme.centerAura) return;
      ctx.save();
      const aura = this.theme.centerAura;
      const grad = ctx.createRadialGradient(cp.x, cp.y, 0, cp.x, cp.y, min * 0.18);
      grad.addColorStop(0, aura);
      grad.addColorStop(1, aura.replace(/[\d.]+\)$/, "0)"));
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cp.x, cp.y, min * 0.18, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
    _drawRings(ctx, W, H) {
      const min = Math.min(W, H);
      [0.22, 0.38, 0.5].forEach((f2, i) => {
        ctx.save();
        ctx.globalAlpha = 0.12 - i * 0.03;
        ctx.strokeStyle = this.theme.ringStroke;
        ctx.lineWidth = 0.5;
        ctx.setLineDash([]);
        ctx.beginPath();
        ctx.arc(W / 2, H / 2, min * f2, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
      });
      ctx.save();
      const cp = this.springNodes.get(this.centerId);
      if (cp) {
        const aura = this.theme.centerAura ?? "rgba(2,185,185,.18)";
        const grad = ctx.createRadialGradient(cp.x, cp.y, 0, cp.x, cp.y, min * 0.18);
        grad.addColorStop(0, aura);
        grad.addColorStop(1, aura.replace(/[\d.]+\)$/, "0)"));
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.arc(cp.x, cp.y, min * 0.18, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
    /** Hull polygons for the current frame (cached while members stay within hullQuantum px). */
    hullShapes() {
      const out = [];
      const q = this.perf.hullQuantum;
      const keep = /* @__PURE__ */ new Set();
      for (const g of this.groups || []) {
        const circles = [];
        let sig = "";
        let alpha = 0;
        for (const id of g.members || []) {
          const o = this.nodeState.get(id);
          if (!o || o.opacity < 0.05) continue;
          circles.push({ x: o.x, y: o.y, r: o.visualRadius });
          sig += id + ":" + Math.round(o.x / q) + "," + Math.round(o.y / q) + ";";
          alpha = Math.max(alpha, o.opacity);
        }
        if (!circles.length) continue;
        keep.add(g.id);
        let c = this._hullCache.get(g.id);
        if (!c || c.sig !== sig) {
          const poly = hullPolygon(circles, g.padding ?? 12);
          c = { sig, poly, top: hullTop(poly) };
          this._hullCache.set(g.id, c);
        }
        out.push({ group: g, poly: c.poly, top: c.top, alpha });
      }
      for (const id of this._hullCache.keys()) if (!keep.has(id)) this._hullCache.delete(id);
      return out;
    }
    _drawHulls(ctx) {
      if (!this.groups || !this.groups.length) return;
      const theme = this.theme;
      const a = theme.hullAlpha ?? 0.08;
      for (const h of this.hullShapes()) {
        const color = h.group.color ?? theme.hullColor ?? theme.accent ?? "#0d9488";
        ctx.save();
        ctx.beginPath();
        traceSmooth(ctx, h.poly);
        ctx.globalAlpha = a * h.alpha;
        ctx.fillStyle = color;
        ctx.fill();
        ctx.globalAlpha = Math.min(1, a * 3) * h.alpha;
        ctx.strokeStyle = color;
        ctx.lineWidth = 1;
        ctx.setLineDash([]);
        ctx.stroke();
        if (h.group.label && this._scale >= this.perf.labelMinScale) {
          ctx.globalAlpha = Math.min(1, 0.85 * h.alpha);
          ctx.fillStyle = color;
          ctx.font = `600 10px ${theme.font}`;
          ctx.textAlign = "center";
          ctx.textBaseline = "bottom";
          ctx.fillText(String(h.group.label), h.top[0], h.top[1] - 3);
        }
        ctx.restore();
      }
    }
    _drawNodes(ctx, lod = false) {
      const lowZoom = this._scale < this.perf.labelMinScale;
      const batch = this.theme._noShadow ? [] : null;
      for (const node of this.nodes) {
        const s = this.springNodes.get(node.id);
        const o = this.nodeState.get(node.id);
        if (!s || !o || o.opacity < 0.01) continue;
        const isCenter = node.id === this.centerId;
        node._opacity = o.opacity;
        node._lp = this.labelPlacement.get(node.id) ?? null;
        node._noLabel = lowZoom && !isCenter;
        node._noSub = lod;
        if (batch && !isCenter && isBatchableDisc(node)) {
          batch.push({ node, x: s.x, y: s.y, r: o.visualRadius, opacity: o.opacity });
          continue;
        }
        if (batch && batch.length) {
          drawDiscBatch(ctx, batch, this.theme);
          batch.length = 0;
        }
        if (node.type === "flag") {
          drawFlagNode(ctx, node, s.x, s.y, isCenter, this.theme);
        } else if (node.type === "image") {
          drawImageNode(ctx, node, s.x, s.y, isCenter, this.theme);
        } else {
          drawNode(ctx, node, s.x, s.y, isCenter, this.theme);
        }
      }
      if (batch && batch.length) drawDiscBatch(ctx, batch, this.theme);
    }
    _drawChips(ctx) {
      if (this.chipBoxes.length) drawChipBatch(ctx, this.chipBoxes, this.theme);
    }
    _ring(ctx, id, extra, color, alpha, dash, width = 2) {
      const node = this.nodes.find((n) => n.id === id);
      if (!node) return;
      const o = this.nodeState.get(id);
      if (!o || o.opacity < 0.01) return;
      ctx.save();
      ctx.globalAlpha = alpha;
      ctx.strokeStyle = color;
      ctx.lineWidth = width;
      ctx.setLineDash(dash);
      ctx.beginPath();
      ctx.arc(o.x, o.y, o.visualRadius + extra, 0, Math.PI * 2);
      ctx.stroke();
      ctx.restore();
    }
    _drawHighlights(ctx) {
      if (!this.highlightSet) return;
      for (const id of this.highlightSet) {
        if (this.nodeState.has(id)) this._ring(ctx, id, 4, this.theme.accent ?? this.theme.centerGlow, 0.9, [], 2.2);
      }
    }
    _drawHoverRing(ctx) {
      if (!this.hoveredId || this.hoveredId === this.centerId) return;
      this._ring(ctx, this.hoveredId, 6, this.theme.centerGlow, 0.45, []);
    }
    _drawFocusRing(ctx) {
      if (!this.focusedId) return;
      this._ring(ctx, this.focusedId, 9, this.theme.focusRing ?? "#fff", 0.85, [3, 3]);
    }
    _drawSpinner(ctx, x, y) {
      const t = Date.now() / 1e3;
      ctx.save();
      ctx.globalAlpha = 0.7;
      ctx.strokeStyle = this.theme.centerGlow;
      ctx.lineWidth = 2.5;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(x, y, 20, t * 3, t * 3 + 2);
      ctx.stroke();
      ctx.restore();
    }
    _drawResetBtn(ctx, W) {
      ctx.save();
      ctx.globalAlpha = 0.35;
      ctx.strokeStyle = this.theme.uiMuted ?? this.theme.ringStroke;
      ctx.fillStyle = this.theme.uiMuted ?? this.theme.ringStroke;
      ctx.lineWidth = 1.5;
      ctx.setLineDash([]);
      const bx = W - 22, by = 22;
      ctx.beginPath();
      ctx.arc(bx, by, 10, -Math.PI * 0.8, Math.PI * 0.8);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(bx + 8, by);
      ctx.lineTo(bx + 4, by - 4);
      ctx.lineTo(bx + 4, by + 4);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    }
    /**
     * Subtle resting motion: a calm deterministic float (smooth sine drift per
     * node). The legacy idle noise (theme.spring.idleNoise) now draws from a
     * seeded generator (no unseeded randomness). Disabled under reduced motion.
     * @returns {boolean} whether anything was nudged
     */
    _applyMotion() {
      if (this.reducedMotion) return false;
      const fl = this.theme.float;
      if (fl && fl.amp && this.nodes.length <= this.perf.floatMaxNodes) {
        this._t = (this._t ?? 0) + 1;
        let i = 0;
        for (const [id, s] of this.springNodes) {
          if (id === this.centerId || s.targetOpacity === 0) {
            i++;
            continue;
          }
          const phase = id.length * 1.7 + i * 0.9;
          s.vx += Math.cos(this._t * fl.speed + phase) * fl.amp;
          s.vy += Math.sin(this._t * fl.speed * 1.3 + phase) * fl.amp;
          i++;
        }
        return this.springNodes.size > 1;
      }
      const amp = this.theme.spring.idleNoise ?? 0;
      if (amp === 0 || this.nodes.length > this.perf.floatMaxNodes) return false;
      for (const [id, s] of this.springNodes) {
        if (id === this.centerId || s.targetOpacity === 0) continue;
        s.vx += (this._rand() - 0.5) * 2 * amp;
        s.vy += (this._rand() - 0.5) * 2 * amp;
      }
      return this.springNodes.size > 1;
    }
    /** Label placement inputs for the current scene at the given positions. */
    labelItems(positions) {
      const items = [];
      for (const n of this.nodes) {
        if (!hasDiscLabel(n)) continue;
        const p = positions.get(n.id);
        if (!p) continue;
        const isCenter = n.id === this.centerId;
        items.push({
          id: n.id,
          x: p.x,
          y: p.y,
          r: visualRadius(n, isCenter),
          text: String(n.label ?? ""),
          size: labelFontSize(n, isCenter),
          insideY: insideLabelOffset(n, isCenter),
          fixed: isCenter,
          fitW: 2 * visualRadius(n, isCenter) - 4,
          priority: n.importance ?? n.popularity ?? 0.5
        });
      }
      return items;
    }
    /** A resolved, renderer-independent description of the current frame (for SVG export). */
    snapshotScene({ fit = true, margin = 24 } = {}) {
      this._updateGeometry();
      const theme = this.theme;
      const styles = this._styleMap();
      const scene = {
        W: this.W,
        H: this.H,
        vx: 0,
        vy: 0,
        background: theme.background,
        font: theme.font,
        ink: theme.nodeLabel ?? "#22202b",
        hulls: [],
        edges: [],
        nodes: [],
        chips: []
      };
      const ha = theme.hullAlpha ?? 0.08;
      for (const h of this.hullShapes()) {
        scene.hulls.push({
          d: smoothPathD(h.poly),
          color: h.group.color ?? theme.hullColor ?? theme.accent,
          alpha: ha * h.alpha,
          label: h.group.label,
          lx: h.top[0],
          ly: h.top[1]
        });
      }
      const active = new Set([this.hoveredEdgeId, this.selectedEdgeId, this.focusedEdgeId].filter(Boolean));
      for (const e of this.edges) {
        const st = styles.get(e.id), g = this.edgeGeom.get(e.id);
        if (!st || st.hidden || !g) continue;
        const a = this.nodeState.get(e.from), b = this.nodeState.get(e.to);
        const alpha = Math.min(a.opacity, b.opacity) * st.alpha * (this.edgeAlpha ? this.edgeAlpha(e) : 1);
        if (alpha < 0.01) continue;
        scene.edges.push({
          x1: g.x1,
          y1: g.y1,
          x2: g.x2,
          y2: g.y2,
          stroke: active.has(e.id) ? theme.accent ?? st.stroke : st.stroke,
          width: st.width,
          dash: st.dash,
          alpha,
          arrow: st.arrow,
          strike: st.strike,
          uncertain: st.uncertain,
          label: active.has(e.id) ? e.label : void 0
        });
      }
      for (const n of this.nodes) {
        const o = this.nodeState.get(n.id);
        if (!o || o.opacity < 0.01) continue;
        const isCenter = n.id === this.centerId;
        const lp = this.labelPlacement.get(n.id);
        let stroke = langColor(theme, n.lang);
        if (n.gender && theme.genderColors?.[n.gender]) stroke = theme.genderColors[n.gender];
        const size = labelFontSize(n, isCenter);
        const node = {
          id: n.id,
          x: o.x,
          y: o.y,
          r: o.visualRadius,
          fill: theme.nodeFill ?? "#ffffff",
          stroke,
          strokeWidth: isCenter ? 2.6 : 1.6,
          ink: theme.nodeLabel ?? "#22202b",
          subInk: theme.nodeSubLabel,
          alpha: o.opacity,
          labelSize: size
        };
        if (n.type === "stub") {
          Object.assign(node, { shape: "pill", w: 40, h: 22, stroke: theme.accent ?? theme.centerGlow, label: n.label, labelSize: 11 });
        } else if (lp && !lp.hidden) {
          node.label = lp.text;
          node.labelX = o.x + lp.dx;
          node.labelY = o.y + lp.dy;
          if (lp.inside) {
            node.sub = n.lang ? String(n.lang).toUpperCase() : void 0;
            node.subY = o.y + lp.dy + (isCenter ? 14 : 11);
          }
        } else if (!lp) {
          node.label = n.label;
          node.labelY = o.y + (hasDiscLabel(n) ? insideLabelOffset(n, isCenter) : o.visualRadius + 9);
        }
        scene.nodes.push(node);
      }
      for (const b of this.chipBoxes) {
        scene.chips.push({
          x: b.x,
          y: b.y,
          w: b.w,
          h: b.h,
          label: b.chip.label,
          fill: theme.chipFill ?? "#fff",
          stroke: theme.chipStroke ?? "rgba(20,20,30,0.2)",
          ink: theme.chipInk ?? "#22202b"
        });
      }
      if (fit && scene.nodes.length) {
        let x0 = Infinity, y0 = Infinity, x1 = -Infinity, y1 = -Infinity;
        for (const n of scene.nodes) {
          x0 = Math.min(x0, n.x - n.r - 40);
          x1 = Math.max(x1, n.x + n.r + 40);
          y0 = Math.min(y0, n.y - n.r - 20);
          y1 = Math.max(y1, n.y + n.r + 30);
        }
        for (const c of scene.chips) {
          y1 = Math.max(y1, c.y + c.h);
          x0 = Math.min(x0, c.x);
          x1 = Math.max(x1, c.x + c.w);
        }
        scene.vx = x0 - margin;
        scene.vy = y0 - margin;
        scene.W = x1 - x0 + 2 * margin;
        scene.H = y1 - y0 + 2 * margin;
      }
      return scene;
    }
    /** Render the current view into a new canvas at `scale` × logical size. */
    renderToCanvas(scale = 2) {
      const c = document.createElement("canvas");
      c.width = Math.round(this.W * scale);
      c.height = Math.round(this.H * scale);
      const ctx = c.getContext("2d");
      ctx.setTransform(scale, 0, 0, scale, 0, 0);
      this._draw(ctx, this.W, this.H, { overlays: false });
      this._dirty = true;
      return c;
    }
    destroy() {
      this.stop();
      this._ro.disconnect();
      this.canvas.remove();
    }
  };

  // src/tooltip.js
  var STYLE = [
    "position:absolute",
    "pointer-events:none",
    "top:0",
    "left:0",
    "background:#011838",
    "border:1px solid rgba(2,185,185,.25)",
    "border-left:3px solid #02b9b9",
    "padding:8px 12px",
    'font-family:"Noto Sans",sans-serif',
    "font-size:12px",
    "color:#fff",
    "max-width:220px",
    "line-height:1.5",
    "z-index:10",
    "opacity:0",
    "transition:opacity .15s"
  ].join(";");
  function escapeHtml(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
  }
  function defaultRender(node) {
    const sub = node.lang ? `<div style="font-size:10px;opacity:.45;text-transform:uppercase;letter-spacing:.06em;margin-top:2px">${escapeHtml(node.lang)} \xB7 ${escapeHtml(node.type)}</div>` : "";
    const ipa = node.meta?.ipa ? `<div style="color:#02b9b9;font-size:11px;margin-top:2px">${escapeHtml(node.meta.ipa)}</div>` : "";
    const q = node.quality != null ? `<span style="font-size:9px;background:rgba(2,185,185,.1);color:#02b9b9;padding:1px 4px;margin-top:4px;display:inline-block">quality: ${escapeHtml(node.quality)}</span>` : "";
    return `<strong>${escapeHtml(node.label)}</strong>${sub}${ipa}${q}`;
  }
  var Tooltip = class {
    constructor(container) {
      this._el = document.createElement("div");
      this._el.style.cssText = STYLE;
      container.appendChild(this._el);
      this._renderFn = defaultRender;
      this._W = 0;
      this._H = 0;
    }
    /** Override the default HTML renderer. */
    setRenderFn(fn) {
      this._renderFn = fn;
    }
    /** Update container dimensions (call after resize). */
    setContainerSize(W, H) {
      this._W = W;
      this._H = H;
    }
    show(node, canvasX, canvasY) {
      this.showHTML(this._renderFn(node), canvasX, canvasY);
    }
    /** Show caller-rendered HTML (already escaped) at a canvas position. */
    showHTML(html, canvasX, canvasY) {
      if (!html) {
        this.hide();
        return;
      }
      this._el.innerHTML = html;
      let x = canvasX + 28, y = canvasY - 10;
      if (this._W && x + 230 > this._W) x = canvasX - 240;
      if (this._H && y + 100 > this._H) y = Math.max(0, this._H - 110);
      this._el.style.transform = `translate(${x}px,${y}px)`;
      this._el.style.opacity = "1";
    }
    hide() {
      this._el.style.opacity = "0";
    }
    destroy() {
      this._el.remove();
    }
  };

  // src/hittest.js
  var MIN_HIT = 20;
  var TOUCH_EXTRA = 8;
  function hitTest(px, py, nodes) {
    for (let i = nodes.length - 1; i >= 0; i--) {
      const n = nodes[i];
      const dx = px - n.x, dy = py - n.y;
      if (dx * dx + dy * dy < n.hitRadius * n.hitRadius) return n.id;
    }
    return null;
  }
  function hitRadius(node, isCenter, isTouch) {
    let r;
    const type = node && typeof node === "object" ? node.type : typeof node === "string" ? node : "text";
    if (isCenter) r = 38;
    else if (type === "attestation") r = 8;
    else if (type === "concept") r = 18;
    else if (type === "referent") r = 20;
    else if (type === "element") r = 12;
    else if (type === "stub") r = 18;
    else r = 22;
    const popularity = node && typeof node === "object" && node.popularity != null ? node.popularity : 0.5;
    const scaledR = r * (0.7 + 0.6 * popularity);
    return Math.max(scaledR, MIN_HIT) + (isTouch ? TOUCH_EXTRA : 0);
  }

  // src/labels.js
  var CELL = 64;
  var Grid = class {
    constructor() {
      this.cells = /* @__PURE__ */ new Map();
    }
    _keys(b) {
      const out = [];
      const x0 = Math.floor(b.x0 / CELL), x1 = Math.floor(b.x1 / CELL);
      const y0 = Math.floor(b.y0 / CELL), y1 = Math.floor(b.y1 / CELL);
      for (let i = x0; i <= x1; i++) for (let j = y0; j <= y1; j++) out.push(i + "," + j);
      return out;
    }
    add(b) {
      for (const k of this._keys(b)) {
        let c = this.cells.get(k);
        if (!c) this.cells.set(k, c = []);
        c.push(b);
      }
    }
    hits(b, ignoreOwner) {
      for (const k of this._keys(b)) {
        const c = this.cells.get(k);
        if (!c) continue;
        for (const o of c) {
          if (ignoreOwner != null && o.owner === ignoreOwner) continue;
          if (b.x0 < o.x1 && b.x1 > o.x0 && b.y0 < o.y1 && b.y1 > o.y0) return true;
        }
      }
      return false;
    }
  };
  function truncateToWidth(text, maxW, measure) {
    if (measure(text) <= maxW) return text;
    let lo = 0, hi = text.length;
    while (lo < hi) {
      const mid = lo + hi + 1 >> 1;
      if (measure(text.slice(0, mid) + "\u2026") <= maxW) lo = mid;
      else hi = mid - 1;
    }
    return lo === 0 ? "" : text.slice(0, lo) + "\u2026";
  }
  function placeLabels(items, opts) {
    const measure = opts.measure;
    const pad = opts.pad ?? 2;
    const out = /* @__PURE__ */ new Map();
    const placed = new Grid();
    const discs = new Grid();
    for (const it of items) discs.add({ x0: it.x - it.r, y0: it.y - it.r, x1: it.x + it.r, y1: it.y + it.r, owner: it.id });
    for (const o of opts.obstacles ?? []) discs.add(o);
    const order = items.map((it, i) => ({ it, i })).sort((a, b) => (b.it.fixed ? 1 : 0) - (a.it.fixed ? 1 : 0) || (b.it.priority ?? 0) - (a.it.priority ?? 0) || a.i - b.i);
    for (const { it } of order) {
      const h = it.size * 1.15;
      const w = measure(it.text, it.size);
      const iy = it.insideY ?? 0;
      const box = (dx, dy, ww) => ({
        x0: it.x + dx - ww / 2 - pad,
        x1: it.x + dx + ww / 2 + pad,
        y0: it.y + dy - h / 2 - pad,
        y1: it.y + dy + h / 2 + pad,
        owner: it.id
      });
      if (it.fixed) {
        const b2 = box(0, iy, w);
        placed.add(b2);
        out.set(it.id, { text: it.text, dx: 0, dy: iy, inside: true, truncated: false, hidden: false, box: b2 });
        continue;
      }
      const gap = 3;
      const cands = [
        [0, iy, true],
        [0, it.r + h / 2 + gap, false],
        [0, -(it.r + h / 2 + gap), false],
        [it.r + w / 2 + gap + 1, 0, false],
        [-(it.r + w / 2 + gap + 1), 0, false]
      ];
      let done = false;
      for (const [dx, dy, inside] of cands) {
        if (inside && it.fitW != null && w > it.fitW) continue;
        const b2 = box(dx, dy, w);
        if (placed.hits(b2) || discs.hits(b2, it.id)) continue;
        placed.add(b2);
        out.set(it.id, { text: it.text, dx, dy, inside, truncated: false, hidden: false, box: b2 });
        done = true;
        break;
      }
      if (done) continue;
      const maxW = Math.max(0, 2 * it.r - 6);
      const t = truncateToWidth(it.text, maxW, (s) => measure(s, it.size));
      const b = box(0, iy, measure(t, it.size));
      if (t && !placed.hits(b)) {
        placed.add(b);
        out.set(it.id, { text: t, dx: 0, dy: iy, inside: true, truncated: t !== it.text, hidden: false, box: b });
      } else {
        out.set(it.id, { text: "", dx: 0, dy: iy, inside: true, truncated: true, hidden: true, box: null });
      }
    }
    return out;
  }

  // src/layout.js
  var RING_RADIUS_FACTORS = [0, 0.22, 0.38, 0.5];
  var RING_START_ANGLES = [-Math.PI / 2, -Math.PI * 0.7, -Math.PI / 2];
  function computeRings(centerId, nodes, edges) {
    const adj = new Map(nodes.map((n) => [n.id, []]));
    for (const e of edges) {
      adj.get(e.from)?.push(e.to);
      adj.get(e.to)?.push(e.from);
    }
    const dist = /* @__PURE__ */ new Map([[centerId, 0]]);
    const queue = [centerId];
    while (queue.length) {
      const cur = queue.shift();
      for (const nb of adj.get(cur) ?? []) {
        if (!dist.has(nb)) {
          dist.set(nb, Math.min(dist.get(cur) + 1, 3));
          queue.push(nb);
        }
      }
    }
    return dist;
  }
  function computeTargets(centerId, nodes, edges, W, H) {
    const rings2 = computeRings(centerId, nodes, edges);
    const cx = W / 2, cy = H / 2;
    const minDim = Math.min(W, H);
    const nowYear = (/* @__PURE__ */ new Date()).getFullYear();
    const byRing = [[], [], [], []];
    for (const node of nodes) {
      let ring = rings2.get(node.id) ?? 3;
      if (node.period != null && ring > 0) {
        const yearsAgo = nowYear - node.period;
        ring = Math.min(ring + Math.floor(yearsAgo / 500), 3);
      }
      byRing[ring].push(node.id);
    }
    const targets = /* @__PURE__ */ new Map();
    targets.set(centerId, { x: cx, y: cy });
    for (let d = 1; d <= 3; d++) {
      const ring = byRing[d];
      if (!ring.length) continue;
      const r = minDim * RING_RADIUS_FACTORS[d];
      const start = RING_START_ANGLES[d - 1];
      const step = 2 * Math.PI / ring.length;
      ring.forEach((id, i) => {
        const angle = start + step * i;
        targets.set(id, { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) });
      });
    }
    return targets;
  }

  // src/layouts/rings.js
  function rings(graph, opts) {
    return computeTargets(opts.centerId, graph.nodes, graph.edges, opts.W, opts.H);
  }

  // src/graphutil.js
  function normalizeEdges(edges) {
    const seen = /* @__PURE__ */ new Map();
    const out = [];
    for (const e of edges || []) {
      const from = e.from ?? e.src;
      const to = e.to ?? e.dst;
      if (from == null || to == null) continue;
      const type = e.type ?? e.predicate;
      let id = e.id ?? e.assertionId ?? `${from}|${type ?? e.family ?? ""}|${to}`;
      id = String(id);
      const n = seen.get(id) ?? 0;
      seen.set(id, n + 1);
      if (n > 0) id = `${id}#${n}`;
      out.push({ ...e, id, from: String(from), to: String(to), type });
    }
    return out;
  }
  function normalizeNodes(nodes) {
    const out = [];
    const seen = /* @__PURE__ */ new Set();
    for (const n of nodes || []) {
      if (n == null || n.id == null) continue;
      const id = String(n.id);
      if (seen.has(id)) continue;
      seen.add(id);
      out.push({ ...n, id, label: n.label ?? n.form ?? id });
    }
    return out;
  }
  function adjacency(nodes, edges) {
    const adj = new Map(nodes.map((n) => [n.id, []]));
    for (const e of edges) {
      if (!adj.has(e.from) || !adj.has(e.to) || e.from === e.to) continue;
      adj.get(e.from).push({ other: e.to, edge: e });
      adj.get(e.to).push({ other: e.from, edge: e });
    }
    return adj;
  }
  function bfs(centerId, nodes, edges) {
    const adj = adjacency(nodes, edges);
    const dist = /* @__PURE__ */ new Map();
    const parent = /* @__PURE__ */ new Map();
    if (!adj.has(centerId)) return { dist, parent, adj };
    dist.set(centerId, 0);
    const queue = [centerId];
    for (let qi = 0; qi < queue.length; qi++) {
      const cur = queue[qi];
      for (const { other, edge } of adj.get(cur)) {
        if (dist.has(other)) continue;
        dist.set(other, dist.get(cur) + 1);
        parent.set(other, { id: cur, edge });
        queue.push(other);
      }
    }
    return { dist, parent, adj };
  }

  // src/layouts/sectors.js
  var TAU = Math.PI * 2;
  function priorityOf(n) {
    return n.importance ?? n.popularity ?? 0;
  }
  function sectors(graph, opts) {
    const { W, H, centerId } = opts;
    const nodes = graph.nodes, edges = graph.edges;
    const maxPerSector = Math.max(1, opts.maxPerSector ?? Infinity);
    const extra = opts.sectorExtra ?? {};
    const minGap = opts.minLabelGap ?? 64;
    const gap = opts.sectorGap ?? 0.08;
    const minAngle = opts.minSectorAngle ?? Math.PI / 18;
    const startAngle = opts.startAngle ?? -Math.PI / 2;
    const maxRing = opts.maxRing ?? 3;
    const maxRows = opts.maxRows ?? 3;
    const rowStep = opts.rowStep ?? 30;
    const margin = opts.margin ?? 40;
    const order = opts.sectorOrder ?? [];
    const cx = W / 2, cy = H / 2;
    const out = /* @__PURE__ */ new Map();
    out.stubs = [];
    out.collapsed = /* @__PURE__ */ new Map();
    out.family = /* @__PURE__ */ new Map();
    out.sectors = [];
    const index = new Map(nodes.map((n, i) => [n.id, i]));
    if (index.has(centerId)) out.set(centerId, { x: cx, y: cy });
    const { dist, parent } = bfs(centerId, nodes, edges);
    const seenFam = /* @__PURE__ */ new Map();
    const famRank = (f2) => {
      const i = order.indexOf(f2);
      if (i >= 0) return i;
      if (!seenFam.has(f2)) seenFam.set(f2, seenFam.size);
      return order.length + seenFam.get(f2);
    };
    const edgeFam = (e) => String(e.family ?? e.type ?? "_other");
    const centreFam = /* @__PURE__ */ new Map();
    for (const e of edges) {
      let other = null;
      if (e.from === centerId) other = e.to;
      else if (e.to === centerId) other = e.from;
      if (other == null || other === centerId) continue;
      const f2 = edgeFam(e);
      famRank(f2);
      const cur = centreFam.get(other);
      if (cur == null || famRank(f2) < famRank(cur)) centreFam.set(other, f2);
    }
    const others = nodes.filter((n) => n.id !== centerId);
    const byDist = [...others].sort((a2, b) => (dist.get(a2.id) ?? Infinity) - (dist.get(b.id) ?? Infinity) || index.get(a2.id) - index.get(b.id));
    for (const n of byDist) {
      let f2;
      if (opts.familyOf) f2 = opts.familyOf(n);
      if (f2 == null) f2 = n.family;
      if (f2 == null) f2 = centreFam.get(n.id);
      if (f2 == null) {
        const p = parent.get(n.id);
        if (p && p.id !== centerId) f2 = out.family.get(p.id);
        else if (p) f2 = edgeFam(p.edge);
      }
      if (f2 == null) f2 = "_other";
      f2 = String(f2);
      famRank(f2);
      out.family.set(n.id, f2);
    }
    const ringOf = (n) => {
      if (n.ring != null) return Math.max(1, Math.min(maxRing, n.ring));
      const d = dist.get(n.id);
      return d == null ? maxRing : Math.max(1, Math.min(maxRing, d));
    };
    const groups = /* @__PURE__ */ new Map();
    for (const n of others) {
      const f2 = out.family.get(n.id);
      if (!groups.has(f2)) groups.set(f2, []);
      groups.get(f2).push(n);
    }
    const fams = [...groups.keys()].sort((a2, b) => famRank(a2) - famRank(b));
    const sectorItems = [];
    let maxRingUsed = 1;
    for (const f2 of fams) {
      const list = groups.get(f2).slice().sort((a2, b) => ringOf(a2) - ringOf(b) || priorityOf(b) - priorityOf(a2) || index.get(a2.id) - index.get(b.id));
      const cap = maxPerSector + (extra[f2] ?? 0);
      const visible = list.slice(0, cap);
      const hidden = list.slice(cap);
      const items = visible.map((n) => ({ id: n.id, ring: ringOf(n) }));
      let stub = null;
      if (hidden.length) {
        const ring = Math.max(...items.map((i) => i.ring));
        stub = {
          id: `more:${f2}`,
          type: "stub",
          family: f2,
          count: hidden.length,
          members: hidden.map((n) => n.id),
          label: `+${hidden.length}`,
          ring
        };
        out.stubs.push(stub);
        for (const n of hidden) out.collapsed.set(n.id, stub.id);
        out.family.set(stub.id, f2);
        items.push({ id: stub.id, ring });
      }
      for (const it of items) maxRingUsed = Math.max(maxRingUsed, it.ring);
      sectorItems.push({ family: f2, items, collapsed: hidden.length });
    }
    if (!sectorItems.length) return out;
    const k = sectorItems.length;
    const g = k > 1 ? gap : 0;
    const avail = TAU - g * k;
    const base = Math.min(minAngle, avail / k);
    const total = sectorItems.reduce((s, x) => s + x.items.length, 0);
    const widths = sectorItems.map((x) => base + (avail - base * k) * x.items.length / total);
    const R = Math.max(40, Math.min(W, H) / 2 - margin);
    const radius = typeof opts.ringRadius === "function" ? (r) => opts.ringRadius(r, R, maxRingUsed) : (r) => maxRingUsed <= 1 ? R * 0.62 : R * (0.4 + 0.6 * (r - 1) / (maxRingUsed - 1));
    let a = startAngle - widths[0] / 2;
    sectorItems.forEach((sec, si) => {
      const w = widths[si];
      out.sectors.push({ family: sec.family, start: a, end: a + w, count: sec.items.length, collapsed: sec.collapsed });
      const byRing = /* @__PURE__ */ new Map();
      for (const it of sec.items) {
        if (!byRing.has(it.ring)) byRing.set(it.ring, []);
        byRing.get(it.ring).push(it.id);
      }
      for (const [ring, ids] of [...byRing.entries()].sort((p, q) => p[0] - q[0])) {
        const r = radius(ring);
        const n = ids.length;
        const perNode = w * r / n;
        const rows = Math.max(1, Math.min(maxRows, Math.ceil(minGap / Math.max(1e-6, perNode))));
        ids.forEach((id, i) => {
          const ang = a + w * (i + 0.5) / n;
          const rr = r + (rows > 1 ? (i % rows - (rows - 1) / 2) * rowStep : 0);
          out.set(id, { x: cx + rr * Math.cos(ang), y: cy + rr * Math.sin(ang) });
        });
      }
      a += w + g;
    });
    return out;
  }

  // src/layouts/layered.js
  function layered(graph, opts) {
    const nodes = graph.nodes;
    const ids = nodes.map((n) => n.id);
    const index = new Map(ids.map((id, i) => [id, i]));
    const isDirected = opts.isDirected ?? ((e) => e.directed === true);
    const sweeps = opts.sweeps ?? 4;
    const LR = opts.direction === "LR";
    const W = LR ? opts.H : opts.W, H = LR ? opts.W : opts.H;
    const margin = opts.margin ?? 48;
    const out = /* @__PURE__ */ new Map();
    out.layers = /* @__PURE__ */ new Map();
    out.backEdges = /* @__PURE__ */ new Set();
    if (!nodes.length) return out;
    const usable = graph.edges.filter((e) => index.has(e.from) && index.has(e.to) && e.from !== e.to);
    const directed = usable.filter((e) => isDirected(e));
    const outAdj = new Map(ids.map((id) => [id, []]));
    for (const e of directed) outAdj.get(e.from).push(e);
    const state = /* @__PURE__ */ new Map();
    const roots = opts.centerId != null && index.has(opts.centerId) ? [opts.centerId, ...ids.filter((id) => id !== opts.centerId)] : ids;
    for (const root of roots) {
      if (state.has(root)) continue;
      const stack = [[root, 0]];
      state.set(root, 1);
      while (stack.length) {
        const top = stack[stack.length - 1];
        const list = outAdj.get(top[0]);
        if (top[1] >= list.length) {
          state.set(top[0], 2);
          stack.pop();
          continue;
        }
        const e = list[top[1]++];
        const st = state.get(e.to);
        if (st === 1) out.backEdges.add(e.id);
        else if (st == null) {
          state.set(e.to, 1);
          stack.push([e.to, 0]);
        }
      }
    }
    const dag = directed.filter((e) => !out.backEdges.has(e.id));
    const indeg = new Map(ids.map((id) => [id, 0]));
    const succ = new Map(ids.map((id) => [id, []]));
    const hasDir = /* @__PURE__ */ new Set();
    for (const e of dag) {
      indeg.set(e.to, indeg.get(e.to) + 1);
      succ.get(e.from).push(e.to);
      hasDir.add(e.from);
      hasDir.add(e.to);
    }
    const layer = /* @__PURE__ */ new Map();
    const queue = ids.filter((id) => indeg.get(id) === 0);
    for (const id of queue) layer.set(id, 0);
    for (let qi = 0; qi < queue.length; qi++) {
      const u = queue[qi];
      for (const v of succ.get(u)) {
        layer.set(v, Math.max(layer.get(v) ?? 0, layer.get(u) + 1));
        indeg.set(v, indeg.get(v) - 1);
        if (indeg.get(v) === 0) queue.push(v);
      }
    }
    const undAdj = new Map(ids.map((id) => [id, []]));
    for (const e of usable) {
      undAdj.get(e.from).push(e.to);
      undAdj.get(e.to).push(e.from);
    }
    const placed = new Set(ids.filter((id) => hasDir.has(id)));
    const bq = ids.filter((id) => placed.has(id));
    for (let qi = 0; qi < bq.length; qi++) {
      const u = bq[qi];
      for (const v of undAdj.get(u)) {
        if (placed.has(v)) continue;
        placed.add(v);
        layer.set(v, layer.get(u));
        bq.push(v);
      }
    }
    for (const id of ids) if (!placed.has(id)) layer.set(id, 0);
    const minL = Math.min(...layer.values());
    for (const id of ids) layer.set(id, layer.get(id) - minL);
    const L = Math.max(...layer.values()) + 1;
    const layers = Array.from({ length: L }, () => []);
    for (const id of ids) layers[layer.get(id)].push(id);
    const pos = /* @__PURE__ */ new Map();
    const reindex = (l) => layers[l].forEach((id, i) => pos.set(id, i));
    for (let l = 0; l < L; l++) reindex(l);
    const sweep = (l, above) => {
      const bary = /* @__PURE__ */ new Map();
      for (const id of layers[l]) {
        let sum = 0, cnt = 0;
        for (const v of undAdj.get(id)) {
          const lv = layer.get(v);
          if (above ? lv < l : lv > l) {
            sum += pos.get(v) / Math.max(1, layers[lv].length - 1 || 1);
            cnt++;
          }
        }
        bary.set(id, cnt ? sum / cnt : pos.get(id) / Math.max(1, layers[l].length - 1 || 1));
      }
      layers[l].sort((a, b) => bary.get(a) - bary.get(b) || pos.get(a) - pos.get(b));
      reindex(l);
    };
    for (let s = 0; s < sweeps; s++) {
      for (let l = 1; l < L; l++) sweep(l, true);
      for (let l = L - 2; l >= 0; l--) sweep(l, false);
    }
    const cx = W / 2, cy = H / 2;
    const layerGap = L > 1 ? Math.min(opts.layerGap ?? 120, (H - 2 * margin) / (L - 1)) : 0;
    for (let l = 0; l < L; l++) {
      const row = layers[l];
      const n = row.length;
      const nodeGap = n > 1 ? Math.min(opts.nodeGap ?? 120, (W - 2 * margin) / (n - 1)) : 0;
      const y = cy + (l - (L - 1) / 2) * layerGap;
      row.forEach((id, i) => {
        const x = cx + (i - (n - 1) / 2) * nodeGap;
        out.set(id, LR ? { x: y, y: x } : { x, y });
        out.layers.set(id, l);
      });
    }
    return out;
  }

  // src/layouts/similarity.js
  function similarity(graph, opts) {
    const { W, H, centerId } = opts;
    const cx = W / 2, cy = H / 2;
    const margin = opts.margin ?? 40;
    const R = Math.max(40, Math.min(W, H) / 2 - margin);
    const rMin = Math.min(R, opts.minRadius ?? Math.max(56, R * 0.18));
    const startAngle = opts.startAngle ?? -Math.PI / 2;
    const edgeScore = /* @__PURE__ */ new Map();
    for (const e of graph.edges) {
      const other = e.from === centerId ? e.to : e.to === centerId ? e.from : null;
      if (other == null) continue;
      const s = e.score ?? e.weight;
      if (s != null && !(edgeScore.get(other) >= s)) edgeScore.set(other, s);
    }
    const clamp = (v) => Math.max(0, Math.min(1, Number.isFinite(v) ? v : 0));
    const out = /* @__PURE__ */ new Map();
    out.radius = /* @__PURE__ */ new Map();
    out.score = /* @__PURE__ */ new Map();
    const index = new Map(graph.nodes.map((n2, i) => [n2.id, i]));
    if (index.has(centerId)) out.set(centerId, { x: cx, y: cy });
    const others = graph.nodes.filter((n2) => n2.id !== centerId).map((n2) => {
      let s = opts.scoreOf ? opts.scoreOf(n2) : void 0;
      if (s == null) s = n2.score;
      if (s == null) s = edgeScore.get(n2.id);
      return { id: n2.id, s: clamp(s ?? 0) };
    });
    others.sort((a, b) => b.s - a.s || index.get(a.id) - index.get(b.id));
    const n = others.length;
    others.forEach((o, i) => {
      const r = rMin + (1 - o.s) * (R - rMin);
      const ang = startAngle + i * Math.PI * 2 / Math.max(1, n);
      out.set(o.id, { x: cx + r * Math.cos(ang), y: cy + r * Math.sin(ang) });
      out.radius.set(o.id, r);
      out.score.set(o.id, o.s);
    });
    return out;
  }

  // src/layouts/place.js
  function placeAround(anchor, center, ids, opts = {}) {
    const radius = opts.radius ?? 90;
    const spacing = opts.spacing ?? 48;
    const spread = opts.spread ?? Math.PI * 0.9;
    const dx = anchor.x - center.x, dy = anchor.y - center.y;
    const base = Math.hypot(dx, dy) < 1 ? -Math.PI / 2 : Math.atan2(dy, dx);
    const out = /* @__PURE__ */ new Map();
    let i = 0, ring = 0;
    while (i < ids.length) {
      const r = radius + ring * spacing;
      const cap = Math.max(1, Math.floor(spread * r / spacing) + 1);
      const n = Math.min(cap, ids.length - i);
      for (let k = 0; k < n; k++, i++) {
        const t = n === 1 ? 0 : k / (n - 1) - 0.5;
        const a = base + t * spread * Math.min(1, n / cap);
        out.set(ids[i], { x: anchor.x + r * Math.cos(a), y: anchor.y + r * Math.sin(a) });
      }
      ring++;
    }
    return out;
  }

  // src/layouts/index.js
  var layouts = { rings, sectors, layered, similarity };
  function registerLayout(name, fn) {
    if (typeof fn !== "function") throw new TypeError("layout must be a function");
    layouts[name] = fn;
  }

  // src/a11y.js
  var HIDDEN = [
    "position:absolute",
    "width:1px",
    "height:1px",
    "margin:-1px",
    "padding:0",
    "overflow:hidden",
    "clip:rect(0 0 0 0)",
    "clip-path:inset(50%)",
    "white-space:nowrap",
    "border:0"
  ].join(";");
  function defaultDescribeNode(node, ctx = {}) {
    const parts = [String(node.label ?? node.id)];
    if (node.type === "stub") parts[0] = `${node.count ?? ""} more ${node.family ?? ""}`.replace(/\s+/g, " ").trim();
    if (ctx.isCenter) parts.push("centre");
    if (ctx.edge && ctx.anchor) parts.push(ctx.describeEdge ? ctx.describeEdge(ctx.edge, ctx) : defaultDescribeEdge(ctx.edge, ctx));
    else if (node.lang) parts.push(String(node.lang));
    if (ctx.index != null && ctx.total != null) parts.push(`${ctx.index} of ${ctx.total}`);
    return parts.join(", ");
  }
  function defaultDescribeEdge(edge, ctx = {}) {
    const other = ctx.anchor ? ctx.anchor.label ?? ctx.anchor.id : null;
    const rel = edge.label ?? String(edge.family ?? edge.type ?? "related").replace(/[-_]/g, " ");
    const extra = [];
    if (edge.provenance) extra.push(edge.provenance);
    if (edge.certainty === "uncertain") extra.push("uncertain");
    if (edge.status && edge.status !== "open") extra.push(edge.status);
    return (other ? `${rel} ${other}` : rel) + (extra.length ? ` (${extra.join(", ")})` : "");
  }
  var A11yMirror = class {
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
      this.root = document.createElement("div");
      this.root.className = "mg-a11y";
      this.root.setAttribute("role", "application");
      this.root.setAttribute("aria-roledescription", opts.roleDescription ?? "graph");
      this.root.setAttribute("aria-label", opts.label ?? "Graph");
      this.root.style.cssText = HIDDEN;
      this.list = document.createElement("ul");
      this.list.setAttribute("role", "list");
      this.root.appendChild(this.list);
      this.live = document.createElement("div");
      this.live.setAttribute("role", "status");
      this.live.setAttribute("aria-live", "polite");
      this.live.setAttribute("aria-atomic", "true");
      this.live.style.cssText = HIDDEN;
      container.appendChild(this.root);
      container.appendChild(this.live);
      this.items = /* @__PURE__ */ new Map();
      this.focusId = null;
      this.anchorId = null;
      this.anchorStack = [];
      this._liveTimer = null;
      this._onKey = (e) => this._key(e);
      this._onFocusIn = (e) => this._focusIn(e);
      this._onFocusOut = (e) => {
        if (!this.root.contains(e.relatedTarget)) {
          this.host.setFocusedEdge(null);
          this.host.setFocusedChip(null, null);
        }
      };
      this.root.addEventListener("keydown", this._onKey);
      this.root.addEventListener("focusin", this._onFocusIn);
      this.root.addEventListener("focusout", this._onFocusOut);
    }
    get hasFocus() {
      return typeof document !== "undefined" && this.root.contains(document.activeElement);
    }
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
      const keep = /* @__PURE__ */ new Set();
      for (const n of nodes) {
        keep.add(n.id);
        let it = this.items.get(n.id);
        if (!it) {
          const li = document.createElement("li");
          li.dataset.id = n.id;
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "mg-node";
          btn.dataset.id = n.id;
          btn.tabIndex = -1;
          li.appendChild(btn);
          it = { li, btn };
          this.items.set(n.id, it);
          this.list.appendChild(li);
        }
        it.btn.textContent = this._describeNode(n, { isCenter: n.id === centerId });
        if (n.id === centerId) it.btn.setAttribute("aria-current", "true");
        else it.btn.removeAttribute("aria-current");
      }
      for (const [id, it] of this.items) {
        if (!keep.has(id)) {
          it.li.remove();
          this.items.delete(id);
        }
      }
      if (!this.focusId || !this.items.has(this.focusId)) {
        this.focusId = centerId && this.items.has(centerId) ? centerId : nodes[0]?.id ?? null;
        this.anchorId = this.focusId;
        this.anchorStack = [];
      }
      if (this.anchorId && !this.items.has(this.anchorId)) {
        this.anchorId = centerId;
        this.anchorStack = [];
      }
      this._roving();
      const active = typeof document !== "undefined" ? document.activeElement : null;
      const onDetail = hadFocus && active && active.classList?.contains("mg-detail") ? active.dataset : null;
      this._details();
      if (hadFocus && !this.hasFocus && this.focusId) {
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
      const c = nodes.find((n) => n.id === centerId);
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
      if (b) {
        b.focus({ preventScroll: true });
        return true;
      }
      return false;
    }
    _contextText(id) {
      const { nodes, centerId } = this.host.getScene();
      const node = nodes.find((n) => n.id === id);
      if (!node) return "";
      if (this.anchorId && this.anchorId !== id) {
        const nbs = this.host.neighbours(this.anchorId);
        const i = nbs.findIndex((x) => x.id === id);
        const anchor = nodes.find((n) => n.id === this.anchorId);
        if (i >= 0) return this._describeNode(node, { edge: nbs[i].edge, anchor, index: i + 1, total: nbs.length, isCenter: id === centerId });
      }
      return this._describeNode(node, { isCenter: id === centerId });
    }
    _roving() {
      for (const [id, it] of this.items) it.btn.tabIndex = id === this.focusId ? 0 : -1;
    }
    _details() {
      for (const el of this.root.querySelectorAll(".mg-detail")) el.remove();
      if (!this.focusId) return;
      const it = this.items.get(this.focusId);
      const { nodes } = this.host.getScene();
      const node = nodes.find((n) => n.id === this.focusId);
      if (!it || !node) return;
      const drawer = this.opts.drawerId;
      for (const { id: otherId, edge } of (this.host.edgesOf ?? this.host.neighbours)(this.focusId)) {
        const other = nodes.find((n) => n.id === otherId);
        const b = document.createElement("button");
        b.type = "button";
        b.className = "mg-detail mg-edge";
        b.dataset.edgeId = edge.id;
        b.textContent = `Link: ${node.label} \u2013 ${other?.label ?? otherId}: ${this._describeEdge(edge, { anchor: other, node })}`;
        if (drawer) {
          b.setAttribute("aria-haspopup", "dialog");
          b.setAttribute("aria-controls", drawer);
        }
        it.li.appendChild(b);
      }
      for (const chip of this.host.chipsOf(node)) {
        const b = document.createElement("button");
        b.type = "button";
        b.className = "mg-detail mg-chip";
        b.dataset.chipId = chip.id;
        const st = chip.status && chip.status !== "open" ? ` (${chip.status})` : "";
        b.textContent = chip.overflow ? `${chip.count} more spellings` : `Spelling: ${chip.label}${st}`;
        if (drawer) {
          b.setAttribute("aria-haspopup", "dialog");
          b.setAttribute("aria-controls", drawer);
        }
        it.li.appendChild(b);
      }
    }
    _focusIn(e) {
      const t = e.target;
      if (t.classList.contains("mg-node")) {
        const id = t.dataset.id;
        if (id !== this.focusId) {
          this.focusId = id;
          this._roving();
          this._details();
          t.focus({ preventScroll: true });
        }
        this.host.setFocus(id);
        this.host.setFocusedEdge(null);
        this.host.setFocusedChip(null, null);
      } else if (t.classList.contains("mg-edge")) {
        this.host.setFocusedEdge(t.dataset.edgeId);
        this.host.setFocusedChip(null, null);
      } else if (t.classList.contains("mg-chip")) {
        this.host.setFocusedEdge(null);
        this.host.setFocusedChip(this.focusId, t.dataset.chipId);
      }
    }
    _key(e) {
      const t = e.target;
      const isNode = t.classList?.contains("mg-node");
      const isEdge = t.classList?.contains("mg-edge");
      const isChip = t.classList?.contains("mg-chip");
      if (!isNode && !isEdge && !isChip) return;
      const k = e.key;
      if (isEdge || isChip) {
        if (k === "Enter" || k === " ") {
          e.preventDefault();
          if (isEdge) this.host.activateEdge(t.dataset.edgeId);
          else this.host.activateChip(this.focusId, t.dataset.chipId);
        } else if (k === "Escape") {
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
        let i = nbs.findIndex((x) => x.id === id);
        i = i < 0 ? dir > 0 ? 0 : nbs.length - 1 : (i + dir + nbs.length) % nbs.length;
        this.focusNode(nbs[i].id);
      };
      switch (k) {
        case "ArrowRight":
          e.preventDefault();
          step(1);
          break;
        case "ArrowLeft":
          e.preventDefault();
          step(-1);
          break;
        case "ArrowDown": {
          e.preventDefault();
          if (id === this.anchorId) {
            step(1);
            break;
          }
          const nbs = this.host.neighbours(id).filter((x) => x.id !== this.anchorId);
          if (!nbs.length) {
            this.announce(`${this._contextText(id)}; no further links`);
            break;
          }
          this.anchorStack.push(this.anchorId);
          this.anchorId = id;
          this.focusNode(nbs[0].id);
          break;
        }
        case "ArrowUp": {
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
        case "Home":
          e.preventDefault();
          this.anchorStack = [];
          this.anchorId = centerId;
          this.focusNode(centerId);
          break;
        case "Enter":
        case " ":
          e.preventDefault();
          this.host.recentre(id);
          break;
        case "Escape":
          e.preventDefault();
          this.host.back();
          break;
        default:
          break;
      }
    }
    announce(text) {
      if (!text) return;
      clearTimeout(this._liveTimer);
      this.live.textContent = "";
      this._liveTimer = setTimeout(() => {
        this.live.textContent = text;
      }, 30);
    }
    destroy() {
      clearTimeout(this._liveTimer);
      this.root.removeEventListener("keydown", this._onKey);
      this.root.removeEventListener("focusin", this._onFocusIn);
      this.root.removeEventListener("focusout", this._onFocusOut);
      this.root.remove();
      this.live.remove();
    }
  };
  function cssEscape(s) {
    if (typeof CSS !== "undefined" && CSS.escape) return CSS.escape(s);
    return String(s).replace(/["\\]/g, "\\$&");
  }

  // src/svg.js
  function escapeXml(s) {
    return String(s ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&apos;" })[c]);
  }
  var f = (v) => Math.round(v * 10) / 10;
  function sceneToSVG(scene) {
    const out = [];
    const font = escapeXml(scene.font ?? "sans-serif");
    out.push(`<svg xmlns="http://www.w3.org/2000/svg" width="${f(scene.W)}" height="${f(scene.H)}" viewBox="${f(scene.vx ?? 0)} ${f(scene.vy ?? 0)} ${f(scene.W)} ${f(scene.H)}" font-family="${font}">`);
    out.push(`<rect x="${f(scene.vx ?? 0)}" y="${f(scene.vy ?? 0)}" width="${f(scene.W)}" height="${f(scene.H)}" fill="${escapeXml(scene.background)}"/>`);
    out.push('<g class="mg-hulls">');
    for (const h of scene.hulls ?? []) {
      out.push(`<path d="${h.d}" fill="${escapeXml(h.color)}" fill-opacity="${f(h.alpha)}" stroke="${escapeXml(h.color)}" stroke-opacity="${f(Math.min(1, h.alpha * 3))}" stroke-width="1"/>`);
      if (h.label) out.push(`<text x="${f(h.lx)}" y="${f(h.ly - 4)}" text-anchor="middle" font-size="10" font-weight="600" fill="${escapeXml(h.color)}">${escapeXml(h.label)}</text>`);
    }
    out.push("</g>");
    out.push('<g class="mg-edges">');
    for (const e of scene.edges ?? []) {
      const dash = e.dash && e.dash.length ? ` stroke-dasharray="${e.dash.join(" ")}"` : "";
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
    out.push("</g>");
    out.push('<g class="mg-nodes">');
    for (const n of scene.nodes ?? []) {
      const op = n.alpha != null && n.alpha < 1 ? ` opacity="${f(n.alpha)}"` : "";
      out.push(`<g data-id="${escapeXml(n.id)}"${op}>`);
      if (n.shape === "pill") {
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
      out.push("</g>");
    }
    out.push("</g>");
    out.push('<g class="mg-chips">');
    for (const c of scene.chips ?? []) {
      out.push(`<rect x="${f(c.x)}" y="${f(c.y)}" width="${f(c.w)}" height="${f(c.h)}" rx="${f(c.h / 2)}" fill="${escapeXml(c.fill)}" stroke="${escapeXml(c.stroke)}" stroke-width="0.9"/>`);
      out.push(`<text x="${f(c.x + c.w / 2)}" y="${f(c.y + c.h / 2)}" text-anchor="middle" dominant-baseline="middle" font-size="9" fill="${escapeXml(c.ink)}">${escapeXml(c.label)}</text>`);
    }
    out.push("</g>");
    out.push("</svg>");
    return out.join("\n");
  }

  // src/index.js
  var VERSION = "0.2.0";
  var EDGE_TOL_MOUSE = 6;
  var EDGE_TOL_TOUCH = 14;
  var DRAG_THRESHOLD = 4;
  function prefersReducedMotion() {
    try {
      return typeof window !== "undefined" && !!window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    } catch {
      return false;
    }
  }
  var MondoGraph = class {
    /**
     * See index.d.ts for the full option list.
     * @param {object} opts
     */
    constructor(opts) {
      this._opts = { ...opts };
      this._container = typeof opts.container === "string" ? document.querySelector(opts.container) : opts.container;
      if (!this._container) throw new Error("mondograph: container not found");
      if (getComputedStyle(this._container).position === "static") this._container.style.position = "relative";
      this._baseTheme = resolveTheme(opts.theme);
      this._theme = this._baseTheme;
      this._renderer = new Renderer(this._container, this._theme, opts.perf);
      this._tooltip = new Tooltip(this._container);
      if (opts.renderTooltip) this._tooltip.setRenderFn(opts.renderTooltip);
      this._all = { nodes: [], edges: [], groups: [] };
      this._nodeById = /* @__PURE__ */ new Map();
      this._edgeById = /* @__PURE__ */ new Map();
      this._scene = { nodes: [], edges: [], groups: [] };
      this._sceneNodeById = /* @__PURE__ */ new Map();
      this._layoutName = opts.layout ?? "rings";
      this._layoutOpts = { ...opts.layoutOptions ?? {} };
      this._layoutResult = /* @__PURE__ */ new Map();
      this._layoutVersion = 0;
      this._targets = /* @__PURE__ */ new Map();
      this._sectorExtra = {};
      this._centerId = null;
      this._history = [];
      this._filter = null;
      this._faded = /* @__PURE__ */ new Set();
      this._fadedEdges = /* @__PURE__ */ new Set();
      this._highlight = null;
      this._selectedEdgeId = null;
      this._isTouch = false;
      this._setCenterSeq = 0;
      const r = this._renderer;
      r.showSuppressed = !!opts.showSuppressed;
      r.chipsFor = opts.chipsFor ?? "all";
      r.chipMax = opts.maxChips ?? 4;
      r.showRings = this._layoutName === "rings";
      r.onFrame = opts.onFrame ?? null;
      r.nodeAlpha = (id) => this._nodeAlphaOf(id);
      r.edgeAlpha = (e) => this._edgeAlphaOf(e);
      this._rmMode = opts.reducedMotion ?? "auto";
      this._applyReducedMotion();
      if (this._rmMode === "auto" && typeof window !== "undefined" && window.matchMedia) {
        try {
          this._rmQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
          this._onRm = () => this._applyReducedMotion();
          this._rmQuery.addEventListener?.("change", this._onRm);
        } catch {
        }
      }
      this.refreshTheme();
      r.onResize = () => {
        if (this._centerId == null) return;
        this._relayout({ announce: false });
        this._tooltip.setContainerSize(r.W, r.H);
      };
      if (opts.a11y !== false) {
        this._mirror = new A11yMirror(this._container, this._a11yHost(), {
          label: opts.ariaLabel,
          roleDescription: opts.ariaRoleDescription,
          describeNode: opts.describeNode,
          describeEdge: opts.describeEdge,
          drawerId: opts.drawerId
        });
      }
      this._bindEvents();
      r.start();
      if (opts.data) this.setData(opts.data, opts.centerId ?? opts.data.nodes?.[0]?.id);
    }
    // ── Public: data ─────────────────────────────────────────────────────────
    /**
     * Re-centre on `id`. With `getNeighbors` the neighbourhood is fetched and
     * replaces the scene; without it the current data is laid out around `id`.
     * Pushes the previous centre onto the history stack (see back()).
     * @param {string} id
     * @param {{push?:boolean, reason?:string}} [o]
     */
    async setCenter(id, o = {}) {
      id = String(id);
      const seq = ++this._setCenterSeq;
      const prev = this._centerId;
      if (o.push !== false && prev != null && prev !== id) this._history.push(prev);
      this._centerId = id;
      this._renderer.centerId = id;
      this._renderer.invalidateStyles();
      const { W, H } = this._renderer.containerSize;
      const existing = this._renderer.springNodes.get(id);
      if (existing) {
        existing.targetX = W / 2;
        existing.targetY = H / 2;
        existing.targetOpacity = 1;
      }
      if (this._opts.getNeighbors) {
        const spinnerTimer = setTimeout(() => {
          this._renderer.loading = true;
        }, 150);
        let data;
        try {
          data = await this._opts.getNeighbors(id);
        } finally {
          clearTimeout(spinnerTimer);
          if (seq === this._setCenterSeq) this._renderer.loading = false;
        }
        if (seq !== this._setCenterSeq) return;
        this._replaceData(data);
      }
      this._sectorExtra = {};
      this._relayout({ announce: true });
      this._afterCenter(o.reason ?? "api");
    }
    /** Replace the whole graph (for callers that fetch themselves) and centre on `centerId`. */
    setData(data, centerId, o = {}) {
      this._replaceData(data);
      const id = centerId != null ? String(centerId) : this._centerId ?? this._all.nodes[0]?.id ?? null;
      const prev = this._centerId;
      if (o.push !== false && prev != null && id != null && prev !== id) this._history.push(prev);
      this._centerId = id;
      this._renderer.centerId = id;
      this._sectorExtra = {};
      this.refreshTheme();
      this._relayout({ announce: prev !== id });
      if (prev !== id) this._afterCenter(o.reason ?? "data");
    }
    /**
     * Merge more nodes/edges/groups next to `anchorId` without re-centring.
     * New nodes are placed in a fan beside the anchor; nothing else moves.
     */
    addNeighbors(anchorId, data = {}) {
      anchorId = String(anchorId);
      const before = new Set(this._scene.nodes.map((n) => n.id));
      const incoming = normalizeNodes(data.nodes);
      for (const n of incoming) {
        const cur = this._nodeById.get(n.id);
        if (cur) Object.assign(cur, n);
        else {
          this._all.nodes.push(n);
          this._nodeById.set(n.id, n);
        }
      }
      for (const e of normalizeEdges(data.edges)) {
        const cur = this._edgeById.get(e.id);
        if (cur) Object.assign(cur, e);
        else {
          this._all.edges.push(e);
          this._edgeById.set(e.id, e);
        }
      }
      this._mergeGroups(data.groups);
      const collapsed = this._layoutResult.collapsed;
      const fresh = [];
      for (const n of incoming) {
        if (collapsed?.has(n.id)) {
          const stubId = collapsed.get(n.id);
          collapsed.delete(n.id);
          const stub = this._layoutResult.stubs?.find((s) => s.id === stubId);
          if (stub) {
            stub.members = stub.members.filter((m) => m !== n.id);
            stub.count = stub.members.length;
            stub.label = `+${stub.count}`;
            if (!stub.count) this._layoutResult.stubs = this._layoutResult.stubs.filter((s) => s !== stub);
          }
        }
        if (!before.has(n.id)) fresh.push(n.id);
      }
      const a = this._targets.get(anchorId) ?? this._renderer.springNodes.get(anchorId);
      const c = this._targets.get(this._centerId) ?? { x: this._renderer.W / 2, y: this._renderer.H / 2 };
      if (a && fresh.length) {
        const pos = placeAround({ x: a.x ?? a.targetX, y: a.y ?? a.targetY }, c, fresh, this._opts.addNeighborsPlacement);
        for (const [id, p] of pos) this._targets.set(id, p);
      }
      this._buildScene();
      this._applyTargets(a ? { x: a.x ?? a.targetX, y: a.y ?? a.targetY } : null);
      this._placeLabels();
      this._applyFilter();
      this._mirror?.sync();
      if (fresh.length) this._mirror?.announce(`${fresh.length} more linked to ${this._nodeById.get(anchorId)?.label ?? anchorId}`);
    }
    /** Switch layout (a registered name or a layout function) and animate to it. */
    setLayout(name, opts = {}) {
      this._layoutName = name;
      this._layoutOpts = { ...opts };
      this._sectorExtra = {};
      this._renderer.showRings = name === "rings";
      this._relayout({ announce: false });
    }
    /** Fold `by` more nodes of a stub's sector out of the stub (sectors layout). */
    expandStub(stubId, by = 20) {
      const stub = this._layoutResult.stubs?.find((s) => s.id === stubId);
      if (!stub) return false;
      this._sectorExtra[stub.family] = (this._sectorExtra[stub.family] ?? 0) + by;
      this._relayout({ announce: false });
      this._mirror?.announce(`Showing ${Math.min(by, stub.count)} more`);
      return true;
    }
    /**
     * Fade non-matching nodes/edges in place. `fn(item, kind)` with kind
     * 'node' | 'edge', or {node?:fn, edge?:fn}; null clears.
     */
    setFilter(fn) {
      this._filter = fn ?? null;
      this._applyFilter();
      this._mirror?.sync();
    }
    /** Emphasise a set of node and/or edge ids (others dim); null clears. */
    highlight(ids) {
      this._highlight = ids ? new Set([...ids].map(String)) : null;
      this._renderer.highlightSet = this._highlight ? new Set([...this._highlight].filter((id) => this._sceneNodeById.has(id))) : null;
      this._renderer.invalidate();
    }
    /** Select an edge by id (null clears). Does not fire onEdgeSelect. */
    selectEdge(id) {
      this._selectedEdgeId = id == null ? null : String(id);
      this._renderer.selectedEdgeId = this._selectedEdgeId;
      this._renderer.invalidateOverlay();
    }
    get selectedEdge() {
      return this._selectedEdgeId ? this._edgeById.get(this._selectedEdgeId) ?? null : null;
    }
    /** Pop the history stack and re-centre there. Returns false when empty. */
    back() {
      const prev = this._history.pop();
      if (prev == null) return false;
      this.setCenter(prev, { push: false, reason: "back" });
      return true;
    }
    get canGoBack() {
      return this._history.length > 0;
    }
    get history() {
      return this._history.slice();
    }
    get centerId() {
      return this._centerId;
    }
    /** Show or hide suppressed/excluded edges and chips. */
    setShowSuppressed(on) {
      this._renderer.showSuppressed = !!on;
      this._renderer.invalidateStyles();
      this._placeLabels();
      this._mirror?.sync();
    }
    /** The visible scene (stubs included, collapsed nodes excluded). */
    getScene() {
      return { nodes: this._scene.nodes.slice(), edges: this._scene.edges.slice(), groups: this._scene.groups.slice(), centerId: this._centerId };
    }
    /** Current target position of a node (layout coordinates). */
    positionOf(id) {
      const t = this._targets.get(String(id));
      return t ? { x: t.x, y: t.y } : null;
    }
    // ── Public: view, theme, export ──────────────────────────────────────────
    setTheme(t) {
      this._baseTheme = resolveTheme(typeof t === "object" && t ? mergeTheme(this._baseTheme, t) : t);
      this.refreshTheme();
    }
    /** Re-read the `--mg-*` CSS custom properties (call after a dark-mode toggle). */
    refreshTheme() {
      let theme = this._baseTheme;
      if (this._opts.cssTokens !== false && typeof getComputedStyle !== "undefined") {
        const cs = getComputedStyle(this._container);
        const families = new Set(Object.keys(theme.edgeFamilies ?? {}));
        const langs = new Set(Object.keys(theme.langColors ?? {}));
        for (const e of this._all.edges) if (e.family != null) families.add(String(e.family));
        for (const n of this._all.nodes) if (n.lang != null) langs.add(String(n.lang));
        const tokens = readThemeTokens((name) => cs.getPropertyValue(name), { families, langs });
        theme = mergeTheme(theme, tokens);
      }
      this._theme = theme;
      this._renderer.theme = theme;
      this._applyReducedMotion();
      this._renderer._measureCache.clear();
      this._renderer.invalidateStyles();
      if (this._centerId != null) this._placeLabels();
    }
    get theme() {
      return this._theme;
    }
    /** Return pan/zoom to 1× at canvas centre. */
    resetView() {
      this._renderer._panX = 0;
      this._renderer._panY = 0;
      this._renderer._scale = 1;
      this._renderer.invalidateOverlay();
    }
    panBy(dx, dy) {
      this._renderer._panX += dx;
      this._renderer._panY += dy;
      this._renderer.invalidateOverlay();
    }
    /** Zoom to `scale`, keeping screen point (sx, sy) fixed (default: canvas centre). */
    zoomTo(scale, sx, sy) {
      const r = this._renderer;
      const s = Math.max(0.2, Math.min(5, scale));
      sx = sx ?? r.W / 2;
      sy = sy ?? r.H / 2;
      const wx = (sx - r._panX) / r._scale, wy = (sy - r._panY) / r._scale;
      r._scale = s;
      r._panX = sx - wx * s;
      r._panY = sy - wy * s;
      r.invalidateOverlay();
    }
    get view() {
      const r = this._renderer;
      return { panX: r._panX, panY: r._panY, scale: r._scale };
    }
    /** Vector snapshot (hulls, edges, nodes, labels, chips) as an SVG string. */
    toSVG(o = {}) {
      return sceneToSVG(this._renderer.snapshotScene(o));
    }
    /** Raster snapshot of the current view as a PNG Blob (`scale` × logical size). */
    toPNG(scale = 2) {
      const c = this._renderer.renderToCanvas(scale);
      return new Promise((resolve, reject) => {
        if (c.toBlob) c.toBlob((b) => b ? resolve(b) : reject(new Error("toBlob failed")), "image/png");
        else resolve(c.toDataURL("image/png"));
      });
    }
    /** Move keyboard focus into the graph (the focused node's mirror button). */
    focus(id) {
      if (!this._mirror) return false;
      return this._mirror.focusNode(id != null ? String(id) : this._mirror.focusId ?? this._centerId, { announce: true });
    }
    /** Move keyboard focus to an edge's mirror button (e.g. when a drawer closes). */
    focusEdge(id) {
      if (!this._mirror) return false;
      const e = this._edgeById.get(String(id));
      if (!e) return false;
      const nodeId = this._mirror.focusId === e.to ? e.to : e.from;
      this._mirror.focusNode(nodeId, { announce: false });
      return this._mirror.focusEdge(String(id));
    }
    /** Measured performance hook target: the renderer (exposed for benchmarks). */
    get renderer() {
      return this._renderer;
    }
    destroy() {
      this._unbindEvents();
      this._rmQuery?.removeEventListener?.("change", this._onRm);
      this._mirror?.destroy();
      this._renderer.destroy();
      this._tooltip.destroy();
    }
    // ── Private: data & layout ───────────────────────────────────────────────
    _replaceData(data = {}) {
      this._all.nodes = normalizeNodes(data.nodes);
      this._all.edges = normalizeEdges(data.edges);
      this._all.groups = [];
      this._nodeById = new Map(this._all.nodes.map((n) => [n.id, n]));
      this._edgeById = new Map(this._all.edges.map((e) => [e.id, e]));
      this._mergeGroups(data.groups);
      if (this._selectedEdgeId && !this._edgeById.has(this._selectedEdgeId)) this.selectEdge(null);
    }
    _mergeGroups(groups) {
      for (const g of groups ?? []) {
        if (!g || g.id == null) continue;
        const id = String(g.id);
        const cur = this._all.groups.find((x) => x.id === id);
        const members = (g.members ?? []).map(String);
        if (cur) {
          Object.assign(cur, g, { id, members: [.../* @__PURE__ */ new Set([...cur.members, ...members])] });
        } else this._all.groups.push({ ...g, id, members });
      }
    }
    _layoutFn() {
      const name = this._layoutName;
      if (typeof name === "function") return name;
      const fn = layouts[name];
      if (!fn) throw new Error(`mondograph: unknown layout "${name}"`);
      return fn;
    }
    _relayout({ announce }) {
      const { W, H } = this._renderer.containerSize;
      const graph = { nodes: this._all.nodes, edges: this._all.edges, groups: this._all.groups };
      const lopts = { ...this._layoutOpts, W, H, centerId: this._centerId, sectorExtra: this._sectorExtra };
      delete lopts.layoutAdapter;
      const version = ++this._layoutVersion;
      let result = this._layoutFn()(graph, lopts);
      if (!(result instanceof Map)) result = new Map(Object.entries(result ?? {}));
      this._layoutResult = result;
      this._targets = new Map(result);
      this._renderer.backEdges = result.backEdges ?? /* @__PURE__ */ new Set();
      this._buildScene();
      this._applyTargets(null);
      this._placeLabels();
      this._applyFilter();
      this.highlight(this._highlight);
      this._mirror?.sync();
      if (announce) this._mirror?.recentred(this._centerId);
      const adapter = this._layoutOpts.layoutAdapter;
      if (typeof adapter === "function") {
        Promise.resolve(adapter(graph, lopts)).then((pos) => {
          if (version !== this._layoutVersion || !pos) return;
          const m = pos instanceof Map ? pos : new Map(Object.entries(pos));
          for (const [id, p] of m) this._targets.set(String(id), { x: p.x, y: p.y });
          this._applyTargets(null);
          this._placeLabels();
        }).catch((err) => {
          if (this._opts.onError) this._opts.onError(err);
        });
      }
    }
    _buildScene() {
      const res = this._layoutResult;
      const collapsed = res.collapsed ?? /* @__PURE__ */ new Map();
      const nodes = this._all.nodes.filter((n) => !collapsed.has(n.id));
      for (const s of res.stubs ?? []) nodes.push({ ...s, label: s.label ?? `+${s.count}` });
      const ids = new Set(nodes.map((n) => n.id));
      const edges = this._all.edges.filter((e) => ids.has(e.from) && ids.has(e.to));
      const groups = this._all.groups;
      this._scene = { nodes, edges, groups };
      this._sceneNodeById = new Map(nodes.map((n) => [n.id, n]));
      const r = this._renderer;
      r.nodes = nodes;
      r.edges = edges;
      r.groups = groups;
      r.invalidateStyles();
    }
    /** Point every spring at its target; new nodes start at `origin` (or the centre). */
    _applyTargets(origin) {
      const r = this._renderer;
      const { W, H } = r.containerSize;
      const cx = W / 2, cy = H / 2;
      const reduced = r.reducedMotion;
      const inScene = new Set(this._scene.nodes.map((n) => n.id));
      for (const [id, s] of r.springNodes) if (!inScene.has(id)) s.targetOpacity = 0;
      for (const n of this._scene.nodes) {
        let t = this._targets.get(n.id);
        if (!t) {
          const j = jitter(n.id, Math.min(W, H) * 0.8);
          t = { x: cx + j.dx, y: cy + j.dy };
          this._targets.set(n.id, t);
        }
        let s = r.springNodes.get(n.id);
        if (!s) {
          const o = origin ?? { x: cx, y: cy };
          const j = jitter(n.id, 40);
          s = createSpringNode(o.x + j.dx, o.y + j.dy, 0);
          const v = jitter(n.id + "#v", 4);
          s.vx = v.dx;
          s.vy = v.dy;
          r.springNodes.set(n.id, s);
        }
        s.targetX = t.x;
        s.targetY = t.y;
        s.targetOpacity = 1;
        if (reduced) {
          s.x = t.x;
          s.y = t.y;
          s.opacity = 1;
          s.vx = s.vy = 0;
        }
      }
      r.invalidate();
    }
    _placeLabels() {
      const r = this._renderer;
      const obstacles = [];
      for (const n of this._scene.nodes) {
        if (!n.chips || !n.chips.length || r.chipsFor !== "all") continue;
        const t = this._targets.get(n.id);
        if (!t) continue;
        for (const b of r.chipOffsets(n)) obstacles.push({ x0: t.x + b.x, y0: t.y + b.y, x1: t.x + b.x + b.w, y1: t.y + b.y + b.h, owner: "#chip" });
      }
      const font = this._theme.font;
      r.labelPlacement = placeLabels(r.labelItems(this._targets), {
        measure: (text, size) => r.measure(text, `700 ${size}px ${font}`),
        obstacles
      });
      r.invalidate();
    }
    _matches(item, kind) {
      const f2 = this._filter;
      if (!f2) return true;
      if (typeof f2 === "function") return !!f2(item, kind);
      const g = f2[kind];
      return g ? !!g(item) : true;
    }
    _applyFilter() {
      const faded = /* @__PURE__ */ new Set();
      const fadedEdges = /* @__PURE__ */ new Set();
      if (this._filter) {
        for (const n of this._scene.nodes) {
          if (n.id === this._centerId) continue;
          if (!this._matches(n, "node")) faded.add(n.id);
        }
        for (const e of this._scene.edges) {
          if (faded.has(e.from) || faded.has(e.to) || !this._matches(e, "edge")) fadedEdges.add(e.id);
        }
      }
      this._faded = faded;
      this._fadedEdges = fadedEdges;
      this._renderer.invalidate();
    }
    _nodeAlphaOf(id) {
      if (this._faded.has(id)) return this._theme.fadeAlpha ?? 0.12;
      if (this._highlight && !this._highlight.has(id) && id !== this._centerId) return 0.35;
      return 1;
    }
    _edgeAlphaOf(e) {
      if (this._fadedEdges.has(e.id)) return this._theme.fadeAlpha ?? 0.12;
      if (this._highlight && !this._highlight.has(e.id) && !(this._highlight.has(e.from) && this._highlight.has(e.to))) return 0.3;
      return 1;
    }
    _edgeVisible(e) {
      const st = this._renderer._styleMap().get(e.id);
      return !!st && !st.hidden && !this._fadedEdges.has(e.id);
    }
    /** Visible neighbours of `id`, clockwise from 12 o'clock around it. */
    _neighbours(id) {
      const t0 = this._targets.get(id);
      const seen = /* @__PURE__ */ new Set();
      const out = [];
      for (const e of this._scene.edges) {
        let other = null;
        if (e.from === id) other = e.to;
        else if (e.to === id) other = e.from;
        if (other == null || other === id || seen.has(other) || this._faded.has(other)) continue;
        if (!this._edgeVisible(e)) continue;
        seen.add(other);
        out.push({ id: other, edge: e });
      }
      if (t0) {
        const ang = (o) => {
          const t = this._targets.get(o.id);
          if (!t) return 0;
          let a = Math.atan2(t.y - t0.y, t.x - t0.x) + Math.PI / 2;
          if (a < 0) a += Math.PI * 2;
          return a;
        };
        out.sort((a, b) => ang(a) - ang(b));
      }
      return out;
    }
    _chipsOf(node) {
      const show = this._renderer.showSuppressed;
      return (node.chips ?? []).filter((c) => c && (show || c.status !== "suppressed" && c.status !== "excluded"));
    }
    _a11yHost() {
      return {
        getScene: () => ({ nodes: this._scene.nodes.filter((n) => !this._faded.has(n.id)), centerId: this._centerId }),
        neighbours: (id) => this._neighbours(id),
        edgesOf: (id) => this._scene.edges.filter((e) => (e.from === id || e.to === id) && e.from !== e.to && this._edgeVisible(e) && !this._faded.has(e.from === id ? e.to : e.from)).map((e) => ({ id: e.from === id ? e.to : e.from, edge: e })),
        chipsOf: (node) => this._chipsOf(node),
        recentre: (id) => this._activateNode(id, "keyboard"),
        back: () => this.back(),
        activateEdge: (edgeId) => {
          const e = this._edgeById.get(edgeId);
          if (!e) return;
          this.selectEdge(e.id);
          this._opts.onEdgeSelect?.(e);
        },
        activateChip: (nodeId, chipId) => {
          const node = this._sceneNodeById.get(nodeId);
          const chip = node?.chips?.find((c) => c.id === chipId);
          if (node && chip) this._opts.onChipSelect?.(node, chip);
        },
        setFocus: (id) => {
          this._renderer.focusedId = id;
          this._renderer.invalidateOverlay();
        },
        setFocusedEdge: (id) => {
          this._renderer.focusedEdgeId = id;
          this._renderer.invalidateOverlay();
        },
        setFocusedChip: (nodeId, chipId) => {
          this._renderer.focusedChip = chipId ? { nodeId, chipId } : null;
          this._renderer.invalidateOverlay();
        }
      };
    }
    _afterCenter(reason) {
      const centerNode = this._nodeById.get(this._centerId);
      if (centerNode && this._opts.onSelect) this._opts.onSelect(centerNode);
      if (this._opts.onCenterChange) this._opts.onCenterChange(this._centerId, { reason, canGoBack: this.canGoBack });
    }
    _activateNode(id, reason) {
      const n = this._sceneNodeById.get(id);
      if (!n) return;
      if (n.type === "stub") {
        if (this._opts.onStubSelect) this._opts.onStubSelect(n);
        else this.expandStub(n.id);
        return;
      }
      if (id === this._centerId) {
        this._opts.onSelect?.(n);
        return;
      }
      this.setCenter(id, { reason });
    }
    _applyReducedMotion() {
      const m = this._rmMode;
      const on = m === true || m === "auto" && prefersReducedMotion();
      if (this._renderer) {
        this._renderer.reducedMotion = on;
        this._renderer.invalidate();
      }
    }
    // ── Private: pointer ─────────────────────────────────────────────────────
    _canvasXY(e) {
      const rect = this._renderer.canvas.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top };
    }
    _toWorld(x, y) {
      const r = this._renderer;
      return { x: (x - r._panX) / r._scale, y: (y - r._panY) / r._scale };
    }
    /** Hit-test at a screen point → {kind:'chip'|'node'|'edge', ...} | null. */
    pick(sx, sy) {
      const r = this._renderer;
      const { x, y } = this._toWorld(sx, sy);
      const pad = this._isTouch ? 6 : 1;
      const chip = hitTestChips(x, y, r.chipBoxes, pad / r._scale);
      if (chip && !this._faded.has(chip.nodeId)) return { kind: "chip", nodeId: chip.nodeId, chip: chip.chip };
      const list = [];
      for (const n of this._scene.nodes) {
        const s = r.springNodes.get(n.id);
        if (!s || s.opacity < 0.2 || this._faded.has(n.id)) continue;
        list.push({ id: n.id, x: s.x, y: s.y, hitRadius: hitRadius(n, n.id === this._centerId, this._isTouch) });
      }
      const id = hitTest(x, y, list);
      if (id) return { kind: "node", id };
      const tol = (this._isTouch ? EDGE_TOL_TOUCH : EDGE_TOL_MOUSE) / r._scale;
      const eid = hitTestEdges(x, y, r.edgeGeom, tol, (edgeId) => {
        const e = this._edgeById.get(edgeId);
        return !!e && this._edgeVisible(e);
      });
      if (eid) return { kind: "edge", id: eid };
      return null;
    }
    _bindEvents() {
      const canvas = this._renderer.canvas;
      const r = this._renderer;
      const pointers = /* @__PURE__ */ new Map();
      let down = null, dragged = false, pinch = null, idleTimer = null;
      const interact = (ms) => {
        r.interacting = true;
        clearTimeout(idleTimer);
        if (ms != null) idleTimer = setTimeout(() => {
          r.interacting = false;
        }, ms);
      };
      this._interact = interact;
      this._onMove = (e) => {
        if (e.pointerType === "touch") this._isTouch = true;
        if (pointers.has(e.pointerId)) pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pinch && pointers.size === 2) {
          const [a, b] = [...pointers.values()];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          const rect = canvas.getBoundingClientRect();
          this.zoomTo(pinch.scale * d / pinch.d, (a.x + b.x) / 2 - rect.left, (a.y + b.y) / 2 - rect.top);
          return;
        }
        if (down && e.buttons !== 0) {
          const dx = e.clientX - down.x, dy = e.clientY - down.y;
          if (!dragged && Math.hypot(dx, dy) > DRAG_THRESHOLD) dragged = true;
          if (dragged) {
            this.panBy(e.clientX - down.lx, e.clientY - down.ly);
            down.lx = e.clientX;
            down.ly = e.clientY;
            this._tooltip.hide();
            return;
          }
        }
        const { x, y } = this._canvasXY(e);
        this._hover(this.pick(x, y), x, y);
      };
      this._onDown = (e) => {
        pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
        if (pointers.size === 2) {
          const [a, b] = [...pointers.values()];
          pinch = { d: Math.max(1, Math.hypot(a.x - b.x, a.y - b.y)), scale: r._scale };
          dragged = true;
          return;
        }
        down = { x: e.clientX, y: e.clientY, lx: e.clientX, ly: e.clientY };
        dragged = false;
        interact();
      };
      this._onUp = (e) => {
        pointers.delete(e.pointerId);
        if (pointers.size < 2) pinch = null;
        if (!pointers.size) {
          down = null;
          interact(400);
        }
      };
      this._onClick = (e) => {
        if (dragged) {
          dragged = false;
          return;
        }
        const { x, y } = this._canvasXY(e);
        if (x > r.W - 40 && y < 40) {
          this.resetView();
          return;
        }
        const hit = this.pick(x, y);
        if (!hit) {
          if (this._selectedEdgeId) {
            this.selectEdge(null);
            this._opts.onEdgeSelect?.(null);
          }
          return;
        }
        if (hit.kind === "chip") {
          const node = this._sceneNodeById.get(hit.nodeId);
          this._opts.onChipSelect?.(node, hit.chip);
        } else if (hit.kind === "node") {
          this._mirror?.focusNode(hit.id, { announce: false, move: false });
          this._activateNode(hit.id, "click");
        } else if (hit.kind === "edge") {
          const edge = this._edgeById.get(hit.id);
          this.selectEdge(hit.id);
          this._opts.onEdgeSelect?.(edge);
        }
      };
      this._onWheel = (e) => {
        e.preventDefault();
        const { x, y } = this._canvasXY(e);
        interact(300);
        this.zoomTo(r._scale * (e.deltaY > 0 ? 0.9 : 1.1), x, y);
      };
      this._onLeave = () => {
        this._hover(null);
      };
      this._onTouchStart = () => {
        this._isTouch = true;
      };
      canvas.addEventListener("pointermove", this._onMove);
      canvas.addEventListener("pointerdown", this._onDown);
      canvas.addEventListener("pointerup", this._onUp);
      canvas.addEventListener("pointercancel", this._onUp);
      canvas.addEventListener("pointerleave", this._onLeave);
      canvas.addEventListener("click", this._onClick);
      canvas.addEventListener("wheel", this._onWheel, { passive: false });
      canvas.addEventListener("touchstart", this._onTouchStart, { passive: true });
    }
    _hover(hit, x, y) {
      const r = this._renderer;
      const prev = `${r.hoveredId}|${r.hoveredEdgeId}|${r.hoveredChip?.nodeId}|${r.hoveredChip?.chipId}`;
      r.hoveredId = hit?.kind === "node" ? hit.id : null;
      r.hoveredEdgeId = hit?.kind === "edge" ? hit.id : null;
      r.hoveredChip = hit?.kind === "chip" ? { nodeId: hit.nodeId, chipId: hit.chip.id } : null;
      const now = `${r.hoveredId}|${r.hoveredEdgeId}|${r.hoveredChip?.nodeId}|${r.hoveredChip?.chipId}`;
      if (prev !== now) r.invalidateOverlay();
      r.canvas.style.cursor = hit ? "pointer" : "grab";
      if (!hit) {
        this._tooltip.hide();
        return;
      }
      if (hit.kind === "node") {
        const node = this._sceneNodeById.get(hit.id);
        if (node) this._tooltip.show(node, x, y);
      } else if (hit.kind === "chip") {
        const c = hit.chip;
        const html = this._opts.renderChipTooltip ? this._opts.renderChipTooltip(this._sceneNodeById.get(hit.nodeId), c) : c.overflow ? `${escapeHtml(c.count)} more` : `<strong>${escapeHtml(c.label)}</strong>${c.status && c.status !== "open" ? ` \xB7 ${escapeHtml(c.status)}` : ""}`;
        this._tooltip.showHTML(html, x, y);
      } else if (hit.kind === "edge") {
        const e = this._edgeById.get(hit.id);
        if (this._opts.renderEdgeTooltip) this._tooltip.showHTML(this._opts.renderEdgeTooltip(e), x, y);
        else this._tooltip.hide();
      }
    }
    _unbindEvents() {
      const canvas = this._renderer.canvas;
      canvas.removeEventListener("pointermove", this._onMove);
      canvas.removeEventListener("pointerdown", this._onDown);
      canvas.removeEventListener("pointerup", this._onUp);
      canvas.removeEventListener("pointercancel", this._onUp);
      canvas.removeEventListener("pointerleave", this._onLeave);
      canvas.removeEventListener("click", this._onClick);
      canvas.removeEventListener("wheel", this._onWheel);
      canvas.removeEventListener("touchstart", this._onTouchStart);
    }
  };
  var ThinkGraph = MondoGraph;
  var src_default = MondoGraph;
  return __toCommonJS(src_exports);
})();
if (typeof module === 'object' && module.exports) { module.exports = MondoGraphLib; }
else if (typeof define === 'function' && define.amd) { define([], function () { return MondoGraphLib; }); }
if (typeof globalThis !== 'undefined') { globalThis.MondoGraphLib = MondoGraphLib; globalThis.ThinkGraphLib = MondoGraphLib; }
//# sourceMappingURL=mondograph.umd.cjs.map
