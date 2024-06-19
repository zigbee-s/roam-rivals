const express = require('express');
const { signup, login, verifyOtp, verifyOtpForLogin, refreshToken } = require('../controllers/authController');
const { validateSignupInput, validateLoginInput } = require('../middlewares/userValidation');
const createRateLimiter = require('../middlewares/rateLimiter');

const router = express.Router();

const signupLimiter = createRateLimiter(60 * 1000, 10, "Too many requests from this IP, please try again later");
const loginLimiter = createRateLimiter(60 * 1000, 10, "Too many requests from this IP, please try again later");

router.post('/signup', signupLimiter, validateSignupInput, signup);
router.post('/login', loginLimiter, validateLoginInput, login);
router.post('/verify-otp', verifyOtp); // OTP verification for signup
router.post('/verify-otp-login', verifyOtpForLogin); // OTP verification for login
router.post('/refresh-token', refreshToken);

module.exports = router;
