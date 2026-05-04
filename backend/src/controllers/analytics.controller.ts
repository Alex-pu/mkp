import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { sendSuccess } from '../utils/apiResponse';
import { catchAsync } from '../utils/catchAsync';
import { parsePaginationQuery } from '../utils/pagination';

interface AuthRequest extends Request {
  user?: any;
}

export const getPollAnalytics = catchAsync(async (req: AuthRequest, res: Response) => {
  const analytics = await AnalyticsService.getPollAnalytics(req.params.id as string, req.user?.id, req.user?.role);
  sendSuccess(res, analytics);
});

export const getQuestionOpenTextResponses = catchAsync(async (req: AuthRequest, res: Response) => {
  const pagination = parsePaginationQuery(req.query as Record<string, unknown>) ?? { page: 1, limit: 8, skip: 0 };
  const responses = await AnalyticsService.getQuestionOpenTextResponses(
    req.params.id as string,
    req.params.questionId as string,
    pagination,
    req.user?.id,
    req.user?.role,
  );

  sendSuccess(res, responses.items, 'Success', 200, responses.pagination);
});