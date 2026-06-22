import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { KeyRound, Mail, AlertTriangle } from 'lucide-react';

const Login = () => {
  const { login, user, loading, error: authError } = useContext(AuthContext);
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    // If already logged in, send to home
    if (user) {
      navigate('/');
    }
  }, [user, navigate]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLocalError('');
    setIsSubmitting(true);

    if (!formData.email || !formData.password) {
      setLocalError('Please fill in all fields.');
      setIsSubmitting(false);
      return;
    }

    const res = await login(formData.email, formData.password);
    setIsSubmitting(false);
    
    if (res.success) {
      navigate('/');
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8 overflow-hidden">
      {/* Dynamic Background Glowing Blobs */}
      <div className="auth-bg-decorations top-10 left-10 bg-indigo-500/20"></div>
      <div className="auth-bg-decorations bottom-10 right-10 bg-purple-500/20"></div>

      <div className="relative w-full max-w-md z-10">
        <div className="glass-card rounded-2xl p-8 border border-white/5 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Welcome <span className="text-indigo-400">Back</span>
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              Find teammates, build projects, collaborate.
            </p>
          </div>

          {(localError || authError) && (
            <div className="mb-6 flex items-start gap-2.5 rounded-lg border border-red-500/30 bg-red-500/10 p-3.5 text-sm text-red-400 animate-pulse-glow">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <span>{localError || authError}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Email Address
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <Mail className="h-4 w-4" />
                </span>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="name@college.edu"
                  className="glass-input block w-full rounded-lg py-2.5 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div>
              <label htmlFor="password" className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <KeyRound className="h-4 w-4" />
                </span>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="glass-input block w-full rounded-lg py-2.5 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div>
              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="group relative flex w-full justify-center rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/30 disabled:bg-gray-800 disabled:text-gray-500 disabled:shadow-none"
              >
                {isSubmitting || loading ? (
                  <span className="flex items-center gap-2">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                    Signing In...
                  </span>
                ) : (
                  'Sign In'
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center border-t border-gray-800/80 pt-6">
            <p className="text-sm text-gray-400">
              Don't have an account?{' '}
              <Link to="/register" className="font-semibold text-indigo-400 hover:text-indigo-300">
                Register here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
