import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';

const Sidebar: React.FC = () => {
  const { logout, user } = useAuth();
  const location = useLocation();

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard' },
    { path: '/dashboard/polls', label: 'Polls' },
    { path: '/dashboard/polls/create', label: 'Create Poll' },
    { path: '/dashboard/facebook-reports', label: 'Facebook & WhatsApp Reports' },
    ...(user?.role === 'SUPER_ADMIN' ? [{ path: '/dashboard/users', label: 'User Management' }] : []),
    ...(user?.role === 'ADMIN' ? [{ path: '/dashboard/assigned-polls', label: 'Assigned Polls' }] : []),
  ];

  return (
    <aside className="flex w-full flex-col border-r border-slate-200 bg-slate-950 text-white md:w-72">
      <div className="border-b border-slate-800 p-6">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">Admin workspace</p>
        <h2 className="mt-2 text-2xl font-bold">Opinion Polls</h2>
        <span className="mt-3 inline-flex rounded-full border border-slate-700 px-3 py-1 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
          {user?.role === 'SUPER_ADMIN' ? 'Super Admin' : 'Admin'}
        </span>
      </div>
      <nav className="flex-1 px-4 py-6">
        <ul className="space-y-2">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={`block rounded-xl px-4 py-3 text-sm font-medium transition ${
                  (location.pathname === item.path
                    || (item.path === '/dashboard/assigned-polls' && location.pathname.startsWith('/dashboard/assigned-polls'))
                    || (item.path === '/dashboard/facebook-reports' && location.pathname.startsWith('/dashboard/facebook-reports'))
                    || (item.path === '/dashboard/users' && location.pathname.startsWith('/dashboard/users')))
                    ? 'bg-white text-slate-950' : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                }`}
              >
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="space-y-3 border-t border-slate-800 p-4">
        <Link to="/" className="block rounded-xl border border-slate-700 px-4 py-3 text-sm font-medium text-slate-200 transition hover:border-slate-500 hover:text-white">
          View public site
        </Link>
        <button
          onClick={logout}
          className="w-full rounded-xl bg-red-600 px-4 py-3 text-sm font-semibold text-white transition hover:bg-red-700"
        >
          Logout
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;