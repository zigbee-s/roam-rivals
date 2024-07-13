// File: backend/middleware/uploadMiddleware.js
const multer = require('multer');
const path = require('path');

// Configure Multer to use local storage first
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

module.exports = upload;
