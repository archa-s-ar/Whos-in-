import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { usersAPI, teamsAPI } from '../services/api';
import { Mail, Phone, User, BookOpen, School, Calendar, Lock, PlusCircle, Pencil, AlertCircle } from 'lucide-react';
import { Github, Linkedin } from '../components/Icons';

const UserProfile = () => {
  const { id } = useParams();
  const { user: currentUser } = useContext(AuthContext);

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  // Teams lists for this user
  const [createdTeams, setCreatedTeams] = useState([]);
  const [joinedTeams, setJoinedTeams] = useState([]);
  const [teamsLoading, setTeamsLoading] = useState(true);

  const isOwner = currentUser?._id === id;

  useEffect(() => {
    const fetchProfileAndTeams = async () => {
      setLoading(true);
      setTeamsLoading(true);
      setError('');

      try {
        // 1. Fetch user profile
        const profileRes = await usersAPI.getUserProfile(id);
        if (profileRes.data && profileRes.data.success) {
          setProfile(profileRes.data.data);
        }

        // 2. Fetch all teams and filter for this user
        const teamsRes = await teamsAPI.getTeams();
        if (teamsRes.data && teamsRes.data.success) {
          const allTeams = teamsRes.data.data;
          
          const created = allTeams.filter(
            (t) => (t.creator?._id || t.creator) === id
          );
          
          const joined = allTeams.filter(
            (t) =>
              t.members.some((m) => (m._id || m) === id) &&
              (t.creator?._id || t.creator) !== id
          );

          setCreatedTeams(created);
          setJoinedTeams(joined);
        }
      } catch (err) {
        console.error('Error loading profile details:', err);
        setError('User profile not found.');
      }
      setLoading(false);
      setTeamsLoading(false);
    };

    if (id) {
      fetchProfileAndTeams();
    }
  }, [id, currentUser]);

  if (loading) {
    return (
      <div className="flex h-96 items-center justify-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
      </div>
    );
  }

  if (error || !profile) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center">
        <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4 animate-pulse-glow" />
        <h3 className="text-xl font-bold text-white mb-2">{error || 'Profile not found'}</h3>
        <Link to="/" className="mt-4 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white">
          Back to Dashboard
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* Left Column: Profile Card */}
        <div className="space-y-6">
          <div className="glass-card rounded-2xl p-6 border border-white/5 shadow-xl relative overflow-hidden text-center">
            {/* Design Banner */}
            <div className="absolute top-0 left-0 right-0 h-16 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 opacity-60"></div>
            
            <div className="relative pt-8 flex justify-center mb-4">
              <div className="flex h-24 w-24 items-center justify-center rounded-full bg-gray-900 border-4 border-indigo-500 text-white font-black text-4xl shadow-xl">
                {profile.name.charAt(0).toUpperCase()}
              </div>
            </div>

            <h1 className="text-2xl font-extrabold text-white tracking-tight">
              {profile.name}
            </h1>
            
            {profile.role === 'admin' && (
              <span className="mt-1 inline-flex rounded-full bg-pink-500/10 border border-pink-500/20 px-2 py-0.5 text-[10px] font-bold text-pink-400">
                Administrator
              </span>
            )}

            <div className="mt-6 flex flex-col gap-2.5 text-sm text-gray-400 border-t border-gray-800/80 pt-6 text-left">
              <div className="flex items-center gap-2">
                <School className="h-4.5 w-4.5 text-indigo-400 shrink-0" />
                <span className="truncate">{profile.college}</span>
              </div>
              <div className="flex items-center gap-2">
                <BookOpen className="h-4.5 w-4.5 text-indigo-400 shrink-0" />
                <span className="truncate">{profile.branch}</span>
              </div>
              <div className="flex items-center gap-2">
                <Calendar className="h-4.5 w-4.5 text-indigo-400 shrink-0" />
                <span>Joined {new Date(profile.createdAt).toLocaleDateString(undefined, { month: 'long', year: 'numeric' })}</span>
              </div>
            </div>

            {/* Profile Action for Owner */}
            {isOwner && (
              <Link
                to="/profile/edit"
                className="mt-6 flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-indigo-600 hover:border-indigo-500"
              >
                <Pencil className="h-3.5 w-3.5" />
                <span>Edit Profile settings</span>
              </Link>
            )}
          </div>

          {/* Socials / Contacts Panel */}
          <div className="glass-card rounded-2xl p-6 border border-white/5">
            <h2 className="text-base font-bold text-white mb-4">Contact Details</h2>

            {profile.isPrivate ? (
              <div className="rounded-lg border border-gray-800 bg-gray-950/20 p-4 text-center">
                <Lock className="mx-auto h-8 w-8 text-gray-600 mb-2 animate-float" />
                <p className="text-xs text-gray-400 leading-normal">
                  Contact information is locked. Join a team or request collaboration with this user to connect.
                </p>
              </div>
            ) : (
              <div className="space-y-3.5 text-sm text-gray-300">
                {profile.email && (
                  <div className="flex items-center gap-2.5">
                    <Mail className="h-4.5 w-4.5 text-gray-500" />
                    <span className="truncate hover:text-white select-all">{profile.email}</span>
                  </div>
                )}
                {profile.phone && (
                  <div className="flex items-center gap-2.5">
                    <Phone className="h-4.5 w-4.5 text-gray-500" />
                    <span className="truncate hover:text-white select-all">{profile.phone}</span>
                  </div>
                )}
                {profile.linkedin && (
                  <div className="flex items-center gap-2.5">
                    <Linkedin className="h-4.5 w-4.5 text-gray-500" />
                    <a
                      href={profile.linkedin}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate text-indigo-400 hover:underline"
                    >
                      {profile.linkedin.replace(/https?:\/\/(www\.)?/, '')}
                    </a>
                  </div>
                )}
                {profile.github && (
                  <div className="flex items-center gap-2.5">
                    <Github className="h-4.5 w-4.5 text-gray-500" />
                    <a
                      href={profile.github}
                      target="_blank"
                      rel="noreferrer"
                      className="truncate text-indigo-400 hover:underline"
                    >
                      {profile.github.replace(/https?:\/\/(www\.)?/, '')}
                    </a>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Bio, Skills & Project Cards */}
        <div className="lg:col-span-2 space-y-6">
          {/* About Section */}
          <div className="glass-card rounded-2xl p-6 border border-white/5">
            <h2 className="text-lg font-bold text-white mb-4">About Me</h2>
            <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
              {profile.bio || 'This student has not written a bio yet.'}
            </p>

            {profile.skills && profile.skills.length > 0 && (
              <div className="mt-6 border-t border-gray-800/80 pt-6">
                <h3 className="text-xs font-bold uppercase tracking-wider text-gray-500 mb-3.5">
                  My Skills
                </h3>
                <div className="flex flex-wrap gap-2">
                  {profile.skills.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-lg bg-indigo-500/10 border border-indigo-500/20 px-3 py-1.5 text-xs font-semibold text-indigo-400"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Project Teams List */}
          <div className="space-y-6">
            {/* Created Projects */}
            <div className="glass-card rounded-2xl p-6 border border-white/5">
              <h2 className="text-lg font-bold text-white mb-6">
                Assembled Teams ({createdTeams.length})
              </h2>

              {teamsLoading ? (
                <div className="flex h-16 items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
                </div>
              ) : createdTeams.length === 0 ? (
                <p className="text-gray-400 text-sm italic">
                  Has not created any projects yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {createdTeams.map((team) => (
                    <Link
                      key={team._id}
                      to={`/teams/${team._id}`}
                      className="group rounded-xl border border-gray-800/80 bg-gray-950/20 p-4 transition-all hover:border-indigo-500/50 hover:bg-gray-950/40"
                    >
                      <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/10">
                        {team.category}
                      </span>
                      <h3 className="font-bold text-white text-base mt-2 truncate group-hover:text-indigo-400 transition-colors">
                        {team.projectTitle}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        Team: {team.name}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>

            {/* Joined Projects */}
            <div className="glass-card rounded-2xl p-6 border border-white/5">
              <h2 className="text-lg font-bold text-white mb-6">
                Collaborations ({joinedTeams.length})
              </h2>

              {teamsLoading ? (
                <div className="flex h-16 items-center justify-center">
                  <div className="h-6 w-6 animate-spin rounded-full border-2 border-indigo-500 border-t-transparent"></div>
                </div>
              ) : joinedTeams.length === 0 ? (
                <p className="text-gray-400 text-sm italic">
                  Has not joined any collaborator teams yet.
                </p>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  {joinedTeams.map((team) => (
                    <Link
                      key={team._id}
                      to={`/teams/${team._id}`}
                      className="group rounded-xl border border-gray-800/80 bg-gray-950/20 p-4 transition-all hover:border-indigo-500/50 hover:bg-gray-950/40"
                    >
                      <span className="text-[10px] font-semibold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/10">
                        {team.category}
                      </span>
                      <h3 className="font-bold text-white text-base mt-2 truncate group-hover:text-indigo-400 transition-colors">
                        {team.projectTitle}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1 truncate">
                        Team: {team.name}
                      </p>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
