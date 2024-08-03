/* File: backend/models/paymentModel.js */
const mongoose = require('mongoose');
const { Schema } = mongoose;

const paymentSchema = new Schema({
  orderId: { type: String, required: true },
  paymentId: { type: String, required: true },
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  status: { type: String, required: true, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
});

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;


