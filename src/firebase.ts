import { initializeApp, FirebaseApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

// Firebase is temporarily wired but auth is disabled.
// Will be fully replaced by Supabase.
// Gracefully stubs out when env vars are not set so the app still loads.

const apiKey = import.meta.env.VITE_FIREBASE_API_KEY || '';

let app: FirebaseApp | null = null;
let _auth: Auth | null = null;
let _db: Firestore | null = null;

if (apiKey) {
  try {
    app = initializeApp({
      projectId:         import.meta.env.VITE_FIREBASE_PROJECT_ID         || '',
      appId:             import.meta.env.VITE_FIREBASE_APP_ID             || '',
      apiKey,
      authDomain:        import.meta.env.VITE_FIREBASE_AUTH_DOMAIN        || '',
      storageBucket:     import.meta.env.VITE_FIREBASE_STORAGE_BUCKET     || '',
      messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || '',
    });
    _auth = getAuth(app);
    _db   = getFirestore(app, import.meta.env.VITE_FIREBASE_DATABASE_ID || '(default)');
  } catch (e) {
    console.warn('Firebase init skipped:', e);
  }
} else {
  console.info('Firebase env vars not set — running in offline/stub mode (Supabase integration pending).');
}

// Safe exports: pages already handle null/error from these gracefully
export const auth           = _auth as Auth;
export const db             = _db  as Firestore;
export const googleProvider = new GoogleAuthProvider();
