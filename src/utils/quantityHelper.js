/**
 * POMOŽNE FUNKCIJE ZA PAMETNO PREPOZNAVO IN UPRAVLJANJE KOLIČIN
 */

/**
 * Normalizira enoto v standardno obliko (kom, kg, l, plato, paket itd.)
 */
export function normalizeUnit(rawUnit, category = '', title = '') {
  if (!rawUnit) {
    return getDefaultUnit(category, title);
  }

  const u = rawUnit.toLowerCase().trim();
  if (['x', 'kom', 'kos', 'komad', 'komada', 'komadov', 'kom.', 'kosa', 'kosi'].includes(u)) return 'kom';
  if (['kg', 'kilo', 'kilogram', 'kilograma', 'kilogramov', 'kg.'].includes(u)) return 'kg';
  if (['g', 'gram', 'grama', 'gramov', 'g.'].includes(u)) return 'g';
  if (['l', 'liter', 'litra', 'litrov', 'litri', 'l.'].includes(u)) return 'l';
  if (['ml', 'mililiter', 'mililitra', 'mililitrov', 'ml.'].includes(u)) return 'ml';
  if (['plato', 'platoja', 'platojev', 'platoji', 'platoju'].includes(u)) return 'plato';
  if (['paket', 'paketa', 'paketov', 'paketi', 'pak.', 'pak'].includes(u)) return 'paket';

  return u;
}

/**
 * Vrne privzeto enoto glede na kategorijo ali ime živila
 */
export function getDefaultUnit(category = '', title = '') {
  const t = (title || '').toLowerCase();
  
  if (category === 'sadje-zelenjava') {
    // Posamezni kosi sadja/zelenjave
    if (t.includes('ananas') || t.includes('melona') || t.includes('lubenica') || t.includes('solata') || t.includes('kumara')) {
      return 'kom';
    }
    return 'kg';
  }

  if (category === 'pijace' || t.includes('sok') || t.includes('voda') || t.includes('mleko')) {
    if (t.includes('pivo') || t.includes('radler') || t.includes('pločevink')) {
      return 'kom';
    }
    return 'l';
  }

  return 'kom';
}

/**
 * Razčleni vnos uporabnika (npr. "2x mleko", "1.5kg banan", "pivo 6 kom", "plato piva", "1 plato piva")
 * Vrne: { cleanTitle, quantity, unit, displayQuantity }
 */
export function parseQuantityInput(input = '', defaultCategory = '') {
  const str = (input || '').trim();
  if (!str) {
    return {
      cleanTitle: '',
      quantity: 1,
      unit: 'kom',
      displayQuantity: '1 kom'
    };
  }

  const unitRegexPart = '(?:x|kom|kos|kosa|kosi|komad|komada|komadov|kg|kilo|kilogram|kilograma|kilogramov|g|gram|grama|gramov|l|liter|litra|litrov|ml|mililiter|mililitra|mililitrov|plato|platoja|platojev|platoji|paket|paketa|paketov|paketi)';

  // 1. Vzorec na začetku z številko: "2x mleko", "2 x mleko", "1.5 kg banan", "1,5kg jabolk", "6 kom pivo", "1 plato piva"
  const prefixMatch = str.match(new RegExp(`^(\\d+(?:[.,]\\d+)?)\\s*(${unitRegexPart})?\\s*(?:x\\s*)?(.+)$`, 'i'));
  if (prefixMatch) {
    const rawNum = prefixMatch[1].replace(',', '.');
    const rawUnit = prefixMatch[2];
    const rest = prefixMatch[3].trim();

    const num = parseFloat(rawNum);
    if (!isNaN(num) && num > 0 && rest.length > 0) {
      const unit = normalizeUnit(rawUnit, defaultCategory, rest);
      return {
        cleanTitle: rest,
        quantity: num,
        unit,
        displayQuantity: `${num} ${unit}`
      };
    }
  }

  // 2. Vzorec na začetku BREZ številke za plato / paket: "plato piva", "paket vode"
  const standalonePrefixMatch = str.match(new RegExp(`^(plato|platoja|platojev|platoji|paket|paketa|paketov)\\s+(.+)$`, 'i'));
  if (standalonePrefixMatch) {
    const rawUnit = standalonePrefixMatch[1];
    const rest = standalonePrefixMatch[2].trim();
    if (rest.length > 0) {
      const unit = normalizeUnit(rawUnit, defaultCategory, rest);
      return {
        cleanTitle: rest,
        quantity: 1,
        unit,
        displayQuantity: `1 ${unit}`
      };
    }
  }

  // 3. Vzorec na koncu z številko: "mleko 2x", "pivo 6 kom", "banane 1.5kg", "pivo 1 plato"
  const suffixMatch = str.match(new RegExp(`^(.+?)\\s+(\\d+(?:[.,]\\d+)?)\\s*(${unitRegexPart})?$`, 'i'));
  if (suffixMatch) {
    const rest = suffixMatch[1].trim();
    const rawNum = suffixMatch[2].replace(',', '.');
    const rawUnit = suffixMatch[3];

    const num = parseFloat(rawNum);
    if (!isNaN(num) && num > 0 && rest.length > 0) {
      const unit = normalizeUnit(rawUnit, defaultCategory, rest);
      return {
        cleanTitle: rest,
        quantity: num,
        unit,
        displayQuantity: `${num} ${unit}`
      };
    }
  }

  // 4. Vzorec na koncu BREZ številke za plato / paket: "pivo plato", "voda paket"
  const standaloneSuffixMatch = str.match(new RegExp(`^(.+?)\\s+(plato|platoja|platojev|platoji|paket|paketa|paketov)$`, 'i'));
  if (standaloneSuffixMatch) {
    const rest = standaloneSuffixMatch[1].trim();
    const rawUnit = standaloneSuffixMatch[2];
    if (rest.length > 0) {
      const unit = normalizeUnit(rawUnit, defaultCategory, rest);
      return {
        cleanTitle: rest,
        quantity: 1,
        unit,
        displayQuantity: `1 ${unit}`
      };
    }
  }

  // Ni zaznane posebne količine: privzeto 1 z ustrezno enoto
  const unit = getDefaultUnit(defaultCategory, str);
  return {
    cleanTitle: str,
    quantity: 1,
    unit,
    displayQuantity: `1 ${unit}`
  };
}

