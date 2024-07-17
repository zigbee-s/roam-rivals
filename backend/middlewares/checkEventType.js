// backend/middlewares/checkEventType.js

const { Event } = require('../models/eventModel');
const logger = require('../logger');

const checkEventType = (requiredEventType) => {
  return async (req, res, next) => {
    const eventId = req.body.event || req.params.eventId; // Check both body and params
    console.log(req.body)
    if (!eventId) {
      logger.warn('Event ID is missing');
      return res.status(400).json({ message: 'Event ID is required' });
    }

    try {
      const event = await Event.findById(eventId);

      if (!event) {
        logger.warn(`Event not found: ${eventId}`);
        return res.status(404).json({ message: 'Event not found' });
      }

      if (event.eventType !== requiredEventType) {
        logger.warn(`Invalid event type: Expected ${requiredEventType}, but got ${event.eventType}`);
        return res.status(400).json({ message: `Invalid event type: Expected ${requiredEventType}` });
      }

      req.event = event; // Attach event to request object for further use
      next();
    } catch (error) {
      logger.error('Failed to check event type', error);
      res.status(500).json({ message: 'Failed to check event type', error: error.message });
    }
  };
};

module.exports = checkEventType;
