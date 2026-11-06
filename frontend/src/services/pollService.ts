import api from './api';
import { Poll, CreatePollInput, UpdatePollInput, PaginatedResult, PaginationParams } from '../types';

const toPaginatedResult = <T>(response: any): PaginatedResult<T> => ({
	items: response.data.data,
	meta: response.data.meta,
});

export const pollService = {
  async getPolls(params?: PaginationParams): Promise<Poll[] | PaginatedResult<Poll>> {
    const response = await api.get('/polls', { params });
    return params?.page !== undefined || params?.limit !== undefined ? toPaginatedResult<Poll>(response) : response.data.data;
  },

  async getPoll(id: string): Promise<Poll> {
    const response = await api.get(`/polls/${id}`);
    return response.data.data;
  },

  async downloadQuestionnaire(id: string): Promise<Blob> {
    const response = await api.get(`/polls/${id}/questionnaire.pdf`, { responseType: 'blob' });
    return response.data;
  },

  async getAssignedPrivatePolls(params?: PaginationParams): Promise<Poll[] | PaginatedResult<Poll>> {
    const response = await api.get('/polls/assigned/private', { params });
    return params?.page !== undefined || params?.limit !== undefined ? toPaginatedResult<Poll>(response) : response.data.data;
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

  async getPublicPolls(params?: PaginationParams): Promise<Poll[] | PaginatedResult<Poll>> {
    const response = await api.get('/polls/public', { params });
    return params?.page !== undefined || params?.limit !== undefined ? toPaginatedResult<Poll>(response) : response.data.data;
  },

  async deletePoll(id: string): Promise<void> {
    await api.delete(`/polls/${id}`);
  }
};
