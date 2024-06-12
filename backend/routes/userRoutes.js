// routes/userRoutes.js
const express = require('express');
const { getProfile, assignRole } = require('../controllers/userController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

// Profile Route
router.get('/profile', authMiddleware, getProfile);

// Assign Role Route (admin only)
router.post('/assign-role', authMiddleware, roleMiddleware(['admin']), assignRole);

module.exports = router;
