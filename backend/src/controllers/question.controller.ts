import { Request, Response } from 'express';
import { QuestionService } from '../services/question.service';
import { sendSuccess } from '../utils/apiResponse';
import { catchAsync } from '../utils/catchAsync';
import { CreateQuestionInput, UpdateQuestionInput } from '../types';

interface AuthRequest extends Request {
  user?: {
    id: string;
    role: 'SUPER_ADMIN' | 'ADMIN';
  };
}

export const createQuestion = catchAsync(async (req: AuthRequest, res: Response) => {
  const input: CreateQuestionInput = req.body;
  const question = await QuestionService.createQuestion(req.params.pollId as string, input, req.user!.id, req.user!.role);
  sendSuccess(res, question, 'Question created successfully', 201);
});

export const updateQuestion = catchAsync(async (req: AuthRequest, res: Response) => {
  const input: UpdateQuestionInput = req.body;
  const question = await QuestionService.updateQuestion(req.params.id as string, input, req.user!.id, req.user!.role);
  sendSuccess(res, question, 'Question updated successfully');
});

export const deleteQuestion = catchAsync(async (req: AuthRequest, res: Response) => {
  await QuestionService.deleteQuestion(req.params.id as string, req.user!.id, req.user!.role);
  sendSuccess(res, null, 'Question deleted successfully');
});