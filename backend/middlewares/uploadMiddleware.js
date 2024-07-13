const multer = require('multer');
const path = require('path');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    console.log('Uploading to destination:', 'uploads/'); // Debug log
    cb(null, 'uploads/');
  },
  filename: function (req, file, cb) {
    const filename = Date.now() + '-' + file.originalname;
    console.log('Filename:', filename); // Debug log
    cb(null, filename);
  }
});

const upload = multer({ storage: storage });

module.exports = upload;
