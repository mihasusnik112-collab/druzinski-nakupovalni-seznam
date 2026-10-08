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
 * Poišče vse akcije in najboljšo akcijo za dani artikel
 * @param {string} itemTitle - Naziv artikla (npr. "Maslo 250g" ali "Banane")
 * @param {Array} catalogDeals - Seznam akcij iz zbirke catalog_deals
 * @returns {{ bestDeal: object|null, matchingDeals: Array }}
 */
export function findBestDeal(itemTitle, catalogDeals = []) {
  if (!itemTitle || !catalogDeals || catalogDeals.length === 0) {
    return { bestDeal: null, matchingDeals: [] };
  }

  const cleanTitle = normalizeText(itemTitle);
  if (!cleanTitle) {
    return { bestDeal: null, matchingDeals: [] };
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
        matchScore: score
      });
    }
  }

  if (matched.length === 0) {
    return { bestDeal: null, matchingDeals: [] };
  }

  // Razvrsti po rezultatu ujemanja, nato po najvišjem popustu oz. najnižji ceni
  matched.sort((a, b) => {
    // Če je bistvena razlika v ujemanju, prednost bolj natančnemu
    if (Math.abs(a.matchScore - b.matchScore) >= 40) {
      return b.matchScore - a.matchScore;
    }
    // Sicer primerjaj ceno
    return (a.discountPrice || 0) - (b.discountPrice || 0);
  });

  return {
    bestDeal: matched[0],
    matchingDeals: matched
  };
}
