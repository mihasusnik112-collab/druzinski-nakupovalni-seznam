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
  setDoc
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase';
import { DEFAULT_CATALOG_DEALS } from '../data/defaultDeals';
import { INITIAL_CATEGORIES } from '../data/initialCategories';
import { DEFAULT_FAMILY_MEMBERS } from '../data/commonItems';

const LOCAL_STORAGE_ITEMS_KEY = 'nakupki_items_v1';
const LOCAL_STORAGE_DEALS_KEY = 'nakupki_deals_v1';
const LOCAL_STORAGE_MEMBERS_KEY = 'nakupki_members_v1';
const broadcastChannel = typeof BroadcastChannel !== 'undefined' ? new BroadcastChannel('nakupki_sync_bus') : null;

// Začetni vzorčni artikli za prijeten prvi vtis
const DEFAULT_INITIAL_ITEMS = [
  {
    id: 'sample-1',
    title: 'Mleko',
    category: 'mlecno',
    quantity: '2 l',
    completed: false,
    addedBy: 'Mami',
    createdAt: Date.now() - 3600000,
  },
  {
    id: 'sample-2',
    title: 'Kruh hlebček',
    category: 'pekarna',
    quantity: '1 kos',
    completed: false,
    addedBy: 'Oče',
    createdAt: Date.now() - 7200000,
  },
  {
    id: 'sample-3',
    title: 'Banane',
    category: 'sadje-zelenjava',
    quantity: '1.5 kg',
    completed: true,
    addedBy: 'Miha',
    createdAt: Date.now() - 10800000,
  }
];

function getLocalItems() {
  const data = localStorage.getItem(LOCAL_STORAGE_ITEMS_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_ITEMS_KEY, JSON.stringify(DEFAULT_INITIAL_ITEMS));
    return DEFAULT_INITIAL_ITEMS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return DEFAULT_INITIAL_ITEMS;
  }
}

function saveLocalItems(items) {
  localStorage.setItem(LOCAL_STORAGE_ITEMS_KEY, JSON.stringify(items));
  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'ITEMS_UPDATED', items });
  }
}

function getLocalDeals() {
  const data = localStorage.getItem(LOCAL_STORAGE_DEALS_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_DEALS_KEY, JSON.stringify(DEFAULT_CATALOG_DEALS));
    return DEFAULT_CATALOG_DEALS;
  }
  try {
    return JSON.parse(data);
  } catch {
    return DEFAULT_CATALOG_DEALS;
  }
}

function saveLocalDeals(deals) {
  localStorage.setItem(LOCAL_STORAGE_DEALS_KEY, JSON.stringify(deals));
  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'DEALS_UPDATED', deals });
  }
}

/**
 * Naročanje na posodobitve nakupovalnega seznama v realnem času
 */
export function subscribeShoppingList(callback) {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, 'shopping_list'), orderBy('createdAt', 'desc'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        const items = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toMillis ? doc.data().createdAt.toMillis() : (doc.data().createdAt || Date.now())
        }));
        callback(items);
      }, (err) => {
        console.error('Firestore onSnapshot napaka, preklop na lokalno shrambo:', err);
        callback(getLocalItems());
      });
      return unsubscribe;
    } catch (e) {
      console.warn('Napaka pri Firestore poslušanju, uporaba lokalne shrambe:', e);
    }
  }

  // Lokalni sinhronizacijski način (preko localStorage in BroadcastChannel)
  callback(getLocalItems());

  const handleBroadcast = (event) => {
    if (event.data?.type === 'ITEMS_UPDATED') {
      callback(event.data.items);
    }
  };

  const handleStorage = (event) => {
    if (event.key === LOCAL_STORAGE_ITEMS_KEY) {
      callback(getLocalItems());
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
 * Dodaj nov artikel na seznam
 */
export async function addShoppingItem({ title, category, quantity, addedBy, matchedDealId = null }) {
  const itemData = {
    title: title.trim(),
    category: category || 'ostalo',
    quantity: quantity?.trim() || '1 kos',
    completed: false,
    addedBy: addedBy || 'Družina',
    matchedDealId: matchedDealId || null,
  };

  if (isFirebaseConfigured && db) {
    try {
      const docRef = await addDoc(collection(db, 'shopping_list'), {
        ...itemData,
        createdAt: serverTimestamp()
      });
      return { id: docRef.id, ...itemData, createdAt: Date.now() };
    } catch (err) {
      console.error('Napaka pri shranjevanju v Firestore:', err);
    }
  }

  // Lokalno shranjevanje
  const localItems = getLocalItems();
  const newItem = {
    id: 'item_' + Date.now() + '_' + Math.random().toString(36).substr(2, 4),
    ...itemData,
    createdAt: Date.now()
  };
  const updated = [newItem, ...localItems];
  saveLocalItems(updated);
  return newItem;
}

/**
 * Spremeni status artikla (kupljeno / neodkljukano)
 */
export async function toggleItemStatus(itemId, currentStatus) {
  const newStatus = !currentStatus;

  if (isFirebaseConfigured && db) {
    try {
      const itemRef = doc(db, 'shopping_list', itemId);
      await updateDoc(itemRef, {
        completed: newStatus,
        completedAt: newStatus ? serverTimestamp() : null
      });
      return newStatus;
    } catch (err) {
      console.error('Napaka pri posodobitvi statusa v Firestore:', err);
    }
  }

  // Lokalna posodobitev
  const localItems = getLocalItems();
  const updated = localItems.map(item => 
    item.id === itemId ? { ...item, completed: newStatus, completedAt: newStatus ? Date.now() : null } : item
  );
  saveLocalItems(updated);
  return newStatus;
}

/**
 * Posodobi obstoječi artikel
 */
export async function updateShoppingItem(itemId, fields) {
  if (isFirebaseConfigured && db) {
    try {
      const itemRef = doc(db, 'shopping_list', itemId);
      await updateDoc(itemRef, fields);
      return true;
    } catch (err) {
      console.error('Napaka pri posodabljanju artikla:', err);
    }
  }

  const localItems = getLocalItems();
  const updated = localItems.map(item => item.id === itemId ? { ...item, ...fields } : item);
  saveLocalItems(updated);
  return true;
}

/**
 * Izbriši artikel
 */
export async function deleteShoppingItem(itemId) {
  if (isFirebaseConfigured && db) {
    try {
      await deleteDoc(doc(db, 'shopping_list', itemId));
      return true;
    } catch (err) {
      console.error('Napaka pri brisanju artikla v Firestore:', err);
    }
  }

  const localItems = getLocalItems();
  const updated = localItems.filter(item => item.id !== itemId);
  saveLocalItems(updated);
  return true;
}

/**
 * Počisti vse kupljene artikle
 */
export async function clearAllCompletedItems() {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, 'shopping_list'));
      const snap = await getDocs(q);
      const deletePromises = [];
      snap.forEach(d => {
        if (d.data().completed) {
          deletePromises.push(deleteDoc(doc(db, 'shopping_list', d.id)));
        }
      });
      await Promise.all(deletePromises);
      return true;
    } catch (err) {
      console.error('Napaka pri čiščenju kupljenih v Firestore:', err);
    }
  }

  const localItems = getLocalItems();
  const updated = localItems.filter(item => !item.completed);
  saveLocalItems(updated);
  return true;
}