/**
 * Razčleni poljubno vrednost quantity (število ali niz) in vrne strukturirane podatke
 */
export function parseQuantityAndUnit(quantityInput, category = '', title = '') {
  if (typeof quantityInput === 'number' && !isNaN(quantityInput) && quantityInput > 0) {
    const unit = getDefaultUnit(category, title);
    return {
      quantity: quantityInput,
      unit,
      displayQuantity: `${quantityInput} ${unit}`
    };
  }

  if (typeof quantityInput === 'string' && quantityInput.trim().length > 0) {
    const str = quantityInput.trim();
    // Preveri ali niz vsebuje številko in enoto, npr. "2.5 kg" ali "1 kom"
    const match = str.match(/^(\d+(?:[.,]\d+)?)\s*(.*)$/);
    if (match) {
      const num = parseFloat(match[1].replace(',', '.'));
      if (!isNaN(num) && num > 0) {
        const rawUnit = match[2].trim();
        const unit = normalizeUnit(rawUnit, category, title);
        return {
          quantity: num,
          unit,
          displayQuantity: `${num} ${unit}`
        };
      }
    }

    // Če je niz samo enota ali besedilo
    return {
      quantity: 1,
      unit: normalizeUnit(str, category, title),
      displayQuantity: str
    };
  }

  const unit = getDefaultUnit(category, title);
  return {
    quantity: 1,
    unit,
    displayQuantity: `1 ${unit}`
  };
}

/**
 * Hitre bližnjice količin glede na vrsto artikla
 */
export function getQuickQuantityPresets(category = '', title = '') {
  const t = (title || '').toLowerCase();

  // 1. Pijače in tekočine (pivo, radler, vino, sok, voda)
  if (
    category === 'pijace' || 
    t.includes('pivo') || 
    t.includes('radler') || 
    t.includes('sok') || 
    t.includes('voda') || 
    t.includes('coca') || 
    t.includes('pepsi') ||
    t.includes('vino')
  ) {
    return [
      { label: '1 kom', qty: 1, unit: 'kom' },
      { label: '6 kom (paket)', qty: 6, unit: 'kom' },
      { label: '24 kom (plato)', qty: 24, unit: 'kom' }
    ];
  }

  // 2. Sadje in zelenjava (na kilograme)
  if (
    category === 'sadje-zelenjava' ||
    t.includes('banana') ||
    t.includes('jabolk') ||
    t.includes('krompir') ||
    t.includes('čebula') ||
    t.includes('paradižnik') ||
    t.includes('korenje') ||
    t.includes('pomaranč')
  ) {
    return [
      { label: '0.5 kg', qty: 0.5, unit: 'kg' },
      { label: '1 kg', qty: 1, unit: 'kg' },
      { label: '2 kg', qty: 2, unit: 'kg' }
    ];
  }

  // 3. Mleko in tekoči mlečni izdelki
  if (t.includes('mleko') || t.includes('jogurt') || t.includes('smetana')) {
    return [
      { label: '1 l', qty: 1, unit: 'l' },
      { label: '2 l', qty: 2, unit: 'l' },
      { label: '6 l (paket)', qty: 6, unit: 'l' }
    ];
  }

  // 4. Splošna živila in ostalo
  return [
    { label: '1 kom', qty: 1, unit: 'kom' },
    { label: '2 kom', qty: 2, unit: 'kom' },
    { label: '3 kom', qty: 3, unit: 'kom' }
  ];
}

/**
 * Formatiran izpis cene (enota in skupaj)
 * npr. "1,79 € / kom • Skupaj: 3,58 €"
 */
export function formatItemPriceDetails(price, quantity = 1, unit = 'kom') {
  if (typeof price !== 'number' || isNaN(price) || price <= 0) {
    return null;
  }

  const q = typeof quantity === 'number' && !isNaN(quantity) && quantity > 0 ? quantity : 1;
  const totalPrice = price * q;

  const unitFormatted = `${price.toFixed(2).replace('.', ',')} € / ${unit || 'kom'}`;
  
  if (q === 1) {
    return unitFormatted;
  }

  const totalFormatted = `${totalPrice.toFixed(2).replace('.', ',')} €`;
  return `${unitFormatted} • Skupaj: ${totalFormatted}`;
}

/**
 * Skupna cena artikla
 */
export function calculateTotalItemPrice(price, quantity = 1) {
  if (typeof price !== 'number' || isNaN(price) || price <= 0) {
    return null;
  }
  const q = typeof quantity === 'number' && !isNaN(quantity) && quantity > 0 ? quantity : 1;
  return Number((price * q).toFixed(2));
}
