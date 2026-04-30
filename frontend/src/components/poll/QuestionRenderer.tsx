import React from 'react';
import { Question } from '../../types';
import Card from '../common/Card';
import OpenTextInput from './OpenTextInput';
import OptionSelector from './OptionSelector';

export interface QuestionAnswer {
	optionId?: string;
	openText?: string;
}

interface QuestionRendererProps {
	question: Question;
	index: number;
	value: QuestionAnswer;
	error?: string;
	onChange: (value: QuestionAnswer) => void;
}

const QuestionRenderer: React.FC<QuestionRendererProps> = ({ question, index, value, error, onChange }) => {
	const selectedOption = question.options.find((option) => option.id === value.optionId);
	const isOtherOption = selectedOption ? /other/i.test(selectedOption.text) : false;

	return (
		<Card className="rounded-3xl border border-slate-200 bg-white shadow-soft">
			<div className="mb-5 flex items-center gap-3">
				<span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-sm font-semibold text-blue-700">
					{index + 1}
				</span>
				<div>
					<h2 className="text-xl font-semibold text-slate-900">{question.text}</h2>
					<p className="text-sm text-slate-500">{question.type === 'OPEN_TEXT' ? 'Open response' : 'Select one option'}</p>
				</div>
			</div>

			{question.type === 'OPEN_TEXT' ? (
				<OpenTextInput value={value.openText || ''} onChange={(openText) => onChange({ openText })} />
			) : (
				<div className="space-y-4">
					<OptionSelector
						questionId={question.id}
						options={question.options}
						selectedOptionId={value.optionId}
						onChange={(optionId) => onChange({ ...value, optionId })}
					/>
					{isOtherOption && (
						<OpenTextInput
							value={value.openText || ''}
							onChange={(openText) => onChange({ ...value, openText })}
							placeholder="Tell us your custom answer"
							rows={3}
						/>
					)}
				</div>
			)}

			{error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}
		</Card>
	);
};

export default QuestionRenderer;
