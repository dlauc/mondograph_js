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
  if (!input || input === 'mondonomo') return structuredClone(MONDONOMO);
  return deepMerge(structuredClone(MONDONOMO), input);
}

export function langColor(theme, lang) {
  return theme.langColors[lang] ?? '#64748b';
}
