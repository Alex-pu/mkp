import type { CreateOptionInput } from './poll';

export interface UpdateQuestionInput {
  text?: string;
  type?: 'MULTIPLE_CHOICE' | 'OPEN_TEXT';
  order?: number;
  options?: CreateOptionInput[];
}
