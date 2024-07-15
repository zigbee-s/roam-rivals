// File: backend/routes/photoRoutes.js

const express = require('express');
const { uploadPhoto, getAllPhotos, getPhotosByEvent, likePhoto, determineWinner } = require('../controllers/photoController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.post('/upload', authMiddleware, upload.single('photo'), uploadPhoto);
router.get('/', getAllPhotos);
router.get('/event/:eventId', getPhotosByEvent);
router.post('/like', authMiddleware, likePhoto);
router.post('/determine-winner/:eventId', authMiddleware, determineWinner);

module.exports = router;
