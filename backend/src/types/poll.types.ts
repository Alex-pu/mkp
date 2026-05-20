import { z } from 'zod';

export const CreatePollSchema = z.object({
  title: z.string().min(1),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  assignedAdminIds: z.array(z.string()).optional(),
  questions: z.array(z.object({
    text: z.string().min(1),
    type: z.enum(['MULTIPLE_CHOICE', 'OPEN_TEXT']),
    order: z.number().int().min(0),
    options: z.array(z.object({
      text: z.string().min(1),
      order: z.number().int().min(0),
    })).optional(),
  })),
});

export const UpdatePollSchema = z.object({
  title: z.string().min(1).optional(),
  description: z.string().optional(),
  isActive: z.boolean().optional(),
  isPublic: z.boolean().optional(),
  assignedAdminIds: z.array(z.string()).optional(),
});

export const CreateQuestionSchema = z.object({
  text: z.string().min(1),
  type: z.enum(['MULTIPLE_CHOICE', 'OPEN_TEXT']),
  order: z.number().int().min(0),
  options: z.array(z.object({
    text: z.string().min(1),
    order: z.number().int().min(0),
  })).optional(),
});

export const UpdateQuestionSchema = z.object({
  text: z.string().min(1).optional(),
  type: z.enum(['MULTIPLE_CHOICE', 'OPEN_TEXT']).optional(),
  order: z.number().int().min(0).optional(),
  options: z.array(z.object({
    id: z.string().optional(),
    text: z.string().min(1),
    order: z.number().int().min(0),
  })).optional(),
});

export const VoteSchema = z.object({
  voterToken: z.string().min(1).optional(),
  responses: z.array(z.object({
    questionId: z.string(),
    optionId: z.string().optional(),
    openText: z.string().optional(),
  })).min(1),
});

export type CreatePollInput = z.infer<typeof CreatePollSchema>;
export type UpdatePollInput = z.infer<typeof UpdatePollSchema>;
export type CreateQuestionInput = z.infer<typeof CreateQuestionSchema>;
export type UpdateQuestionInput = z.infer<typeof UpdateQuestionSchema>;
export type VoteInput = z.infer<typeof VoteSchema>;

export interface Poll {
  id: string;
  title: string;
  description: string | null;
  isActive: boolean;
  isPublic: boolean;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  totalVotes: number;
  questions: Question[];
  assignedAdmins: AssignedAdmin[];
}

export interface AssignedAdmin {
  id: string;
  email: string;
  name: string | null;
  role: 'SUPER_ADMIN' | 'ADMIN';
}

export interface Question {
  id: string;
  pollId: string;
  text: string;
  type: 'MULTIPLE_CHOICE' | 'OPEN_TEXT';
  order: number;
  createdAt: Date;
  updatedAt: Date;
  options: Option[];
}

export interface Option {
  id: string;
  questionId: string;
  text: string;
  order: number;
  createdAt: Date;
}

export interface Response {
  id: string;
  pollId: string;
  questionId: string;
  optionId: string | null;
  optionText: string | null;
  openText: string | null;
  voterToken: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: Date;
}