// backend/config/config.js
require('dotenv').config();

const schoolDomains = [
  'school.edu',
  'college.edu',
  'university.edu',
  'gmail.com'
];

module.exports = {
  PORT: process.env.PORT || 3000,
  MONGODB_URI: process.env.MONGODB_URI,
  JWT_SECRET: process.env.JWT_SECRET,
  REFRESH_TOKEN_SECRET: process.env.REFRESH_TOKEN_SECRET,
  SCHOOL_DOMAINS: schoolDomains,
  TEMPORARY_TOKEN_SECRET: process.env.TEMPORARY_TOKEN_SECRET,
  AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
  AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
  AWS_REGION: process.env.AWS_REGION || 'ap-southeast-2',
  S3_BUCKET_NAME: process.env.S3_BUCKET_NAME,
  razorpayKeyId: process.env.RAZORPAY_KEY_ID,
  razorpayKeySecret: process.env.RAZORPAY_KEY_SECRET,
  razorpayWebhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET
};
