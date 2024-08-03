/* File: backend/routes/paymentRoutes.js */
const express = require('express');
const router = express.Router();
const { registerEvent, verifyPaymentHandler, razorpayWebhookHandler } = require('../controllers/paymentController');

router.post('/register-event', registerEvent);
router.post('/verify-payment', verifyPaymentHandler);
router.post('/razorpay-webhook', razorpayWebhookHandler);

module.exports = router;
