const { body, validationResult } = require('express-validator');
const User = require('../models/userModel'); // Import the User model
const { SCHOOL_DOMAINS } = require('../config/config');



const validateUserInput = [
  body('name').trim().notEmpty().isString().withMessage('Name is required'),
  body('email').trim().notEmpty().isEmail().withMessage('Valid email is required')
    .custom(async (email) => {
      // Check if the email domain is a school domain
      const emailDomain = email.split('@')[1];
      if (!SCHOOL_DOMAINS.includes(emailDomain)) {
        return Promise.reject('Only school email addresses are allowed');
      }

      // Check if the email is already in use
      const user = await User.findOne({ email });
      if (user) {
        return Promise.reject('E-mail already in use');
      }
    }),
  body('message').trim().notEmpty().isString().withMessage('Message is required'),
  async (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next();
  }
];

module.exports = { validateUserInput };
