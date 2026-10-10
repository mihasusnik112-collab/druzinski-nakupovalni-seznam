import { normalizeText, getFormattedUnitPrice } from './fuzzyMatch';

/**
 * KATALOG LASTNIH BLAGOVNIH ZNAMK TRGOVCEV V SLOVENIJI
 * Povezava med trgovci in njihovimi lastnimi/diskontnimi znamkami
 */
export const STORE_OWN_BRANDS_CATALOG = {
  spar: {
    storeName: 'Spar',
    brands: [
      { name: 'S-Budget', desc: 'Diskontna lastna znamka osnovnih živil', tier: 'budget', badge: 'Diskont' },
      { name: 'Pittinger', desc: 'Diskontno pivo in radlerji (lastna znamka Spar)', tier: 'budget', badge: 'Diskont pivo' },
      { name: 'DESPAR', desc: 'Italijanska lastna linija (testenine, paradižnik, siri)', tier: 'budget', badge: 'Lastna znamka' },
      { name: 'Spar Natur*pur', desc: 'Ekološka in bio linija Spar', tier: 'premium_local', badge: 'Bio / Eko SLO' },
      { name: 'S.free', desc: 'Linija brez glutena in laktoze', tier: 'premium_local', badge: 'Brez glutena' }
    ]
  },
  lidl: {
    storeName: 'Lidl',
    brands: [
      { name: 'Combino', desc: 'Lastna znamka testenin (špageti, peresniki)', tier: 'budget', badge: 'Diskont testenine' },
      { name: 'Argus', desc: 'Diskontno pivo (lastna znamka Lidl)', tier: 'budget', badge: 'Diskont pivo' },
      { name: 'Perlenbacher', desc: 'Pils in pšenično pivo Lidl', tier: 'budget', badge: 'Lastna znamka pivo' },
      { name: 'Pilos', desc: 'Mlečni izdelki (mleko, maslo, jogurti, siri)', tier: 'budget', badge: 'Diskont mlečno' },
      { name: 'Cien', desc: 'Kozmetika in osebna nega', tier: 'budget', badge: 'Nega' },
      { name: 'W5', desc: 'Čistila, tablete za pomivalni stroj in praški', tier: 'budget', badge: 'Čistila' },
      { name: 'Pikok', desc: 'Mesni izdelki, hrenovke in salame', tier: 'budget', badge: 'Mesnine' }
    ]
  },
  hofer: {
    storeName: 'Hofer',
    brands: [
      { name: 'Cucina Nobile', desc: 'Testenine, omake in paradižnikovi izdelki', tier: 'budget', badge: 'Diskont testenine' },
      { name: 'Bergkönig', desc: 'Diskontno pivo in radlerji (lastna znamka Hofer)', tier: 'budget', badge: 'Diskont pivo' },
      { name: 'Milfina', desc: 'Mlečni izdelki (mleko, maslo, kisla smetana, sir)', tier: 'budget', badge: 'Diskont mlečno' },
      { name: 'Tandil', desc: 'Čistila, pralni praški in sredstva za pranje', tier: 'budget', badge: 'Čistila' },
      { name: 'Bio Natura', desc: 'Ekološki izdelki (mleko, jajca, žita)', tier: 'premium_local', badge: 'Eko / Bio' }
    ]
  },
  mercator: {
    storeName: 'Mercator',
    brands: [
      { name: 'Mercator', desc: 'Osnovna lastna znamka Mercator', tier: 'budget', badge: 'Lastna znamka' },
      { name: 'Lumpi', desc: 'Otroška linija, prigrizki in higiena', tier: 'budget', badge: 'Otroška linija' },
      { name: 'Bio Zone', desc: 'Ekološki in bio izdelki Mercator', tier: 'premium_local', badge: 'Bio linija' }
    ]
  },
  tus: {
    storeName: 'Tuš',
    brands: [
      { name: 'Tuš', desc: 'Osnovna lastna znamka Tuš', tier: 'budget', badge: 'Lastna znamka' },
      { name: 'Taft', desc: 'Diskontno pivo Tuš', tier: 'budget', badge: 'Diskont pivo' }
    ]
  },
  eurospin: {
    storeName: 'Eurospin',
    brands: [
      { name: 'Tre Mulini', desc: 'Testenine, moka in pekovski izdelki Eurospin', tier: 'budget', badge: 'Diskont testenine' },
      { name: 'Best Bräu', desc: 'Diskontno pivo in radlerji Eurospin', tier: 'budget', badge: 'Diskont pivo' },
      { name: 'Land', desc: 'Mlečni izdelki (mleko, maslo, sir)', tier: 'budget', badge: 'Diskont mlečno' },
      { name: 'Dexal', desc: 'Čistila in detergenti za pranje Eurospin', tier: 'budget', badge: 'Čistila' }
    ]
  }
};

