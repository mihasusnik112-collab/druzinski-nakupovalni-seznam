import { 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  query, 
  orderBy,
  getDocs,
  setDoc,
  where
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';
import { DEFAULT_CATALOG_DEALS } from '../data/defaultDeals';
import { INITIAL_CATEGORIES } from '../data/initialCategories';
import { DEFAULT_FAMILY_MEMBERS } from '../data/commonItems';
import { DEFAULT_FAMILIES, generateFamilyId } from '../data/defaultFamilies';
import { DEFAULT_RECIPES } from '../data/defaultRecipes';
import { normalizeText, findBestDeal } from '../utils/fuzzyMatch';
import { detectBrandAndStore } from '../utils/brandSuggestions';
import { parseQuantityAndUnit, normalizeUnit, calculateTotalItemPrice } from '../utils/quantityHelper';

// Ključi za lokalno shrambo
const LOCAL_STORAGE_ITEMS_KEY = 'nakupki_items_v2';
const LOCAL_STORAGE_DEALS_KEY = 'nakupki_deals_v2';
const LOCAL_STORAGE_MEMBERS_KEY = 'nakupki_members_v2';
const LOCAL_STORAGE_ACTIVE_USER_KEY = 'nakupki_active_user_v2';
const LOCAL_STORAGE_ACTIVE_SESSION_KEY = 'nakupki_active_session_v2';
const LOCAL_STORAGE_HISTORY_KEY = 'nakupki_history_v2';
const LOCAL_STORAGE_FREQUENCIES_KEY = 'nakupki_frequencies_v2';
const LOCAL_STORAGE_FAMILIES_KEY = 'nakupki_families_v2';
const LOCAL_STORAGE_ACTIVE_FAMILY_ID_KEY = 'nakupki_active_family_id_v2';
const LOCAL_STORAGE_RECIPES_KEY = 'nakupki_recipes_v2';

const broadcastChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('nakupki_sync_bus') : null;

// Privzeta družina ID
const DEFAULT_FAMILY_ID = 'Susnik-4102';

// Začetne pogoste bližnjice
const DEFAULT_INITIAL_FREQUENCIES = [
  { normalizedKeyword: 'mleko', title: 'Mleko', emoji: '🥛', count: 5, category: 'mlecno', preferredBrand: 'Alpsko mleko', familyId: DEFAULT_FAMILY_ID },
  { normalizedKeyword: 'kruh', title: 'Kruh', emoji: '🥖', count: 4, category: 'pekarna', preferredBrand: 'Žito Jelen', familyId: DEFAULT_FAMILY_ID },
  { normalizedKeyword: 'banane', title: 'Banane', emoji: '🍌', count: 3, category: 'sadje-zelenjava', preferredBrand: 'Bio Banane', familyId: DEFAULT_FAMILY_ID },
  { normalizedKeyword: 'kava', title: 'Kava', emoji: '☕', count: 3, category: 'shramba', preferredBrand: 'Barcaffè', familyId: DEFAULT_FAMILY_ID },
  { normalizedKeyword: 'pivo', title: 'Pivo', emoji: '🍺', count: 2, category: 'pijace', preferredBrand: 'Laško Zlatorog', familyId: DEFAULT_FAMILY_ID },
  { normalizedKeyword: 'jajca', title: 'Jajca', emoji: '🥚', count: 2, category: 'mlecno', preferredBrand: 'Jata Emona', familyId: DEFAULT_FAMILY_ID },
  { normalizedKeyword: 'maslo', title: 'Maslo', emoji: '🧈', count: 2, category: 'mlecno', preferredBrand: 'Pilos maslo', familyId: DEFAULT_FAMILY_ID }
];

// Začetna zgodovina nakupov za prikaz
const DEFAULT_INITIAL_HISTORY = [
  {
    id: 'hist-sample-1',
    familyId: DEFAULT_FAMILY_ID,
    userId: 'user-1',
    userName: 'Miha',
    userAvatar: '👨',
    storeName: 'Spar',
    completedAt: Date.now() - 86400000 * 2, // 2 dni nazaj
    itemsCount: 4,
    totalSpent: 14.85,
    totalSaved: 4.10,
    items: [
      { itemId: 'h1-1', title: 'Alpsko mleko 3.5%', price: 1.15, regularPrice: 1.59, savings: 0.44, quantity: '2 l', category: 'mlecno', selectedTier: 'brand' },
      { itemId: 'h1-2', title: 'Barcaffè Classic', price: 2.79, regularPrice: 3.89, savings: 1.10, quantity: '250 g', category: 'shramba', selectedTier: 'brand' },
      { itemId: 'h1-3', title: 'S-Budget Maslo', price: 1.69, regularPrice: 2.29, savings: 0.60, quantity: '250 g', category: 'mlecno', selectedTier: 'budget' },
      { itemId: 'h1-4', title: 'Kruh Krjavelj', price: 1.89, regularPrice: 2.49, savings: 0.60, quantity: '1 kg', category: 'pekarna', selectedTier: 'brand' }
    ]
  },
  {
    id: 'hist-sample-2',
    familyId: DEFAULT_FAMILY_ID,
    userId: 'user-2',
    userName: 'Veronika',
    userAvatar: '👩',
    storeName: 'Lidl',
    completedAt: Date.now() - 86400000 * 5, // 5 dni nazaj
    itemsCount: 3,
    totalSpent: 8.77,
    totalSaved: 2.85,
    items: [
      { itemId: 'h2-1', title: 'Pilos Maslo I. vrsta', price: 1.59, regularPrice: 2.19, savings: 0.60, quantity: '250 g', category: 'mlecno', selectedTier: 'budget' },
      { itemId: 'h2-2', title: 'Hlevska jajca 10/1', price: 1.69, regularPrice: 2.29, savings: 0.60, quantity: '1 pak.', category: 'mlecno', selectedTier: 'budget' },
      { itemId: 'h2-3', title: 'Pilos Sir Edamec', price: 1.99, regularPrice: 2.89, savings: 0.90, quantity: '400 g', category: 'mlecno', selectedTier: 'budget' }
    ]
  }
];

// Začetni vzorčni artikli z avtorstvom in kakovostnimi razredi
const DEFAULT_INITIAL_ITEMS = [
  {
    id: 'sample-1',
    familyId: DEFAULT_FAMILY_ID,
    title: 'Mleko',
    category: 'mlecno',
    quantity: '2 l',
    completed: false,
    addedByUserId: 'user-2',
    addedByName: 'Veronika',
    addedByAvatar: '👩',
    selectedTier: 'brand',
    matchedDealId: 'deal-spar-mleko-brand',
    createdAt: Date.now() - 3600000,
  },
  {
    id: 'sample-2',
    familyId: DEFAULT_FAMILY_ID,
    title: 'Kruh',
    category: 'pekarna',
    quantity: '1 hlebček',
    completed: false,
    addedByUserId: 'user-1',
    addedByName: 'Miha',
    addedByAvatar: '👨',
    selectedTier: 'budget',
    matchedDealId: 'deal-hofer-kruh-budget',
    createdAt: Date.now() - 7200000,
  },
  {
    id: 'sample-3',
    familyId: DEFAULT_FAMILY_ID,
    title: 'Banane',
    category: 'sadje-zelenjava',
    quantity: '1 kg',
    completed: true,
    addedByUserId: 'user-3',
    addedByName: 'Domen',
    addedByAvatar: '👦',
    selectedTier: 'budget',
    matchedDealId: 'deal-mercator-banane-budget',
    createdAt: Date.now() - 10800000,
  }
];

/**
 * ========================================================
 * 1. MULTI-DRUŽINSKA IZOLACIJA PODATKOV (MULTI-TENANCY)
 * ========================================================
 */

export function getLocalFamilies() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_FAMILIES_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_FAMILIES_KEY, JSON.stringify(DEFAULT_FAMILIES));
      return DEFAULT_FAMILIES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_FAMILIES;
  } catch (err) {
    console.error('Napaka pri branju družin:', err);
    return DEFAULT_FAMILIES;
  }
}

