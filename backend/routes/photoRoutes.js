// File: backend/routes/photoRoutes.js

const express = require('express');
const { uploadPhoto, getAllPhotos, getPhotosByEvent, likePhoto, determineWinner } = require('../controllers/photoController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');
const checkEventType = require('../middlewares/checkEventType'); // Import the middleware

const router = express.Router();

function printFormContents(req, res, next) {
  console.log('--- PrintFormContents Middleware ---');
  console.log('Form Data:', req.body);
  console.log('File Data:', req.file);
  next();
}

// Use middleware to check event type for photography events
router.post('/upload', authMiddleware, printFormContents, upload.single('photo'), uploadPhoto);
// router.post('/upload', authMiddleware, upload.single('photo'), printFormContents, uploadPhoto);

router.get('/', getAllPhotos);
router.get('/event/:eventId', checkEventType('photography'), getPhotosByEvent); // Add middleware here
router.post('/like', authMiddleware, likePhoto);
router.post('/determine-winner/:eventId', authMiddleware, checkEventType('photography'), determineWinner); // Add middleware here

module.exports = router;
