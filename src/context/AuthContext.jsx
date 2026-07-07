import { createContext, useContext, useState } from 'react';

/*
  AuthContext — keeps track of whether someone is logged in.

  TEMPORARY: login() below checks a hardcoded username/password.
  Once backend team gives you a real login API (e.g. POST /auth/login),
  replace the check inside login() with an actual api call — everything
  else (ProtectedRoute, Login page) stays the same.
*/

const AuthContext = createContext(null);

const MOCK_ADMIN = { username: 'admin', password: 'admin123' };

export function AuthProvider({ children }) {
  const [isLoggedIn, setIsLoggedIn] = useState(() => {
    return localStorage.getItem('isLoggedIn') === 'true';
  });

  const login = (username, password) => {
    // TODO: replace this block with a real API call once backend is ready:
    // const res = await loginApi(username, password);
    // if (res.data.success) { ... }
    if (username === MOCK_ADMIN.username && password === MOCK_ADMIN.password) {
      localStorage.setItem('isLoggedIn', 'true');
      setIsLoggedIn(true);
      return { success: true };
    }
    return { success: false, message: 'Invalid username or password' };
  };

  const logout = () => {
    localStorage.removeItem('isLoggedIn');
    setIsLoggedIn(false);
  };

  return (
    <AuthContext.Provider value={{ isLoggedIn, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
