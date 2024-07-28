// backend/models/idempotencyKeyModel.js
const mongoose = require('mongoose');

const idempotencyKeySchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  requestBody: { type: mongoose.Schema.Types.Mixed },
  response: { type: mongoose.Schema.Types.Mixed },
  status: { type: String, enum: ['pending', 'completed'], default: 'pending' },
}, { timestamps: true });

const IdempotencyKey = mongoose.model('IdempotencyKey', idempotencyKeySchema);
module.exports = IdempotencyKey;
