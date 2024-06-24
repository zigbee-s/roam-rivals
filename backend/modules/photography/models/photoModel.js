// backend/modules/photography/models/photoModel.js
const mongoose = require('mongoose');
const { Schema } = mongoose;

const photoSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  imageUrl: { type: String, required: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  uploadedAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model('Photo', photoSchema);