/**
 * Standardna trgovska baza lastnih diskontnih znamk in primerjav priznanih znamk
 */
export const STANDARD_STORE_ITEMS = [
  // ==========================================
  // --- PIVO (Lastne diskontne znamke vs Laško/Union) ---
  // ==========================================
  {
    id: 'std-spar-pittinger',
    store: 'Spar',
    productName: 'Pittinger svetlo pivo 0,5 l pločevinka',
    brandName: 'Pittinger',
    normalizedKeyword: 'pivo',
    category: 'pijace',
    discountPrice: 0.69,
    regularPrice: 0.89,
    discountPercentage: '-22%',
    unit: '0,5 l',
    unitPriceFormatted: '1,38 € / l',
    tier: 'budget',
    tierBadge: 'Spar lastna znamka (Diskont)',
    origin: 'Avstrija / EU'
  },
  {
    id: 'std-lidl-argus',
    store: 'Lidl',
    productName: 'Argus svetlo pivo 0,5 l',
    brandName: 'Argus',
    normalizedKeyword: 'pivo',
    category: 'pijace',
    discountPrice: 0.65,
    regularPrice: 0.85,
    discountPercentage: '-23%',
    unit: '0,5 l',
    unitPriceFormatted: '1,30 € / l',
    tier: 'budget',
    tierBadge: 'Lidl lastna znamka (Diskont)',
    origin: 'EU'
  },
  {
    id: 'std-lidl-perlenbacher',
    store: 'Lidl',
    productName: 'Perlenbacher Premium Pils pivo 0,5 l',
    brandName: 'Perlenbacher',
    normalizedKeyword: 'pivo',
    category: 'pijace',
    discountPrice: 0.79,
    regularPrice: 0.99,
    discountPercentage: '-20%',
    unit: '0,5 l',
    unitPriceFormatted: '1,58 € / l',
    tier: 'budget',
    tierBadge: 'Lidl lastna znamka',
    origin: 'Nemčija'
  },
  {
    id: 'std-hofer-bergkonig',
    store: 'Hofer',
    productName: 'Bergkönig svetlo pivo 0,5 l',
    brandName: 'Bergkönig',
    normalizedKeyword: 'pivo',
    category: 'pijace',
    discountPrice: 0.65,
    regularPrice: 0.85,
    discountPercentage: '-23%',
    unit: '0,5 l',
    unitPriceFormatted: '1,30 € / l',
    tier: 'budget',
    tierBadge: 'Hofer lastna znamka (Diskont)',
    origin: 'Avstrija / EU'
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
    tierBadge: 'Eurospin lastna znamka (Diskont)',
    origin: 'EU'
  },
  {
    id: 'std-tus-taft',
    store: 'Tuš',
    productName: 'Taft svetlo pivo 0,5 l',
    brandName: 'Taft',
    normalizedKeyword: 'pivo',
    category: 'pijace',
    discountPrice: 0.69,
    regularPrice: 0.89,
    discountPercentage: '-22%',
    unit: '0,5 l',
    unitPriceFormatted: '1,38 € / l',
    tier: 'budget',
    tierBadge: 'Tuš lastna znamka (Diskont)',
    origin: 'EU'
  },
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
    tierBadge: 'Priznana znamka SLO',
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
    tierBadge: 'Priznana znamka SLO',
    origin: 'SLO (Ljubljana)'
  },

  // ==========================================
  // --- TESTENINE & ŠPAGETI (Combino, Cucina Nobile, S-Budget, Tre Mulini...) ---
  // ==========================================
  {
    id: 'std-spar-sbudget-spageti',
    store: 'Spar',
    productName: 'S-Budget Špageti No. 5 500 g',
    brandName: 'S-Budget',
    normalizedKeyword: 'testenine spageti',
    category: 'shramba',
    discountPrice: 0.69,
    regularPrice: 0.99,
    discountPercentage: '-30%',
    unit: '500 g',
    unitPriceFormatted: '1,38 € / kg',
    tier: 'budget',
    tierBadge: 'Spar S-Budget (Diskont)',
    origin: 'EU'
  },
  {
    id: 'std-spar-despar-spageti',
    store: 'Spar',
    productName: 'DESPAR Špageti iz durum pšenice 500 g',
    brandName: 'DESPAR',
    normalizedKeyword: 'testenine spageti',
    category: 'shramba',
    discountPrice: 0.89,
    regularPrice: 1.19,
    discountPercentage: '-25%',
    unit: '500 g',
    unitPriceFormatted: '1,78 € / kg',
    tier: 'budget',
    tierBadge: 'DESPAR lastna znamka',
    origin: 'Italija'
  },
  {
    id: 'std-spar-sfree-spageti',
    store: 'Spar',
    productName: 'S.free Brezglutenske testenine peresniki 500 g',
    brandName: 'S.free',
    normalizedKeyword: 'testenine spageti brez glutena',
    category: 'shramba',
    discountPrice: 1.69,
    regularPrice: 2.19,
    discountPercentage: '-23%',
    unit: '500 g',
    unitPriceFormatted: '3,38 € / kg',
    tier: 'premium_local',
    tierBadge: 'S.free Brez glutena',
    origin: 'EU'
  },
  {
    id: 'std-lidl-combino-spageti',
    store: 'Lidl',
    productName: 'Combino Špageti No. 5 500 g',
    brandName: 'Combino',
    normalizedKeyword: 'testenine spageti',
    category: 'shramba',
    discountPrice: 0.69,
    regularPrice: 0.99,
    discountPercentage: '-30%',
    unit: '500 g',
    unitPriceFormatted: '1,38 € / kg',
    tier: 'budget',
    tierBadge: 'Lidl Combino (Diskont)',
    origin: 'Italija'
  },
  {
    id: 'std-lidl-combino-penne',
    store: 'Lidl',
    productName: 'Combino Peresniki / Penne Rigate 500 g',
    brandName: 'Combino',
    normalizedKeyword: 'testenine peresniki',
    category: 'shramba',
    discountPrice: 0.69,
    regularPrice: 0.99,
    discountPercentage: '-30%',
    unit: '500 g',
    unitPriceFormatted: '1,38 € / kg',
    tier: 'budget',
    tierBadge: 'Lidl Combino (Diskont)',
    origin: 'Italija'
  },
  {
    id: 'std-hofer-cucina-spageti',
    store: 'Hofer',
    productName: 'Cucina Nobile Špageti 500 g',
    brandName: 'Cucina Nobile',
    normalizedKeyword: 'testenine spageti',
    category: 'shramba',
    discountPrice: 0.69,
    regularPrice: 0.99,
    discountPercentage: '-30%',
    unit: '500 g',
    unitPriceFormatted: '1,38 € / kg',
    tier: 'budget',
    tierBadge: 'Hofer Cucina Nobile (Diskont)',
    origin: 'Italija'
  },
  {
    id: 'std-hofer-cucina-passata',
    store: 'Hofer',
    productName: 'Cucina Nobile Pasirani paradižnik 500 g',
    brandName: 'Cucina Nobile',
    normalizedKeyword: 'paradiznik pelati omaka',
    category: 'shramba',
    discountPrice: 0.69,
    regularPrice: 0.89,
    discountPercentage: '-22%',
    unit: '500 g',
    unitPriceFormatted: '1,38 € / kg',
    tier: 'budget',
    tierBadge: 'Hofer Cucina Nobile',
    origin: 'Italija'
  },
  {
    id: 'std-eurospin-tremulini-spageti',
    store: 'Eurospin',
    productName: 'Tre Mulini Špageti 500 g',
    brandName: 'Tre Mulini',
    normalizedKeyword: 'testenine spageti',
    category: 'shramba',
    discountPrice: 0.65,
    regularPrice: 0.89,
    discountPercentage: '-27%',
    unit: '500 g',
    unitPriceFormatted: '1,30 € / kg',
    tier: 'budget',
    tierBadge: 'Eurospin Tre Mulini (Diskont)',
    origin: 'Italija'
  },
  {
    id: 'std-eurospin-tremulini-moka',
    store: 'Eurospin',
    productName: 'Tre Mulini Pšenična moka tip 500 1 kg',
    brandName: 'Tre Mulini',
    normalizedKeyword: 'moka bela',
    category: 'shramba',
    discountPrice: 0.55,
    regularPrice: 0.79,
    discountPercentage: '-30%',
    unit: '1 kg',
    unitPriceFormatted: '0,55 € / kg',
    tier: 'budget',
    tierBadge: 'Eurospin Tre Mulini',
    origin: 'Italija'
  },
  {
    id: 'std-mercator-spageti',
    store: 'Mercator',
    productName: 'Mercator Špageti 500 g',
    brandName: 'Mercator',
    normalizedKeyword: 'testenine spageti',
    category: 'shramba',
    discountPrice: 0.79,
    regularPrice: 1.09,
    discountPercentage: '-27%',
    unit: '500 g',
    unitPriceFormatted: '1,58 € / kg',
    tier: 'budget',
    tierBadge: 'Mercator lastna znamka',
    origin: 'SLO'
  },
  {
    id: 'std-tus-spageti',
    store: 'Tuš',
    productName: 'Tuš Špageti No. 5 500 g',
    brandName: 'Tuš',
    normalizedKeyword: 'testenine spageti',
    category: 'shramba',
    discountPrice: 0.75,
    regularPrice: 1.05,
    discountPercentage: '-28%',
    unit: '500 g',
    unitPriceFormatted: '1,50 € / kg',
    tier: 'budget',
    tierBadge: 'Tuš lastna znamka',
    origin: 'SLO'
  },
  {
    id: 'std-spar-barilla-spageti',
    store: 'Spar',
    productName: 'Barilla Špageti No. 5 500 g',
    brandName: 'Barilla',
    normalizedKeyword: 'testenine spageti',
    category: 'shramba',
    discountPrice: 1.49,
    regularPrice: 1.99,
    discountPercentage: '-25%',
    unit: '500 g',
    unitPriceFormatted: '2,98 € / kg',
    tier: 'brand',
    tierBadge: 'Priznana blagovna znamka',
    origin: 'Italija'
  },

  // ==========================================
  // --- MLEKO IN MLEČNO (Pilos, Milfina, S-Budget, Land...) ---
  // ==========================================
  {
    id: 'std-spar-sbudget-mleko',
    store: 'Spar',
    productName: 'S-Budget Trajno mleko 3,5% m.m. 1 l',
    brandName: 'S-Budget',
    normalizedKeyword: 'mleko',
    category: 'mlecno',
    discountPrice: 0.79,
    regularPrice: 1.09,
    discountPercentage: '-27%',
    unit: '1 l',
    unitPriceFormatted: '0,79 € / l',
    tier: 'budget',
    tierBadge: 'Spar S-Budget (Diskont)',
    origin: 'SLO / EU'
  },
  {
    id: 'std-spar-naturpur-mleko',
    store: 'Spar',
    productName: 'Spar Natur*pur Bio sveže mleko 3,5% 1 l',
    brandName: 'Spar Natur*pur',
    normalizedKeyword: 'mleko bio eko',
    category: 'mlecno',
    discountPrice: 1.29,
    regularPrice: 1.59,
    discountPercentage: '-19%',
    unit: '1 l',
    unitPriceFormatted: '1,29 € / l',
    tier: 'premium_local',
    tierBadge: 'Spar Natur*pur Bio SLO',
    origin: 'SLO'
  },
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
    tierBadge: 'Lidl Pilos (Diskont)',
    origin: 'SLO / EU'
  },
  {
    id: 'std-hofer-milfina-mleko',
    store: 'Hofer',
    productName: 'Milfina Sveže mleko 3,5% m.m. 1 l',
    brandName: 'Milfina',
    normalizedKeyword: 'mleko',
    category: 'mlecno',
    discountPrice: 0.79,
    regularPrice: 1.09,
    discountPercentage: '-27%',
    unit: '1 l',
    unitPriceFormatted: '0,79 € / l',
    tier: 'budget',
    tierBadge: 'Hofer Milfina (Diskont)',
    origin: 'SLO / EU'
  },
  {
    id: 'std-hofer-bio-mleko',
    store: 'Hofer',
    productName: 'Bio Natura Slovensko EKO mleko 1 l',
    brandName: 'Bio Natura',
    normalizedKeyword: 'mleko bio eko',
    category: 'mlecno',
    discountPrice: 1.25,
    regularPrice: 1.49,
    discountPercentage: '-16%',
    unit: '1 l',
    unitPriceFormatted: '1,25 € / l',
    tier: 'premium_local',
    tierBadge: 'Hofer Bio Natura SLO',
    origin: 'SLO'
  },
  {
    id: 'std-eurospin-land-mleko',
    store: 'Eurospin',
    productName: 'Land Sveže mleko 3,5% m.m. 1 l',
    brandName: 'Land',
    normalizedKeyword: 'mleko',
    category: 'mlecno',
    discountPrice: 0.75,
    regularPrice: 0.99,
    discountPercentage: '-24%',
    unit: '1 l',
    unitPriceFormatted: '0,75 € / l',
    tier: 'budget',
    tierBadge: 'Eurospin Land (Diskont)',
    origin: 'EU'
  },
  {
    id: 'std-mercator-mleko',
    store: 'Mercator',
    productName: 'Mercator Sveže mleko 3,5% 1 l',
    brandName: 'Mercator',
    normalizedKeyword: 'mleko',
    category: 'mlecno',
    discountPrice: 0.85,
    regularPrice: 1.15,
    discountPercentage: '-26%',
    unit: '1 l',
    unitPriceFormatted: '0,85 € / l',
    tier: 'budget',
    tierBadge: 'Mercator lastna znamka',
    origin: 'SLO'
  },
  {
    id: 'std-tus-mleko',
    store: 'Tuš',
    productName: 'Tuš Trajno mleko 3,5% m.m. 1 l',
    brandName: 'Tuš',
    normalizedKeyword: 'mleko',
    category: 'mlecno',
    discountPrice: 0.85,
    regularPrice: 1.15,
    discountPercentage: '-26%',
    unit: '1 l',
    unitPriceFormatted: '0,85 € / l',
    tier: 'budget',
    tierBadge: 'Tuš lastna znamka',
    origin: 'SLO'
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
    tierBadge: 'Priznana znamka SLO',
    origin: 'SLO'
  },

  // ==========================================
  // --- MASLO ---
  // ==========================================
  {
    id: 'std-spar-sbudget-maslo',
    store: 'Spar',
    productName: 'S-Budget Maslo 250 g',
    brandName: 'S-Budget',
    normalizedKeyword: 'maslo',
    category: 'mlecno',
    discountPrice: 1.69,
    regularPrice: 2.29,
    discountPercentage: '-26%',
    unit: '250 g',
    unitPriceFormatted: '6,76 € / kg',
    tier: 'budget',
    tierBadge: 'Spar S-Budget (Diskont)',
    origin: 'EU'
  },
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
    tierBadge: 'Lidl Pilos (Diskont)',
    origin: 'EU'
  },
  {
    id: 'std-hofer-milfina-maslo',
    store: 'Hofer',
    productName: 'Milfina Čajno maslo 250 g',
    brandName: 'Milfina',
    normalizedKeyword: 'maslo',
    category: 'mlecno',
    discountPrice: 1.59,
    regularPrice: 2.19,
    discountPercentage: '-27%',
    unit: '250 g',
    unitPriceFormatted: '6,36 € / kg',
    tier: 'budget',
    tierBadge: 'Hofer Milfina (Diskont)',
    origin: 'SLO / EU'
  },
  {
    id: 'std-eurospin-land-maslo',
    store: 'Eurospin',
    productName: 'Land Maslo 250 g',
    brandName: 'Land',
    normalizedKeyword: 'maslo',
    category: 'mlecno',
    discountPrice: 1.55,
    regularPrice: 2.15,
    discountPercentage: '-28%',
    unit: '250 g',
    unitPriceFormatted: '6,20 € / kg',
    tier: 'budget',
    tierBadge: 'Eurospin Land (Diskont)',
    origin: 'EU'
  },
  {
    id: 'std-mercator-maslo',
    store: 'Mercator',
    productName: 'Mercator Maslo 250 g',
    brandName: 'Mercator',
    normalizedKeyword: 'maslo',
    category: 'mlecno',
    discountPrice: 1.79,
    regularPrice: 2.39,
    discountPercentage: '-25%',
    unit: '250 g',
    unitPriceFormatted: '7,16 € / kg',
    tier: 'budget',
    tierBadge: 'Mercator lastna znamka',
    origin: 'SLO'
  },
  {
    id: 'std-spar-mu-maslo',
    store: 'Spar',
    productName: 'Mu Maslo Ljubljanske mlekarne 250 g',
    brandName: 'Mu',
    normalizedKeyword: 'maslo',
    category: 'mlecno',
    discountPrice: 2.39,
    regularPrice: 2.99,
    discountPercentage: '-20%',
    unit: '250 g',
    unitPriceFormatted: '9,56 € / kg',
    tier: 'brand',
    tierBadge: 'Priznana znamka SLO',
    origin: 'SLO'
  },

  // ==========================================
  // --- ČISTILA IN NEGA (W5, Tandil, Dexal, Cien, Lumpi...) ---
  // ==========================================
  {
    id: 'std-lidl-w5-tablete',
    store: 'Lidl',
    productName: 'W5 Tablete za pomivalni stroj All in 1 40 kos',
    brandName: 'W5',
    normalizedKeyword: 'tablete pomivalni stroj cistila',
    category: 'cistila',
    discountPrice: 3.49,
    regularPrice: 4.49,
    discountPercentage: '-22%',
    unit: '40 kos',
    unitPriceFormatted: '0,09 € / kos',
    tier: 'budget',
    tierBadge: 'Lidl W5 Diskont',
    origin: 'EU'
  },
  {
    id: 'std-lidl-cien-sampon',
    store: 'Lidl',
    productName: 'Cien Šampon za lase 500 ml',
    brandName: 'Cien',
    normalizedKeyword: 'sampon za lase nega',
    category: 'nega',
    discountPrice: 1.19,
    regularPrice: 1.59,
    discountPercentage: '-25%',
    unit: '500 ml',
    unitPriceFormatted: '2,38 € / l',
    tier: 'budget',
    tierBadge: 'Lidl Cien',
    origin: 'EU'
  },
  {
    id: 'std-hofer-tandil-prasek',
    store: 'Hofer',
    productName: 'Tandil Pralni prašek za perilo 40 pranj',
    brandName: 'Tandil',
    normalizedKeyword: 'pralni prasek cistila detergent',
    category: 'cistila',
    discountPrice: 3.99,
    regularPrice: 4.99,
    discountPercentage: '-20%',
    unit: '40 pranj',
    unitPriceFormatted: '0,10 € / pranje',
    tier: 'budget',
    tierBadge: 'Hofer Tandil Diskont',
    origin: 'EU'
  },
  {
    id: 'std-eurospin-dexal-pranje',
    store: 'Eurospin',
    productName: 'Dexal Tekoči detergent za pranje 40 pranj',
    brandName: 'Dexal',
    normalizedKeyword: 'pralni prasek cistila detergent',
    category: 'cistila',
    discountPrice: 3.49,
    regularPrice: 4.49,
    discountPercentage: '-22%',
    unit: '40 pranj',
    unitPriceFormatted: '0,09 € / pranje',
    tier: 'budget',
    tierBadge: 'Eurospin Dexal Diskont',
    origin: 'Italija'
  },
  {
    id: 'std-mercator-lumpi-robcki',
    store: 'Mercator',
    productName: 'Lumpi Vlažilni robčki za otroke 72 kos',
    brandName: 'Lumpi',
    normalizedKeyword: 'robcki otroski lumpi nega',
    category: 'nega',
    discountPrice: 1.19,
    regularPrice: 1.59,
    discountPercentage: '-25%',
    unit: '72 kos',
    unitPriceFormatted: '0,02 € / kos',
    tier: 'budget',
    tierBadge: 'Mercator Lumpi',
    origin: 'SLO'
  },
  {
    id: 'std-lidl-pikok-salama',
    store: 'Lidl',
    productName: 'Pikok Posebna piščančja salama 500 g',
    brandName: 'Pikok',
    normalizedKeyword: 'salama meso posebna pikok',
    category: 'meso',
    discountPrice: 1.49,
    regularPrice: 1.99,
    discountPercentage: '-25%',
    unit: '500 g',
    unitPriceFormatted: '2,98 € / kg',
    tier: 'budget',
    tierBadge: 'Lidl Pikok',
    origin: 'EU'
  },
  {
    id: 'std-mercator-biozone-cicerika',
    store: 'Mercator',
    productName: 'Bio Zone EKO Čičerika 400 g',
    brandName: 'Bio Zone',
    normalizedKeyword: 'cicerika bio eko shramba',
    category: 'shramba',
    discountPrice: 0.99,
    regularPrice: 1.29,
    discountPercentage: '-23%',
    unit: '400 g',
    unitPriceFormatted: '2,48 € / kg',
    tier: 'premium_local',
    tierBadge: 'Mercator Bio Zone',
    origin: 'SLO / EU'
  }
];