export function saveLocalFamilies(families) {
  try {
    localStorage.setItem(LOCAL_STORAGE_FAMILIES_KEY, JSON.stringify(families));
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'FAMILIES_UPDATED', families });
    }
  } catch (err) {
    console.error('Napaka pri shranjevanju družin:', err);
  }
}

export function getActiveFamilyId() {
  try {
    const id = localStorage.getItem(LOCAL_STORAGE_ACTIVE_FAMILY_ID_KEY);
    if (id) return id;
  } catch {}
  return DEFAULT_FAMILY_ID;
}

export function getActiveFamily() {
  const families = getLocalFamilies();
  const currentId = getActiveFamilyId();
  const found = families.find(f => f.familyId === currentId);
  return found || families[0] || DEFAULT_FAMILIES[0];
}

export function setActiveFamily(familyId) {
  const families = getLocalFamilies();
  const target = families.find(f => f.familyId === familyId);
  if (!target) return false;

  localStorage.setItem(LOCAL_STORAGE_ACTIVE_FAMILY_ID_KEY, familyId);
  // Posodobi tudi lokalne člane in aktivnega uporabnika
  saveFamilyMembers(target.members || []);
  if (target.members && target.members.length > 0) {
    saveLocalActiveUser(target.members[0]);
  }

  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'FAMILY_SWITCHED', familyId, family: target });
  }
  return true;
}

export function updateActiveFamily(updatedData) {
  const families = getLocalFamilies();
  const currentId = getActiveFamilyId();
  const updatedFamilies = families.map(f => {
    if (f.familyId === currentId) {
      return { ...f, ...updatedData };
    }
    return f;
  });

  saveLocalFamilies(updatedFamilies);

  // Če so posodobljeni člani, posodobi tudi globalno
  if (updatedData.members) {
    saveFamilyMembers(updatedData.members);
  }

  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'FAMILY_UPDATED', family: updatedFamilies.find(f => f.familyId === currentId) });
  }

  return getActiveFamily();
}

// Ključi za trajno prijavo
export const LOCAL_STORAGE_ACTIVE_FAMILY_SESSION_KEY = 'nakupki_active_family_session_v2';

export function getActiveFamilySession() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ACTIVE_FAMILY_SESSION_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && parsed.familyId) return parsed;
    }
  } catch (err) {
    console.error('Napaka pri branju seje:', err);
  }
  return null;
}

export function saveActiveFamilySession(sessionData) {
  try {
    localStorage.setItem(LOCAL_STORAGE_ACTIVE_FAMILY_SESSION_KEY, JSON.stringify(sessionData));
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'SESSION_CHANGED', session: sessionData });
    }
  } catch (err) {
    console.error('Napaka pri shranjevanju seje:', err);
  }
}

export function clearActiveFamilySession() {
  try {
    localStorage.removeItem(LOCAL_STORAGE_ACTIVE_FAMILY_SESSION_KEY);
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'SESSION_CHANGED', session: null });
    }
  } catch (err) {
    console.error('Napaka pri odjavi seje:', err);
  }
}

/**
 * Preveri ali je družina skrbnik (Sušnik z admin PIN-om)
 */
export function isFamilyAdmin(family) {
  if (!family) return false;
  const surname = (family.familySurname || family.familyName || '').toLowerCase();
  return surname.includes('sušnik') || surname.includes('susnik') || family.isAdmin === true;
}

/**
 * Preveri prijavo družine s priimkom in 4-mestnim PIN-om
 */
export function loginFamilyByPin(surname, pin) {
  const cleanSurname = surname.trim().toLowerCase()
    .replace(/^družina\s+/i, '')
    .replace(/^druzina\s+/i, '')
    .trim();
  const cleanPin = pin.trim();

  const families = getLocalFamilies();

  // Poišči družino po priimku ali imenu
  const found = families.find(f => {
    const fn = (f.familySurname || f.familyName || '').toLowerCase()
      .replace(/^družina\s+/i, '')
      .replace(/^druzina\s+/i, '')
      .trim();
    return fn === cleanSurname || f.familyId.toLowerCase().includes(cleanSurname);
  });

  if (!found) {
    return {
      success: false,
      message: `Družine s priimkom "${surname}" nismo našli. Preverite črkovanje ali ustvarite novo družino.`
    };
  }

  // Preveri PIN kodo (privzeto 1234 za obstoječe ali nastavljen PIN)
  const expectedPin = found.pin || '1234';
  if (cleanPin !== expectedPin) {
    return {
      success: false,
      message: 'Napačna PIN koda! Poskusite znova.'
    };
  }

  // Uspešna prijava: shrani trajno sejo
  const session = {
    familyId: found.familyId,
    familyName: found.familyName,
    familySurname: found.familySurname || found.familyName,
    isAdmin: isFamilyAdmin(found),
    loginTime: Date.now()
  };

  saveActiveFamilySession(session);
  setActiveFamily(found.familyId);

  return {
    success: true,
    family: found,
    isAdmin: session.isAdmin
  };
}

