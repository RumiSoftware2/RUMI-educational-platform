const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  student: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  amount: {
    type: Number,
    required: true
  },
  currency: {
    type: String,
    default: 'USD'
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },
  paymentMethod: {
    type: String,
    enum: ['stripe', 'paypal', 'manual'],
    required: true
  },
  transactionId: {
    type: String,
    unique: true
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  metadata: {
    type: Object,
    default: {}
  }
});

module.exports = mongoose.model('Payment', paymentSchema); 