/**
 * ZEMLJEVID ZA PREPOZNAVO ZNAMKE IN MATIČNEGA TRGOVCA
 */
const BRAND_MAPPING = {
  // Spar
  'pittinger': { store: 'Spar', brand: 'Pittinger', defaultKeyword: 'pivo', category: 'pijace', unit: '0,5 l', price: 0.69, unitPrice: '1,38 € / l', tier: 'budget' },
  's-budget': { store: 'Spar', brand: 'S-Budget', defaultKeyword: 'hrana', category: 'ostalo', unit: '1 kos', price: 0.69, unitPrice: '1,38 € / kg', tier: 'budget' },
  'sbudget': { store: 'Spar', brand: 'S-Budget', defaultKeyword: 'hrana', category: 'ostalo', unit: '1 kos', price: 0.69, unitPrice: '1,38 € / kg', tier: 'budget' },
  'despar': { store: 'Spar', brand: 'DESPAR', defaultKeyword: 'testenine', category: 'shramba', unit: '500 g', price: 0.89, unitPrice: '1,78 € / kg', tier: 'budget' },
  'spar natur*pur': { store: 'Spar', brand: 'Spar Natur*pur', defaultKeyword: 'bio', category: 'shramba', unit: '1 kos', price: 1.29, unitPrice: '1,29 € / l', tier: 'premium_local' },
  'naturpur': { store: 'Spar', brand: 'Spar Natur*pur', defaultKeyword: 'bio', category: 'shramba', unit: '1 kos', price: 1.29, unitPrice: '1,29 € / l', tier: 'premium_local' },
  's.free': { store: 'Spar', brand: 'S.free', defaultKeyword: 'brez glutena', category: 'shramba', unit: '500 g', price: 1.69, unitPrice: '3,38 € / kg', tier: 'premium_local' },
  'sfree': { store: 'Spar', brand: 'S.free', defaultKeyword: 'brez glutena', category: 'shramba', unit: '500 g', price: 1.69, unitPrice: '3,38 € / kg', tier: 'premium_local' },

  // Lidl
  'combino': { store: 'Lidl', brand: 'Combino', defaultKeyword: 'testenine', category: 'shramba', unit: '500 g', price: 0.69, unitPrice: '1,38 € / kg', tier: 'budget' },
  'argus': { store: 'Lidl', brand: 'Argus', defaultKeyword: 'pivo', category: 'pijace', unit: '0,5 l', price: 0.65, unitPrice: '1,30 € / l', tier: 'budget' },
  'perlenbacher': { store: 'Lidl', brand: 'Perlenbacher', defaultKeyword: 'pivo', category: 'pijace', unit: '0,5 l', price: 0.79, unitPrice: '1,58 € / l', tier: 'budget' },
  'pilos': { store: 'Lidl', brand: 'Pilos', defaultKeyword: 'mleko', category: 'mlecno', unit: '1 l', price: 0.79, unitPrice: '0,79 € / l', tier: 'budget' },
  'cien': { store: 'Lidl', brand: 'Cien', defaultKeyword: 'sampon', category: 'nega', unit: '500 ml', price: 1.19, unitPrice: '2,38 € / l', tier: 'budget' },
  'w5': { store: 'Lidl', brand: 'W5', defaultKeyword: 'cistila', category: 'cistila', unit: '1 kos', price: 0.99, unitPrice: '0,99 € / kos', tier: 'budget' },
  'pikok': { store: 'Lidl', brand: 'Pikok', defaultKeyword: 'salama', category: 'meso', unit: '500 g', price: 1.49, unitPrice: '2,98 € / kg', tier: 'budget' },

  // Hofer
  'cucina nobile': { store: 'Hofer', brand: 'Cucina Nobile', defaultKeyword: 'testenine', category: 'shramba', unit: '500 g', price: 0.69, unitPrice: '1,38 € / kg', tier: 'budget' },
  'cucina': { store: 'Hofer', brand: 'Cucina Nobile', defaultKeyword: 'testenine', category: 'shramba', unit: '500 g', price: 0.69, unitPrice: '1,38 € / kg', tier: 'budget' },
  'bergkonig': { store: 'Hofer', brand: 'Bergkönig', defaultKeyword: 'pivo', category: 'pijace', unit: '0,5 l', price: 0.65, unitPrice: '1,30 € / l', tier: 'budget' },
  'bergkönig': { store: 'Hofer', brand: 'Bergkönig', defaultKeyword: 'pivo', category: 'pijace', unit: '0,5 l', price: 0.65, unitPrice: '1,30 € / l', tier: 'budget' },
  'milfina': { store: 'Hofer', brand: 'Milfina', defaultKeyword: 'mleko', category: 'mlecno', unit: '1 l', price: 0.79, unitPrice: '0,79 € / l', tier: 'budget' },
  'tandil': { store: 'Hofer', brand: 'Tandil', defaultKeyword: 'prasek', category: 'cistila', unit: '40 pranj', price: 3.99, unitPrice: '0,10 € / pranje', tier: 'budget' },
  'bio natura': { store: 'Hofer', brand: 'Bio Natura', defaultKeyword: 'bio mleko', category: 'mlecno', unit: '1 l', price: 1.25, unitPrice: '1,25 € / l', tier: 'premium_local' },

  // Mercator
  'lumpi': { store: 'Mercator', brand: 'Lumpi', defaultKeyword: 'otrosko', category: 'nega', unit: '1 kos', price: 1.19, unitPrice: '0,02 € / kos', tier: 'budget' },
  'bio zone': { store: 'Mercator', brand: 'Bio Zone', defaultKeyword: 'bio', category: 'shramba', unit: '1 kos', price: 0.99, unitPrice: '2,48 € / kg', tier: 'premium_local' },
  'biozone': { store: 'Mercator', brand: 'Bio Zone', defaultKeyword: 'bio', category: 'shramba', unit: '1 kos', price: 0.99, unitPrice: '2,48 € / kg', tier: 'premium_local' },

  // Tuš
  'taft': { store: 'Tuš', brand: 'Taft', defaultKeyword: 'pivo', category: 'pijace', unit: '0,5 l', price: 0.69, unitPrice: '1,38 € / l', tier: 'budget' },

  // Eurospin
  'tre mulini': { store: 'Eurospin', brand: 'Tre Mulini', defaultKeyword: 'testenine', category: 'shramba', unit: '500 g', price: 0.65, unitPrice: '1,30 € / kg', tier: 'budget' },
  'tremulini': { store: 'Eurospin', brand: 'Tre Mulini', defaultKeyword: 'testenine', category: 'shramba', unit: '500 g', price: 0.65, unitPrice: '1,30 € / kg', tier: 'budget' },
  'best brau': { store: 'Eurospin', brand: 'Best Bräu', defaultKeyword: 'pivo', category: 'pijace', unit: '0,5 l', price: 0.65, unitPrice: '1,30 € / l', tier: 'budget' },
  'best bräu': { store: 'Eurospin', brand: 'Best Bräu', defaultKeyword: 'pivo', category: 'pijace', unit: '0,5 l', price: 0.65, unitPrice: '1,30 € / l', tier: 'budget' },
  'bestbrau': { store: 'Eurospin', brand: 'Best Bräu', defaultKeyword: 'pivo', category: 'pijace', unit: '0,5 l', price: 0.65, unitPrice: '1,30 € / l', tier: 'budget' },
  'land': { store: 'Eurospin', brand: 'Land', defaultKeyword: 'mleko', category: 'mlecno', unit: '1 l', price: 0.75, unitPrice: '0,75 € / l', tier: 'budget' },
  'dexal': { store: 'Eurospin', brand: 'Dexal', defaultKeyword: 'cistila', category: 'cistila', unit: '1 kos', price: 2.79, unitPrice: '0,09 € / kos', tier: 'budget' }
};

