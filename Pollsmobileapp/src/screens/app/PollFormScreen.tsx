import React, { useEffect, useMemo, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../../components/ui/Screen';
import LoadingState from '../../components/ui/LoadingState';
import MessageBanner from '../../components/ui/MessageBanner';
import PollForm, { type PollFormValues } from '../../components/polls/PollForm';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import { pollService } from '../../services/pollService';
import { questionService } from '../../services/questionService';
import type { AppStackParamList } from '../../navigation/types';
import type { AssignableAdmin, Poll } from '../../types';

type Props = NativeStackScreenProps<AppStackParamList, 'PollForm'>;

const PollFormScreen = ({ navigation, route }: Props) => {
  const pollId = route.params?.pollId;
  const { user } = useAuth();
  const [poll, setPoll] = useState<Poll | null>(null);
  const [admins, setAdmins] = useState<AssignableAdmin[]>([]);
  const [loading, setLoading] = useState(!!pollId);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');

  const isReadOnly = useMemo(() => (poll?.totalVotes ?? 0) > 0, [poll?.totalVotes]);

  useEffect(() => {
    if (!pollId) {
      return;
    }

    pollService.getPoll(pollId)
      .then(setPoll)
      .catch((err: any) => setError(err.response?.data?.message || 'Failed to load poll'))
      .finally(() => setLoading(false));
  }, [pollId]);

  useEffect(() => {
    if (user?.role !== 'SUPER_ADMIN') {
      return;
    }

    authService.getAdmins()
      .then((data) => setAdmins(Array.isArray(data) ? data : data.items))
      .catch(() => setAdmins([]));
  }, [user?.role]);

  const handleSubmit = async (values: PollFormValues) => {
    setSaving(true);
    setError('');
    setMessage('');

    try {
      if (!pollId) {
        await pollService.createPoll({
          title: values.title,
          description: values.description,
          isActive: values.isActive,
          isPublic: values.isPublic,
          assignedAdminIds: values.assignedAdminIds,
          questions: values.questions.map((question, index) => ({
            text: question.text,
            type: question.type,
            order: index,
            options: question.type === 'MULTIPLE_CHOICE'
              ? question.options.map((option, optionIndex) => ({ text: option.text, order: optionIndex }))
              : [],
          })),
        });
        navigation.goBack();
        return;
      }

      if (isReadOnly) {
        const refreshedLockedPoll = await pollService.updatePoll(pollId, { isActive: values.isActive });
        setPoll(refreshedLockedPoll);
        setMessage('Poll status updated successfully.');
        return;
      }

      await pollService.updatePoll(pollId, {
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
          options: question.type === 'MULTIPLE_CHOICE'
            ? question.options.map((option, optionIndex) => ({ id: option.id, text: option.text, order: optionIndex }))
            : [],
        };

        if (question.id.startsWith('draft-')) {
          await questionService.createQuestion(pollId, payload);
        } else {
          await questionService.updateQuestion(question.id, payload);
        }
      }

      const refreshed = await pollService.getPoll(pollId);
      setPoll(refreshed);
      setMessage('Poll updated successfully.');
    } catch (submitError: any) {
      setError(submitError.response?.data?.message || 'Failed to save poll');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <LoadingState label="Loading poll editor..." />;
  }

  return (
    <Screen title={pollId ? 'Edit poll' : 'Create poll'} subtitle={pollId ? 'Update metadata, questions, and assignments.' : 'Build a poll with multiple questions and response types.'}>
      {message ? <MessageBanner message={message} tone="success" /> : null}
      {error && !pollId ? <MessageBanner message={error} tone="error" /> : null}
      <PollForm
        initialPoll={poll}
        submitLabel={pollId ? 'Save changes' : 'Create poll'}
        loading={saving}
        error={pollId ? error : ''}
        readOnly={isReadOnly}
        allowStatusEditWhenReadOnly={isReadOnly}
        readOnlyMessage={isReadOnly ? 'This poll is locked because votes already exist. You can still change active status.' : undefined}
        assignableAdmins={admins}
        allowPrivateAssignments={user?.role === 'SUPER_ADMIN'}
        onSubmit={handleSubmit}
      />
    </Screen>
  );
};

export default PollFormScreen;