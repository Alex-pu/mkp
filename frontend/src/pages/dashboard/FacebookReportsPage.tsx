import React, { useEffect, useMemo, useState } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { fbService } from '../../services/fbService';
import { FbReport, FbReportSummary } from '../../types';
import { useAuth } from '../../hooks/useAuth';

const ADMIN_REPORTS_PAGE_SIZE = 5;
const SUPER_ADMIN_REPORTS_PAGE_SIZE = 4;

const parseLinks = (value: string) => value
  .split(/\r?\n|,/)
  .map((item) => item.trim())
  .filter(Boolean);

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemLabel: string;
  onPageChange: (page: number) => void;
}

const PaginationControls: React.FC<PaginationControlsProps> = ({ currentPage, totalPages, totalItems, itemLabel, onPageChange }) => {
  if (totalItems === 0) {
    return null;
  }

  return (
    <div className="mt-6 flex flex-col gap-3 border-t border-slate-200 pt-4 sm:flex-row sm:items-center sm:justify-between">
      <p className="text-sm text-slate-500">
        Showing page {currentPage} of {totalPages} · {totalItems} {itemLabel}
      </p>
      {totalPages > 1 ? (
        <div className="flex items-center gap-3">
          <Button type="button" variant="secondary" size="sm" onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1}>
            Previous
          </Button>
          <span className="text-sm font-medium text-slate-600">{currentPage} / {totalPages}</span>
          <Button type="button" variant="secondary" size="sm" onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages}>
            Next
          </Button>
        </div>
      ) : null}
    </div>
  );
};

