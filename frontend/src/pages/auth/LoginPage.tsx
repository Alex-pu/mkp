import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../hooks/useAuth';
import { authService } from '../../services/authService';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Card from '../../components/common/Card';

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
        <div className="w-full overflow-hidden rounded-[2rem] border border-stone-200 bg-white/70 shadow-[0_30px_80px_rgba(120,113,108,0.14)] backdrop-blur sm:max-w-xl">
          <div className="flex items-center justify-center bg-white/80 p-6 sm:p-10 lg:p-12">
            <Card className="w-full max-w-md rounded-[1.75rem] border border-stone-200 bg-[linear-gradient(180deg,#fffdfa_0%,#f8f5ef_100%)] p-8 shadow-[0_18px_40px_rgba(120,113,108,0.10)]">
              <div className="mb-8 text-center">
                <h2 className="text-3xl font-bold text-stone-900">Log In</h2>
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
                Return to <Link to="/" className="font-semibold text-stone-800 transition hover:text-stone-950">Pollsmaster home</Link>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
