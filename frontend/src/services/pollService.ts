import api from './api';
import { Poll, CreatePollInput, UpdatePollInput } from '../types';

export const pollService = {
  async getPolls(): Promise<Poll[]> {
    const response = await api.get('/polls');
    return response.data.data;
  },

  async getPoll(id: string): Promise<Poll> {
    const response = await api.get(`/polls/${id}`);
    return response.data.data;
  },

  async getAssignedPrivatePolls(): Promise<Poll[]> {
    const response = await api.get('/polls/assigned/private');
    return response.data.data;
  },

  async getAssignedPrivatePoll(id: string): Promise<Poll> {
    const response = await api.get(`/polls/assigned/private/${id}`);
    return response.data.data;
  },

  async getPublicPoll(id: string): Promise<Poll> {
    const response = await api.get(`/polls/${id}/public`);
    return response.data.data;
  },

  async createPoll(input: CreatePollInput): Promise<Poll> {
    const response = await api.post('/polls', input);
    return response.data.data;
  },

  async updatePoll(id: string, input: UpdatePollInput): Promise<Poll> {
    const response = await api.put(`/polls/${id}`, input);
    return response.data.data;
  },

  async getPublicPolls(): Promise<Poll[]> {
    const response = await api.get('/polls/public');
    return response.data.data;
  },

  async deletePoll(id: string): Promise<void> {
    await api.delete(`/polls/${id}`);
  }
};