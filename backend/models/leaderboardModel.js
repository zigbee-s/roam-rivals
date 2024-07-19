// File: backend/models/leaderboardModel.js

const mongoose = require('mongoose');
const { Schema } = mongoose;

const leaderboardSchema = new Schema({
  event: { type: Schema.Types.ObjectId, ref: 'Event', required: true },
  winner: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  rank: { type: Number, required: true },
  eventType: { type: String, required: true }, // e.g., 'photography', 'quiz'
  date: { type: Date, required: true },
  details: { type: Map, of: String }, // Additional details about the win
}, { timestamps: true });

const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);

module.exports = Leaderboard;
