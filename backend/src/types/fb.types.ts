import { z } from 'zod';

const reportLinkSchema = z.string().trim().url('Each link must be a valid URL');

export const CreateFbSchema = z.object({
  text: z.string().trim().min(1, 'Text is required').max(5000, 'Text is too long'),
  links: z.array(reportLinkSchema).min(1, 'At least one link is required').max(100, 'Too many links submitted at once'),
});

export type CreateFbInput = z.infer<typeof CreateFbSchema>;

export interface FbReport {
  id: string;
  adminId: string;
  text: string;
  links: string[];
  createdAt: Date;
  updatedAt: Date;
  admin?: {
    id: string;
    email: string;
    name: string | null;
  };
}

export interface FbReportSummaryItem {
  adminId: string;
  adminName: string | null;
  adminEmail: string;
  pasteCount: number;
  linkCount: number;
  reports: FbReport[];
}

export interface FbReportSummary {
  totalReports: number;
  totalLinks: number;
  adminsWithReports: number;
  items: FbReportSummaryItem[];
}