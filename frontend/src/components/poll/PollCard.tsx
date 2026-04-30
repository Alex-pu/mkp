import React from 'react';
import { Link } from 'react-router-dom';
import { Poll } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';

interface PollCardProps {
	poll: Poll;
	showVotes?: boolean;
}

const PollCard: React.FC<PollCardProps> = ({ poll, showVotes = true }) => {
	return (
		<Card className="flex h-full flex-col justify-between rounded-2xl border border-slate-200 shadow-soft">
			<div>
				<div className="mb-4 flex items-center justify-between gap-3">
					<span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${poll.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
						{poll.isActive ? 'Active' : 'Inactive'}
					</span>
					{showVotes && <span className="text-sm text-slate-500">{poll.totalVotes} vote{poll.totalVotes === 1 ? '' : 's'}</span>}
				</div>
				<h3 className="text-xl font-semibold text-slate-900">{poll.title}</h3>
				<p className="mt-3 text-sm leading-6 text-slate-600">{poll.description || 'No description provided yet.'}</p>
			</div>
			<div className="mt-6 flex items-center justify-between gap-3">
				<p className="text-sm text-slate-500">{poll.questions.length} question{poll.questions.length === 1 ? '' : 's'}</p>
				<Link to={`/poll/${poll.id}`}>
					<Button size="sm">Vote now</Button>
				</Link>
			</div>
		</Card>
	);
};

export default PollCard;
