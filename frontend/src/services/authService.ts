import api from './api';
import { LoginInput, RegisterInput, AuthResponse, AssignableAdmin, ManagedUser, UpdateUserPasswordInput } from '../types';

export const authService = {
  async login(input: LoginInput): Promise<AuthResponse> {
    const response = await api.post('/auth/login', input);
    return response.data.data;
  },

  async register(input: RegisterInput): Promise<AuthResponse> {
    const response = await api.post('/auth/register', input);
    return response.data.data;
  },

  async getAdmins(): Promise<AssignableAdmin[]> {
    const response = await api.get('/auth/admins');
    return response.data.data;
  },

  async getUsers(): Promise<ManagedUser[]> {
    const response = await api.get('/auth/users');
    return response.data.data;
  },

  async updateUserStatus(userId: string, isActive: boolean): Promise<ManagedUser> {
    const response = await api.patch(`/auth/users/${userId}/status`, { isActive });
    return response.data.data;
  },

  async updateUserPassword(userId: string, input: UpdateUserPasswordInput): Promise<ManagedUser> {
    const response = await api.patch(`/auth/users/${userId}/password`, input);
    return response.data.data;
  },
};