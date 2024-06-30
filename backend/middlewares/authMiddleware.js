// backend/middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/config');
const User = require('../models/userModel');
const logger = require('../logger');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    logger.warn('Authorization header missing');
    return res.status(403).json({ message: 'Authorization header missing' });
  }

  let token = authHeader;

  // Remove "Bearer " prefix if present
  if (token.startsWith('Bearer ')) {
    token = token.slice(7);
  }

  if (!token) {
    logger.warn('No token provided');
    return res.status(401).json({ message: 'No token provided' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.userId).select('roles');
    if (!user) {
      logger.warn('User not found');
      return res.status(404).json({ message: 'User not found' });
    }
    req.user = { userId: decoded.userId, email: decoded.email, roles: user.roles };
    next();
  } catch (error) {
    logger.error('Failed to authenticate token', error);
    res.status(500).json({ message: 'Failed to authenticate token', error: error.message });
  }
};

module.exports = { authMiddleware };