export function updateFamilyPin(familyId, newPin) {
  const families = getLocalFamilies();
  const updated = families.map(f => f.familyId === familyId ? { ...f, pin: newPin } : f);
  saveLocalFamilies(updated);
  return true;
}

export function createFamily({ familyName, pin = '1234', members = [], preferences = {} }) {
  const cleanSurname = familyName.replace(/^družina\s+/i, '').replace(/^druzina\s+/i, '').trim() || familyName.trim();
  const { familyId, joinCode } = generateFamilyId(cleanSurname);
  const isAdmin = cleanSurname.toLowerCase() === 'sušnik' || cleanSurname.toLowerCase() === 'susnik';

  const newFamily = {
    familyId,
    familyName: familyName.trim().startsWith('Družina') ? familyName.trim() : `Družina ${familyName.trim()}`,
    familySurname: cleanSurname,
    joinCode,
    pin: pin || '1234',
    isAdmin,
    members: members.length > 0 ? members : [
      { id: 'user_' + Date.now(), name: 'Skrbnik', birthYear: 1990, avatar: '👨', role: 'admin', color: '#10b981', preference: 'best_value' }
    ],
    preferences: {
      favoriteStores: preferences.favoriteStores || ['spar', 'lidl', 'hofer'],
      cuisines: preferences.cuisines || ['slovenska', 'italijanska'],
      dietaryFlags: preferences.dietaryFlags || ['lokalno_slo'],
      stapleItems: preferences.stapleItems || ['Mleko', 'Kruh', 'Jajca']
    },
    onboardingCompleted: true,
    createdAt: Date.now()
  };

  const families = getLocalFamilies();
  const updated = [...families, newFamily];
  saveLocalFamilies(updated);
  
  // Takoj prijavi
  const session = {
    familyId: newFamily.familyId,
    familyName: newFamily.familyName,
    familySurname: newFamily.familySurname,
    isAdmin: newFamily.isAdmin,
    loginTime: Date.now()
  };
  saveActiveFamilySession(session);
  setActiveFamily(familyId);

  return newFamily;
}

export function joinFamilyByCode(joinCode) {
  const clean = joinCode.trim();
  const families = getLocalFamilies();
  const found = families.find(f => 
    (f.joinCode && f.joinCode.toLowerCase() === clean.toLowerCase()) || 
    f.familyId.toLowerCase() === clean.toLowerCase()
  );

  if (found) {
    const session = {
      familyId: found.familyId,
      familyName: found.familyName,
      familySurname: found.familySurname || found.familyName,
      isAdmin: isFamilyAdmin(found),
      loginTime: Date.now()
    };
    saveActiveFamilySession(session);
    setActiveFamily(found.familyId);
    return { success: true, family: found };
  }
  return { success: false, message: 'Družine s to kodo nismo našli!' };
}

export function subscribeActiveFamily(callback) {
  callback(getActiveFamily());

  const handleBroadcast = (event) => {
    if (event.data?.type === 'FAMILY_SWITCHED' || event.data?.type === 'FAMILY_UPDATED' || event.data?.type === 'FAMILIES_UPDATED') {
      callback(getActiveFamily());
    }
  };

  const handleStorage = (event) => {
    if (event.key === LOCAL_STORAGE_ACTIVE_FAMILY_ID_KEY || event.key === LOCAL_STORAGE_FAMILIES_KEY) {
      callback(getActiveFamily());
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }
  window.addEventListener('storage', handleStorage);

  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcast);
    }
    window.removeEventListener('storage', handleStorage);
  };
}

/**
 * ========================================================
 * 2. ZANESLJIVA LOKALNA SHRAMBA ZA SEZNAM (Z IZOLACIJO PO DRUŽINI)
 * ========================================================
 */

export function getAllLocalItemsRaw() {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_ITEMS_KEY);
    if (!data) {
      localStorage.setItem(LOCAL_STORAGE_ITEMS_KEY, JSON.stringify(DEFAULT_INITIAL_ITEMS));
      return DEFAULT_INITIAL_ITEMS;
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) ? parsed : DEFAULT_INITIAL_ITEMS;
  } catch (err) {
    console.error('Napaka pri branju iz localStorage:', err);
    return DEFAULT_INITIAL_ITEMS;
  }
}

/**
 * Normalizira artikel tako, da ima vedno structured quantity, unit, displayQuantity in totalItemPrice
 */
export function normalizeItemQuantity(item) {
  if (!item) return item;
  let q = item.quantity;
  let u = item.unit;
  let disp = item.displayQuantity;

  if (typeof q !== 'number' || !u || !disp) {
    const parsed = parseQuantityAndUnit(q, item.category, item.title);
    q = typeof q === 'number' ? q : parsed.quantity;
    u = u || parsed.unit;
    disp = disp || `${q} ${u}`;
  }

  const p = typeof item.price === 'number' ? item.price : null;
  const totalItemPrice = p !== null ? calculateTotalItemPrice(p, q) : null;

  return {
    ...item,
    quantity: q,
    unit: u,
    displayQuantity: disp,
    totalItemPrice: totalItemPrice
  };
}

export function getLocalItems(familyId = null) {
  const targetFamilyId = familyId || getActiveFamilyId();
  const allItems = getAllLocalItemsRaw();
  // Združljivost za nazaj: artikli brez familyId pripadajo DEFAULT_FAMILY_ID
  return allItems
    .filter(item => (item.familyId || DEFAULT_FAMILY_ID) === targetFamilyId)
    .map(normalizeItemQuantity);
}

export function saveLocalItems(items, familyId = null) {
  try {
    const targetFamilyId = familyId || getActiveFamilyId();
    const allItems = getAllLocalItemsRaw();
    
    // Obdrži artikle vseh ostalih družin, posodobi le artikle trenutne družine
    const otherFamiliesItems = allItems.filter(item => (item.familyId || DEFAULT_FAMILY_ID) !== targetFamilyId);
    const taggedItems = items.map(item => ({
      ...item,
      familyId: targetFamilyId
    }));
    
    const combined = [...taggedItems, ...otherFamiliesItems];
    localStorage.setItem(LOCAL_STORAGE_ITEMS_KEY, JSON.stringify(combined));

    // Obvesti naročnike v istem oknu
    notifyLocalItemListeners();

    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'ITEMS_UPDATED', items: taggedItems, familyId: targetFamilyId });
    }
  } catch (err) {
    console.error('Napaka pri shranjevanju v localStorage:', err);
  }
}

