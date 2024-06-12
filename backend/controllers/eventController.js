// controllers/eventController.js
const Event = require('../models/eventModel');
const User = require('../models/userModel');

async function createEvent(req, res) {
  const { title, description, date, location } = req.body;
  const createdBy = req.user.userId;
  
  try {
    const event = new Event({ title, description, date, location, createdBy });
    await event.save();
    res.status(201).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Failed to create event', error: error.message });
  }
}

async function getEvents(req, res) {
  try {
    const events = await Event.find();
    res.status(200).json(events);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch events', error: error.message });
  }
}

async function getEventById(req, res) {
  const { eventId } = req.params;
  
  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch event', error: error.message });
  }
}

async function updateEvent(req, res) {
  const { eventId } = req.params;
  const { title, description, date, location } = req.body;

  try {
    const event = await Event.findByIdAndUpdate(eventId, { title, description, date, location }, { new: true });
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json(event);
  } catch (error) {
    res.status(500).json({ message: 'Failed to update event', error: error.message });
  }
}

async function deleteEvent(req, res) {
  const { eventId } = req.params;

  try {
    const event = await Event.findByIdAndDelete(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json({ message: 'Event deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete event', error: error.message });
  }
}

async function registerEvent(req, res) {
    const { eventId } = req.body;
    const userId = req.user.userId;
    try {
      const event = await Event.findById(eventId);
      if (!event) {
        return res.status(404).json({ message: 'Event not found' });
      }
  
      const user = await User.findById(userId);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      if (user.events.includes(eventId)) {
        return res.status(400).json({ message: 'User already registered for this event' });
      }
  
      user.events.push(eventId);
      await user.save();
  
      res.status(200).json({ message: 'Registered for event successfully', event });
    } catch (error) {
      res.status(500).json({ message: 'Failed to register for event', error: error.message });
    }
  }


module.exports = { createEvent, getEvents, getEventById, updateEvent, deleteEvent, registerEvent };
