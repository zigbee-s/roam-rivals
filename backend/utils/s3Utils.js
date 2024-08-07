const { S3Client, GetObjectCommand, PutObjectCommand } = require("@aws-sdk/client-s3");
const { getSignedUrl } = require("@aws-sdk/s3-request-presigner");
const { S3_BUCKET_NAME, AWS_ACCESS_KEY_ID, AWS_SECRET_ACCESS_KEY, AWS_REGION } = require('../config/config');

const s3Client = new S3Client({
  region: AWS_REGION,
  credentials: {
    accessKeyId: AWS_ACCESS_KEY_ID,
    secretAccessKey: AWS_SECRET_ACCESS_KEY,
  },
});

/**
 * Generates a pre-signed URL for a given S3 object key
 * @param {string} key - The S3 object key
 * @param {number} [expiresIn=3600] - Expiration time in seconds (default 1 hour)
 * @returns {Promise<string>} - Pre-signed URL
 */
const getPresignedUrl = async (key, expiresIn = 3600) => {
  const params = {
    Bucket: S3_BUCKET_NAME,
    Key: key,
  };

  const command = new GetObjectCommand(params);

  try {
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    throw new Error('Error generating pre-signed URL');
  }
};

/**
 * Generates a pre-signed URL for uploading an S3 object
 * @param {string} key - The S3 object key
 * @param {number} [expiresIn=3600] - Expiration time in seconds (default 1 hour)
 * @param {Object} metadata - Additional metadata to be added to the S3 object
 * @returns {Promise<string>} - Pre-signed URL
 */
const getUploadPresignedUrl = async (key, expiresIn = 3600, metadata = {}) => {
  const params = {
    Bucket: S3_BUCKET_NAME,
    Key: key,
    ContentType: 'image/jpeg', // Or the specific content type you expect
    Metadata: metadata // Add custom metadata here
  };

  const command = new PutObjectCommand(params);

  try {
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error('Error generating pre-signed URL:', error);
    throw new Error('Error generating pre-signed URL');
  }
};

/**
 * Generates a pre-signed URL for uploading a GIF to S3
 * @param {string} key - The S3 object key
 * @param {number} [expiresIn=3600] - Expiration time in seconds (default 1 hour)
 * @param {Object} metadata - Additional metadata to be added to the S3 object
 * @returns {Promise<string>} - Pre-signed URL
 */
const getUploadGIFPresignedUrl = async (key, expiresIn = 3600, metadata = {}) => {
  const params = {
    Bucket: S3_BUCKET_NAME,
    Key: key,
    ContentType: 'image/gif', // Ensure the correct MIME type for GIF
    Metadata: metadata // Add custom metadata here
  };

  const command = new PutObjectCommand(params);

  try {
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn });
    return signedUrl;
  } catch (error) {
    console.error('Error generating pre-signed URL for GIF:', error);
    throw new Error('Error generating pre-signed URL for GIF');
  }
};

module.exports = { getPresignedUrl, getUploadPresignedUrl, getUploadGIFPresignedUrl };
