import { normalizeText } from './fuzzyMatch';

/**
 * Standardna trgovska baza osnovnih živil in blagovnih znamk v slovenskih trgovinah
 * (Dopolnjuje tedenske akcije iz katalogov)
 */
export const STANDARD_STORE_ITEMS = [
  // --- PIVO ---
  {
    id: 'std-spar-lasko',
    store: 'Spar',
    productName: 'Laško Zlatorog svetlo pivo 0,5 l',
    brandName: 'Laško Zlatorog',
    normalizedKeyword: 'pivo',
    category: 'pijace',
    discountPrice: 1.09,
    regularPrice: 1.45,
    discountPercentage: '-25%',
    unit: '0,5 l',
    unitPriceFormatted: '2,18 € / l',
    tier: 'brand',
    tierBadge: 'Znamka v akciji',
    origin: 'SLO (Laško)'
  },
  {
    id: 'std-mercator-union',
    store: 'Mercator',
    productName: 'Union svetlo pivo 0,5 l pločevinka',
    brandName: 'Pivovarna Union',
    normalizedKeyword: 'pivo',
    category: 'pijace',
    discountPrice: 1.09,
    regularPrice: 1.45,
    discountPercentage: '-25%',
    unit: '0,5 l',
    unitPriceFormatted: '2,18 € / l',
    tier: 'brand',
    tierBadge: 'Slovenska znamka',
    origin: 'SLO (Ljubljana)'
  },
  {
    id: 'std-lidl-argus',
    store: 'Lidl',
    productName: 'Argus svetlo pivo 0,5 l',
    brandName: 'Argus',
    normalizedKeyword: 'pivo',
    category: 'pijace',
    discountPrice: 0.69,
    regularPrice: 0.89,
    discountPercentage: '-22%',
    unit: '0,5 l',
    unitPriceFormatted: '1,38 € / l',
    tier: 'budget',
    tierBadge: 'Diskont',
    origin: 'EU'
  },
  {
    id: 'std-hofer-bevog',
    store: 'Hofer',
    productName: 'Bevog Deetz Craft pivo 0,33 l',
    brandName: 'Bevog Craft',
    normalizedKeyword: 'pivo',
    category: 'pijace',
    discountPrice: 1.79,
    regularPrice: 2.19,
    discountPercentage: '-18%',
    unit: '0,33 l',
    unitPriceFormatted: '5,42 € / l',
    tier: 'premium_local',
    tierBadge: 'Lokalni craft SLO',
    origin: 'SLO'
  },
  {
    id: 'std-eurospin-bestbrau',
    store: 'Eurospin',
    productName: 'Best Bräu svetlo pivo 0,5 l',
    brandName: 'Best Bräu',
    normalizedKeyword: 'pivo',
    category: 'pijace',
    discountPrice: 0.65,
    regularPrice: 0.85,
    discountPercentage: '-23%',
    unit: '0,5 l',
    unitPriceFormatted: '1,30 € / l',
    tier: 'budget',
    tierBadge: 'Diskont',
    origin: 'EU'
  },
  {
    id: 'std-tus-lasko',
    store: 'Tuš',
    productName: 'Laško Zlatorog svetlo pivo 0,5 l',
    brandName: 'Laško Zlatorog',
    normalizedKeyword: 'pivo',
    category: 'pijace',
    discountPrice: 1.09,
    regularPrice: 1.45,
    discountPercentage: '-25%',
    unit: '0,5 l',
    unitPriceFormatted: '2,18 € / l',
    tier: 'brand',
    tierBadge: 'Tuš Klub akcija',
    origin: 'SLO'
  },

  // --- MLEKO ---
  {
    id: 'std-lidl-pilos-mleko',
    store: 'Lidl',
    productName: 'Pilos Sveže mleko 3,5% m.m. 1 l',
    brandName: 'Pilos',
    normalizedKeyword: 'mleko',
    category: 'mlecno',
    discountPrice: 0.79,
    regularPrice: 1.09,
    discountPercentage: '-27%',
    unit: '1 l',
    unitPriceFormatted: '0,79 € / l',
    tier: 'budget',
    tierBadge: 'Diskont',
    origin: 'EU'
  },
  {
    id: 'std-spar-alpsko',
    store: 'Spar',
    productName: 'Alpsko mleko Ljubljanske mlekarne 3,5% 1 l',
    brandName: 'Ljubljanske mlekarne',
    normalizedKeyword: 'mleko',
    category: 'mlecno',
    discountPrice: 1.09,
    regularPrice: 1.59,
    discountPercentage: '-31%',
    unit: '1 l',
    unitPriceFormatted: '1,09 € / l',
    tier: 'brand',
    tierBadge: 'Znamka v akciji',
    origin: 'SLO'
  },
  {
    id: 'std-hofer-bio-mleko',
    store: 'Hofer',
    productName: 'Bio Natura Slovensko EKO mleko 1 l',
    brandName: 'Bio Natura',
    normalizedKeyword: 'mleko',
    category: 'mlecno',
    discountPrice: 1.25,
    regularPrice: 1.49,
    discountPercentage: '-16%',
    unit: '1 l',
    unitPriceFormatted: '1,25 € / l',
    tier: 'premium_local',
    tierBadge: 'EKO Slovenija',
    origin: 'SLO (EKO)'
  },
  {
    id: 'std-mercator-mu-mleko',
    store: 'Mercator',
    productName: 'Mu Mleko 3.5% Ljubljanske mlekarne 1 l',
    brandName: 'Mu',
    normalizedKeyword: 'mleko',
    category: 'mlecno',
    discountPrice: 1.15,
    regularPrice: 1.59,
    discountPercentage: '-27%',
    unit: '1 l',
    unitPriceFormatted: '1,15 € / l',
    tier: 'brand',
    tierBadge: 'Pika prihranek',
    origin: 'SLO'
  },
  {
    id: 'std-tus-slovensko-mleko',
    store: 'Tuš',
    productName: 'Slovensko mleko Tuš 3,5% m.m. 1 l',
    brandName: 'Tuš Slovenski izdelek',
    normalizedKeyword: 'mleko',
    category: 'mlecno',
    discountPrice: 0.99,
    regularPrice: 1.29,
    discountPercentage: '-23%',
    unit: '1 l',
    unitPriceFormatted: '0,99 € / l',
    tier: 'brand',
    tierBadge: 'Izbrana kakovost SI',
    origin: 'SLO'
  },
  {
    id: 'std-eleclerc-mleko',
    store: 'E.Leclerc',
    productName: 'Marque Repère Trajno polnomastno mleko 1 l',
    brandName: 'Marque Repère',
    normalizedKeyword: 'mleko',
    category: 'mlecno',
    discountPrice: 0.89,
    regularPrice: 1.15,
    discountPercentage: '-22%',
    unit: '1 l',
    unitPriceFormatted: '0,89 € / l',
    tier: 'budget',
    tierBadge: 'Leclerc cena',
    origin: 'Francija / EU'
  },
  {
    id: 'std-eurospin-land-mleko',
    store: 'Eurospin',
    productName: 'Land Trajno mleko 3.5% 1 l',
    brandName: 'Land',
    normalizedKeyword: 'mleko',
    category: 'mlecno',
    discountPrice: 0.79,
    regularPrice: 0.99,
    discountPercentage: '-20%',
    unit: '1 l',
    unitPriceFormatted: '0,79 € / l',
    tier: 'budget',
    tierBadge: 'Pametni nakup',
    origin: 'EU'
  },

  // --- BANANE ---
  {
    id: 'std-mercator-banane',
    store: 'Mercator',
    productName: 'Banane poreklo Ekvador 1 kg',
    brandName: 'Tržnica Mercator',
    normalizedKeyword: 'banane',
    category: 'sadje-zelenjava',
    discountPrice: 0.99,
    regularPrice: 1.49,
    discountPercentage: '-33%',
    unit: '1 kg',
    unitPriceFormatted: '0,99 € / kg',
    tier: 'budget',
    tierBadge: 'Akcija -33%',
    origin: 'Ekvador'
  },
  {
    id: 'std-spar-bio-banane',
    store: 'Spar',
    productName: 'SPAR Natur*pur BIO Banane Fairtrade 1 kg',
    brandName: 'SPAR Natur*pur BIO',
    normalizedKeyword: 'banane',
    category: 'sadje-zelenjava',
    discountPrice: 1.49,
    regularPrice: 1.99,
    discountPercentage: '-25%',
    unit: '1 kg',
    unitPriceFormatted: '1,49 € / kg',
    tier: 'premium_local',
    tierBadge: 'Eko Fairtrade',
    origin: 'BIO'
  },
  {
    id: 'std-lidl-banane',
    store: 'Lidl',
    productName: 'Sveže banane premium kakovost 1 kg',
    brandName: 'Lidl Tržnica',
    normalizedKeyword: 'banane',
    category: 'sadje-zelenjava',
    discountPrice: 1.09,
    regularPrice: 1.39,
    discountPercentage: '-21%',
    unit: '1 kg',
    unitPriceFormatted: '1,09 € / kg',
    tier: 'budget',
    tierBadge: 'Diskont',
    origin: 'Uvoz'
  },

  // --- MASLO ---
  {
    id: 'std-lidl-pilos-maslo',
    store: 'Lidl',
    productName: 'Pilos Maslo I. vrsta 250 g',
    brandName: 'Pilos',
    normalizedKeyword: 'maslo',
    category: 'mlecno',
    discountPrice: 1.59,
    regularPrice: 2.19,
    discountPercentage: '-27%',
    unit: '250 g',
    unitPriceFormatted: '6,36 € / kg',
    tier: 'budget',
    tierBadge: 'Diskont',
    origin: 'EU'
  },
  {
    id: 'std-spar-pomursko-maslo',
    store: 'Spar',
    productName: 'Pomursko maslo Pomurske mlekarne 250 g',
    brandName: 'Pomurske mlekarne',
    normalizedKeyword: 'maslo',
    category: 'mlecno',
    discountPrice: 2.19,
    regularPrice: 2.99,
    discountPercentage: '-26%',
    unit: '250 g',
    unitPriceFormatted: '8,76 € / kg',
    tier: 'brand',
    tierBadge: 'Slovenska tradicija',
    origin: 'SLO'
  },

  // --- KRUH ---
  {
    id: 'std-mercator-jelen',
    store: 'Mercator',
    productName: 'Kruh Jelen Žito hlebček 1 kg',
    brandName: 'Žito Jelen',
    normalizedKeyword: 'kruh',
    category: 'pekarna',
    discountPrice: 1.99,
    regularPrice: 2.79,
    discountPercentage: '-28%',
    unit: '1 kg',
    unitPriceFormatted: '1,99 € / kg',
    tier: 'brand',
    tierBadge: 'Priljubljeno',
    origin: 'SLO'
  },
  {
    id: 'std-hofer-beli-kruh',
    store: 'Hofer',
    productName: 'Beli hlebec sveže pečen 1 kg',
    brandName: 'Hofer pekarna',
    normalizedKeyword: 'kruh',
    category: 'pekarna',
    discountPrice: 1.19,
    regularPrice: 1.59,
    discountPercentage: '-25%',
    unit: '1 kg',
    unitPriceFormatted: '1,19 € / kg',
    tier: 'budget',
    tierBadge: 'Diskont',
    origin: 'SLO'
  },

  // --- KAVA ---
  {
    id: 'std-spar-barcaffe',
    store: 'Spar',
    productName: 'Barcaffè Classic mleta kava 250 g',
    brandName: 'Barcaffè',
    normalizedKeyword: 'kava',
    category: 'shramba',
    discountPrice: 2.79,
    regularPrice: 3.89,
    discountPercentage: '-28%',
    unit: '250 g',
    unitPriceFormatted: '11,16 € / kg',
    tier: 'brand',
    tierBadge: 'Najboljša znamka',
    origin: 'SLO'
  },
  {
    id: 'std-dm-dmbio-kava',
    store: 'dm',
    productName: 'dmBio kava v zrnju Fairtrade 250 g',
    brandName: 'dmBio',
    normalizedKeyword: 'kava',
    category: 'shramba',
    discountPrice: 3.49,
    regularPrice: 4.29,
    discountPercentage: '-18%',
    unit: '250 g',
    unitPriceFormatted: '13,96 € / kg',
    tier: 'premium_local',
    tierBadge: 'BIO / Fairtrade',
    origin: 'BIO'
  },

  // --- PRALNI PRAŠEK ---
  {
    id: 'std-dm-ariel',
    store: 'dm',
    productName: 'Ariel prašek ali gel Color 60 pranj',
    brandName: 'Ariel',
    normalizedKeyword: 'pralni prasek',
    category: 'cistila',
    discountPrice: 13.99,
    regularPrice: 19.99,
    discountPercentage: '-30%',
    unit: '60 pranj',
    unitPriceFormatted: '0,23 € / pranje',
    tier: 'brand',
    tierBadge: 'Best Value',
    origin: 'Original'
  },
  {
    id: 'std-lidl-formil',
    store: 'Lidl',
    productName: 'Formil tekoči detergent za perilo 40 pranj',
    brandName: 'Formil',
    normalizedKeyword: 'pralni prasek',
    category: 'cistila',
    discountPrice: 4.49,
    regularPrice: 5.99,
    discountPercentage: '-25%',
    unit: '40 pranj',
    unitPriceFormatted: '0,11 € / pranje',
    tier: 'budget',
    tierBadge: 'Diskont',
    origin: 'EU'
  }
];

