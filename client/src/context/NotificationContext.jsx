import { createContext, useState, useEffect, useCallback, useContext } from 'react';
import { fetchNotifications } from '../api/notifications';
import { AuthContext } from './AuthContext';

export const NotificationContext = createContext(null);

const LS_SEEN_KEY = 'notif_seen_ids';

function loadSeenIds() {
  try { return new Set(JSON.parse(localStorage.getItem(LS_SEEN_KEY) || '[]')); }
  catch { return new Set(); }
}

function saveSeenIds(set) {
  localStorage.setItem(LS_SEEN_KEY, JSON.stringify([...set]));
}

export function NotificationProvider({ children }) {
  const { user } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [panelOpen, setPanelOpen] = useState(false);
  const [seenIds, setSeenIds] = useState(loadSeenIds);

  const load = useCallback(async () => {
    try {
      const { notifications: n } = await fetchNotifications();
      setNotifications(n ?? []);
    } catch {
      setNotifications([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  // Refresh every 2 minutes
  useEffect(() => {
    const id = setInterval(load, 120_000);
    return () => clearInterval(id);
  }, [load]);

  // Unread = notifications whose id is NOT in seenIds
  const unreadCount = notifications.filter(n => !seenIds.has(n.id)).length;

  const openPanel = useCallback(() => {
    setPanelOpen(true);
    // Mark all current notifications as seen
    setSeenIds(prev => {
      const next = new Set([...prev, ...notifications.map(n => n.id)]);
      saveSeenIds(next);
      return next;
    });
  }, [notifications]);

  const closePanel = useCallback(() => setPanelOpen(false), []);

  return (
    <NotificationContext.Provider value={{ notifications, loading, unreadCount, panelOpen, openPanel, closePanel, refresh: load }}>
      {children}
    </NotificationContext.Provider>
  );
}
