// backend/routes/authRoutes.js

const express = require('express');
const { initialSignup, completeSignup, login, verifyOtp, verifyOtpForLogin, verifyOtpForForgotPassword, refreshToken, forgotPassword, resetPassword } = require('../controllers/authController');
const { validateInitialSignup, validateCompleteSignup, validateLoginInput } = require('../middlewares/userValidation');
const createRateLimiter = require('../middlewares/rateLimiter');
const idempotencyMiddleware = require('../middlewares/idempotencyMiddleware');

const router = express.Router();

// 10 requests per minute
const signupLimiter = createRateLimiter(60 * 1000, 10, "Too many requests from this IP, please try again later");
const loginLimiter = createRateLimiter(60 * 1000, 10, "Too many requests from this IP, please try again later");

router.post('/initial-signup', signupLimiter, validateInitialSignup, idempotencyMiddleware, initialSignup);
router.post('/complete-signup', idempotencyMiddleware, completeSignup);
router.post('/login', loginLimiter, validateLoginInput, idempotencyMiddleware, login);
router.post('/verify-otp', idempotencyMiddleware, verifyOtp);
router.post('/verify-otp-login', idempotencyMiddleware, verifyOtpForLogin);
router.post('/verify-otp-forgot-password', idempotencyMiddleware, verifyOtpForForgotPassword);
router.post('/refresh-token', idempotencyMiddleware, refreshToken);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

module.exports = router;
