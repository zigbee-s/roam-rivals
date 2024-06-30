// backend/modules/photography/controllers/photoController.js
const Photo = require('../models/photoModel');
const { PhotographyEvent } = require('../../../../models/eventModel');

async function uploadPhoto(req, res) {
  const { eventId } = req.body;
  const userId = req.user.userId;
  const photoUrl = req.file.path;  // Assume you're using multer for file uploads

  try {
    const event = await PhotographyEvent.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    if (!event.participants.includes(userId)) {
      return res.status(403).json({ message: 'You are not registered for this event' });
    }

    const photo = new Photo({ url: photoUrl, uploadedBy: userId, eventId });
    await photo.save();

    event.photos.push(photo._id);
    await event.save();

    res.status(200).json({ message: 'Photo uploaded successfully', photo });
  } catch (error) {
    res.status(500).json({ message: 'Failed to upload photo', error: error.message });
  }
}

async function getAllPhotos(req, res) {
  try {
    const photos = await PhotographyEvent.find().populate('photos');
    res.status(200).json(photos);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch photos', error: error.message });
  }
}

async function getPhotoById(req, res) {
  const { photoId } = req.params;
  try {
    const photo = await Photo.findById(photoId);
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }
    res.status(200).json(photo);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch photo', error: error.message });
  }
}

async function deletePhoto(req, res) {
  const { photoId } = req.params;
  try {
    const photo = await Photo.findByIdAndDelete(photoId);
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    // Optionally, you can also remove the reference to the photo from the PhotographyEvent if needed.
    await PhotographyEvent.updateMany(
      { photos: photoId },
      { $pull: { photos: photoId } }
    );

    res.status(200).json({ message: 'Photo deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to delete photo', error: error.message });
  }
}

module.exports = { uploadPhoto, getAllPhotos, getPhotoById, deletePhoto };