import api from './api';
import type { AnalyticsData, AnalyticsTextResponse, PaginatedResult, PaginationParams } from '../types';

const toPaginatedResult = <T>(response: any): PaginatedResult<T> => ({
  items: response.data.data,
  meta: response.data.meta,
});

export const analyticsService = {
  async getPollAnalytics(pollId: string): Promise<AnalyticsData> {
    const response = await api.get(`/polls/${pollId}/analytics`);
    return response.data.data;
  },

  async getQuestionOpenTextResponses(
    pollId: string,
    questionId: string,
    params: PaginationParams,
  ): Promise<PaginatedResult<AnalyticsTextResponse>> {
    const response = await api.get(`/polls/${pollId}/questions/${questionId}/open-text-responses`, { params });
    return toPaginatedResult<AnalyticsTextResponse>(response);
  },
};