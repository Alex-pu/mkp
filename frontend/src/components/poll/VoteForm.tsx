import React, { useMemo, useState } from 'react';
import { Poll, VoteInput } from '../../types';
import Button from '../common/Button';
import QuestionRenderer, { QuestionAnswer } from './QuestionRenderer';

interface VoteFormProps {
	poll: Poll;
	loading: boolean;
	submitError: string | null;
	onSubmit: (input: VoteInput) => Promise<boolean>;
}

const VoteForm: React.FC<VoteFormProps> = ({ poll, loading, submitError, onSubmit }) => {
	const [answers, setAnswers] = useState<Record<string, QuestionAnswer>>({});
	const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

	const orderedQuestions = useMemo(() => [...poll.questions].sort((left, right) => left.order - right.order), [poll.questions]);

	const handleQuestionChange = (questionId: string, value: QuestionAnswer) => {
		setAnswers((current) => ({ ...current, [questionId]: value }));
		setValidationErrors((current) => {
			const next = { ...current };
			delete next[questionId];
			return next;
		});
	};

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		const nextErrors: Record<string, string> = {};

		const responses = orderedQuestions.map((question) => {
			const answer = answers[question.id] || {};
			if (question.type === 'OPEN_TEXT') {
				if (!answer.openText?.trim()) {
					nextErrors[question.id] = 'Please enter a response.';
				}
				return { questionId: question.id, openText: answer.openText?.trim() };
			}

			if (!answer.optionId) {
				nextErrors[question.id] = 'Please select an option.';
			}

			const selectedOption = question.options.find((option) => option.id === answer.optionId);
			if (selectedOption && /other/i.test(selectedOption.text) && !answer.openText?.trim()) {
				nextErrors[question.id] = 'Please enter your custom answer for Others.';
			}

			return {
				questionId: question.id,
				optionId: answer.optionId,
				openText: answer.openText?.trim(),
			};
		});

		if (Object.keys(nextErrors).length > 0) {
			setValidationErrors(nextErrors);
			return;
		}

		await onSubmit({ responses });
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{orderedQuestions.map((question, index) => (
				<QuestionRenderer
					key={question.id}
					question={question}
					index={index}
					value={answers[question.id] || {}}
					error={validationErrors[question.id]}
					onChange={(value) => handleQuestionChange(question.id, value)}
				/>
			))}

			{submitError && (
				<div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
					{submitError}
				</div>
			)}

			<div className="flex justify-end">
				<Button type="submit" size="lg" disabled={loading}>
					{loading ? 'Submitting vote...' : 'Submit vote'}
				</Button>
			</div>
		</form>
	);
};

export default VoteForm;
