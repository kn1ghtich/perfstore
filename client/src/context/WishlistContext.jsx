import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import api from '../api/axiosInstance';
import { AuthContext } from './AuthContext';

export const WishlistContext = createContext(null);

export function WishlistProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [ids, setIds] = useState(new Set()); // Set of product id strings
  const [loading, setLoading] = useState(false);

  // Load wishlist when user logs in
  useEffect(() => {
    if (!user) { setIds(new Set()); return; }
    setLoading(true);
    api.get('/auth/wishlist')
      .then(({ data }) => setIds(new Set(data.wishlist.map((p) => p.id || p._id?.toString()))))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [user?.id]);

  const toggle = useCallback(async (productId) => {
    if (!user) return false; // caller should redirect to login
    // Optimistic
    setIds((prev) => {
      const next = new Set(prev);
      if (next.has(productId)) next.delete(productId);
      else next.add(productId);
      return next;
    });
    try {
      const { data } = await api.post('/auth/wishlist/toggle', { productId });
      setIds(new Set(data.wishlist));
    } catch {
      // Revert on error
      setIds((prev) => {
        const next = new Set(prev);
        if (next.has(productId)) next.delete(productId);
        else next.add(productId);
        return next;
      });
    }
    return true;
  }, [user]);

  const has = useCallback((productId) => ids.has(productId), [ids]);

  return (
    <WishlistContext.Provider value={{ ids, has, toggle, loading, count: ids.size }}>
      {children}
    </WishlistContext.Provider>
  );
}
