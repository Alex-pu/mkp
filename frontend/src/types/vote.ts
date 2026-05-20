export interface VoteInput {
  voterToken?: string;
  responses: ResponseInput[];
}

export interface ResponseInput {
  questionId: string;
  optionId?: string;
  openText?: string;
}

export interface AnalyticsData {
  pollId: string;
  pollTitle: string;
  pollDescription?: string | null;
  isPublic: boolean;
  lifetimeResults: true;
  totalVotes: number;
  totalResponses: number;
  lastUpdatedAt: string | null;
  questions: AnalyticsQuestion[];
}

export interface AnalyticsQuestion {
  id: string;
  text: string;
  type: 'MULTIPLE_CHOICE' | 'OPEN_TEXT';
  totalResponses: number;
  responses: AnalyticsBreakdown[];
  openTextResponseCount: number;
}

export interface AnalyticsBreakdown {
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
  createdAt: string;
}