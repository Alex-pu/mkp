import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:5002/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const token = localStorage.getItem('token');
    const authError = String(error.response?.data?.error || '').toLowerCase();
    const authMessage = String(error.response?.data?.message || '').toLowerCase();
    const isSessionFailure = [authError, authMessage].some((value) =>
      value.includes('token expired')
      || value.includes('invalid token')
      || value.includes('session invalid')
      || value.includes('no token provided')
    );

    if (error.response?.status === 401 && token && isSessionFailure) {
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }

    return Promise.reject(error);
  }
);

export default api;