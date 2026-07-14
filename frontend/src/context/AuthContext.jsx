import { createContext, useContext, useState, useEffect } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, signInWithGoogle, firebaseSignOut } from '../firebase';

const AuthContext = createContext(null);

const ADMIN_USERNAME = import.meta.env.VITE_ADMIN_USERNAME || '';
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD || '';

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => localStorage.getItem('isLoggedIn') === 'true');
  const [googleUser, setGoogleUser] = useState(null);
  const [authLoading, setAuthLoading] = useState(true);

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

  const login = (username, password) => {
    if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
      localStorage.setItem('isLoggedIn', 'true');
      setIsLoggedIn(true);
      return { success: true };
    }
    return { success: false, message: 'Invalid username or password' };
  };

  const loginWithGoogle = async () => {
    try {
      const result = await signInWithGoogle();
      setGoogleUser(result.user);
      setIsLoggedIn(true);
      localStorage.setItem('isLoggedIn', 'true');
      return { success: true };
    } catch (err) {
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

  const displayName = googleUser?.displayName || googleUser?.email || ADMIN_USERNAME || 'User';

  return (
    <AuthContext.Provider value={{ isLoggedIn, authLoading, displayName, googleUser, login, loginWithGoogle, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
