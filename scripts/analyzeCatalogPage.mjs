import { GoogleGenAI, Type } from '@google/genai';
import * as fs from 'fs';
import * as path from 'path';
import dotenv from 'dotenv';

dotenv.config();

// Pridobi AI klienta (leno inicializiran, da ne sproža opozoril ob uvozu)
function getAiClient() {
  const apiKey = process.env.GEMINI_API_KEY || process.env.VITE_GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY ni nastavljen v okoljskih spremenljivkah ali .env datoteki.');
  }
  return new GoogleGenAI({ apiKey });
}

// 2. Sistemski poziv (System Prompt) za Gemini API
export const SYSTEM_PROMPT = `Si strokovni analitik za zajem podatkov iz maloprodajnih katalogov slovenskih trgovcev (Spar, Lidl, Hofer, Mercator, dm, Müller).
Tvoja naloga je natančna vizualna analiza predložene strani kataloga in pretvorba vseh akcijskih artiklov v strukturiran JSON format.

PRAVILA ZA KLASIFIKACIJO:
1. "tier" (Kakovostni razred):
   - "budget": Lastne diskontne znamke trgovcev:
     * Spar: S-Budget, Pittinger (pivo), DESPAR.
     * Lidl: Combino (testenine), Argus & Perlenbacher (pivo), Pilos (mlečno), Cien (nega), W5 (čistila), Pikok (mesnine).
     * Hofer: Cucina Nobile (testenine), Bergkönig (pivo), Milfina (mlečno), Tandil (čistila).
     * Mercator: Lastna znamka Mercator, Lumpi (otroško).
     * Tuš: Tuš znamka, Taft (pivo).
     * Eurospin: Tre Mulini (testenine/moka), Best Bräu (pivo), Land (mlečno), Dexal (čistila).
   - "brand": Priznane uveljavljene domače ali tuje blagovne znamke (npr. Ljubljanske mlekarne, Mu, Barcaffè, Argeta, Poli, Ariel, Somat, Nivea, Laško, Union, Barilla).
   - "premium_local": Ekološki/bio izdelki, zaščiteni tradicionalni izdelki ter linije domačih pridelovalcev (npr. Spar Natur*pur, Bio Zone, Bio Natura, Naša nam paše, Okusi domačega kraja, Slovenska potica).

2. "origin" in certifikati:
   - Če je na embalaži ali ob izdelku slovenska zastava, napis "Slovenski izdelek", "Poreklo: Slovenija" ali oznaka "Izbrana kakovost Slovenija", označi isLocal: true in origin: "Slovenija".
   - V polje "badges" navedi prepoznane simbole (npr. "Izbrana kakovost Slovenija", "EU Bio listek", "Brez GSO", "Vegansko").

3. "unitPrice" (Cena na primerljivo enoto):
   - Vedno preračunaj ceno na osnovno metrično enoto: €/kg za trdne snovi, €/l za tekočine, €/pranje za pralna sredstva, €/kos za tablete ali kose.

4. "normalizedKeyword":
   - Enotna, splošna slovenska beseda v ednini v malih črkah (npr. "mleko", "maslo", "jajca", "kava", "pralni prasek", "sir"), ki omogoča samodejno primerjavo z nakupovalnim seznamom.

ODGOVOR:
Vrni izključno veljaven JSON objekt v skladu z zahtevano shemo, brez dodatnega komentarja ali markdown ovojnice zunaj JSON-a.`;

