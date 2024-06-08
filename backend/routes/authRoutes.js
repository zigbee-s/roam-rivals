const express = require('express');
const { signup, login, refreshToken } = require('../controllers/authController');
const { validateSignupInput, validateLoginInput } = require('../middlewares/userValidation');
const createRateLimiter = require('../middlewares/rateLimiter');

const router = express.Router();

const signupLimiter = createRateLimiter(60 * 1000, 10, "Too many requests from this IP, please try again later");
const loginLimiter = createRateLimiter(60 * 1000, 10, "Too many requests from this IP, please try again later");

router.post('/signup', signupLimiter, validateSignupInput, signup);
router.post('/login', loginLimiter, validateLoginInput, login);
router.post('/refresh-token', refreshToken); // New route for refreshing token

module.exports = router;