export function getLocalDeals() {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_DEALS_KEY);
    if (!data) {
      localStorage.setItem(LOCAL_STORAGE_DEALS_KEY, JSON.stringify(DEFAULT_CATALOG_DEALS));
      return DEFAULT_CATALOG_DEALS;
    }
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_CATALOG_DEALS;
  } catch {
    return DEFAULT_CATALOG_DEALS;
  }
}

export function saveLocalDeals(deals) {
  try {
    localStorage.setItem(LOCAL_STORAGE_DEALS_KEY, JSON.stringify(deals));
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'DEALS_UPDATED', deals });
    }
  } catch (err) {
    console.error('Napaka pri shranjevanju akcij:', err);
  }
}

export function getLocalMembers() {
  const activeFamily = getActiveFamily();
  if (activeFamily && Array.isArray(activeFamily.members) && activeFamily.members.length > 0) {
    return activeFamily.members;
  }
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_MEMBERS_KEY);
    if (data) {
      const parsed = JSON.parse(data);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch {}
  return DEFAULT_FAMILY_MEMBERS;
}

export function saveFamilyMembers(members) {
  try {
    localStorage.setItem(LOCAL_STORAGE_MEMBERS_KEY, JSON.stringify(members));
    
    // Posodobi tudi v aktivni družini
    const activeFamily = getActiveFamily();
    if (activeFamily) {
      const families = getLocalFamilies();
      const updated = families.map(f => f.familyId === activeFamily.familyId ? { ...f, members } : f);
      saveLocalFamilies(updated);
    }

    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'MEMBERS_UPDATED', members });
    }

    if (isFirebaseConfigured && db) {
      setDoc(doc(db, 'settings', 'family_members'), { members }, { merge: true }).catch(err => {
        console.warn('Firestore shranjevanje članov opozorilo:', err);
      });
    }
  } catch (err) {
    console.error('Napaka pri shranjevanju članov:', err);
  }
}

export function getLocalActiveUser() {
  try {
    const data = localStorage.getItem(LOCAL_STORAGE_ACTIVE_USER_KEY);
    if (data) {
      return JSON.parse(data);
    }
  } catch (e) {}
  const members = getLocalMembers();
  return members[0] || DEFAULT_FAMILY_MEMBERS[0];
}

export function saveLocalActiveUser(user) {
  try {
    localStorage.setItem(LOCAL_STORAGE_ACTIVE_USER_KEY, JSON.stringify(user));
  } catch (e) {}
}

// Lokalni naročniki v istem oknu za takojšnjo reaktivnost
const itemListeners = new Set();

export function notifyLocalItemListeners() {
  const currentItems = getLocalItems();
  itemListeners.forEach(listener => {
    try {
      listener(currentItems);
    } catch (err) {
      console.warn('Napaka v item listenerju:', err);
    }
  });
}

/**
 * NAROČANJE NA POSODOBITVE ARTIKLOV (Real-time sync)
 */
export function subscribeShoppingList(callback) {
  itemListeners.add(callback);
  callback(getLocalItems());

  let unsubscribeFirestore = null;

  if (isFirebaseConfigured && db) {
    try {
      const familyId = getActiveFamilyId();
      const q = query(
        collection(db, 'shopping_list'), 
        where('familyId', '==', familyId),
        orderBy('createdAt', 'desc')
      );
      unsubscribeFirestore = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toMillis ? doc.data().createdAt.toMillis() : (doc.data().createdAt || Date.now())
        }));
        saveLocalItems(items, familyId);
        callback(items);
      }, (err) => {
        console.warn('Firestore onSnapshot opozorilo, uporaba lokalne shrambe:', err);
        callback(getLocalItems());
      });
    } catch (e) {
      console.warn('Napaka pri Firestore povezavi:', e);
    }
  }

  const handleBroadcast = (event) => {
    if (event.data?.type === 'ITEMS_UPDATED' || event.data?.type === 'FAMILY_SWITCHED') {
      callback(getLocalItems());
    }
  };

  const handleStorage = (event) => {
    if (event.key === LOCAL_STORAGE_ITEMS_KEY || event.key === LOCAL_STORAGE_ACTIVE_FAMILY_ID_KEY) {
      callback(getLocalItems());
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }
  window.addEventListener('storage', handleStorage);

  return () => {
    itemListeners.delete(callback);
    if (typeof unsubscribeFirestore === 'function') {
      unsubscribeFirestore();
    }
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcast);
    }
    window.removeEventListener('storage', handleStorage);
  };
}

/**
 * DODAJANJE ARTIKLA (Takojšnje trajno shranjevanje)
 */
