import { createContext, useState, useEffect, useCallback, useRef } from 'react';
import { getUnreadCount } from '../api/notificationApi';
import { useAuth } from '../hooks/useAuth';

export const NotificationContext = createContext(null);

export function NotificationProvider({ children }) {
  const { user } = useAuth();
  const [unreadCount, setUnreadCount] = useState(0);
  const intervalRef = useRef(null);

  const fetchCount = useCallback(async () => {
    // Read token directly — user state may lag behind localStorage on first load
    const token = localStorage.getItem('token');
    if (!token) return;
    try {
      const res = await getUnreadCount();
      // axios wraps response in .data, backend returns { count: number }
      const payload = res.data;
      setUnreadCount(payload?.count ?? payload?.unreadCount ?? 0);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    // Clear any existing interval
    if (intervalRef.current) clearInterval(intervalRef.current);

    if (!user) {
      setUnreadCount(0);
      return;
    }

    // Fetch immediately on user login/mount
    fetchCount();

    // Poll every 30s
    intervalRef.current = setInterval(fetchCount, 30000);
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [user, fetchCount]);

  return (
    <NotificationContext.Provider value={{ unreadCount, setUnreadCount, refreshCount: fetchCount }}>
      {children}
    </NotificationContext.Provider>
  );
}