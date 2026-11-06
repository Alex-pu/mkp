import React from 'react';
import { Link } from 'react-router-dom';
import { Poll } from '../../types';
import Button from '../common/Button';
import Card from '../common/Card';
import QuestionnaireDownloadButton from './QuestionnaireDownloadButton';

interface CreatePollSuccessProps {
	poll: Poll;
	onCreateAnother: () => void;
}

const CreatePollSuccess: React.FC<CreatePollSuccessProps> = ({ poll, onCreateAnother }) => {
	return (
		<Card className="mx-auto max-w-2xl rounded-3xl border border-emerald-200 bg-white text-center shadow-soft">
			<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-600">
				✓
			</div>
			<h1 className="mt-4 text-3xl font-bold text-slate-900">Poll created successfully</h1>
			<p className="mt-3 text-sm text-slate-500">
				{poll.title} is ready and {poll.isActive ? 'can start receiving votes now.' : 'is saved as inactive until you are ready to open it.'}
			</p>
			<div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
				<QuestionnaireDownloadButton pollId={poll.id} pollTitle={poll.title} />
				<Link to={`/dashboard/polls/${poll.id}/edit`}>
					<Button>Edit poll</Button>
				</Link>
				<Link to="/dashboard/polls">
					<Button variant="secondary">View all polls</Button>
				</Link>
			</div>
			<div className="mt-3">
				<Button type="button" variant="secondary" onClick={onCreateAnother}>
					Create another poll
				</Button>
			</div>
		</Card>
	);
};

export default CreatePollSuccess;
