import { initializeApp } from 'firebase/app';

// The Firebase app instance, and nothing else.
//
// This exists so that importing auth does not also pull in Firestore. When
// auth, Firestore and Storage were all initialised in one module, any file
// importing `auth` — including the nav island that renders on EVERY page —
// caused initializeFirestore() to run, dragging Firestore's grpc/protobuf
// bundle (~118KB transferred) onto pages that never read a document.
//
// Everything downstream imports `app` from here, so there is still exactly one
// initializeApp() call and one shared instance.

const cleanEnv = (val) => val ? String(val).replace(/\r|\n|\r|\n|\s/g, '') : undefined;

const firebaseConfig = {
  apiKey: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_API_KEY || (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_FIREBASE_API_KEY : undefined)),
  authDomain: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_FIREBASE_AUTH_DOMAIN : undefined)),
  projectId: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_FIREBASE_PROJECT_ID : undefined)),
  storageBucket: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_FIREBASE_STORAGE_BUCKET : undefined)),
  messagingSenderId: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID : undefined)),
  appId: cleanEnv(process.env.NEXT_PUBLIC_FIREBASE_APP_ID || (typeof import.meta !== 'undefined' && import.meta.env ? import.meta.env.VITE_FIREBASE_APP_ID : undefined))
};

// Guard against the placeholder value so a missing .env degrades to "Firebase
// unavailable" rather than throwing during module evaluation.
export const isConfigured = !!(firebaseConfig.apiKey && firebaseConfig.apiKey !== 'YOUR_FIREBASE_API_KEY');

export const app = isConfigured ? initializeApp(firebaseConfig) : undefined;

if (!isConfigured) {
  console.warn('Firebase is not configured. Please add your credentials to the .env file.');
}
