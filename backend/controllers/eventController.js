const { Event, QuizEvent, PhotographyEvent } = require('../models/eventModel');
const User = require('../models/userModel');
const { getUploadPresignedUrl, getPresignedUrl } = require('../utils/s3Utils');
const { sendEventRegistrationEmail } = require('../utils/emailService');
const logger = require('../logger');

async function createEvent(req, res) {
  const { 
    title, description, startingDate, eventEndDate, location, eventType, maxPhotos, 
    themes, photoSubmissionDeadline, maxImagesPerUser, maxLikesPerUser, logoUrl, ...rest 
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
          title, description, startingDate, eventEndDate, location, createdBy, eventType, ...rest 
        });
        break;
      case 'photography':
        if (!req.user.roles.includes('admin')) {
          logger.warn(`Unauthorized photography event creation attempt by user: ${req.user.userId}`);
          return res.status(403).json({ message: 'Only admins can create photography events' });
        }
        event = new PhotographyEvent({ 
          title, description, startingDate, eventEndDate, location, createdBy, eventType, maxPhotos, 
          themes, photoSubmissionDeadline, maxImagesPerUser, maxLikesPerUser, ...rest 
        });
        break;
      default:
        event = new Event({ 
          title, description, startingDate, eventEndDate, location, createdBy, eventType 
        });
    }

    // Add the logo image URL if provided
    if (logoUrl) {
      event.logoImageUrl = logoUrl;
    }

    await event.save();
    logger.info(`Event created: ${event._id} by user: ${createdBy}`);
    res.status(201).json(event);
  } catch (error) {
    logger.error('Failed to create event', error);
    res.status(500).json({ message: 'Failed to create event', error: error.message });
  }
}

async function generateLogoUploadUrl(req, res) {
  const { title } = req.body;
  const key = `event-logos/${Date.now().toString()}_${title.replace(/ /g, '_')}.jpg`;

  try {
    const uploadUrl = await getUploadPresignedUrl(key, 3600, {}); // URL valid for 1 hour
    res.status(201).json({ uploadUrl, key });
  } catch (error) {
    logger.error('Failed to generate upload URL', error);
    res.status(500).json({ message: 'Failed to generate upload URL', error: error.message });
  }
}

async function getEvents(req, res) {
  try {
    const events = await Event.find();
    const eventsWithPresignedUrls = await Promise.all(events.map(async (event) => {
      if (event.logoImageUrl) {
        const logoPresignedUrl = await getPresignedUrl(event.logoImageUrl, 3600);
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

    if (event.logoImageUrl) {
      const logoPresignedUrl = await getPresignedUrl(event.logoImageUrl, 3600);
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

async function registerEvent(req, res) {
  const { eventId } = req.body;
  const userId = req.user.userId;

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      logger.warn(`Event not found for registration: ${eventId}`);
      return res.status(404).json({ message: 'Event not found' });
    }

    const user = await User.findById(userId);
    if (!user) {
      logger.warn(`User not found for registration: ${userId}`);
      return res.status(404).json({ message: 'User not found' });
    }

    if (user.events.includes(eventId)) {
      logger.warn(`User already registered for event: ${eventId}`);
      return res.status(200).json({ message: 'You are already registered for this event' });
    }

    user.events.push(eventId);
    event.participants.push(userId);

    await user.save();
    await event.save();

    await sendEventRegistrationEmail(user.email, event.title);

    logger.info(`User registered for event: ${eventId}`);
    res.status(200).json({ message: 'Registered for event successfully', event });
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
      status.isSubmissionStarted = event.isSubmissionStarted();
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

module.exports = { createEvent, generateLogoUploadUrl, getEvents, getEventById, updateEvent, deleteEvent, registerEvent, getEventStatus, checkUserRegistration };
