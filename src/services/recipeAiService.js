/**
 * Pametna storitev za generiranje kulinaričnih receptov z Google Gemini AI
 * ter razčlenitev sestavin in optimizacijo nakupa po slovenskih trgovinah.
 */

import { findBestDeal } from '../utils/fuzzyMatch';

// Vgrajeni recepti za zanesljivost brez internetne povezave ali ob odsotnosti API ključa
const FALLBACK_RECIPES = [
  {
    keywords: ['curry', 'kari', 'piscancji curry', 'riž', 'riz'],
    title: 'Kremni piščančji curry z rižem',
    prepTime: '35 min',
    servings: 4,
    category: 'azijska',
    emoji: '🍛',
    description: 'Bogat in aromatičen curry s kokosovim mlekom, sočnim piščancem in svežo zelenjavo.',
    ingredients: [
      {
        name: 'Piščančji file',
        amount: '500 g',
        searchKeyword: 'piscancji file',
        category: 'meso'
      },
      {
        name: 'Kokosovo mleko',
        amount: '400 ml',
        searchKeyword: 'kokosovo mleko',
        category: 'shramba'
      },
      {
        name: 'Basmati riž',
        amount: '300 g',
        searchKeyword: 'basmati riz',
        category: 'shramba'
      },
      {
        name: 'Rumena čebula',
        amount: '2 kos',
        searchKeyword: 'cebula',
        category: 'sadje-zelenjava'
      },
      {
        name: 'Korenje',
        amount: '3 kos',
        searchKeyword: 'korenje',
        category: 'sadje-zelenjava'
      },
      {
        name: 'Curry začimbna mešanica ali pasta',
        amount: '2 žlici',
        searchKeyword: 'curry',
        category: 'shramba'
      }
    ],
    steps: [
      'Piščančji file narežemo na grižljaj velike koščke ter ga na vročem olju na hitro popečemo do zlate barve.',
      'Meso vzamemo iz ponve. Na isti maščobi popražimo drobno sesekljano čebulo in na kolobarje narezano korenje.',
      'Dodamo curry začimbno mešanico, premešamo ter zalijemo s kokosovim mlekom in malce vode.',
      'V omako vrnemo piščanca in na zmernem ognju pokrito dušimo približno 15 minut.',
      'Medtem v slani vodi skuhamo basmati riž po navodilih z embalaže ter postrežemo.'
    ]
  },
  {
    keywords: ['pica', 'pizza', 'domaca pica'],
    title: 'Domača hrustljava pica',
    prepTime: '40 min',
    servings: 4,
    category: 'italijanska',
    emoji: '🍕',
    description: 'Klasična družinska pica s hrustljavo skorjico, paradižnikovo omako, mocarelo in kuhanem pršutom.',
    ingredients: [
      {
        name: 'Pšenična moka tip 500',
        amount: '500 g',
        searchKeyword: 'moka',
        category: 'shramba'
      },
      {
        name: 'Sveži kvas ali suhi kvas',
        amount: '1 zavojček',
        searchKeyword: 'kvas',
        category: 'pekovski'
      },
      {
        name: 'Paradižnikova mezga / passata',
        amount: '300 g',
        searchKeyword: 'paradiznikova mezga',
        category: 'shramba'
      },
      {
        name: 'Sir mocarela ali gavda za pico',
        amount: '300 g',
        searchKeyword: 'sir mocarela',
        category: 'mlecno'
      },
      {
        name: 'Kuhan pršut ali pica šunka',
        amount: '200 g',
        searchKeyword: 'kuhan prsut',
        category: 'meso'
      },
      {
        name: 'Oljčno olje in origano',
        amount: '2 žlici',
        searchKeyword: 'oljcno olje',
        category: 'shramba'
      }
    ],
    steps: [
      'Iz moke, kvasa, tople vode, ščepca soli in žlice oljčnega olja zamesimo mehko testo ter pustimo vzhajati.',
      'Vzhajano testo razvlečemo ali razvaljamo na pekač, obložen s peki papirjem.',
      'Testo premažemo s paradižnikovo passata omako, začinjeno z origanom in soljo.',
      'Enakomerno potresemo z naribanim sirom ter obložimo s šunko ali gobicami po želji.',
      'Pečemo v vnaprej ogreti pečici na 230 °C približno 12-15 minut do hrustljave zlate skorje.'
    ]
  },
  {
    keywords: ['gobe', 'gobova juha', 'jurcki', 'gobova'],
    title: 'Bogata gobova juha s krompirjem',
    prepTime: '30 min',
    servings: 4,
    category: 'slovenska',
    emoji: '🍲',
    description: 'Tradicionalna dišeča domača gobova juha s koščki krompirja in kančkom kisle smetane.',
    ingredients: [
      {
        name: 'Gobe ali zamrznjeni jurčki',
        amount: '400 g',
        searchKeyword: 'gobe',
        category: 'sadje-zelenjava'
      },
      {
        name: 'Krompir',
        amount: '4 kos',
        searchKeyword: 'krompir',
        category: 'sadje-zelenjava'
      },
      {
        name: 'Čebula',
        amount: '1 kos',
        searchKeyword: 'cebula',
        category: 'sadje-zelenjava'
      },
      {
        name: 'Česen',
        amount: '3 stroki',
        searchKeyword: 'cesen',
        category: 'sadje-zelenjava'
      },
      {
        name: 'Kisla smetana',
        amount: '150 g',
        searchKeyword: 'kisla smetana',
        category: 'mlecno'
      },
      {
        name: 'Svež peteršilj in majaron',
        amount: '1 šopek',
        searchKeyword: 'petersilj',
        category: 'sadje-zelenjava'
      }
    ],
    steps: [
      'Na olju ali maslu prepražimo drobno sesekljano čebulo in strt česen.',
      'Dodamo očiščene narezane gobe in jih pražimo 5 minut, da spustijo aromo.',
      'Dodamo na kocke narezan krompir, solimo, popramo in začinimo z majaronom.',
      'Zalijemo z 1 litrom tople vode ali jušne osnove ter kuhamo 20 minut do mehkega krompirja.',
      'Pred postrežbo vmešamo podmet s kislo smetano in potresemo s svežim sesekljanim peteršiljem.'
    ]
  },
  {
    keywords: ['bolognese', 'spageti', 'bolonjez', 'testenine', 'pashta'],
    title: 'Testenine Bolognese z mletim mesom',
    prepTime: '30 min',
    servings: 4,
    category: 'italijanska',
    emoji: '🍝',
    description: 'Sočna mesna omaka z zrelim paradižnikom in testeninami, ki jo obožuje cela družina.',
    ingredients: [
      {
        name: 'Mleto mešano meso (goveje/svinjsko)',
        amount: '500 g',
        searchKeyword: 'mleto meso',
        category: 'meso'
      },
      {
        name: 'Špageti ali peresniki',
        amount: '500 g',
        searchKeyword: 'spageti',
        category: 'shramba'
      },
      {
        name: 'Paradižnikova omaka pelati',
        amount: '400 g',
        searchKeyword: 'pelati',
        category: 'shramba'
      },
      {
        name: 'Korenje',
        amount: '2 kos',
        searchKeyword: 'korenje',
        category: 'sadje-zelenjava'
      },
      {
        name: 'Čebula',
        amount: '1 kos',
        searchKeyword: 'cebula',
        category: 'sadje-zelenjava'
      },
      {
        name: 'Sir Parmezan (Grana Padano)',
        amount: '100 g',
        searchKeyword: 'parmezan',
        category: 'mlecno'
      }
    ],
    steps: [
      'Na olju popražimo sesekljano čebulo in drobno naribano korenje.',
      'Dodamo mleto meso in ga med mešanjem pražimo približno 8 minut, da spremeni barvo.',
      'Prilijemo paradižnikove pelate, začinimo s soljo, poprom in baziliko ter pokrito kuhamo 15-20 minut.',
      'V vrelem slanem kropu skuhamo testenine al dente ter jih odcedimo.',
      'Testenine prelijemo z bogato mesno omako in potresemo s sveže naribanim parmezanom.'
    ]
  },
  {
    keywords: ['palacinke', 'palacinka', 'sladica'],
    title: 'Mehke domače palačinke',
    prepTime: '25 min',
    servings: 4,
    category: 'slovenska',
    emoji: '🥞',
    description: 'Tradicionalne puhaste slovenske palačinke z domačo marmelado ali čokoladnim namazom.',
    ingredients: [
      {
        name: 'Pšenična moka',
        amount: '250 g',
        searchKeyword: 'moka',
        category: 'shramba'
      },
      {
        name: 'Sveže mleko 3.5%',
        amount: '500 ml',
        searchKeyword: 'mleko',
        category: 'mlecno'
      },
      {
        name: 'Jajca hlevske reje',
        amount: '3 kos',
        searchKeyword: 'jajca',
        category: 'mlecno'
      },
      {
        name: 'Maslo za peko',
        amount: '30 g',
        searchKeyword: 'maslo',
        category: 'mlecno'
      },
      {
        name: 'Domača marelična marmelada',
        amount: '200 g',
        searchKeyword: 'marmelada',
        category: 'shramba'
      }
    ],
    steps: [
      'V skledi z metlico razžvrkljamo jajca, mleko in ščepec soli.',
      'Postopoma dodajamo presejano moko in mešamo, da nastane gladka masa brez grudic.',
      'Pustimo počivati 10 minut, nato po potrebi dodamo brizg mineralne vode za zračnost.',
      'Na tanko namaščeni ponvi z obeh strani spečemo zlate palačinke.',
      'Namažemo z marelično marmelado ali lešnikovim namazom, zvijemo in potresemo s sladkorjem.'
    ]
  },
  {
    keywords: ['tuna', 'solata', 'tuncina', 'mediteranska solata'],
    title: 'Hrustljava solata s tuno in jajcem',
    prepTime: '20 min',
    servings: 3,
    category: 'mediteranska',
    emoji: '🥗',
    description: 'Lahka, osvežilna in beljakovinsko bogata solata z zrnasto koruzo in oljčnim prelivom.',
    ingredients: [
      {
        name: 'Sveža solata kristalka ali motovilec',
        amount: '200 g',
        searchKeyword: 'solata',
        category: 'sadje-zelenjava'
      },
      {
        name: 'Tuna v oljčnem olju',
        amount: '2 konzervi (160 g)',
        searchKeyword: 'tuna',
        category: 'shramba'
      },
      {
        name: 'Jajca',
        amount: '4 kos',
        searchKeyword: 'jajca',
        category: 'mlecno'
      },
      {
        name: 'Sladka koruza v zrnju',
        amount: '1 pločevinka (280 g)',
        searchKeyword: 'koruza',
        category: 'shramba'
      },
      {
        name: 'Češnjev paradižnik',
        amount: '250 g',
        searchKeyword: 'paradiznik',
        category: 'sadje-zelenjava'
      },
      {
        name: 'Ekstra deviško oljčno olje',
        amount: '3 žlice',
        searchKeyword: 'oljcno olje',
        category: 'shramba'
      }
    ],
    steps: [
      'Jajca skuhamo v trdo (cca. 9 minut), jih ohladimo v mrzli vodi, olupimo in razrežemo na četrtinke.',
      'Solato operemo in osušimo ter položimo v veliko skledo.',
      'Češnjeve paradižnike razpolovimo ter jih dodamo solati skupaj s koruzo.',
      'Dodamo odcejene koščke tune in kuhana jajca.',
      'Začinimo s soljo, poprom, balzamičnim kisom ter oljčnim oljem in nežno premešamo.'
    ]
  }
];

