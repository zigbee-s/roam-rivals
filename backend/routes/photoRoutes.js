// File: backend/routes/photoRoutes.js

const express = require('express');
const { generateUploadUrl, confirmUpload, getAllPhotos, getPhotosByEvent, likePhoto, determineWinner } = require('../controllers/photoController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const validateEventId = require('../middlewares/validateEventId'); // Import the middleware

const router = express.Router();

router.post('/generate-upload-url/:eventId', authMiddleware, validateEventId('photography'), generateUploadUrl);
router.post('/confirm-upload', authMiddleware, confirmUpload);

router.get('/', getAllPhotos);
router.get('/event/:eventId', validateEventId('photography'), getPhotosByEvent); // Add middleware here
router.post('/like', authMiddleware, likePhoto);
router.post('/determine-winner/:eventId', authMiddleware, validateEventId('photography'), determineWinner); // Add middleware here

module.exports = router;

