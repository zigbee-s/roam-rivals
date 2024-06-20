// backend/middlewares/idempotencyMiddleware.js
const IdempotencyKey = require('../models/idempotencyKeyModel');

const idempotencyMiddleware = async (req, res, next) => {
  const idempotencyKey = req.headers['idempotency-key'];
  if (!idempotencyKey) {
    return res.status(400).json({ message: 'Idempotency key missing' });
  }

  try {
    const existingKey = await IdempotencyKey.findOne({ key: idempotencyKey });

    if (existingKey) {
      if (existingKey.status === 'completed') {
        return res.status(200).json(existingKey.response);
      }
      return res.status(409).json({ message: 'Request is already being processed' });
    }

    const newKey = new IdempotencyKey({ key: idempotencyKey, requestBody: req.body });
    await newKey.save();
    req.idempotencyKey = newKey;
    next();
  } catch (error) {
    res.status(500).json({ message: 'Idempotency check failed', error: error.message });
  }
};

module.exports = idempotencyMiddleware;
