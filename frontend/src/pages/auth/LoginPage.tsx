import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';
import logo from '../../assets/logo.png';

const LoginPage: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await authService.login(formData);
      login(response.user, response.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,#f8f5ef_0%,#fdfbf7_45%,#f6f1e8_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-[2rem] border border-stone-200 bg-white/70 shadow-[0_30px_80px_rgba(120,113,108,0.14)] backdrop-blur sm:max-w-5xl lg:grid-cols-[0.95fr_1.05fr]">
          <div className="relative hidden overflow-hidden bg-[linear-gradient(180deg,#faf7f0_0%,#f2e8d9_100%)] p-10 lg:block">
            <div className="absolute -left-10 top-10 h-40 w-40 rounded-full bg-amber-200/40 blur-3xl" />
            <div className="absolute bottom-0 right-0 h-48 w-48 rounded-full bg-stone-300/30 blur-3xl" />
            <div className="relative flex h-full flex-col justify-between">
              <div>
                <Link to="/" className="inline-flex items-center gap-3 text-stone-900">
                  <img src={logo} alt="Poll Master logo" className="h-12 w-12 object-contain" />
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.35em] text-stone-500">Poll Master</p>
                    <p className="mt-1 text-lg font-semibold text-stone-900">Administration portal</p>
                  </div>
                </Link>
                <div className="mt-16 max-w-md">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-stone-500">Classic dashboard access</p>
                  <h1 className="mt-4 text-5xl font-bold leading-tight tracking-tight text-stone-900">Review poll activity with a calm, focused workspace.</h1>
                  <p className="mt-6 text-lg leading-8 text-stone-600">
                    Sign in to manage questions, track response trends, and monitor text feedback from one refined control panel.
                  </p>
                </div>
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-stone-200 bg-white/80 p-5 shadow-sm">
                  <p className="text-sm font-medium text-stone-500">Dashboard benefit</p>
                  <p className="mt-2 text-xl font-semibold text-stone-900">Live analytics</p>
                  <p className="mt-2 text-sm leading-7 text-stone-600">Track response patterns and open-text feedback in one place.</p>
                </div>
                <div className="rounded-[1.5rem] border border-stone-200 bg-white/80 p-5 shadow-sm">
                  <p className="text-sm font-medium text-stone-500">Admin workflow</p>
                  <p className="mt-2 text-xl font-semibold text-stone-900">Poll control</p>
                  <p className="mt-2 text-sm leading-7 text-stone-600">Create, edit, and publish public polls with minimal friction.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-center bg-white/80 p-6 sm:p-10 lg:p-12">
            <Card className="w-full max-w-md rounded-[1.75rem] border border-stone-200 bg-[linear-gradient(180deg,#fffdfa_0%,#f8f5ef_100%)] p-8 shadow-[0_18px_40px_rgba(120,113,108,0.10)]">
              <div className="mb-8 text-center">
                <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full border border-stone-200 bg-white shadow-sm lg:hidden">
                  <img src={logo} alt="Poll Master logo" className="h-10 w-10 object-contain" />
                </div>
                <p className="mt-4 text-xs font-semibold uppercase tracking-[0.35em] text-stone-500">Secure access</p>
                <h2 className="mt-3 text-3xl font-bold text-stone-900">Admin Login</h2>
                <p className="mt-2 text-stone-600">Sign in to access the dashboard</p>
              </div>

              <form onSubmit={handleSubmit}>
                <Input
                  label="Email"
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="rounded-xl border-stone-300 bg-white/90 px-4 py-3 focus:ring-stone-400"
                />

                <Input
                  label="Password"
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  className="rounded-xl border-stone-300 bg-white/90 px-4 py-3 focus:ring-stone-400"
                />

                {error && (
                  <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                    {error}
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full rounded-full bg-stone-900 py-3 text-base font-semibold text-white hover:bg-stone-800 focus:ring-stone-500"
                  disabled={loading}
                >
                  {loading ? 'Signing in...' : 'Sign In'}
                </Button>
              </form>

              <div className="mt-6 text-center text-sm text-stone-500">
                Return to <Link to="/" className="font-semibold text-stone-800 transition hover:text-stone-950">Poll Master home</Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;