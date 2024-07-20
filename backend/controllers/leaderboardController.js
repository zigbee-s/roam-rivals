// File: backend/controllers/leaderboardController.js

const Leaderboard = require('../models/leaderboardModel');
const logger = require('../logger'); // Make sure to import logger if it's not already

async function getLeaderboard(req, res) {
  try {
    const leaderboard = await Leaderboard.find()
      .populate('event', 'title')
      .populate('winners.winner', 'username')
      .sort({ date: -1 });
      
    res.status(200).json(leaderboard);
  } catch (error) {
    logger.error('Failed to fetch leaderboard', error);
    res.status(500).json({ message: 'Failed to fetch leaderboard', error: error.message });
  }
}

module.exports = { getLeaderboard };
