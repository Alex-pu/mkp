export interface FbReport {
  id: string;
  adminId: string;
  text: string;
  links: string[];
  createdAt: string;
  updatedAt: string;
  admin?: {
    id: string;
    email: string;
    name?: string | null;
  };
}

export interface FbReportSummaryItem {
  adminId: string;
  adminName?: string | null;
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

export interface CreateFbInput {
  text: string;
  links: string[];
}