import React, { useState, useEffect } from 'react';
import { pollService } from '../../services/pollService';
import { Poll } from '../../types';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PollCard from '../../components/poll/PollCard';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';

const PollListPage: React.FC = () => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchPolls = async () => {
      try {
        const data = await pollService.getPublicPolls();
        setPolls(data);
      } catch (error) {
        console.error('Failed to fetch polls:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPolls();
  }, []);

  if (loading) {
    return <LoadingSpinner />;
  }

  const filteredPolls = polls.filter((poll) => `${poll.title} ${poll.description || ''}`.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-4xl font-bold text-slate-900">Available polls</h1>
          <p className="mt-2 text-slate-600">Browse active polls and submit as many responses as you need.</p>
        </div>
        <div className="w-full max-w-md">
          <Input label="Search polls" value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Filter by title or description" />
        </div>
      </div>

      {filteredPolls.length === 0 ? (
        <Card className="rounded-3xl border border-dashed border-slate-300 bg-white text-slate-500 shadow-soft">
          No polls matched your search right now.
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
          {filteredPolls.map((poll) => <PollCard key={poll.id} poll={poll} />)}
        </div>
      )}
    </div>
  );
};

export default PollListPage;