export async function addShoppingItem({ 
  title, 
  category, 
  quantity, 
  unit = null,
  displayQuantity = null,
  totalItemPrice = null,
  price = null,
  savings = null,
  store = null,
  addedByUserId = null,
  addedByName = null,
  addedByAvatar = null,
  selectedTier = null,
  matchedDealId = null,
  familyId = null
}) {
  const activeUser = getLocalActiveUser();
  const currentFamilyId = familyId || getActiveFamilyId();

  // Samodejno prepoznavanje lastne trgovske znamke, če trgovina ali cena nista določeni
  let resolvedStore = store;
  let resolvedPrice = price ? Number(price) : null;
  let resolvedTier = selectedTier;
  let resolvedCategory = category;
  let resolvedQuantity = quantity;

  const detected = detectBrandAndStore(title);
  if (detected) {
    if (!resolvedStore) resolvedStore = detected.store;
    if (resolvedPrice === null && detected.price) resolvedPrice = detected.price;
    if (!resolvedTier) resolvedTier = detected.tier || 'budget';
    if ((!resolvedCategory || resolvedCategory === 'ostalo') && detected.category) resolvedCategory = detected.category;
    if ((!resolvedQuantity || resolvedQuantity === '1 kos') && detected.defaultUnit) resolvedQuantity = detected.defaultUnit;
  }
  
  const parsed = parseQuantityAndUnit(resolvedQuantity, resolvedCategory, title);
  const numQuantity = typeof quantity === 'number' && !isNaN(quantity) ? quantity : parsed.quantity;
  const itemUnit = unit ? normalizeUnit(unit, resolvedCategory, title) : parsed.unit;
  const dispQuantity = displayQuantity || `${numQuantity} ${itemUnit}`;
  const calcTotal = totalItemPrice !== null && totalItemPrice !== undefined
    ? Number(totalItemPrice)
    : (resolvedPrice !== null ? calculateTotalItemPrice(resolvedPrice, numQuantity) : null);

  const newItem = {
    id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    familyId: currentFamilyId,
    title: title.trim(),
    category: resolvedCategory || 'ostalo',
    quantity: numQuantity,
    unit: itemUnit,
    displayQuantity: dispQuantity,
    price: resolvedPrice,
    totalItemPrice: calcTotal,
    savings: savings ? Number(savings) : 0,
    store: resolvedStore || null,
    completed: false,
    addedByUserId: addedByUserId || activeUser.id,
    addedByName: addedByName || activeUser.name,
    addedByAvatar: addedByAvatar || activeUser.avatar,
    selectedTier: resolvedTier || null,
    matchedDealId: matchedDealId || null,
    hasCouponApplied: false,
    couponTitle: null,
    createdAt: Date.now()
  };

  // Zabeleži pogostost artikla za pametne bližnjice družine
  recordItemUsage({ title: newItem.title, category: newItem.category, familyId: currentFamilyId });

  // 1. Nemudoma shrani lokalno v localStorage
  const currentItems = getLocalItems(currentFamilyId);
  const updatedItems = [newItem, ...currentItems];
  saveLocalItems(updatedItems, currentFamilyId);

  // 2. Če je na voljo Firestore, pošlji tudi v oblak
  if (isFirebaseConfigured && db) {
    try {
      const docRef = await addDoc(collection(db, 'shopping_list'), {
        ...newItem,
        createdAt: serverTimestamp()
      });
      const finalItems = updatedItems.map(i => i.id === newItem.id ? { ...i, id: docRef.id } : i);
      saveLocalItems(finalItems, currentFamilyId);
      return { ...newItem, id: docRef.id };
    } catch (err) {
      console.warn('Oblačno shranjevanje artikla neuspešno, ohranjeno lokalno:', err);
    }
  }

  return newItem;
}

/**
 * SPREMEMBA STATUSA (Kljukica / Kupljeno)
 */
export async function toggleItemStatus(itemId, currentStatus) {
  const newStatus = !currentStatus;
  const currentFamilyId = getActiveFamilyId();

  const localItems = getLocalItems(currentFamilyId);
  const updated = localItems.map(item => 
    item.id === itemId ? { 
      ...item, 
      completed: newStatus, 
      completedAt: newStatus ? Date.now() : null 
    } : item
  );
  saveLocalItems(updated, currentFamilyId);

  if (isFirebaseConfigured && db) {
    try {
      const itemRef = doc(db, 'shopping_list', itemId);
      await updateDoc(itemRef, {
        completed: newStatus,
        completedAt: newStatus ? serverTimestamp() : null
      });
    } catch (err) {
      console.warn('Firestore posodobitev statusa neuspešna:', err);
    }
  }

  return newStatus;
}

/**
 * POSODOBITEV ARTIKLA
 */
export async function updateShoppingItem(itemId, fields) {
  const currentFamilyId = getActiveFamilyId();
  const localItems = getLocalItems(currentFamilyId);
  const updated = localItems.map(item => {
    if (item.id !== itemId) return item;
    const merged = { ...item, ...fields };
    if ('quantity' in fields || 'price' in fields || 'unit' in fields) {
      const q = typeof merged.quantity === 'number' ? merged.quantity : (parseFloat(String(merged.quantity).replace(',', '.')) || 1);
      const u = merged.unit || 'kom';
      const p = typeof merged.price === 'number' ? merged.price : null;
      merged.quantity = q;
      merged.unit = u;
      merged.displayQuantity = `${q} ${u}`;
      merged.totalItemPrice = p !== null ? calculateTotalItemPrice(p, q) : null;
    }
    return merged;
  });
  saveLocalItems(updated, currentFamilyId);

  if (isFirebaseConfigured && db) {
    try {
      const itemRef = doc(db, 'shopping_list', itemId);
      await updateDoc(itemRef, fields);
    } catch (err) {
      console.warn('Firestore update error:', err);
    }
  }

  return true;
}

/**
 * HITRA POSODOBITEV KOLIČINE ARTIKLA (+/-)
 */
export async function updateItemQuantity(itemId, newQuantity, newUnit = null) {
  const currentFamilyId = getActiveFamilyId();
  const localItems = getLocalItems(currentFamilyId);
  const item = localItems.find(i => i.id === itemId);
  if (!item) return false;

  const q = Number(newQuantity);
  if (isNaN(q) || q <= 0) {
    return deleteShoppingItem(itemId);
  }

  const roundedQ = item.unit === 'kg' || item.unit === 'l' ? Number(q.toFixed(2)) : Math.round(q);
  const u = newUnit || item.unit || 'kom';
  const p = typeof item.price === 'number' ? item.price : null;
  const totalItemPrice = p !== null ? calculateTotalItemPrice(p, roundedQ) : null;

  return updateShoppingItem(itemId, {
    quantity: roundedQ,
    unit: u,
    displayQuantity: `${roundedQ} ${u}`,
    totalItemPrice: totalItemPrice
  });
}

/**
 * IZBRIS ARTIKLA
 */
export async function deleteShoppingItem(itemId) {
  try {
    const allItems = getAllLocalItemsRaw();
    // Neposredno izbriši artikel po ID-ju iz celotne lokalne shrambe
    const updatedRaw = allItems.filter(item => item.id !== itemId);
    localStorage.setItem(LOCAL_STORAGE_ITEMS_KEY, JSON.stringify(updatedRaw));

    // Obvesti poslušalce v istem oknu/tabu
    notifyLocalItemListeners();

    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'ITEMS_UPDATED', itemId });
    }

    if (isFirebaseConfigured && db) {
      deleteDoc(doc(db, 'shopping_list', itemId)).catch(err => {
        console.warn('Firestore delete error:', err);
      });
    }

    return true;
  } catch (err) {
    console.error('Napaka pri izbrisu artikla:', err);
    return false;
  }
}

/**
 * POČISTI VSE KUPLJENO
 */
