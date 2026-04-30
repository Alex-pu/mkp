import api from './api';
import { VoteInput } from '../types';

export const voteService = {
  async submitVote(pollId: string, input: VoteInput): Promise<void> {
    await api.post(`/polls/${pollId}/vote`, input);
  },

  async submitAssignedVote(pollId: string, input: VoteInput): Promise<void> {
    await api.post(`/polls/assigned/private/${pollId}/vote`, input);
  },
};