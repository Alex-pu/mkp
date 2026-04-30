import React from 'react';
import { useParams } from 'react-router-dom';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { useAnalytics } from '../../hooks/useAnalytics';
import AnalyticsChart from '../../components/dashboard/AnalyticsChart';
import ResponseTable from '../../components/dashboard/ResponseTable';
import { useAuth } from '../../hooks/useAuth';

const AnalyticsPage: React.FC = () => {
	const { id } = useParams();
	const { analytics, loading, error } = useAnalytics(id);
	useAuth();

	if (loading) {
		return <LoadingSpinner />;
	}

	if (error || !analytics) {
		return <Card><p className="text-red-600">{error || 'Analytics unavailable.'}</p></Card>;
	}

	return (
		<div className="space-y-6">
			<Card className="rounded-3xl border border-slate-200 bg-white shadow-soft">
				<div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
					<div>
						<p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Lifetime analytics</p>
						<h1 className="mt-2 text-3xl font-bold text-gray-900">{analytics.pollTitle}</h1>
						<p className="mt-2 text-gray-600">These results include every recorded submission ever made for this specific poll.</p>
						{analytics.pollDescription ? <p className="mt-2 max-w-3xl text-sm text-slate-500">{analytics.pollDescription}</p> : null}
					</div>
					<div className="grid gap-3 sm:grid-cols-3 lg:min-w-[420px]">
						<div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
							<p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Lifetime votes</p>
							<p className="mt-2 text-2xl font-bold text-slate-900">{analytics.totalVotes}</p>
						</div>
						<div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
							<p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Lifetime responses</p>
							<p className="mt-2 text-2xl font-bold text-slate-900">{analytics.totalResponses}</p>
						</div>
						<div className="rounded-2xl bg-slate-50 px-4 py-3 text-sm text-slate-600">
							<p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500">Current visibility</p>
							<p className="mt-2 text-lg font-bold text-slate-900">{analytics.isPublic ? 'Public' : 'Private'}</p>
							{analytics.lastUpdatedAt ? <p className="mt-2 text-xs text-slate-500">Last vote: {new Date(analytics.lastUpdatedAt).toLocaleString()}</p> : <p className="mt-2 text-xs text-slate-500">No votes yet</p>}
						</div>
					</div>
				</div>
			</Card>

			{analytics.questions.map((question) => (
				<div key={question.id} className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
					<AnalyticsChart
						title={question.text}
						subtitle={`${question.totalResponses} lifetime response${question.totalResponses === 1 ? '' : 's'} collected for this poll`}
						data={question.responses}
						totalResponses={question.totalResponses}
					/>
					<ResponseTable title="Open text responses" responses={question.openTextResponses} />
				</div>
			))}
		</div>
	);
};

export default AnalyticsPage;
