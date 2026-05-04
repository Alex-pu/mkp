import prisma from '../config/database';
import { CreateFbInput, FbReport, FbReportSummary, FbReportSummaryItem, PaginatedResult } from '../types';
import { buildPaginationMeta, paginateArray, PaginationOptions, withPaginationSummary } from '../utils/pagination';

interface GetMyReportsOptions {
  search?: string;
  last24HoursOnly?: boolean;
}

interface GetSummaryOptions {
  search?: string;
}

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

  static async getMyReports(adminId: string, options?: GetMyReportsOptions, pagination?: PaginationOptions): Promise<FbReport[] | PaginatedResult<FbReport>> {
    const where = { adminId };
    const include = {
      admin: {
        select: {
          id: true,
          email: true,
          name: true,
        },
      },
    };

    const reports = await prisma.fb.findMany({
      where,
      include,
      orderBy: { createdAt: 'desc' },
    });

    const mappedReports = reports.map(mapFbReport);
    const cutoff = options?.last24HoursOnly ? Date.now() - 24 * 60 * 60 * 1000 : null;
    const normalizedSearch = options?.search?.trim().toLowerCase();
    const filteredReports = mappedReports.filter((report) => {
      if (cutoff && new Date(report.createdAt).getTime() < cutoff) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return [report.text, ...report.links].join(' ').toLowerCase().includes(normalizedSearch);
    });

    if (!pagination) {
      return filteredReports;
    }

    const paginated = paginateArray(filteredReports, pagination);

    return {
      items: paginated.items,
      pagination: withPaginationSummary(paginated.pagination, {
        pasteCount: mappedReports.length,
        linkCount: mappedReports.reduce((sum, report) => sum + report.links.length, 0),
      }),
    };
  }

  static async getSummary(options?: GetSummaryOptions, pagination?: PaginationOptions): Promise<FbReportSummary | { data: FbReportSummary; pagination: ReturnType<typeof buildPaginationMeta> }> {
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

    const normalizedSearch = options?.search?.trim().toLowerCase();
    const filteredItems = !normalizedSearch
      ? items
      : items.filter((item) => [
          item.adminName || '',
          item.adminEmail,
          ...item.reports.flatMap((report) => [report.text, ...report.links]),
        ].join(' ').toLowerCase().includes(normalizedSearch));

    const summary: FbReportSummary = {
      totalReports: mappedReports.length,
      totalLinks: mappedReports.reduce((sum, report) => sum + report.links.length, 0),
      adminsWithReports: items.length,
      items: filteredItems,
    };

    if (!pagination) {
      return summary;
    }

    const paginated = paginateArray(filteredItems, pagination);

    return {
      data: {
        ...summary,
        items: paginated.items,
      },
      pagination: paginated.pagination,
    };
  }
}