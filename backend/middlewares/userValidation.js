// middlewares/userValidation.js
const { body, validationResult } = require('express-validator');
const User = require('../models/userModel');
const { SCHOOL_DOMAINS } = require('../config/config');

// Validation for user sign-up
const validateSignupInput = [
  body('name')
    .trim()
    .notEmpty()
    .isString()
    .withMessage('Name is required'),
  body('email')
    .trim()
    .notEmpty()
    .isEmail()
    .withMessage('Valid email is required')
    .custom(async (email) => {
      const emailDomain = email.split('@')[1];
      if (!SCHOOL_DOMAINS.includes(emailDomain)) {
        console.warn(`Signup validation failed: ${email} is not from an allowed domain`);
        throw new Error('Only school email addresses are allowed');
      }
      const user = await User.findOne({ email });
      if (user) {
        console.warn(`Signup validation failed: ${email} is already in use`);
        throw new Error('E-mail already in use');
      }
    }),
  body('password')
    .trim()
    .notEmpty()
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorDetails = errors.array().map(err => ({ field: err.param, message: err.msg }));
      console.warn('Signup validation errors:', errorDetails);
      return res.status(400).json({ errors: errorDetails });
    }
    console.info(`Signup validation passed for email: ${req.body.email}`);
    next();
  }
];

// Validation for user login
const validateLoginInput = [
  body('email')
    .trim()
    .notEmpty()
    .isEmail()
    .withMessage('Valid email is required'),
  body('password')
    .trim()
    .notEmpty()
    .withMessage('Password is required'),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      const errorDetails = errors.array().map(err => ({ field: err.param, message: err.msg }));
      console.warn('Login validation errors:', errorDetails);
      return res.status(400).json({ errors: errorDetails });
    }
    console.info(`Login validation passed for email: ${req.body.email}`);
    next();
  }
];

module.exports = { validateSignupInput, validateLoginInput };
