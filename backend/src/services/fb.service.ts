import prisma from '../config/database';
import { CreateFbInput, FbReport, FbReportSummary, FbReportSummaryItem } from '../types';

const mapFbReport = (report: {
  id: string;
  adminId: string;
  text: string;
  links: unknown;
  createdAt: Date;
  updatedAt: Date;
  admin?: {
    id: string;
    email: string;
    name: string | null;
  };
}): FbReport => ({
  id: report.id,
  adminId: report.adminId,
  text: report.text,
  links: Array.isArray(report.links) ? report.links.filter((link): link is string => typeof link === 'string') : [],
  createdAt: report.createdAt,
  updatedAt: report.updatedAt,
  admin: report.admin,
});

export class FbService {
  static async createReport(input: CreateFbInput, adminId: string): Promise<FbReport> {
    const admin = await prisma.user.findUnique({
      where: { id: adminId },
      select: { id: true, role: true, isActive: true },
    });

    if (!admin || !admin.isActive || !['ADMIN', 'SUPER_ADMIN'].includes(admin.role)) {
      throw new Error('Admin access required');
    }

    const normalizedLinks = [...new Set(input.links.map((link) => link.trim()).filter(Boolean))];

    const report = await prisma.fb.create({
      data: {
        adminId,
        text: input.text.trim(),
        links: normalizedLinks,
      },
      include: {
        admin: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
    });

    return mapFbReport(report);
  }

  static async getMyReports(adminId: string): Promise<FbReport[]> {
    const reports = await prisma.fb.findMany({
      where: { adminId },
      include: {
        admin: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return reports.map(mapFbReport);
  }

  static async getSummary(): Promise<FbReportSummary> {
    const reports = await prisma.fb.findMany({
      include: {
        admin: {
          select: {
            id: true,
            email: true,
            name: true,
          },
        },
      },
      orderBy: [
        { createdAt: 'desc' },
      ],
    });

    const mappedReports = reports.map(mapFbReport);
    const grouped = new Map<string, FbReportSummaryItem>();

    for (const report of mappedReports) {
      const existing = grouped.get(report.adminId);
      if (existing) {
        existing.pasteCount += 1;
        existing.linkCount += report.links.length;
        existing.reports.push(report);
        continue;
      }

      grouped.set(report.adminId, {
        adminId: report.adminId,
        adminName: report.admin?.name ?? null,
        adminEmail: report.admin?.email ?? 'Unknown admin',
        pasteCount: 1,
        linkCount: report.links.length,
        reports: [report],
      });
    }

    const items = Array.from(grouped.values()).sort((left, right) => {
      if (right.pasteCount !== left.pasteCount) {
        return right.pasteCount - left.pasteCount;
      }

      return left.adminEmail.localeCompare(right.adminEmail);
    });

    return {
      totalReports: mappedReports.length,
      totalLinks: mappedReports.reduce((sum, report) => sum + report.links.length, 0),
      adminsWithReports: items.length,
      items,
    };
  }
}