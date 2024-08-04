// backend/controllers/eventController.js

const { Event, QuizEvent, PhotographyEvent } = require('../models/eventModel');
const User = require('../models/userModel');
const { getUploadGIFPresignedUrl, getPresignedUrl } = require('../utils/s3Utils');
const { sendEventRegistrationEmail } = require('../utils/emailService');
const { createOrder, verifyPayment, handlePaymentSuccess } = require('../services/paymentService');
const logger = require('../logger');

const REGISTRATION_XP = 10; // Constant XP for registration

async function createEvent(req, res) {
  const { 
    title, description, startingDate, eventEndDate, location, eventType, maxPhotos, 
    themes, photoSubmissionDeadline, maxImagesPerUser, maxLikesPerUser, logoGIFKey, difficulty, entryFee, isSpecial, totalXP, ...rest 
  } = req.body;
  const createdBy = req.user.userId;

  try {
    let event;
    switch (eventType) {
      case 'quiz':
        if (!req.user.roles.includes('admin')) {
          logger.warn(`Unauthorized quiz event creation attempt by user: ${req.user.userId}`);
          return res.status(403).json({ message: 'Only admins can create quiz events' });
        }
        event = new QuizEvent({ 
          title, description, startingDate, eventEndDate, location, createdBy, eventType, difficulty, entryFee, isSpecial, totalXP, ...rest 
        });
        break;
      case 'photography':
        if (!req.user.roles.includes('admin')) {
          logger.warn(`Unauthorized photography event creation attempt by user: ${req.user.userId}`);
          return res.status(403).json({ message: 'Only admins can create photography events' });
        }
        event = new PhotographyEvent({ 
          title, description, startingDate, eventEndDate, location, createdBy, eventType, maxPhotos, 
          themes, photoSubmissionDeadline, maxImagesPerUser, maxLikesPerUser, difficulty, entryFee, isSpecial, totalXP, ...rest 
        });
        break;
      default:
        event = new Event({ 
          title, description, startingDate, eventEndDate, location, createdBy, eventType, difficulty, entryFee, isSpecial, totalXP 
        });
    }

    // Add the logo GIF key if provided
    if (logoGIFKey) {
      event.logoGIFKey = logoGIFKey;
    }

    await event.save();
    logger.info(`Event created: ${event._id} by user: ${createdBy}`);
    res.status(201).json(event);
  } catch (error) {
    logger.error('Failed to create event', error);
    res.status(500).json({ message: 'Failed to create event', error: error.message });
  }
}

async function generateLogoGIFUploadUrl(req, res) {
  const { title } = req.body;
  const key = `event-logos/${Date.now().toString()}_${title.replace(/ /g, '_')}.gif`;

  try {
    const uploadUrl = await getUploadGIFPresignedUrl(key, 3600, { 'Content-Type': 'image/gif' }); // URL valid for 1 hour
    res.status(201).json({ uploadUrl, key });
  } catch (error) {
    logger.error('Failed to generate upload URL for GIF', error);
    res.status(500).json({ message: 'Failed to generate upload URL for GIF', error: error.message });
  }
}

async function getEvents(req, res) {
  try {
    const events = await Event.find();
    const eventsWithPresignedUrls = await Promise.all(events.map(async (event) => {
      if (event.logoGIFKey) {
        const logoPresignedUrl = await getPresignedUrl(event.logoGIFKey, 3600);
        return { ...event.toObject(), logoPresignedUrl };
      }
      return event.toObject();
    }));

    res.status(200).json(eventsWithPresignedUrls);
  } catch (error) {
    logger.error('Failed to fetch events', error);
    res.status(500).json({ message: 'Failed to fetch events', error: error.message });
  }
}

async function getEventById(req, res) {
  const { eventId } = req.params;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      logger.warn(`Event not found: ${eventId}`);
      return res.status(404).json({ message: 'Event not found' });
    }

    if (event.logoGIFKey) {
      const logoPresignedUrl = await getPresignedUrl(event.logoGIFKey, 3600);
      event.logoPresignedUrl = logoPresignedUrl;
    }

    res.status(200).json(event);
  } catch (error) {
    logger.error('Failed to fetch event', error);
    res.status(500).json({ message: 'Failed to fetch event', error: error.message });
  }
}

async function updateEvent(req, res) {
  const { eventId } = req.params;
  const updateData = req.body;

  try {
    const event = await Event.findByIdAndUpdate(eventId, updateData, { new: true });
    if (!event) {
      logger.warn(`Event not found: ${eventId}`);
      return res.status(404).json({ message: 'Event not found' });
    }
    logger.info(`Event updated: ${event._id} by user: ${req.user.userId}`);
    res.status(200).json(event);
  } catch (error) {
    logger.error('Failed to update event', error);
    res.status(500).json({ message: 'Failed to update event', error: error.message });
  }
}

