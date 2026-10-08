import { initializeApp, getApps, getApp } from 'firebase/app';
import { 
  getFirestore, 
  collection, 
  onSnapshot, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  serverTimestamp, 
  query, 
  orderBy,
  setDoc,
  getDocs
} from 'firebase/firestore';

// Poskusi prebrati shranjeno konfiguracijo iz localStorage ali .env
function getSavedFirebaseConfig() {
  const localConfigStr = localStorage.getItem('nakupki_firebase_config');
  if (localConfigStr) {
    try {
      return JSON.parse(localConfigStr);
    } catch (e) {
      console.warn('Neveljavna shranjena Firebase konfiguracija:', e);
    }
  }

  // Fallback na Vite okoljske spremenljivke
  const env = import.meta.env;
  if (env.VITE_FIREBASE_API_KEY && env.VITE_FIREBASE_PROJECT_ID) {
    return {
      apiKey: env.VITE_FIREBASE_API_KEY,
      authDomain: env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: env.VITE_FIREBASE_PROJECT_ID,
      storageBucket: env.VITE_FIREBASE_STORAGE_BUCKET,
      messagingSenderId: env.VITE_FIREBASE_MESSAGING_SENDER_ID,
      appId: env.VITE_FIREBASE_APP_ID
    };
  }

  return null;
}

let app = null;
let db = null;
const firebaseConfig = getSavedFirebaseConfig();

export const isFirebaseConfigured = Boolean(
  firebaseConfig && firebaseConfig.apiKey && firebaseConfig.projectId && !firebaseConfig.apiKey.includes('YOUR_')
);

if (isFirebaseConfigured) {
  try {
    app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
    db = getFirestore(app);
    console.log('Firebase Firestore uspešno povezan! Projekt:', firebaseConfig.projectId);
  } catch (error) {
    console.error('Napaka pri inicializaciji Firebase:', error);
  }
}

export { app, db };

/**
 * Pomožna funkcija za shranjevanje novih Firebase nastavitev iz UI
 */
export function saveFirebaseConfig(config) {
  if (!config) {
    localStorage.removeItem('nakupki_firebase_config');
  } else {
    localStorage.setItem('nakupki_firebase_config', JSON.stringify(config));
  }
  window.location.reload();
}
