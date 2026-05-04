import React, { useEffect, useMemo, useState } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PaginationControls from '../../components/common/PaginationControls';
import { fbService } from '../../services/fbService';
import { FbReport, FbReportSummary, PaginatedFbReportSummary, PaginationMeta } from '../../types';
import { useAuth } from '../../hooks/useAuth';

const ADMIN_REPORTS_PAGE_SIZE = 5;
const SUPER_ADMIN_REPORTS_PAGE_SIZE = 4;

const parseLinks = (value: string) => value
  .split(/\r?\n|,/)
  .map((item) => item.trim())
  .filter(Boolean);

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
  const [adminPagination, setAdminPagination] = useState<PaginationMeta | null>(null);
  const [superAdminPagination, setSuperAdminPagination] = useState<PaginationMeta | null>(null);

  const isSuperAdmin = user?.role === 'SUPER_ADMIN';
  const normalizedFilter = filter.trim();

  const loadData = async (pageOverride?: number) => {
    setLoading(true);
    setError('');

    try {
      if (isSuperAdmin) {
        const result = await fbService.getSummary({
          page: pageOverride ?? superAdminPage,
          limit: SUPER_ADMIN_REPORTS_PAGE_SIZE,
          search: normalizedFilter || undefined,
        });
        const paginatedSummary = result as PaginatedFbReportSummary;
        setSummary(paginatedSummary);
        setSuperAdminPagination(paginatedSummary.meta);
        setReports([]);
        setAdminPagination(null);
      } else {
        const result = await fbService.getMyReports({
          page: pageOverride ?? adminPage,
          limit: ADMIN_REPORTS_PAGE_SIZE,
          search: normalizedFilter || undefined,
          last24HoursOnly: true,
        });
        if (!Array.isArray(result)) {
          setReports(result.items);
          setAdminPagination(result.meta);
        }
        setSummary(null);
        setSuperAdminPagination(null);
      }
    } catch (loadError: any) {
      setError(loadError.response?.data?.message || 'Failed to load Facebook and WhatsApp reports');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [adminPage, isSuperAdmin, normalizedFilter, superAdminPage]);

  useEffect(() => {
    setAdminPage(1);
    setSuperAdminPage(1);
  }, [filter, isSuperAdmin]);

  const adminTotals = useMemo(() => ({
    pasteCount: adminPagination?.summary?.pasteCount ?? reports.length,
    linkCount: adminPagination?.summary?.linkCount ?? reports.reduce((sum, report) => sum + report.links.length, 0),
  }), [adminPagination, reports]);

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
      setText('');
      setLinksText('');
      setMessage('Report submitted successfully.');
      setAdminPage(1);
      if (!isSuperAdmin) {
        setReports((current) => [created, ...current]);
        await loadData(1);
      }
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
    <div className="space-y-5">
      {error ? <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div> : null}
      {message ? <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{message}</div> : null}

      <Card className="rounded-xl border border-slate-300 bg-slate-50 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">Filter reports</h2>
            <p className="mt-1 text-sm text-slate-600">
              {isSuperAdmin
                ? 'Search by admin name, email, report text, or pasted link.'
                : 'Search your submitted report text and pasted links.'}
            </p>
          </div>
          <div className="w-full lg:max-w-md">
            <input
              value={filter}
              onChange={(event) => setFilter(event.target.value)}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
              placeholder={isSuperAdmin ? 'Search admin, text, or link' : 'Search text or link'}
            />
          </div>
        </div>
      </Card>

      {isSuperAdmin ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card className="rounded-xl border border-slate-300 bg-white shadow-sm">
              <p className="text-sm font-medium text-slate-600">Total reports</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{summary?.totalReports ?? 0}</p>
            </Card>
            <Card className="rounded-xl border border-slate-300 bg-white shadow-sm">
              <p className="text-sm font-medium text-slate-600">Total pasted links</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{summary?.totalLinks ?? 0}</p>
            </Card>
            <Card className="rounded-xl border border-slate-300 bg-white shadow-sm">
              <p className="text-sm font-medium text-slate-600">Admins with reports</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{summary?.adminsWithReports ?? 0}</p>
            </Card>
          </div>

          {summary && summary.items.length > 0 ? (
            <div className="space-y-4">
              {summary.items.map((item) => (
                <Card key={item.adminId} className="rounded-xl border border-slate-300 bg-white shadow-sm">
                  <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
                    <div>
                      <h2 className="text-lg font-semibold text-slate-900">{item.adminName || item.adminEmail}</h2>
                      <p className="mt-1 text-sm text-slate-600">{item.adminEmail}</p>
                    </div>
                    <div className="flex flex-wrap gap-3">
                      <span className="rounded-md border border-slate-300 bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">{item.pasteCount} pastes</span>
                      <span className="rounded-md border border-slate-300 bg-slate-100 px-3 py-1.5 text-sm font-semibold text-slate-700">{item.linkCount} links</span>
                    </div>
                  </div>

                  <div className="mt-5 space-y-3">
                    {item.reports.map((report) => (
                      <div key={report.id} className="rounded-lg border border-slate-300 bg-slate-50 p-4">
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                          <p className="text-sm font-semibold text-slate-900">Report text</p>
                          <p className="text-xs font-medium text-slate-500">
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
                              className="block break-all text-sm font-medium text-slate-700 underline underline-offset-2 hover:text-slate-900"
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
                currentPage={superAdminPagination?.page ?? 1}
                totalPages={superAdminPagination?.totalPages ?? 1}
                totalItems={superAdminPagination?.totalItems ?? summary.items.length}
                itemLabel="admin groups"
                onPageChange={setSuperAdminPage}
                className="mt-6 border-t border-slate-200 pt-4"
              />
            </div>
          ) : (
            <Card className="rounded-xl border border-slate-300 bg-white shadow-sm">
              <h2 className="text-lg font-semibold text-slate-900">No reports found</h2>
              <p className="mt-2 text-sm text-slate-600">
                {filter ? 'Try a different search term to find matching reports.' : 'Reports submitted by admins will appear here with their text, links, and paste totals.'}
              </p>
            </Card>
          )}
        </>
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <Card className="rounded-xl border border-slate-300 bg-white shadow-sm">
              <p className="text-sm font-medium text-slate-600">Your pastes</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{adminTotals.pasteCount}</p>
            </Card>
            <Card className="rounded-xl border border-slate-300 bg-white shadow-sm">
              <p className="text-sm font-medium text-slate-600">Your pasted links</p>
              <p className="mt-2 text-3xl font-bold text-slate-900">{adminTotals.linkCount}</p>
            </Card>
          </div>

          <Card className="rounded-xl border border-slate-300 bg-white shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Submit a report</h2>
            <p className="mt-2 text-sm text-slate-600">Add your report notes and paste one or more Facebook or WhatsApp links. Put each link on a new line.</p>
            <form onSubmit={handleSubmit} className="mt-6 space-y-4">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Report text</label>
                <textarea
                  rows={6}
                  value={text}
                  onChange={(event) => setText(event.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  placeholder="Write what was posted, shared, or reported..."
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Links</label>
                <textarea
                  rows={6}
                  value={linksText}
                  onChange={(event) => setLinksText(event.target.value)}
                  className="w-full rounded-md border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  placeholder={'https://facebook.com/...\nhttps://chat.whatsapp.com/...'}
                />
              </div>
              <Button type="submit" disabled={submitting}>{submitting ? 'Submitting...' : 'Submit report'}</Button>
            </form>
          </Card>

          <Card className="rounded-xl border border-slate-300 bg-white shadow-sm">
            <h2 className="text-lg font-semibold text-slate-900">Your submitted reports</h2>
            <p className="mt-2 text-sm text-slate-600">Showing only reports from the last 24 hours.</p>

            {reports.length > 0 ? (
              <div className="mt-6 space-y-3">
                {reports.map((report) => (
                  <div key={report.id} className="rounded-lg border border-slate-300 bg-slate-50 p-4">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <p className="text-sm font-semibold text-slate-900">Submitted report</p>
                      <p className="text-xs font-medium text-slate-500">{new Date(report.createdAt).toLocaleString()}</p>
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
                          className="block break-all text-sm font-medium text-slate-700 underline underline-offset-2 hover:text-slate-900"
                        >
                          {link}
                        </a>
                      ))}
                    </div>
                  </div>
                ))}

                <PaginationControls
                  currentPage={adminPagination?.page ?? 1}
                  totalPages={adminPagination?.totalPages ?? 1}
                  totalItems={adminPagination?.totalItems ?? reports.length}
                  itemLabel="reports"
                  onPageChange={setAdminPage}
                  className="mt-6 border-t border-slate-200 pt-4"
                />
              </div>
            ) : (
              <p className="mt-6 text-sm text-slate-600">{filter ? 'No reports from the last 24 hours match your search.' : 'No reports submitted in the last 24 hours.'}</p>
            )}
          </Card>
        </>
      )}
    </div>
  );
};

export default FacebookReportsPage;