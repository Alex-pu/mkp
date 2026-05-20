import api from './api';
import type {
  AssignableAdmin,
  AuthResponse,
  LoginInput,
  ManagedUser,
  PaginatedResult,
  PaginationParams,
  RegisterInput,
  UpdateUserPasswordInput,
} from '../types';

const toPaginatedResult = <T>(response: any): PaginatedResult<T> => ({
  items: response.data.data,
  meta: response.data.meta,
});

export const authService = {
  async login(input: LoginInput): Promise<AuthResponse> {
    const response = await api.post('/auth/login', input);
    return response.data.data;
  },

  async register(input: RegisterInput): Promise<AuthResponse> {
    const response = await api.post('/auth/register', input);
    return response.data.data;
  },

  async getAdmins(params?: PaginationParams): Promise<AssignableAdmin[] | PaginatedResult<AssignableAdmin>> {
    const response = await api.get('/auth/admins', { params });
    return params?.page !== undefined || params?.limit !== undefined
      ? toPaginatedResult<AssignableAdmin>(response)
      : response.data.data;
  },

  async getUsers(params?: PaginationParams): Promise<ManagedUser[] | PaginatedResult<ManagedUser>> {
    const response = await api.get('/auth/users', { params });
    return params?.page !== undefined || params?.limit !== undefined
      ? toPaginatedResult<ManagedUser>(response)
      : response.data.data;
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