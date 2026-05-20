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

type Props = CompositeScreenProps<BottomTabScreenProps<AppTabParamList, 'Polls'>, NativeStackScreenProps<AppStackParamList>>;

const PollsScreen = ({ navigation }: Props) => {
  const [polls, setPolls] = useState<Poll[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadPolls = async (nextPage = page) => {
    setLoading(true);
    setError('');
    try {
      const result = await pollService.getPolls({ page: nextPage, limit: PAGE_SIZE }) as PaginatedResult<Poll>;
      setPolls(result.items);
      setPage(result.meta.page);
      setTotalPages(result.meta.totalPages);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load polls');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (pollId: string) => {
    setError('');
    try {
      await pollService.deletePoll(pollId);
      await loadPolls(page);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to delete poll');
    }
  };

  useEffect(() => {
    loadPolls(1);
  }, []);

  return (
    <Screen title="Polls" subtitle="Create, edit, activate, and review analytics for your polls.">
      <Button label="Create poll" onPress={() => navigation.navigate('PollForm')} />
      {error ? <MessageBanner message={error} tone="error" /> : null}
      {loading ? <LoadingState label="Loading polls..." /> : null}
      {!loading && polls.length === 0 ? <EmptyState title="No polls yet" description="Create your first poll to get started." /> : null}
      {!loading && polls.map((poll) => (
        <View key={poll.id} style={{ gap: 10 }}>
          <PollCard poll={poll} actionLabel="Edit poll" onPress={() => navigation.navigate('PollForm', { pollId: poll.id })} />
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Button label="Analytics" onPress={() => navigation.navigate('Analytics', { pollId: poll.id })} variant="secondary" style={{ flex: 1 }} />
            <Button label="Delete" onPress={() => handleDelete(poll.id)} variant="danger" disabled={poll.totalVotes > 0} style={{ flex: 1 }} />
          </View>
        </View>
      ))}
      <View style={{ flexDirection: 'row', gap: 12 }}>
        <Button label="Previous" onPress={() => loadPolls(page - 1)} disabled={page <= 1 || loading} variant="secondary" style={{ flex: 1 }} />
        <Button label={`Page ${page}/${totalPages}`} onPress={() => loadPolls(page)} disabled variant="secondary" style={{ flex: 1 }} />
        <Button label="Next" onPress={() => loadPolls(page + 1)} disabled={page >= totalPages || loading} variant="secondary" style={{ flex: 1 }} />
      </View>
    </Screen>
  );
};

export default PollsScreen;