export async function clearAllCompletedItems() {
  try {
    const currentFamilyId = getActiveFamilyId();
    const allItems = getAllLocalItemsRaw();
    // Odstrani vse artikle trenutne družine, ki so completed === true
    const updatedRaw = allItems.filter(item => {
      const itemFamId = item.familyId || DEFAULT_FAMILY_ID;
      if (itemFamId === currentFamilyId && item.completed) {
        return false;
      }
      return true;
    });

    localStorage.setItem(LOCAL_STORAGE_ITEMS_KEY, JSON.stringify(updatedRaw));
    notifyLocalItemListeners();

    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'ITEMS_UPDATED', familyId: currentFamilyId });
    }

    if (isFirebaseConfigured && db) {
      try {
        const q = query(collection(db, 'shopping_list'), where('familyId', '==', currentFamilyId));
        const snap = await getDocs(q);
        const deletePromises = [];
        snap.forEach(d => {
          if (d.data().completed) {
            deletePromises.push(deleteDoc(doc(db, 'shopping_list', d.id)));
          }
        });
        await Promise.all(deletePromises);
      } catch (err) {
        console.warn('Firestore clear error:', err);
      }
    }

    return true;
  } catch (err) {
    console.error('Napaka pri brisanju kupljenega:', err);
    return false;
  }
}


/**
 * NAROČANJE NA KATALOG AKCIJ (Skupna baza za vse)
 */
export function subscribeCatalogDeals(callback) {
  callback(getLocalDeals());

  let unsubFirestore = null;
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, 'catalog_deals'));
      unsubFirestore = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const deals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          saveLocalDeals(deals);
          callback(deals);
        } else {
          callback(getLocalDeals());
        }
      }, (err) => {
        console.warn('Firestore deals error, using local:', err);
        callback(getLocalDeals());
      });
    } catch (e) {
      console.warn('Firestore catalog init error:', e);
    }
  }

  const handleBroadcast = (event) => {
    if (event.data?.type === 'DEALS_UPDATED') {
      callback(event.data.deals);
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }

  return () => {
    if (typeof unsubFirestore === 'function') unsubFirestore();
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcast);
    }
  };
}

/**
 * NAROČANJE NA DRUŽINSKE ČLANE
 */
export function subscribeFamilyMembers(callback) {
  callback(getLocalMembers());

  const handleBroadcast = (event) => {
    if (event.data?.type === 'MEMBERS_UPDATED' || event.data?.type === 'FAMILY_SWITCHED' || event.data?.type === 'FAMILY_UPDATED') {
      callback(getLocalMembers());
    }
  };

  const handleStorage = (event) => {
    if (event.key === LOCAL_STORAGE_MEMBERS_KEY || event.key === LOCAL_STORAGE_ACTIVE_FAMILY_ID_KEY) {
      callback(getLocalMembers());
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }
  window.addEventListener('storage', handleStorage);

  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcast);
    }
    window.removeEventListener('storage', handleStorage);
  };
}

/**
 * Naloži začetne akcije v Firestore
 */
export async function seedDealsToFirestore() {
  if (!isFirebaseConfigured || !db) return false;
  try {
    for (const deal of DEFAULT_CATALOG_DEALS) {
      await setDoc(doc(db, 'catalog_deals', deal.id), deal, { merge: true });
    }
    return true;
  } catch (e) {
    console.error('Napaka pri nalaganju začetnih akcij v Firestore:', e);
    return false;
  }
}

/**
 * ========================================================
 * 3. AKTIVNA NAKUPOVALNA SEJA (ACTIVE SESSION)
 * ========================================================
 */

export function getLocalActiveSession() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_ACTIVE_SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch (err) {
    console.error('Napaka pri branju aktivne seje:', err);
    return null;
  }
}

export function saveLocalActiveSession(session) {
  try {
    if (!session) {
      localStorage.removeItem(LOCAL_STORAGE_ACTIVE_SESSION_KEY);
    } else {
      localStorage.setItem(LOCAL_STORAGE_ACTIVE_SESSION_KEY, JSON.stringify(session));
    }
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'SESSION_UPDATED', session });
    }
  } catch (err) {
    console.error('Napaka pri shranjevanju aktivne seje:', err);
  }
}

export function clearLocalActiveSession() {
  saveLocalActiveSession(null);
}

/**
 * ========================================================
 * 4. ZGODOVINA NAKUPOV (PURCHASE HISTORY) - IZOLACIJA PO DRUŽINI
 * ========================================================
 */

export function getAllLocalHistoryRaw() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_HISTORY_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(DEFAULT_INITIAL_HISTORY));
      return DEFAULT_INITIAL_HISTORY;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_INITIAL_HISTORY;
  } catch (err) {
    console.error('Napaka pri branju zgodovine nakupov:', err);
    return DEFAULT_INITIAL_HISTORY;
  }
}

export function getLocalPurchaseHistory(familyId = null) {
  const targetFamilyId = familyId || getActiveFamilyId();
  const allHistory = getAllLocalHistoryRaw();
  return allHistory.filter(h => (h.familyId || DEFAULT_FAMILY_ID) === targetFamilyId);
}

export function saveLocalPurchaseHistory(history, familyId = null) {
  try {
    const targetFamilyId = familyId || getActiveFamilyId();
    const allHistory = getAllLocalHistoryRaw();
    const otherHistory = allHistory.filter(h => (h.familyId || DEFAULT_FAMILY_ID) !== targetFamilyId);
    
    const tagged = history.map(h => ({ ...h, familyId: targetFamilyId }));
    const combined = [...tagged, ...otherHistory];
    
    localStorage.setItem(LOCAL_STORAGE_HISTORY_KEY, JSON.stringify(combined));
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'HISTORY_UPDATED', history: tagged, familyId: targetFamilyId });
    }
  } catch (err) {
    console.error('Napaka pri shranjevanju zgodovine nakupov:', err);
  }
}

export function deletePurchaseHistoryItem(historyId) {
  const currentFamilyId = getActiveFamilyId();
  const current = getLocalPurchaseHistory(currentFamilyId);
  const updated = current.filter(item => item.id !== historyId);
  saveLocalPurchaseHistory(updated, currentFamilyId);

  if (isFirebaseConfigured && db) {
    try {
      deleteDoc(doc(db, 'purchase_history', historyId)).catch(e => console.warn(e));
    } catch (e) {}
  }
  return updated;
}

export function clearAllPurchaseHistory() {
  const currentFamilyId = getActiveFamilyId();
  saveLocalPurchaseHistory([], currentFamilyId);
  return [];
}

