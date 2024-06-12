// middlewares/authMiddleware.js
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/config');
const User = require('../models/userModel');

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(403).json({ message: 'Authorization header missing' });
  }
  
  let token = req.headers['authorization'];

  // Remove "Bearer " prefix if present
  if (token.startsWith('Bearer ')) {
    token = token.slice(7);
  }

  if (!token) return res.status(401).json({ message: 'No token provided' });

  jwt.verify(token, JWT_SECRET, async (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Invalid token' });

    try {
      const user = await User.findById(decoded.userId).select('roles');
      req.user = { userId: decoded.userId, email: decoded.email, roles: user.roles };
      next();
    } catch (error) {
      res.status(500).json({ message: 'Failed to fetch user roles', error: error.message });
    }
  });
};

module.exports = { authMiddleware };
