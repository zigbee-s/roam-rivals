// File: backend/utils/s3Utils.js

const { S3Client, PutObjectCommand, GetObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const multer = require('multer');
const { S3_BUCKET_NAME, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY } = require('../config/config');
const path = require('path');
const fs = require('fs');

const region = 'ap-southeast-2'; // Change the region as needed
const endpointUrl = `https://s3.${region}.amazonaws.com`;

const s3Client = new S3Client({
  region: region,
  endpoint: endpointUrl,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

// Configure Multer to use local storage first
const upload = multer({ dest: 'uploads/' });

// Function to upload to S3
const uploadToS3 = async (file) => {
  const fileStream = fs.createReadStream(file.path);
  const uploadParams = {
    Bucket: S3_BUCKET_NAME,
    Key: Date.now().toString() + '-' + file.originalname,
    Body: fileStream,
    ContentType: file.mimetype,
  };

  const command = new PutObjectCommand(uploadParams);

  try {
    await s3Client.send(command);
    fs.unlinkSync(file.path); // Delete the file from the local storage after upload
    return `${uploadParams.Key}`;
  } catch (error) {
    console.error('Error uploading to S3:', error);
    throw error;
  }
};

// Function to generate a pre-signed URL
const getPresignedUrl = async (key) => {
  const params = {
    Bucket: S3_BUCKET_NAME,
    Key: key,
  };

  const command = new GetObjectCommand(params);
  const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 3600 }); // URL valid for 1 hour

  return signedUrl;
};

module.exports = { uploadToS3, getPresignedUrl };