const FacebookReportsPage: React.FC = () => {
  const { user } = useAuth();
  const [text, setText] = useState('');
  const [linksText, setLinksText] = useState('');
  const [reports, setReports] = useState<FbReport[]>([]);
  const [summary, setSummary] = useState<FbReportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [filter, setFilter] = useState('');
  const [adminPage, setAdminPage] = useState(1);
  const [superAdminPage, setSuperAdminPage] = useState(1);

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const normalizedFilter = filter.trim().toLowerCase();

  const loadData = async () => {
    setLoading(true);
    setError('');

    try {
      if (isSuperAdmin) {
        setSummary(await fbService.getSummary());
        setReports([]);
      } else {
        setReports(await fbService.getMyReports());
        setSummary(null);
      }
    } catch (loadError: any) {
      setError(loadError.response?.data?.message || 'Failed to load Facebook and WhatsApp reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [isSuperAdmin]);

  useEffect(() => {
    setAdminPage(1);
    setSuperAdminPage(1);
  }, [filter, isSuperAdmin]);

  const adminTotals = useMemo(() => ({
    pasteCount: reports.length,
    linkCount: reports.reduce((sum, report) => sum + report.links.length, 0),
  }), [reports]);

  const filteredReports = useMemo(() => {
    if (!normalizedFilter) {
      return reports;
    }

    return reports.filter((report) => {
      const searchable = [
        report.text,
        ...report.links,
      ].join(' ').toLowerCase();

      return searchable.includes(normalizedFilter);
    });
  }, [normalizedFilter, reports]);

  const totalAdminPages = Math.max(1, Math.ceil(filteredReports.length / ADMIN_REPORTS_PAGE_SIZE));
  const paginatedReports = useMemo(() => {
    const startIndex = (adminPage - 1) * ADMIN_REPORTS_PAGE_SIZE;
    return filteredReports.slice(startIndex, startIndex + ADMIN_REPORTS_PAGE_SIZE);
  }, [adminPage, filteredReports]);

  const filteredSummaryItems = useMemo(() => {
    if (!summary) {
      return [];
    }

    if (!normalizedFilter) {
      return summary.items;
    }

    return summary.items.filter((item) => {
      const searchable = [
        item.adminName || '',
        item.adminEmail,
        ...item.reports.flatMap((report) => [report.text, ...report.links]),
      ].join(' ').toLowerCase();

      return searchable.includes(normalizedFilter);
    });
  }, [normalizedFilter, summary]);

  const totalSuperAdminPages = Math.max(1, Math.ceil(filteredSummaryItems.length / SUPER_ADMIN_REPORTS_PAGE_SIZE));
  const paginatedSummaryItems = useMemo(() => {
    const startIndex = (superAdminPage - 1) * SUPER_ADMIN_REPORTS_PAGE_SIZE;
    return filteredSummaryItems.slice(startIndex, startIndex + SUPER_ADMIN_REPORTS_PAGE_SIZE);
  }, [filteredSummaryItems, superAdminPage]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const links = parseLinks(linksText);

    if (!text.trim()) {
      setError('Please enter the report text.');
      return;
    }

    if (links.length === 0) {
      setError('Please paste at least one valid link.');
      return;
    }

    setSubmitting(true);
    setError('');
    setMessage('');

    try {
      const created = await fbService.createReport({ text: text.trim(), links });
      setReports((current) => [created, ...current]);
      setText('');
      setLinksText('');
      setMessage('Report submitted successfully.');
    } catch (submitError: any) {
      setError(submitError.response?.data?.message || 'Failed to submit report');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Facebook and WhatsApp Reports</h1>
        <p className="mt-1 text-slate-500">
          {isSuperAdmin
            ? 'Review what each admin pasted, including report text, links, and total paste counts.'
            : 'Paste your Facebook and WhatsApp report text and links for super admin review.'}
        </p>
      </div>

      {error ? <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div> : null}
      {message ? <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{message}</div> : null}

      <Card className="rounded-3xl border border-slate-200 bg-white shadow-soft">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-xl font-semibold text-slate-900">Filter reports</h2>
            <p className="mt-1 text-sm text-slate-500">
              {isSuperAdmin
                ? 'Search by admin name, email, report text, or pasted link.'
                : 'Search your submitted report text and pasted links.'}
            </p>
          </div>
          <div className="w-full lg:max-w-md">
            <input
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
              placeholder={isSuperAdmin ? 'Search admin, text, or link' : 'Search text or link'}
            />
          </div>
        </div>
      </Card>

      {isSuperAdmin ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="rounded-3xl border border-slate-200 bg-white shadow-soft">
              <p className="text-sm text-slate-500">Total reports</p>
              <p className="text-3xl font-bold text-slate-900">{summary?.totalReports ?? 0}</p>
            </Card>
            <Card className="rounded-3xl border border-slate-200 bg-white shadow-soft">
              <p className="text-sm text-slate-500">Total pasted links</p>
              <p className="text-3xl font-bold text-slate-900">{summary?.totalLinks ?? 0}</p>
            </Card>
            <Card className="rounded-3xl border border-slate-200 bg-white shadow-soft">
              <p className="text-sm text-slate-500">Admins with reports</p>
              <p className="text-3xl font-bold text-slate-900">{summary?.adminsWithReports ?? 0}</p>
            </Card>
          </div>

          {summary && filteredSummaryItems.length > 0 ? (
            <div className="space-y-5">
              {paginatedSummaryItems.map((item) => (
                <Card key={item.adminId} className="rounded-3xl border border-slate-200 bg-white shadow-soft">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h2 className="text-xl font-semibold text-slate-900">{item.adminName || item.adminEmail}</h2>
                      <p className="mt-1 text-sm text-slate-500">{item.adminEmail}</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <span className="rounded-full bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700">{item.pasteCount} pastes</span>
                      <span className="rounded-full bg-violet-50 px-4 py-2 text-sm font-semibold text-violet-700">{item.linkCount} links</span>
                    </div>
                  </div>

                  <div className="mt-6 space-y-4">
                    {item.reports.map((report) => (
                      <div key={report.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-sm font-semibold text-slate-900">Report text</p>
                          <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">
                            {new Date(report.createdAt).toLocaleString()}
                          </p>
                        </div>
                        <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{report.text}</p>
                        <div className="mt-4 space-y-2">
                          <p className="text-sm font-semibold text-slate-900">Links</p>
                          {report.links.map((link) => (
                            <a
                              key={`${report.id}-${link}`}
                              href={link}
                              target="_blank"
                              rel="noreferrer"
                              className="block break-all text-sm font-medium text-blue-600 hover:text-blue-700"
                            >
                              {link}
                            </a>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </Card>
              ))}

              <PaginationControls
                currentPage={superAdminPage}
                totalPages={totalSuperAdminPages}
                totalItems={filteredSummaryItems.length}
                itemLabel="admin groups"
                onPageChange={setSuperAdminPage}
              />
            </div>
          ) : (
            <Card className="rounded-3xl border border-slate-200 bg-white shadow-soft">
              <h2 className="text-xl font-semibold text-slate-900">No reports found</h2>
              <p className="mt-2 text-sm text-slate-500">
                {filter ? 'Try a different search term to find matching reports.' : 'Reports submitted by admins will appear here with their text, links, and paste totals.'}
              </p>
            </Card>
          )}
        </>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="rounded-3xl border border-slate-200 bg-white shadow-soft">
              <p className="text-sm text-slate-500">Your pastes</p>
              <p className="text-3xl font-bold text-slate-900">{adminTotals.pasteCount}</p>
            </Card>
            <Card className="rounded-3xl border border-slate-200 bg-white shadow-soft">
              <p className="text-sm text-slate-500">Your pasted links</p>
              <p className="text-3xl font-bold text-slate-900">{adminTotals.linkCount}</p>
            </Card>
          </div>

          <Card className="rounded-3xl border border-slate-200 bg-white shadow-soft">
            <h2 className="text-xl font-semibold text-slate-900">Submit a report</h2>
            <p className="mt-2 text-sm text-slate-500">Add your report notes and paste one or more Facebook or WhatsApp links. Put each link on a new line.</p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Report text</label>
                <textarea
                  rows={6}
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  placeholder="Write what was posted, shared, or reported..."
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Links</label>
                <textarea
                  rows={6}
                  value={linksText}
                  onChange={(event) => setLinksText(event.target.value)}
                  className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
                  placeholder={'https://facebook.com/...\nhttps://chat.whatsapp.com/...'}
                />
              </div>
              <Button type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit report'}</Button>
            </form>
          </Card>

          <Card className="rounded-3xl border border-slate-200 bg-white shadow-soft">
            <h2 className="text-xl font-semibold text-slate-900">Your submitted reports</h2>

            {filteredReports.length > 0 ? (
              <div className="mt-6 space-y-4">
                {paginatedReports.map((report) => (
                  <div key={report.id} className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm font-semibold text-slate-900">Submitted report</p>
                      <p className="text-xs font-medium uppercase tracking-[0.18em] text-slate-500">{new Date(report.createdAt).toLocaleString()}</p>
                    </div>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-slate-700">{report.text}</p>
                    <div className="mt-4 space-y-2">
                      <p className="text-sm font-semibold text-slate-900">Links</p>
                      {report.links.map((link) => (
                        <a
                          key={`${report.id}-${link}`}
                          href={link}
                          target="_blank"
                          rel="noreferrer"
                          className="block break-all text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                          {link}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}

                <PaginationControls
                  currentPage={adminPage}
                  totalPages={totalAdminPages}
                  totalItems={filteredReports.length}
                  itemLabel="reports"
                  onPageChange={setAdminPage}
                />
              </div>
            ) : (
              <p className="mt-6 text-sm text-slate-500">{filter ? 'No submitted reports match your search.' : 'No reports submitted yet.'}</p>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default FacebookReportsPage;