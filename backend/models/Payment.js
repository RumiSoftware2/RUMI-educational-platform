const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  student: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  amount: { type: Number, required: true },
  currency: { type: String, default: 'COP' },
  status: { type: String, enum: ['pending','completed','failed','refunded'], default: 'pending' },
  paymentMethod: { type: String, enum: ['wompi','paypal','manual'], default: 'wompi' },
  transactionId: { type: String },
  wompiTransactionId: { type: String },
  wompiTransferId: { type: String },
  wompiFee: { type: Number, default: 0 },
  platformFee: { type: Number, default: 0 },
  teacherAmount: { type: Number, default: 0 },
  paymentDate: { type: Date },
  metadata: { type: Object, default: {} }
}, { timestamps: true });

module.exports = mongoose.model('Payment', PaymentSchema);
