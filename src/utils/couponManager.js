/**
 * DEFINICIJE KUPONOV ZA SLOVENSKE TRGOVCE
 * - Spar: -25% na en izdelek po izbiri (Spar Joker kupon) ali paket/plato
 * - Lidl: Lidl Plus kuponi (npr. -20% na kategorijo testenine Combino, -20% sadje/zelenjava)
 * - Hofer: Hofer popust ob nakupu nad določen znesek ali na izbrani izdelek
 * - Mercator: Pika točke ali -25% kupon na izdelek
 */

export const AVAILABLE_COUPONS = [
  {
    id: 'spar-joker-25',
    store: 'Spar',
    title: 'Spar -25% Joker kupon',
    description: '-25% popust na en artikel po izbiri ali paket / plato',
    discountPercent: 25,
    type: 'single_item', // 'single_item' | 'category'
    targetCategory: null,
    badgeText: 'Spar Joker -25%',
    badgeColor: 'bg-red-600 text-white',
    icon: '🃏',
    validDays: 'Pon - Sob'
  },
  {
    id: 'lidl-plus-combino-20',
    store: 'Lidl',
    title: 'Lidl Plus -20% testenine Combino',
    description: '-20% na vse testenine in omake Combino',
    discountPercent: 20,
    type: 'category',
    targetCategory: 'shramba',
    targetKeyword: 'testenine',
    badgeText: 'Lidl Plus -20%',
    badgeColor: 'bg-blue-600 text-white',
    icon: '📱',
    validDays: 'Ta teden'
  },
  {
    id: 'lidl-plus-fruit-20',
    store: 'Lidl',
    title: 'Lidl Plus -20% Sadje & Zelenjava',
    description: '-20% na sveže sadje in zelenjavo ob nakupu',
    discountPercent: 20,
    type: 'category',
    targetCategory: 'sadje-zelenjava',
    targetKeyword: null,
    badgeText: 'Lidl Plus Sadje -20%',
    badgeColor: 'bg-blue-600 text-white',
    icon: '🍎',
    validDays: 'Pet - Sob'
  },
  {
    id: 'hofer-sadje-zelenjava-15',
    store: 'Hofer',
    title: 'Hofer Tržnica -15%',
    description: '-15% popust na sveže sadje in zelenjavo',
    discountPercent: 15,
    type: 'category',
    targetCategory: 'sadje-zelenjava',
    targetKeyword: null,
    badgeText: 'Hofer Tržnica -15%',
    badgeColor: 'bg-sky-600 text-white',
    icon: '🥦',
    validDays: 'Čet - Sob'
  },
  {
    id: 'mercator-torek-10',
    store: 'Mercator',
    title: 'Mercator -10% ob torkih',
    description: '-10% na celoten nakup nad 30 € s Pika kartico',
    discountPercent: 10,
    type: 'cart_wide',
    targetCategory: null,
    badgeText: 'Pika -10%',
    badgeColor: 'bg-red-700 text-white',
    icon: '💳',
    validDays: 'Torek'
  }
];

/**
 * Optimizator: poišče kateri artikel na seznamu prinese NAJVEČJI prihranek s kuponom
 * @param {Array} items - Seznam artiklov
 * @param {Object} coupon - Kupon (npr. Spar -25%)
 * @param {string} storeFilter - Izbrana trgovina
 */
export function findBestItemForCoupon(items, coupon, storeFilter = null) {
  if (!items || items.length === 0 || !coupon) return null;

  // Filtriraj artikle primerne za ta kupon
  const eligibleItems = items.filter(item => {
    if (item.completed) return false;

    // Če je kupon specifičen za trgovino in artikel že ima določeno drugo trgovino
    if (coupon.store && item.store && item.store.toLowerCase() !== coupon.store.toLowerCase()) {
      return false;
    }

    // Če je kupon za kategorijo
    if (coupon.type === 'category') {
      if (coupon.targetCategory && item.category !== coupon.targetCategory) return false;
      if (coupon.targetKeyword && !item.title.toLowerCase().includes(coupon.targetKeyword)) return false;
    }

    // Za Spar Joker kupon ne velja za artikle, ki so že v 50% akciji, ampak se najbolj splača za dražje redne artikle
    return true;
  });

  if (eligibleItems.length === 0) return null;

  // Izračunaj potencialni prihranek za vsak artikel
  let bestItem = null;
  let maxSavings = 0;

  for (const item of eligibleItems) {
    const price = Number(item.price) || estimateItemPrice(item);
    const savings = (price * (coupon.discountPercent / 100));

    if (savings > maxSavings) {
      maxSavings = savings;
      bestItem = {
        item,
        estimatedPrice: price,
        potentialSavings: Number(savings.toFixed(2)),
        discountedPrice: Number((price - savings).toFixed(2))
      };
    }
  }

  return bestItem;
}

/**
 * Ocena cene artikla, če še nima nastavljene točne cene
 */
export function estimateItemPrice(item) {
  if (typeof item.price === 'number' && item.price > 0) return item.price;
  
  const title = (item.title || '').toLowerCase();
  if (title.includes('pivo') && (title.includes('plato') || title.includes('24') || title.includes('paket'))) return 16.90;
  if (title.includes('pivo')) return 4.99;
  if (title.includes('kava') || title.includes('barcaffe')) return 3.49;
  if (title.includes('detergent') || title.includes('pralni') || title.includes('ariel')) return 11.90;
  if (title.includes('sir') || title.includes('gavda') || title.includes('parmezan')) return 4.20;
  if (title.includes('meso') || title.includes('file') || title.includes('biftek')) return 6.80;
  if (title.includes('maslo')) return 2.29;
  if (title.includes('mleko')) return 1.19;
  if (title.includes('testenine')) return 1.49;
  if (title.includes('olje')) return 2.19;

  return 2.50; // Privzeta ocena
}
