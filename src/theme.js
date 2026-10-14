const MONDONOMO = {
  background:   '#020f20',
  ringStroke:   '#02b9b9',
  centerGlow:   '#02b9b9',
  font:         '"Noto Sans", sans-serif',
  fontWeight:   { label: 700, sub: 400 },
  spring:       { K: 0.08, damping: 0.78, idleNoise: 0.22 },
  opacitySpring:{ K: 0.14, damping: 0.82 },

  // Brand-tailored language colors for etymology origins
  langColors: {
    English:      '#38bdf8',
    French:       '#fb7185',
    Spanish:      '#f59e0b',
    Latin:        '#a855f7',
    Greek:        '#10b981',
    Hebrew:       '#06b6d4',
    Germanic:     '#f43f5e',
    Celtic:       '#14b8a6',
    Slavic:       '#ec4899',
    'Proto-Sem.': '#64748b',
    Arabic:       '#84cc16',
    Italian:      '#eab308',
  },

  // Premium Mondonomo database relationship types
  edgeTypes: {
    derives_from:    { stroke: '#02b9b9', dash: [],      width: 2.0, arrow: true,  animate: false },
    cognate_of:      { stroke: '#a855f7', dash: [4, 4],  width: 1.6, arrow: false, animate: false },
    variant_of:      { stroke: '#ec4899', dash: [6, 3],  width: 1.8, arrow: false, animate: false },
    transliteration: { stroke: '#00d2ff', dash: [1, 2],  width: 1.5, arrow: false, animate: false },
    related_name:    { stroke: '#38bdf8', dash: [2, 4],  width: 1.2, arrow: false, animate: false },
    means:           { stroke: '#eab308', dash: [2, 4],  width: 1.2, arrow: true,  animate: false },
    refers_to:       { stroke: '#cbd5e1', dash: [3, 3],  width: 1.2, arrow: false, animate: false },
    attested_as:     { stroke: '#f43f5e', dash: [2, 3],  width: 1.0, arrow: false, animate: false },
    popular_in:      { stroke: '#02b9b9', dash: [],      width: 1.5, arrow: false, animate: false },
    _fallback:       { stroke: '#64748b', dash: [3, 3],  width: 1.2, arrow: false, animate: false },
  },

  // Display families (Name Family Explorer F1–F9). Colour per family; the
  // stroke pattern comes from provenance, not from here.
  edgeFamilies: {
    F1:       { stroke: '#00d2ff', dash: [1, 2], width: 1.3, arrow: false },
    F2:       { stroke: '#38bdf8', dash: [],     width: 1.5, arrow: false },
    F3:       { stroke: '#a855f7', dash: [],     width: 1.4, arrow: false },
    F4:       { stroke: '#eab308', dash: [],     width: 1.3, arrow: false },
    F5:       { stroke: '#fb7185', dash: [],     width: 1.4, arrow: true  },
    F6:       { stroke: '#ec4899', dash: [],     width: 1.4, arrow: false },
    F7:       { stroke: '#14b8a6', dash: [],     width: 1.3, arrow: false },
    F8:       { stroke: '#02b9b9', dash: [],     width: 1.6, arrow: true  },
    F9:       { stroke: '#64748b', dash: [],     width: 1.0, arrow: false },
    _default: { stroke: '#64748b', dash: [],     width: 1.2, arrow: false },
  },

  labelBackground: '#ffffff',
  chipFill:     '#05213f',
  chipInk:      '#e2f7f7',
  chipStroke:   'rgba(2,185,185,0.35)',
  chipActiveInk:'#020f20',
  hullColor:    '#02b9b9',
  hullAlpha:    0.10,
  fadeAlpha:    0.12,
  focusRing:    '#ffffff',

  // Node styling definitions
  nodeTypes: {
    given:       { fill: '#020f20', stroke: 'langColor', shape: 'circle' },
    surname:     { fill: '#020f20', stroke: 'langColor', shape: 'capsule' },
    text:        { fill: '#020f20', stroke: 'langColor', shape: 'circle' },
    flag:        { fill: 'image',   stroke: '#02b9b9',   shape: 'circle' },
    image:       { fill: 'image',   stroke: '#02b9b9',   shape: 'circle' },
    concept:     { fill: '#020f20', stroke: '#eab308',   shape: 'ellipse', dash: [3, 2] },
    referent:    { fill: '#020f20', stroke: '#ec4899',   shape: 'diamond', dash: [3, 2] },
    element:     { fill: '#020f20', stroke: 'langColor', shape: 'pill',    opacity: 0.6 },
    attestation: { fill: '#020f20', stroke: '#f43f5e',   shape: 'pin' },
  },

  // Premium gender-accent colors
  genderColors: {
    M: '#38bdf8', // male (glowing sky blue)
    F: '#fb7185', // female (glowing soft rose)
    U: '#c084fc', // unisex (glowing lavender/purple)
  },

  qualityOpacity: [1.0, 0.85, 0.65, 0.45],
};

