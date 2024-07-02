// backend/routes/eventRoutes.js
const express = require('express');
const { createEvent, getEvents, getEventById, updateEvent, deleteEvent, registerEvent } = require('../controllers/eventController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const createRateLimiter = require('../middlewares/rateLimiter');

const router = express.Router();

const eventLimiter = createRateLimiter(60 * 1000, 10, "Too many requests from this IP, please try again later");

router.post('/', authMiddleware, roleMiddleware(['admin']), eventLimiter, createEvent);
router.get('/', authMiddleware, getEvents);
router.post('/register', authMiddleware, registerEvent);
router.get('/:eventId', getEventById);
router.put('/:eventId', authMiddleware, roleMiddleware(['admin']), eventLimiter, updateEvent);
router.delete('/:eventId', authMiddleware, roleMiddleware(['admin']), eventLimiter, deleteEvent);

module.exports = router;