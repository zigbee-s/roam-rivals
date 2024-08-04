// backend/routes/paymentRoutes.js

const express = require('express');
const { createOrderForEvent, handleRazorpayWebhook, registerEvent } = require('../controllers/paymentController');
const { validateCreateOrder, validateWebhook, validateRegisterEvent } = require('../middlewares/validationMiddleware');
const rateLimit = require('express-rate-limit');
const { authMiddleware } = require('../middlewares/authMiddleware');

const router = express.Router();

const paymentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // Limit each IP to 50 requests per windowMs
  message: 'Too many requests from this IP, please try again later.'
});

router.post('/create-order', paymentLimiter, authMiddleware, validateCreateOrder, createOrderForEvent);
router.post('/webhook', paymentLimiter, validateWebhook, handleRazorpayWebhook);
router.post('/register', paymentLimiter, authMiddleware, validateRegisterEvent, registerEvent);

module.exports = router;
