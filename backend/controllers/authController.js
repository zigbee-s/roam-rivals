// backend/controllers/authController.js
const User = require('../models/userModel');
const OTP = require('../models/otpModel');
const bcrypt = require('bcrypt');
const { generateToken, verifyToken } = require('../utils/tokenUtils');
const { sendOtpEmail } = require('../utils/emailService');
const { generateOtp } = require('../utils/otpUtils');
const IdempotencyKey = require('../models/idempotencyKeyModel');

async function signup(req, res) {
  const { name, email, password } = req.body;
  const idempotencyKey = req.idempotencyKey;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const otp = generateOtp();
    await OTP.create({ email, otp });
    await sendOtpEmail(email, otp);

    const response = { message: 'OTP sent to email. Please verify OTP to complete signup.' };

    idempotencyKey.status = 'completed';
    idempotencyKey.response = response;
    await idempotencyKey.save();

    res.status(201).json(response);
  } catch (error) {
    res.status(500).json({ message: 'Signup failed', error: error.message });
  }
}

async function verifyOtp(req, res) {
  const { name, email, password, otp } = req.body;
  const idempotencyKey = req.idempotencyKey;

  try {
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    await OTP.deleteOne({ _id: otpRecord._id });

    const user = new User({ name, email, password, roles: ['user'] });
    await user.save();

    const { token, refreshToken } = generateToken(user);
    const response = { token, refreshToken };

    idempotencyKey.status = 'completed';
    idempotencyKey.response = response;
    await idempotencyKey.save();

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: 'OTP verification failed', error: error.message });
  }
}

async function login(req, res) {
  const { email, password } = req.body;
  const idempotencyKey = req.idempotencyKey;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const otp = generateOtp();
    await OTP.create({ email, otp });
    await sendOtpEmail(email, otp);

    const response = { message: 'OTP sent to email. Please verify OTP to complete login.' };

    idempotencyKey.status = 'completed';
    idempotencyKey.response = response;
    await idempotencyKey.save();

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
}

async function verifyOtpForLogin(req, res) {
  const { email, otp } = req.body;
  const idempotencyKey = req.idempotencyKey;

  try {
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    await OTP.deleteOne({ _id: otpRecord._id });

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    const { token, refreshToken } = generateToken(user);
    const response = { token, refreshToken };

    idempotencyKey.status = 'completed';
    idempotencyKey.response = response;
    await idempotencyKey.save();

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: 'OTP verification failed', error: error.message });
  }
}

async function refreshToken(req, res) {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: 'Refresh token not provided' });

  try {
    const decoded = verifyToken(refreshToken, REFRESH_TOKEN_SECRET);
    const newTokens = generateToken(decoded);
    res.status(200).json(newTokens);
  } catch (error) {
    res.status(403).json({ message: 'Invalid refresh token', error: error.message });
  }
}

module.exports = { signup, verifyOtp, verifyOtpForLogin, login, refreshToken };
