import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import Card from '../../components/common/Card';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { pollService } from '../../services/pollService';
import { AssignableAdmin, Poll } from '../../types';
import { questionService } from '../../services/questionService';
import CreatePollForm, { PollFormValues } from '../../components/dashboard/CreatePollForm';
import { authService } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';

const EditPollPage: React.FC = () => {
	const { id } = useParams();
	const { user } = useAuth();
	const [poll, setPoll] = useState<Poll | null>(null);
	const [admins, setAdmins] = useState<AssignableAdmin[]>([]);
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [message, setMessage] = useState('');
	const [error, setError] = useState('');
	const isReadOnly = (poll?.totalVotes ?? 0) > 0;

	useEffect(() => {
		if (!id) {
			return;
		}

		pollService.getPoll(id)
			.then((data) => setPoll(data))
			.finally(() => setLoading(false));
	}, [id]);

	useEffect(() => {
		if (user?.role !== 'SUPER_ADMIN') {
			return;
		}

		authService.getAdmins().then(setAdmins).catch(() => setAdmins([]));
	}, [user?.role]);

	const handleSubmit = async (values: PollFormValues) => {
		if (!id) {
			return;
		}

		setSaving(true);
		setMessage('');
		setError('');
		try {
			if (isReadOnly) {
				await pollService.updatePoll(id, {
					isActive: values.isActive,
				});

				const refreshedLockedPoll = await pollService.getPoll(id);
				setPoll(refreshedLockedPoll);
				setMessage('Poll status updated successfully.');
				return;
			}

			await pollService.updatePoll(id, {
				title: values.title,
				description: values.description,
				isActive: values.isActive,
				isPublic: values.isPublic,
				assignedAdminIds: values.assignedAdminIds,
			});

			const existingQuestions = poll?.questions || [];
			const submittedQuestionIds = values.questions.map((question) => question.id).filter((questionId) => !questionId.startsWith('draft-'));
			const deletedQuestions = existingQuestions.filter((question) => !submittedQuestionIds.includes(question.id));

			for (const question of deletedQuestions) {
				await questionService.deleteQuestion(question.id);
			}

			for (const [questionIndex, question] of values.questions.entries()) {
				const payload = {
					text: question.text,
					type: question.type,
					order: questionIndex,
					options: question.type === 'MULTIPLE_CHOICE' ? question.options.map((option, optionIndex) => ({ id: option.id, text: option.text, order: optionIndex })) : [],
				};

				if (question.id.startsWith('draft-')) {
					await questionService.createQuestion(id, payload);
				} else {
					await questionService.updateQuestion(question.id, payload);
				}
			}

			const refreshed = await pollService.getPoll(id);
			setPoll(refreshed);
			setMessage('Poll updated successfully.');
		} catch (submitError: any) {
			setError(submitError.response?.data?.error || 'Failed to update poll');
		} finally {
			setSaving(false);
		}
	};

	if (loading) {
		return <LoadingSpinner />;
	}

	if (!poll) {
		return <Card><p className="text-gray-600">Poll not found.</p></Card>;
	}

	return (
		<div className="space-y-4 max-w-5xl">
			<div>
				<h1 className="text-3xl font-bold text-slate-900">Edit poll</h1>
				<p className="mt-1 text-slate-500">{isReadOnly ? 'This poll is locked because votes have already been submitted.' : 'Update metadata, reorder questions, and control response capture.'}</p>
			</div>
			{message && <div className="rounded-2xl border border-green-200 bg-green-50 px-4 py-3 text-sm font-medium text-green-700">{message}</div>}
			<CreatePollForm
				initialPoll={poll}
				submitLabel="Save changes"
				loading={saving}
				error={error}
				readOnly={isReadOnly}
				allowStatusEditWhenReadOnly={isReadOnly}
				readOnlyMessage={isReadOnly ? 'This poll is locked after voting started. You can still mark it active or inactive, but all other edits are disabled to protect result accuracy.' : undefined}
				assignableAdmins={admins}
				allowPrivateAssignments={user?.role === 'SUPER_ADMIN'}
				onSubmit={handleSubmit}
			/>
		</div>
	);
};

export default EditPollPage;
