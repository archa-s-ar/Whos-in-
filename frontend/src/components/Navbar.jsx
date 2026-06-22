import React, { useContext, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { requestsAPI } from '../services/api';
import { Users, LogOut, PlusSquare, Compass, ShieldAlert, Inbox, UserCircle } from 'lucide-react';

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [requestCount, setRequestCount] = useState(0);

  useEffect(() => {
    let interval;
    const fetchCount = async () => {
      if (user) {
        try {
          const res = await requestsAPI.getIncomingRequests();
          if (res.data && res.data.success) {
            setRequestCount(res.data.count);
          }
        } catch (err) {
          console.error('Error fetching incoming requests count:', err);
        }
      }
    };

    fetchCount();
    // Poll every 15 seconds to update requests
    if (user) {
      interval = setInterval(fetchCount, 15000);
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [user]);

  const onLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-gray-800/80 bg-gray-950/70 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Branding Logo */}
        <Link to="/" className="flex items-center gap-2 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 font-extrabold text-white shadow-lg shadow-indigo-500/30 transition-transform duration-300 group-hover:scale-105">
            W
          </div>
          <span className="text-xl font-bold tracking-tight text-white transition-colors duration-200 group-hover:text-indigo-400">
            Who's <span className="text-indigo-500">In?</span>
          </span>
        </Link>

        {/* Navigation Actions */}
        <nav className="flex items-center gap-6">
          {user ? (
            <>
              {/* Authenticated Links */}
              <Link
                to="/"
                className="flex items-center gap-1.5 text-sm font-medium text-gray-300 transition-colors hover:text-indigo-400"
              >
                <Compass className="h-4 w-4" />
                <span className="hidden md:inline">Browse</span>
              </Link>

              <Link
                to="/create-team"
                className="flex items-center gap-1.5 text-sm font-medium text-gray-300 transition-colors hover:text-indigo-400"
              >
                <PlusSquare className="h-4 w-4" />
                <span className="hidden md:inline">Create Team</span>
              </Link>

              {/* Incoming requests inbox */}
              <Link
                to="/requests"
                className="relative flex items-center gap-1.5 text-sm font-medium text-gray-300 transition-colors hover:text-indigo-400"
              >
                <Inbox className="h-4 w-4" />
                <span className="hidden md:inline">Requests</span>
                {requestCount > 0 && (
                  <span className="absolute -top-1.5 -right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-pink-500 text-[10px] font-bold text-white badge-glow">
                    {requestCount}
                  </span>
                )}
              </Link>

              {/* Admin Panel (if applicable) */}
              {user.role === 'admin' && (
                <Link
                  to="/admin"
                  className="flex items-center gap-1.5 text-sm font-semibold text-pink-400 border border-pink-500/20 px-2.5 py-0.5 rounded-full bg-pink-500/5 transition-colors hover:bg-pink-500/10"
                >
                  <ShieldAlert className="h-4 w-4" />
                  <span>Admin</span>
                </Link>
              )}

              {/* User Profile */}
              <Link
                to={`/profile/${user._id}`}
                className="flex items-center gap-1.5 text-sm font-medium text-gray-300 transition-colors hover:text-indigo-400"
              >
                <UserCircle className="h-4 w-4" />
                <span className="max-w-[120px] truncate hidden md:inline">{user.name.split(' ')[0]}</span>
              </Link>

              {/* Logout Button */}
              <button
                onClick={onLogout}
                className="flex items-center gap-1.5 rounded-lg border border-gray-800 bg-gray-900/50 px-3.5 py-1.5 text-xs font-semibold text-gray-300 transition-all hover:bg-red-500/10 hover:border-red-500/30 hover:text-red-400"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </>
          ) : (
            <>
              {/* Unauthenticated Links */}
              <Link
                to="/login"
                className="text-sm font-semibold text-gray-300 transition-colors hover:text-white"
              >
                Login
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/30"
              >
                Register
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
