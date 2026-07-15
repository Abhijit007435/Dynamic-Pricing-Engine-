import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

// Read the key environment variable and only initialize Firebase when present.
const API_KEY = import.meta.env.VITE_FIREBASE_API_KEY;

export const isFirebaseConfigured = Boolean(API_KEY);
// Enable fake auth automatically during local development when real Firebase is not configured.
export const isFakeAuthEnabled = import.meta.env.DEV && !isFirebaseConfigured;

export let auth = null;
let googleProvider = null;

let _signInWithGoogle = () => Promise.reject(new Error('Firebase not configured'));
let _firebaseSignOut = async () => {};

if (API_KEY) {
  const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID,
  };

  const app = initializeApp(firebaseConfig);
  auth = getAuth(app);
  googleProvider = new GoogleAuthProvider();

  _signInWithGoogle = () => signInWithPopup(auth, googleProvider);
  _firebaseSignOut = () => signOut(auth);
} else {
  // Helpful console warning for developers running locally without .env
  // This prevents a hard runtime crash when Firebase config is missing.
  // The UI will show a user-friendly error message from the auth flow.
  // eslint-disable-next-line no-console
  console.warn('VITE_FIREBASE_API_KEY not set — Firebase auth disabled.');
}

export const signInWithGoogle = (...args) => _signInWithGoogle(...args);
export const firebaseSignOut = (...args) => _firebaseSignOut(...args);
