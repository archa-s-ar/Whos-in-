import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { Compass, User, School, BookOpen, FileText, CheckCircle, Phone, AlertTriangle, ArrowLeft } from 'lucide-react';
import { Github, Linkedin } from '../components/Icons';

const EditProfile = () => {
  const { user, updateProfile } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    college: '',
    branch: '',
    bio: '',
    skills: '',
    github: '',
    linkedin: '',
    phone: ''
  });

  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        college: user.college || '',
        branch: user.branch || '',
        bio: user.bio || '',
        skills: user.skills ? user.skills.join(', ') : '',
        github: user.github || '',
        linkedin: user.linkedin || '',
        phone: user.phone || ''
      });
    } else {
      navigate('/login');
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
    setError('');
    setSuccess('');
    setSubmitting(true);

    const { name, college, branch, bio, skills, github, linkedin, phone } = formData;

    if (!name || !college || !branch) {
      setError('Please fill in all required academic and name fields.');
      setSubmitting(false);
      return;
    }

    const skillsArray = skills
      ? skills.split(',').map((s) => s.trim()).filter((s) => s.length > 0)
      : [];

    const res = await updateProfile({
      name,
      college,
      branch,
      bio,
      skills: skillsArray,
      github,
      linkedin,
      phone
    });

    if (res.success) {
      setSuccess('Profile updated successfully!');
      setTimeout(() => {
        navigate(`/profile/${user._id}`);
      }, 1500);
    } else {
      setError(res.message || 'Failed to update profile.');
    }
    setSubmitting(false);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      <Link to={`/profile/${user?._id}`} className="inline-flex items-center gap-1.5 text-sm font-semibold text-gray-400 hover:text-white mb-6">
        <ArrowLeft className="h-4 w-4" />
        <span>View Profile</span>
      </Link>

      <div className="glass-card rounded-2xl p-8 border border-white/5 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-60"></div>

        <div className="mb-8">
          <h1 className="text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
            <User className="h-7 w-7 text-indigo-400 animate-float" />
            <span>Edit Profile Settings</span>
          </h1>
          <p className="text-sm text-gray-400 mt-2">
            Customize how you appear to team creators and co-workers.
          </p>
        </div>

        {error && (
          <div className="mb-6 flex items-start gap-2.5 rounded-lg border border-red-500/30 bg-red-500/10 p-3.5 text-sm text-red-400 animate-pulse-glow">
            <AlertTriangle className="h-5 w-5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {success && (
          <div className="mb-6 flex items-start gap-2.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3.5 text-sm text-emerald-400 animate-pulse-glow">
            <CheckCircle className="h-5 w-5 shrink-0" />
            <span>{success}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Full Name *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <User className="h-4.5 w-4.5" />
                </span>
                <input
                  name="name"
                  type="text"
                  required
                  value={formData.name}
                  onChange={handleChange}
                  className="glass-input block w-full rounded-lg py-2 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Email (Registered contact method)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-600">
                  <Mail className="h-4.5 w-4.5" />
                </span>
                <input
                  type="text"
                  disabled
                  value={user?.email || ''}
                  className="block w-full rounded-lg bg-gray-900/20 border border-gray-900 py-2 pl-10 pr-4 text-sm font-medium text-gray-600 select-none cursor-not-allowed"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                College / University *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <School className="h-4.5 w-4.5" />
                </span>
                <input
                  name="college"
                  type="text"
                  required
                  value={formData.college}
                  onChange={handleChange}
                  className="glass-input block w-full rounded-lg py-2 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Branch / Major *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <BookOpen className="h-4.5 w-4.5" />
                </span>
                <input
                  name="branch"
                  type="text"
                  required
                  value={formData.branch}
                  onChange={handleChange}
                  className="glass-input block w-full rounded-lg py-2 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Skills (Comma-separated)
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <CheckCircle className="h-4.5 w-4.5" />
                </span>
                <input
                  name="skills"
                  type="text"
                  value={formData.skills}
                  onChange={handleChange}
                  placeholder="React, AWS, Python, Figma"
                  className="glass-input block w-full rounded-lg py-2 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Short Biography
              </label>
              <div className="relative">
                <span className="absolute top-3 left-3 text-gray-500">
                  <FileText className="h-4.5 w-4.5" />
                </span>
                <textarea
                  name="bio"
                  rows="4"
                  value={formData.bio}
                  onChange={handleChange}
                  placeholder="Tell co-workers what drives you..."
                  className="glass-input block w-full rounded-lg py-2.5 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 resize-none"
                ></textarea>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                GitHub Profile URL
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <Github className="h-4.5 w-4.5" />
                </span>
                <input
                  name="github"
                  type="url"
                  value={formData.github}
                  onChange={handleChange}
                  className="glass-input block w-full rounded-lg py-2 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                LinkedIn Profile URL
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <Linkedin className="h-4.5 w-4.5" />
                </span>
                <input
                  name="linkedin"
                  type="url"
                  value={formData.linkedin}
                  onChange={handleChange}
                  className="glass-input block w-full rounded-lg py-2 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                Phone Number
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                  <Phone className="h-4.5 w-4.5" />
                </span>
                <input
                  name="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={handleChange}
                  className="glass-input block w-full rounded-lg py-2 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>
          </div>

          <div className="border-t border-gray-800/80 pt-6 flex justify-end gap-4">
            <Link
              to={`/profile/${user?._id}`}
              className="rounded-lg border border-gray-800 px-5 py-2.5 text-sm font-semibold text-gray-400 hover:text-white"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-indigo-500/20 hover:bg-indigo-500 disabled:bg-gray-850"
            >
              {submitting ? 'Saving Changes...' : 'Save Settings'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfile;
