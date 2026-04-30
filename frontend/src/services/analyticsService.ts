import api from './api';
import { AnalyticsData } from '../types';

export const analyticsService = {
  async getPollAnalytics(pollId: string): Promise<AnalyticsData> {
    const response = await api.get(`/polls/${pollId}/analytics`);
    return response.data.data;
  },
};