/**
 * Zaključi sejo nakupa in arhivira kupljene artikle v zgodovino
 */
export async function archiveShoppingSession({
  session = null,
  completedItems = [],
  user = null,
  storeName = 'Splošno',
  totalSpent = 0,
  totalSaved = 0,
  familyId = null
}) {
  const currentFamilyId = familyId || getActiveFamilyId();
  
  const historyItem = {
    id: 'hist_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    familyId: currentFamilyId,
    userId: user?.id || session?.userId || 'user-1',
    userName: user?.name || session?.userName || 'Družinski član',
    userAvatar: user?.avatar || session?.userAvatar || '🧑',
    storeName: storeName || session?.storeName || 'Splošno',
    completedAt: Date.now(),
    itemsCount: completedItems.length,
    totalSpent: Number(Number(totalSpent).toFixed(2)) || 0,
    totalSaved: Number(Number(totalSaved).toFixed(2)) || 0,
    items: completedItems.map(item => ({
      itemId: item.id,
      title: item.title,
      price: Number(item.price) || 0,
      regularPrice: item.regularPrice ? Number(item.regularPrice) : null,
      savings: item.savings ? Number(item.savings) : 0,
      quantity: item.quantity || '1 kos',
      category: item.category || 'ostalo',
      selectedTier: item.selectedTier || null,
      store: item.store || storeName || null
    }))
  };

  // 1. Dodaj v lokalno zgodovino družine
  const currentHistory = getLocalPurchaseHistory(currentFamilyId);
  const updatedHistory = [historyItem, ...currentHistory];
  saveLocalPurchaseHistory(updatedHistory, currentFamilyId);

  // Zabeleži pogostost kupljenih artiklov
  for (const item of completedItems) {
    recordItemUsage({ title: item.title, category: item.category, familyId: currentFamilyId });
  }

  // 2. Počisti aktivno sejo
  clearLocalActiveSession();

  // 3. Počisti kupljene artikle iz aktivnega seznama
  const currentItems = getLocalItems(currentFamilyId);
  const remainingItems = currentItems.filter(i => !i.completed);
  saveLocalItems(remainingItems, currentFamilyId);

  // 4. Sinhroniziraj s Firestore, če je omogočen
  if (isFirebaseConfigured && db) {
    try {
      await addDoc(collection(db, 'purchase_history'), {
        ...historyItem,
        completedAt: serverTimestamp()
      });

      for (const item of completedItems) {
        deleteDoc(doc(db, 'shopping_list', item.id)).catch(e => console.warn(e));
      }
    } catch (err) {
      console.warn('Firestore shranjevanje zgodovine neuspešno, ohranjeno lokalno:', err);
    }
  }

  return { historyItem, remainingItems };
}

export function subscribePurchaseHistory(callback) {
  callback(getLocalPurchaseHistory());

  const handleBroadcast = (event) => {
    if (event.data?.type === 'HISTORY_UPDATED' || event.data?.type === 'FAMILY_SWITCHED') {
      callback(getLocalPurchaseHistory());
    }
  };

  const handleStorage = (event) => {
    if (event.key === LOCAL_STORAGE_HISTORY_KEY || event.key === LOCAL_STORAGE_ACTIVE_FAMILY_ID_KEY) {
      callback(getLocalPurchaseHistory());
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }
  window.addEventListener('storage', handleStorage);

  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcast);
    }
    window.removeEventListener('storage', handleStorage);
  };
}

/**
 * ========================================================
 * 5. POGOSTOST ARTIKLOV IN BLIŽNJICE (FREQUENCIES) - IZOLACIJA PO DRUŽINI
 * ========================================================
 */

export function getAllLocalFrequenciesRaw() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_FREQUENCIES_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_FREQUENCIES_KEY, JSON.stringify(DEFAULT_INITIAL_FREQUENCIES));
      return DEFAULT_INITIAL_FREQUENCIES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : DEFAULT_INITIAL_FREQUENCIES;
  } catch (err) {
    console.error('Napaka pri branju pogostosti artiklov:', err);
    return DEFAULT_INITIAL_FREQUENCIES;
  }
}

export function getLocalFrequencies(familyId = null) {
  const targetFamilyId = familyId || getActiveFamilyId();
  const allFreqs = getAllLocalFrequenciesRaw();
  return allFreqs.filter(f => (f.familyId || DEFAULT_FAMILY_ID) === targetFamilyId);
}

export function saveLocalFrequencies(frequencies, familyId = null) {
  try {
    const targetFamilyId = familyId || getActiveFamilyId();
    const allFreqs = getAllLocalFrequenciesRaw();
    const otherFreqs = allFreqs.filter(f => (f.familyId || DEFAULT_FAMILY_ID) !== targetFamilyId);
    
    const tagged = frequencies.map(f => ({ ...f, familyId: targetFamilyId }));
    const combined = [...tagged, ...otherFreqs];
    
    localStorage.setItem(LOCAL_STORAGE_FREQUENCIES_KEY, JSON.stringify(combined));
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'FREQUENCIES_UPDATED', frequencies: tagged, familyId: targetFamilyId });
    }
  } catch (err) {
    console.error('Napaka pri shranjevanju pogostosti artiklov:', err);
  }
}

export function recordItemUsage({ title, normalizedKeyword = null, brand = null, category = 'ostalo', emoji = null, familyId = null }) {
  if (!title) return;
  const kw = normalizedKeyword || normalizeText(title);
  if (!kw) return;

  const currentFamilyId = familyId || getActiveFamilyId();
  const current = getLocalFrequencies(currentFamilyId);
  const existingIdx = current.findIndex(f => f.normalizedKeyword === kw);

  const emojiMap = {
    mleko: '🥛', kruh: '🥖', banane: '🍌', maslo: '🧈', jajca: '🥚',
    kava: '☕', pivo: '🍺', sir: '🧀', cokolada: '🍫', jabolka: '🍎',
    meso: '🥩', testenine: '🍝', voda: '💧', cistila: '🧼', solata: '🥗', riž: '🍚'
  };

  const detectedEmoji = emoji || emojiMap[kw] || '🛒';

  let updated;
  if (existingIdx >= 0) {
    updated = [...current];
    updated[existingIdx] = {
      ...updated[existingIdx],
      count: (updated[existingIdx].count || 1) + 1,
      lastAdded: Date.now(),
      preferredBrand: brand || updated[existingIdx].preferredBrand || null,
      category: category || updated[existingIdx].category || 'ostalo',
      emoji: updated[existingIdx].emoji || detectedEmoji
    };
  } else {
    updated = [
      ...current,
      {
        familyId: currentFamilyId,
        normalizedKeyword: kw,
        title: title.trim(),
        emoji: detectedEmoji,
        count: 1,
        lastAdded: Date.now(),
        preferredBrand: brand || null,
        category: category || 'ostalo'
      }
    ];
  }

  updated.sort((a, b) => (b.count || 0) - (a.count || 0));
  saveLocalFrequencies(updated, currentFamilyId);
  return updated;
}

