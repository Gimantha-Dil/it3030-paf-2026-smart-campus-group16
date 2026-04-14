import { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { getCurrentUser } from '../api/authApi';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const stored = localStorage.getItem('user');
      return stored ? JSON.parse(stored) : null;
    } catch { return null; }
  });

  // isLoading=true only if we have a token that needs backend validation
  // If user data already in localStorage → show cached user immediately (no spinner)
  const [isLoading, setIsLoading] = useState(() => {
    const hasToken = !!localStorage.getItem('token');
    const hasUser  = !!localStorage.getItem('user');
    // If both exist, no loading needed
    // If token but no user, fetch user from backend
    return hasToken && !hasUser;
  });

  const justLoggedIn = useRef(false);

  const loadUser = useCallback(async () => {
    const token = localStorage.getItem('token');
    if (!token) { setIsLoading(false); return; }
    try {
      const { data } = await getCurrentUser();
      setUser(data);
      localStorage.setItem('user', JSON.stringify(data));
    } catch (err) {
      if (err?.response?.status === 401 || err?.response?.status === 403) {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
      // Network errors 
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (justLoggedIn.current) {
      justLoggedIn.current = false;
      setIsLoading(false);
      return;
    }
    const hasToken = localStorage.getItem('token');
    const hasUser  = localStorage.getItem('user');
    if (hasToken && !hasUser) {
      // Token exists, no cached user — fetch from backend
      loadUser();
    } else if (!hasToken) {
      setIsLoading(false);
    } else {
      // already initialized from useState, no loading needed
      setIsLoading(false);
    }
  }, [loadUser]);

  const login = (token, userData) => {
    justLoggedIn.current = true;
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
    setUser(userData);
    setIsLoading(false);
  };

  const logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.clear();
    setUser(null);
    setIsLoading(false);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout, loadUser }}>
      {children}
    </AuthContext.Provider>
  );
}
