const { check, validationResult } = require('express-validator');
const User = require('../models/userModel');
const { SCHOOL_DOMAINS } = require('../config/config');

const allowedDomains = SCHOOL_DOMAINS // Add the allowed domains here

// Validation for initial signup (without password)

// Validation for initial signup (without password)
const validateInitialSignup = [
  check('name').notEmpty().withMessage('Name is required'),
  check('username')
    .notEmpty().withMessage('Username is required')
    .custom(async (username) => {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        throw new Error('Username already in use');
      }
    }),
  check('email')
    .isEmail().withMessage('Invalid email').notEmpty().withMessage('Email is required')
    .custom(async (email) => {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        throw new Error('Email already in use');
      }
      const domain = email.split('@')[1];
      if (!allowedDomains.includes(domain)) {
        throw new Error('Email domain is not allowed');
      }
    }),
  check('age').isInt({ min: 1 }).withMessage('Age must be a positive integer').notEmpty().withMessage('Age is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// Validation for complete signup (with password)
const validateCompleteSignup = [
  check('email').isEmail().withMessage('Invalid email').notEmpty().withMessage('Email is required'),
  check('otp').notEmpty().withMessage('OTP is required'),
  check('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters long'),
  check('confirm_password').custom((value, { req }) => {
    if (value !== req.body.password) {
      throw new Error('Passwords do not match');
    }
    return true;
  }).notEmpty().withMessage('Confirm password is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

// Validation for login
const validateLoginInput = [
  check('email').isEmail().withMessage('Invalid email').notEmpty().withMessage('Email is required'),
  check('password').notEmpty().withMessage('Password is required'),
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  },
];

module.exports = { validateInitialSignup, validateCompleteSignup, validateLoginInput }