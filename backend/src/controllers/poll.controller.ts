import { Request, Response } from 'express';
import { PollService } from '../services/poll.service';
import { sendSuccess } from '../utils/apiResponse';
import { catchAsync } from '../utils/catchAsync';
import { CreatePollInput, UpdatePollInput } from '../types';

interface AuthRequest extends Request {
  user?: any;
}

export const getPolls = catchAsync(async (req: AuthRequest, res: Response) => {
  const polls = await PollService.getAllPolls(req.user.id, req.user.role);
  sendSuccess(res, polls);
});

export const getPoll = catchAsync(async (req: AuthRequest, res: Response) => {
  const poll = await PollService.getPollById(req.params.id as string, req.user?.id, req.user?.role);
  if (!poll) {
    return res.status(404).json({ success: false, message: 'Poll not found' });
  }
  sendSuccess(res, poll);
});

export const getPublicPoll = catchAsync(async (req: Request, res: Response) => {
  const poll = await PollService.getPublicPoll(req.params.id as string);
  if (!poll) {
    return res.status(404).json({ success: false, message: 'Poll not found' });
  }
  sendSuccess(res, poll);
});

export const createPoll = catchAsync(async (req: AuthRequest, res: Response) => {
  const input: CreatePollInput = req.body;
  const poll = await PollService.createPoll(input, req.user.id, req.user.role);
  sendSuccess(res, poll, 'Poll created successfully', 201);
});

export const updatePoll = catchAsync(async (req: AuthRequest, res: Response) => {
  const input: UpdatePollInput = req.body;
  const poll = await PollService.updatePoll(req.params.id as string, input, req.user.id, req.user.role);
  sendSuccess(res, poll, 'Poll updated successfully');
});

export const getPublicPolls = catchAsync(async (req: Request, res: Response) => {
  const polls = await PollService.getPublicPolls();
  sendSuccess(res, polls);
});

export const deletePoll = catchAsync(async (req: AuthRequest, res: Response) => {
  await PollService.deletePoll(req.params.id as string, req.user.id, req.user.role);
  sendSuccess(res, null, 'Poll deleted successfully');
});

export const getAssignedPrivatePolls = catchAsync(async (req: AuthRequest, res: Response) => {
  const polls = await PollService.getAssignedPrivatePolls(req.user.id);
  sendSuccess(res, polls);
});

export const getAssignedPrivatePoll = catchAsync(async (req: AuthRequest, res: Response) => {
  const poll = await PollService.getAssignedPrivatePollById(req.params.id as string, req.user.id, req.user.role);
  if (!poll) {
    return res.status(404).json({ success: false, message: 'Assigned private poll not found' });
  }
  sendSuccess(res, poll);
});