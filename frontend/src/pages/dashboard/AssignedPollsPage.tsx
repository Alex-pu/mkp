import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import Button from '../../components/common/Button';
import PaginationControls from '../../components/common/PaginationControls';
import { pollService } from '../../services/pollService';
import { PaginationMeta, Poll } from '../../types';

const ASSIGNED_POLLS_PAGE_SIZE = 6;

const AssignedPollsPage: React.FC = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  useEffect(() => {
    setLoading(true);
    pollService.getAssignedPrivatePolls({ page: currentPage, limit: ASSIGNED_POLLS_PAGE_SIZE })
      .then((result) => {
        if (!Array.isArray(result)) {
          setPolls(result.items);
          setPagination(result.meta);
        }
      })
      .catch((loadError: any) => setError(loadError.response?.data?.message || 'Failed to load assigned private polls'))
      .finally(() => setLoading(false));
  }, [currentPage]);

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">Assigned private polls</h1>
        <p className="mt-1 text-slate-500">These private polls are visible only inside the admin dashboard and can be voted on by assigned admins.</p>
      </div>

      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}

      {polls.length === 0 ? (
        <Card className="rounded-3xl border border-slate-200 bg-white shadow-soft">
          <h2 className="text-xl font-semibold text-slate-900">No assigned private polls</h2>
          <p className="mt-2 text-slate-500">When a super admin assigns a private poll to you, it will appear here.</p>
        </Card>
      ) : (
        <>
        <div className="grid gap-5 lg:grid-cols-2">
          {polls.map((poll) => (
            <Card key={poll.id} className="rounded-3xl border border-slate-200 bg-white shadow-soft">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <h2 className="text-xl font-semibold text-slate-900">{poll.title}</h2>
                    <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${poll.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
                      {poll.isActive ? 'Open for voting' : 'Inactive'}
                    </span>
                  </div>
                  <p className="mt-3 text-sm leading-7 text-slate-600">{poll.description || 'No description provided for this private poll.'}</p>
                </div>
              </div>
              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Questions</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{poll.questions.length}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Votes</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{poll.totalVotes}</p>
                </div>
                <div className="rounded-2xl bg-slate-50 px-4 py-3">
                  <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-500">Assigned admins</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">{poll.assignedAdmins.length}</p>
                </div>
              </div>
              <div className="mt-6 flex items-center justify-between">
                <p className="text-sm text-slate-500">Created {new Date(poll.createdAt).toLocaleDateString()}</p>
                <Link to={`/dashboard/assigned-polls/${poll.id}/vote`}>
                  <Button disabled={!poll.isActive}>{poll.isActive ? 'Vote on poll' : 'Unavailable'}</Button>
                </Link>
              </div>
            </Card>
          ))}
        </div>
        <PaginationControls currentPage={pagination?.page ?? 1} totalPages={pagination?.totalPages ?? 1} totalItems={pagination?.totalItems ?? polls.length} itemLabel="assigned polls" onPageChange={setCurrentPage} />
        </>
      )}
    </div>
  );
};

export default AssignedPollsPage;