/**
 * Naročanje na katalog akcij
 */
export function subscribeCatalogDeals(callback) {
  if (isFirebaseConfigured && db) {
    try {
      const q = query(collection(db, 'catalog_deals'));
      const unsubscribe = onSnapshot(q, (snapshot) => {
        if (!snapshot.empty) {
          const deals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
          callback(deals);
        } else {
          // Če je baza prazna, uporabi privzete akcije in jih po želji napolni
          callback(DEFAULT_CATALOG_DEALS);
        }
      }, (err) => {
        console.warn('Napaka pri prebiranju akcij iz Firestore, uporaba privzetih:', err);
        callback(getLocalDeals());
      });
      return unsubscribe;
    } catch (e) {
      console.warn('Firestore napaka za akcije:', e);
    }
  }

  callback(getLocalDeals());

  const handleBroadcast = (event) => {
    if (event.data?.type === 'DEALS_UPDATED') {
      callback(event.data.deals);
    }
  };

  if (broadcastChannel) {
    broadcastChannel.addEventListener('message', handleBroadcast);
  }

  return () => {
    if (broadcastChannel) {
      broadcastChannel.removeEventListener('message', handleBroadcast);
    }
  };
}

/**
 * Inicializacija testnih akcij v Firestore, če želi uporabnik naložiti vzorce
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
 * Pridobi družinske člane iz lokalne shrambe
 */
export function getLocalMembers() {
  const data = localStorage.getItem(LOCAL_STORAGE_MEMBERS_KEY);
  if (!data) {
    localStorage.setItem(LOCAL_STORAGE_MEMBERS_KEY, JSON.stringify(DEFAULT_FAMILY_MEMBERS));
    return DEFAULT_FAMILY_MEMBERS;
  }
  try {
    const parsed = JSON.parse(data);
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : DEFAULT_FAMILY_MEMBERS;
  } catch {
    return DEFAULT_FAMILY_MEMBERS;
  }
}

/**
 * Shrani posodobljene člane
 */
export function saveFamilyMembers(members) {
  localStorage.setItem(LOCAL_STORAGE_MEMBERS_KEY, JSON.stringify(members));
  if (broadcastChannel) {
    broadcastChannel.postMessage({ type: 'MEMBERS_UPDATED', members });
  }

  // Če je povezan Firestore, posodobi tudi v Firestore
  if (isFirebaseConfigured && db) {
    try {
      setDoc(doc(db, 'settings', 'family_members'), { members }, { merge: true });
    } catch (e) {
      console.warn('Napaka pri shranjevanju članov v Firestore:', e);
    }
  }
}

/**
 * Naročanje na posodobitve družinskih članov
 */
export function subscribeFamilyMembers(callback) {
  if (isFirebaseConfigured && db) {
    try {
      const unsub = onSnapshot(doc(db, 'settings', 'family_members'), (snap) => {
        if (snap.exists() && Array.isArray(snap.data()?.members)) {
          const members = snap.data().members;
          localStorage.setItem(LOCAL_STORAGE_MEMBERS_KEY, JSON.stringify(members));
          callback(members);
        } else {
          callback(getLocalMembers());
        }
      }, () => {
        callback(getLocalMembers());
      });
      return unsub;
    } catch (e) {
      console.warn('Firestore poslušanje članov napaka:', e);
    }
  }

  callback(getLocalMembers());

  const handleBroadcast = (event) => {
    if (event.data?.type === 'MEMBERS_UPDATED') {
      callback(event.data.members);
    }
  };

  const handleStorage = (event) => {
    if (event.key === LOCAL_STORAGE_MEMBERS_KEY) {
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
