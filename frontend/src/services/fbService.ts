import api from './api';
import { CreateFbInput, FbReport, FbReportSummary } from '../types';

export const fbService = {
  async createReport(input: CreateFbInput): Promise<FbReport> {
    const response = await api.post('/fb', input);
    return response.data.data;
  },

  async getMyReports(): Promise<FbReport[]> {
    const response = await api.get('/fb/me');
    return response.data.data;
  },

  async getSummary(): Promise<FbReportSummary> {
    const response = await api.get('/fb');
    return response.data.data;
  },
};