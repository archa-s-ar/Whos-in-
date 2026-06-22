const mongoose = require('mongoose');

const TeamSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please add a team name'],
    trim: true
  },
  projectTitle: {
    type: String,
    required: [true, 'Please add a project title'],
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Please add a project description']
  },
  category: {
    type: String,
    required: [true, 'Please specify a category'],
    enum: [
      'Hackathon',
      'Startup',
      'Research',
      'Open Source',
      'Competition',
      'College Project',
      'Other'
    ]
  },
  requiredSkills: {
    type: [String],
    default: []
  },
  maxSize: {
    type: Number,
    required: [true, 'Please specify the maximum team size'],
    min: [2, 'Team size must be at least 2']
  },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  members: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }],
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Team', TeamSchema);
