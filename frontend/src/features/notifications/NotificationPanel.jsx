import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { getNotifications, markAsRead, markAllAsRead } from '../../api/notificationApi';
import { useNotifications } from '../../hooks/useNotifications';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Pagination from '../../components/common/Pagination';
import { timeAgo } from '../../utils/dateUtils';
import { toast } from 'react-toastify';

// Map notification type → navigate path using referenceId
function getNavPath(n) {
  if (!n.type) return null;
  const id = n.referenceId;
  if (n.type.startsWith('BOOKING')) return id ? `/bookings/${id}` : `/bookings`;
  if (n.type.startsWith('TICKET') || n.type === 'TICKET_COMMENT') return id ? `/tickets/${id}` : `/tickets`;
  return null;
}

export default function NotificationPanel() {
  const [notifications, setNotifications] = useState([]);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [loading, setLoading] = useState(true);
  const { refreshCount } = useNotifications();
  const navigate = useNavigate();

  const fetchNotifications = useCallback(async () => {
    setLoading(true);
    try {
      const res = await getNotifications({ page, size: 20 });
      const payload = res.data;
      setNotifications(payload?.content || []);
      setTotalPages(payload?.totalPages || 0);
    } catch { toast.error('Failed to load notifications'); }
    finally { setLoading(false); }
  }, [page]);

  // Refresh unread count when panel mounts
  useEffect(() => {
    fetchNotifications();
    refreshCount();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fetchNotifications]);

  const handleClick = async (n) => {
    // Mark as read if unread
    if (!n.read) {
      try {
        await markAsRead(n.id);
        setNotifications(prev => prev.map(x => x.id === n.id ? { ...x, read: true } : x));
        refreshCount();
      } catch { /* ignore */ }
    }
    // Navigate to related page
    const path = getNavPath(n);
    if (path) navigate(path);
  };

  const handleMarkAllRead = async () => {
    try {
      await markAllAsRead();
      toast.success('All notifications marked as read');
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      refreshCount();
    } catch { toast.error('Failed to mark all as read'); }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <h1 className="text-2xl font-bold text-gray-800 dark:text-gray-100">Notifications</h1>
          {unreadCount > 0 && (
            <span className="bg-primary-600 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              {unreadCount} new
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={handleMarkAllRead}
            className="text-sm text-primary-600 dark:text-primary-400 hover:underline font-medium">
            Mark all as read
          </button>
        )}
      </div>

      {loading ? <LoadingSpinner /> : (
        <div className="space-y-2">
          {notifications.length === 0 && (
            <div className="text-center py-16 text-gray-400 dark:text-gray-600">
              <p className="text-sm">No notifications yet.</p>
            </div>
          )}

          {notifications.map(n => {
            const path = getNavPath(n);
            return (
              <div key={n.id}
                onClick={() => handleClick(n)}
                className={`
                  flex items-start gap-4 rounded-xl border p-4 transition-all
                  ${path ? 'cursor-pointer hover:shadow-md' : 'cursor-default'}
                  ${!n.read
                    ? 'bg-primary-50 dark:bg-primary-900/20 border-l-4 border-l-primary-500 border-primary-100 dark:border-primary-800'
                    : 'bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700 opacity-75'}
                `}>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className={`text-sm ${!n.read ? 'font-semibold text-gray-800 dark:text-gray-100' : 'font-medium text-gray-600 dark:text-gray-400'}`}>
                      {n.title}
                    </h3>
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {!n.read && <span className="w-2 h-2 bg-primary-500 rounded-full" />}
                      <span className="text-xs text-gray-400 whitespace-nowrap">{timeAgo(n.createdAt)}</span>
                    </div>
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-0.5">{n.message}</p>
                  {path && (
                    <p className="text-xs text-primary-500 dark:text-primary-400 mt-1">
                      Click to view details
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Pagination page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}