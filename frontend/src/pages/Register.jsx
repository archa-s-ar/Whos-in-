import React, { useState, useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { User, Mail, KeyRound, School, BookOpen, FileText, CheckCircle, Phone, AlertTriangle } from 'lucide-react';
import { Github, Linkedin } from '../components/Icons';

const Register = () => {
  const { register, user, loading, error: authError } = useContext(AuthContext);
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    college: '',
    branch: '',
    bio: '',
    skills: '',
    github: '',
    linkedin: '',
    phone: ''
  });
  const [localError, setLocalError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
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

    const { name, email, password, college, branch, bio, skills, github, linkedin, phone } = formData;

    // Validation
    if (!name || !email || !password || !college || !branch) {
      setLocalError('Please fill in all required academic and security fields.');
      setIsSubmitting(false);
      return;
    }

    if (password.length < 6) {
      setLocalError('Password must be at least 6 characters.');
      setIsSubmitting(false);
      return;
    }

    // Parse skills from comma-separated string to array
    const skillsArray = skills
      ? skills.split(',').map((skill) => skill.trim()).filter((skill) => skill.length > 0)
      : [];

    const profileData = {
      name,
      email,
      password,
      college,
      branch,
      bio,
      skills: skillsArray,
      github,
      linkedin,
      phone
    };

    const res = await register(profileData);
    setIsSubmitting(false);

    if (res.success) {
      navigate('/');
    }
  };

  return (
    <div className="relative flex min-h-[calc(100vh-4rem)] items-center justify-center px-4 py-12 sm:px-6 lg:px-8 overflow-hidden">
      {/* Background glowing decorations */}
      <div className="auth-bg-decorations top-20 right-10 bg-indigo-500/10"></div>
      <div className="auth-bg-decorations bottom-20 left-10 bg-fuchsia-500/10"></div>

      <div className="relative w-full max-w-2xl z-10">
        <div className="glass-card rounded-2xl p-8 border border-white/5 shadow-2xl">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-extrabold text-white tracking-tight">
              Create an <span className="text-indigo-400">Account</span>
            </h1>
            <p className="mt-2 text-sm text-gray-400">
              Sign up and connect with student project collaborators.
            </p>
          </div>

          {(localError || authError) && (
            <div className="mb-6 flex items-start gap-2.5 rounded-lg border border-red-500/30 bg-red-500/10 p-3.5 text-sm text-red-400 animate-pulse-glow">
              <AlertTriangle className="h-5 w-5 shrink-0" />
              <span>{localError || authError}</span>
            </div>
          )}

          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Section: Credentials */}
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-indigo-400 mb-4 border-b border-gray-800/80 pb-2">
                1. Account Details
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                    Full Name *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      <User className="h-4 w-4" />
                    </span>
                    <input
                      name="name"
                      type="text"
                      required
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Archa Nair"
                      className="glass-input block w-full rounded-lg py-2 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                    Email Address *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      <Mail className="h-4 w-4" />
                    </span>
                    <input
                      name="email"
                      type="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="archa@college.edu"
                      className="glass-input block w-full rounded-lg py-2 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                    Password * (Min 6 chars)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      <KeyRound className="h-4 w-4" />
                    </span>
                    <input
                      name="password"
                      type="password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••"
                      className="glass-input block w-full rounded-lg py-2 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Academic Info */}
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-indigo-400 mb-4 border-b border-gray-800/80 pb-2">
                2. Academic Info
              </h2>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                    College / University *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      <School className="h-4 w-4" />
                    </span>
                    <input
                      name="college"
                      type="text"
                      required
                      value={formData.college}
                      onChange={handleChange}
                      placeholder="RIT Kottayam"
                      className="glass-input block w-full rounded-lg py-2 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                    Branch / Department *
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      <BookOpen className="h-4 w-4" />
                    </span>
                    <input
                      name="branch"
                      type="text"
                      required
                      value={formData.branch}
                      onChange={handleChange}
                      placeholder="Computer Science & Eng"
                      className="glass-input block w-full rounded-lg py-2 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Profile Info */}
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-indigo-400 mb-4 border-b border-gray-800/80 pb-2">
                3. Profile Details (Optional)
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                    Skills (Comma-separated)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      <CheckCircle className="h-4 w-4" />
                    </span>
                    <input
                      name="skills"
                      type="text"
                      value={formData.skills}
                      onChange={handleChange}
                      placeholder="React, Node.js, Python, Figma"
                      className="glass-input block w-full rounded-lg py-2 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                    Short Bio
                  </label>
                  <div className="relative">
                    <span className="absolute top-3 left-3 text-gray-500">
                      <FileText className="h-4 w-4" />
                    </span>
                    <textarea
                      name="bio"
                      rows="3"
                      value={formData.bio}
                      onChange={handleChange}
                      placeholder="Tell potential teammates about your interests and past project experiences..."
                      className="glass-input block w-full rounded-lg py-2 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 resize-none"
                    ></textarea>
                  </div>
                </div>
              </div>
            </div>

            {/* Section: Contact & Social Info */}
            <div>
              <h2 className="text-sm font-semibold uppercase tracking-wider text-indigo-400 mb-4 border-b border-gray-800/80 pb-2">
                4. Contacts & Social links (At least one contact method is required)
              </h2>
              <p className="text-xs text-gray-400 mb-4">
                Your email is registered as a contact method. You can optionally add LinkedIn and Phone.
              </p>
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                    GitHub Link
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      <Github className="h-4 w-4" />
                    </span>
                    <input
                      name="github"
                      type="url"
                      value={formData.github}
                      onChange={handleChange}
                      placeholder="https://github.com/username"
                      className="glass-input block w-full rounded-lg py-2 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
                    LinkedIn Link
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                      <Linkedin className="h-4 w-4" />
                    </span>
                    <input
                      name="linkedin"
                      type="url"
                      value={formData.linkedin}
                      onChange={handleChange}
                      placeholder="https://linkedin.com/in/username"
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
                      <Phone className="h-4 w-4" />
                    </span>
                    <input
                      name="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={handleChange}
                      placeholder="+91 9876543210"
                      className="glass-input block w-full rounded-lg py-2 pl-10 pr-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>
                </div>
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
                    Creating Account...
                  </span>
                ) : (
                  'Create Account'
                )}
              </button>
            </div>
          </form>

          <div className="mt-8 text-center border-t border-gray-800/80 pt-6">
            <p className="text-sm text-gray-400">
              Already have an account?{' '}
              <Link to="/login" className="font-semibold text-indigo-400 hover:text-indigo-300">
                Sign in here
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
