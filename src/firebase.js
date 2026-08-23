import { initializeApp } from 'firebase/app';
import { initializeAuth, getAuth, indexedDBLocalPersistence, browserLocalPersistence, browserPopupRedirectResolver, GoogleAuthProvider } from 'firebase/auth';
import { initializeFirestore, getFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const cleanEnv = (val) => val ? String(val).replace(/\\r|\\n|\r|\n|\s/g, '') : undefined;

const firebaseConfig = {
  apiKey: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_API_KEY || (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_FIREBASE_API_KEY : undefined)),
  authDomain: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_FIREBASE_AUTH_DOMAIN : undefined)),
  projectId: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_FIREBASE_PROJECT_ID : undefined)),
  storageBucket: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_FIREBASE_STORAGE_BUCKET : undefined)),
  messagingSenderId: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID : undefined)),
  appId: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_APP_ID || (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_FIREBASE_APP_ID : undefined))
};

let app, auth, googleProvider, db, storage;

if (firebaseConfig.apiKey && firebaseConfig.apiKey !== 'YOUR_FIREBASE_API_KEY') {
  app = initializeApp(firebaseConfig);
  // initializeAuth, NOT getAuth: getAuth eagerly installs the popup/redirect
  // resolver, which injects a ~93KB iframe from <project>.firebaseapp.com into
  // every page — it was the last link in the critical request chain (3.3s) even
  // though only the Google sign-in button ever needs it. Omitting
  // popupRedirectResolver here keeps it out; signInWithPopup passes
  // browserPopupRedirectResolver explicitly at the call site instead.
  // Persistence must be listed explicitly since we're no longer taking
  // getAuth's browser defaults: IndexedDB first, localStorage where it's
  // unavailable (private mode, some embedded webviews).
  if (typeof window !== 'undefined') {
    try {
      auth = initializeAuth(app, { persistence: [indexedDBLocalPersistence, browserLocalPersistence] });
    } catch (e) {
      // Already initialized on this app instance (HMR, double import) — reuse it.
      auth = getAuth(app);
    }
  } else {
    // Server render: no browser persistence to pick, and no iframe to avoid.
    auth = getAuth(app);
  }
  // Enable on-device (IndexedDB) caching in the browser so listings load
  // instantly from cache and the app keeps working with no internet.
  // Falls back to the default in-memory store anywhere window isn't available.
  if (typeof window !== 'undefined') {
    try {
      db = initializeFirestore(app, {
        localCache: persistentLocalCache({ tabManager: persistentMultipleTabManager() })
      }, 'default');
    } catch (e) {
      // Already initialized, or persistence unsupported (e.g. private mode) — use default.
      db = getFirestore(app, 'default');
    }
  } else {
    db = getFirestore(app, 'default');
  }
  storage = getStorage(app);
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({
    prompt: 'select_account'
  });
} else {
  console.warn("Firebase is not configured. Please add your credentials to the .env file.");
  auth = {};
  googleProvider = {};
  db = {};
  storage = null;
}

/**
 * popupRedirectResolver — MUST be passed to any auth call that opens a popup or
 * a redirect: signInWithPopup, signInWithRedirect, getRedirectResult,
 * linkWithPopup, reauthenticateWithPopup.
 *
 * `auth` above is built with initializeAuth and deliberately has NO resolver
 * baked in, because installing one loads a ~93KB iframe from
 * <project>.firebaseapp.com on every single page view. Firebase throws
 * auth/argument-error if a popup/redirect call runs without one, so it is
 * re-exported here rather than left for each call site to rediscover:
 *
 *   import { auth, googleProvider, popupRedirectResolver } from './firebase';
 *   await signInWithPopup(auth, googleProvider, popupRedirectResolver);
 */
const popupRedirectResolver = browserPopupRedirectResolver;

export { auth, googleProvider, db, storage, popupRedirectResolver };
