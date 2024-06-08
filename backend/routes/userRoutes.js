// routes/userRoutes.js
const express = require('express');
const { getProfile } = require('../controllers/userController');
const {authMiddleware} = require('../middlewares/authMiddleware');

const router = express.Router();

// Profile Route
router.get('/profile', authMiddleware, getProfile);
// router.get('/profile', getProfile);

module.exports = router;
