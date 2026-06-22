const express = require('express');
const User = require('../models/User');
const Team = require('../models/Team');
const JoinRequest = require('../models/JoinRequest');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get user profile by ID (with privacy redacting)
// @route   GET /api/users/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const requesterId = req.user.id;
    const isOwner = requesterId === user._id.toString();
    const isAdmin = req.user.role === 'admin';

    let revealContact = isOwner || isAdmin;

    if (!revealContact) {
      // Check if they share any team
      const sharedTeam = await Team.findOne({
        members: { $all: [requesterId, user._id] }
      });
      if (sharedTeam) {
        revealContact = true;
      }
    }

    if (!revealContact) {
      // Check if there is an active join request between the requester and teams created by the user,
      // OR a join request by the user to teams created by the requester
      const userTeams = await Team.find({ creator: user._id });
      const userTeamIds = userTeams.map(t => t._id);

      const requesterTeams = await Team.find({ creator: requesterId });
      const requesterTeamIds = requesterTeams.map(t => t._id);

      const activeRequest = await JoinRequest.findOne({
        $or: [
          { applicant: requesterId, team: { $in: userTeamIds } },
          { applicant: user._id, team: { $in: requesterTeamIds } }
        ]
      });

      if (activeRequest) {
        revealContact = true;
      }
    }

    const profileObj = user.toObject();

    if (!revealContact) {
      profileObj.email = undefined;
      profileObj.phone = undefined;
      profileObj.linkedin = undefined;
      profileObj.github = undefined; // Hide GitHub too, keeping it private
      profileObj.isPrivate = true;
    } else {
      profileObj.isPrivate = false;
    }

    res.status(200).json({ success: true, data: profileObj });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
