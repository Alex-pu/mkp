import React, { useEffect, useMemo, useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';
import Screen from '../../components/ui/Screen';
import Card from '../../components/ui/Card';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import LoadingState from '../../components/ui/LoadingState';
import EmptyState from '../../components/ui/EmptyState';
import MessageBanner from '../../components/ui/MessageBanner';
import Badge from '../../components/ui/Badge';
import { authService } from '../../services/authService';
import { useAuth } from '../../hooks/useAuth';
import type { AppTabParamList } from '../../navigation/types';
import type { ManagedUser, PaginationMeta } from '../../types';
import { formatDate } from '../../utils/formatDate';
import { colors } from '../../theme/colors';

type Props = BottomTabScreenProps<AppTabParamList, 'Users'>;

const UsersScreen = (_props: Props) => {
  const { user: currentUser } = useAuth();
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [message, setMessage] = useState('');
  const [pendingUserId, setPendingUserId] = useState<string | null>(null);
  const [passwordUser, setPasswordUser] = useState<ManagedUser | null>(null);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);

  const loadUsers = async (page = currentPage) => {
    setLoading(true);
    setError('');
    try {
      const data = await authService.getUsers({ page, limit: 10 });
      if (!Array.isArray(data)) {
        setUsers(data.items);
        setPagination(data.meta);
      }
    } catch (loadError: any) {
      setError(loadError.response?.data?.message || 'Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers(currentPage);
  }, [currentPage]);

  const totals = useMemo(() => ({
    total: pagination?.totalItems ?? users.length,
    active: pagination?.summary?.activeUsers ?? users.filter((user) => user.isActive).length,
    superAdmins: pagination?.summary?.superAdmins ?? users.filter((user) => user.role === 'SUPER_ADMIN').length,
  }), [pagination, users]);

  const handleStatusToggle = async (managedUser: ManagedUser) => {
    setPendingUserId(managedUser.id);
    setError('');
    setMessage('');
    try {
      const updatedUser = await authService.updateUserStatus(managedUser.id, !managedUser.isActive);
      setUsers((current) => current.map((user) => user.id === updatedUser.id ? updatedUser : user));
      setMessage(updatedUser.isActive ? `${updatedUser.email} has been reactivated.` : `${updatedUser.email} has been suspended.`);
      await loadUsers(currentPage);
    } catch (statusError: any) {
      setError(statusError.response?.data?.message || 'Failed to update user status');
    } finally {
      setPendingUserId(null);
    }
  };

  const handlePasswordUpdate = async () => {
    if (!passwordUser) {
      return;
    }

    if (newPassword.trim().length < 6) {
      setPasswordError('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    setIsUpdatingPassword(true);
    setPasswordError('');
    setError('');
    setMessage('');

    try {
      const updatedUser = await authService.updateUserPassword(passwordUser.id, { password: newPassword });
      setUsers((current) => current.map((user) => user.id === updatedUser.id ? updatedUser : user));
      setMessage(`Password updated for ${updatedUser.email}.`);
      setPasswordUser(null);
      setNewPassword('');
      setConfirmPassword('');
      await loadUsers(currentPage);
    } catch (updateError: any) {
      setPasswordError(updateError.response?.data?.message || 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  return (
    <Screen title="Users" subtitle="Manage account status, roles, and password resets.">
      {error ? <MessageBanner message={error} tone="error" /> : null}
      {message ? <MessageBanner message={message} tone="success" /> : null}
      {loading ? <LoadingState label="Loading users..." /> : null}

      {!loading ? (
        <>
          <View style={styles.metrics}>
            <Card style={styles.metricCard}><Text style={styles.metricValue}>{totals.total}</Text><Text style={styles.metricLabel}>Total users</Text></Card>
            <Card style={styles.metricCard}><Text style={styles.metricValue}>{totals.active}</Text><Text style={styles.metricLabel}>Active accounts</Text></Card>
            <Card style={styles.metricCard}><Text style={styles.metricValue}>{totals.superAdmins}</Text><Text style={styles.metricLabel}>Super admins</Text></Card>
          </View>

          {users.length === 0 ? <EmptyState title="No users found" description="User accounts will appear here once created." /> : null}

          {users.map((managedUser) => {
            const isCurrentUser = managedUser.id === currentUser?.id;
            return (
              <Card key={managedUser.id}>
                <Text style={styles.name}>{managedUser.name || managedUser.email}</Text>
                <Text style={styles.email}>{managedUser.email}</Text>
                <View style={styles.badges}><Badge label={managedUser.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'} tone="info" /><Badge label={managedUser.isActive ? 'Active' : 'Suspended'} tone={managedUser.isActive ? 'success' : 'danger'} /></View>
                <Text style={styles.meta}>Active polls: {managedUser.activePollCount}</Text>
                <Text style={styles.meta}>Created: {formatDate(managedUser.createdAt)}</Text>
                {managedUser.activePolls.slice(0, 3).map((poll) => <Text key={poll.id} style={styles.pollTitle}>• {poll.title}</Text>)}
                <View style={{ flexDirection: 'row', gap: 12 }}>
                  <Button label="Update password" onPress={() => setPasswordUser(managedUser)} variant="secondary" style={{ flex: 1 }} />
                  <Button
                    label={managedUser.isActive ? 'Suspend' : 'Unsuspend'}
                    onPress={() => handleStatusToggle(managedUser)}
                    variant={managedUser.isActive ? 'danger' : 'secondary'}
                    disabled={pendingUserId === managedUser.id || isCurrentUser}
                    loading={pendingUserId === managedUser.id}
                    style={{ flex: 1 }}
                  />
                </View>
              </Card>
            );
          })}

          <View style={{ flexDirection: 'row', gap: 12 }}>
            <Button label="Previous" onPress={() => setCurrentPage((current) => Math.max(1, current - 1))} disabled={(pagination?.page ?? 1) <= 1} variant="secondary" style={{ flex: 1 }} />
            <Button label={`Page ${pagination?.page ?? 1}/${pagination?.totalPages ?? 1}`} onPress={() => {}} disabled variant="secondary" style={{ flex: 1 }} />
            <Button label="Next" onPress={() => setCurrentPage((current) => Math.min(pagination?.totalPages ?? 1, current + 1))} disabled={(pagination?.page ?? 1) >= (pagination?.totalPages ?? 1)} variant="secondary" style={{ flex: 1 }} />
          </View>

          {passwordUser ? (
            <Card>
              <Text style={styles.cardHeading}>Update password for {passwordUser.name || passwordUser.email}</Text>
              {passwordError ? <MessageBanner message={passwordError} tone="error" /> : null}
              <Input label="New password" value={newPassword} onChangeText={setNewPassword} secureTextEntry />
              <Input label="Confirm password" value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry />
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <Button label="Cancel" onPress={() => { if (!isUpdatingPassword) { setPasswordUser(null); setNewPassword(''); setConfirmPassword(''); setPasswordError(''); } }} variant="secondary" style={{ flex: 1 }} />
                <Button label="Save password" onPress={handlePasswordUpdate} loading={isUpdatingPassword} style={{ flex: 1 }} />
              </View>
            </Card>
          ) : null}
        </>
      ) : null}
    </Screen>
  );
};

const styles = StyleSheet.create({
  metrics: {
    gap: 12,
  },
  metricCard: {
    gap: 4,
  },
  metricValue: {
    fontSize: 30,
    fontWeight: '800',
    color: colors.text,
  },
  metricLabel: {
    fontSize: 13,
    color: colors.textMuted,
  },
  name: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
  email: {
    fontSize: 14,
    color: colors.textMuted,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
  },
  meta: {
    fontSize: 14,
    color: colors.textMuted,
  },
  pollTitle: {
    fontSize: 13,
    color: colors.text,
  },
  cardHeading: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.text,
  },
});

export default UsersScreen;