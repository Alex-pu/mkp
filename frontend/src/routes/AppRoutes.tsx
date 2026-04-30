import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';

// Public pages
import LandingPage from '../pages/public/LandingPage';
import PollListPage from '../pages/public/PollListPage';
import VotePage from '../pages/public/VotePage';

// Auth pages
import LoginPage from '../pages/auth/LoginPage';

// Dashboard pages
import DashboardHome from '../pages/dashboard/DashboardHome';
import PollsPage from '../pages/dashboard/PollsPage';
import CreatePollPage from '../pages/dashboard/CreatePollPage';
import EditPollPage from '../pages/dashboard/EditPollPage';
import AnalyticsPage from '../pages/dashboard/AnalyticsPage';
import AssignedPollsPage from '../pages/dashboard/AssignedPollsPage';
import AssignedPollVotePage from '../pages/dashboard/AssignedPollVotePage';
import UsersManagementPage from '../pages/dashboard/UsersManagementPage';

// Layouts
import PublicLayout from '../layouts/PublicLayout';
import DashboardLayout from '../layouts/DashboardLayout';

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const { isAuthenticated } = useAuth();
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" />;
};

const AppRoutes = () => {
  return (
    <Routes>
      {/* Public routes */}
      <Route path="/" element={<PublicLayout />}>
        <Route index element={<LandingPage />} />
        <Route path="polls" element={<PollListPage />} />
        <Route path="poll/:id" element={<VotePage />} />
      </Route>

      {/* Auth routes */}
      <Route path="/login" element={<LoginPage />} />

      {/* Protected dashboard routes */}
      <Route path="/dashboard" element={
        <ProtectedRoute>
          <DashboardLayout />
        </ProtectedRoute>
      }>
        <Route index element={<DashboardHome />} />
        <Route path="polls" element={<PollsPage />} />
        <Route path="polls/create" element={<CreatePollPage />} />
        <Route path="polls/:id/edit" element={<EditPollPage />} />
        <Route path="polls/:id/analytics" element={<AnalyticsPage />} />
        <Route path="users" element={<UsersManagementPage />} />
        <Route path="assigned-polls" element={<AssignedPollsPage />} />
        <Route path="assigned-polls/:id/vote" element={<AssignedPollVotePage />} />
      </Route>

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;