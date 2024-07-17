// File: backend/controllers/photoController.js

const Photo = require('../models/photoModel');
const { getPresignedUrl } = require('../utils/s3Utils');
const { PhotographyEvent } = require('../models/eventModel');
const logger = require('../logger');
const { sendEmail } = require('../utils/emailService');
const User = require('../models/userModel'); // Ensure to include User model

async function uploadPhoto(req, res) {
  const { title, description } = req.body;
  const { eventId } = req.params; // Extract eventId from URL parameters
  const uploadedBy = req.user.userId;

  if (!req.file) {
    logger.error('No file uploaded');
    return res.status(400).json({ message: 'No file uploaded' });
  }

  try {
    const photoEvent = await PhotographyEvent.findById(eventId); // Use eventId from URL parameters
    if (!photoEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const newPhoto = new Photo({ title, description, event: eventId, imageKey: req.file.key, uploadedBy });
    await newPhoto.save();

    photoEvent.photos.push(newPhoto._id);
    await photoEvent.save();

    logger.info(`Photo uploaded by user: ${uploadedBy} for event: ${eventId}`);
    res.status(201).json(newPhoto);
  } catch (error) {
    logger.error('Failed to upload photo', error);
    res.status(500).json({ message: 'Failed to upload photo', error: error.message });
  }
}


async function getAllPhotos(req, res) {
  try {
    const photos = await Photo.find().populate('uploadedBy', 'name username').populate('event', 'title');
    const photosWithUrls = await Promise.all(
      photos.map(async photo => ({
        ...photo.toObject(),
        imageUrl: await getPresignedUrl(photo.imageKey, 60 * 60), // 1 hour expiration
      }))
    );
    res.status(200).json(photosWithUrls);
  } catch (error) {
    logger.error('Failed to fetch photos', error);
    res.status(500).json({ message: 'Failed to fetch photos', error: error.message });
  }
}

async function getPhotosByEvent(req, res) {
  const { eventId } = req.params;

  try {
    const photos = await Photo.find({ event: eventId }).populate('uploadedBy', 'name username').populate('event', 'title');
    if (!photos || photos.length === 0) {
      return res.status(404).json({ message: 'No photos found for this event' });
    }
    const photosWithUrls = await Promise.all(
      photos.map(async photo => ({
        ...photo.toObject(),
        imageUrl: await getPresignedUrl(photo.imageKey, 60 * 60), // 1 hour expiration
      }))
    );
    res.status(200).json(photosWithUrls);
  } catch (error) {
    logger.error('Failed to fetch photos for event', error);
    res.status(500).json({ message: 'Failed to fetch photos for event', error: error.message });
  }
}

async function likePhoto(req, res) {
  const { photoId } = req.body;
  const userId = req.user.userId;
  const maxLikes = 10;

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

async function determineWinner(req, res) {
  const { eventId } = req.params;

  try {
    const event = await PhotographyEvent.findById(eventId).populate('photos');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (new Date() < new Date(event.eventEndDate)) {
      return res.status(400).json({ message: 'Event is still ongoing' });
    }

    let winningPhoto = null;
    let maxLikes = -1;

    for (const photo of event.photos) {
      if (photo.likes.length > maxLikes) {
        maxLikes = photo.likes.length;
        winningPhoto = photo;
      }
    }

    if (winningPhoto) {
      const user = await User.findById(winningPhoto.uploadedBy);
      await sendEmail(user.email, 'Congratulations! You have won the photography event', `Your photo titled "${winningPhoto.title}" has won with ${maxLikes} likes.`);
      winningPhoto.isWinner = true;
      await winningPhoto.save();
      res.status(200).json({ message: 'Winner determined and notified', winningPhoto });
    } else {
      res.status(404).json({ message: 'No photos in the event' });
    }
  } catch (error) {
    logger.error('Failed to determine winner', error);
    res.status(500).json({ message: 'Failed to determine winner', error: error.message });
  }
}

module.exports = { uploadPhoto, getAllPhotos, getPhotosByEvent, likePhoto, determineWinner };
