/**
 * Normalizira slovensko besedilo:
 * - pretvori v male črke
 * - odstrani šumnike (č, š, ž, ć, đ)
 * - odstrani številke, oklepaje in merske enote (kg, g, l, ml, kos, pak)
 * - odstrani odvečne presledke
 */
export function normalizeText(text) {
  if (!text) return '';
  
  let normalized = text.toLowerCase().trim();
  
  // Zamenjava slovenskih šumnikov
  const diacriticsMap = {
    'č': 'c',
    'š': 's',
    'ž': 'z',
    'ć': 'c',
    'đ': 'd',
    'ä': 'a',
    'ö': 'o',
    'ü': 'u'
  };

  normalized = normalized.replace(/[čšžćđäöü]/g, match => diacriticsMap[match] || match);
  
  // Odstrani enote in števila (npr. "250g", "1 kg", "2 kos", "1.5 l", "10/1")
  normalized = normalized.replace(/\b\d+(\s*[\.,]\s*\d+)?\s*(kg|g|dag|dkg|l|dl|ml|kos|kom|pak|komad|lit|liter|rol|zavoj|%)\b/gi, ' ');
  normalized = normalized.replace(/\b\d+\s*[\/\-xX]\s*\d+\b/g, ' '); // 10/1 ali 2x500
  normalized = normalized.replace(/\d+/g, ' '); // ostala števila
  
  // Odstrani ločila
  normalized = normalized.replace(/[.,\/#!$%\^&\*;:{}=\-_`~()?"'+]/g, ' ');
  
  // Počisti večkratne presledke
  return normalized.replace(/\s+/g, ' ').trim();
}

/**
 * Pomožna funkcija za izračun in formatiranje cene na enoto, če ta manjka
 */
export function getFormattedUnitPrice(deal) {
  if (deal.unitPriceFormatted) return deal.unitPriceFormatted;
  if (!deal.discountPrice) return '';

  const unit = (deal.unit || '').toLowerCase();
  
  // Preveri kilograme
  if (unit.includes('kg')) {
    const num = parseFloat(unit) || 1;
    return `${(deal.discountPrice / num).toFixed(2).replace('.', ',')} € / kg`;
  }
  // Preveri grame
  if (unit.includes('g') && !unit.includes('kg')) {
    const grams = parseFloat(unit) || 100;
    const perKg = (deal.discountPrice / (grams / 1000));
    return `${perKg.toFixed(2).replace('.', ',')} € / kg`;
  }
  // Preveri litre
  if (unit.includes('l') || unit.includes('liter')) {
    const num = parseFloat(unit) || 1;
    return `${(deal.discountPrice / num).toFixed(2).replace('.', ',')} € / l`;
  }
  // Preveri pranja
  if (unit.includes('pranj')) {
    const num = parseFloat(unit) || 1;
    return `${(deal.discountPrice / num).toFixed(2).replace('.', ',')} € / pranje`;
  }
  // Kos
  return `${deal.discountPrice.toFixed(2).replace('.', ',')} € / kos`;
}

/**
 * Poišče vse akcije, najboljšo akcijo ter razvrsti ugodnosti po 3 kakovostnih razredih:
 * - budget (Diskont / lastna znamka)
 * - brand (Priznana blagovna znamka / Best Value)
 * - premium_local (Bio / Lokalno / Eko / Certificirano)
 * 
 * @param {string} itemTitle - Naziv artikla (npr. "Maslo 250g" ali "Mleko")
 * @param {Array} catalogDeals - Seznam akcij iz zbirke catalog_deals
 * @param {string} userPreference - Privzeta preferenca uporabnika ("cheapest" | "best_value" | "premium_local")
 * @returns {{ bestDeal: object|null, matchingDeals: Array, tieredDeals: { budget: object|null, brand: object|null, premium_local: object|null } }}
 */
export function findBestDeal(itemTitle, catalogDeals = [], userPreference = 'best_value') {
  if (!itemTitle || !catalogDeals || catalogDeals.length === 0) {
    return {
      bestDeal: null,
      matchingDeals: [],
      tieredDeals: { budget: null, brand: null, premium_local: null }
    };
  }

  const cleanTitle = normalizeText(itemTitle);
  if (!cleanTitle) {
    return {
      bestDeal: null,
      matchingDeals: [],
      tieredDeals: { budget: null, brand: null, premium_local: null }
    };
  }

  const titleWords = cleanTitle.split(' ').filter(w => w.length >= 3);
  const matched = [];

  for (const deal of catalogDeals) {
    const cleanKeyword = normalizeText(deal.normalizedKeyword || '');
    const cleanProductName = normalizeText(deal.productName || '');

    let score = 0;

    // 1. Točno ujemanje normalizirane ključne besede
    if (cleanKeyword && (cleanTitle === cleanKeyword || cleanTitle.includes(cleanKeyword) || cleanKeyword.includes(cleanTitle))) {
      score += 100;
    }

    // 2. Ujemanje znotraj imena izdelka
    if (cleanProductName.includes(cleanTitle) || cleanTitle.includes(cleanProductName)) {
      score += 80;
    }

    // 3. Delno ujemanje besed (npr. "mleko" v "alpsko mleko")
    for (const word of titleWords) {
      if (cleanKeyword.includes(word)) {
        score += 30;
      }
      if (cleanProductName.includes(word)) {
        score += 20;
      }
    }

    if (score >= 30) {
      matched.push({
        ...deal,
        unitPriceFormatted: getFormattedUnitPrice(deal),
        matchScore: score
      });
    }
  }

  if (matched.length === 0) {
    return {
      bestDeal: null,
      matchingDeals: [],
      tieredDeals: { budget: null, brand: null, premium_local: null }
    };
  }

  // Razvrsti po rezultatu ujemanja, nato po najvišjem popustu oz. najnižji ceni
  matched.sort((a, b) => {
    if (Math.abs(a.matchScore - b.matchScore) >= 40) {
      return b.matchScore - a.matchScore;
    }
    return (a.discountPrice || 0) - (b.discountPrice || 0);
  });

  // Razvrsti v 3 kakovostne razrede
  const tieredDeals = {
    budget: null,
    brand: null,
    premium_local: null
  };

  for (const deal of matched) {
    const tier = deal.tier || 'budget';
    if (tier === 'budget' && !tieredDeals.budget) {
      tieredDeals.budget = deal;
    } else if (tier === 'brand' && !tieredDeals.brand) {
      tieredDeals.brand = deal;
    } else if (tier === 'premium_local' && !tieredDeals.premium_local) {
      tieredDeals.premium_local = deal;
    }
  }

  // Izbira najboljše ponudbe glede na preferenco uporabnika
  let bestDeal = matched[0];
  if (userPreference === 'cheapest' && tieredDeals.budget) {
    bestDeal = tieredDeals.budget;
  } else if (userPreference === 'best_value' && tieredDeals.brand) {
    bestDeal = tieredDeals.brand;
  } else if (userPreference === 'premium_local' && tieredDeals.premium_local) {
    bestDeal = tieredDeals.premium_local;
  }

  return {
    bestDeal,
    matchingDeals: matched,
    tieredDeals
  };
}
