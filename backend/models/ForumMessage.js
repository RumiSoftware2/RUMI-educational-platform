// backend/models/ForumMessage.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const ForumMessageSchema = new Schema({
  type: { type: String, enum: ['message', 'question_of_day', 'join', 'leave', 'typing'], default: 'message' },
  userId: { type: Schema.Types.ObjectId, ref: 'User', default: null },
  userName: { type: String, default: 'Anónimo' },
  userRole: { type: String, default: 'anónimo' },
  content: { type: String, default: '' },
  replyTo: { type: Schema.Types.ObjectId, ref: 'ForumMessage', default: null },
  reactions: { type: Map, of: Number, default: {} }
}, { timestamps: { createdAt: 'createdAt' } });

ForumMessageSchema.index({ createdAt: -1 });
ForumMessageSchema.index({ type: 1 });

module.exports = mongoose.model('ForumMessage', ForumMessageSchema);
