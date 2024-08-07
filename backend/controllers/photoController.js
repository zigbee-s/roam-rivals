// File: backend/controllers/photoController.js
const Photo = require('../models/photoModel');
const { getPresignedUrl, getUploadPresignedUrl } = require('../utils/s3Utils');
const { PhotographyEvent } = require('../models/eventModel');
const logger = require('../logger');
const { sendWinnerNotificationEmail } = require('../utils/emailService'); // Import the sendWinnerNotificationEmail function
const User = require('../models/userModel'); // Ensure to include User model
const Leaderboard = require('../models/leaderboardModel'); // Import the Leaderboard model

const generateS3Key = (eventId, uploadedBy) => {
  return `photos/${eventId}/${uploadedBy}/${Date.now().toString()}_user_image.jpg`;
};

const getThemes = async (req, res) => {
  const { eventId } = req.params;
  try {
    const event = await PhotographyEvent.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(200).json({ themes: event.themes });
  } catch (error) {
    logger.error('Failed to fetch themes', error);
    res.status(500).json({ message: 'Failed to fetch themes', error: error.message });
  }
};

const generateUploadUrl = async (req, res) => {
  const { eventId } = req.params;
  const { themeChosen } = req.body;
  const uploadedBy = req.user.userId;

  // Validate input
  if (!eventId || !themeChosen) {
    return res.status(400).json({ message: 'Event ID and themeChosen are required' });
  }

  try {
    const photoEvent = await PhotographyEvent.findById(eventId);
    if (!photoEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (!photoEvent.participants.includes(uploadedBy)) {
      return res.status(403).json({ message: 'You are not registered for this event' });
    }

    if (!(await photoEvent.isUploadAllowed(uploadedBy))) {
      return res.status(400).json({ message: 'You have reached the maximum number of uploads for this event' });
    }

    // Check if the chosen theme is allowed
    if (!photoEvent.themes.includes(themeChosen)) {
      return res.status(400).json({ message: 'Invalid theme chosen' });
    }

    // Check if the total number of photos in the event is less than the maximum allowed
    if (photoEvent.photos.length >= photoEvent.maxPhotos) {
      return res.status(400).json({ message: 'Max photos limit reached for this event' });
    }

    const key = generateS3Key(eventId, uploadedBy);
    const uploadUrl = await getUploadPresignedUrl(key, 3600, { themeChosen }); // URL valid for 1 hour

    res.status(201).json({ uploadUrl, key, eventId, uploadedBy, themeChosen });
  } catch (error) {
    logger.error('Failed to generate upload URL', error);
    res.status(500).json({ message: 'Failed to generate upload URL', error: error.message });
  }
};

const confirmUpload = async (req, res) => {
  const { key, eventId, uploadedBy, themeChosen } = req.body;

  // Validate input
  if (!key || !eventId || !uploadedBy || !themeChosen) {
    return res.status(400).json({ message: 'Key, event ID, uploadedBy, and themeChosen are required' });
  }

  const session = await Photo.startSession();
  session.startTransaction();

  try {
    const photoEvent = await PhotographyEvent.findById(eventId).session(session);
    if (!photoEvent) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if the chosen theme is allowed
    if (!photoEvent.themes.includes(themeChosen)) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Invalid theme chosen' });
    }

    // Check if the total number of photos in the event is less than the maximum allowed
    if (photoEvent.photos.length >= photoEvent.maxPhotos) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Max photos limit reached for this event' });
    }

    const newPhoto = new Photo({ event: eventId, imageKey: key, uploadedBy, themeChosen });
    await newPhoto.save({ session });

    photoEvent.photos.push(newPhoto._id);
    await photoEvent.save({ session });

    await session.commitTransaction();
    session.endSession();

    logger.info(`Photo metadata saved for user: ${uploadedBy} for event: ${eventId}`);
    res.status(201).json(newPhoto);
  } catch (error) {
    logger.error('Failed to save photo metadata', error);
    if (session.inTransaction()) {
      await session.abortTransaction();
    }
    session.endSession();
    res.status(500).json({ message: 'Failed to save photo metadata', error: error.message });
  }
};

