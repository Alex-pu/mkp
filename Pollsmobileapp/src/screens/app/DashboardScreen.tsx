import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import type { CompositeScreenProps } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import Screen from '../../components/ui/Screen';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import LoadingState from '../../components/ui/LoadingState';
import MessageBanner from '../../components/ui/MessageBanner';
import { useAuth } from '../../hooks/useAuth';
import { pollService } from '../../services/pollService';
import type { AppStackParamList, AppTabParamList } from '../../navigation/types';
import type { PaginatedResult, Poll } from '../../types';
import { colors } from '../../theme/colors';

type Props = CompositeScreenProps<BottomTabScreenProps<AppTabParamList, 'Dashboard'>, NativeStackScreenProps<AppStackParamList>>;

const DashboardScreen = ({ navigation }: Props) => {
  const { user, logout } = useAuth();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [stats, setStats] = useState({ myPolls: 0, assignedPolls: 0, publicPolls: 0 });

  const loadStats = async () => {
    setLoading(true);
    setError('');

    try {
      const [myPolls, assignedPolls, publicPolls] = await Promise.all([
        pollService.getPolls({ page: 1, limit: 1 }) as Promise<PaginatedResult<Poll>>,
        pollService.getAssignedPrivatePolls({ page: 1, limit: 1 }) as Promise<PaginatedResult<Poll>>,
        pollService.getPublicPolls({ page: 1, limit: 1 }) as Promise<PaginatedResult<Poll>>,
      ]);

      setStats({
        myPolls: myPolls.meta.totalItems,
        assignedPolls: assignedPolls.meta.totalItems,
        publicPolls: publicPolls.meta.totalItems,
      });
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load dashboard overview');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, []);

  return (
    <Screen title={`Welcome${user?.name ? `, ${user.name}` : ''}`} subtitle="Manage polls, assignments, reports, and analytics in one place.">
      {error ? <MessageBanner message={error} tone="error" /> : null}
      {loading ? <LoadingState label="Loading dashboard..." /> : null}

      {!loading ? (
        <>
          <View style={styles.grid}>
            <Card style={styles.metricCard}><Text style={styles.metricValue}>{stats.myPolls}</Text><Text style={styles.metricLabel}>Managed polls</Text></Card>
            <Card style={styles.metricCard}><Text style={styles.metricValue}>{stats.assignedPolls}</Text><Text style={styles.metricLabel}>Assigned private polls</Text></Card>
            <Card style={styles.metricCard}><Text style={styles.metricValue}>{stats.publicPolls}</Text><Text style={styles.metricLabel}>Public polls</Text></Card>
          </View>

          <Card>
            <Text style={styles.sectionTitle}>Quick actions</Text>
            <Button label="Create poll" onPress={() => navigation.navigate('PollForm')} />
            <Button label="Browse public polls" onPress={() => navigation.navigate('PublicPolls')} variant="secondary" />
            <Button label="Refresh overview" onPress={loadStats} variant="secondary" />
            <Button label="Logout" onPress={logout} variant="danger" />
          </Card>
        </>
      ) : null}
    </Screen>
  );
};

const styles = StyleSheet.create({
  grid: {
    gap: 12,
  },
  metricCard: {
    gap: 6,
  },
  metricValue: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.text,
  },
  metricLabel: {
    fontSize: 14,
    color: colors.textMuted,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
});

export default DashboardScreen;