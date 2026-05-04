import React from 'react';
import { AnalyticsTextResponse, PaginationMeta } from '../../types';
import { analyticsService } from '../../services/analyticsService';
import Card from '../common/Card';
import PaginationControls from '../common/PaginationControls';

const RESPONSES_PAGE_SIZE = 8;

interface ResponseTableProps {
	title: string;
	pollId: string;
	questionId: string;
	totalResponses: number;
}


const ResponseTable: React.FC<ResponseTableProps> = ({ title, pollId, questionId, totalResponses }) => {
	const [currentPage, setCurrentPage] = React.useState(1);
	const [responses, setResponses] = React.useState<AnalyticsTextResponse[]>([]);
	const [pagination, setPagination] = React.useState<PaginationMeta | null>(null);
	const [loading, setLoading] = React.useState(true);

	React.useEffect(() => {
		setCurrentPage(1);
	}, [questionId]);

	React.useEffect(() => {
		let isMounted = true;
		setLoading(true);
		analyticsService.getQuestionOpenTextResponses(pollId, questionId, { page: currentPage, limit: RESPONSES_PAGE_SIZE })
			.then((result) => {
				if (!isMounted) {
					return;
				}
				setResponses(result.items);
				setPagination(result.meta);
			})
			.catch(() => {
				if (!isMounted) {
					return;
				}
				setResponses([]);
				setPagination(null);
			})
			.finally(() => {
				if (isMounted) {
					setLoading(false);
				}
			});

		return () => {
			isMounted = false;
		};
	}, [currentPage, pollId, questionId]);

	return (
		<Card className="rounded-3xl border border-slate-200 bg-white shadow-soft">
			<div className="mb-4 flex items-center justify-between">
				<h3 className="text-xl font-semibold text-slate-900">{title}</h3>
				<span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">
					{totalResponses} response{totalResponses === 1 ? '' : 's'}
				</span>
			</div>
			{loading ? (
				<p className="text-sm text-slate-500">Loading responses...</p>
			) : totalResponses === 0 ? (
				<p className="text-sm text-slate-500">No open text responses yet.</p>
			) : (
				<>
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
					<PaginationControls currentPage={pagination?.page ?? 1} totalPages={pagination?.totalPages ?? 1} totalItems={pagination?.totalItems ?? totalResponses} itemLabel="responses" onPageChange={setCurrentPage} className="mt-4" />
				</>
			)}
		</Card>
	);
};

export default ResponseTable;