/**
 * Samodejno prepozna znamko in matičnega trgovca iz vnesenega niza
 * @param {string} text - npr. "Pittinger", "S-Budget špageti", "Combino", "Tandil prašek"
 */
export function detectBrandAndStore(text) {
  if (!text) return null;
  const clean = normalizeText(text);

  for (const [key, meta] of Object.entries(BRAND_MAPPING)) {
    const cleanKey = normalizeText(key);
    if (clean === cleanKey || clean.startsWith(cleanKey + ' ') || clean.endsWith(' ' + cleanKey) || clean.includes(' ' + cleanKey + ' ')) {
      return {
        brand: meta.brand,
        store: meta.store,
        category: meta.category,
        defaultUnit: meta.unit,
        price: meta.price,
        unitPriceFormatted: meta.unitPrice,
        tier: meta.tier,
        isOwnBrand: true
      };
    }
  }

  return null;
}

/**
 * Pametno iskanje znamk in cen razdeljenih po trgovinah
 * - Če uporabnik vpiše splošno ime (npr. "špageti", "pivo", "mleko"), obvezno ponudi lastno znamko posameznega trgovca poleg priznanih znamk!
 * - Če vpiše neposredno ime znamke (npr. "pittinger", "combino"), takoj prepozna trgovino in artikel!
 */
