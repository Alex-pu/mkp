import React, { useState, useEffect } from 'react';
import { pollService } from '../../services/pollService';
import { Poll, PaginationMeta } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PollCard from '../../components/poll/PollCard';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import PaginationControls from '../../components/common/PaginationControls';

const PUBLIC_POLLS_PAGE_SIZE = 9;

const PollListPage: React.FC = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    const fetchPolls = async () => {
      setLoading(true);
      try {
        const data = await pollService.getPublicPolls({
          page: currentPage,
          limit: PUBLIC_POLLS_PAGE_SIZE,
          search: search.trim() || undefined,
        });
        if (!Array.isArray(data)) {
          setPolls(data.items);
          setPagination(data.meta);
        }
      } catch (error) {
        setPolls([]);
        setPagination(null);
      } finally {
        setLoading(false);
      }
    };

    fetchPolls();
  }, [currentPage, search]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search]);

  if (loading) {
    return <LoadingSpinner />;
  }

  const displayedPolls = polls;

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div />
        <div className="w-full max-w-md">
          <Input label="Search polls" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Filter by title or description" />
        </div>
      </div>

      {displayedPolls.length === 0 ? (
        <Card className="rounded-3xl border border-dashed border-slate-300 bg-white text-slate-500 shadow-soft">
          {search.trim() ? 'No polls matched your search right now.' : 'No polls are available right now.'}
        </Card>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {displayedPolls.map((poll) => <PollCard key={poll.id} poll={poll} />)}
          </div>
          <PaginationControls currentPage={pagination?.page ?? 1} totalPages={pagination?.totalPages ?? 1} totalItems={pagination?.totalItems ?? polls.length} itemLabel="polls" onPageChange={setCurrentPage} />
        </>
      )}
    </div>
  );
};

export default PollListPage;
