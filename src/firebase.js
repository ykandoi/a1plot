import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';

const cleanEnv = (val) => val ? String(val).replace(/\\r|\\n|\r|\n|\s/g, '') : undefined;

const getEnvVal = (key) => {
  const nextKey = key.startsWith('VITE_') ? 'NEXT_PUBLIC_' + key.substring(5) : key;
  if (typeof process !== 'undefined' && process.env) {
    if (process.env[nextKey]) return process.env[nextKey];
    if (process.env[key]) return process.env[key];
  }
  try {
    const metaEnv = import.meta.env;
    if (metaEnv) {
      if (metaEnv[key]) return metaEnv[key];
      if (metaEnv[nextKey]) return metaEnv[nextKey];
    }
  } catch (e) {}
  return undefined;
};

const firebaseConfig = {
  apiKey: cleanEnv(getEnvVal('VITE_FIREBASE_API_KEY')),
  authDomain: cleanEnv(getEnvVal('VITE_FIREBASE_AUTH_DOMAIN')),
  projectId: cleanEnv(getEnvVal('VITE_FIREBASE_PROJECT_ID')),
  storageBucket: cleanEnv(getEnvVal('VITE_FIREBASE_STORAGE_BUCKET')),
  messagingSenderId: cleanEnv(getEnvVal('VITE_FIREBASE_MESSAGING_SENDER_ID')),
  appId: cleanEnv(getEnvVal('VITE_FIREBASE_APP_ID'))
};

let app, auth, googleProvider, db, storage;

if (firebaseConfig.apiKey && firebaseConfig.apiKey !== 'YOUR_FIREBASE_API_KEY') {
  app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  db = getFirestore(app, 'default');
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

export { auth, googleProvider, db, storage };
