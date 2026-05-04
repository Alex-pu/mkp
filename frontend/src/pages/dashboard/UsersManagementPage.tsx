import React, { useEffect, useMemo, useState } from 'react';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import { authService } from '../../services/authService';
import { ManagedUser, PaginationMeta } from '../../types';
import { useAuth } from '../../hooks/useAuth';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import PaginationControls from '../../components/common/PaginationControls';

const USERS_PAGE_SIZE = 10;

const UsersManagementPage: React.FC = () => {
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
      const data = await authService.getUsers({ page, limit: USERS_PAGE_SIZE });
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

  const openPasswordModal = (managedUser: ManagedUser) => {
    setPasswordUser(managedUser);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
    setError('');
    setMessage('');
  };

  const closePasswordEditor = () => {
    if (isUpdatingPassword) {
      return;
    }

    setPasswordUser(null);
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError('');
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
      await loadUsers(currentPage);
      setPasswordUser(null);
      setNewPassword('');
      setConfirmPassword('');
      setPasswordError('');
    } catch (updateError: any) {
      setPasswordError(updateError.response?.data?.message || 'Failed to update password');
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  if (loading) {
    return <LoadingSpinner />;
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-slate-900">User Management</h1>
        <p className="mt-1 text-slate-500">Review all dashboard users, their roles, account status, and active polls they currently own.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card className="rounded-3xl border border-slate-200 bg-white shadow-soft">
          <p className="text-sm text-slate-500">Total users</p>
          <p className="text-3xl font-bold text-slate-900">{totals.total}</p>
        </Card>
        <Card className="rounded-3xl border border-slate-200 bg-white shadow-soft">
          <p className="text-sm text-slate-500">Active accounts</p>
          <p className="text-3xl font-bold text-slate-900">{totals.active}</p>
        </Card>
        <Card className="rounded-3xl border border-slate-200 bg-white shadow-soft">
          <p className="text-sm text-slate-500">Super admins</p>
          <p className="text-3xl font-bold text-slate-900">{totals.superAdmins}</p>
        </Card>
      </div>

      {message && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{message}</div>}
      {error && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{error}</div>}

      <Card className="overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-soft">
        {users.length === 0 ? (
          <p className="text-sm text-slate-500">No users found.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm">
              <thead className="bg-slate-50 text-left text-slate-500">
                <tr>
                  <th className="px-4 py-3 font-semibold">User</th>
                  <th className="px-4 py-3 font-semibold">Role</th>
                  <th className="px-4 py-3 font-semibold">Status</th>
                  <th className="px-4 py-3 font-semibold">Active Polls</th>
                  <th className="px-4 py-3 font-semibold">Created</th>
                  <th className="px-4 py-3 font-semibold text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 bg-white">
                {users.map((managedUser) => {
                  const isCurrentUser = managedUser.id === currentUser?.id;
                  return (
                    <tr key={managedUser.id}>
                      <td className="px-4 py-4 align-top">
                        <p className="font-semibold text-slate-900">{managedUser.name || 'Unnamed user'}</p>
                        <p className="mt-1 text-slate-500">{managedUser.email}</p>
                        {isCurrentUser ? <span className="mt-2 inline-flex rounded-full bg-blue-100 px-2.5 py-1 text-xs font-semibold text-blue-700">You</span> : null}
                      </td>
                      <td className="px-4 py-4 align-top">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${managedUser.role === 'SUPER_ADMIN' ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-700'}`}>
                          {managedUser.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
                        </span>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <span className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${managedUser.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                          {managedUser.isActive ? 'Active' : 'Suspended'}
                        </span>
                      </td>
                      <td className="px-4 py-4 align-top">
                        <p className="font-semibold text-slate-900">{managedUser.activePollCount}</p>
                        <div className="mt-2 space-y-1">
                          {managedUser.activePolls.length > 0 ? managedUser.activePolls.slice(0, 3).map((poll) => (
                            <p key={poll.id} className="max-w-xs truncate text-xs text-slate-500">• {poll.title}</p>
                          )) : <p className="text-xs text-slate-500">No active polls</p>}
                          {managedUser.activePollCount > 3 ? <p className="text-xs font-medium text-slate-500">+{managedUser.activePollCount - 3} more</p> : null}
                        </div>
                      </td>
                      <td className="px-4 py-4 align-top text-slate-500">{new Date(managedUser.createdAt).toLocaleDateString()}</td>
                      <td className="px-4 py-4 align-top">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="primary"
                            size="sm"
                            disabled={pendingUserId === managedUser.id}
                            onClick={() => openPasswordModal(managedUser)}
                          >
                            Update Password
                          </Button>
                          <Button
                            variant={managedUser.isActive ? 'danger' : 'secondary'}
                            size="sm"
                            disabled={pendingUserId === managedUser.id || isCurrentUser}
                            onClick={() => handleStatusToggle(managedUser)}
                          >
                            {pendingUserId === managedUser.id
                              ? 'Updating...'
                              : managedUser.isActive
                                ? 'Suspend'
                                : 'Unsuspend'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      <PaginationControls currentPage={pagination?.page ?? 1} totalPages={pagination?.totalPages ?? 1} totalItems={pagination?.totalItems ?? users.length} itemLabel="users" onPageChange={setCurrentPage} />

      {passwordUser ? (
        <Card className="rounded-3xl border border-blue-200 bg-blue-50/70 shadow-soft">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-start lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-blue-600">Password Update</p>
              <h2 className="mt-2 text-2xl font-bold text-slate-900">Update password for {passwordUser.name || passwordUser.email}</h2>
              <p className="mt-2 text-sm text-slate-600">
                This sets a new login password for <span className="font-semibold text-slate-800">{passwordUser.email}</span>.
              </p>
            </div>
            <Button variant="secondary" onClick={closePasswordEditor} disabled={isUpdatingPassword}>
              Close
            </Button>
          </div>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <Input
              label="New password"
              type="password"
              value={newPassword}
              onChange={(event) => setNewPassword(event.target.value)}
              error={passwordError}
              minLength={6}
              autoFocus
            />
            <Input
              label="Confirm password"
              type="password"
              value={confirmPassword}
              onChange={(event) => setConfirmPassword(event.target.value)}
              minLength={6}
            />
          </div>

          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <Button variant="secondary" onClick={closePasswordEditor} disabled={isUpdatingPassword}>
              Cancel
            </Button>
            <Button onClick={handlePasswordUpdate} disabled={isUpdatingPassword}>
              {isUpdatingPassword ? 'Saving...' : 'Save Password'}
            </Button>
          </div>
        </Card>
      ) : null}
    </div>
  );
};

export default UsersManagementPage;
