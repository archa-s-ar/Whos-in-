const express = require('express');
const Team = require('../models/Team');
const JoinRequest = require('../models/JoinRequest');
const { protect } = require('../middleware/auth');

const router = express.Router();

// @desc    Get all teams (with search and category filter)
// @route   GET /api/teams
// @access  Private (Logged in users)
router.get('/', protect, async (req, res) => {
  try {
    const { search, category } = req.query;
    let query = {};

    // Apply category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Apply search filter (match name, title, description, or skills)
    if (search) {
      const searchRegex = new RegExp(search, 'i');
      query.$or = [
        { name: searchRegex },
        { projectTitle: searchRegex },
        { description: searchRegex },
        { requiredSkills: { $in: [searchRegex] } }
      ];
    }

    const teams = await Team.find(query)
      .populate('creator', 'name college branch skills bio')
      .populate('members', 'name college branch skills bio')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: teams.length, data: teams });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get team by ID
// @route   GET /api/teams/:id
// @access  Private
router.get('/:id', protect, async (req, res) => {
  try {
    const team = await Team.findById(req.id || req.params.id)
      .populate('creator', 'name email college branch skills bio github linkedin phone role')
      .populate('members', 'name email college branch skills bio github linkedin phone role');

    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    // Check if the requesting user is the creator, an admin, or an accepted member
    const userIdStr = req.user.id.toString();
    const isCreator = team.creator._id.toString() === userIdStr;
    const isAdmin = req.user.role === 'admin';
    const isMember = team.members.some(member => member._id.toString() === userIdStr);

    // If not creator, admin, or member, redact contact information
    if (!isCreator && !isAdmin && !isMember) {
      // Create a copy of the team object to edit
      const teamObj = team.toObject();

      // Redact creator contact info
      if (teamObj.creator) {
        teamObj.creator.email = undefined;
        teamObj.creator.phone = undefined;
        teamObj.creator.linkedin = undefined;
        teamObj.creator.github = undefined;
      }

      // Redact members contact info
      teamObj.members = teamObj.members.map(member => {
        return {
          _id: member._id,
          name: member.name,
          college: member.college,
          branch: member.branch,
          skills: member.skills,
          bio: member.bio
        };
      });

      return res.status(200).json({ success: true, data: teamObj, isFullAccess: false });
    }

    res.status(200).json({ success: true, data: team, isFullAccess: true });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Create a team
// @route   POST /api/teams
// @access  Private
router.post('/', protect, async (req, res) => {
  const { name, projectTitle, description, category, requiredSkills, maxSize } = req.body;

  try {
    // Basic validations
    if (!name || !projectTitle || !description || !category || !maxSize) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const team = await Team.create({
      name,
      projectTitle,
      description,
      category,
      requiredSkills: requiredSkills || [],
      maxSize,
      creator: req.user.id,
      members: [req.user.id] // Creator is the first member
    });

    res.status(201).json({ success: true, data: team });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Update team
// @route   PUT /api/teams/:id
// @access  Private (Creator or Admin only)
router.put('/:id', protect, async (req, res) => {
  try {
    let team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    // Check ownership or admin
    if (team.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to update this team' });
    }

    const { name, projectTitle, description, category, requiredSkills, maxSize } = req.body;

    team.name = name || team.name;
    team.projectTitle = projectTitle || team.projectTitle;
    team.description = description || team.description;
    team.category = category || team.category;
    team.requiredSkills = requiredSkills || team.requiredSkills;

    if (maxSize) {
      if (maxSize < team.members.length) {
        return res.status(400).json({
          success: false,
          message: `Cannot shrink team size below current members count (${team.members.length})`
        });
      }
      team.maxSize = maxSize;
    }

    await team.save();

    res.status(200).json({ success: true, data: team });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Delete team
// @route   DELETE /api/teams/:id
// @access  Private (Creator or Admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);

    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    // Check ownership or admin
    if (team.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to delete this team' });
    }

    // Delete team
    await Team.deleteOne({ _id: team._id });

    // Clean up related join requests
    await JoinRequest.deleteMany({ team: team._id });

    res.status(200).json({ success: true, message: 'Team and associated join requests deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
