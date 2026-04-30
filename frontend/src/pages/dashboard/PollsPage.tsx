import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Button from '../../components/common/Button';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { pollService } from '../../services/pollService';
import { Poll } from '../../types';
import PollListTable from '../../components/dashboard/PollListTable';

const PollsPage: React.FC = () => {
	const [polls, setPolls] = useState<Poll[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState('');

	const loadPolls = async () => {
		setLoading(true);
		try {
			setPolls(await pollService.getPolls());
		} catch (loadError: any) {
			setError(loadError.response?.data?.error || 'Failed to load polls');
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		loadPolls();
	}, []);

	const handleDelete = async (pollId: string) => {
		if (!window.confirm('Delete this poll and all responses? This cannot be undone.')) {
			return;
		}

		await pollService.deletePoll(pollId);
		await loadPolls();
	};

	if (loading) {
		return <LoadingSpinner />;
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<div>
					<h1 className="text-3xl font-bold text-gray-900">Your polls</h1>
					<p className="text-gray-600 mt-1">Review, edit, and inspect analytics for each poll.</p>
				</div>
				<Link to="/dashboard/polls/create"><Button>Create poll</Button></Link>
			</div>
			{error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}
			<PollListTable polls={polls} onDelete={handleDelete} />
		</div>
	);
};

export default PollsPage;
