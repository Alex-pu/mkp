export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface AnalyticsResponseBreakdown {
  optionId?: string;
  optionText?: string;
  openText?: string;
  count: number;
  percentage: number;
  responseCount?: number;
}

export interface AnalyticsTextResponse {
  id: string;
  text: string;
  createdAt: Date;
}

export interface AnalyticsQuestion {
  id: string;
  text: string;
  type: string;
  totalResponses: number;
  responses: AnalyticsResponseBreakdown[];
  openTextResponses: AnalyticsTextResponse[];
}

export interface AnalyticsData {
  pollId: string;
  pollTitle: string;
  pollDescription?: string | null;
  isPublic: boolean;
  lifetimeResults: true;
  totalVotes: number;
  totalResponses: number;
  lastUpdatedAt: Date | null;
  questions: AnalyticsQuestion[];
}