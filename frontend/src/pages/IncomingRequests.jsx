import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { requestsAPI } from '../services/api';
import { Inbox, Check, X, FileText, Calendar, Users, HelpCircle, ArrowLeft } from 'lucide-react';

const IncomingRequests = () => {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const res = await requestsAPI.getIncomingRequests();
      if (res.data && res.data.success) {
        setRequests(res.data.data);
      }
    } catch (err) {
      console.error('Error fetching incoming requests:', err);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (user) {
      fetchRequests();
    }
  }, [user]);

  const handleProcess = async (requestId, status) => {
    try {
      const res = await requestsAPI.processRequest(requestId, status);
      if (res.data && res.data.success) {
        fetchRequests();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process request');
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-white mb-6">
        <ArrowLeft className="h-4 w-4" />
        <span>Dashboard</span>
      </Link>

      <div className="glass-card rounded-2xl p-6 border border-white/5 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-60"></div>

        <div className="flex items-center gap-3 mb-8">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-indigo-600/10 text-indigo-400 border border-indigo-500/20 shadow-md">
            <Inbox className="h-5 w-5 animate-float" />
          </div>
          <div>
            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              Incoming Collaboration Requests
            </h1>
            <p className="text-xs text-gray-400">
              Students who applied to join teams you created.
            </p>
          </div>
        </div>

        {requests.length === 0 ? (
          <div className="text-center py-16">
            <HelpCircle className="mx-auto h-12 w-12 text-gray-600 mb-4" />
            <h3 className="text-base font-bold text-white mb-1">Inbox Empty</h3>
            <p className="text-gray-400 max-w-xs mx-auto text-xs leading-normal">
              You don't have any pending join requests at the moment. When students apply to join your teams, they will appear here.
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {requests.map((req) => (
              <div
                key={req._id}
                className="rounded-xl border border-gray-800/80 bg-gray-950/20 p-5 flex flex-col gap-4 md:flex-row md:items-start justify-between hover:border-gray-800 transition-all"
              >
                <div className="space-y-3 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/10">
                      Applied to: {req.team?.projectTitle}
                    </span>
                    <span className="text-[9px] text-gray-500">
                      Team: {req.team?.name}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Link
                      to={`/profile/${req.applicant._id}`}
                      className="font-bold text-white text-base hover:text-indigo-400 transition-colors"
                    >
                      {req.applicant.name}
                    </Link>
                    <span className="text-[10px] text-gray-400">
                      {req.applicant.college} — {req.applicant.branch}
                    </span>
                  </div>

                  {req.applicant.skills && req.applicant.skills.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {req.applicant.skills.map((skill) => (
                        <span
                          key={skill}
                          className="text-[9px] bg-gray-800 text-gray-300 rounded px-1.5 py-0.5"
                        >
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="bg-gray-900/30 border border-gray-800/40 rounded-lg p-3 text-sm text-gray-300">
                    <p className="font-semibold text-xs text-indigo-400 mb-1 flex items-center gap-1">
                      <FileText className="h-3.5 w-3.5" /> Introduction:
                    </p>
                    <p className="italic">"{req.message}"</p>
                  </div>

                  <div className="flex items-center gap-4 text-xs text-gray-400">
                    <div>
                      <span className="font-semibold text-indigo-400">Contact Provided:</span> {req.contactInfo}
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3.5 w-3.5 text-gray-650" />
                      <span>{new Date(req.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 shrink-0 md:flex-col justify-end mt-4 md:mt-0">
                  <button
                    onClick={() => handleProcess(req._id, 'accepted')}
                    className="flex items-center justify-center gap-1 rounded-lg bg-indigo-600 text-white font-semibold text-xs px-4 py-2 hover:bg-indigo-500"
                  >
                    <Check className="h-4 w-4" />
                    <span>Accept</span>
                  </button>
                  <button
                    onClick={() => handleProcess(req._id, 'rejected')}
                    className="flex items-center justify-center gap-1 rounded-lg bg-red-950/40 border border-red-900/30 text-red-400 font-semibold text-xs px-4 py-2 hover:bg-red-900/20"
                  >
                    <X className="h-4 w-4" />
                    <span>Reject</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default IncomingRequests;
