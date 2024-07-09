const { S3Client, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const multer = require('multer');
const multerS3 = require('multer-s3');
const { S3_BUCKET_NAME, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } = require('../config/config');

const s3Client = new S3Client({
  region: 'ap-southeast-2', // Change the region as needed
  endpoint: 'https://s3.ap-southeast-2.amazonaws.com', // Replace with your specific endpoint
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

// Configure Multer to use S3 for storage
const upload = multer({
  storage: multerS3({
    s3: s3Client,
    bucket: S3_BUCKET_NAME,
    metadata: (req, file, cb) => {
      cb(null, { fieldName: file.fieldname });
    },
    key: (req, file, cb) => {
      cb(null, Date.now().toString() + '-' + file.originalname);
    }
  })
});

// Function to generate a pre-signed URL
const generateSignedUrl = async (key) => {
  const params = {
    Bucket: S3_BUCKET_NAME,
    Key: key,
  };

  const command = new GetObjectCommand(params);
  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 60 });

  return signedUrl;
};

module.exports = { upload, generateSignedUrl };
