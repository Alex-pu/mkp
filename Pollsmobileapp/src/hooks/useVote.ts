import { useState } from 'react';
import { voteService } from '../services/voteService';
import type { VoteInput } from '../types';

export const useVote = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [alreadyVoted, setAlreadyVoted] = useState(false);

  const submitVote = async (pollId: string, input: VoteInput) => {
    setLoading(true);
    setError(null);
    setAlreadyVoted(false);

    try {
      await voteService.submitVote(pollId, input);
      return true;
    } catch (err: any) {
      const nextError = err.response?.data?.error || err.response?.data?.message || 'Failed to submit vote';
      setError(nextError);
      setAlreadyVoted(String(nextError).toLowerCase().includes('already voted'));
      return false;
    } finally {
      setLoading(false);
    }
  };

  const submitAssignedVote = async (pollId: string, input: VoteInput) => {
    setLoading(true);
    setError(null);
    setAlreadyVoted(false);

    try {
      await voteService.submitAssignedVote(pollId, input);
      return true;
    } catch (err: any) {
      setError(err.response?.data?.error || err.response?.data?.message || 'Failed to submit assigned poll vote');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    submitVote,
    submitAssignedVote,
    loading,
    error,
    alreadyVoted,
  };
};