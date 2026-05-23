// examples/world/data.js
// Rich multi-node Mondonomo database graph showcasing popularities, genders, flag badges, and relationships.

export const WORLD_DATA = {
  alexander: {
    nodes: [
      { id: 'alexander', label: 'Alexander', type: 'given', gender: 'M', lang: 'English', popularity: 0.95, flags: ['US', 'GB', 'CA', 'AU'], meta: { note: 'Extremely popular English given name.' } },
      
      // Transliterations
      { id: 'alejandro', label: 'Alejandro', type: 'given', gender: 'M', lang: 'Spanish', popularity: 0.85, flags: ['ES', 'MX', 'AR'] },
      { id: 'alexandre', label: 'Alexandre', type: 'given', gender: 'M', lang: 'French', popularity: 0.80, flags: ['FR', 'CA'] },
      { id: 'alessandro', label: 'Alessandro', type: 'given', gender: 'M', lang: 'Italian', popularity: 0.82, flags: ['IT'] },
      { id: 'oleksandr', label: 'Oleksandr', type: 'given', gender: 'M', lang: 'Slavic', popularity: 0.78, flags: ['UA'] },
      
      // Cognates
      { id: 'alastair', label: 'Alastair', type: 'given', gender: 'M', lang: 'Celtic', popularity: 0.38, flags: ['GB'] },
      { id: 'sander', label: 'Sander', type: 'given', gender: 'M', lang: 'Germanic', popularity: 0.52, flags: ['NL', 'DE'] },
      
      // Spelling Variants & Diminutives
      { id: 'alex', label: 'Alex', type: 'given', gender: 'U', lang: 'English', popularity: 0.88, flags: ['US', 'GB'] },
      { id: 'alec', label: 'Alec', type: 'given', gender: 'M', lang: 'English', popularity: 0.45, flags: ['US'] },
      { id: 'sasha', label: 'Sasha', type: 'given', gender: 'U', lang: 'Slavic', popularity: 0.72, flags: ['UA'] },
      
      // Surnames
      { id: 'alexander_surname', label: 'Alexander', type: 'surname', lang: 'English', popularity: 0.70, flags: ['US', 'GB'] },
      { id: 'alexandrov', label: 'Alexandrov', type: 'surname', lang: 'Slavic', popularity: 0.60, flags: ['UA'] },
      
      // Roots & Elements
      { id: 'alexandros', label: 'Alexandros', type: 'text', lang: 'Greek', popularity: 0.30 },
      { id: 'alexein', label: 'alexein', type: 'element', lang: 'Greek', popularity: 0.15 },
      { id: 'aner', label: 'aner', type: 'element', lang: 'Greek', popularity: 0.15 },
    ],
    edges: [
      { from: 'alexander', to: 'alejandro', type: 'transliteration', weight: 0.90 },
      { from: 'alexander', to: 'alexandre', type: 'transliteration', weight: 0.92 },
      { from: 'alexander', to: 'alessandro', type: 'transliteration', weight: 0.88 },
      { from: 'alexander', to: 'oleksandr', type: 'transliteration', weight: 0.85 },
      
      { from: 'alexander', to: 'alastair', type: 'cognate_of', weight: 0.70 },
      { from: 'alexander', to: 'sander', type: 'cognate_of', weight: 0.75 },
      
      { from: 'alexander', to: 'alex', type: 'variant_of', weight: 0.95 },
      { from: 'alexander', to: 'alec', type: 'variant_of', weight: 0.82 },
      { from: 'alexander', to: 'sasha', type: 'variant_of', weight: 0.80 },
      
      { from: 'alexander', to: 'alexander_surname', type: 'related_name', weight: 0.88 },
      { from: 'alexander', to: 'alexandrov', type: 'related_name', weight: 0.75 },
      
      { from: 'alexander', to: 'alexandros', type: 'derives_from', weight: 0.95 },
      { from: 'alexandros', to: 'alexein', type: 'derives_from', weight: 0.90 },
      { from: 'alexandros', to: 'aner', type: 'derives_from', weight: 0.90 },
    ],
  },
  
  alejandro: {
    nodes: [
      { id: 'alejandro', label: 'Alejandro', type: 'given', gender: 'M', lang: 'Spanish', popularity: 0.85, flags: ['ES', 'MX', 'AR'], meta: { note: 'Elegant Spanish form of Alexander.' } },
      { id: 'alexander', label: 'Alexander', type: 'given', gender: 'M', lang: 'English', popularity: 0.95, flags: ['US', 'GB'] },
      { id: 'alex', label: 'Alex', type: 'given', gender: 'U', lang: 'English', popularity: 0.88, flags: ['US'] },
      { id: 'alessandro', label: 'Alessandro', type: 'given', gender: 'M', lang: 'Italian', popularity: 0.82, flags: ['IT'] },
      { id: 'ES', label: 'Spain', type: 'flag', iso2: 'ES' },
      { id: 'MX', label: 'Mexico', type: 'flag', iso2: 'MX' },
    ],
    edges: [
      { from: 'alejandro', to: 'alexander', type: 'transliteration', weight: 0.90 },
      { from: 'alejandro', to: 'alex', type: 'variant_of', weight: 0.85 },
      { from: 'alejandro', to: 'alessandro', type: 'transliteration', weight: 0.88 },
      { from: 'alejandro', to: 'ES', type: 'popular_in', weight: 0.95 },
      { from: 'alejandro', to: 'MX', type: 'popular_in', weight: 0.90 },
    ],
  },

  alexandre: {
    nodes: [
      { id: 'alexandre', label: 'Alexandre', type: 'given', gender: 'M', lang: 'French', popularity: 0.80, flags: ['FR', 'CA'], meta: { note: 'Classic French form of Alexander.' } },
      { id: 'alexander', label: 'Alexander', type: 'given', gender: 'M', lang: 'English', popularity: 0.95, flags: ['US', 'GB'] },
      { id: 'alex', label: 'Alex', type: 'given', gender: 'U', lang: 'English', popularity: 0.88, flags: ['US'] },
      { id: 'FR', label: 'France', type: 'flag', iso2: 'FR' },
      { id: 'CA', label: 'Canada', type: 'flag', iso2: 'CA' },
    ],
    edges: [
      { from: 'alexandre', to: 'alexander', type: 'transliteration', weight: 0.92 },
      { from: 'alexandre', to: 'alex', type: 'variant_of', weight: 0.85 },
      { from: 'alexandre', to: 'FR', type: 'popular_in', weight: 0.95 },
      { from: 'alexandre', to: 'CA', type: 'popular_in', weight: 0.90 },
    ],
  },

  alex: {
    nodes: [
      { id: 'alex', label: 'Alex', type: 'given', gender: 'U', lang: 'English', popularity: 0.88, flags: ['US', 'GB'], meta: { note: 'Popular unisex diminutive form.' } },
      { id: 'alexander', label: 'Alexander', type: 'given', gender: 'M', lang: 'English', popularity: 0.95, flags: ['US', 'GB'] },
      { id: 'alec', label: 'Alec', type: 'given', gender: 'M', lang: 'English', popularity: 0.45, flags: ['US'] },
      { id: 'sasha', label: 'Sasha', type: 'given', gender: 'U', lang: 'Slavic', popularity: 0.72, flags: ['UA'] },
      { id: 'alexander_surname', label: 'Alexander', type: 'surname', lang: 'English', popularity: 0.70 },
    ],
    edges: [
      { from: 'alex', to: 'alexander', type: 'variant_of', weight: 0.95 },
      { from: 'alex', to: 'alec', type: 'variant_of', weight: 0.88 },
      { from: 'alex', to: 'sasha', type: 'variant_of', weight: 0.82 },
      { from: 'alex', to: 'alexander_surname', type: 'related_name', weight: 0.75 },
    ],
  },

  sasha: {
    nodes: [
      { id: 'sasha', label: 'Sasha', type: 'given', gender: 'U', lang: 'Slavic', popularity: 0.72, flags: ['UA'], meta: { note: 'Russian and Ukrainian unisex diminutive of Alexander/Alexandra.' } },
      { id: 'alexander', label: 'Alexander', type: 'given', gender: 'M', lang: 'English', popularity: 0.95, flags: ['US', 'GB'] },
      { id: 'alex', label: 'Alex', type: 'given', gender: 'U', lang: 'English', popularity: 0.88, flags: ['US'] },
      { id: 'UA', label: 'Ukraine', type: 'flag', iso2: 'UA' },
    ],
    edges: [
      { from: 'sasha', to: 'alexander', type: 'variant_of', weight: 0.80 },
      { from: 'sasha', to: 'alex', type: 'variant_of', weight: 0.82 },
      { from: 'sasha', to: 'UA', type: 'popular_in', weight: 0.95 },
    ],
  },

  alexander_surname: {
    nodes: [
      { id: 'alexander_surname', label: 'Alexander', type: 'surname', lang: 'English', popularity: 0.70, flags: ['US', 'GB'], meta: { note: 'A patronymic surname derived from the given name.' } },
      { id: 'alexander', label: 'Alexander', type: 'given', gender: 'M', lang: 'English', popularity: 0.95, flags: ['US', 'GB'] },
      { id: 'alex', label: 'Alex', type: 'given', gender: 'U', lang: 'English', popularity: 0.88, flags: ['US'] },
    ],
    edges: [
      { from: 'alexander_surname', to: 'alexander', type: 'related_name', weight: 0.88 },
      { from: 'alexander_surname', to: 'alex', type: 'related_name', weight: 0.75 },
    ],
  }
};
