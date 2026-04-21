import { initializeApp, type FirebaseApp } from 'firebase/app';
import { getAuth, type Auth } from 'firebase/auth';
import { getFirestore, type Firestore } from 'firebase/firestore';

/**
 * Firebase client singleton. Config is read from Vite env vars at build time.
 * Populate .env.local from .env.example with values from the Firebase console
 * (Project settings → General → Your apps → SDK setup & config).
 */
const config = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY as string,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN as string,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID as string,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET as string,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID as string,
  appId: import.meta.env.VITE_FIREBASE_APP_ID as string,
};

export const firebaseConfigured = Boolean(config.apiKey && config.projectId);

if (import.meta.env.DEV) {
  // Surface config state once at startup so the console is explicit about it.
  if (firebaseConfigured) {
    console.info(
      `[firebase] configured — project=${config.projectId} authDomain=${config.authDomain}`,
    );
  } else {
    console.warn(
      '[firebase] NOT configured — populate .env.local with VITE_FIREBASE_* and restart `npm run dev`',
    );
  }
}

let _app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

export function getFirebase() {
  if (!firebaseConfigured) {
    throw new Error(
      'Firebase is not configured. Copy .env.example → .env.local and fill in VITE_FIREBASE_* values.',
    );
  }
  if (!_app) {
    _app = initializeApp(config);
    _auth = getAuth(_app);
    _db = getFirestore(_app);
  }
  return { app: _app!, auth: _auth!, db: _db! };
}
