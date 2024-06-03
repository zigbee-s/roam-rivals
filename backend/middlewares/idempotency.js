// middlewares/idempotency.js
const { client } = require('../db/db');

async function idempotencyMiddleware(req, res, next) {
    console.log(req)
  const idempotencyKey = req.headers['idempotency-key'];
    console.log(idempotencyKey)
  if (!idempotencyKey) {
    return res.status(400).json({ error: 'Idempotency key is required' });
  }

  const collection = client.db('test').collection('idempotencyKeys');

  const existingEntry = await collection.findOne({ idempotencyKey });

  if (existingEntry) {
    return res.status(409).json({ error: 'Duplicate request' });
  }

  await collection.insertOne({ idempotencyKey, createdAt: new Date() });

  next();
}

module.exports = { idempotencyMiddleware };
