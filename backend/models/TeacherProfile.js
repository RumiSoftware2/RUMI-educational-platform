const mongoose = require('mongoose');

const teacherProfileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
    trim: true,
  },
  bio: {
    type: String,
    default: '',
  },
  photo: {
    type: String,
    default: '',
  },
  skills: {
    type: [String],
    default: [],
  },
  experience: [
    {
      title: { type: String, required: true },
      organization: { type: String, required: true },
      startYear: { type: Number, required: true },
      endYear: { type: Number },
      description: { type: String, default: '' },
    },
  ],
  social: {
    linkedin: { type: String, default: '' },
    twitter: { type: String, default: '' },
    github: { type: String, default: '' },
    website: { type: String, default: '' },
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
}, { timestamps: true });

module.exports = mongoose.model('TeacherProfile', teacherProfileSchema);
