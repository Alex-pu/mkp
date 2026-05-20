import { Prisma } from '@prisma/client';
import prisma from '../config/database';
import { VoteInput } from '../types';
import { generateVoterToken } from '../utils/helpers';

export class VoteService {
  static async submitVote(pollId: string, input: VoteInput, ipAddress?: string, userAgent?: string) {
    const poll = await prisma.poll.findFirst({
      where: { id: pollId, isActive: true },
      include: {
        questions: {
          include: { options: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!poll) {
      throw new Error('Poll not found or inactive');
    }

    if (input.responses.length !== poll.questions.length) {
      throw new Error('All questions must be answered');
    }

    const voterToken = input.voterToken?.trim();

    if (!voterToken) {
      const error = new Error('Missing voter token for public vote');
      (error as Error & { statusCode?: number }).statusCode = 400;
      throw error;
    }

    const existingVote = await prisma.vote.findFirst({
      where: {
        pollId,
        voterToken,
      },
      select: { id: true },
    });

    if (existingVote) {
      const error = new Error('You have already voted in this poll');
      (error as Error & { statusCode?: number }).statusCode = 409;
      throw error;
    }

    const responses = poll.questions.map((question: any) => {
      const response = input.responses.find((item) => item.questionId === question.id);

      if (!response) {
        throw new Error('All questions must be answered');
      }

      if (question.type === 'OPEN_TEXT') {
        if (!response.openText?.trim()) {
          throw new Error('Open text questions require a response');
        }

        return {
          pollId,
          questionId: question.id,
          optionId: null,
          optionText: null,
          openText: response.openText.trim(),
          voterToken,
          ipAddress,
          userAgent,
        };
      }

      if (!response.optionId) {
        throw new Error('Multiple choice questions require a selected option');
      }

      const selectedOption = question.options.find((option: any) => option.id === response.optionId);
      if (!selectedOption) {
        throw new Error('Selected option is invalid');
      }

      const needsCustomText = /other/i.test(selectedOption.text);
      const openText = response.openText?.trim() || null;

      if (needsCustomText && !openText) {
        throw new Error('Please provide a custom answer for the Others option');
      }

      return {
        pollId,
        questionId: question.id,
        optionId: selectedOption.id,
        optionText: selectedOption.text,
        openText,
        voterToken,
        ipAddress,
        userAgent,
      };
    });

    try {
      const [, createdResponses] = await prisma.$transaction([
        prisma.vote.create({
          data: {
            pollId,
            voterToken,
          },
        }),
        prisma.response.createMany({
          data: responses,
        }),
      ]);

      return createdResponses;
    } catch (error) {
      if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') {
        const duplicateVoteError = new Error('You have already voted in this poll');
        (duplicateVoteError as Error & { statusCode?: number }).statusCode = 409;
        throw duplicateVoteError;
      }

      throw error;
    }
  }

  static async submitAssignedVote(pollId: string, userId: string, role: 'SUPER_ADMIN' | 'ADMIN', input: VoteInput, ipAddress?: string, userAgent?: string) {
    const poll = await prisma.poll.findFirst({
      where: role === 'SUPER_ADMIN'
        ? { id: pollId, isActive: true, isPublic: false }
        : {
            id: pollId,
            isActive: true,
            isPublic: false,
            assignments: {
              some: { adminId: userId },
            },
          },
      include: {
        questions: {
          include: { options: true },
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!poll) {
      throw new Error('Assigned private poll not found or inactive');
    }

    if (input.responses.length !== poll.questions.length) {
      throw new Error('All questions must be answered');
    }

    const voterToken = generateVoterToken();

    const responses = poll.questions.map((question: any) => {
      const response = input.responses.find((item) => item.questionId === question.id);

      if (!response) {
        throw new Error('All questions must be answered');
      }

      if (question.type === 'OPEN_TEXT') {
        if (!response.openText?.trim()) {
          throw new Error('Open text questions require a response');
        }

        return {
          pollId,
          questionId: question.id,
          optionId: null,
          optionText: null,
          openText: response.openText.trim(),
          voterToken,
          ipAddress,
          userAgent,
        };
      }

      if (!response.optionId) {
        throw new Error('Multiple choice questions require a selected option');
      }

      const selectedOption = question.options.find((option: any) => option.id === response.optionId);
      if (!selectedOption) {
        throw new Error('Selected option is invalid');
      }

      const needsCustomText = /other/i.test(selectedOption.text);
      const openText = response.openText?.trim() || null;

      if (needsCustomText && !openText) {
        throw new Error('Please provide a custom answer for the Others option');
      }

      return {
        pollId,
        questionId: question.id,
        optionId: selectedOption.id,
        optionText: selectedOption.text,
        openText,
        voterToken,
        ipAddress,
        userAgent,
      };
    });

    const [, createdResponses] = await prisma.$transaction([
      prisma.vote.create({
        data: {
          pollId,
          voterToken,
        },
      }),
      prisma.response.createMany({
        data: responses,
      }),
    ]);

    return createdResponses;
  }
}