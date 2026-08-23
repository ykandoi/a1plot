import { initializeAuth, getAuth, indexedDBLocalPersistence, browserLocalPersistence, browserPopupRedirectResolver, GoogleAuthProvider } from 'firebase/auth';
import { app, isConfigured } from './firebaseApp';

// Auth only — no Firestore, no Storage. Import from here (rather than from
// ./firebase) in anything that just needs to know who is signed in, such as the
// header islands that render on every route. See src/firebaseApp.js for why.

let auth, googleProvider;

if (isConfigured) {
  // initializeAuth, NOT getAuth: getAuth eagerly installs the popup/redirect
  // resolver, which injects a ~93KB iframe from <project>.firebaseapp.com into
  // every page even though only the sign-in button needs it. Omitting
  // popupRedirectResolver keeps it out; signInWithPopup is handed one
  // explicitly at the call site.
  //
  // Persistence must be listed explicitly since we are no longer taking
  // getAuth's browser defaults: IndexedDB first, localStorage where it is
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
  googleProvider = new GoogleAuthProvider();
  googleProvider.setCustomParameters({ prompt: 'select_account' });
} else {
  auth = {};
  googleProvider = {};
}

/**
 * popupRedirectResolver — MUST be passed to any auth call that opens a popup or
 * a redirect: signInWithPopup, signInWithRedirect, getRedirectResult,
 * linkWithPopup, reauthenticateWithPopup. Firebase throws auth/argument-error
 * without it, because `auth` above is deliberately built without one:
 *
 *   import { auth, googleProvider, popupRedirectResolver } from './firebaseAuth';
 *   await signInWithPopup(auth, googleProvider, popupRedirectResolver);
 */
const popupRedirectResolver = browserPopupRedirectResolver;

export { auth, googleProvider, popupRedirectResolver };