async function deleteEvent(req, res) {
  const { eventId } = req.params;

  try {
    const event = await Event.findByIdAndDelete(eventId);
    if (!event) {
      logger.warn(`Event not found: ${eventId}`);
      return res.status(404).json({ message: 'Event not found' });
    }
    logger.info(`Event deleted: ${eventId}`);
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    logger.error('Failed to delete event', error);
    res.status(500).json({ message: 'Failed to delete event', error: error.message });
  }
}

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

    // Create Razorpay order
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
    // Handle webhook event
    const event = req.body.event;
    const payload = req.body.payload;

    switch (event) {
      case 'payment.authorized':
        // Handle authorized payment
        break;
      case 'payment.failed':
        // Handle failed payment
        const { order_id, payment_id } = payload.payment.entity;
        const paymentRecord = await Payment.findOne({ orderId: order_id });
        if (paymentRecord) {
          paymentRecord.status = 'failed';
          await paymentRecord.save();
        }
        break;
      // Handle other events as needed
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
    const isValid = verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    if (isValid) {
      await handlePaymentSuccess(razorpay_order_id, razorpay_payment_id, eventId, userId);

      // Update event and user registrations after payment success
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

async function getEventStatus(req, res) {
  const { eventId } = req.params;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      logger.warn(`Event not found: ${eventId}`);
      return res.status(404).json({ message: 'Event not found' });
    }

    const status = {
      isOpened: event.isOpened(),
      isClosed: event.isClosed(),
    };

    if (event.eventType === 'photography') {
      status.isUploadPeriod = event.isUploadPeriod();
      status.isViewingAllowed = event.isViewingAllowed();
    }

    res.status(200).json(status);
  } catch (error) {
    logger.error('Failed to fetch event status', error);
    res.status(500).json({ message: 'Failed to fetch event status', error: error.message });
  }
}

async function checkUserRegistration(req, res) {
  const { eventId } = req.params;
  const userId = req.user.userId; // Assuming user ID is available in req.user

  try {
    const event = await Event.findById(eventId).populate('participants');
    if (!event) {
      logger.warn(`Event not found: ${eventId}`);
      return res.status(404).json({ message: 'Event not found' });
    }

    const isRegistered = event.participants.some(participant => participant._id.equals(userId));

    res.status(200).json({ isRegistered });
  } catch (error) {
    logger.error('Failed to check user registration', error);
    res.status(500).json({ message: 'Failed to check user registration', error: error.message });
  }
}

// Function to award XP based on ranks
async function awardXpForEvent(eventId) {
  try {
    const event = await Event.findById(eventId).populate('participants');
    if (!event) {
      logger.warn(`Event not found: ${eventId}`);
      return;
    }

    const totalXP = event.totalXP;
    const participants = event.participants.sort((a, b) => a.rank - b.rank); // Assuming participants have a rank field

    // Define XP allocation for top positions
    const topPositionXPs = [totalXP * 0.3, totalXP * 0.2, totalXP * 0.1]; // 1st: 30%, 2nd: 20%, 3rd: 10%
    const winnerXP = topPositionXPs.reduce((acc, xp) => acc + xp, 0);
    const remainingXP = totalXP - winnerXP;
    const participationXP = remainingXP * 0.1; // 10% for participation
    const rankBasedXP = remainingXP - participationXP;

    // Award XP to top 3 winners
    for (let i = 0; i < Math.min(3, participants.length); i++) {
      participants[i].xp += topPositionXPs[i];
      await participants[i].save();
    }

    // Remaining winners (top 10%) after top 3 get equal share of remaining winnerXP
    const remainingWinners = participants.slice(3, Math.ceil(participants.length * 0.1));
    const remainingWinnerXP = winnerXP - topPositionXPs.reduce((acc, xp) => acc + xp, 0);

    for (let i = 0; i < remainingWinners.length; i++) {
      remainingWinners[i].xp += remainingWinnerXP / remainingWinners.length;
      await remainingWinners[i].save();
    }

    // Award participation XP to all participants
    for (let participant of participants) {
      participant.xp += participationXP / participants.length;
      await participant.save();
    }

    // Award rank-based XP to remaining participants based on rank
    const remainingParticipants = participants.slice(Math.ceil(participants.length * 0.1));
    const totalRanks = remainingParticipants.reduce((acc, p) => acc + p.rank, 0);

    for (let participant of remainingParticipants) {
      const participantXP = (rankBasedXP * participant.rank) / totalRanks;
      participant.xp += participantXP;
      await participant.save();
    }

    logger.info(`XP awarded for event: ${eventId}`);
  } catch (error) {
    logger.error('Failed to award XP for event', error);
  }
}

async function completeEvent(req, res) {
  await awardXpForEvent(req.params.eventId);
  res.status(200).json({ message: 'Event completed and XP awarded' });
}

module.exports = { 
  createEvent, 
  generateLogoGIFUploadUrl, 
  getEvents, 
  getEventById, 
  updateEvent, 
  deleteEvent, 
  createOrderForEvent, 
  registerEvent, 
  getEventStatus, 
  checkUserRegistration, 
  completeEvent,
  handleRazorpayWebhook 
};