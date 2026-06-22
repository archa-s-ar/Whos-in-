import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { teamsAPI } from '../services/api';
import { Sparkles, Users, Award, BookOpen, AlertTriangle, ArrowLeft } from 'lucide-react';

const CATEGORIES = [
  'Hackathon',
  'Startup',
  'Research',
  'Open Source',
  'Competition',
  'College Project',
  'Other'
];

const CreateTeam = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    projectTitle: '',
    description: '',
    category: 'Hackathon',
    requiredSkills: '',
    maxSize: 4
  });

  const [error, setError] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSubmitting(true);

    const { name, projectTitle, description, category, requiredSkills, maxSize } = formData;

    if (!name || !projectTitle || !description || !category || !maxSize) {
      setError('Please fill in all required fields.');
      setSubmitting(false);
      return;
    }

    if (maxSize < 2) {
      setError('Maximum team size must be at least 2.');
      setSubmitting(false);
      return;
    }

    const skillsArray = requiredSkills
      ? requiredSkills.split(',').map((s) => s.trim()).filter((s) => s.length > 0)
      : [];

    try {
      const res = await teamsAPI.createTeam({
        name,
        projectTitle,
        description,
        category,
        requiredSkills: skillsArray,
        maxSize: parseInt(maxSize)
      });

      if (res.data && res.data.success) {
        navigate(`/teams/${res.data.data._id}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create team. Please try again.');
    }
    setSubmitting(false);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to="/" className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-white mb-6">
        <ArrowLeft className="h-4 w-4" />
        <span>Dashboard</span>
      </Link>

      <div className="glass-card rounded-2xl p-8 border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-60"></div>

        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-indigo-400 animate-float" />
            <span>Assemble a new team</span>
          </h1>
          <p className="text-sm text-gray-400 mt-2">
            Define your project context, write down your requirements, and gather co-creators.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-2.5 rounded-lg border border-red-500/30 bg-red-500/10 p-3.5 text-sm text-red-400 animate-pulse-glow">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Project Title / Idea Name *
              </label>
              <input
                type="text"
                name="projectTitle"
                required
                value={formData.projectTitle}
                onChange={handleChange}
                placeholder="Autonomous Space Cargo Drone"
                className="glass-input block w-full rounded-lg py-2.5 px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Team Name *
              </label>
              <input
                type="text"
                name="name"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="Team Orion"
                className="glass-input block w-full rounded-lg py-2.5 px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Category *
              </label>
              <select
                name="category"
                value={formData.category}
                onChange={handleChange}
                className="glass-input block w-full rounded-lg py-2.5 px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20"
              >
                {CATEGORIES.map((cat) => (
                  <option key={cat} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Detailed Description *
              </label>
              <textarea
                name="description"
                required
                rows="6"
                value={formData.description}
                onChange={handleChange}
                placeholder="Explain the project scope, technical stack you plan to use, timeline, and current milestones..."
                className="glass-input block w-full rounded-lg py-2.5 px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 resize-none"
              ></textarea>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Skills looking for (Comma-separated)
              </label>
              <input
                type="text"
                name="requiredSkills"
                value={formData.requiredSkills}
                onChange={handleChange}
                placeholder="React Native, OpenCV, ROS, PyTorch"
                className="glass-input block w-full rounded-lg py-2.5 px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Maximum Team Size * (Min 2)
              </label>
              <input
                type="number"
                name="maxSize"
                required
                min="2"
                value={formData.maxSize}
                onChange={handleChange}
                className="glass-input block w-full rounded-lg py-2.5 px-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20"
              />
            </div>
          </div>

          <div className="border-t border-gray-800/80 pt-6 flex justify-end gap-4">
            <button
              type="button"
              onClick={() => navigate('/')}
              className="rounded-lg border border-gray-800 px-5 py-2.5 text-sm font-semibold text-gray-400 hover:text-white"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-500 disabled:bg-gray-850"
            >
              {submitting ? 'Creating Team...' : 'Launch Team'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTeam;
