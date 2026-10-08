# Pametni družinski nakupovalni seznam z analizo akcij slovenskih trgovcev

Sodobna, odzivna mobilna spletna aplikacija (**PWA - Progressive Web App**) za skupno družinsko rabo z avtomatsko primerjavo artiklov z znižanji pri slovenskih trgovcih (**Spar, Lidl, Hofer, Mercator, dm, Müller**) preko **Google Gemini AI**.

---

## 🚀 Ključne funkcionalnosti

1. **Mobilno optimiziran nakupovalni seznam (PWA):**
   - Dodajanje na domači zaslon (iOS Safari / Android Chrome) kot prava mobilna aplikacija.
   - Gladko delovanje brez povezave (offline caching z Workbox/Vite PWA).
   - Horizontalni filter kategorij (Sadje & Zelenjava, Mlečni izdelki, Meso, Pekarna, Shramba, Čistila, itd.).
   - Hitri predlogi pogostih živil s klikom in bližnjice za količino (+1, +2, kg, l, kos).

2. **Družinska sinhronizacija v realnem času:**
   - Podpora za **Firebase Firestore** z `onSnapshot` za takojšnjo posodobitev seznama med telefoni vseh družinskih članov.
   - Prikaz kdo je dodal kateri artikel (Mami, Oče, Miha, Anja, Babica, Deda).
   - Samodejni lokalni način (localStorage + BroadcastChannel), ki deluje takoj brez predhodne konfiguracije!

3. **Pametno ujemanje z akcijami trgovcev (Fuzzy Matching):**
   - Samodejno odstranjevanje šumnikov (č, š, ž) in merskih enot (kg, l, kos, 500g).
   - Iskanje najboljše akcije med trgovci (npr. ob vnosu "maslo" samodejno pripne zeleno značko *"Lidl: 1.59 € (-27%)"*).
   - Klik na značko odpre primerjavo cen med trgovci (Spar, Lidl, Hofer, Mercator...).
   - Izračun skupnega potencialnega družinskega prihranka.

4. **Zaslon "Katalogi & Akcije":**
   - Pregled vseh aktualnih popustov po posameznih trgovcih z njihovimi logotipi in prepoznavnimi barvami.
   - Gumb *"Dodaj na seznam"* neposredno iz akcije z enim klikom.

5. **AI Pipeline za prebiranje katalogov (`scripts/catalog-ingest.js`):**
   - Uporablja **Google Gemini Flash** multimodalni model za strukturiran izpis artiklov, znižanih cen in popustov iz slik ter PDF letakov.

---

## 🛠️ Zagon aplikacije

### 1. Zagon lokalnega razvojnega strežnika:
```bash
npm run dev
```
Aplikacija bo dostopna na lokalnem naslovu (npr. `http://localhost:5173`).

### 2. Zagon AI zajema katalogov (Gemini):
```bash
npm run ingest
```

### 3. Zgradba produkcijske verzije (PWA):
```bash
npm run build
```

---

## ⚙️ Povezava s Firebase

V aplikaciji kliknite na ikono **Nastavitve (⚙️)** v zgornjem desnem kotu:
- Vnesite vašo Firebase konfiguracijo (JSON ali API Key / Project ID).
- Kliknite **"Naloži testne akcije v bazo"** za takojšnje polnjenje zbirke `catalog_deals` v vaš Firestore.
