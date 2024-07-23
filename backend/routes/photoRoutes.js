// File: backend/routes/photoRoutes.js

const express = require('express');
const { getThemes, generateUploadUrl, confirmUpload, getAllPhotos, getPhotosByEvent, likePhoto, determineWinner, getUserUploadedPhotosCount, getUserLikesCount } = require('../controllers/photoController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const validateEventId = require('../middlewares/validateEventId');
const checkRegistration = require('../middlewares/checkRegistration'); // Import the middleware
const { checkEventStarted, checkSubmissionAllowed, checkViewingAllowed } = require('../middlewares/eventCriteriaMiddleware');

const router = express.Router();

router.post('/generate-upload-url/:eventId', authMiddleware, validateEventId('photography'), checkRegistration('photography'), checkSubmissionAllowed, generateUploadUrl);
router.post('/confirm-upload/:eventId', authMiddleware, validateEventId('photography'), checkRegistration('photography'), checkSubmissionAllowed, confirmUpload);

router.get('/:eventId/themes', authMiddleware, validateEventId('photography'), checkRegistration('photography'), checkEventStarted, getThemes);

router.get('/', getAllPhotos);
router.get('/event/:eventId', validateEventId('photography'), checkViewingAllowed, getPhotosByEvent);
router.post('/:eventId/like', authMiddleware, checkViewingAllowed, likePhoto);
router.post('/determine-winner/:eventId', authMiddleware, validateEventId('photography'), checkRegistration('photography'), determineWinner);
router.get('/:eventId/userUploadsCount', authMiddleware, checkRegistration('photography'), getUserUploadedPhotosCount);
router.get('/:eventId/userLikesCount', authMiddleware, getUserLikesCount);

module.exports = router;