export function searchStoreBrands(rawQuery, catalogDeals = []) {
  if (!rawQuery || rawQuery.trim().length < 2) {
    return { totalCount: 0, byStore: {} };
  }

  const queryNorm = normalizeText(rawQuery);
  const queryWords = queryNorm.split(' ').filter(Boolean);

  // Preveri, če gre za neposredno vpisano lastno znamko
  const detectedBrand = detectBrandAndStore(rawQuery);

  // Združi kataloge in celotno standardno bazo
  const allPool = [...(catalogDeals || []), ...STANDARD_STORE_ITEMS];
  const seenIds = new Set();
  const matched = [];

  // Če je bila zaznana določena lastna znamka, najprej dodaj artikle te točno določene znamke
  if (detectedBrand) {
    for (const item of allPool) {
      if (seenIds.has(item.id)) continue;
      const bNorm = normalizeText(item.brandName || item.brand || '');
      if (bNorm.includes(normalizeText(detectedBrand.brand))) {
        seenIds.add(item.id);
        matched.push({
          ...item,
          store: detectedBrand.store,
          tier: item.tier || detectedBrand.tier,
          tierBadge: item.tierBadge || `${detectedBrand.store} ${detectedBrand.brand}`
        });
      }
    }
  }

  // Preišči preostale artikle
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
        if (item.tier === 'budget') tierBadge = 'Diskont / Lastna znamka';
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

  // Znotraj vsake trgovine razvrsti: najprej diskont/lastna znamka (budget), nato priznana znamka
  for (const store of Object.keys(byStore)) {
    byStore[store].sort((a, b) => {
      // Diskont/budget ima prioriteto za prikaz ugodnosti
      if (a.tier === 'budget' && b.tier !== 'budget') return -1;
      if (b.tier === 'budget' && a.tier !== 'budget') return 1;
      return (a.discountPrice || 0) - (b.discountPrice || 0);
    });
  }

  return {
    totalCount: matched.length,
    byStore,
    detectedBrand
  };
}
