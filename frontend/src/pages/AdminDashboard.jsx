import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { adminAPI, teamsAPI } from '../services/api';
import { ShieldAlert, Users, Award, BookOpen, Trash2, ShieldOff, ShieldAlert as ShieldIcon, Trash, HelpCircle, CheckCircle, Ban } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [metrics, setMetrics] = useState(null);
  const [users, setUsers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  // UI Tabs: 'metrics', 'users', 'teams'
  const [activeTab, setActiveTab] = useState('metrics');

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      if (activeTab === 'metrics') {
        const res = await adminAPI.getMetrics();
        if (res.data && res.data.success) {
          setMetrics(res.data.data);
        }
      } else if (activeTab === 'users') {
        const res = await adminAPI.getUsers();
        if (res.data && res.data.success) {
          setUsers(res.data.data);
        }
      } else if (activeTab === 'teams') {
        const res = await adminAPI.getTeams();
        if (res.data && res.data.success) {
          setTeams(res.data.data);
        }
      }
    } catch (err) {
      console.error('Error fetching admin data:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    // Redirect if not admin
    if (user && user.role !== 'admin') {
      navigate('/');
    } else if (user) {
      fetchAdminData();
    }
  }, [user, activeTab, navigate]);

  const handleToggleSuspend = async (userId) => {
    if (window.confirm('Are you sure you want to change the suspension status for this user?')) {
      try {
        const res = await adminAPI.toggleSuspend(userId);
        if (res.data && res.data.success) {
          fetchAdminData();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to toggle suspension');
      }
    }
  };

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to DELETE this user and all their created teams/requests? This cannot be undone.')) {
      try {
        const res = await adminAPI.deleteUser(userId);
        if (res.data && res.data.success) {
          fetchAdminData();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete user');
      }
    }
  };

  const handleDeleteTeam = async (teamId) => {
    if (window.confirm('Are you sure you want to delete this team?')) {
      try {
        const res = await teamsAPI.deleteTeam(teamId);
        if (res.data && res.data.success) {
          fetchAdminData();
        }
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete team');
      }
    }
  };

  if (loading && !metrics && users.length === 0 && teams.length === 0) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Title block */}
      <div className="mb-8 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-pink-500/10 text-pink-400 border border-pink-500/20 shadow-md">
          <ShieldAlert className="h-5 w-5 animate-float" />
        </div>
        <div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            Administration Panel
          </h1>
          <p className="text-sm text-gray-400">
            Monitor platform performance, inspect registrations, and manage content safety.
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="mb-8 border-b border-gray-800">
        <nav className="flex gap-6" aria-label="Tabs">
          {['metrics', 'users', 'teams'].map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`border-b-2 py-4 px-1 text-sm font-semibold uppercase tracking-wider transition-all ${
                activeTab === tab
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-gray-400 hover:border-gray-700 hover:text-white'
              }`}
            >
              {tab}
            </button>
          ))}
        </nav>
      </div>

      {/* Tab Content: Metrics */}
      {activeTab === 'metrics' && metrics && (
        <div className="space-y-8 animate-fade-in">
          {/* Cards Grid */}
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="glass-card rounded-xl border border-white/5 p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-500"></div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">
                Total Users
              </h3>
              <p className="text-4xl font-extrabold text-white">{metrics.totalUsers}</p>
            </div>

            <div className="glass-card rounded-xl border border-white/5 p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-purple-500"></div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">
                Total Teams
              </h3>
              <p className="text-4xl font-extrabold text-white">{metrics.totalTeams}</p>
            </div>

            <div className="glass-card rounded-xl border border-white/5 p-6 relative overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-1 bg-pink-500"></div>
              <h3 className="text-sm font-bold uppercase tracking-wider text-gray-500 mb-2">
                Active Teams
              </h3>
              <p className="text-4xl font-extrabold text-white">{metrics.activeTeams}</p>
            </div>
          </div>

          {/* Recent Registrations Table */}
          <div className="glass-card rounded-xl border border-white/5 p-6">
            <h2 className="text-lg font-bold text-white mb-6">Recent Signups</h2>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-800 text-sm text-left">
                <thead>
                  <tr className="text-gray-400 font-bold uppercase tracking-wider text-xs">
                    <th className="py-3.5 px-4">Name</th>
                    <th className="py-3.5 px-4">Email</th>
                    <th className="py-3.5 px-4">College</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Date</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-850">
                  {metrics.recentRegistrations.map((u) => (
                    <tr key={u._id} className="hover:bg-gray-900/10">
                      <td className="py-3.5 px-4 font-semibold text-white">{u.name}</td>
                      <td className="py-3.5 px-4 text-gray-400">{u.email}</td>
                      <td className="py-3.5 px-4 text-gray-400">{u.college}</td>
                      <td className="py-3.5 px-4 text-gray-400 capitalize">{u.role}</td>
                      <td className="py-3.5 px-4 text-gray-500">
                        {new Date(u.createdAt).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab Content: Users Management */}
      {activeTab === 'users' && (
        <div className="glass-card rounded-xl border border-white/5 p-6 animate-fade-in">
          <h2 className="text-lg font-bold text-white mb-6">All Platform Users ({users.length})</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800 text-sm text-left">
              <thead>
                <tr className="text-gray-400 font-bold uppercase tracking-wider text-xs">
                  <th className="py-3.5 px-4">Name</th>
                  <th className="py-3.5 px-4">Email</th>
                  <th className="py-3.5 px-4">College & Branch</th>
                  <th className="py-3.5 px-4">Role</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-850">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-gray-900/10">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <Link to={`/profile/${u._id}`} className="hover:text-indigo-400 hover:underline">
                        {u.name}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-gray-400">{u.email}</td>
                    <td className="py-3.5 px-4 text-gray-400">
                      {u.college} — {u.branch}
                    </td>
                    <td className="py-3.5 px-4 text-gray-400 capitalize">{u.role}</td>
                    <td className="py-3.5 px-4">
                      {u.isSuspended ? (
                        <span className="inline-flex items-center gap-1 rounded bg-red-950/40 border border-red-900/30 px-2 py-0.5 text-xs font-semibold text-red-400">
                          <Ban className="h-3 w-3" /> Suspended
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 rounded bg-emerald-950/40 border border-emerald-900/30 px-2 py-0.5 text-xs font-semibold text-emerald-400">
                          <CheckCircle className="h-3 w-3" /> Active
                        </span>
                      )}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        {u._id !== user._id && (
                          <>
                            <button
                              onClick={() => handleToggleSuspend(u._id)}
                              className={`rounded px-2.5 py-1 text-xs font-semibold border transition-all ${
                                u.isSuspended
                                  ? 'bg-emerald-950/30 border-emerald-900/40 text-emerald-400 hover:bg-emerald-900/20'
                                  : 'bg-yellow-950/30 border-yellow-900/40 text-yellow-400 hover:bg-yellow-900/20'
                              }`}
                            >
                              {u.isSuspended ? 'Unsuspend' : 'Suspend'}
                            </button>
                            <button
                              onClick={() => handleDeleteUser(u._id)}
                              className="rounded bg-red-950/40 border border-red-900/30 px-2.5 py-1 text-xs font-semibold text-red-400 hover:bg-red-900/20"
                            >
                              Delete
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab Content: Teams Management */}
      {activeTab === 'teams' && (
        <div className="glass-card rounded-xl border border-white/5 p-6 animate-fade-in">
          <h2 className="text-lg font-bold text-white mb-6">All Project Teams ({teams.length})</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-800 text-sm text-left">
              <thead>
                <tr className="text-gray-400 font-bold uppercase tracking-wider text-xs">
                  <th className="py-3.5 px-4">Project Title</th>
                  <th className="py-3.5 px-4">Team Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Creator</th>
                  <th className="py-3.5 px-4">Capacity</th>
                  <th className="py-3.5 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-850">
                {teams.map((t) => (
                  <tr key={t._id} className="hover:bg-gray-900/10">
                    <td className="py-3.5 px-4 font-semibold text-white">
                      <Link to={`/teams/${t._id}`} className="hover:text-indigo-400 hover:underline">
                        {t.projectTitle}
                      </Link>
                    </td>
                    <td className="py-3.5 px-4 text-gray-400">{t.name}</td>
                    <td className="py-3.5 px-4 text-gray-400">{t.category}</td>
                    <td className="py-3.5 px-4 text-gray-400">
                      {t.creator?.name || 'Academic Creator'}
                    </td>
                    <td className="py-3.5 px-4 text-gray-400">
                      {t.members.length} / {t.maxSize}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex justify-end gap-2">
                        <Link
                          to={`/teams/edit/${t._id}`}
                          className="rounded bg-gray-850 border border-gray-850 px-2.5 py-1 text-xs font-semibold text-gray-300 hover:bg-gray-800"
                        >
                          Edit
                        </Link>
                        <button
                          onClick={() => handleDeleteTeam(t._id)}
                          className="rounded bg-red-950/40 border border-red-900/30 px-2.5 py-1 text-xs font-semibold text-red-400 hover:bg-red-900/20"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminDashboard;
