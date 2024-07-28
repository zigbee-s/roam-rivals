// backend/middlewares/rateLimiter.js
const rateLimit = require('express-rate-limit');
const logger = require('../logger');

const createRateLimiter = (windowMs, maxRequests, message) => {
  return rateLimit({
    windowMs,
    max: maxRequests,
    message,
    handler: (req, res) => {
      logger.warn(`Rate limit exceeded for IP: ${req.ip}`);
      res.status(429).json({ message });
    }
  });
};

module.exports = createRateLimiter;
