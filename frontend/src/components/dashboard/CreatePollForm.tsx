import React, { useEffect, useMemo, useState } from 'react';
import { AssignableAdmin, Poll } from '../../types';
import Button from '../common/Button';
import Card from '../common/Card';
import Input from '../common/Input';

const createDraftId = () => `draft-${globalThis.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`}`;

export interface PollQuestionDraft {
	id: string;
	text: string;
	type: 'MULTIPLE_CHOICE' | 'OPEN_TEXT';
	options: { id?: string; text: string; order: number }[];
}

export interface PollFormValues {
	title: string;
	description: string;
	isActive: boolean;
	isPublic: boolean;
	assignedAdminIds: string[];
	questions: PollQuestionDraft[];
}

interface CreatePollFormProps {
	initialPoll?: Poll | null;
	assignableAdmins?: AssignableAdmin[];
	allowPrivateAssignments?: boolean;
	loading?: boolean;
	error?: string;
	readOnly?: boolean;
	allowStatusEditWhenReadOnly?: boolean;
	readOnlyMessage?: string;
	submitLabel: string;
	onSubmit: (values: PollFormValues) => Promise<void>;
}

const buildDefaultQuestion = (): PollQuestionDraft => ({
	id: createDraftId(),
	text: '',
	type: 'MULTIPLE_CHOICE',
	options: [
		{ text: 'Option 1', order: 0 },
		{ text: 'Option 2', order: 1 },
	],
});

const mapPollToValues = (poll?: Poll | null): PollFormValues => {
	if (!poll) {
		return {
			title: '',
			description: '',
			isActive: true,
			isPublic: true,
			assignedAdminIds: [],
			questions: [buildDefaultQuestion()],
		};
	}

	return {
		title: poll.title,
		description: poll.description || '',
		isActive: poll.isActive,
		isPublic: poll.isPublic,
		assignedAdminIds: poll.assignedAdmins.map((admin) => admin.id),
		questions: poll.questions
			.sort((left, right) => left.order - right.order)
			.map((question) => ({
				id: question.id,
				text: question.text,
				type: question.type,
				options: question.options.map((option, index) => ({
					id: option.id,
					text: option.text,
					order: option.order ?? index,
				})),
			})),
	};
};

const CreatePollForm: React.FC<CreatePollFormProps> = ({ initialPoll, assignableAdmins = [], allowPrivateAssignments = false, loading = false, error, readOnly = false, allowStatusEditWhenReadOnly = false, readOnlyMessage, submitLabel, onSubmit }) => {
	const [values, setValues] = useState<PollFormValues>(() => mapPollToValues(initialPoll));
	const [assignmentError, setAssignmentError] = useState('');
	const statusEditable = !readOnly || allowStatusEditWhenReadOnly;

	useEffect(() => {
		setValues(mapPollToValues(initialPoll));
		setAssignmentError('');
	}, [initialPoll]);

	const canSubmit = useMemo(() => {
		if (!values.title.trim() || values.questions.length === 0) {
			return false;
		}

		return values.questions.every((question) => {
			if (!question.text.trim()) {
				return false;
			}

			if (question.type === 'MULTIPLE_CHOICE') {
				return question.options.length >= 2 && question.options.every((option) => option.text.trim());
			}

			return true;
		});
	}, [values]);

	const updateQuestion = (questionId: string, updater: (question: PollQuestionDraft) => PollQuestionDraft) => {
		setValues((current) => ({
			...current,
			questions: current.questions.map((question) => (question.id === questionId ? updater(question) : question)),
		}));
	};

	const moveQuestion = (index: number, direction: -1 | 1) => {
		setValues((current) => {
			const next = [...current.questions];
			const swapIndex = index + direction;
			if (swapIndex < 0 || swapIndex >= next.length) {
				return current;
			}
			[next[index], next[swapIndex]] = [next[swapIndex], next[index]];
			return { ...current, questions: next };
		});
	};

	const handleSubmit = async (event: React.FormEvent) => {
		event.preventDefault();
		if (!canSubmit || (readOnly && !allowStatusEditWhenReadOnly)) {
			return;
		}

		if (allowPrivateAssignments && !values.isPublic && values.assignedAdminIds.length === 0) {
			setAssignmentError('Select at least one admin for a private poll.');
			return;
		}

		setAssignmentError('');

		const normalized: PollFormValues = {
			...values,
			title: values.title.trim(),
			description: values.description.trim(),
			assignedAdminIds: [...new Set(values.assignedAdminIds)],
			questions: values.questions.map((question) => ({
				...question,
				text: question.text.trim(),
				options: question.type === 'MULTIPLE_CHOICE'
					? question.options.map((option, optionIndex) => ({ id: option.id, text: option.text.trim(), order: optionIndex }))
					: [],
			})),
		};

		await onSubmit({
			...normalized,
			questions: normalized.questions.map((question) => ({
				...question,
				options: question.options.map((option, optionIndex) => ({ ...option, order: optionIndex })),
			})),
		});
	};

	return (
		<form onSubmit={handleSubmit} className="space-y-6">
			{readOnlyMessage ? <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-800">{readOnlyMessage}</div> : null}
			<Card className="rounded-3xl border border-slate-200 bg-white shadow-soft">
				<div className="grid gap-4">
					<Input label="Poll title" value={values.title} onChange={(event) => setValues((current) => ({ ...current, title: event.target.value }))} required disabled={readOnly} />
					<div>
						<label className="mb-1 block text-sm font-medium text-slate-700">Description</label>
						<textarea
							rows={4}
							value={values.description}
							onChange={(event) => setValues((current) => ({ ...current, description: event.target.value }))}
							disabled={readOnly}
							className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
							placeholder="Describe the purpose of this poll"
						/>
					</div>
					<label className="inline-flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm font-medium text-slate-700">
						<input type="checkbox" checked={values.isActive} onChange={(event) => setValues((current) => ({ ...current, isActive: event.target.checked }))} disabled={!statusEditable} className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500" />
						Poll is active and accepting votes
					</label>
					{allowPrivateAssignments && (
						<div className="grid gap-4 lg:grid-cols-2">
							<label className={`block rounded-3xl border p-5 transition ${values.isPublic ? 'border-blue-400 bg-blue-50 shadow-sm' : 'border-slate-200 bg-slate-50 hover:border-slate-300'} ${readOnly ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
								<input
									type="radio"
									name="poll-visibility"
									checked={values.isPublic}
									disabled={readOnly}
									onChange={() => {
										setValues((current) => ({ ...current, isPublic: true, assignedAdminIds: [] }));
										setAssignmentError('');
									}}
									className="sr-only"
								/>
								<div className="flex items-start justify-between gap-3">
									<div>
										<p className="text-sm font-semibold uppercase tracking-[0.18em] text-blue-600">Public Poll</p>
										<h3 className="mt-2 text-xl font-bold text-slate-900">Visible to everyone</h3>
										<p className="mt-2 text-sm text-slate-600">Anyone with access to the public poll pages can open and vote on this poll while it is active.</p>
									</div>
									<span className={`rounded-full px-3 py-1 text-xs font-semibold ${values.isPublic ? 'bg-blue-600 text-white' : 'bg-white text-slate-600'}`}>
										{values.isPublic ? 'Selected' : 'Choose'}
									</span>
								</div>
								<div className="mt-4 rounded-2xl bg-white/80 px-4 py-3 text-sm text-slate-600">
									<p className="font-medium text-slate-800">Use for:</p>
									<p className="mt-1">Open elections, public surveys, and community polls.</p>
								</div>
							</label>

							<div className={`rounded-3xl border p-5 transition ${!values.isPublic ? 'border-violet-400 bg-violet-50 shadow-sm' : 'border-slate-200 bg-slate-50'}`}>
								<div className="flex items-start justify-between gap-3">
									<div>
										<p className="text-sm font-semibold uppercase tracking-[0.18em] text-violet-600">Private Poll</p>
										<h3 className="mt-2 text-xl font-bold text-slate-900">Assigned dashboard voters only</h3>
										<p className="mt-2 text-sm text-slate-600">Only selected admins can see and vote on this poll from their dashboard while it is active.</p>
									</div>
									<label className={`${readOnly ? 'cursor-not-allowed opacity-70' : 'cursor-pointer'}`}>
										<input
											type="radio"
											name="poll-visibility"
											checked={!values.isPublic}
											disabled={readOnly}
											onChange={() => setValues((current) => ({ ...current, isPublic: false }))}
											className="sr-only"
										/>
										<span className={`rounded-full px-3 py-1 text-xs font-semibold ${!values.isPublic ? 'bg-violet-600 text-white' : 'bg-white text-slate-600'}`}>
											{!values.isPublic ? 'Selected' : 'Choose'}
										</span>
									</label>
								</div>

								<div className="mt-4 rounded-2xl bg-white/80 p-4">
									<div className="flex items-center justify-between gap-3">
										<div>
											<p className="text-sm font-semibold text-slate-800">Assigned admin voters</p>
											<p className="text-xs text-slate-500">Choose the dashboard admins who can access this private poll.</p>
										</div>
										<span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-600">{values.assignedAdminIds.length} assigned</span>
									</div>

									<div className={`mt-4 grid gap-3 sm:grid-cols-2 ${values.isPublic ? 'opacity-60' : ''}`}>
											{assignableAdmins.length > 0 ? assignableAdmins.map((admin) => {
												const isSelected = values.assignedAdminIds.includes(admin.id);
												return (
													<label key={admin.id} className={`flex cursor-pointer items-start gap-3 rounded-2xl border px-4 py-3 transition ${isSelected ? 'border-violet-300 bg-violet-50' : 'border-slate-200 bg-white hover:border-slate-300'} ${readOnly ? 'cursor-not-allowed opacity-70' : ''}`}>
														<input
															type="checkbox"
															checked={isSelected}
															disabled={readOnly || values.isPublic}
															onChange={() => {
																setValues((current) => ({
																	...current,
																	assignedAdminIds: isSelected
																		? current.assignedAdminIds.filter((adminId) => adminId !== admin.id)
																		: [...current.assignedAdminIds, admin.id],
																}));
																setAssignmentError('');
															}}
															className="mt-1 h-4 w-4 rounded border-slate-300 text-violet-600 focus:ring-violet-500"
														/>
														<div>
															<p className="font-medium text-slate-900">{admin.name || admin.email}</p>
															<p className="text-sm text-slate-500">{admin.email}</p>
														</div>
													</label>
												);
											}) : <p className="text-sm text-slate-500">No active admins are available for assignment yet.</p>}
									</div>
									{values.isPublic ? <p className="mt-4 text-sm text-slate-500">Choose Private Poll above to enable admin assignment.</p> : null}
									{assignmentError && !values.isPublic ? <p className="mt-4 text-sm font-medium text-red-600">{assignmentError}</p> : null}
								</div>
							</div>
						</div>
					)}
				</div>
			</Card>

			{values.questions.map((question, index) => (
				<Card key={question.id} className="rounded-3xl border border-slate-200 bg-white shadow-soft">
					<div className="mb-5 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
						<div>
							<p className="text-sm font-semibold uppercase tracking-[0.2em] text-blue-600">Question {index + 1}</p>
							<p className="text-sm text-slate-500">Choose a response type and configure the answer capture.</p>
						</div>
						<div className="flex flex-wrap gap-2">
							<Button type="button" variant="secondary" size="sm" onClick={() => moveQuestion(index, -1)} disabled={readOnly}>Move up</Button>
							<Button type="button" variant="secondary" size="sm" onClick={() => moveQuestion(index, 1)} disabled={readOnly}>Move down</Button>
							<Button type="button" variant="danger" size="sm" onClick={() => setValues((current) => ({ ...current, questions: current.questions.filter((item) => item.id !== question.id) || [buildDefaultQuestion()] }))} disabled={readOnly}>
								Delete
							</Button>
						</div>
					</div>

					<div className="space-y-4">
						<Input label="Question text" value={question.text} onChange={(event) => updateQuestion(question.id, (current) => ({ ...current, text: event.target.value }))} required disabled={readOnly} />
						<div>
							<label className="mb-1 block text-sm font-medium text-slate-700">Question type</label>
							<select
								value={question.type}
								disabled={readOnly}
								onChange={(event) => updateQuestion(question.id, (current) => ({
									...current,
									type: event.target.value as PollQuestionDraft['type'],
									options: event.target.value === 'OPEN_TEXT' ? [] : current.options.length >= 2 ? current.options : buildDefaultQuestion().options,
								}))}
								className="w-full rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
							>
								<option value="MULTIPLE_CHOICE">Multiple choice</option>
								<option value="OPEN_TEXT">Open text</option>
							</select>
						</div>

						{question.type === 'MULTIPLE_CHOICE' && (
							<div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-4">
								<div className="flex items-center justify-between">
									<p className="text-sm font-semibold text-slate-700">Answer options</p>
									<Button
										type="button"
										variant="secondary"
										size="sm"
										disabled={readOnly}
										onClick={() => updateQuestion(question.id, (current) => ({
											...current,
											options: [...current.options, { text: `Option ${current.options.length + 1}`, order: current.options.length }],
										}))}
									>
										Add option
									</Button>
								</div>
								{question.options.map((option, optionIndex) => (
									<div key={`${question.id}-option-${optionIndex}`} className="flex gap-3">
										<input
											value={option.text}
											disabled={readOnly}
											onChange={(event) => updateQuestion(question.id, (current) => ({
												...current,
												options: current.options.map((currentOption, currentIndex) => currentIndex === optionIndex ? { ...currentOption, text: event.target.value } : currentOption),
											}))}
											className="flex-1 rounded-2xl border border-slate-200 px-4 py-3 outline-none transition focus:border-blue-500 focus:ring-4 focus:ring-blue-100"
											placeholder={`Option ${optionIndex + 1}`}
										/>
										<Button
											type="button"
											variant="danger"
											size="sm"
											disabled={readOnly || question.options.length <= 2}
											onClick={() => updateQuestion(question.id, (current) => ({
												...current,
												options: current.options.filter((_, currentIndex) => currentIndex !== optionIndex),
											}))}
										>
											Remove
										</Button>
									</div>
								))}
								<p className="text-xs text-slate-500">Tip: add an option named “Others” to allow a custom typed answer on the public voting form.</p>
							</div>
						)}
					</div>
				</Card>
			))}

			{error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}

			<div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
				<Button type="button" variant="secondary" onClick={() => setValues((current) => ({ ...current, questions: [...current.questions, buildDefaultQuestion()] }))} disabled={readOnly}>
					Add another question
				</Button>
				<Button type="submit" size="lg" disabled={!canSubmit || loading || (readOnly && !allowStatusEditWhenReadOnly)}>
					{loading ? 'Saving poll...' : submitLabel}
				</Button>
			</div>
		</form>
	);
};

export default CreatePollForm;
