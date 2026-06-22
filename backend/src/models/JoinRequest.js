const mongoose = require('mongoose');

const JoinRequestSchema = new mongoose.Schema({
  applicant: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  team: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Team',
    required: true
  },
  message: {
    type: String,
    required: [true, 'Please add an introduction message'],
    trim: true
  },
  contactInfo: {
    type: String,
    required: [true, 'Please provide contact information for this request'],
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected'],
    default: 'pending'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('JoinRequest', JoinRequestSchema);
