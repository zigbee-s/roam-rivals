// backend/middlewares/validationMiddleware.js

const { body, validationResult } = require('express-validator');

// Validation for creating an order
const validateCreateOrder = [
  body('eventId').isString().notEmpty().withMessage('Event ID is required'),
  body('amount').isNumeric().withMessage('Amount should be a number'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Validation for webhook requests
const validateWebhook = [
  body('event').isString().notEmpty().withMessage('Event type is required'),
  body('payload').exists().withMessage('Payload is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

// Validation for registering an event
const validateRegisterEvent = [
  body('razorpay_order_id').isString().notEmpty().withMessage('Razorpay order ID is required'),
  body('razorpay_payment_id').isString().notEmpty().withMessage('Razorpay payment ID is required'),
  body('razorpay_signature').isString().notEmpty().withMessage('Razorpay signature is required'),
  body('eventId').isString().notEmpty().withMessage('Event ID is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = { validateCreateOrder, validateWebhook, validateRegisterEvent };
