import api from './api';
import { CreateQuestionInput, Question, UpdateQuestionInput } from '../types';

export const questionService = {
  async createQuestion(pollId: string, input: CreateQuestionInput): Promise<Question> {
    const response = await api.post(`/polls/${pollId}/questions`, input);
    return response.data.data;
  },

  async updateQuestion(id: string, input: UpdateQuestionInput): Promise<Question> {
    const response = await api.put(`/questions/${id}`, input);
    return response.data.data;
  },

  async deleteQuestion(id: string): Promise<void> {
    await api.delete(`/questions/${id}`);
  },
};