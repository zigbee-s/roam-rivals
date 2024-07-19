const mongoose = require('mongoose');
const { Schema } = mongoose;

const photoSchema = new Schema({
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true }, // Reference to Event model
  imageKey: { type: String, required: true },
  uploadedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  likes: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  isWinner: { type: Boolean, default: false },
  themeChosen: { type: String, required: true } // Add themeChosen field
});

const Photo = mongoose.model('Photo', photoSchema);

module.exports = Photo;