/**
 * Razčleni niz količine (npr. "500 g", "3 kos", "400 ml") na številko in enoto.
 */
export function parseAmount(amountStr = '') {
  if (!amountStr) return { quantity: '1', unit: 'kos' };
  const str = String(amountStr).trim();
  const match = str.match(/^([\d.,]+)\s*(.*)$/);
  if (match) {
    return {
      quantity: match[1].replace(',', '.'),
      unit: match[2].trim() || 'kos'
    };
  }
  return { quantity: '1', unit: str };
}

/**
 * Normalizira recept iz katerega koli vira (Gemini API ali lokalni AI) v standardno obliko aplikacije.
 */
export function normalizeRecipeData(raw, source = 'gemini') {
  const prepTimeStr = raw.prepTime || '30 min';
  const cookTimeNum = parseInt(prepTimeStr) || 30;
  const servingsNum = parseInt(raw.servings) || 4;

  const stepsList = Array.isArray(raw.steps) 
    ? raw.steps 
    : (Array.isArray(raw.instructions) ? raw.instructions : [raw.instructions || 'Pripravi in postrezi.']);

  const ingredientsList = (raw.ingredients || []).map(ing => {
    const { quantity, unit } = parseAmount(ing.amount || `${ing.quantity || ''} ${ing.unit || ''}`);
    const searchKeyword = ing.searchKeyword || ing.keyword || ing.name.toLowerCase().replace(/[^a-z0-9]/gi, ' ').trim();
    return {
      name: ing.name,
      amount: ing.amount || `${quantity} ${unit}`,
      quantity: ing.quantity || quantity,
      unit: ing.unit || unit,
      searchKeyword,
      keyword: searchKeyword,
      category: ing.category || 'ostalo'
    };
  });

  return {
    id: `rec-ai-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    title: raw.title || 'Nov recept',
    subtitle: raw.description || raw.subtitle || `${prepTimeStr} • ${servingsNum} porcije`,
    description: raw.description || raw.subtitle || '',
    prepTime: prepTimeStr,
    cookTime: cookTimeNum,
    servings: servingsNum,
    cuisine: raw.category || raw.cuisine || 'slovenska',
    emoji: raw.emoji || getEmojiForDish(raw.title, raw.category),
    ingredients: ingredientsList,
    instructions: stepsList,
    steps: stepsList,
    dietaryFlags: raw.dietaryFlags || [],
    source: source, // 'gemini' | 'offline_ai'
    isAiGenerated: true,
    createdAt: new Date().toISOString()
  };
}

/**
 * Dodelitev privzetega emojija glede na naslov ali kategorijo jedi
 */
function getEmojiForDish(title = '', category = '') {
  const t = title.toLowerCase();
  const c = category.toLowerCase();

  if (t.includes('pica') || t.includes('pizza')) return '🍕';
  if (t.includes('curry') || t.includes('kari') || t.includes('rižot')) return '🍛';
  if (t.includes('juha') || t.includes('enolončnic')) return '🍲';
  if (t.includes('špaget') || t.includes('testen') || t.includes('makaron')) return '🍝';
  if (t.includes('palačink') || t.includes('peciv')) return '🥞';
  if (t.includes('solat')) return '🥗';
  if (t.includes('riba') || t.includes('losos') || t.includes('tuna')) return '🐟';
  if (t.includes('zrezek') || t.includes('meso') || t.includes('golaž') || t.includes('pečenk')) return '🥩';
  if (t.includes('burger')) return '🍔';
  if (t.includes('tortilj') || t.includes('taco')) return '🌮';
  if (c.includes('azijska')) return '🥢';
  if (c.includes('italijanska')) return '🍝';
  return '🍳';
}

/**
 * Optimizira sestavine po slovenskih trgovinah glede na kataloge (deals)
 */
export function optimizeRecipeIngredientsWithDeals(ingredients = [], deals = []) {
  let totalWithDeals = 0;
  let totalRegular = 0;
  let dealsMatchedCount = 0;
  const storeCounts = {};

  const analyzedIngredients = ingredients.map(ing => {
    // Poišči najboljšo ponudbo z iskalno ključno besedo ali imenom
    const searchWord = ing.searchKeyword || ing.name;
    const match = findBestDeal(searchWord, deals);
    const bestDeal = match?.bestDeal || null;

    if (bestDeal) {
      dealsMatchedCount++;
      const price = bestDeal.discountPrice || 0;
      const regular = bestDeal.regularPrice || price;
      totalWithDeals += price;
      totalRegular += regular;

      storeCounts[bestDeal.store] = (storeCounts[bestDeal.store] || 0) + 1;

      return {
        ...ing,
        bestDeal,
        matchedStore: bestDeal.store,
        discountPrice: bestDeal.discountPrice,
        regularPrice: bestDeal.regularPrice,
        discountPercentage: bestDeal.discountPercentage,
        savings: (regular - price) > 0 ? (regular - price) : 0,
        hasDeal: true
      };
    }

    // Ocenjena cena za artikle, ki niso v katalogu
    const estimatedPrice = 1.20;
    totalWithDeals += estimatedPrice;
    totalRegular += estimatedPrice;

    return {
      ...ing,
      bestDeal: null,
      matchedStore: null,
      discountPrice: null,
      regularPrice: null,
      savings: 0,
      hasDeal: false
    };
  });

  // Najdi trgovino z največ ugodnostmi
  let topStore = null;
  let maxCount = 0;
  Object.entries(storeCounts).forEach(([store, count]) => {
    if (count > maxCount) {
      maxCount = count;
      topStore = store;
    }
  });

  const totalSavings = Math.max(0, totalRegular - totalWithDeals);

  return {
    analyzedIngredients,
    dealsMatchedCount,
    totalEstimatedCost: totalWithDeals,
    totalSavings,
    topStore,
    storeBreakdown: storeCounts
  };
}

/**
 * Pametni lokalni generator receptov (če ni na voljo interneta ali Gemini ključa)
 */
function generateOfflineSmartRecipe({ query, servings = 4, maxTime = null }) {
  const q = (query || '').toLowerCase().trim();

  // 1. Poskusi najti ujemajoč predpripravljen recept
  const found = FALLBACK_RECIPES.find(r => 
    r.keywords.some(k => q.includes(k) || k.includes(q))
  );

  if (found) {
    const scale = (servings || 4) / (found.servings || 4);
    const scaledIngredients = found.ingredients.map(ing => {
      const { quantity, unit } = parseAmount(ing.amount);
      const val = parseFloat(quantity);
      if (!isNaN(val) && scale !== 1) {
        const scaledVal = Math.round(val * scale * 10) / 10;
        return {
          ...ing,
          amount: `${scaledVal} ${unit}`
        };
      }
      return ing;
    });

    return normalizeRecipeData({
      ...found,
      servings: servings || found.servings,
      prepTime: maxTime ? `${maxTime} min` : found.prepTime,
      ingredients: scaledIngredients
    }, 'offline_ai');
  }

  // 2. Dinamično ustvari nov pametni recept po meri
  const titleCap = query.trim().charAt(0).toUpperCase() + query.trim().slice(1);
  return normalizeRecipeData({
    title: titleCap,
    prepTime: maxTime ? `${maxTime} min` : '35 min',
    servings: servings || 4,
    category: 'slovenska',
    description: `Okusna domača jed "${titleCap}", pripravljena z ljubeznijo in svežimi sestavinami za ${servings} oseb.`,
    ingredients: [
      {
        name: 'Glavna sestavina za ' + titleCap,
        amount: `${servings * 125} g`,
        searchKeyword: q.split(' ')[0] || 'meso',
        category: 'meso'
      },
      {
        name: 'Krompir ali riž za prilogo',
        amount: `${servings * 150} g`,
        searchKeyword: 'krompir',
        category: 'sadje-zelenjava'
      },
      {
        name: 'Čebula in česen',
        amount: '2 kos',
        searchKeyword: 'cebula',
        category: 'sadje-zelenjava'
      },
      {
        name: 'Oljčno olje ali maslo',
        amount: '3 žlice',
        searchKeyword: 'olje',
        category: 'shramba'
      },
      {
        name: 'Sol, poper in sveža zelišča',
        amount: '1 ščepec',
        searchKeyword: 'sol',
        category: 'shramba'
      }
    ],
    steps: [
      `Glavne sestavine za jed "${titleCap}" očistimo in narežemo na primerne kose.`,
      'V ponvi na maščobi popražimo čebulo do zlate barve in dodamo začimbe.',
      'Dodamo glavne sestavine in na zmernem ognju kuhamo ali pečemo približno 20 minut.',
      'Posebej pripravimo prilogo (krompir, riž ali testenine) po navodilih.',
      'Pred postrežbo jed začinimo z zelišči in ponudimo toplo.'
    ]
  }, 'offline_ai');
}

/**
 * GLAVNA IZVOZNA FUNKCIJA:
 * Poišče ali generira recept z Google Gemini Flash API ter izvede optimizacijo trgovin.
 */
export async function searchOrGenerateRecipeWithAi({
  query,
  servings = 4,
  maxTime = null,
  dietaryPreference = null
}) {
  if (!query || !query.trim()) {
    throw new Error('Prosimo, vpišite ime jedi ali idejo za kuhanje.');
  }

  // Preveri, ali obstaja shranjen Gemini API ključ
  const apiKey = localStorage.getItem('nakupki_gemini_key') || 
    (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_GEMINI_API_KEY : null);

  // Če ni API ključa, takoj uporabi lokalni pametni AI kulinarični asistent
  if (!apiKey || apiKey.trim() === '') {
    // Dodaj kratek zamik za realistično izkušnjo
    await new Promise(res => setTimeout(res, 600));
    return generateOfflineSmartRecipe({ query, servings, maxTime });
  }

  // Sestavi poziv (prompt) za Google Gemini model
  const systemPrompt = `Si vrhunski kuharski chef in kulinarični strokovnjak za pripravo hrane v Sloveniji.
Tvoja naloga je ustvariti popoln družinski recept za jed: "${query.trim()}".
Število porcij: ${servings} oseb.
${maxTime ? `Čas priprave mora biti pod ${maxTime} minut.` : 'Predvidi realen čas priprave v minutah.'}
${dietaryPreference ? `Upoštevaj prehransko preferenco: ${dietaryPreference}.` : ''}

Recept mora vsebovati točne sestavine, primerne za nakup v slovenskih trgovinah (Spar, Lidl, Hofer, Mercator, Eurospin, Tuš).
Ključna beseda "searchKeyword" mora biti preprosta splošna beseda v slovenščini v ednini (npr. "piscancji file", "kokosovo mleko", "spageti", "krompir", "mleto meso", "sir").

ODGOVORI IZKLJUČNO Z VELJAVNIM JSON OBJEKTOM V NASLEDNJI OBLIKI (brez markdown besedila ali pojasnil zunaj JSON-a):
{
  "title": "Kremni piščančji curry z rižem",
  "prepTime": "35 min",
  "servings": ${servings},
  "category": "azijska",
  "emoji": "🍛",
  "description": "Bogat in aromatičen curry s kokosovim mlekom in svežo zelenjavo.",
  "ingredients": [
    {
      "name": "Piščančji file",
      "amount": "500 g",
      "searchKeyword": "piscancji file",
      "category": "meso"
    },
    {
      "name": "Kokosovo mleko",
      "amount": "400 ml",
      "searchKeyword": "kokosovo mleko",
      "category": "shramba"
    },
    {
      "name": "Basmati riž",
      "amount": "300 g",
      "searchKeyword": "basmati riz",
      "category": "shramba"
    }
  ],
  "steps": [
    "Piščanca narežemo na koščke in na hitro popečemo...",
    "Dodamo zelenjavo, zalijemo s kokosovim mlekom in dušimo 15 min..."
  ]
}`;

  try {
    // Klic uradnega Gemini REST endpointa
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey.trim()}`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [
          {
            parts: [{ text: systemPrompt }]
          }
        ],
        generationConfig: {
          temperature: 0.6,
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      console.warn('Gemini API klic neuspešen, status:', response.status);
      return generateOfflineSmartRecipe({ query, servings, maxTime });
    }

    const data = await response.json();
    const textOutput = data?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textOutput) {
      return generateOfflineSmartRecipe({ query, servings, maxTime });
    }

    // Očisti morebitne markdown ```json oklepaje
    let cleanJson = textOutput.trim();
    if (cleanJson.startsWith('```json')) {
      cleanJson = cleanJson.replace(/^```json\s*/, '').replace(/```\s*$/, '');
    } else if (cleanJson.startsWith('```')) {
      cleanJson = cleanJson.replace(/^```\s*/, '').replace(/```\s*$/, '');
    }

    const parsed = JSON.parse(cleanJson);
    return normalizeRecipeData(parsed, 'gemini');

  } catch (err) {
    console.warn('Napaka pri klicu Gemini API, preklapljam na lokalnega asistenta:', err);
    return generateOfflineSmartRecipe({ query, servings, maxTime });
  }
}
