// models/idempotencyKeyModel.js
const mongoose = require('mongoose');

const idempotencyKeySchema = new mongoose.Schema({
  idempotencyKey: { type: String, required: true, unique: true },
  requestBody: { type: Object, required: true },
  responseBody: { type: Object },
  status: { type: String, required: true, enum: ['pending', 'completed'], default: 'pending' },
  createdAt: { type: Date, default: Date.now, expires: '1h' },
  expiresAt: { type: Date, default: () => new Date(Date.now() + 3600 * 1000) }
});

module.exports = mongoose.model('IdempotencyKey', idempotencyKeySchema);
