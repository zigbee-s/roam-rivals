const mongoose = require('mongoose');
const { Schema } = mongoose;

const photoSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true }, // Reference to Event model
  imageKey: { type: String, required: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  isWinner: { type: Boolean, default: false }
});

const Photo = mongoose.model('Photo', photoSchema);

module.exports = Photo;
