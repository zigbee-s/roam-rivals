// routes/userRoutes.js
const express = require('express');
const { addUser } = require('../controllers/userController');
const { validateUserInput } = require('../middlewares/userValidation');
const { idempotencyMiddleware } = require('../middlewares/idempotency');
const rateLimit = require("express-rate-limit");

const router = express.Router();

// Define rate-limiting options for the add-user route
const addUserLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 10, // limit each IP to 10 requests per windowMs
  message: "Too many requests from this IP, please try again later"
});

// Apply rate limiter to add-user route
router.post('/add-user', addUserLimiter, validateUserInput, idempotencyMiddleware, addUser);

module.exports = router;
