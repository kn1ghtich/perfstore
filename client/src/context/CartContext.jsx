import { createContext, useState, useCallback, useEffect, useContext } from 'react';
import { AuthContext } from './AuthContext';

export const CartContext = createContext(null);

// Per-user storage key; null key means "no storage" (guest)
const storageKey = (userId) => (userId ? `cart_${userId}` : null);

const loadCart = (userId) => {
  const key = storageKey(userId);
  if (!key) return [];
  try { return JSON.parse(localStorage.getItem(key) || '[]'); }
  catch { return []; }
};

const saveCart = (userId, items) => {
  const key = storageKey(userId);
  if (!key) return;
  localStorage.setItem(key, JSON.stringify(items));
};

export function CartProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [items, setItems] = useState([]);

  // Reload the right cart whenever the logged-in user changes
  useEffect(() => {
    setItems(loadCart(user?.id ?? null));
  }, [user?.id]);

  // Persist whenever items change (only for logged-in users)
  useEffect(() => {
    saveCart(user?.id ?? null, items);
  }, [items, user?.id]);

  const addItem = useCallback((product, qty = 1) => {
    setItems((prev) => {
      const existing = prev.find((i) => i.id === product.id);
      if (existing) {
        return prev.map((i) =>
          i.id === product.id ? { ...i, quantity: i.quantity + qty } : i
        );
      }
      return [
        ...prev,
        {
          id:         product.id,
          slug:       product.slug,
          name:       product.name,
          brand_name: product.brand_name,
          price:      product.price,
          image_url:  product.image_url,
          quantity:   qty,
        },
      ];
    });
  }, []);

  const removeItem = useCallback((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const setQuantity = useCallback((id, qty) => {
    if (qty < 1) return;
    setItems((prev) => prev.map((i) => (i.id === id ? { ...i, quantity: qty } : i)));
  }, []);

  const clearCart = useCallback(() => setItems([]), []);

  const totalItems = items.reduce((s, i) => s + i.quantity, 0);
  const totalPrice = items.reduce((s, i) => s + i.price * i.quantity, 0);

  return (
    <CartContext.Provider value={{ items, addItem, removeItem, setQuantity, clearCart, totalItems, totalPrice }}>
      {children}
    </CartContext.Provider>
  );
}
