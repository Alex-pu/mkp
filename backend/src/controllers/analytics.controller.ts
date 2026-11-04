import { Request, Response } from 'express';
import { AnalyticsService } from '../services/analytics.service';
import { ReportService } from '../services/report.service';
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

export const downloadPollReport = catchAsync(async (req: AuthRequest, res: Response) => {
  const pollId = req.params.id as string;
  const reportData = await AnalyticsService.getPollReportData(pollId, req.user?.id, req.user?.role);
  const pdf = await ReportService.createPollPdf(reportData);
  const safePollId = pollId.replace(/[^a-zA-Z0-9_-]/g, '');

  res
    .status(200)
    .type('application/pdf')
    .setHeader('Content-Disposition', `attachment; filename="poll-${safePollId}-report.pdf"`)
    .send(pdf);
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
