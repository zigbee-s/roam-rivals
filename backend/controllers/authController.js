const User = require('../models/userModel');
const OTP = require('../models/otpModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { JWT_SECRET, REFRESH_TOKEN_SECRET } = require('../config/config');
const { sendOtpEmail } = require('../utils/emailService');
const { generateOtp } = require('../utils/otpUtils');

function generateToken(user) {
  const token = jwt.sign({ userId: user._id, email: user.email, roles: user.roles }, JWT_SECRET, { expiresIn: '1h' });
  const refreshToken = jwt.sign({ userId: user._id, email: user.email, roles: user.roles }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
  return { token, refreshToken };
}

async function signup(req, res) {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const otp = generateOtp();
    await OTP.create({ email, otp });

    await sendOtpEmail(email, otp);

    res.status(201).json({ message: 'OTP sent to email. Please verify OTP to complete signup.' });
  } catch (error) {
    res.status(500).json({ message: 'Signup failed', error: error.message });
  }
}

async function verifyOtp(req, res) {
  const { name, email, password, otp } = req.body;
  try {
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    await OTP.deleteOne({ _id: otpRecord._id });

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = new User({ name, email, password: hashedPassword, roles: ['user'] });
    await user.save();

    const { token, refreshToken } = generateToken(user);
    res.status(200).json({ token, refreshToken });
  } catch (error) {
    res.status(500).json({ message: 'OTP verification failed', error: error.message });
  }
}

async function login(req, res) {
  const { email, password } = req.body;
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

    res.status(200).json({ message: 'OTP sent to email. Please verify OTP to complete login.' });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
}

async function verifyOtpForLogin(req, res) {
  const { email, otp } = req.body;
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
    res.status(200).json({ token, refreshToken });
  } catch (error) {
    res.status(500).json({ message: 'OTP verification failed', error: error.message });
  }
}

async function refreshToken(req, res) {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: 'Refresh token not provided' });

  jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) return res.status(403).json({ message: 'Invalid refresh token' });

    const newToken = jwt.sign({ userId: user.userId, email: user.email, roles: user.roles }, JWT_SECRET, { expiresIn: '1h' });
    const newRefreshToken = jwt.sign({ userId: user.userId, email: user.email, roles: user.roles }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    res.status(200).json({ token: newToken, refreshToken: newRefreshToken });
  });
}

module.exports = { signup, verifyOtp, verifyOtpForLogin, login, refreshToken };
