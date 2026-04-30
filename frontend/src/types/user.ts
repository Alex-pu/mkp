export interface User {
  id: string;
  email: string;
  name?: string | null;
  role: 'SUPER_ADMIN' | 'ADMIN';
  isActive: boolean;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  email: string;
  password: string;
  name?: string;
  role: 'SUPER_ADMIN' | 'ADMIN';
}

export interface UpdateUserPasswordInput {
  password: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}

export interface AssignableAdmin extends User {}

export interface ManagedUserActivePoll {
  id: string;
  title: string;
}

export interface ManagedUser extends User {
  activePollCount: number;
  activePolls: ManagedUserActivePoll[];
  createdAt: string;
  updatedAt: string;
}