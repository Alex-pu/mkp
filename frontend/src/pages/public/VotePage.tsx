import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { usePoll } from '../../hooks/usePoll';
import { useVote } from '../../hooks/useVote';
import VoteForm from '../../components/poll/VoteForm';
import VoteSuccess from '../../components/poll/VoteSuccess';

const VotePage: React.FC = () => {
	const { id } = useParams();
	const { poll, loading, error, fetchPublicPoll } = usePoll();
	const { submitVote, loading: submitting, error: submitError } = useVote();
	const [submitted, setSubmitted] = useState(false);

	useEffect(() => {
		if (id) {
			fetchPublicPoll(id);
		}
	}, [fetchPublicPoll, id]);

	const handleSubmit = async (input: Parameters<typeof submitVote>[1]) => {
		if (!id || !poll) {
			return false;
		}

		const success = await submitVote(id, input);

		if (success) {
			setSubmitted(true);
		}

		return success;
	};

	if (loading) {
		return <LoadingSpinner />;
	}

	if (error || !poll) {
		const databaseError = typeof error === 'string' && error.toLowerCase().includes('database connection failed');
		return (
			<Card>
				<h1 className="text-2xl font-bold text-gray-900 mb-2">{databaseError ? 'Service temporarily unavailable' : 'Poll unavailable'}</h1>
				<p className="text-gray-600 mb-4">{error || 'This poll could not be loaded.'}</p>
				<Link to="/polls" className="text-blue-600 hover:text-blue-700">Back to polls</Link>
			</Card>
		);
	}

	if (submitted) {
		return <VoteSuccess />;
	}

	return (
		<div className="mx-auto max-w-4xl space-y-6">
			<Card className="rounded-[2rem] border border-slate-200 bg-white shadow-soft">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
					<div>
						<p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Public voting page</p>
						<h1 className="mt-2 text-4xl font-bold text-slate-900">{poll.title}</h1>
						{poll.description && <p className="mt-3 max-w-2xl text-slate-600">{poll.description}</p>}
					</div>
					<div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
						<p>{poll.questions.length} question{poll.questions.length === 1 ? '' : 's'}</p>
						<p>{poll.totalVotes} total vote{poll.totalVotes === 1 ? '' : 's'} so far</p>
					</div>
				</div>
			</Card>

			<VoteForm poll={poll} loading={submitting} submitError={submitError} onSubmit={handleSubmit} />
		</div>
	);
};

export default VotePage;
