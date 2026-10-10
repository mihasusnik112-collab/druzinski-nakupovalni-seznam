/**
 * REGISTER TRGOVIN NA OBMOČJU SLOVENIJE
 * Vključuje živilske trgovce in drogerije z uradnimi logotipi in barvno shemo
 */

const getLogoPath = (filename) => {
  const base = import.meta.env?.BASE_URL || '/';
  const cleanBase = base.endsWith('/') ? base : `${base}/`;
  return `${cleanBase}logos/${filename}`;
};

export const STORES_LIST = [
  {
    id: 'spar',
    name: 'Spar / Interspar Slovenija',
    shortName: 'Spar',
    logo: getLogoPath('spar.svg'),
    fallbackEmoji: '🔴',
    color: '#e11d48',
    bgColor: 'bg-red-600',
    textColor: 'text-red-600',
    badgeColor: 'bg-red-50 text-red-700 border-red-200',
    types: ['grocery', 'general'],
    catalogUrl: 'https://www.letakonosa.si/spar/'
  },
  {
    id: 'lidl',
    name: 'Lidl Slovenija',
    shortName: 'Lidl',
    logo: getLogoPath('lidl.svg'),
    fallbackEmoji: '🔵',
    color: '#2563eb',
    bgColor: 'bg-blue-600',
    textColor: 'text-blue-600',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    types: ['grocery', 'general'],
    catalogUrl: 'https://www.letakonosa.si/lidl/'
  },
  {
    id: 'hofer',
    name: 'Hofer Slovenija',
    shortName: 'Hofer',
    logo: getLogoPath('hofer.svg'),
    fallbackEmoji: '🔷',
    color: '#0284c7',
    bgColor: 'bg-sky-700',
    textColor: 'text-sky-700',
    badgeColor: 'bg-sky-50 text-sky-800 border-sky-200',
    types: ['grocery', 'general'],
    catalogUrl: 'https://www.letakonosa.si/hofer/'
  },
  {
    id: 'mercator',
    name: 'Mercator Slovenija',
    shortName: 'Mercator',
    logo: getLogoPath('mercator.svg'),
    fallbackEmoji: '🔴',
    color: '#b91c1c',
    bgColor: 'bg-red-700',
    textColor: 'text-red-700',
    badgeColor: 'bg-rose-50 text-rose-800 border-rose-200',
    types: ['grocery', 'general'],
    catalogUrl: 'https://www.letakonosa.si/mercator/'
  },
  {
    id: 'tus',
    name: 'Tuš Hipermarket',
    shortName: 'Tuš',
    logo: getLogoPath('tus.svg'),
    fallbackEmoji: '🟢',
    color: '#16a34a',
    bgColor: 'bg-green-600',
    textColor: 'text-green-600',
    badgeColor: 'bg-green-50 text-green-800 border-green-200',
    types: ['grocery', 'general'],
    catalogUrl: 'https://www.letakonosa.si/tus/'
  },
  {
    id: 'eleclerc',
    name: 'E.Leclerc Ljubljana & Maribor',
    shortName: 'E.Leclerc',
    logo: getLogoPath('eleclerc.svg'),
    fallbackEmoji: '🔵',
    color: '#0284c7',
    bgColor: 'bg-blue-700',
    textColor: 'text-blue-700',
    badgeColor: 'bg-blue-50 text-blue-800 border-blue-200',
    types: ['grocery', 'general'],
    catalogUrl: 'https://www.letakonosa.si/e-leclerc/'
  },
  {
    id: 'eurospin',
    name: 'Eurospin Slovenija',
    shortName: 'Eurospin',
    logo: getLogoPath('eurospin.svg'),
    fallbackEmoji: '🟡',
    color: '#d97706',
    bgColor: 'bg-amber-500',
    textColor: 'text-amber-600',
    badgeColor: 'bg-amber-50 text-amber-900 border-amber-300',
    types: ['grocery', 'general'],
    catalogUrl: 'https://www.letakonosa.si/eurospin/'
  },
  {
    id: 'dm',
    name: 'dm drogerie markt Slovenija',
    shortName: 'dm',
    logo: getLogoPath('dm.svg'),
    fallbackEmoji: '🟡',
    color: '#7c3aed',
    bgColor: 'bg-purple-600',
    textColor: 'text-purple-600',
    badgeColor: 'bg-purple-50 text-purple-800 border-purple-200',
    types: ['drugstore', 'hygiene'],
    catalogUrl: 'https://www.dm.si/katalog'
  },
  {
    id: 'muller',
    name: 'Müller Drogerija',
    shortName: 'Müller',
    logo: getLogoPath('muller.svg'),
    fallbackEmoji: '🟠',
    color: '#ea580c',
    bgColor: 'bg-orange-600',
    textColor: 'text-orange-600',
    badgeColor: 'bg-orange-50 text-orange-800 border-orange-200',
    types: ['drugstore', 'hygiene'],
    catalogUrl: 'https://www.letakonosa.si/muller/'
  }
];

// Preslikava po kratkem imenu (Spar, Lidl, Tuš itd.)
export const STORE_INFO = STORES_LIST.reduce((acc, store) => {
  acc[store.shortName] = {
    ...store,
    logoUrl: store.logo
  };
  return acc;
}, {
  Splošno: {
    id: 'splosno',
    name: 'Splošna trgovina',
    shortName: 'Splošno',
    logo: null,
    fallbackEmoji: '🛍️',
    logoUrl: null,
    color: '#64748b',
    bgColor: 'bg-slate-700',
    textColor: 'text-slate-700',
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-300',
    types: ['general']
  }
});

/**
 * Pomožna funkcija za iskanje trgovine po imenu ali id-ju
 */
export function getStoreMeta(storeNameOrId) {
  if (!storeNameOrId) return STORE_INFO['Splošno'];
  
  const byShortName = STORE_INFO[storeNameOrId];
  if (byShortName) return byShortName;

  const found = STORES_LIST.find(
    s => s.id === storeNameOrId.toLowerCase() || 
         s.shortName.toLowerCase() === storeNameOrId.toLowerCase() ||
         s.name.toLowerCase().includes(storeNameOrId.toLowerCase())
  );

  return found || STORE_INFO['Splošno'];
}
