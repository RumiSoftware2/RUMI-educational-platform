const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  order: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  videoUrl: { type: String, required: true },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' }
});

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String
  },
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  price: {
    type: Number,
    default: 0
  },
  videoUrl: {
    type: String,
    required: true
  },
  lessons: [lessonSchema],
  students: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    default: []
  }],
  // Campos para sistema de pagos
  isPaidCourse: {
    type: Boolean,
    default: false
  },
  paidFromLesson: {
    type: Number,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Course', courseSchema);
