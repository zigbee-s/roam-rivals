// File: backend/routes/photoRoutes.js

const express = require('express');
const { uploadPhoto, getAllPhotos, getPhotosByEvent, likePhoto, determineWinner } = require('../controllers/photoController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const { upload } = require('../utils/s3Utils'); // Ensure correct path to s3Utils

const router = express.Router();

// Route to upload a photo, requires authentication
router.post('/upload', authMiddleware, upload.single('photo'), uploadPhoto);

// Route to get all photos
router.get('/', getAllPhotos);

// Route to get photos by event ID
router.get('/event/:eventId', getPhotosByEvent);

// Route to like a photo, requires authentication
router.post('/like', authMiddleware, likePhoto);

// Route to determine the winner of a photography event, requires authentication
router.post('/determine-winner/:eventId', authMiddleware, determineWinner);

module.exports = router;
