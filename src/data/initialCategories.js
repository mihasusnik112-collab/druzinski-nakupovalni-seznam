export const INITIAL_CATEGORIES = [
  {
    id: 'sadje-zelenjava',
    name: 'Sadje & Zelenjava',
    icon: 'Apple',
    emoji: '🍎',
    color: 'bg-emerald-100 text-emerald-800 border-emerald-300',
    badgeColor: 'bg-emerald-500',
    order: 1
  },
  {
    id: 'mlecno',
    name: 'Mlečni izdelki & Jajca',
    icon: 'Milk',
    emoji: '🧀',
    color: 'bg-blue-100 text-blue-800 border-blue-300',
    badgeColor: 'bg-blue-500',
    order: 2
  },
  {
    id: 'meso',
    name: 'Meso & Ribe',
    icon: 'Beef',
    emoji: '🥩',
    color: 'bg-rose-100 text-rose-800 border-rose-300',
    badgeColor: 'bg-rose-500',
    order: 3
  },
  {
    id: 'pekarna',
    name: 'Pekarna & Kruh',
    icon: 'Croissant',
    emoji: '🥖',
    color: 'bg-amber-100 text-amber-800 border-amber-300',
    badgeColor: 'bg-amber-500',
    order: 4
  },
  {
    id: 'shramba',
    name: 'Shramba & Testenine',
    icon: 'Package',
    emoji: '🍝',
    color: 'bg-orange-100 text-orange-800 border-orange-300',
    badgeColor: 'bg-orange-500',
    order: 5
  },
  {
    id: 'zamrznjeno',
    name: 'Zamrznjeno',
    icon: 'Snowflake',
    emoji: '🧊',
    color: 'bg-cyan-100 text-cyan-800 border-cyan-300',
    badgeColor: 'bg-cyan-500',
    order: 6
  },
  {
    id: 'pijace',
    name: 'Pijače',
    icon: 'CupSoda',
    emoji: '🧃',
    color: 'bg-indigo-100 text-indigo-800 border-indigo-300',
    badgeColor: 'bg-indigo-500',
    order: 7
  },
  {
    id: 'cistila',
    name: 'Čistila & Dom',
    icon: 'Sparkles',
    emoji: '🧼',
    color: 'bg-teal-100 text-teal-800 border-teal-300',
    badgeColor: 'bg-teal-500',
    order: 8
  },
  {
    id: 'nega',
    name: 'Osebna nega & Lekarna',
    icon: 'Heart',
    emoji: '🧴',
    color: 'bg-purple-100 text-purple-800 border-purple-300',
    badgeColor: 'bg-purple-500',
    order: 9
  },
  {
    id: 'ostalo',
    name: 'Ostalo',
    icon: 'MoreHorizontal',
    emoji: '🛒',
    color: 'bg-slate-100 text-slate-800 border-slate-300',
    badgeColor: 'bg-slate-500',
    order: 10
  }
];

// Re-export centralnega registra trgovin
export { STORE_INFO, STORES_LIST, getStoreMeta } from './stores';
