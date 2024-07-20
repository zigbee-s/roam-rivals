const mongoose = require('mongoose');
const { Schema } = mongoose;

const winnerSchema = new Schema({
  winner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rank: { type: Number, required: true },
  details: {
    likes: { type: String },
    theme: { type: String }
  }
}, { _id: false });

const leaderboardSchema = new Schema({
  event: { type: mongoose.Schema.Types.ObjectId, ref: 'Event', required: true },
  eventType: { type: String, required: true },
  date: { type: Date, required: true },
  winners: {
    type: [winnerSchema],
    validate: {
      validator: function(v) {
        const ranks = v.map(winner => winner.rank);
        return ranks.length === new Set(ranks).size; // Check for unique ranks
      },
      message: props => `Ranks should be unique for winners of the same event.`
    }
  }
}, { timestamps: true });

leaderboardSchema.methods.getWinnersByRank = function(rank) {
  return this.winners.filter(winner => winner.rank === rank);
};

const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);

module.exports = Leaderboard;
