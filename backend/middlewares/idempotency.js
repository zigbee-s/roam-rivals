const IdempotencyKey = require('../models/idempotencyKeyModel');

async function idempotencyMiddleware(req, res, next) {
  const idempotencyKey = req.headers['idempotency-key'];

  if (!idempotencyKey) {
    return res.status(400).json({ error: 'Idempotency key is required' });
  }

  try {
    const existingEntry = await IdempotencyKey.findOne({ idempotencyKey });

    if (existingEntry) {
      if (existingEntry.status === 'completed') {
        return res.status(200).json(existingEntry.responseBody);
      } else {
        return res.status(409).json({ error: 'Duplicate request' });
      }
    }

    const newEntry = await IdempotencyKey.create({
      idempotencyKey,
      requestBody: req.body,
      status: 'pending'
    });

    req.idempotencyKeyEntry = newEntry;

    next(); // Pass control to the next middleware
  } catch (error) {
    console.error('Error checking idempotency', error);
    res.status(500).json({ error: 'Internal server error' });
  }
}

module.exports = { idempotencyMiddleware };