export function subscribeFrequencies(callback) {
  callback(getLocalFrequencies());

  const handleBroadcast = (event) => {
    if (event.data?.type === 'FREQUENCIES_UPDATED' || event.data?.type === 'FAMILY_SWITCHED') {
      callback(getLocalFrequencies());
    }
  };

  const handleStorage = (event) => {
    if (event.key === LOCAL_STORAGE_FREQUENCIES_KEY || event.key === LOCAL_STORAGE_ACTIVE_FAMILY_ID_KEY) {
      callback(getLocalFrequencies());
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }
  window.addEventListener('storage', handleStorage);

  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcast);
    }
    window.removeEventListener('storage', handleStorage);
  };
}

/**
 * ========================================================
 * 6. PAMETNA KUHARICA IN RECEPTI (RECIPES)
 * ========================================================
 */

export function getAllLocalRecipesRaw() {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_RECIPES_KEY);
    if (!raw) {
      localStorage.setItem(LOCAL_STORAGE_RECIPES_KEY, JSON.stringify(DEFAULT_RECIPES));
      return DEFAULT_RECIPES;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_RECIPES;
  } catch (err) {
    console.error('Napaka pri branju receptov:', err);
    return DEFAULT_RECIPES;
  }
}

export function getLocalRecipes(familyId = null) {
  const targetFamilyId = familyId || getActiveFamilyId();
  const allRecipes = getAllLocalRecipesRaw();
  // Vrnemo recepte, ki so bodisi ustvarjeni za to družino, bodisi skupni privzeti recepti
  return allRecipes.filter(r => !r.familyId || r.familyId === targetFamilyId || r.familyId === DEFAULT_FAMILY_ID);
}

export function saveLocalRecipes(recipes, familyId = null) {
  try {
    const targetFamilyId = familyId || getActiveFamilyId();
    const allRecipes = getAllLocalRecipesRaw();
    const otherRecipes = allRecipes.filter(r => r.familyId && r.familyId !== targetFamilyId && r.familyId !== DEFAULT_FAMILY_ID);
    
    const combined = [...recipes, ...otherRecipes];
    localStorage.setItem(LOCAL_STORAGE_RECIPES_KEY, JSON.stringify(combined));
    
    if (broadcastChannel) {
      broadcastChannel.postMessage({ type: 'RECIPES_UPDATED', recipes });
    }
  } catch (err) {
    console.error('Napaka pri shranjevanju receptov:', err);
  }
}

export function addRecipe(recipeData) {
  const targetFamilyId = getActiveFamilyId();
  const newRecipe = {
    ...recipeData,
    id: 'rec_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
    familyId: targetFamilyId,
    createdAt: Date.now()
  };

  const current = getLocalRecipes(targetFamilyId);
  const updated = [newRecipe, ...current];
  saveLocalRecipes(updated, targetFamilyId);
  return newRecipe;
}

export function updateRecipe(recipeId, fields) {
  const targetFamilyId = getActiveFamilyId();
  const current = getLocalRecipes(targetFamilyId);
  const updated = current.map(r => r.id === recipeId ? { ...r, ...fields } : r);
  saveLocalRecipes(updated, targetFamilyId);
  return true;
}

export function deleteRecipe(recipeId) {
  const targetFamilyId = getActiveFamilyId();
  const current = getLocalRecipes(targetFamilyId);
  const updated = current.filter(r => r.id !== recipeId);
  saveLocalRecipes(updated, targetFamilyId);
  return true;
}

export function subscribeRecipes(callback) {
  callback(getLocalRecipes());

  const handleBroadcast = (event) => {
    if (event.data?.type === 'RECIPES_UPDATED' || event.data?.type === 'FAMILY_SWITCHED') {
      callback(getLocalRecipes());
    }
  };

  const handleStorage = (event) => {
    if (event.key === LOCAL_STORAGE_RECIPES_KEY || event.key === LOCAL_STORAGE_ACTIVE_FAMILY_ID_KEY) {
      callback(getLocalRecipes());
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }
  window.addEventListener('storage', handleStorage);

  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcast);
    }
    window.removeEventListener('storage', handleStorage);
  };
}

/**
 * AVTOMATSKI UVOZ SESTAVIN RECEPTA NA NAKUPOVALNI SEZNAM
 */
export async function importRecipeIngredientsToShoppingList({ 
  recipe, 
  selectedIngredients = null, // array of ingredient objects or ingredient names
  preferredStore = null 
}) {
  if (!recipe || !Array.isArray(recipe.ingredients)) return [];

  const deals = getLocalDeals();
  const family = getActiveFamily();
  const user = getLocalActiveUser();
  const currentItems = getLocalItems();

  const toImport = selectedIngredients 
    ? recipe.ingredients.filter(ing => 
        selectedIngredients.includes(ing.name) || 
        selectedIngredients.some(s => typeof s === 'object' && s.name === ing.name)
      )
    : recipe.ingredients;

  const addedItems = [];

  for (const ing of toImport) {
    // Poišči najboljšo akcijo za sestavino
    const bestMatch = findBestDeal(ing.name || ing.keyword, deals, user?.preference || 'best_value');
    const matchedDeal = bestMatch?.bestDeal;

    const unitString = ing.quantity && ing.unit ? `${ing.quantity} ${ing.unit}` : (ing.unit || '1 kos');

    const added = await addShoppingItem({
      title: ing.name,
      category: ing.category || 'ostalo',
      quantity: unitString,
      price: matchedDeal?.discountPrice || null,
      savings: matchedDeal ? (matchedDeal.regularPrice - matchedDeal.discountPrice) : 0,
      store: preferredStore || matchedDeal?.store || null,
      selectedTier: matchedDeal?.tier || null,
      matchedDealId: matchedDeal?.id || null
    });

    addedItems.push(added);
  }

  return addedItems;
}
