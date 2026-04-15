import api from './axiosInstance';

const BASE = '/api/v1/notifications';

export const getNotifications = (params) => api.get(BASE, { params });
export const getUnreadCount = () => api.get(`${BASE}/unread-count`);
export const markAsRead = (id) => api.patch(`${BASE}/${id}/read`);
export const markAllAsRead = () => api.patch(`${BASE}/read-all`);

export const getNotificationPreferences = () => api.get('/api/v1/notifications/preferences');
export const updateNotificationPreferences = (disabledTypes) => api.patch('/api/v1/notifications/preferences', { disabledTypes });