const MONDONOMO = {
  background:   '#020f20',
  ringStroke:   '#02b9b9',
  centerGlow:   '#02b9b9',
  font:         '"Noto Sans", sans-serif',
  fontWeight:   { label: 700, sub: 400 },
  spring:       { K: 0.08, damping: 0.78 },
  opacitySpring:{ K: 0.14, damping: 0.82 },

  langColors: {
    English:      '#02b9b9',
    French:       '#7E4067',
    Spanish:      '#9a5080',
    Latin:        '#c99ab8',
    Greek:        '#add8f3',
    Hebrew:       '#6ac9df',
    'Proto-Sem.': '#557799',
  },

  edgeTypes: {
    derives_from: { stroke: '#02b9b9', dash: [],    width: 1.8, arrow: true  },
    cognate_of:   { stroke: '#7E4067', dash: [5,3], width: 1.4, arrow: false },
    means:        { stroke: '#e8b84b', dash: [2,4], width: 1.1, arrow: true  },
    refers_to:    { stroke: '#c16b9a', dash: [2,4], width: 1.1, arrow: false },
    attested_as:  { stroke: '#e07050', dash: [2,3], width: 0.9, arrow: false },
    popular_in:   { stroke: '#02b9b9', dash: [],    width: 1.4, arrow: false },
    variant_of:   { stroke: '#7E4067', dash: [4,3], width: 1.2, arrow: false },
    _fallback:    { stroke: '#666666', dash: [3,3], width: 1.0, arrow: false },
  },

  nodeTypes: {
    text:        { fill: '#020f20', stroke: 'langColor', shape: 'circle'  },
    flag:        { fill: 'image',   stroke: '#02b9b9',   shape: 'circle'  },
    image:       { fill: 'image',   stroke: '#02b9b9',   shape: 'circle'  },
    concept:     { fill: '#020f20', stroke: '#e8b84b',   shape: 'ellipse', dash: [3,2] },
    referent:    { fill: '#020f20', stroke: '#c16b9a',   shape: 'diamond', dash: [3,2] },
    element:     { fill: '#020f20', stroke: 'langColor', shape: 'pill',    opacity: 0.6 },
    attestation: { fill: '#020f20', stroke: '#e07050',   shape: 'pin'     },
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
  return theme.langColors[lang] ?? '#888888';
}
