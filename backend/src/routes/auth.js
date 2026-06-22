const express = require('express');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

const router = express.Router();

// Helper to sign JWT
const signToken = (id) => {
  return jwt.sign(
    { id },
    process.env.JWT_SECRET || 'super_secret_jwt_token_key_for_whos_in_192837',
    { expiresIn: '30d' }
  );
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
router.post('/register', async (req, res) => {
  const { name, email, password, college, branch, bio, skills, github, linkedin, phone } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ success: false, message: 'User already exists with this email' });
    }

    // Check if this is the first user registered in the system
    const userCount = await User.countDocuments();
    const role = userCount === 0 ? 'admin' : 'user';

    // Verify contact methods
    if (!email && !linkedin && !phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one contact method (Email, LinkedIn, or Phone)'
      });
    }

    user = await User.create({
      name,
      email,
      password,
      college,
      branch,
      bio,
      skills: skills || [],
      github: github || '',
      linkedin: linkedin || '',
      phone: phone || '',
      role
    });

    const token = signToken(user._id);

    // Redact password
    user.password = undefined;

    res.status(201).json({
      success: true,
      token,
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
router.post('/login', async (req, res) => {
  const { email, password } = req.body;

  try {
    if (!email || !password) {
      return res.status(400).json({ success: false, message: 'Please provide an email and password' });
    }

    // Check for user
    const user = await User.findOne({ email }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    // Check if suspended
    if (user.isSuspended) {
      return res.status(403).json({
        success: false,
        message: 'Your account has been suspended. Please contact administrators for assistance.'
      });
    }

    // Check if password matches
    const isMatch = await user.matchPassword(password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = signToken(user._id);
    user.password = undefined;

    res.status(200).json({
      success: true,
      token,
      user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get current user profile
// @route   GET /api/auth/me
// @access  Private
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update user profile
// @route   PUT /api/auth/me
// @access  Private
router.put('/me', protect, async (req, res) => {
  const { name, college, branch, bio, skills, github, linkedin, phone } = req.body;

  try {
    // Ensure at least one contact method remains
    // Email is user.email (cannot be changed for now), but let's check linkedin and phone
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Merge updates
    user.name = name || user.name;
    user.college = college || user.college;
    user.branch = branch || user.branch;
    user.bio = bio !== undefined ? bio : user.bio;
    user.skills = skills || user.skills;
    user.github = github !== undefined ? github : user.github;
    user.linkedin = linkedin !== undefined ? linkedin : user.linkedin;
    user.phone = phone !== undefined ? phone : user.phone;

    // Validate that at least one contact exists
    if (!user.email && !user.linkedin && !user.phone) {
      return res.status(400).json({
        success: false,
        message: 'Please provide at least one contact method (Email, LinkedIn, or Phone)'
      });
    }

    await user.save();
    res.status(200).json({ success: true, user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
