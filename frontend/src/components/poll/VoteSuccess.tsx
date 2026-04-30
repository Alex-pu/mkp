import React from 'react';
import { Link } from 'react-router-dom';
import Card from '../common/Card';
import Button from '../common/Button';

const VoteSuccess: React.FC = () => {
	return (
		<Card className="mx-auto max-w-2xl rounded-3xl border border-emerald-200 bg-white text-center shadow-soft">
			<div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100 text-2xl text-emerald-600">
				✓
			</div>
			<h1 className="mt-4 text-3xl font-bold text-slate-900">Thanks for voting</h1>
			<div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
				<Link to="/polls">
					<Button>Browse more polls</Button>
				</Link>
				<Link to="/">
					<Button variant="secondary">Back to homepage</Button>
				</Link>
			</div>
		</Card>
	);
};

export default VoteSuccess;
