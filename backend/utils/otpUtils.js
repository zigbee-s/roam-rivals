// backend/utils/otpUtils.js
const crypto = require('crypto');

function generateOtp() {
  // Generate a random 4-digit OTP
  const otp = Math.floor(1000 + Math.random() * 9000).toString();
  return otp;
}

module.exports = { generateOtp };
