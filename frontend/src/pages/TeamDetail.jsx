import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { teamsAPI, requestsAPI, usersAPI } from '../services/api';
import { User, Users, Mail, Phone, Send, ShieldAlert, Award, FileText, Check, X, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Github, Linkedin } from '../components/Icons';

const TeamDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [team, setTeam] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // States for join request submission
  const [requestMessage, setRequestMessage] = useState('');
  const [requestContact, setRequestContact] = useState('');
  const [requestSuccess, setRequestSuccess] = useState('');
  const [requestError, setRequestError] = useState('');
  const [requestSubmitting, setRequestSubmitting] = useState(false);

  // Status flags
  const [isCreator, setIsCreator] = useState(false);
  const [isMember, setIsMember] = useState(false);
  const [hasRequested, setHasRequested] = useState(false);
  const [isFullAccess, setIsFullAccess] = useState(false);

  // Creator applicants state
  const [incomingRequests, setIncomingRequests] = useState([]);
  const [requestsLoading, setRequestsLoading] = useState(false);

  const fetchTeamDetails = async () => {
    setLoading(true);
    try {
      const res = await teamsAPI.getTeamById(id);
      if (res.data && res.data.success) {
        setTeam(res.data.data);
        setIsFullAccess(res.data.isFullAccess);
        
        const userIdStr = user?._id?.toString();
        const creatorIdStr = res.data.data.creator?._id?.toString() || res.data.data.creator;
        
        const checkCreator = creatorIdStr === userIdStr;
        setIsCreator(checkCreator);
        
        const checkMember = res.data.data.members.some(
          (m) => (m._id?.toString() || m) === userIdStr
        );
        setIsMember(checkMember);

        // Fetch requests for this team if creator
        if (checkCreator) {
          fetchIncomingRequests();
        }
      }
    } catch (err) {
      console.error('Error fetching team:', err);
      setError('Team not found or server error.');
    }
    setLoading(false);
  };

  const fetchIncomingRequests = async () => {
    setRequestsLoading(true);
    try {
      const res = await requestsAPI.getIncomingRequests();
      if (res.data && res.data.success) {
        // Filter requests specifically for this team
        const filtered = res.data.data.filter(
          (req) => req.team?._id?.toString() === id
        );
        setIncomingRequests(filtered);
      }
    } catch (err) {
      console.error('Error fetching requests:', err);
    }
    setRequestsLoading(false);
  };

  useEffect(() => {
    if (user && id) {
      fetchTeamDetails();
    }
  }, [id, user]);

  const handleRequestSubmit = async (e) => {
    e.preventDefault();
    setRequestError('');
    setRequestSuccess('');
    setRequestSubmitting(true);

    if (!requestMessage || !requestContact) {
      setRequestError('Please fill in all request fields.');
      setRequestSubmitting(false);
      return;
    }

    try {
      const res = await requestsAPI.submitRequest({
        teamId: id,
        message: requestMessage,
        contactInfo: requestContact
      });

      if (res.data && res.data.success) {
        setRequestSuccess('Join request submitted successfully! An email notification has been sent to the creator.');
        setRequestMessage('');
        setRequestContact('');
        setHasRequested(true);
      }
    } catch (err) {
      setRequestError(err.response?.data?.message || 'Failed to submit request.');
    }
    setRequestSubmitting(false);
  };

  const handleProcessRequest = async (requestId, status) => {
    try {
      const res = await requestsAPI.processRequest(requestId, status);
      if (res.data && res.data.success) {
        // Reload details to show updated members and requests
        fetchTeamDetails();
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to process request');
    }
  };

  const handleDeleteTeam = async () => {
    if (window.confirm('Are you sure you want to delete this team? This action is permanent.')) {
      try {
        await teamsAPI.deleteTeam(id);
        navigate('/');
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete team');
      }
    }
  };

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !team) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <AlertTriangle className="mx-auto h-12 w-12 text-red-500 mb-4 animate-pulse-glow" />
        <h3 className="text-xl font-bold text-white mb-2">{error || 'Team not found'}</h3>
        <button onClick={() => navigate('/')} className="mt-4 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
          Back to Dashboard
        </button>
      </div>
    );
  }

  const isFull = team.members.length >= team.maxSize;

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-white mb-6">
        <ArrowLeft className="h-4 w-4" />
        <span>Dashboard</span>
      </Link>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Project Info & Apply Form */}
        <div className="lg:col-span-2 space-y-8">
          {/* Main Info Card */}
          <div className="glass-card rounded-xl border border-white/5 p-6 relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 to-purple-500 opacity-60"></div>
            
            <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
              <span className="inline-flex rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
                {team.category}
              </span>
              <div className="flex items-center gap-4">
                <span className={`inline-flex items-center gap-1 text-sm font-semibold ${isFull ? 'text-pink-400' : 'text-emerald-400'}`}>
                  <Users className="h-4 w-4" />
                  <span>
                    {team.members.length} / {team.maxSize} Members Joined
                  </span>
                </span>
                
                {(isCreator || user?.role === 'admin') && (
                  <div className="flex gap-2">
                    <Link
                      to={`/teams/edit/${team._id}`}
                      className="rounded bg-gray-800 border border-gray-700 px-3 py-1 text-xs font-semibold text-gray-300 hover:bg-gray-700"
                    >
                      Edit
                    </Link>
                    <button
                      onClick={handleDeleteTeam}
                      className="rounded bg-red-950/40 border border-red-900/30 px-3 py-1 text-xs font-semibold text-red-400 hover:bg-red-900/25"
                    >
                      Delete
                    </button>
                  </div>
                )}
              </div>
            </div>

            <h1 className="text-3xl font-extrabold text-white tracking-tight mb-2">
              {team.projectTitle}
            </h1>
            <p className="text-sm text-gray-400 mb-6">
              Team: <span className="text-white font-semibold">{team.name}</span>
            </p>

            <div className="prose prose-invert max-w-none text-gray-300 mb-8 leading-relaxed">
              <h3 className="text-lg font-bold text-white mb-2">Project Description</h3>
              <p className="whitespace-pre-line">{team.description}</p>
            </div>

            {/* Required Skills tags */}
            {team.requiredSkills && team.requiredSkills.length > 0 && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-gray-400 mb-3">
                  Required Skills & Expertise
                </h3>
                <div className="flex flex-wrap gap-2">
                  {team.requiredSkills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-lg bg-gray-850 border border-gray-700 px-3.5 py-1.5 text-xs font-semibold text-gray-200"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Join Request Form (only visible if not Creator/Member) */}
          {!isCreator && !isMember && (
            <div className="glass-card rounded-xl border border-white/5 p-6">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Send className="h-5 w-5 text-indigo-400 animate-float" />
                <span>Interested in this project? Apply to join</span>
              </h2>

              {requestSuccess && (
                <div className="mb-6 flex items-start gap-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-sm text-emerald-400 animate-pulse-glow">
                  <Check className="h-5 w-5 shrink-0" />
                  <span>{requestSuccess}</span>
                </div>
              )}

              {requestError && (
                <div className="mb-6 flex items-start gap-2.5 rounded-lg border border-red-500/30 bg-red-500/10 p-3.5 text-sm text-red-400 animate-pulse-glow">
                  <AlertTriangle className="h-5 w-5 shrink-0" />
                  <span>{requestError}</span>
                </div>
              )}

              {isFull ? (
                <p className="text-gray-400 text-sm italic">
                  This team is currently full and not accepting join requests.
                </p>
              ) : hasRequested ? (
                <p className="text-emerald-400 text-sm font-medium">
                  You have a pending join request. We've notified the creator!
                </p>
              ) : (
                <form onSubmit={handleRequestSubmit} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                      Introduction message *
                    </label>
                    <textarea
                      required
                      rows="4"
                      value={requestMessage}
                      onChange={(e) => setRequestMessage(e.target.value)}
                      placeholder="Hi! I have experience with React and would love to help design the homepage layout..."
                      className="glass-input block w-full rounded-lg py-2.5 px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 resize-none"
                    ></textarea>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                      Provide contact information (So they can reach you) *
                    </label>
                    <input
                      type="text"
                      required
                      value={requestContact}
                      onChange={(e) => setRequestContact(e.target.value)}
                      placeholder="My LinkedIn: linkedin.com/in/username or WhatsApp: +91 9876543210"
                      className="glass-input block w-full rounded-lg py-2.5 px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={requestSubmitting}
                    className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-500 disabled:bg-gray-800 disabled:text-gray-500"
                  >
                    {requestSubmitting ? 'Sending Request...' : 'Submit Application'}
                  </button>
                </form>
              )}
            </div>
          )}

          {/* Join Requests Review Section (Creator Dashboard) */}
          {isCreator && (
            <div className="glass-card rounded-xl border border-white/5 p-6">
              <h2 className="text-xl font-bold text-white mb-6">
                Pending Join Requests ({incomingRequests.length})
              </h2>

              {requestsLoading ? (
                <div className="flex h-24 items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
                </div>
              ) : incomingRequests.length === 0 ? (
                <p className="text-gray-400 text-sm italic">
                  No pending requests for this team.
                </p>
              ) : (
                <div className="space-y-6">
                  {incomingRequests.map((req) => (
                    <div key={req._id} className="rounded-lg border border-gray-800/80 bg-gray-950/40 p-5 flex flex-col gap-4 sm:flex-row sm:items-start justify-between">
                      <div className="space-y-2.5">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-white text-base">
                            {req.applicant.name}
                          </span>
                          <span className="text-[10px] text-gray-400 bg-gray-900 border border-gray-800 rounded px-1.5 py-0.5">
                            {req.applicant.college} - {req.applicant.branch}
                          </span>
                        </div>

                        {req.applicant.skills && req.applicant.skills.length > 0 && (
                          <div className="flex flex-wrap gap-1">
                            {req.applicant.skills.map((skill) => (
                              <span key={skill} className="text-[9px] bg-gray-800 text-gray-300 rounded px-1.5 py-0.5">
                                {skill}
                              </span>
                            ))}
                          </div>
                        )}

                        <div className="bg-gray-900/30 border border-gray-800/30 rounded p-3 text-sm text-gray-300">
                          <p className="font-semibold text-xs text-indigo-400 mb-1 flex items-center gap-1">
                            <FileText className="h-3 w-3" /> Message:
                          </p>
                          <p className="italic">"{req.message}"</p>
                        </div>

                        <div className="text-xs text-gray-400">
                          <span className="font-bold text-indigo-400">Applicant Contact:</span> {req.contactInfo}
                        </div>
                      </div>

                      {/* Accept/Reject Buttons */}
                      <div className="flex gap-2 sm:flex-col shrink-0 justify-end mt-2 sm:mt-0">
                        <button
                          onClick={() => handleProcessRequest(req._id, 'accepted')}
                          className="flex items-center justify-center gap-1 rounded bg-indigo-600 text-white font-semibold text-xs px-3 py-1.5 hover:bg-indigo-500"
                        >
                          <Check className="h-3.5 w-3.5" />
                          <span>Accept</span>
                        </button>
                        <button
                          onClick={() => handleProcessRequest(req._id, 'rejected')}
                          className="flex items-center justify-center gap-1 rounded bg-red-950/40 border border-red-900/30 text-red-400 font-semibold text-xs px-3 py-1.5 hover:bg-red-900/20"
                        >
                          <X className="h-3.5 w-3.5" />
                          <span>Reject</span>
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: Members Sidebar */}
        <div className="space-y-6">
          <div className="glass-card rounded-xl border border-white/5 p-6">
            <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
              <Users className="h-5 w-5 text-indigo-400" />
              <span>Project Members ({team.members.length})</span>
            </h2>

            <div className="space-y-4">
              {team.members.map((member) => {
                const isMemberCreator = (member._id?.toString() || member) === (team.creator?._id?.toString() || team.creator);
                return (
                  <div
                    key={member._id || member}
                    className="flex flex-col gap-2 rounded-lg bg-gray-900/30 border border-gray-800/40 p-4 transition-all hover:border-gray-800"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-sm text-white">
                        {member.name || 'Collaborator'}
                      </span>
                      {isMemberCreator && (
                        <span className="inline-flex rounded-full bg-pink-500/10 border border-pink-500/20 px-1.5 py-0.5 text-[9px] font-bold text-pink-400">
                          Creator
                        </span>
                      )}
                    </div>
                    
                    <p className="text-[10px] text-gray-500">
                      {member.college || 'College'} — {member.branch || 'Branch'}
                    </p>

                    {member.bio && (
                      <p className="text-xs text-gray-400 line-clamp-2 mt-1">
                        "{member.bio}"
                      </p>
                    )}

                    {member.skills && member.skills.length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {member.skills.map((s) => (
                          <span key={s} className="bg-gray-800 text-gray-300 text-[9px] px-1.5 py-0.5 rounded">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Reveal Contacts conditionally */}
                    <div className="mt-3 border-t border-gray-850 pt-2.5">
                      {isFullAccess ? (
                        <div className="space-y-1.5 text-xs text-gray-300">
                          {member.email && (
                            <div className="flex items-center gap-1.5 text-gray-400">
                              <Mail className="h-3 w-3 shrink-0" />
                              <span className="truncate hover:text-white select-all">{member.email}</span>
                            </div>
                          )}
                          {member.phone && (
                            <div className="flex items-center gap-1.5 text-gray-400">
                              <Phone className="h-3 w-3 shrink-0" />
                              <span className="truncate hover:text-white select-all">{member.phone}</span>
                            </div>
                          )}
                          {member.linkedin && (
                            <div className="flex items-center gap-1.5 text-gray-400">
                              <Linkedin className="h-3 w-3 shrink-0" />
                              <a
                                href={member.linkedin}
                                target="_blank"
                                rel="noreferrer"
                                className="truncate hover:text-indigo-400 underline"
                              >
                                {member.linkedin.replace(/https?:\/\/(www\.)?/, '')}
                              </a>
                            </div>
                          )}
                        </div>
                      ) : (
                        <p className="text-[10px] text-gray-500 italic">
                          Contact details unlocked upon joining the team.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TeamDetail;