// ── Editorial light theme ────────────────────────────────────────────────────
// Ink-on-paper, restrained colour, calm motion. Nodes are paper-white with a
// thin etymology-coloured ring; depth comes from a soft shadow, not a glow.
const ACCENT = '#0d9488';   // refined Mondonomo teal, the lone brand accent

const EDITORIAL_LIGHT = {
  background:   '#fbfaf8',                 // warm paper
  ringStroke:   '#2b2b34',                 // muted ink; rings drawn at low globalAlpha
  centerGlow:   ACCENT,                    // accent used for affordances/spinner
  centerAura:   'rgba(13,148,136,0.10)',   // soft halo behind the centre node
  accent:       ACCENT,
  font:         '"Noto Sans", sans-serif',
  fontWeight:   { label: 700, sub: 400 },

  // Node surfaces & text (light-on-light)
  nodeFill:     '#ffffff',
  nodeLabel:    '#22202b',                 // ink
  nodeSubLabel: 'rgba(34,32,43,0.45)',     // muted metadata
  shadow:       'rgba(30,30,45,0.12)',     // soft drop shadow for depth
  badgeBacking: '#ffffff',
  badgeBorder:  'rgba(20,20,30,0.14)',
  uiMuted:      'rgba(20,20,30,0.40)',     // reset button / chrome
  edgeParticle: ACCENT,

  // Calm settle; deterministic float replaces random jitter (see renderer)
  spring:       { K: 0.06, damping: 0.82, idleNoise: 0 },
  opacitySpring:{ K: 0.12, damping: 0.85 },
  float:        { amp: 0.18, speed: 0.018 },

  // Etymology colours retuned for legibility on a light ground
  langColors: {
    English:      '#2563eb',
    French:       '#db2777',
    Spanish:      '#d97706',
    Latin:        '#7c3aed',
    Greek:        '#059669',
    Hebrew:       '#0891b2',
    Germanic:     '#dc2626',
    Celtic:       '#0d9488',
    Slavic:       '#c026d3',
    'Proto-Sem.': '#52525b',
    Arabic:       '#65a30d',
    Italian:      '#ca8a04',
  },

  // Quiet hairlines; colour only where it carries meaning
  edgeTypes: {
    derives_from:    { stroke: ACCENT,                  dash: [],     width: 1.6, arrow: true,  animate: false },
    cognate_of:      { stroke: '#7c3aed',               dash: [4, 4], width: 1.2, arrow: false, animate: false },
    variant_of:      { stroke: '#db2777',               dash: [6, 3], width: 1.3, arrow: false, animate: false },
    transliteration: { stroke: '#0891b2',               dash: [1, 3], width: 1.1, arrow: false, animate: false },
    related_name:    { stroke: '#2563eb',               dash: [2, 4], width: 1.0, arrow: false, animate: false },
    means:           { stroke: '#ca8a04',               dash: [2, 4], width: 1.0, arrow: true,  animate: false },
    refers_to:       { stroke: 'rgba(20,20,30,0.25)',   dash: [3, 3], width: 1.0, arrow: false, animate: false },
    attested_as:     { stroke: '#dc2626',               dash: [2, 3], width: 0.9, arrow: false, animate: false },
    popular_in:      { stroke: ACCENT,                  dash: [],     width: 1.2, arrow: false, animate: false },
    _fallback:       { stroke: 'rgba(20,20,30,0.22)',   dash: [3, 3], width: 1.0, arrow: false, animate: false },
  },

  edgeFamilies: {
    F1:       { stroke: '#0891b2', dash: [1, 3], width: 1.1, arrow: false },
    F2:       { stroke: '#2563eb', dash: [],     width: 1.3, arrow: false },
    F3:       { stroke: '#7c3aed', dash: [],     width: 1.2, arrow: false },
    F4:       { stroke: '#ca8a04', dash: [],     width: 1.1, arrow: false },
    F5:       { stroke: '#db2777', dash: [],     width: 1.2, arrow: true  },
    F6:       { stroke: '#c026d3', dash: [],     width: 1.2, arrow: false },
    F7:       { stroke: '#0d9488', dash: [],     width: 1.1, arrow: false },
    F8:       { stroke: '#52525b', dash: [],     width: 1.4, arrow: true  },
    F9:       { stroke: 'rgba(20,20,30,0.30)', dash: [], width: 0.9, arrow: false },
    _default: { stroke: 'rgba(20,20,30,0.35)', dash: [], width: 1.0, arrow: false },
  },

  labelBackground: '#fbfaf8',
  chipFill:     '#ffffff',
  chipInk:      '#22202b',
  chipStroke:   'rgba(20,20,30,0.18)',
  chipActiveInk:'#ffffff',
  hullColor:    ACCENT,
  hullAlpha:    0.07,
  fadeAlpha:    0.12,
  focusRing:    '#22202b',

  nodeTypes: {
    given:       { fill: '#ffffff', stroke: 'langColor', shape: 'circle' },
    surname:     { fill: '#ffffff', stroke: 'langColor', shape: 'capsule' },
    text:        { fill: '#ffffff', stroke: 'langColor', shape: 'circle' },
    flag:        { fill: 'image',   stroke: ACCENT,      shape: 'circle' },
    image:       { fill: '#ffffff', stroke: ACCENT,      shape: 'circle' },
    concept:     { fill: '#ffffff', stroke: '#ca8a04',   shape: 'ellipse', dash: [3, 2] },
    referent:    { fill: '#ffffff', stroke: '#db2777',   shape: 'diamond', dash: [3, 2] },
    element:     { fill: '#ffffff', stroke: 'langColor', shape: 'pill',    opacity: 0.65 },
    attestation: { fill: '#ffffff', stroke: '#dc2626',   shape: 'pin' },
  },

  genderColors: {
    M: '#2563eb', // male
    F: '#db2777', // female
    U: '#9333ea', // unisex
  },

  qualityOpacity: [1.0, 0.85, 0.65, 0.45],
};

