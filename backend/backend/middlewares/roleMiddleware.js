// backend/middlewares/roleMiddleware.js
const logger = require('../logger');

const roleMiddleware = (requiredRoles) => {
  return (req, res, next) => {
    const userRoles = req.user.roles;
    const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));

    if (!hasRequiredRole) {
      logger.warn(`Forbidden: User does not have the required role: ${requiredRoles}`);
      return res.status(403).json({ message: 'Forbidden: You do not have the required role to perform this action' });
    }

    next();
  };
};

module.exports = roleMiddleware;
