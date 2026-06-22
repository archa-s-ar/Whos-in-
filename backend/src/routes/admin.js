const express = require('express');
const User = require('../models/User');
const Team = require('../models/Team');
const JoinRequest = require('../models/JoinRequest');
const { protect, admin } = require('../middleware/auth');

const router = express.Router();

// Apply protect and admin middleware to all routes in this file
router.use(protect);
router.use(admin);

// @desc    Get Admin Metrics
// @route   GET /api/admin/metrics
// @access  Private/Admin
router.get('/metrics', async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTeams = await Team.countDocuments();
    
    // Active Teams defined as teams with size > 1, or created in the last 7 days
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
    
    const activeTeams = await Team.countDocuments({
      $or: [
        { 'members.1': { $exists: true } }, // members array has index 1 (meaning length >= 2)
        { createdAt: { $gte: sevenDaysAgo } }
      ]
    });

    const recentRegistrations = await User.find()
      .select('name email college branch createdAt role isSuspended')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        totalTeams,
        activeTeams,
        recentRegistrations
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get all users list
// @route   GET /api/admin/users
// @access  Private/Admin
router.get('/users', async (req, res) => {
  try {
    const users = await User.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get all teams list
// @route   GET /api/admin/teams
// @access  Private/Admin
router.get('/teams', async (req, res) => {
  try {
    const teams = await Team.find()
      .populate('creator', 'name email')
      .sort({ createdAt: -1 });
    res.status(200).json({ success: true, count: teams.length, data: teams });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Suspend or unsuspend user
// @route   PUT /api/admin/users/:id/suspend
// @access  Private/Admin
router.put('/users/:id/suspend', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Admins cannot suspend themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot suspend your own account' });
    }

    user.isSuspended = !user.isSuspended;
    await user.save();

    res.status(200).json({
      success: true,
      message: `User ${user.name} has been ${user.isSuspended ? 'suspended' : 'unsuspended'}`,
      data: user
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete user profile and cleanup
// @route   DELETE /api/admin/users/:id
// @access  Private/Admin
router.delete('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Admins cannot delete themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ success: false, message: 'You cannot delete your own account' });
    }

    // Find all teams created by this user
    const teams = await Team.find({ creator: user._id });
    const teamIds = teams.map(t => t._id);

    // Delete teams created by user
    await Team.deleteMany({ creator: user._id });

    // Clean up join requests associated with those teams
    await JoinRequest.deleteMany({ team: { $in: teamIds } });

    // Remove this user from any teams they joined
    await Team.updateMany(
      { members: user._id },
      { $pull: { members: user._id } }
    );

    // Delete requests made by this user
    await JoinRequest.deleteMany({ applicant: user._id });

    // Delete the user
    await User.deleteOne({ _id: user._id });

    res.status(200).json({ success: true, message: 'User and all associated teams/requests deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
