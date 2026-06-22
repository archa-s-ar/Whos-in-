import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { teamsAPI } from '../services/api';
import { Search, Users, PlusCircle, Sparkles, Filter, ChevronRight, HelpCircle } from 'lucide-react';

const CATEGORIES = [
  'All',
  'Hackathon',
  'Startup',
  'Research',
  'Open Source',
  'Competition',
  'College Project',
  'Other'
];

const Home = () => {
  const { user } = useContext(AuthContext);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');

  // Debounced search trigger (fetches updates on search/category change)
  useEffect(() => {
    const fetchTeams = async () => {
      setLoading(true);
      try {
        const res = await teamsAPI.getTeams(search, category);
        if (res.data && res.data.success) {
          setTeams(res.data.data);
        }
      } catch (err) {
        console.error('Error fetching teams:', err);
        setError('Could not fetch teams. Please try again later.');
      }
      setLoading(false);
    };

    const delayDebounce = setTimeout(() => {
      fetchTeams();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [search, category]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Premium Hero Header Section */}
      <div className="relative mb-12 rounded-2xl border border-white/5 bg-gray-900/40 p-8 md:p-12 text-center overflow-hidden backdrop-blur-md">
        {/* Glow decoration */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-indigo-500/10 rounded-full filter blur-[80px] pointer-events-none"></div>

        <div className="relative z-10 flex flex-col items-center">
          <div className="mb-4 inline-flex items-center gap-1.5 rounded-full bg-indigo-500/10 px-3 py-1 text-xs font-semibold text-indigo-400 border border-indigo-500/20">
            <Sparkles className="h-3.5 w-3.5" />
            <span>Connect & Create in your campus</span>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl md:text-6xl max-w-3xl leading-none">
            "I have an idea.<br />
            <span className="text-glow-gradient">Who's in?</span>"
          </h1>
          <p className="mx-auto mt-4 max-w-lg text-base text-gray-400 sm:text-lg">
            Find talented co-creators for hackathons, startups, research, open source, and college assignments.
          </p>

          <div className="mt-8 flex flex-wrap gap-4 justify-center">
            <Link
              to="/create-team"
              className="flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-500/25 transition-all hover:bg-indigo-500 hover:shadow-indigo-500/35 hover:-translate-y-0.5"
            >
              <PlusCircle className="h-4 w-4" />
              <span>Assemble a Team</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Discovery Search & Category Filters Bar */}
      <div className="mb-10 space-y-6">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          {/* Search bar */}
          <div className="relative flex-1 max-w-lg">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
              <Search className="h-4.5 w-4.5" />
            </span>
            <input
              type="text"
              placeholder="Search by projects, creator names, skills required..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="glass-input block w-full rounded-xl py-3 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20"
            />
          </div>

          <div className="flex items-center gap-2 text-sm text-gray-400 font-semibold self-end md:self-auto">
            <Filter className="h-4 w-4" />
            <span>Filter Category</span>
          </div>
        </div>

        {/* Categories Pills List */}
        <div className="flex flex-wrap gap-2.5 overflow-x-auto pb-2 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`rounded-lg px-4.5 py-2 text-xs font-semibold tracking-wide border transition-all ${
                category === cat
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-md shadow-indigo-500/25'
                  : 'bg-gray-900/50 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Teams Grid */}
      {loading ? (
        <div className="flex h-64 items-center justify-center">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
        </div>
      ) : error ? (
        <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-6 text-center text-red-400">
          {error}
        </div>
      ) : teams.length === 0 ? (
        <div className="rounded-2xl border border-gray-800/80 bg-gray-900/10 py-16 px-4 text-center">
          <HelpCircle className="mx-auto h-12 w-12 text-gray-600 mb-4" />
          <h3 className="text-lg font-bold text-white mb-2">No projects found</h3>
          <p className="text-gray-400 max-w-sm mx-auto text-sm">
            Try matching a different keyword, category, or create your own project team first!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {teams.map((team) => {
            const isFull = team.members.length >= team.maxSize;
            return (
              <div key={team._id} className="glass-card flex flex-col justify-between rounded-xl border border-white/5 p-6 h-full relative overflow-hidden">
                {/* Visual Glow Highlight */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-60"></div>

                <div>
                  <div className="flex items-center justify-between mb-4">
                    <span className="inline-flex rounded-full bg-indigo-500/10 px-2.5 py-0.5 text-xs font-semibold text-indigo-400 border border-indigo-500/10">
                      {team.category}
                    </span>
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold ${isFull ? 'text-pink-400' : 'text-emerald-400'}`}>
                      <Users className="h-3.5 w-3.5" />
                      <span>
                        {team.members.length} / {team.maxSize}
                      </span>
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white tracking-tight mb-1 line-clamp-1">
                    {team.projectTitle}
                  </h3>
                  <p className="text-xs text-gray-500 mb-3">
                    Team: <span className="font-semibold">{team.name}</span>
                  </p>

                  <p className="text-sm text-gray-400 line-clamp-3 mb-5">
                    {team.description}
                  </p>

                  {/* Required Skills list */}
                  {team.requiredSkills && team.requiredSkills.length > 0 && (
                    <div className="mb-6">
                      <h4 className="text-[10px] font-bold uppercase tracking-wider text-gray-500 mb-2">
                        Looking For
                      </h4>
                      <div className="flex flex-wrap gap-1.5">
                        {team.requiredSkills.map((skill) => (
                          <span
                            key={skill}
                            className="rounded bg-gray-800/80 border border-gray-700/50 px-2 py-0.5 text-[10px] font-semibold text-gray-300"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Card footer details & Action */}
                <div className="border-t border-gray-800/80 pt-4 mt-auto">
                  <div className="flex items-center justify-between mb-4">
                    <div className="text-left">
                      <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500">
                        Creator
                      </p>
                      <p className="text-xs font-semibold text-gray-300">
                        {team.creator?.name || 'Academic Creator'}
                      </p>
                      <p className="text-[9px] text-gray-500">
                        {team.creator?.college || 'College'}
                      </p>
                    </div>
                  </div>

                  {/* Progress bar of slots */}
                  <div className="w-full bg-gray-800 rounded-full h-1.5 mb-4">
                    <div
                      className={`h-1.5 rounded-full bg-gradient-to-r ${isFull ? 'from-pink-500 to-rose-600' : 'from-indigo-500 to-purple-600'}`}
                      style={{ width: `${(team.members.length / team.maxSize) * 100}%` }}
                    ></div>
                  </div>

                  <Link
                    to={`/teams/${team._id}`}
                    className="flex w-full items-center justify-center gap-1.5 rounded-lg border border-gray-800 bg-gray-900/50 px-4 py-2 text-xs font-semibold text-white transition-all hover:bg-indigo-600 hover:border-indigo-500 hover:text-white"
                  >
                    <span>View Project details</span>
                    <ChevronRight className="h-3.5 w-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Home;
