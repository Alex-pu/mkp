import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../../components/ui/Screen';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import LoadingState from '../../components/ui/LoadingState';
import MessageBanner from '../../components/ui/MessageBanner';
import PollCard from '../../components/polls/PollCard';
import { pollService } from '../../services/pollService';
import { PAGE_SIZE } from '../../config/env';
import type { PublicStackParamList } from '../../navigation/types';
import type { PaginatedResult, Poll } from '../../types';

type Props = NativeStackScreenProps<PublicStackParamList, 'PublicPolls'>;

const PublicPollsScreen = ({ navigation }: Props) => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPolls = async (nextPage = page) => {
    setLoading(true);
    setError('');

    try {
      const result = await pollService.getPublicPolls({ page: nextPage, limit: PAGE_SIZE }) as PaginatedResult<Poll>;
      setPolls(result.items);
      setPage(result.meta.page);
      setTotalPages(result.meta.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load public polls');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolls(1);
  }, []);

  return (
    <Screen title="Public polls" subtitle="Browse active public polls available for mobile voting.">
      {error ? <MessageBanner message={error} tone="error" /> : null}
      {loading ? <LoadingState label="Loading public polls..." /> : null}
      {!loading && polls.length === 0 ? <EmptyState title="No public polls" description="There are no public polls available right now." /> : null}
      {!loading && polls.map((poll) => (
        <PollCard key={poll.id} poll={poll} actionLabel="Open poll" onPress={() => navigation.navigate('PublicVote', { pollId: poll.id })} />
      ))}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Button label="Previous" onPress={() => loadPolls(page - 1)} disabled={page <= 1 || loading} variant="secondary" style={{ flex: 1 }} />
        <Button label={`Page ${page}/${totalPages}`} onPress={() => loadPolls(page)} disabled style={{ flex: 1 }} variant="secondary" />
        <Button label="Next" onPress={() => loadPolls(page + 1)} disabled={page >= totalPages || loading} variant="secondary" style={{ flex: 1 }} />
      </View>
    </Screen>
  );
};

export default PublicPollsScreen;