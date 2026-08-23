import { initializeFirestore, getFirestore, persistentLocalCache, persistentMultipleTabManager } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import { app, isConfigured } from './firebaseApp';
import { auth, googleProvider, popupRedirectResolver } from './firebaseAuth';

// The full Firebase surface: auth + Firestore + Storage.
//
// Import from here when you actually read or write documents or files. If all
// you need is the signed-in user, import from ./firebaseAuth instead — this
// module pulls in Firestore's grpc/protobuf bundle, which is ~118KB of transfer
// that pages doing no queries should not pay for.
//
// The auth exports are re-exported unchanged so existing call sites importing
// { auth, googleProvider, popupRedirectResolver } from './firebase' keep working.

let db, storage;

if (isConfigured) {
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
} else {
  db = {};
  storage = null;
}

export { auth, googleProvider, popupRedirectResolver, db, storage };
