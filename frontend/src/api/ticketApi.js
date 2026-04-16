import api from './axiosInstance';

const BASE = '/api/v1/tickets';

export const getTickets = (params) => api.get(BASE, { params });
export const getTicketById = (id) => api.get(`${BASE}/${id}`);
export const createTicket = (formData) =>
  api.post(BASE, formData, { headers: { 'Content-Type': 'multipart/form-data' } });
export const updateTicketStatus = (id, data) => api.patch(`${BASE}/${id}/status`, data);
export const assignTechnician = (id, data) => api.patch(`${BASE}/${id}/assign`, data);

// Comments
export const getComments = (ticketId) => api.get(`${BASE}/${ticketId}/comments`);
export const addComment = (ticketId, data) => api.post(`${BASE}/${ticketId}/comments`, data);
export const updateComment = (ticketId, commentId, data) => api.put(`${BASE}/${ticketId}/comments/${commentId}`, data);
export const deleteComment = (ticketId, commentId) => api.delete(`${BASE}/${ticketId}/comments/${commentId}`);