async function getAllPhotos(req, res) {
  try {
    const photos = await Photo.find().populate('uploadedBy', 'name username').populate('event', 'title');
    const photosWithUrls = await Promise.all(
      photos.map(async photo => ({
        ...photo.toObject(),
        imageUrl: await getPresignedUrl(photo.imageKey, 60 * 60), // 1 hour expiration
        likesCount: photo.likes.length
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
      return res.status(200).json({ photos: [] });
    }
    const photosWithUrls = await Promise.all(
      photos.map(async photo => ({
        ...photo.toObject(),
        imageUrl: await getPresignedUrl(photo.imageKey, 60 * 60), // 1 hour expiration
        likesCount: photo.likes.length
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

  try {
    const photo = await Photo.findById(photoId);
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    const event = await PhotographyEvent.findById(photo.event);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (!(await event.isLikeAllowed(userId))) {
      return res.status(403).json({ message: 'You have reached the maximum number of likes for this event' });
    }

    if (photo.likes.includes(userId)) {
      return res.status(400).json({ message: 'You have already liked this photo' });
    }

    photo.likes.push(userId);
    await photo.save();

    logger.info(`Photo liked by user: ${userId}`);
    res.status(200).json({ message: 'Photo liked successfully', photo });
  } catch (error) {
    logger.error('Failed to like photo', error);
    res.status(500).json({ message: 'Failed to like photo', error: error.message });
  }
}

const determineWinner = async (req, res) => {
  const { eventId } = req.params;
  const { allowedWinners, makePublic } = req.body;

  try {
    const event = await PhotographyEvent.findById(eventId).populate('photos');
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }


    // Sort photos by number of likes in descending order
    const sortedPhotos = event.photos.sort((a, b) => b.likes.length - a.likes.length);

    // Select top allowedWinners photos or fewer if there aren't enough photos
    const topPhotos = sortedPhotos.slice(0, allowedWinners);

    // Array to store winners for the leaderboard
    const winners = [];

    if (makePublic === 'Yes') {
      // Notify the winners and update their isWinner status
      if (new Date() < new Date(event.eventEndDate)) {
        return res.status(400).json({ message: 'Event is still ongoing' });
      }
      
      for (let rank = 0; rank < topPhotos.length; rank++) {
        const photo = topPhotos[rank];
        const user = await User.findById(photo.uploadedBy);
        await sendWinnerNotificationEmail(user.email, photo.themeChosen || 'Untitled', photo.likes.length);
        photo.isWinner = true;
        await photo.save();

        // Prepare winner details for leaderboard
        winners.push({
          winner: user._id,
          rank: rank + 1,
          details: {
            likes: photo.likes.length.toString(),
            theme: photo.themeChosen || 'Untitled',
          }
        });

        // Add winner to event's winners list
        event.winners.push(user._id);
      }

      await event.save();

      // Save or update leaderboard entry
      await Leaderboard.findOneAndUpdate(
        { event: eventId },
        {
          event: eventId,
          eventType: event.eventType,
          date: event.eventEndDate,
          winners: winners
        },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      );
    } else {
      // Prepare winner details for leaderboard without updating the database
      for (let rank = 0; rank < topPhotos.length; rank++) {
        const photo = topPhotos[rank];
        const user = await User.findById(photo.uploadedBy);

        // Prepare winner details for leaderboard
        winners.push({
          winner: user._id,
          rank: rank + 1,
          details: {
            likes: photo.likes.length.toString(),
            theme: photo.themeChosen || 'Untitled',
          }
        });
      }
    }

    res.status(200).json({ message: 'Winners determined', winners: topPhotos });
  } catch (error) {
    logger.error('Failed to determine winners', error);
    res.status(500).json({ message: 'Failed to determine winners', error: error.message });
  }
};


const getUserUploadedPhotosCount = async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user.userId;

  try {
    const photoEvent = await PhotographyEvent.findById(eventId);
    if (!photoEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const count = await Photo.countDocuments({ event: eventId, uploadedBy: userId });
    res.status(200).json({ count, maxImagesPerUser: photoEvent.maxImagesPerUser });
  } catch (error) {
    logger.error('Failed to get uploaded photos count', error);
    res.status(500).json({ message: 'Failed to get uploaded photos count', error: error.message });
  }
};


// New endpoint to get the number of likes a user has given for a specific event
const getUserLikesCount = async (req, res) => {
  const { eventId } = req.params;
  const userId = req.user.userId;

  try {
    const photoEvent = await PhotographyEvent.findById(eventId);
    if (!photoEvent) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const count = await Photo.countDocuments({ event: eventId, likes: userId });
    res.status(200).json({ count, maxLikesPerUser: photoEvent.maxLikesPerUser });
  } catch (error) {
    logger.error('Failed to get likes count', error);
    res.status(500).json({ message: 'Failed to get likes count', error: error.message });
  }
};


module.exports = { generateUploadUrl, getThemes, confirmUpload, getAllPhotos, getPhotosByEvent, likePhoto, determineWinner, getUserUploadedPhotosCount,getUserLikesCount };
