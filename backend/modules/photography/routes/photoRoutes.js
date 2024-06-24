// backend/modules/photography/routes/photoRoutes.js
const express = require('express');
const { uploadPhoto, getAllPhotos, selectWinner } = require('../controllers/photoController');
const { authMiddleware } = require('../../../middlewares/authMiddleware');
const roleMiddleware = require('../../../middlewares/roleMiddleware');
const upload = require('../../../middlewares/fileUploadMiddleware'); // Assuming you have a file upload middleware

const router = express.Router();

router.post('/upload', authMiddleware, upload.single('photo'), uploadPhoto);
router.get('/:eventId/photos', authMiddleware, getAllPhotos);
router.post('/select-winner', authMiddleware, roleMiddleware(['admin']), selectWinner);

module.exports = router;
