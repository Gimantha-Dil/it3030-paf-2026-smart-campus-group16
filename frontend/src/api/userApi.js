import api from './axiosInstance';

export const getUsers = (params) => api.get('/api/v1/users', { params });
export const getUserById = (id) => api.get(`/api/v1/users/${id}`);
export const updateUserRole = (id, role) => api.patch(`/api/v1/users/${id}/role`, null, { params: { role } });
export const deleteUser = (id) => api.delete(`/api/v1/users/${id}`);

export const getPendingStaff = (params) => api.get('/api/v1/users/pending-staff', { params });
export const approveStaff = (id) => api.post(`/api/v1/users/${id}/approve-staff`);
export const rejectStaff = (id) => api.post(`/api/v1/users/${id}/reject-staff`);
