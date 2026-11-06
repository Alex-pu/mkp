import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../components/common/Sidebar';
import Footer from '../components/common/Footer';
import { useAuth } from '../hooks/useAuth';
import logo from '../assets/logo.png';

const DashboardLayout: React.FC = () => {
	const { user } = useAuth();

	return (
		<div className="min-h-screen bg-slate-100 md:flex">
			<Sidebar />
			<div className="flex min-h-screen flex-1 flex-col">
				<header className="border-b border-slate-200 bg-white px-6 py-5 shadow-sm">
					<div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between">
						<div className="flex items-center gap-4">
							<img src={logo} alt="Pollsmaster logo" className="h-12 w-12 object-contain" />
							<div>
							<h1 className="text-2xl font-bold text-slate-900">Pollsmaster</h1>
							</div>
						</div>
						<div className="text-sm text-slate-600">
							<span className="font-semibold text-slate-900">{user?.email ?? ''}</span>
						</div>
					</div>
				</header>
				<main className="flex-1 p-6 lg:p-8">
					<Outlet />
				</main>
				<Footer />
			</div>
		</div>
	);
};

export default DashboardLayout;
