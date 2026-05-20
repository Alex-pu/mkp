export interface Poll {
  id: string;
  title: string;
  description?: string | null;
  isActive: boolean;
  isPublic: boolean;
  createdById: string;
  createdAt: string;
  updatedAt: string;
  totalVotes: number;
  questions: Question[];
  assignedAdmins: AssignedAdmin[];
}

export interface AssignedAdmin {
  id: string;
  email: string;
  name?: string | null;
  role: 'SUPER_ADMIN' | 'ADMIN';
  isActive?: boolean;
}

export interface Question {
  id: string;
  pollId: string;
  text: string;
  type: 'MULTIPLE_CHOICE' | 'OPEN_TEXT';
  order: number;
  createdAt: string;
  updatedAt: string;
  options: Option[];
}

export interface Option {
  id: string;
  questionId: string;
  text: string;
  order: number;
  createdAt: string;
}

export interface CreatePollInput {
  title: string;
  description?: string;
  isActive?: boolean;
  isPublic?: boolean;
  assignedAdminIds?: string[];
  questions: CreateQuestionInput[];
}

export interface CreateQuestionInput {
  text: string;
  type: 'MULTIPLE_CHOICE' | 'OPEN_TEXT';
  order: number;
  options?: CreateOptionInput[];
}

export interface CreateOptionInput {
  id?: string;
  text: string;
  order: number;
}

export interface UpdatePollInput {
  title?: string;
  description?: string;
  isActive?: boolean;
  isPublic?: boolean;
  assignedAdminIds?: string[];
}