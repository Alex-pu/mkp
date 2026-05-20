import axios from 'axios';
import { API_URL } from '../config/env';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(async (config) => {
  const token = useAuthStore.getState().token;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const token = useAuthStore.getState().token;
    const authError = String(error.response?.data?.error || '').toLowerCase();
    const authMessage = String(error.response?.data?.message || '').toLowerCase();
    const isSessionFailure = [authError, authMessage].some((value) => (
      value.includes('token expired')
      || value.includes('invalid token')
      || value.includes('session invalid')
      || value.includes('no token provided')
    ));

    if (error.response?.status === 401 && token && isSessionFailure) {
      useAuthStore.getState().logout();
    }

    return Promise.reject(error);
  }
);

export default api;