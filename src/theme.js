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
