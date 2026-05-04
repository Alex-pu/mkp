import { Request, Response } from 'express';
import { FbService } from '../services/fb.service';
import { sendSuccess } from '../utils/apiResponse';
import { catchAsync } from '../utils/catchAsync';
import { CreateFbInput } from '../types';

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: 'SUPER_ADMIN' | 'ADMIN';
  };
}

export const createFbReport = catchAsync(async (req: AuthRequest, res: Response) => {
  const input: CreateFbInput = req.body;
  const report = await FbService.createReport(input, req.user!.id);
  sendSuccess(res, report, 'Report submitted successfully', 201);
});

export const getMyFbReports = catchAsync(async (req: AuthRequest, res: Response) => {
  const reports = await FbService.getMyReports(req.user!.id);
  sendSuccess(res, reports);
});

export const getFbSummary = catchAsync(async (_req: AuthRequest, res: Response) => {
  const summary = await FbService.getSummary();
  sendSuccess(res, summary);
});