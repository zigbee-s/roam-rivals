// eventCriteriaMiddleware.js

const mongoose = require('mongoose');
const Event = mongoose.model('Event'); // Ensure Event model is loaded

// Middleware to check if event has started
const checkEventStarted = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    if (event.isOpened()) {
      return next();
    }
    return res.status(403).json({ message: 'Event has not started yet' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Middleware to check if submission is allowed
const checkSubmissionAllowed = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    if (event.isOpened() && event.isUploadPeriod()) {
      return next();
    }
    return res.status(403).json({ message: 'Submission not allowed at this time' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

// Middleware to check if photo viewing is allowed
const checkViewingAllowed = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    if (event.isViewingAllowed()) {
      return next();
    }
    return res.status(403).json({ message: 'Viewing not allowed before submission deadline' });
  } catch (error) {
    return res.status(500).json({ message: 'Internal server error' });
  }
};

module.exports = { checkEventStarted, checkSubmissionAllowed, checkViewingAllowed };
