// File: backend/routes/photoRoutes.js

const express = require('express');
const { getThemes, generateUploadUrl, confirmUpload, getAllPhotos, getPhotosByEvent, likePhoto, determineWinner, getUserUploadedPhotosCount, getUserLikesCount } = require('../controllers/photoController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const validateEventId = require('../middlewares/validateEventId');
const checkRegistration = require('../middlewares/checkRegistration'); // Import the middleware

const router = express.Router();

router.post('/generate-upload-url/:eventId', authMiddleware, validateEventId('photography'), checkRegistration('photography'), generateUploadUrl);
router.post('/confirm-upload/:eventId', authMiddleware, validateEventId('photography'), checkRegistration('photography'), confirmUpload);

router.get('/:eventId/themes', authMiddleware, validateEventId('photography'), checkRegistration('photography'), getThemes);

router.get('/', getAllPhotos);
router.get('/event/:eventId', validateEventId('photography'), getPhotosByEvent); // Add middleware here
router.post('/like', authMiddleware, likePhoto);
router.post('/determine-winner/:eventId', authMiddleware, validateEventId('photography'), checkRegistration('photography'), determineWinner); // Add middleware here
router.get('/:eventId/userUploadsCount', authMiddleware, checkRegistration('photography'), getUserUploadedPhotosCount); // Add the new route
router.get('/:eventId/userLikesCount', authMiddleware, getUserLikesCount); // Add the new route

module.exports = router;