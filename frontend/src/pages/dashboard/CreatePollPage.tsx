import React, { useState } from 'react';
import { pollService } from '../../services/pollService';
import { authService } from '../../services/authService';
import CreatePollForm, { PollFormValues } from '../../components/dashboard/CreatePollForm';
import { AssignableAdmin } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import { Poll } from '../../types';
import CreatePollSuccess from '../../components/dashboard/CreatePollSuccess';

const CreatePollPage: React.FC = () => {
	const { user } = useAuth();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');
	const [admins, setAdmins] = useState<AssignableAdmin[]>([]);
	const [adminsLoaded, setAdminsLoaded] = useState(false);
	const [createdPoll, setCreatedPoll] = useState<Poll | null>(null);

	React.useEffect(() => {
		if (user?.role !== 'SUPER_ADMIN' || adminsLoaded) {
			return;
		}

		authService.getAdmins()
			.then((data) => setAdmins(Array.isArray(data) ? data : data.items))
			.catch(() => setAdmins([]))
			.finally(() => setAdminsLoaded(true));
	}, [adminsLoaded, user?.role]);

	const handleSubmit = async (values: PollFormValues) => {
		setLoading(true);
		setError('');

		try {
			const poll = await pollService.createPoll({
				title: values.title,
				description: values.description,
				isActive: values.isActive,
				isPublic: values.isPublic,
				assignedAdminIds: values.assignedAdminIds,
				questions: values.questions.map((question, index) => ({
					text: question.text,
					type: question.type,
					order: index,
					options: question.type === 'MULTIPLE_CHOICE' ? question.options.map((option, optionIndex) => ({ text: option.text, order: optionIndex })) : [],
				})),
			});
			setCreatedPoll(poll);
		} catch (submitError: any) {
			setError(submitError.response?.data?.message || 'Failed to create poll');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="space-y-4 max-w-5xl">
			<div>
				<h1 className="text-3xl font-bold text-slate-900">Create a new poll</h1>
				<p className="mt-1 text-slate-500">Build polls with multiple questions, mixed response types, and ready-to-launch status control.</p>
			</div>
			{createdPoll ? (
				<CreatePollSuccess
					poll={createdPoll}
					onCreateAnother={() => {
						setCreatedPoll(null);
						setError('');
					}}
				/>
			) : (
				<CreatePollForm
					submitLabel="Create poll"
					loading={loading}
					error={error}
					assignableAdmins={admins}
					allowPrivateAssignments={user?.role === 'SUPER_ADMIN'}
					onSubmit={handleSubmit}
				/>
			)}
		</div>
	);
};

export default CreatePollPage;
