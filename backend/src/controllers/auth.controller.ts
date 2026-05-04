import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { catchAsync } from '../utils/catchAsync';
import { LoginInput, RegisterInput, UpdateUserPasswordInput, UpdateUserStatusInput } from '../types';
import { parsePaginationQuery } from '../utils/pagination';

interface AuthRequest extends Request {
  user?: any;
}

export const login = catchAsync(async (req: Request, res: Response) => {
  const input: LoginInput = req.body;
  const result = await AuthService.login(input);
  sendSuccess(res, result, 'Login successful');
});

export const register = catchAsync(async (req: AuthRequest, res: Response) => {
  const input: RegisterInput = req.body;
  const createdById = req.user?.id;
  const result = await AuthService.register(input, createdById);
  sendSuccess(res, result, 'Registration successful', 201);
});

export const getAssignableAdmins = catchAsync(async (_req: AuthRequest, res: Response) => {
  const pagination = parsePaginationQuery(_req.query as Record<string, unknown>);
  const admins = await AuthService.getAssignableAdmins(pagination ?? undefined);
  if (pagination && !Array.isArray(admins)) {
    return sendSuccess(res, admins.items, 'Success', 200, admins.pagination);
  }
  sendSuccess(res, admins);
});

export const getManagedUsers = catchAsync(async (_req: AuthRequest, res: Response) => {
  const pagination = parsePaginationQuery(_req.query as Record<string, unknown>);
  const users = await AuthService.getManagedUsers(pagination ?? undefined);
  if (pagination && !Array.isArray(users)) {
    return sendSuccess(res, users.items, 'Success', 200, users.pagination);
  }
  sendSuccess(res, users);
});

export const updateUserStatus = catchAsync(async (req: AuthRequest, res: Response) => {
  const input: UpdateUserStatusInput = req.body;
  const user = await AuthService.updateUserStatus(req.params.id as string, input, req.user!.id);
  sendSuccess(res, user, input.isActive ? 'User account activated successfully' : 'User account suspended successfully');
});

export const updateUserPassword = catchAsync(async (req: AuthRequest, res: Response) => {
  const input: UpdateUserPasswordInput = req.body;
  const user = await AuthService.updateUserPassword(req.params.id as string, input);
  sendSuccess(res, user, 'User password updated successfully');
});