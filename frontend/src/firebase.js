import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup, signOut } from 'firebase/auth';

// TODO: move these into a .env file eventually (same pattern as api.js),
// but Firebase config values are safe to keep client-side even if public —
// Firebase security is enforced through its own rules, not by hiding this config.
const firebaseConfig = {
  apiKey: "AIzaSyBKPIOGvSgWwmnAACpMxNbRe5KXU28u-KM",
  authDomain: "dynamic-pricing-engine-fd3ce.firebaseapp.com",
  projectId: "dynamic-pricing-engine-fd3ce",
  storageBucket: "dynamic-pricing-engine-fd3ce.firebasestorage.app",
  messagingSenderId: "487044953029",
  appId: "1:487044953029:web:c40c03fb4d7b50f10651ac"
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = () => signInWithPopup(auth, googleProvider);
export const firebaseSignOut = () => signOut(auth);
