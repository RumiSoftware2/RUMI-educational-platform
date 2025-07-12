// models/Progress.js
const mongoose = require('mongoose');

const progressSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  completedLessons: {
    type: [String], // Por ejemplo, IDs o nombres de lecciones completadas
    default: []
  },
  quizScores: {
    type: Map,
    of: Number, // Por ejemplo, { quizId: score }
    default: {}
  },
  lastAccessed: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Progress', progressSchema);
