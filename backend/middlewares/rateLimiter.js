// middlewares/rateLimiter.js
const rateLimit = require('express-rate-limit');

const createRateLimiter = (windowMs, maxRequests, message) => {
  return rateLimit({
    windowMs,
    max: maxRequests,
    message,
  });
};

module.exports = createRateLimiter;
