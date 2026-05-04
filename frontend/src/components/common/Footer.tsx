import React from 'react';
import { Link } from 'react-router-dom';

const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-slate-950 text-slate-200">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-10 sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-lg font-semibold text-white">Opinion Polls</p>
          <p className="mt-2 max-w-xl text-sm text-slate-400">
            A powerful feedback engine for capturing opinions, running surveys, and unlocking deep, actionable insights.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-4 text-sm text-slate-300">
          <Link to="/" className="hover:text-white">Home</Link>
          <Link to="/polls" className="hover:text-white">Browse Polls</Link>
          <Link to="/login" className="hover:text-white">Log In</Link>
        </div>
      </div>
    </footer>
  );
};

export default Footer;