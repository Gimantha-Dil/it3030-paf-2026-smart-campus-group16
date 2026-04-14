import api from './axiosInstance';

// requestedRole: TECHNICIAN | LECTURER | LAB_ASSISTANT, pending staff approval
export const registerUser = (email, name, password, requestedRole = null, userType = null) =>
  api.post('/api/v1/auth/register', { email, name, password, requestedRole, userType });

export const loginUser = (email, password) =>
  api.post('/api/v1/auth/login', { email, password });

export const getCurrentUser = () =>
  api.get('/api/v1/auth/me');
