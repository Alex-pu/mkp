import { Request, Response } from 'express';
import { VoteService } from '../services/vote.service';
import { sendSuccess } from '../utils/apiResponse';
import { catchAsync } from '../utils/catchAsync';
import { VoteInput } from '../types';

export const submitVote = catchAsync(async (req: Request, res: Response) => {
  const input: VoteInput = req.body;
  const ipAddress = req.ip;
  const userAgent = req.get('User-Agent');
  await VoteService.submitVote(req.params.id as string, input, ipAddress, userAgent);
  sendSuccess(res, null, 'Vote submitted successfully');
});

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: 'SUPER_ADMIN' | 'ADMIN';
  };
}

export const submitAssignedVote = catchAsync(async (req: AuthRequest, res: Response) => {
  const input: VoteInput = req.body;
  const ipAddress = req.ip;
  const userAgent = req.get('User-Agent');
  await VoteService.submitAssignedVote(req.params.id as string, req.user!.id, req.user!.role, input, ipAddress, userAgent);
  sendSuccess(res, null, 'Assigned poll vote submitted successfully');
});