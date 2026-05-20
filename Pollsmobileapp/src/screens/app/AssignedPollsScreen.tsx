import React, { useEffect, useState } from 'react';
import { View } from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../../components/ui/Screen';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import LoadingState from '../../components/ui/LoadingState';
import MessageBanner from '../../components/ui/MessageBanner';
import PollCard from '../../components/polls/PollCard';
import { PAGE_SIZE } from '../../config/env';
import { pollService } from '../../services/pollService';
import type { AppStackParamList, AppTabParamList } from '../../navigation/types';
import type { PaginatedResult, Poll } from '../../types';

type Props = CompositeScreenProps<BottomTabScreenProps<AppTabParamList, 'Assigned'>, NativeStackScreenProps<AppStackParamList>>;

const AssignedPollsScreen = ({ navigation }: Props) => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPolls = async (nextPage = page) => {
    setLoading(true);
    setError('');
    try {
      const result = await pollService.getAssignedPrivatePolls({ page: nextPage, limit: PAGE_SIZE }) as PaginatedResult<Poll>;
      setPolls(result.items);
      setPage(result.meta.page);
      setTotalPages(result.meta.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load assigned polls');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPolls(1);
  }, []);

  return (
    <Screen title="Assigned polls" subtitle="Private polls assigned to your account.">
      {error ? <MessageBanner message={error} tone="error" /> : null}
      {loading ? <LoadingState label="Loading assigned polls..." /> : null}
      {!loading && polls.length === 0 ? <EmptyState title="No assigned polls" description="Private polls assigned to you will appear here." /> : null}
      {!loading && polls.map((poll) => (
        <PollCard key={poll.id} poll={poll} actionLabel="Open assigned poll" onPress={() => navigation.navigate('AssignedVote', { pollId: poll.id })} />
      ))}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Button label="Previous" onPress={() => loadPolls(page - 1)} disabled={page <= 1 || loading} variant="secondary" style={{ flex: 1 }} />
        <Button label={`Page ${page}/${totalPages}`} onPress={() => loadPolls(page)} disabled variant="secondary" style={{ flex: 1 }} />
        <Button label="Next" onPress={() => loadPolls(page + 1)} disabled={page >= totalPages || loading} variant="secondary" style={{ flex: 1 }} />
      </View>
    </Screen>
  );
};

export default AssignedPollsScreen;