// backend/routes/photoRoutes.js
const express = require('express');
const { uploadPhoto, getAllPhotos, getPhotoById, deletePhoto } = require('../controllers/photoController');
const { authMiddleware } = require('../../../middlewares/authMiddleware');
const multer = require('multer');
const upload = require('../../../middlewares/fileUploadMiddleware');

const router = express.Router();

router.post('/upload', authMiddleware, upload.single('photo'), uploadPhoto);
router.get('/', authMiddleware, getAllPhotos);
router.get('/:photoId', getPhotoById);
router.delete('/:photoId', authMiddleware, deletePhoto);

module.exports = router;
