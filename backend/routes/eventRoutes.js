// backend/routes/eventRoutes.js

const express = require('express');
const { 
  createEvent, 
  generateLogoGIFUploadUrl, 
  getEvents, 
  getEventById, 
  updateEvent, 
  deleteEvent, 
  createOrderForEvent, 
  registerEvent, 
  getEventStatus, 
  checkUserRegistration, 
  completeEvent, 
  handleRazorpayWebhook 
} = require('../controllers/eventController');
const { authMiddleware } = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const createRateLimiter = require('../middlewares/rateLimiter');

const router = express.Router();

const eventLimiter = createRateLimiter(60 * 1000, 10, "Too many requests from this IP, please try again later");

router.post('/generate-upload-url/gif', authMiddleware, generateLogoGIFUploadUrl);
router.post('/', authMiddleware, roleMiddleware(['admin']), eventLimiter, createEvent);
router.get('/', authMiddleware, getEvents);
router.post('/register', authMiddleware, createOrderForEvent);
router.post('/register/verify', authMiddleware, registerEvent);
router.post('/razorpay-webhook', handleRazorpayWebhook);
router.get('/:eventId', getEventById);
router.put('/:eventId', authMiddleware, roleMiddleware(['admin']), eventLimiter, updateEvent);
router.delete('/:eventId', authMiddleware, roleMiddleware(['admin']), eventLimiter, deleteEvent);
router.get('/:eventId/status', authMiddleware, getEventStatus);
router.get('/check-registration/:eventId', authMiddleware, checkUserRegistration);
router.post('/:eventId/complete', authMiddleware, roleMiddleware(['admin']), completeEvent);

module.exports = router;
