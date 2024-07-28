// backend/middlewares/idempotencyMiddleware.js
const IdempotencyKey = require('../models/idempotencyKeyModel');
const logger = require('../logger');

const idempotencyMiddleware = async (req, res, next) => {
  const idempotencyKey = req.headers['idempotency-key'];
  if (!idempotencyKey) {
    logger.warn('Idempotency key missing');
    return res.status(400).json({ message: 'Idempotency key missing' });
  }

  try {
    const existingKey = await IdempotencyKey.findOne({ key: idempotencyKey });

    if (existingKey) {
      if (existingKey.status === 'completed') {
        logger.info('Idempotent request already completed', { idempotencyKey });
        return res.status(200).json(existingKey.response);
      }
      logger.info('Request is already being processed', { idempotencyKey });
      return res.status(409).json({ message: 'Request is already being processed' });
    }

    const newKey = new IdempotencyKey({ key: idempotencyKey, requestBody: req.body });
    await newKey.save();
    req.idempotencyKey = newKey;
    next();
  } catch (error) {
    logger.error('Idempotency check failed', error);
    res.status(500).json({ message: 'Idempotency check failed', error: error.message });
  }
};

module.exports = idempotencyMiddleware;
