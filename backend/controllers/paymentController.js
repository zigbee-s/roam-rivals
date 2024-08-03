/* File: backend/controllers/paymentController.js */

const { createOrder, verifyPayment, handlePaymentSuccess } = require('../services/paymentService');
const Event = require('../models/eventModel');
const User = require('../models/userModel');

const registerEvent = async (req, res) => {
  const { userId, eventId } = req.body;
  try {
    const event = await Event.findById(eventId);
    event.registrations.push({ user: userId, paymentStatus: 'pending' });
    await event.save();

    const user = await User.findById(userId);
    user.registeredEvents.push(eventId);
    await user.save();

    const amount = event.entryFee * 100; // amount in paise
    const order = await createOrder(eventId, userId, amount);

    res.json(order);
  } catch (error) {
    res.status(500).send(error);
  }
};

const verifyPaymentHandler = async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, eventId, userId } = req.body;
  try {
    const isValid = await verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (isValid) {
      await handlePaymentSuccess(razorpay_order_id, razorpay_payment_id, eventId, userId);
      res.json({ success: true });
    } else {
      res.status(400).json({ success: false });
    }
  } catch (error) {
    res.status(500).send(error);
  }
};

const razorpayWebhookHandler = async (req, res) => {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  const shasum = crypto.createHmac('sha256', secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest('hex');

  if (digest === req.headers['x-razorpay-signature']) {
    // Handle webhook event
    res.json({ status: 'ok' });
  } else {
    res.status(400).send('Invalid signature');
  }
};

module.exports = { registerEvent, verifyPaymentHandler, razorpayWebhookHandler };
