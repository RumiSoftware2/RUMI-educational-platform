const mongoose = require('mongoose');

const bankAccountSchema = new mongoose.Schema({
  teacher: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true
  },
  accountHolder: {
    type: String,
    required: true
  },
  accountNumber: {
    type: String,
    required: true
  },
  accountType: {
    type: String,
    enum: ['checking', 'savings'],
    required: true
  },
  bankName: {
    type: String,
    required: true
  },
  bankCode: {
    type: String,
    required: true
  },
  routingNumber: {
    type: String,
    required: true
  },
  country: {
    type: String,
    required: true,
    default: 'CO'
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  verificationCode: {
    type: String,
    default: null
  },
  verificationAttempts: {
    type: Number,
    default: 0
  },
  verificationExpires: {
    type: Date,
    default: null
  },
  totalEarnings: {
    type: Number,
    default: 0
  },
  pendingPayouts: {
    type: Number,
    default: 0
  },
  lastPayout: {
    type: Date,
    default: null
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    default: null
  }
});

module.exports = mongoose.model('BankAccount', bankAccountSchema);
