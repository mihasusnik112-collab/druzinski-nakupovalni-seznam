export const COMMON_ITEMS = [
  { title: 'Mleko', category: 'mlecno', unit: '1 l' },
  { title: 'Kruh', category: 'pekarna', unit: '1 kos' },
  { title: 'Jajca', category: 'mlecno', unit: '10 kos' },
  { title: 'Maslo', category: 'mlecno', unit: '250 g' },
  { title: 'Banane', category: 'sadje-zelenjava', unit: '1 kg' },
  { title: 'Jabolka', category: 'sadje-zelenjava', unit: '1 kg' },
  { title: 'Paradižnik', category: 'sadje-zelenjava', unit: '1 kg' },
  { title: 'Krompir', category: 'sadje-zelenjava', unit: '2.5 kg' },
  { title: 'Čebula', category: 'sadje-zelenjava', unit: '1 kg' },
  { title: 'Piščančji file', category: 'meso', unit: '500 g' },
  { title: 'Mleto meso', category: 'meso', unit: '500 g' },
  { title: 'Sir Trapist / Gavda', category: 'mlecno', unit: '300 g' },
  { title: 'Jogurt', category: 'mlecno', unit: '1 l' },
  { title: 'Kisla smetana', category: 'mlecno', unit: '180 g' },
  { title: 'Sladka smetana', category: 'mlecno', unit: '250 ml' },
  { title: 'Kava Barcaffe', category: 'shramba', unit: '200 g' },
  { title: 'Testenine Barilla', category: 'shramba', unit: '500 g' },
  { title: 'Riž', category: 'shramba', unit: '1 kg' },
  { title: 'Moka bela', category: 'shramba', unit: '1 kg' },
  { title: 'Sladkor', category: 'shramba', unit: '1 kg' },
  { title: 'Olje sončnično', category: 'shramba', unit: '1 l' },
  { title: 'Olivno olje', category: 'shramba', unit: '1 l' },
  { title: 'Pralni prašek / gel', category: 'cistila', unit: '1 kos' },
  { title: 'Mehčalec', category: 'cistila', unit: '1 kos' },
  { title: 'WC papir', category: 'cistila', unit: '1 zavoj' },
  { title: 'Zobna pasta', category: 'nega', unit: '1 kos' },
  { title: 'Šampon za lase', category: 'nega', unit: '1 kos' },
  { title: 'Mineralna voda Donat', category: 'pijace', unit: '1 l' },
  { title: 'Pivo', category: 'pijace', unit: '6 kos' },
  { title: 'Čokolada Milka', category: 'shramba', unit: '100 g' },
  { title: 'Kosmiči / Granola', category: 'shramba', unit: '500 g' },
  { title: 'Zamrznjena zelenjava', category: 'zamrznjeno', unit: '450 g' },
  { title: 'Sladoled', category: 'zamrznjeno', unit: '1 l' },
  { title: 'Ribe / Losos', category: 'meso', unit: '300 g' },
  { title: 'Kisle kumarice', category: 'shramba', unit: '1 kozarec' },
  { title: 'Papirnate brisače', category: 'cistila', unit: '1 zavoj' },
  { title: 'Tablete za pomivalni stroj', category: 'cistila', unit: '1 pak' }
];

export const DEFAULT_FAMILY_MEMBERS = [
  {
    id: 'user-1',
    name: 'Miha',
    avatar: '👨',
    color: '#10b981',
    role: 'admin',
    preference: 'best_value'
  },
  {
    id: 'user-2',
    name: 'Veronika',
    avatar: '👩',
    color: '#ec4899',
    role: 'member',
    preference: 'premium_local'
  },
  {
    id: 'user-3',
    name: 'Domen',
    avatar: '👦',
    color: '#3b82f6',
    role: 'member',
    preference: 'cheapest'
  },
  {
    id: 'user-4',
    name: 'Luka',
    avatar: '👦',
    color: '#f59e0b',
    role: 'member',
    preference: 'cheapest'
  },
  {
    id: 'user-5',
    name: 'Mark',
    avatar: '👶',
    color: '#8b5cf6',
    role: 'member',
    preference: 'premium_local'
  }
];

export const FAMILY_MEMBERS = DEFAULT_FAMILY_MEMBERS;

export const AVAILABLE_AVATARS = [
  '👩', '👨', '👦', '👧', '👵', '👴', '🧑', '👶',
  '🐱', '🐶', '🦊', '🐻', '🐼', '🦁', '🦄', '🐝',
  '👑', '⭐', '🛒', '🦸', '🧙', '🚀', '🥑', '🍕'
];

export const PREFERENCE_LABELS = {
  cheapest: {
    label: 'Najceneje (Diskont)',
    emoji: '🟢',
    badge: 'Diskont',
    color: 'emerald'
  },
  best_value: {
    label: 'Najboljša znamka (Best Value)',
    emoji: '🟡',
    badge: 'Znamka',
    color: 'amber'
  },
  premium_local: {
    label: 'Lokalno & Eko (Premium)',
    emoji: '🌿',
    badge: 'Lokalno/Eko',
    color: 'teal'
  }
};
