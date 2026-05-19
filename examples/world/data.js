// examples/world/data.js
export const WORLD_DATA = {
  mary: {
    nodes: [
      { id: 'mary',   label: 'Mary',      type: 'text', lang: 'English' },
      { id: 'GB',     label: 'UK',        type: 'flag', iso2: 'GB',
        imageUrl: 'https://flagcdn.com/w40/gb.png' },
      { id: 'US',     label: 'USA',       type: 'flag', iso2: 'US',
        imageUrl: 'https://flagcdn.com/w40/us.png' },
      { id: 'AU',     label: 'Australia', type: 'flag', iso2: 'AU',
        imageUrl: 'https://flagcdn.com/w40/au.png' },
      { id: 'IE',     label: 'Ireland',   type: 'flag', iso2: 'IE',
        imageUrl: 'https://flagcdn.com/w40/ie.png' },
      { id: 'marie',  label: 'Marie',     type: 'text', lang: 'French'  },
      { id: 'FR',     label: 'France',    type: 'flag', iso2: 'FR',
        imageUrl: 'https://flagcdn.com/w40/fr.png' },
      { id: 'maria',  label: 'María',     type: 'text', lang: 'Spanish' },
      { id: 'ES',     label: 'Spain',     type: 'flag', iso2: 'ES',
        imageUrl: 'https://flagcdn.com/w40/es.png' },
    ],
    edges: [
      { from: 'mary',  to: 'GB',    type: 'popular_in', weight: 0.95 },
      { from: 'mary',  to: 'US',    type: 'popular_in', weight: 0.90 },
      { from: 'mary',  to: 'AU',    type: 'popular_in', weight: 0.80 },
      { from: 'mary',  to: 'IE',    type: 'popular_in', weight: 0.85 },
      { from: 'mary',  to: 'marie', type: 'variant_of', weight: 0.90 },
      { from: 'marie', to: 'FR',    type: 'popular_in', weight: 0.95 },
      { from: 'mary',  to: 'maria', type: 'variant_of', weight: 0.85 },
      { from: 'maria', to: 'ES',    type: 'popular_in', weight: 0.90 },
    ],
  },
};
