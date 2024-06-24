// backend/routes/photoRoutes.js
const express = require('express');
const { uploadPhoto, getAllPhotos, getPhoto, deletePhoto } = require('../controllers/photoController');
const { authMiddleware } = require('../../../middlewares/authMiddleware');
const multer = require('multer');
const upload = require('../../../middlewares/fileUploadMiddleware');

const router = express.Router();

router.post('/upload', authMiddleware, upload.single('photo'), uploadPhoto);
router.get('/', authMiddleware, getAllPhotos);
router.get('/:photoId', authMiddleware, getPhoto);
router.delete('/:photoId', authMiddleware, deletePhoto);

module.exports = router;
