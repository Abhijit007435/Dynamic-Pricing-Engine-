import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, signInWithGoogle, firebaseSignOut } from '../firebase';

/*
  AuthContext — now supports TWO login methods:
  1. Existing username/password (admin/admin123) — unchanged, still works
  2. NEW: Google Sign-In via Firebase

  Both set the same `isLoggedIn` state, so the rest of the app (ProtectedRoute,
  Layout, etc.) doesn't need to know or care which method was used.
*/

const AuthContext = createContext(null);

const DEFAULT_ADMIN = { username: 'admin', password: 'admin123' };

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('isLoggedIn') === 'true');
  const [googleUser, setGoogleUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Listen for Firebase auth state changes (handles page refresh, etc.)
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setGoogleUser(user);
        setIsLoggedIn(true);
        localStorage.setItem('isLoggedIn', 'true');
      }
      setAuthLoading(false);
    });
    return () => unsubscribe();
  }, []);

  // Existing username/password login — unchanged behavior
  const login = (username, password) => {
    if (username === DEFAULT_ADMIN.username && password === DEFAULT_ADMIN.password) {
      localStorage.setItem('isLoggedIn', 'true');
      setIsLoggedIn(true);
      return { success: true };
    }
    return { success: false, message: 'Invalid username or password' };
  };

  // NEW: Google Sign-In
  const loginWithGoogle = async () => {
    try {
      const result = await signInWithGoogle();
      setGoogleUser(result.user);
      setIsLoggedIn(true);
      localStorage.setItem('isLoggedIn', 'true');
      return { success: true };
    } catch (err) {
      // User closing the Google popup counts as "cancelled", not a real error
      if (err.code === 'auth/popup-closed-by-user') {
        return { success: false, message: '' };
      }
      return { success: false, message: 'Google sign-in failed. Please try again.' };
    }
  };

  const logout = async () => {
    if (googleUser) {
      await firebaseSignOut();
    }
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
    setGoogleUser(null);
  };

  // Display name works for either login method
  const displayName = googleUser?.displayName || googleUser?.email || 'admin';

  return (
    <AuthContext.Provider value={{ isLoggedIn, authLoading, displayName, googleUser, login, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
