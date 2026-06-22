const express = require('express');
const JoinRequest = require('../models/JoinRequest');
const Team = require('../models/Team');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { sendEmail } = require('../utils/mailer');

const router = express.Router();

// @desc    Submit a join request
// @route   POST /api/requests
// @access  Private
router.post('/', protect, async (req, res) => {
  const { teamId, message, contactInfo } = req.body;

  try {
    if (!teamId || !message || !contactInfo) {
      return res.status(400).json({ success: false, message: 'Please provide all required fields' });
    }

    const team = await Team.findById(teamId).populate('creator', 'name email');
    if (!team) {
      return res.status(404).json({ success: false, message: 'Team not found' });
    }

    // Check if user is already a member
    if (team.members.includes(req.user.id)) {
      return res.status(400).json({ success: false, message: 'You are already a member of this team' });
    }

    // Check if team is full
    if (team.members.length >= team.maxSize) {
      return res.status(400).json({ success: false, message: 'This team is already full' });
    }

    // Check if user already has a pending request
    const existingRequest = await JoinRequest.findOne({
      applicant: req.user.id,
      team: teamId,
      status: 'pending'
    });

    if (existingRequest) {
      return res.status(400).json({ success: false, message: 'You already have a pending request for this team' });
    }

    const request = await JoinRequest.create({
      applicant: req.user.id,
      team: teamId,
      message,
      contactInfo
    });

    // Send email notification to team creator
    const creatorEmail = team.creator.email;
    const applicantName = req.user.name;
    const projectTitle = team.projectTitle;

    await sendEmail({
      to: creatorEmail,
      subject: `New Join Request for ${team.name} - Who's In?`,
      text: `Hi ${team.creator.name},\n\n${applicantName} has requested to join your team "${team.name}" for the project "${projectTitle}".\n\nIntro Message: "${message}"\nContact Info Provided: ${contactInfo}\n\nReview this request on the Who's In? platform.\n\nBest,\nWho's In? Team`,
      html: `<p>Hi ${team.creator.name},</p>
             <p><strong>${applicantName}</strong> has requested to join your team <strong>${team.name}</strong> for the project "<em>${projectTitle}</em>".</p>
             <blockquote><strong>Intro Message:</strong> "${message}"</blockquote>
             <p><strong>Contact Info Provided:</strong> ${contactInfo}</p>
             <p>Log in to <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}">Who's In?</a> to manage this request.</p>
             <p>Best,<br>Who's In? Team</p>`
    });

    res.status(201).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Get incoming join requests for user's teams
// @route   GET /api/requests/incoming
// @access  Private
router.get('/incoming', protect, async (req, res) => {
  try {
    // Find teams created by the logged in user
    const userTeams = await Team.find({ creator: req.user.id });
    const teamIds = userTeams.map(t => t._id);

    // Find pending requests for these teams
    const requests = await JoinRequest.find({
      team: { $in: teamIds },
      status: 'pending'
    })
      .populate('applicant', 'name email college branch skills bio github linkedin phone')
      .populate('team', 'name projectTitle')
      .sort({ createdAt: -1 });

    res.status(200).json({ success: true, count: requests.length, data: requests });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

// @desc    Accept or reject a join request
// @route   PUT /api/requests/:id
// @access  Private
router.put('/:id', protect, async (req, res) => {
  const { status } = req.body;

  if (!['accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ success: false, message: 'Invalid status update. Must be accepted or rejected' });
  }

  try {
    const request = await JoinRequest.findById(req.params.id)
      .populate('applicant', 'name email')
      .populate('team');

    if (!request) {
      return res.status(404).json({ success: false, message: 'Request not found' });
    }

    // Check if the current user is the creator of the team
    const team = await Team.findById(request.team._id);
    if (team.creator.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized to manage requests for this team' });
    }

    if (request.status !== 'pending') {
      return res.status(400).json({ success: false, message: 'This request has already been processed' });
    }

    if (status === 'accepted') {
      // Check if team is already full
      if (team.members.length >= team.maxSize) {
        return res.status(400).json({ success: false, message: 'Cannot accept request. Team is already full' });
      }

      // Add user to team members
      team.members.push(request.applicant._id);
      await team.save();

      request.status = 'accepted';
      await request.save();

      // Send acceptance email
      await sendEmail({
        to: request.applicant.email,
        subject: `Request Accepted: Welcome to ${team.name}!`,
        text: `Hi ${request.applicant.name},\n\nYour request to join team "${team.name}" for "${team.projectTitle}" has been ACCEPTED by the creator!\n\nYou can now see your teammate's contact details on the Team page.\n\nConnect and start building!\n\nBest,\nWho's In? Team`,
        html: `<p>Hi ${request.applicant.name},</p>
               <p>Your request to join team <strong>${team.name}</strong> for <strong>"${team.projectTitle}"</strong> has been <strong>ACCEPTED</strong>!</p>
               <p>You can now see your teammate's contact details on the <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}/teams/${team._id}">Team Page</a>.</p>
               <p>Connect and start building!</p>
               <p>Best,<br>Who's In? Team</p>`
      });

    } else if (status === 'rejected') {
      request.status = 'rejected';
      await request.save();

      // Send rejection email
      await sendEmail({
        to: request.applicant.email,
        subject: `Update on your request for ${team.name}`,
        text: `Hi ${request.applicant.name},\n\nThank you for your interest in joining "${team.name}". Unfortunately, the creator has declined your request at this time.\n\nKeep browsing other projects on Who's In? to find another opportunity.\n\nBest,\nWho's In? Team`,
        html: `<p>Hi ${request.applicant.name},</p>
               <p>Thank you for your interest in joining <strong>${team.name}</strong>.</p>
               <p>Unfortunately, the creator has declined your request at this time.</p>
               <p>Keep browsing other projects on <a href="${process.env.FRONTEND_URL || 'http://localhost:5173'}">Who's In?</a> to find another match.</p>
               <p>Best,<br>Who's In? Team</p>`
      });
    }

    res.status(200).json({ success: true, data: request });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
});

module.exports = router;
