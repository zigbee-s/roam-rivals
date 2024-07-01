// backend/utils/tokenUtils.js
const jwt = require('jsonwebtoken');
const { JWT_SECRET, REFRESH_TOKEN_SECRET, TEMPORARY_TOKEN_SECRET } = require('../config/config');

function generateToken(user) {
  const token = jwt.sign({ userId: user._id, email: user.email, roles: user.roles }, JWT_SECRET, { expiresIn: '1m' });
  const refreshToken = jwt.sign({ userId: user._id, email: user.email, roles: user.roles }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
  return { token, refreshToken };
}

function verifyToken(token, secret) {
  return jwt.verify(token, secret);
}

function generateTemporaryToken(payload) {
  try {
    return jwt.sign(payload, TEMPORARY_TOKEN_SECRET, { expiresIn: '1h' });
  } catch (error) {
    console.error("Error generating temporary token:", error);
    throw new Error("Failed to generate temporary token");
  }
}

module.exports = { generateToken, verifyToken, generateTemporaryToken };
