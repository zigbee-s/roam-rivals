const { createOrder, verifyPayment, handlePaymentSuccess } = require('../services/paymentService');
const logger = require('../logger');
const Payment = require('../models/paymentModel');
const Event = require('../models/eventModel');
const User = require('../models/userModel');
const crypto = require('crypto');

const REGISTRATION_XP = 10; // Constant XP for registration

async function createOrderForEvent(req, res) {
  const { eventId } = req.body;
  const userId = req.user.userId;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      logger.warn(`Event not found for order creation: ${eventId}`);
      return res.status(404).json({ message: 'Event not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      logger.warn(`User not found for order creation: ${userId}`);
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.events.includes(eventId)) {
      logger.warn(`User already registered for event: ${eventId}`);
      return res.status(200).json({ message: 'You are already registered for this event' });
    }

    const amount = event.entryFee * 100; // amount in paise
    const order = await createOrder(eventId, userId, amount);
    res.json(order);
  } catch (error) {
    logger.error('Failed to create order for event', error);
    res.status(500).json({ message: 'Failed to create order for event', error: error.message });
  }
}

async function handleRazorpayWebhook(req, res) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;

  const shasum = crypto.createHmac('sha256', secret);
  shasum.update(JSON.stringify(req.body));
  const digest = shasum.digest('hex');

  if (digest === req.headers['x-razorpay-signature']) {
    const event = req.body.event;
    const payload = req.body.payload;

    switch (event) {
      case 'payment.authorized':
        // Handle authorized payment
        break;
      case 'payment.failed':
        const { order_id, payment_id } = payload.payment.entity;
        const paymentRecord = await Payment.findOne({ orderId: order_id });
        if (paymentRecord) {
          paymentRecord.status = 'failed';
          await paymentRecord.save();
        }
        break;
      default:
        break;
    }
    res.json({ status: 'ok' });
  } else {
    res.status(400).send('Invalid signature');
  }
}

async function registerEvent(req, res) {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature, eventId } = req.body;
  const userId = req.user.userId;

  try {
    const isValid = await verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (isValid) {
      await handlePaymentSuccess(razorpay_order_id, razorpay_payment_id, eventId, userId);

      const event = await Event.findById(eventId);
      const user = await User.findById(userId);
      user.events.push(eventId);
      event.participants.push(userId);
      user.xp += REGISTRATION_XP;
      await user.save();
      await event.save();

      res.json({ success: true });
    } else {
      res.status(400).json({ success: false, message: 'Payment verification failed' });
    }
  } catch (error) {
    logger.error('Failed to register for event', error);
    res.status(500).json({ message: 'Failed to register for event', error: error.message });
  }
}

module.exports = { createOrderForEvent, handleRazorpayWebhook, registerEvent };
