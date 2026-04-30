import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { sendSuccess } from '../utils/apiResponse';
import { catchAsync } from '../utils/catchAsync';

interface AuthRequest extends Request {
  user?: any;
}

export const getPollAnalytics = catchAsync(async (req: AuthRequest, res: Response) => {
  const analytics = await AnalyticsService.getPollAnalytics(req.params.id as string, req.user?.id, req.user?.role);
  sendSuccess(res, analytics);
});