const mongoose = require('mongoose');

const temporaryTokenSchema = new mongoose.Schema({
  token: { type: String, required: true },
  email: { type: String, required: true },
  createdAt: { type: Date, default: Date.now, expires: '1h' }, // Token expires after 1 hour
});

module.exports = mongoose.model('TemporaryToken', temporaryTokenSchema);