const PRESETS = { mondonomo: MONDONOMO, editorialLight: EDITORIAL_LIGHT };

function deepMerge(base, override) {
  const result = { ...base };
  for (const key of Object.keys(override)) {
    const bv = base[key], ov = override[key];
    if (ov !== null && typeof ov === 'object' && !Array.isArray(ov)
        && bv !== null && typeof bv === 'object' && !Array.isArray(bv)) {
      result[key] = deepMerge(bv, ov);
    } else {
      result[key] = ov;
    }
  }
  return result;
}

export function resolveTheme(input) {
  if (input == null) return structuredClone(MONDONOMO);
  if (typeof input === 'string') return structuredClone(PRESETS[input] ?? MONDONOMO);
  // Object input deep-merges onto the dark base (legacy behaviour preserved).
  return deepMerge(structuredClone(MONDONOMO), input);
}

export function langColor(theme, lang) {
  return theme.langColors[lang] ?? '#64748b';
}

/** Deep-merge `override` onto `theme` (returns a new object). */
export function mergeTheme(theme, override) {
  return deepMerge(theme, override || {});
}

/** CSS-safe slug for a family or language key used in `--mg-edge-<slug>`. */
export function tokenSlug(key) {
  return String(key).toLowerCase().replace(/[^a-z0-9_-]+/g, '-');
}

