const Razorpay = require('razorpay');
const crypto = require('crypto');
const config = require('../config/config');
const Event = require('../models/eventModel');
const Payment = require('../models/paymentModel');

const razorpay = new Razorpay({
  key_id: config.razorpayKeyId,
  key_secret: config.razorpayKeySecret,
});

async function createOrder(eventId, userId, amount, currency = 'INR') {
  try {
    // Create a short receipt string using a hash
    const receipt = crypto.createHash('sha256').update(`${eventId}_${userId}`).digest('hex').substring(0, 40);
    
    const order = await razorpay.orders.create({
      amount,
      currency,
      receipt,
    });
    return order;
  } catch (error) {
    console.log(error);
    throw new Error('Error creating order with Razorpay');
  }
}

function verifyPayment(orderId, paymentId, signature) {
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