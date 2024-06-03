// middlewares/validation.js
const { body, validationResult } = require('express-validator');
const { client } = require('../db/db'); // Ensure the database client is imported

const validateUserInput = [
  body('name').trim().notEmpty().isString().withMessage('Name is required'),
  body('email').trim().notEmpty().isEmail().withMessage('Valid email is required')
    .custom(async (email) => {
      const collection = client.db('test').collection('users');
      const user = await collection.findOne({ email });
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
