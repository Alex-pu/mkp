import { useState, useEffect } from 'react';
import { analyticsService } from '../services/analyticsService';
import { AnalyticsData } from '../types';

export const useAnalytics = (pollId?: string) => {
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalytics = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyticsService.getPollAnalytics(id);
      setAnalytics(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch analytics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (pollId) {
      fetchAnalytics(pollId);
    }
  }, [pollId]);

  return {
    analytics,
    loading,
    error,
    fetchAnalytics,
  };
};