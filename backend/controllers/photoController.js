// backend/controllers/photoController.js
const Photo = require('../models/photoModel');
const PhotographyEvent = require('../models/eventModel').PhotographyEvent;
const User = require('../models/userModel');
const logger = require('../logger');
const { gfs } = require('../db/db');

async function uploadPhoto(req, res) {
  const { title, description, event } = req.body;
  const uploadedBy = req.user.userId;

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const imageUrl = req.file.filename; // The filename saved in GridFS

  try {
    const photoEvent = await PhotographyEvent.findById(event);
    if (!photoEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const user = await User.findById(uploadedBy).select('events');
    if (!user) {
      return res.status(403).json({ message: 'User not found' });
    }

    if (!user.events.includes(event)) {
      return res.status(403).json({ message: 'You are not registered for this event' });
    }

    const newPhoto = new Photo({ title, description, event, imageUrl, uploadedBy });
    await newPhoto.save();

    photoEvent.photos.push(newPhoto._id);
    await photoEvent.save();

    logger.info(`Photo uploaded by user: ${uploadedBy} for event: ${event}`);
    res.status(201).json(newPhoto);
  } catch (error) {
    logger.error('Failed to upload photo', error);
    res.status(500).json({ message: 'Failed to upload photo', error: error.message });
  }
}

async function getPhotos(req, res) {
  try {
    const photos = await Photo.find().populate('uploadedBy', 'name username').populate('event', 'title');
    res.status(200).json(photos);
  } catch (error) {
    logger.error('Failed to fetch photos', error);
    res.status(500).json({ message: 'Failed to fetch photos', error: error.message });
  }
}

async function likePhoto(req, res) {
  const { photoId } = req.body;
  const userId = req.user.userId;
  const maxLikes = 10; // Set the max photos a user can like

  try {
    const photo = await Photo.findById(photoId);
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    const userLikesCount = await Photo.countDocuments({ likes: userId });
    if (userLikesCount >= maxLikes) {
      return res.status(403).json({ message: `You can only like up to ${maxLikes} photos` });
    }

    if (!photo.likes.includes(userId)) {
      photo.likes.push(userId);
      await photo.save();
    }

    logger.info(`Photo liked by user: ${userId}`);
    res.status(200).json({ message: 'Photo liked successfully', photo });
  } catch (error) {
    logger.error('Failed to like photo', error);
    res.status(500).json({ message: 'Failed to like photo', error: error.message });
  }
}

module.exports = { uploadPhoto, getPhotos, likePhoto };
