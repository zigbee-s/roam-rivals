// backend/modules/photography/controllers/photoController.js
const Photo = require('../models/photoModel');
const Event = require('../../../models/eventModel');

async function uploadPhoto(req, res) {
  const { title, description, eventId } = req.body;
  const uploadedBy = req.user.userId;
  const imageUrl = req.file.path; // Assuming you're using a file upload middleware

  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    const photo = new Photo({ title, description, imageUrl, uploadedBy, event: eventId });
    await photo.save();

    res.status(201).json(photo);
  } catch (error) {
    res.status(500).json({ message: 'Failed to upload photo', error: error.message });
  }
}

async function getAllPhotos(req, res) {
  const { eventId } = req.params;

  try {
    const photos = await Photo.find({ event: eventId }).populate('uploadedBy', 'name email');
    res.status(200).json(photos);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch photos', error: error.message });
  }
}

async function selectWinner(req, res) {
  const { photoId } = req.body;

  try {
    const photo = await Photo.findById(photoId).populate('uploadedBy', 'name email');
    if (!photo) {
      return res.status(404).json({ message: 'Photo not found' });
    }

    // Notify the user (assuming you have a notification service)
    // await sendNotification(photo.uploadedBy.email, 'You have won the photography event!', 'Congratulations!');

    res.status(200).json({ message: 'Winner selected', photo });
  } catch (error) {
    res.status(500).json({ message: 'Failed to select winner', error: error.message });
  }
}

module.exports = { uploadPhoto, getAllPhotos, selectWinner };