// 1. JSON shema posameznega artikla v katalogu
export const dealItemSchema = {
  type: Type.OBJECT,
  properties: {
    productName: { type: Type.STRING, description: "Polno ime artikla iz letaka" },
    brand: { type: Type.STRING, description: "Znamka artikla ali proizvajalec" },
    category: { 
      type: Type.STRING, 
      enum: ["produce", "dairy", "meat", "bakery", "pantry", "frozen", "beverages", "hygiene", "household"] 
    },
    normalizedKeyword: { type: Type.STRING, description: "Splošna ključna beseda v slovenščini (npr. maslo, mleko)" },
    discountPrice: { type: Type.NUMBER, description: "Akcijska cena v EUR" },
    regularPrice: { type: Type.NUMBER, nullable: true, description: "Redna cena v EUR pred popustom" },
    discountPercentage: { type: Type.STRING, nullable: true, description: "Odstotek popusta, npr. -30%" },
    packageQuantity: { type: Type.STRING, description: "Količina pakiranja, npr. 250 ali 1" },
    packageUnit: { type: Type.STRING, description: "Enota pakiranja, npr. g, kg, l, ml, pranj" },
    unitPrice: { type: Type.NUMBER, description: "Izračunana cena na kg ali liter v EUR" },
    unitPriceMetric: { 
      type: Type.STRING, 
      description: "Enota preračuna, npr. eur_per_kg, eur_per_l, eur_per_kos, eur_per_wash",
      nullable: true 
    },
    tier: { 
      type: Type.STRING, 
      enum: ["budget", "brand", "premium_local"],
      description: "Kakovostni razred artikla" 
    },
    origin: { type: Type.STRING, description: "Država porekla, npr. Slovenija ali Neznano" },
    isLocal: { type: Type.BOOLEAN, description: "Ali je artikel slovenskega porekla" },
    isBio: { type: Type.BOOLEAN, description: "Ali ima eko/bio certifikat" },
    badges: { 
      type: Type.ARRAY, 
      items: { type: Type.STRING },
      description: "Seznam zaznanih oznak (npr. Izbrana kakovost Slovenija)" 
    },
    validFrom: { type: Type.STRING, nullable: true },
    validTo: { type: Type.STRING, nullable: true }
  },
  required: ["productName", "normalizedKeyword", "discountPrice", "unitPrice", "tier", "isLocal", "isBio"]
};

// Polna shema za celotno stran ali katalog trgovca
export const catalogPageSchema = {
  type: Type.OBJECT,
  properties: {
    store: { 
      type: Type.STRING, 
      description: "Trgovina: Spar | Lidl | Hofer | Mercator | dm | Müller" 
    },
    catalogWeek: { 
      type: Type.STRING, 
      description: "Teden veljavnosti kataloga, npr. 2026-W41" 
    },
    items: {
      type: Type.ARRAY,
      items: dealItemSchema,
      description: "Seznam vseh prepoznanih artiklov v akciji"
    }
  },
  required: ["store", "catalogWeek", "items"]
};

/**
 * 3. Node.js izvedbena funkcija za analizo slike strani kataloga z Google Gemini Flash
 * @param {string} imagePath - Pot do slikovne datoteke (JPEG ali PNG)
 * @param {string} storeName - Ime trgovca (npr. Lidl, Spar, Hofer, Mercator, dm, Müller)
 * @param {string} [catalogWeek] - Oznaka tedna (npr. 2026-W41)
 * @returns {Promise<Object>} Strukturiran JSON objekt z artikli
 */
export async function processCatalogImage(imagePath, storeName, catalogWeek = '2026-W41') {
  if (!fs.existsSync(imagePath)) {
    throw new Error(`Slika kataloga ne obstaja na poti: ${imagePath}`);
  }

  const ai = getAiClient();
  const imageBuffer = fs.readFileSync(imagePath);
  const base64Image = imageBuffer.toString('base64');
  const ext = path.extname(imagePath).toLowerCase();
  const mimeType = ext === '.png' ? 'image/png' : 'image/jpeg';

  const response = await ai.models.generateContent({
    model: 'gemini-1.5-flash',
    contents: [
      {
        role: 'user',
        parts: [
          {
            text: `${SYSTEM_PROMPT}\n\nAnaliziraj to stran kataloga za trgovino ${storeName} (teden: ${catalogWeek}). Izlušči vse izdelke v akciji s pripadajočimi podatki o cenah, blagovni znamki, poreklu in kakovostnem razredu.`
          },
          {
            inlineData: {
              mimeType,
              data: base64Image
            }
          }
        ]
      }
    ],
    config: {
      responseMimeType: 'application/json',
      responseSchema: catalogPageSchema
    }
  });

  const parsed = JSON.parse(response.text);
  return parsed;
}

// Zagon preko ukazne vrstice (CLI)
if (process.argv[1] && process.argv[1].endsWith('analyzeCatalogPage.mjs')) {
  const [, , cliImagePath, cliStore, cliWeek] = process.argv;

  if (cliImagePath && cliStore) {
    console.log(`🤖 Začenjam multimodalno analizo za ${cliStore} (${cliImagePath})...`);
    processCatalogImage(cliImagePath, cliStore, cliWeek || '2026-W41')
      .then((result) => {
        console.log('✅ Rezultat analize:');
        console.log(JSON.stringify(result, null, 2));
      })
      .catch((err) => {
        console.error('❌ Napaka pri analizi:', err.message);
      });
  } else {
    console.log('ℹ️ Uporaba: node scripts/analyzeCatalogPage.mjs <pot-do-slike> <trgovec> [teden]');
    console.log('ℹ️ Primer: node scripts/analyzeCatalogPage.mjs ./slike/lidl_stran1.jpg Lidl 2026-W41');
  }
}
