import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PaginationControls from '../../components/common/PaginationControls';
import { pollService } from '../../services/pollService';
import { PaginationMeta, Poll } from '../../types';
import PollListTable from '../../components/dashboard/PollListTable';

const POLLS_PAGE_SIZE = 10;

const PollsPage: React.FC = () => {
	const [polls, setPolls] = useState<Poll[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');
	const [currentPage, setCurrentPage] = useState(1);
	const [pagination, setPagination] = useState<PaginationMeta | null>(null);

	const loadPolls = async (page = currentPage) => {
		setLoading(true);
		try {
			const result = await pollService.getPolls({ page, limit: POLLS_PAGE_SIZE });
			if (!Array.isArray(result)) {
				setPolls(result.items);
				setPagination(result.meta);
			}
		} catch (loadError: any) {
			setError(loadError.response?.data?.error || 'Failed to load polls');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadPolls(currentPage);
	}, [currentPage]);

	const handleDelete = async (pollId: string) => {
		if (!window.confirm('Delete this poll and all responses? This cannot be undone.')) {
			return;
		}

		await pollService.deletePoll(pollId);
		await loadPolls(currentPage);
	};

	if (loading) {
		return <LoadingSpinner />;
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div />
				<Link to="/dashboard/polls/create"><Button>Create poll</Button></Link>
			</div>
			{error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}
			<PollListTable polls={polls} onDelete={handleDelete} />
			<PaginationControls currentPage={pagination?.page ?? 1} totalPages={pagination?.totalPages ?? 1} totalItems={pagination?.totalItems ?? polls.length} itemLabel="polls" onPageChange={setCurrentPage} />
		</div>
	);
};

export default PollsPage;
