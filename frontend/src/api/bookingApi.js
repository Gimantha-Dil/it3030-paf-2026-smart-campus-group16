import api from './axiosInstance';

const BASE = '/api/v1/bookings';

export const getBookings = (params) => api.get(BASE, { params });
export const getBookingById = (id) => api.get(`${BASE}/${id}`);
export const createBooking = (data) => api.post(BASE, data);
export const reviewBooking = (id, data) => api.patch(`${BASE}/${id}/review`, data);
export const cancelBooking = (id) => api.patch(`${BASE}/${id}/cancel`);
export const checkConflicts = (resourceId, startTime, endTime) =>
  api.get(`${BASE}/conflicts`, { params: { resourceId, startTime, endTime } });
