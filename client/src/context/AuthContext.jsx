import { createContext, useState, useEffect, useCallback } from 'react';
import { flushSync } from 'react-dom';
import { getMeApi, loginApi, registerApi, updateProfileApi } from '../api/auth';

export const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null);
  const [loading, setLoading] = useState(true);

  // Restore session from token on first load
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      getMeApi()
        .then((data) => setUser(data.user))
        .catch(() => localStorage.removeItem('token'))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const login = useCallback(async (email, password) => {
    const data = await loginApi(email, password);
    localStorage.setItem('token', data.token);
    // flushSync ensures every component that reads `user` re-renders
    // synchronously before login() returns, so the caller's navigate()
    // fires AFTER the header/layout already have the updated user.
    flushSync(() => setUser(data.user));
    return data;
  }, []);

  const register = useCallback(async (email, password, name, gender) => {
    const data = await registerApi(email, password, name, gender);
    localStorage.setItem('token', data.token);
    flushSync(() => setUser(data.user));
    return data;
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    // flushSync so cart/wishlist contexts reset before any navigation
    flushSync(() => setUser(null));
  }, []);

  const updateUser = useCallback(async (fields) => {
    const data = await updateProfileApi(fields);
    setUser(data.user);
    return data.user;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}
