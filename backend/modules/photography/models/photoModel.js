// backend/models/photoModel.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const photoSchema = new Schema({
  url: { type: String, required: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  eventId: { type: Schema.Types.ObjectId, ref: 'PhotographyEvent', required: true },
  uploadDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Photo', photoSchema);
