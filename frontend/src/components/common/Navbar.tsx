import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import logo from '../../assets/logo.png';

const Navbar: React.FC = () => {
  const { isAuthenticated } = useAuth();

  return (
    <header className="sticky top-0 z-30 border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-3 text-xl font-bold text-slate-900">
            <img src={logo} alt="Opinion Polls logo" className="h-10 w-10 object-contain" />
            <span className="text-blue-600">Poll Master</span>
          </Link>
        </div>
        <div className="flex items-center gap-3">
          <Link to="/polls" className="hidden rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 transition hover:border-slate-300 hover:text-slate-900 sm:inline-flex">
            Explore Polls
          </Link>
          <Link to={isAuthenticated ? '/dashboard' : '/login'} className="rounded-full bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700">
            {isAuthenticated ? 'Open Dashboard' : 'Admin Login'}
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;