/**
 * Read `--mg-*` CSS custom properties into a partial theme.
 * Unset tokens are skipped so the preset stays the fallback.
 *
 *   --mg-background --mg-ink --mg-muted --mg-accent --mg-aura --mg-node-fill
 *   --mg-ring --mg-shadow --mg-font --mg-label-bg --mg-focus
 *   --mg-chip-fill --mg-chip-ink --mg-chip-stroke
 *   --mg-hull --mg-hull-alpha --mg-fade-alpha
 *   --mg-edge (default edge colour)  --mg-edge-<family>  (e.g. --mg-edge-f2)
 *   --mg-lang-<lang>  --mg-gender-m / -f / -u
 *
 * @param {(name:string)=>string} getVar  e.g. n => getComputedStyle(el).getPropertyValue(n)
 * @param {{families?:Iterable<string>, langs?:Iterable<string>}} [keys]
 * @returns {object} partial theme
 */
export function readThemeTokens(getVar, keys = {}) {
  const v = (name) => {
    const raw = getVar(name);
    return raw == null ? '' : String(raw).trim();
  };
  const t = {};
  const set = (prop, name) => { const x = v(name); if (x) t[prop] = x; };
  const num = (prop, name) => { const x = parseFloat(v(name)); if (Number.isFinite(x)) t[prop] = x; };
  set('background', '--mg-background');
  set('nodeLabel', '--mg-ink');
  set('chipInk', '--mg-ink');
  set('nodeSubLabel', '--mg-muted');
  set('uiMuted', '--mg-muted');
  set('accent', '--mg-accent');
  set('centerGlow', '--mg-accent');
  set('edgeParticle', '--mg-accent');
  set('centerAura', '--mg-aura');
  set('nodeFill', '--mg-node-fill');
  set('badgeBacking', '--mg-node-fill');
  set('chipFill', '--mg-node-fill');
  set('ringStroke', '--mg-ring');
  set('shadow', '--mg-shadow');
  set('font', '--mg-font');
  set('labelBackground', '--mg-label-bg');
  if (!t.labelBackground && t.background) t.labelBackground = t.background;
  set('focusRing', '--mg-focus');
  set('chipFill', '--mg-chip-fill');
  set('chipInk', '--mg-chip-ink');
  set('chipStroke', '--mg-chip-stroke');
  set('hullColor', '--mg-hull');
  num('hullAlpha', '--mg-hull-alpha');
  num('fadeAlpha', '--mg-fade-alpha');

  const fams = {};
  const def = v('--mg-edge');
  if (def) fams._default = { stroke: def };
  for (const f of keys.families ?? []) {
    const c = v(`--mg-edge-${tokenSlug(f)}`);
    if (c) fams[f] = { stroke: c };
  }
  if (Object.keys(fams).length) t.edgeFamilies = fams;

  const langs = {};
  for (const l of keys.langs ?? []) {
    const c = v(`--mg-lang-${tokenSlug(l)}`);
    if (c) langs[l] = c;
  }
  if (Object.keys(langs).length) t.langColors = langs;

  const g = {};
  for (const k of ['m', 'f', 'u']) { const c = v(`--mg-gender-${k}`); if (c) g[k.toUpperCase()] = c; }
  if (Object.keys(g).length) t.genderColors = g;
  return t;
}
