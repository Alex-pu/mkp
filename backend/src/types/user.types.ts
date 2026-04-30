import { z } from 'zod';

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

export const RegisterSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().optional(),
  role: z.enum(['SUPER_ADMIN', 'ADMIN']).default('ADMIN'),
});

export const UpdateUserStatusSchema = z.object({
  isActive: z.boolean(),
});

export const UpdateUserPasswordSchema = z.object({
  password: z.string().min(6),
});

export type LoginInput = z.infer<typeof LoginSchema>;
export type RegisterInput = z.infer<typeof RegisterSchema>;
export type UpdateUserStatusInput = z.infer<typeof UpdateUserStatusSchema>;
export type UpdateUserPasswordInput = z.infer<typeof UpdateUserPasswordSchema>;

export interface User {
  id: string;
  email: string;
  password: string;
  name: string | null;
  role: 'SUPER_ADMIN' | 'ADMIN';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthResponse {
  user: Omit<User, 'password'>;
  token: string;
}

export interface ManagedUserActivePoll {
  id: string;
  title: string;
}

export interface ManagedUser {
  id: string;
  email: string;
  name: string | null;
  role: 'SUPER_ADMIN' | 'ADMIN';
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  activePollCount: number;
  activePolls: ManagedUserActivePoll[];
}