// utils/tokenUtils.js
const jwt = require('jsonwebtoken');
const { JWT_SECRET, JWT_REFRESH_SECRET } = require('../config/config');

function generateTokens(user) {
  const accessToken = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ userId: user._id, email: user.email }, JWT_REFRESH_SECRET, { expiresIn: '7d' });
  return { accessToken, refreshToken };
}

module.exports = { generateTokens };
