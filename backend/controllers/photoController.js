const Photo = require('../models/photoModel');
const { PhotographyEvent } = require('../models/eventModel'); // Correctly import the PhotographyEvent model
const logger = require('../logger');
const { sendEmail } = require('../utils/emailService'); // Ensure you have an email service utility

async function uploadPhoto(req, res) {
  const { title, description, event } = req.body;
  const uploadedBy = req.user.userId;

  if (!req.file) {
    return res.status(400).json({ message: 'No file uploaded' });
  }

  const imageUrl = req.file.location; // This URL will be the S3 URL of the uploaded file

  try {
    const photoEvent = await PhotographyEvent.findById(event);
    if (!photoEvent) {
      return res.status(404).json({ message: 'Event not found' });
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

async function getAllPhotos(req, res) {
  try {
    const photos = await Photo.find().populate('uploadedBy', 'name username').populate('event', 'title');
    res.status(200).json(photos);
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
    res.status(200).json(photos);
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
      await sendEmail(user.email, 'Congratulations! You have won the photography event', `Your photo titled \"${winningPhoto.title}\" has won with ${maxLikes} likes.`);
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
