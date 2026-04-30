import React from 'react';
import { AnalyticsBreakdown } from '../../types';
import Card from '../common/Card';

interface AnalyticsChartProps {
	title: string;
	subtitle?: string;
	data: AnalyticsBreakdown[];
	totalResponses?: number;
}

interface ChartDatum extends AnalyticsBreakdown {
	computedPercentage: number;
	color: string;
}

const chartPalette = ['#166534', '#0f766e', '#1d4ed8', '#7c3aed', '#c2410c', '#be123c', '#0891b2', '#65a30d'];

const describeItem = (item: AnalyticsBreakdown, index: number) => item.optionText || item.openText || `Response ${index + 1}`;

const buildChartData = (data: AnalyticsBreakdown[], totalCount: number): ChartDatum[] => {
	return data.map((item, index) => ({
		...item,
		computedPercentage: totalCount > 0 ? (item.count / totalCount) * 100 : 0,
		color: chartPalette[index % chartPalette.length],
	}));
};

const AnalyticsChart: React.FC<AnalyticsChartProps> = ({ title, subtitle, data, totalResponses: providedTotalResponses }) => {
	const totalResponses = providedTotalResponses ?? data.reduce((sum, item) => sum + item.count, 0);
	const chartData = buildChartData(data, totalResponses);
	const representedResponses = chartData.reduce((sum, item) => sum + item.count, 0);
	const hasUnrepresentedResponses = totalResponses > representedResponses;
	const unrepresentedResponses = Math.max(totalResponses - representedResponses, 0);

	return (
		<Card className="rounded-3xl border border-slate-200 bg-white shadow-soft">
			<div className="mb-6">
				<h3 className="text-xl font-semibold text-slate-900">{title}</h3>
				{subtitle && <p className="mt-1 text-sm text-slate-500">{subtitle}</p>}
				{hasUnrepresentedResponses ? (
					<p className="mt-2 text-xs font-medium text-amber-700">
						{unrepresentedResponses} lifetime response{unrepresentedResponses === 1 ? '' : 's'} are not represented by the current chart slices.
					</p>
				) : null}
			</div>
			<div className="space-y-4">
				{chartData.map((item, index) => (
					<div key={`${item.optionId || item.openText || index}`}>
						<div className="mb-2 flex items-center justify-between gap-3 text-sm text-slate-600">
							<span className="font-medium text-slate-800">{describeItem(item, index)}</span>
							<span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">{item.count} of {totalResponses} · {item.computedPercentage.toFixed(1)}%</span>
						</div>
						<div className="h-3 rounded-full bg-slate-100">
							<div
								className="h-3 rounded-full"
								style={{
									width: `${Math.max(item.computedPercentage, item.count > 0 ? 4 : 0)}%`,
									backgroundColor: item.color,
								}}
							/>
						</div>
					</div>
				))}
			</div>
		</Card>
	);
};

export default AnalyticsChart;
