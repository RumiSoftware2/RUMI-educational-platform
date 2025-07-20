// models/User.js

const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['estudiante', 'docente', 'admin'],
    default: 'estudiante'
  },
  // Campos para verificación de email
  emailVerified: {
    type: Boolean,
    default: false
  },
  emailVerificationCode: {
    type: String,
    default: null
  },
  emailVerificationExpires: {
    type: Date,
    default: null
  },
  // Campos para recuperación de contraseña
  passwordResetToken: {
    type: String,
    default: null
  },
  passwordResetExpires: {
    type: Date,
    default: null
  },
  // Campos para recuperación de contraseña con código
  passwordResetCode: {
    type: String,
    default: null
  },
  passwordResetCodeExpires: {
    type: Date,
    default: null
  },
  progress: {
    type: Object,
    default: {}
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('User', userSchema);
