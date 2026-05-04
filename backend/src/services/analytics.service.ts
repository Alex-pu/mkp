import prisma from '../config/database';
import { AnalyticsData, AnalyticsTextResponse, PaginatedResult } from '../types';
import { buildPaginationMeta, PaginationOptions } from '../utils/pagination';

const getAnalyticsPollWhere = (pollId: string, userId?: string, role: 'SUPER_ADMIN' | 'ADMIN' = 'ADMIN') => (
  role === 'SUPER_ADMIN' ? { id: pollId } : userId ? { id: pollId, createdById: userId } : { id: pollId }
);

export class AnalyticsService {
  static async getPollAnalytics(pollId: string, userId?: string, role: 'SUPER_ADMIN' | 'ADMIN' = 'ADMIN'): Promise<AnalyticsData> {
    const poll = await prisma.poll.findFirst({
      where: getAnalyticsPollWhere(pollId, userId, role),
      include: {
        questions: {
          include: { options: true },
          orderBy: { order: 'asc' },
        },
        responses: true,
        votes: true,
      },
    });

    if (!poll) {
      throw new Error('Poll not found');
    }

    const questions = poll.questions.map((question: any) => {
      const responses = poll.responses.filter((response: any) => response.questionId === question.id);
      const totalResponses = responses.length;
      const openTextResponses = responses
        .filter((response: any) => response.openText)
        .map((response: any) => ({
          id: response.id,
          text: response.openText!,
          createdAt: response.createdAt,
        }));

      if (question.type === 'OPEN_TEXT') {
        return {
          id: question.id,
          text: question.text,
          type: question.type,
          totalResponses,
          responses: [
            {
              openText: `${openTextResponses.length} text responses`,
              count: openTextResponses.length,
              percentage: totalResponses > 0 ? 100 : 0,
            },
          ],
          openTextResponseCount: openTextResponses.length,
        };
      }

      const normalizeOptionText = (value?: string | null) => value?.trim().toLowerCase() || null;
      const matchedResponseIds = new Set<string>();
      const responsesData = question.options.map((option: any) => {
        const normalizedOptionText = normalizeOptionText(option.text);
        const optionResponses = responses.filter((response: any) => {
          if (matchedResponseIds.has(response.id)) {
            return false;
          }

          if (response.optionId === option.id) {
            matchedResponseIds.add(response.id);
            return true;
          }

          if (normalizeOptionText(response.optionText) === normalizedOptionText) {
            matchedResponseIds.add(response.id);
            return true;
          }

          return false;
        });

        return {
          optionId: option.id,
          optionText: option.text,
          count: optionResponses.length,
          percentage: totalResponses > 0 ? (optionResponses.length / totalResponses) * 100 : 0,
          responseCount: optionResponses.filter((response: any) => response.openText).length,
        };
      });

      const unmatchedResponses = responses.filter((response: any) => !matchedResponseIds.has(response.id));

      if (unmatchedResponses.length > 0) {
        responsesData.push({
          optionText: 'Historical / edited options',
          count: unmatchedResponses.length,
          percentage: totalResponses > 0 ? (unmatchedResponses.length / totalResponses) * 100 : 0,
          responseCount: unmatchedResponses.filter((response: any) => response.openText).length,
        });
      }

      return {
        id: question.id,
        text: question.text,
        type: question.type,
        totalResponses,
        responses: responsesData,
        openTextResponseCount: openTextResponses.length,
      };
    });

    return {
      pollId: poll.id,
      pollTitle: poll.title,
      pollDescription: poll.description,
      isPublic: poll.isPublic,
      lifetimeResults: true,
      totalVotes: poll.votes.length,
      totalResponses: poll.responses.length,
      lastUpdatedAt: poll.responses.length > 0
        ? poll.responses.reduce((latest: Date | null, response: any) => {
            if (!latest || response.createdAt > latest) {
              return response.createdAt;
            }

            return latest;
          }, null)
        : null,
      questions,
    };
  }

  static async getQuestionOpenTextResponses(
    pollId: string,
    questionId: string,
    pagination: PaginationOptions,
    userId?: string,
    role: 'SUPER_ADMIN' | 'ADMIN' = 'ADMIN',
  ): Promise<PaginatedResult<AnalyticsTextResponse>> {
    const poll = await prisma.poll.findFirst({
      where: getAnalyticsPollWhere(pollId, userId, role),
      select: {
        id: true,
        questions: {
          where: { id: questionId },
          select: { id: true },
        },
      },
    });

    if (!poll || poll.questions.length === 0) {
      throw new Error('Question not found');
    }

    const where = {
      pollId,
      questionId,
      openText: {
        not: null,
      },
    };

    const [totalItems, responses] = await prisma.$transaction([
      prisma.response.count({ where }),
      prisma.response.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: pagination.skip,
        take: pagination.limit,
        select: {
          id: true,
          openText: true,
          createdAt: true,
        },
      }),
    ]);

    return {
      items: responses.map((response) => ({
        id: response.id,
        text: response.openText ?? '',
        createdAt: response.createdAt,
      })),
      pagination: buildPaginationMeta(pagination.page, pagination.limit, totalItems),
    };
  }
}