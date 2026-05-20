import api from './api';
import type {
  CreateFbInput,
  FbReport,
  FbReportSummary,
  PaginatedFbReportSummary,
  PaginatedResult,
  PaginationParams,
} from '../types';

const toPaginatedResult = <T>(response: any): PaginatedResult<T> => ({
  items: response.data.data,
  meta: response.data.meta,
});

export const fbService = {
  async createReport(input: CreateFbInput): Promise<FbReport> {
    const response = await api.post('/fb', input);
    return response.data.data;
  },

  async getMyReports(params?: PaginationParams): Promise<FbReport[] | PaginatedResult<FbReport>> {
    if (params?.page !== undefined || params?.limit !== undefined) {
      const paginatedResponse = await api.get('/fb/me', { params });
      return toPaginatedResult<FbReport>(paginatedResponse);
    }

    const response = await api.get('/fb/me');
    return response.data.data;
  },

  async getSummary(params?: PaginationParams): Promise<FbReportSummary | PaginatedFbReportSummary> {
    const response = await api.get('/fb', { params });
    if (params?.page !== undefined || params?.limit !== undefined) {
      return {
        ...response.data.data,
        meta: response.data.meta,
      };
    }

    return response.data.data;
  },
};