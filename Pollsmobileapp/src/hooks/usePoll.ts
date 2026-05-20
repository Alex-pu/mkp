import { useCallback, useEffect, useState } from 'react';
import { pollService } from '../services/pollService';
import type { Poll } from '../types';

export const usePoll = (id?: string) => {
  const [poll, setPoll] = useState<Poll | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPoll = useCallback(async (pollId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await pollService.getPoll(pollId);
      setPoll(data);
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to fetch poll');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPublicPoll = useCallback(async (pollId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await pollService.getPublicPoll(pollId);
      setPoll(data);
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to fetch public poll');
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAssignedPrivatePoll = useCallback(async (pollId: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await pollService.getAssignedPrivatePoll(pollId);
      setPoll(data);
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to fetch assigned poll');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (id) {
      fetchPoll(id);
    }
  }, [fetchPoll, id]);

  return {
    poll,
    loading,
    error,
    setPoll,
    fetchPoll,
    fetchPublicPoll,
    fetchAssignedPrivatePoll,
  };
};