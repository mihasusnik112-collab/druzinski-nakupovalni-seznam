export const CUISINES_OPTIONS = [
  { id: 'slovenska', label: 'Slovenska domača', emoji: '🇸🇮', desc: 'Goveja juha, pražen krompir, pečenke, enolončnice' },
  { id: 'azijska', label: 'Azijska', emoji: '🥢', desc: 'Wok, rezanci, basmati riž, curry, sojina omaka' },
  { id: 'italijanska', label: 'Italijanska', emoji: '🍝', desc: 'Testenine, pice, rižote, mocarela, paradižnik' },
  { id: 'indijska', label: 'Indijska', emoji: '🍛', desc: 'Curry, basmati riž, leča, naan, aromatične začimbe' },
  { id: 'ameriska', label: 'Ameriška / BBQ', emoji: '🍔', desc: 'Burgerji, steak, BBQ rebrca, pečen krompirček' },
  { id: 'mehiska', label: 'Mehiška', emoji: '🌮', desc: 'Tortilje, tacos, fižol, salsa, koruza, avokado' }
];

export function getAgeGroup(birthYear) {
  if (!birthYear) return { group: 'odrasli', label: 'Odrasli', icon: '🧑' };
  const currentYear = new Date().getFullYear();
  const age = currentYear - parseInt(birthYear);
  if (age < 13) return { group: 'otroci', label: `Otrok (${age} let)`, icon: '👶', age };
  if (age <= 18) return { group: 'mladostniki', label: `Mladostnik (${age} let)`, icon: '👦', age };
  return { group: 'odrasli', label: `Odrasli (${age} let)`, icon: '🧑', age };
}

export const DIETARY_OPTIONS = [
  { id: 'brez_glutena', label: 'Brez glutena', emoji: '🌾' },
  { id: 'brez_laktoze', label: 'Brez laktoze', emoji: '🥛' },
  { id: 'vegetarijansko', label: 'Vegetarijansko', emoji: '🥗' },
  { id: 'vegansko', label: 'Vegansko', emoji: '🌱' },
  { id: 'manj_sladkorja', label: 'Manj sladkorja', emoji: '🚫🍬' },
  { id: 'bio_eko', label: 'Bio / Eko izdelki', emoji: '🌿' },
  { id: 'lokalno_slo', label: 'Slovensko / Domače poreklo', emoji: '🇸🇮' }
];

export const STAPLE_CANDIDATES = [
  { title: 'Mleko', category: 'mlecno', unit: '1 l', emoji: '🥛' },
  { title: 'Kruh', category: 'pekarna', unit: '1 kos', emoji: '🥖' },
  { title: 'Jajca', category: 'mlecno', unit: '10 kos', emoji: '🥚' },
  { title: 'Maslo', category: 'mlecno', unit: '250 g', emoji: '🧈' },
  { title: 'Banane', category: 'sadje-zelenjava', unit: '1 kg', emoji: '🍌' },
  { title: 'Jabolka', category: 'sadje-zelenjava', unit: '1 kg', emoji: '🍎' },
  { title: 'Kava Barcaffè', category: 'shramba', unit: '200 g', emoji: '☕' },
  { title: 'Testenine Barilla', category: 'shramba', unit: '500 g', emoji: '🍝' },
  { title: 'Riž', category: 'shramba', unit: '1 kg', emoji: '🍚' },
  { title: 'Sir Gavda', category: 'mlecno', unit: '300 g', emoji: '🧀' },
  { title: 'Piščančji file', category: 'meso', unit: '500 g', emoji: '🍗' },
  { title: 'Krompir', category: 'sadje-zelenjava', unit: '2.5 kg', emoji: '🥔' },
  { title: 'Paradižnik', category: 'sadje-zelenjava', unit: '1 kg', emoji: '🍅' },
  { title: 'Čebula', category: 'sadje-zelenjava', unit: '1 kg', emoji: '🧅' },
  { title: 'Jogurt', category: 'mlecno', unit: '1 l', emoji: '🥣' },
  { title: 'Olivno olje', category: 'shramba', unit: '1 l', emoji: '🫒' },
  { title: 'WC papir', category: 'cistila', unit: '1 zavoj', emoji: '🧻' },
  { title: 'Pivo Laško', category: 'pijace', unit: '6 kos', emoji: '🍺' }
];

export const DEFAULT_FAMILIES = [
  {
    familyId: 'Susnik-4102',
    familyName: 'Družina Sušnik',
    joinCode: '4102',
    members: [
      { id: 'user-1', name: 'Miha', birthYear: 1988, avatar: '👨', role: 'admin', color: '#10b981', preference: 'best_value' },
      { id: 'user-2', name: 'Veronika', birthYear: 1990, avatar: '👩', role: 'member', color: '#ec4899', preference: 'premium_local' },
      { id: 'user-3', name: 'Domen', birthYear: 2015, avatar: '👦', role: 'member', color: '#3b82f6', preference: 'cheapest' },
      { id: 'user-4', name: 'Luka', birthYear: 2018, avatar: '👦', role: 'member', color: '#f59e0b', preference: 'cheapest' },
      { id: 'user-5', name: 'Mark', birthYear: 2023, avatar: '👶', role: 'member', color: '#8b5cf6', preference: 'premium_local' }
    ],
    preferences: {
      favoriteStores: ['spar', 'lidl', 'hofer', 'mercator'],
      cuisines: ['slovenska', 'italijanska', 'mediteranska'],
      dietaryFlags: ['lokalno_slo', 'manj_sladkorja'],
      stapleItems: ['Mleko', 'Kruh', 'Jajca', 'Maslo', 'Banane', 'Kava Barcaffè', 'Testenine Barilla']
    },
    onboardingCompleted: true,
    createdAt: 1728500000000
  },
  {
    familyId: 'Novak-7319',
    familyName: 'Družina Novak',
    joinCode: '7319',
    members: [
      { id: 'user-n1', name: 'Janez', birthYear: 1984, avatar: '👨', role: 'admin', color: '#3b82f6', preference: 'cheapest' },
      { id: 'user-n2', name: 'Maja', birthYear: 1986, avatar: '👩', role: 'member', color: '#ec4899', preference: 'premium_local' },
      { id: 'user-n3', name: 'Eva', birthYear: 2016, avatar: '👧', role: 'member', color: '#10b981', preference: 'best_value' }
    ],
    preferences: {
      favoriteStores: ['hofer', 'tus', 'eurospin', 'lidl'],
      cuisines: ['slovenska', 'azijska', 'hitro_enostavno'],
      dietaryFlags: ['brez_glutena', 'vegetarijansko'],
      stapleItems: ['Riž', 'Krompir', 'Jajca', 'Banane', 'Čebula']
    },
    onboardingCompleted: true,
    createdAt: 1728500000000
  }
];

export function generateFamilyId(name = 'Druzina') {
  const cleanName = name.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8) || 'Druzina';
  const code = Math.floor(1000 + Math.random() * 9000).toString();
  return {
    familyId: `${cleanName}-${code}`,
    joinCode: code
  };
}
