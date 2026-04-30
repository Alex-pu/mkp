import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import { pollService } from '../../services/pollService';
import { authService } from '../../services/authService';
import { Poll } from '../../types';
import Input from '../../components/common/Input';
import PollListTable from '../../components/dashboard/PollListTable';
import { useAuth } from '../../hooks/useAuth';

const DashboardHome: React.FC = () => {
	const { user } = useAuth();
	const [polls, setPolls] = useState<Poll[]>([]);
	const [assignedPolls, setAssignedPolls] = useState<Poll[]>([]);
	const [inviteData, setInviteData] = useState<{ name: string; email: string; password: string; role: 'SUPER_ADMIN' | 'ADMIN' }>({
		name: '',
		email: '',
		password: '',
		role: 'ADMIN',
	});
	const [inviteLoading, setInviteLoading] = useState(false);
	const [inviteMessage, setInviteMessage] = useState('');
	const [inviteError, setInviteError] = useState('');

	useEffect(() => {
		pollService.getPolls().then(setPolls).catch(() => setPolls([]));
		if (user?.role === 'ADMIN') {
			pollService.getAssignedPrivatePolls().then(setAssignedPolls).catch(() => setAssignedPolls([]));
		}
	}, []);

	const activePolls = polls.filter((poll) => poll.isActive).length;
	const recentPolls = polls.slice(0, 5);

	const handleInviteAdmin = async (event: React.FormEvent) => {
		event.preventDefault();
		setInviteLoading(true);
		setInviteError('');
		setInviteMessage('');
		try {
			await authService.register(inviteData);
			setInviteMessage(`${inviteData.role === 'SUPER_ADMIN' ? 'Super admin' : 'Admin'} account created for ${inviteData.email}`);
			setInviteData({ name: '', email: '', password: '', role: 'ADMIN' });
		} catch (error: any) {
			setInviteError(error.response?.data?.error || 'Failed to create account');
		} finally {
			setInviteLoading(false);
		}
	};

	return (
		<div className="space-y-6">
			<div>
				<h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
				<p className="text-gray-600 mt-1">Manage polls and review participation at a glance.</p>
			</div>

			<div className="grid gap-4 md:grid-cols-3">
				<Card className="rounded-3xl border border-slate-200 bg-white shadow-soft"><p className="text-sm text-gray-500">Total polls</p><p className="text-3xl font-bold text-gray-900">{polls.length}</p></Card>
				<Card className="rounded-3xl border border-slate-200 bg-white shadow-soft"><p className="text-sm text-gray-500">Active polls</p><p className="text-3xl font-bold text-gray-900">{activePolls}</p></Card>
				<Card className="rounded-3xl border border-slate-200 bg-white shadow-soft"><p className="text-sm text-gray-500">Total vote submissions</p><p className="text-3xl font-bold text-gray-900">{polls.reduce((sum, poll) => sum + poll.totalVotes, 0)}</p></Card>
			</div>

			{user?.role === 'ADMIN' && (
				<Card className="rounded-3xl border border-blue-200 bg-gradient-to-r from-blue-50 to-white shadow-soft">
					<div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
						<div>
							<h2 className="text-xl font-semibold text-slate-900">Assigned private polls</h2>
							<p className="text-slate-600">Vote on private polls assigned to you by the super admin without exposing them publicly.</p>
						</div>
						<div className="flex items-center gap-3">
							<span className="rounded-full bg-white px-4 py-2 text-sm font-semibold text-blue-700 shadow-sm">{assignedPolls.length} assigned</span>
							<Link to="/dashboard/assigned-polls"><Button>Open assigned polls</Button></Link>
						</div>
					</div>
					{assignedPolls.length > 0 && (
						<div className="mt-6 grid gap-4 md:grid-cols-2">
							{assignedPolls.slice(0, 2).map((poll) => (
								<div key={poll.id} className="rounded-2xl border border-blue-100 bg-white p-5 shadow-sm">
									<div className="flex items-start justify-between gap-4">
										<div>
											<h3 className="text-lg font-semibold text-slate-900">{poll.title}</h3>
											<p className="mt-1 text-sm text-slate-500">{poll.description || 'Private poll assigned for dashboard voting.'}</p>
										</div>
										<span className={`rounded-full px-3 py-1 text-xs font-semibold ${poll.isActive ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'}`}>{poll.isActive ? 'Open now' : 'Inactive'}</span>
									</div>
									<div className="mt-4 flex items-center justify-between text-sm text-slate-500">
										<span>{poll.questions.length} question{poll.questions.length === 1 ? '' : 's'}</span>
										<Link to={`/dashboard/assigned-polls/${poll.id}/vote`} className="font-semibold text-blue-600 hover:text-blue-700">Vote now</Link>
									</div>
								</div>
							))}
						</div>
					)}
				</Card>
			)}

			<Card className="rounded-3xl border border-slate-200 bg-white shadow-soft">
				<div className="flex items-center justify-between gap-4">
					<div>
						<h2 className="text-xl font-semibold text-gray-900">Quick actions</h2>
						<p className="text-gray-600">Create a new poll or review existing ones.</p>
					</div>
					<div className="flex gap-3">
						{user?.role === 'SUPER_ADMIN' ? <Link to="/dashboard/users"><Button variant="secondary">User management</Button></Link> : null}
						<Link to="/dashboard/polls"><Button variant="secondary">View polls</Button></Link>
						<Link to="/dashboard/polls/create"><Button>Create poll</Button></Link>
					</div>
				</div>
			</Card>

			<div className="grid gap-6 xl:grid-cols-[1.4fr_0.9fr]">
				<div className="space-y-4">
					<div>
						<h2 className="text-2xl font-bold text-slate-900">Recent polls</h2>
						<p className="text-sm text-slate-500">Track the latest polls, status, IDs, and total vote submissions.</p>
					</div>
					<PollListTable polls={recentPolls} />
				</div>

				{user?.role === 'SUPER_ADMIN' ? (
					<Card className="rounded-3xl border border-slate-200 bg-white shadow-soft">
						<h2 className="text-2xl font-bold text-slate-900">Create account</h2>
						<p className="mt-2 text-sm text-slate-500">As super admin, you can provision both standard admin and super admin dashboard accounts.</p>
						<form onSubmit={handleInviteAdmin} className="mt-6 space-y-4">
							<Input label="Name" value={inviteData.name} onChange={(event) => setInviteData((current) => ({ ...current, name: event.target.value }))} />
							<Input label="Email" type="email" value={inviteData.email} onChange={(event) => setInviteData((current) => ({ ...current, email: event.target.value }))} required />
							<Input label="Password" type="password" value={inviteData.password} onChange={(event) => setInviteData((current) => ({ ...current, password: event.target.value }))} required />
							<div>
								<label className="mb-1 block text-sm font-medium text-gray-700">Role</label>
								<select
									className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
									value={inviteData.role}
									onChange={(event) => setInviteData((current) => ({ ...current, role: event.target.value as 'SUPER_ADMIN' | 'ADMIN' }))}
								>
									<option value="ADMIN">Admin</option>
									<option value="SUPER_ADMIN">Super Admin</option>
								</select>
							</div>
							{inviteMessage && <div className="rounded-2xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm font-medium text-emerald-700">{inviteMessage}</div>}
							{inviteError && <div className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{inviteError}</div>}
							<Button type="submit" disabled={inviteLoading}>{inviteLoading ? 'Creating account...' : 'Create account'}</Button>
						</form>
					</Card>
				) : (
					<Card className="rounded-3xl border border-slate-200 bg-white shadow-soft">
						<h2 className="text-2xl font-bold text-slate-900">Role summary</h2>
						<p className="mt-2 text-sm text-slate-500">You are a standard admin. You can create and manage your own polls, while the super admin manages account provisioning and global oversight.</p>
					</Card>
				)}
			</div>
		</div>
	);
};

export default DashboardHome;
