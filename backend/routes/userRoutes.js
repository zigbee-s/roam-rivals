// routes/userRoutes.js
const express = require('express');
const { addUser } = require('../controllers/userController');
const { validateUserInput } = require('../middlewares/userValidation');
const { idempotencyMiddleware } = require('../middlewares/idempotency');

const router = express.Router();

router.post('/add-user', idempotencyMiddleware, validateUserInput, addUser);

module.exports = router;
