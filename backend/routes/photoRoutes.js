// backend/routes/photoRoutes.js
const express = require('express');
const { uploadPhoto, getAllPhotos, likePhoto, getPhotosByEvent } = require('../controllers/photoController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.post('/upload', authMiddleware, upload.single('image'), uploadPhoto);
router.get('/', authMiddleware, getAllPhotos);
router.post('/like', authMiddleware, likePhoto);
router.get('/event/:eventId', authMiddleware, getPhotosByEvent);

module.exports = router;
