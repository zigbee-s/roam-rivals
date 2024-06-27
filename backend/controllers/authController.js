// backend/controllers/authController.js
const User = require('../models/userModel');
const OTP = require('../models/otpModel');
const TemporaryToken = require('../models/temporaryTokenModel'); // New model for temporary tokens
const bcrypt = require('bcrypt');
const { generateToken, verifyToken, generateTemporaryToken } = require('../utils/tokenUtils');
const { sendOtpEmail } = require('../utils/emailService');
const { generateOtp } = require('../utils/otpUtils');
const IdempotencyKey = require('../models/idempotencyKeyModel');

// Updated signup function
async function signup(req, res) {
  const { name, username, email, password, confirm_password, age } = req.body;
  const idempotencyKey = req.idempotencyKey;

  if (password !== confirm_password) {
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ message: 'Username already in use' });
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

// Updated login function
async function login(req, res) {
  const { email, password, useOtp } = req.body;
  const idempotencyKey = req.idempotencyKey;
  console.log("Loggin triggered")

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    if (useOtp) {
      console.log('use otp trrigered')
      const otp = generateOtp();
      console.log(email, otp)
      await OTP.create({ email, otp });
      await sendOtpEmail(email, otp);

      const response = { message: 'OTP sent to email. Please verify OTP to complete login.' };

      idempotencyKey.status = 'completed';
      idempotencyKey.response = response;
      await idempotencyKey.save();

      return res.status(200).json(response);
    }

    // Password route
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const { token, refreshToken } = generateToken(user);
    const response = { token, refreshToken };

    idempotencyKey.status = 'completed';
    idempotencyKey.response = response;
    await idempotencyKey.save();

    res.status(200).json(response);
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
}

// Verify OTP function
async function verifyOtp(req, res) {
  const { email, otp } = req.body;

  try {
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    await OTP.deleteOne({ _id: otpRecord._id });

    // const user = new User({ email, password: req.body.password, username: req.body.username, name: req.body.name, age: req.body.age });
    
    const user = new User({
      name: req.body.name,
      username: req.body.username,
      email,
      password: req.body.password,
      age: req.body.age,
      roles: ['user'], // Assign a default role to the new user
    });

    await user.save();

    const { token, refreshToken } = generateToken(user);

    res.status(201).json({ token, refreshToken });
  } catch (error) {
    res.status(500).json({ message: 'OTP verification failed', error: error.message });
  }
}

// Verify OTP for login function
async function verifyOtpForLogin(req, res) {
  const { email, otp } = req.body;
  console.log("Verify otp for login triggred")
  console.log(email, otp)
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

// Verify OTP for forgot password function
async function verifyOtpForForgotPassword(req, res) {
  const { email, otp } = req.body;
  console.log(email, otp);
  try {
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) {
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    await OTP.deleteOne({ _id: otpRecord._id });

    // Generate a temporary token for password reset
    console.log("Generating temporary token");
    const tempToken = generateTemporaryToken({ email });
    console.log("Temporary token generated:", tempToken);
    await TemporaryToken.create({ token: tempToken, email });
    console.log("Temporary token saved to database");

    res.status(200).json({ message: 'OTP verified successfully', tempToken });
  } catch (error) {
    console.error("Error during OTP verification:", error);
    res.status(500).json({ message: 'OTP verification failed', error: error.message });
  }
}

// New forgotPassword function
async function forgotPassword(req, res) {
  const { email } = req.body;
  console.log("forgot password triggered with email: ", email)
  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: 'Email not found' });
    }

    const otp = generateOtp();
    console.log("otp generated: ", otp)
    await OTP.create({ email, otp });
    await sendOtpEmail(email, otp);

    res.status(200).json({ message: 'OTP sent to email. Please use it to reset your password.' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
}

// New resetPassword function
async function resetPassword(req, res) {
  const { tempToken, newPassword } = req.body;

  try {
    const tempTokenRecord = await TemporaryToken.findOne({ token: tempToken });
    if (!tempTokenRecord) {
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const user = await User.findOne({ email: tempTokenRecord.email });
    if (!user) {
      return res.status(400).json({ message: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    // Delete the temporary token after successful password reset
    await TemporaryToken.deleteOne({ _id: tempTokenRecord._id });

    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to reset password', error: error.message });
  }
}

// New refreshToken function
async function refreshToken(req, res) {
  const { token, refreshToken } = req.body;

  try {
    const decoded = verifyToken(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({ message: 'Invalid refresh token' });
    }

    const newTokens = generateToken(user);
    res.status(200).json(newTokens);
  } catch (error) {
    res.status(401).json({ message: 'Token refresh failed', error: error.message });
  }
}

module.exports = { signup, verifyOtp, verifyOtpForLogin, verifyOtpForForgotPassword, login, refreshToken, forgotPassword, resetPassword };
