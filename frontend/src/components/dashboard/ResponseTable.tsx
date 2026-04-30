import React from 'react';
import { AnalyticsTextResponse } from '../../types';
import Card from '../common/Card';

interface ResponseTableProps {
	title: string;
	responses: AnalyticsTextResponse[];
}

const ResponseTable: React.FC<ResponseTableProps> = ({ title, responses }) => {
	return (
		<Card className="rounded-3xl border border-slate-200 bg-white shadow-soft">
			<div className="mb-4 flex items-center justify-between">
				<h3 className="text-xl font-semibold text-slate-900">{title}</h3>
				<span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
					{responses.length} response{responses.length === 1 ? '' : 's'}
				</span>
			</div>
			{responses.length === 0 ? (
				<p className="text-sm text-slate-500">No open text responses yet.</p>
			) : (
				<div className="overflow-hidden rounded-2xl border border-slate-200">
					<table className="min-w-full divide-y divide-slate-200 text-sm">
						<thead className="bg-slate-50 text-left text-slate-500">
							<tr>
								<th className="px-4 py-3 font-semibold">Response</th>
								<th className="px-4 py-3 font-semibold">Submitted</th>
							</tr>
						</thead>
						<tbody className="divide-y divide-slate-100 bg-white">
							{responses.map((response) => (
								<tr key={response.id}>
									<td className="px-4 py-3 text-slate-700">{response.text}</td>
									<td className="px-4 py-3 text-slate-500">{new Date(response.createdAt).toLocaleString()}</td>
								</tr>
							))}
						</tbody>
					</table>
				</div>
			)}
		</Card>
	);
};

export default ResponseTable;
