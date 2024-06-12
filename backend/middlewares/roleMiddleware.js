// middlewares/roleMiddleware.js
const roleMiddleware = (requiredRoles) => {
    return (req, res, next) => {
      const userRoles = req.user.roles;
      const hasRequiredRole = requiredRoles.some(role => userRoles.includes(role));
  
      if (!hasRequiredRole) {
        return res.status(403).json({ message: 'Forbidden: You do not have the required role to perform this action' });
      }
  
      next();
    };
  };
  
  module.exports = roleMiddleware;
  