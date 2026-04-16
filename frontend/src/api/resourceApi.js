import api from './axiosInstance';

const BASE = '/api/v1/resources';

export const getResources = (params) => api.get(BASE, { params });
export const getResourceById = (id) => api.get(`${BASE}/${id}`);
export const createResource = (data) => api.post(BASE, data);
export const updateResource = (id, data) => api.put(`${BASE}/${id}`, data);
export const updateResourceStatus = (id, status) => api.patch(`${BASE}/${id}/status`, null, { params: { status } });
export const deleteResource = (id) => api.delete(`${BASE}/${id}`);
