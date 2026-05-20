import React, { useEffect, useState } from 'react';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../../components/ui/Screen';
import Card from '../../components/ui/Card';
import LoadingState from '../../components/ui/LoadingState';
import MessageBanner from '../../components/ui/MessageBanner';
import VoteForm from '../../components/polls/VoteForm';
import { usePoll } from '../../hooks/usePoll';
import { useVote } from '../../hooks/useVote';
import type { PublicStackParamList } from '../../navigation/types';

type Props = NativeStackScreenProps<PublicStackParamList, 'PublicVote'>;

const PublicVoteScreen = ({ route }: Props) => {
  const { pollId } = route.params;
  const { poll, loading, error, fetchPublicPoll } = usePoll();
  const { submitVote, loading: submitting, error: submitError, alreadyVoted } = useVote();
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    fetchPublicPoll(pollId);
  }, [fetchPublicPoll, pollId]);

  if (loading) {
    return <LoadingState label="Loading poll..." />;
  }

  if (error || !poll) {
    return (
      <Screen title="Poll unavailable">
        <MessageBanner message={error || 'This poll could not be loaded.'} tone="error" />
      </Screen>
    );
  }

  if (submitted) {
    return (
      <Screen title="Vote submitted" subtitle="Thanks for sharing your response.">
        <Card>
          <MessageBanner message="Your vote has been recorded successfully." tone="success" />
        </Card>
      </Screen>
    );
  }

  if (alreadyVoted) {
    return (
      <Screen title="You already voted">
        <Card>
          <MessageBanner message="You already voted." tone="info" />
        </Card>
      </Screen>
    );
  }

  return (
    <Screen title={poll.title} subtitle={poll.description || 'Complete the poll below.'}>
      <VoteForm
        poll={poll}
        loading={submitting}
        submitError={submitError}
        onSubmit={async (input) => {
          const success = await submitVote(pollId, input);
          if (success) {
            setSubmitted(true);
          }
          return success;
        }}
      />
    </Screen>
  );
};

export default PublicVoteScreen;