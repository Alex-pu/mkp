import { Request, Response } from 'express';
import { FbService } from '../services/fb.service';
import { sendSuccess } from '../utils/apiResponse';
import { catchAsync } from '../utils/catchAsync';
import { CreateFbInput } from '../types';
import { parsePaginationQuery } from '../utils/pagination';

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
  const pagination = parsePaginationQuery(req.query as Record<string, unknown>);
  const search = typeof req.query.search === 'string' ? req.query.search : undefined;
  const last24HoursOnly = req.query.last24HoursOnly === 'true';
  const reports = await FbService.getMyReports(req.user!.id, { search, last24HoursOnly }, pagination ?? undefined);
  if (pagination && !Array.isArray(reports)) {
    return sendSuccess(res, reports.items, 'Success', 200, reports.pagination);
  }
  sendSuccess(res, reports);
});

export const getFbSummary = catchAsync(async (_req: AuthRequest, res: Response) => {
  const pagination = parsePaginationQuery(_req.query as Record<string, unknown>);
  const search = typeof _req.query.search === 'string' ? _req.query.search : undefined;
  const summary = await FbService.getSummary({ search }, pagination ?? undefined);
  if (pagination && 'data' in summary) {
    return sendSuccess(res, summary.data, 'Success', 200, summary.pagination);
  }
  sendSuccess(res, summary);
});