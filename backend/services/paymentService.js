/* File: backend/services/paymentService.js */
const Razorpay = require('razorpay');
const crypto = require('crypto');
const config = require('../config');
const Event = require('../models/eventModel');
const Payment = require('../models/paymentModel');

const razorpay = new Razorpay({
  key_id: config.razorpayKeyId,
  key_secret: config.razorpayKeySecret,
});

async function createOrder(eventId, userId, amount, currency = 'INR') {
  try {
    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt: `${eventId}_${userId}`,
    });
    return order;
  } catch (error) {
    throw new Error('Error creating order with Razorpay');
  }
}

async function verifyPayment(orderId, paymentId, signature) {
  const hmac = crypto.createHmac('sha256', config.razorpayKeySecret);
  hmac.update(orderId + "|" + paymentId);
  const generated_signature = hmac.digest('hex');

  return generated_signature === signature;
}

async function handlePaymentSuccess(orderId, paymentId, eventId, userId) {
  const event = await Event.findById(eventId);
  const registration = event.registrations.find(reg => reg.user.toString() === userId);
  registration.paymentStatus = 'completed';
  await event.save();

  const payment = new Payment({
    orderId,
    paymentId,
    user: userId,
    event: eventId,
    status: 'completed'
  });
  await payment.save();

  return payment;
}

module.exports = { createOrder, verifyPayment, handlePaymentSuccess };