/**
 * Pametno iskanje znamk in cen razdeljenih po trgovinah
 * @param {string} rawQuery - Vneseno iskalno besedilo (npr. "pivo", "mleko", "maslo")
 * @param {Array} catalogDeals - Seznam trenutno aktivnih ponudb iz katalogov
 * @returns {Object} { totalCount, byStore: { Spar: [...], Lidl: [...] } }
 */
export function searchStoreBrands(rawQuery, catalogDeals = []) {
  if (!rawQuery || rawQuery.trim().length < 2) {
    return { totalCount: 0, byStore: {} };
  }

  const queryNorm = normalizeText(rawQuery);
  const queryWords = queryNorm.split(' ').filter(Boolean);

  // Združi kataloge in standardne artikle
  const allPool = [...(catalogDeals || []), ...STANDARD_STORE_ITEMS];
  const seenIds = new Set();
  const matched = [];

  for (const item of allPool) {
    if (seenIds.has(item.id)) continue;

    const prodNorm = normalizeText(item.productName || item.title || '');
    const kwNorm = normalizeText(item.normalizedKeyword || '');
    const brandNorm = normalizeText(item.brandName || item.brand || '');
    const catNorm = normalizeText(item.category || '');

    // Preveri ujemanje
    const matchesAllWords = queryWords.every(word => 
      kwNorm.includes(word) ||
      prodNorm.includes(word) || 
      brandNorm.includes(word) || 
      catNorm.includes(word)
    );

    if (matchesAllWords) {
      seenIds.add(item.id);
      
      let tierBadge = item.tierBadge;
      if (!tierBadge) {
        if (item.tier === 'budget') tierBadge = 'Diskont';
        else if (item.tier === 'brand') tierBadge = item.discountPercentage ? `Akcija ${item.discountPercentage}` : 'Priznana znamka';
        else if (item.tier === 'premium_local') tierBadge = 'Lokalno / Eko';
        else tierBadge = 'Ponudba';
      }

      matched.push({
        ...item,
        tierBadge
      });
    }
  }

  // Razvrsti po trgovinah
  const byStore = {};
  for (const item of matched) {
    const store = item.store || 'Ostalo';
    if (!byStore[store]) {
      byStore[store] = [];
    }
    byStore[store].push(item);
  }

  return {
    totalCount: matched.length,
    byStore
  };
}
