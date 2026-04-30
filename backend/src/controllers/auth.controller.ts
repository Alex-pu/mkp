import { Request, Response, NextFunction } from 'express';
import { AuthService } from '../services/auth.service';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { catchAsync } from '../utils/catchAsync';
import { LoginInput, RegisterInput, UpdateUserPasswordInput, UpdateUserStatusInput } from '../types';

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
  const admins = await AuthService.getAssignableAdmins();
  sendSuccess(res, admins);
});

export const getManagedUsers = catchAsync(async (_req: AuthRequest, res: Response) => {
  const users = await AuthService.getManagedUsers();
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