import React from 'react';
import { Link } from 'react-router-dom';
import { Poll } from '../../types';
import Card from '../common/Card';
import Button from '../common/Button';

interface PollListTableProps {
	polls: Poll[];
	onDelete?: (pollId: string) => void;
}

const PollListTable: React.FC<PollListTableProps> = ({ polls, onDelete }) => {
	return (
		<Card className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
			{polls.length === 0 ? (
				<p className="text-sm text-slate-500">No polls available yet.</p>
			) : (
				<div className="overflow-x-auto">
					<table className="min-w-full divide-y divide-slate-200 text-sm">
						<thead className="bg-slate-50 text-left text-slate-500">
							<tr>
								<th className="px-4 py-3 font-semibold">Poll</th>
								<th className="px-4 py-3 font-semibold">ID</th>
								<th className="px-4 py-3 font-semibold">Created</th>
								<th className="px-4 py-3 font-semibold">Votes</th>
								<th className="px-4 py-3 font-semibold">Status</th>
								<th className="px-4 py-3 font-semibold text-right">Actions</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100 bg-white">
							{polls.map((poll) => (
								<tr key={poll.id}>
									<td className="px-4 py-4">
										<p className="font-semibold text-slate-900">{poll.title}</p>
										<p className="mt-1 max-w-sm text-slate-500">{poll.description || 'No description provided.'}</p>
									</td>
									<td className="px-4 py-4 font-mono text-xs text-slate-500">{poll.id}</td>
									<td className="px-4 py-4 text-slate-500">{new Date(poll.createdAt).toLocaleDateString()}</td>
									<td className="px-4 py-4 text-slate-700">{poll.totalVotes}</td>
									<td className="px-4 py-4">
										<span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${poll.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>
											{poll.isActive ? 'Active' : 'Inactive'}
										</span>
									</td>
									<td className="px-4 py-4">
										<div className="flex justify-end gap-2">
											<Link to={`/dashboard/polls/${poll.id}/analytics`}><Button variant="secondary" size="sm">Analytics</Button></Link>
											<Link to={`/dashboard/polls/${poll.id}/edit`}><Button size="sm">Edit</Button></Link>
											{onDelete && <Button variant="danger" size="sm" onClick={() => onDelete(poll.id)}>Delete</Button>}
										</div>
									</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</Card>
	);
};

export default PollListTable;
