const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../config/config');

const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(403).json({ message: 'Authorization header missing', code: 'AUTH_HEADER_MISSING' });
  }
  
  let token = req.headers['authorization'];

  // Remove "Bearer " prefix if present
  if (token.startsWith('Bearer ')) {
    token = token.slice(7);
  }

  if (!token) return res.status(401).json({ message: 'No token provided', code: 'NO_TOKEN_PROVIDED' });

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) {
      const isExpired = err.name === 'TokenExpiredError';
      return res.status(403).json({ 
        message: isExpired ? 'Token expired' : 'Invalid token', 
        code: isExpired ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN' 
      });
    }
    req.user = { userId: decoded.userId, email: decoded.email }; // Attach user data to the request object
    next();
  });
};

module.exports = { authMiddleware };
