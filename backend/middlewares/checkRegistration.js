// File: backend/middlewares/checkRegistration.js

const { PhotographyEvent, QuizEvent, Event } = require('../models/eventModel');
const logger = require('../logger');

const checkRegistration = (eventType) => async (req, res, next) => {
  const { eventId } = req.params;
  const userId = req.user.userId;

  try {
    let event;
    switch (eventType) {
      case 'photography':
        event = await PhotographyEvent.findById(eventId);
        break;
      case 'quiz':
        event = await QuizEvent.findById(eventId);
        break;
      default:
        event = await Event.findById(eventId);
        break;
    }

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (!event.participants.includes(userId)) {
      return res.status(403).json({ message: 'You are not registered for this event' });
    }

    next();
  } catch (error) {
    logger.error('Failed to check registration', error);
    res.status(500).json({ message: 'Failed to check registration', error: error.message });
  }
};

module.exports = checkRegistration;
