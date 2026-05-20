import api from './api';
import { VoteInput } from '../types';
import { getPublicVoterToken } from '../utils/publicVoterToken';

export const voteService = {
  async submitVote(pollId: string, input: VoteInput): Promise<void> {
    await api.post(`/polls/${pollId}/vote`, {
      ...input,
      voterToken: getPublicVoterToken(),
    });
  },

  async submitAssignedVote(pollId: string, input: VoteInput): Promise<void> {
    await api.post(`/polls/assigned/private/${pollId}/vote`, input);
  },
};