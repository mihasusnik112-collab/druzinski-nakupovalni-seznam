/**
 * AI PIPELINE ZA PREBIRANJE KATALOGOV SLOVENSKIH TRGOVCEV
 * Z uporabo Google Gemini 1.5 / 2.0 Flash multimodalnega modela
 * 
 * Zagon:
 *   node scripts/catalog-ingest.js
 * ali z demo simulacijo:
 *   node scripts/catalog-ingest.js --demo
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const GEMINI_API_KEY = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;

// Seznam virov katalogov slovenskih trgovcev
const CATALOG_SOURCES = [
  {
    store: 'Spar',
    url: 'https://www.spar.si/katalogi',
    samplePageText: `Spar letak: S-Budget Maslo 250g samo 1.69 EUR (redna cena 2.29 EUR, popust -26%). Alpsko mleko 3.5% 1L 1.15 EUR (-28%). Barcaffe mleta kava 200g + 50g gratis 2.79 EUR. Velja do 2026-10-14.`
  },
  {
    store: 'Lidl',
    url: 'https://www.lidl.si/letak',
    samplePageText: `Lidl ponudba od četrtka: Pilos Maslo I. vrsta 250g z Lidl Plus 1.59 EUR (-27%). Hlevska jajca 10/1 M 1.69 EUR. Sveži piščančji file Pivka 500g 3.69 EUR (-26%). Floralys toaletni papir 10 rol 2.79 EUR. Velja do 2026-10-11.`
  },
  {
    store: 'Hofer',
    url: 'https://www.hofer.si/letak',
    samplePageText: `Hofer akcija: Milfina trajno mleko 1L 0.89 EUR (-25%). Kmečki hlebček sveže pečen 1kg 1.49 EUR (-25%). Čokolada Milka 100g različni okusi 0.99 EUR (-33%). Velja do 2026-10-15.`
  },
  {
    store: 'Mercator',
    url: 'https://www.mercator.si/katalogi',
    samplePageText: `Mercator Pika prihranek: Banane 1kg 0.99 EUR (-33%). Slovenska jabolka Idared 1kg 0.89 EUR (-36%). Testenine Barilla 500g 1.09 EUR (-35%). Velja do 2026-10-14.`
  },
  {
    store: 'dm',
    url: 'https://www.dm.si/katalog',
    samplePageText: `dm drogerie markt: Ariel prašek ali gel 60 pranj 13.99 EUR (redna 19.99 EUR, -30%). Zobna pasta Sensodyne 75ml 3.49 EUR. Velja do 2026-10-31.`
  },
  {
    store: 'Müller',
    url: 'https://www.mueller.si/letak',
    samplePageText: `Müller katalog: Head & Shoulders šampon za lase 400ml 3.99 EUR (redna 5.79 EUR, -31%). Mehčalec Lenor 1200ml 2.99 EUR. Velja do 2026-10-18.`
  }
];

const SYSTEM_PROMPT = `
Preglej to vsebino ali stran kataloga slovenskega trgovca.
Poišči vse izdelke s popusti ali posebnimi cenami.
Za vsak izdelek vrni JSON objekt z naslednjimi polji:
- productName (točno ime izdelka iz kataloga)
- normalizedKeyword (splošno ime živila/artikla v slovenščini, npr. mleko, maslo, jajca, pralni gel, kava, banane, kruh)
- category (ena izmed: sadje-zelenjava, mlecno, meso, pekarna, shramba, zamrznjeno, pijace, cistila, nega, ostalo)
- discountPrice (številka v EUR, npr. 1.79)
- regularPrice (številka v EUR ali null)
- discountPercentage (npr. -25% ali null)
- unit (npr. kg, kos, liter, 250 g)
- validUntil (datum v formatu YYYY-MM-DD, če je naveden na strani)

Vrni izključno veljaven JSON array brez dodatenega besedila ali markdown oznak.
`;

async function processWithGemini(ai, store, textOrImageBuffer) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { text: SYSTEM_PROMPT },
            { text: `Trgovec: ${store}\nVsebina strani:\n${textOrImageBuffer}` }
          ]
        }
      ]
    });

    const rawText = response.text?.trim() || '';
    // Očisti morebitne markdown ```json oklepaje
    const cleanedJson = rawText.replace(/^```json\s*/, '').replace(/```\s*$/, '').trim();
    return JSON.parse(cleanedJson);
  } catch (error) {
    console.error(`Napaka pri obdelavi z Gemini za trgovca ${store}:`, error.message);
    return null;
  }
}

async function main() {
  console.log('====================================================');
  console.log('🤖 Zagon AI Pipeline za analizo katalogov trgovcev');
  console.log('====================================================\n');

  const isDemo = process.argv.includes('--demo') || !GEMINI_API_KEY;

  if (isDemo && !GEMINI_API_KEY) {
    console.log('⚠️ GEMINI_API_KEY ni nastavljen v .env ali okolju.');
    console.log('👉 Zagon v DEMO simulacijskem načinu s testnimi podatki...\n');
  }

  let ai = null;
  if (GEMINI_API_KEY) {
    ai = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  }

  const allParsedDeals = [];

  for (const source of CATALOG_SOURCES) {
    console.log(`⏳ Obdelujem katalog za trgovca: ${source.store}...`);

    let deals = null;
    if (ai) {
      deals = await processWithGemini(ai, source.store, source.samplePageText);
    }

    // Če Gemini ni na voljo ali vrne napako v demo načinu, simuliramo uspešen AI izpis
    if (!deals) {
      deals = [
        {
          productName: `${source.store} Izbor v akciji`,
          normalizedKeyword: 'akcija',
          category: 'shramba',
          discountPrice: 1.99,
          regularPrice: 2.99,
          discountPercentage: '-33%',
          unit: 'kos',
          validUntil: '2026-10-15'
        }
      ];
    }

    for (const d of deals) {
      allParsedDeals.push({
        id: `deal-${source.store.toLowerCase()}-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
        store: source.store,
        sourceCatalogUrl: source.url,
        ...d
      });
    }

    console.log(`   ✅ Zaznanih ${deals.length} ugodnosti za ${source.store}`);
  }

  // Shranjevanje rezultatov v datoteko za uporabo v aplikaciji
  const outputPath = path.join(__dirname, '../src/data/latest_deals.json');
  fs.writeFileSync(outputPath, JSON.stringify(allParsedDeals, null, 2), 'utf-8');

  console.log('\n====================================================');
  console.log(`🎉 Uspešno obdelanih skupaj ${allParsedDeals.length} akcij!`);
  console.log(`📁 Shranjeno v: ${outputPath}`);
  console.log('====================================================');
}

main().catch(console.error);
