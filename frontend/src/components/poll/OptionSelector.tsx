import React from 'react';
import { Option } from '../../types';

interface OptionSelectorProps {
	questionId: string;
	options: Option[];
	selectedOptionId?: string;
	onChange: (optionId: string) => void;
}

const OptionSelector: React.FC<OptionSelectorProps> = ({ questionId, options, selectedOptionId, onChange }) => {
	return (
		<div className="space-y-3">
			{options.map((option) => (
				<label key={option.id} className={`flex cursor-pointer items-center gap-3 rounded-2xl border px-4 py-3 transition ${selectedOptionId === option.id ? 'border-blue-500 bg-blue-50' : 'border-slate-200 bg-white hover:border-slate-300'}`}>
					<input
						type="radio"
						name={questionId}
						value={option.id}
						checked={selectedOptionId === option.id}
						onChange={() => onChange(option.id)}
						className="h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
					/>
					<span className="font-medium text-slate-800">{option.text}</span>
				</label>
			))}
		</div>
	);
};

export default OptionSelector;
