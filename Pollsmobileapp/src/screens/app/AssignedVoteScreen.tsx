import React, { useEffect, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../../components/ui/Screen';
import Card from '../../components/ui/Card';
import LoadingState from '../../components/ui/LoadingState';
import MessageBanner from '../../components/ui/MessageBanner';
import VoteForm from '../../components/polls/VoteForm';
import { usePoll } from '../../hooks/usePoll';
import { useVote } from '../../hooks/useVote';
import type { AppStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<AppStackParamList, 'AssignedVote'>;

const AssignedVoteScreen = ({ route }: Props) => {
  const { pollId } = route.params;
  const { poll, loading, error, fetchAssignedPrivatePoll } = usePoll();
  const { submitAssignedVote, loading: submitting, error: submitError } = useVote();
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchAssignedPrivatePoll(pollId);
  }, [fetchAssignedPrivatePoll, pollId]);

  if (loading) {
    return <LoadingState label="Loading assigned poll..." />;
  }

  if (error || !poll) {
    return (
      <Screen title="Assigned poll unavailable">
        <MessageBanner message={error || 'This assigned poll could not be loaded.'} tone="error" />
      </Screen>
    );
  }

  if (submitted) {
    return (
      <Screen title="Vote submitted" subtitle="Your assigned poll response has been saved.">
        <Card>
          <MessageBanner message="Thanks, your private poll vote is recorded." tone="success" />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen title={poll.title} subtitle={poll.description || 'Complete your assigned poll.'}>
      <VoteForm
        poll={poll}
        loading={submitting}
        submitError={submitError}
        onSubmit={async (input) => {
          const success = await submitAssignedVote(pollId, input);
          if (success) {
            setSubmitted(true);
          }
          return success;
        }}
      />
    </Screen>
  );
};

export default AssignedVoteScreen;