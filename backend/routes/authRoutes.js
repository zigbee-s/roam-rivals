// routes/authRoutes.js
const express = require('express');
const { signup, login } = require('../controllers/authController');
const { validateSignupInput, validateLoginInput } = require('../middlewares/userValidation');
const idempotencyMiddleware = require('../middlewares/idempotencyMiddleware');
const createRateLimiter = require('../middlewares/rateLimiter');

const router = express.Router();

// Define rate-limiting options for signup and login
const signupLimiter = createRateLimiter(60 * 1000, 10, "Too many requests from this IP, please try again later");
const loginLimiter = createRateLimiter(60 * 1000, 10, "Too many requests from this IP, please try again later");

// Signup Route
// router.post('/signup', signupLimiter, idempotencyMiddleware, validateUserInput, signup);
router.post('/signup', signupLimiter,validateSignupInput, signup);

// Login Route
router.post('/login', loginLimiter, validateLoginInput, login);
// router.post('/login', loginLimiter, login);

module.exports = router;
