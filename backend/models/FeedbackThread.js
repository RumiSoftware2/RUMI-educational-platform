const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema({
  sender: { type: String, enum: ['docente', 'estudiante'], required: true },
  text: { type: String, required: true },
  date: { type: Date, default: Date.now }
});

const feedbackThreadSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  messages: [messageSchema]
});

module.exports = mongoose.model('FeedbackThread', feedbackThreadSchema); 