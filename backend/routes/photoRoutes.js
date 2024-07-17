// File: backend/routes/photoRoutes.js

const express = require('express');
const { uploadPhoto, getAllPhotos, getPhotosByEvent, likePhoto, determineWinner } = require('../controllers/photoController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const validateEventId = require('../middlewares/validateEventId'); // Import the middleware

const router = express.Router();

// Use middleware to check event type for photography events
router.post('/upload/:eventId', authMiddleware, validateEventId('photography'), upload.single('photo'), uploadPhoto);

router.get('/', getAllPhotos);
router.get('/event/:eventId', validateEventId('photography'), getPhotosByEvent); // Add middleware here
router.post('/like', authMiddleware, likePhoto);
router.post('/determine-winner/:eventId', authMiddleware, validateEventId('photography'), determineWinner); // Add middleware here

module.exports = router;
