const mongoose = require('mongoose');
const { Schema } = mongoose;

const paymentSchema = new Schema({
  orderId: { type: String, required: true, index: true }, // Added index
  paymentId: { type: String, required: true, index: true }, // Added index
  user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  status: { type: String, required: true, enum: ['pending', 'completed', 'failed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

paymentSchema.index({ orderId: 1, paymentId: 1 }, { unique: true }); // Ensure uniqueness

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;
