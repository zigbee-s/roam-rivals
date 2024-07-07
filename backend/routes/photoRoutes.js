// backend/routes/photoRoutes.js
const express = require('express');
const { uploadPhoto, getPhotos, likePhoto } = require('../controllers/photoController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

const router = express.Router();

router.post('/upload', authMiddleware, upload.single('image'), uploadPhoto);
router.get('/', getPhotos);
router.post('/like', authMiddleware, likePhoto);

module.exports = router;
