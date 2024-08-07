// backend/controllers/authController.js
const User = require('../models/userModel');
const OTP = require('../models/otpModel');
const TemporaryToken = require('../models/temporaryTokenModel');
const bcrypt = require('bcrypt');
const { generateToken, verifyToken, generateTemporaryToken, verifyRefreshToken } = require('../utils/tokenUtils');
const { sendOtpEmail } = require('../utils/emailService');
const { generateOtp } = require('../utils/otpUtils');
const IdempotencyKey = require('../models/idempotencyKeyModel');
const logger = require('../logger');

// Updated signup function
async function initialSignup(req, res) {
  const { name, username, email, age } = req.body;

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.warn(`Signup attempt with existing email: ${email}`);
      return res.status(400).json({ message: 'Email already in use' });
    }

    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      logger.warn(`Signup attempt with existing username: ${username}`);
      return res.status(400).json({ message: 'Username already in use' });
    }

    const otp = generateOtp();
    await OTP.create({ email, otp });
    await sendOtpEmail(email, otp);

    const response = { message: 'OTP sent to email. Please verify OTP to continue signup.' };

    logger.info(`Signup OTP sent to email: ${email}`);
    res.status(201).json(response);
  } catch (error) {
    logger.error('Signup failed', error);
    res.status(500).json({ message: 'Signup failed', error: error.message });
  }
}

// Complete signup after OTP verification
async function completeSignup(req, res) {
  const { email, password, confirm_password, name, username, age } = req.body;

  if (password !== confirm_password) {
    logger.warn('Signup attempt with non-matching passwords');
    return res.status(400).json({ message: 'Passwords do not match' });
  }

  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      logger.warn(`Signup attempt with existing email: ${email}`);
      return res.status(400).json({ message: 'Email already in use' });
    }

    const user = new User({
      name,
      username,
      email,
      password,
      age,
      roles: ['user'], // Assign a default role to the new user
    });

    await user.save();

    const { token, refreshToken } = generateToken(user);

    logger.info(`User signed up with email: ${email}`);
    res.status(201).json({ token, refreshToken });
  } catch (error) {
    logger.error('Signup completion failed', error);
    res.status(500).json({ message: 'Signup completion failed', error: error.message });
  }
}


// Updated login function
async function login(req, res) {
  const { email, password, useOtp } = req.body;
  const idempotencyKey = req.idempotencyKey;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn(`Login attempt with invalid email: ${email}`);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    if (useOtp) {
      if (!email) {
        logger.warn('Email is required for OTP login');
        return res.status(400).json({ message: 'Email is required for OTP login' });
      }
      const otp = generateOtp();
      await OTP.create({ email, otp });
      await sendOtpEmail(email, otp);

      const response = { message: 'OTP sent to email. Please verify OTP to complete login.' };

      idempotencyKey.status = 'completed';
      idempotencyKey.response = response;
      await idempotencyKey.save();

      logger.info(`Login OTP sent to email: ${email}`);
      return res.status(200).json(response);
    }

    if (!password) {
      logger.warn('Password is required for password login');
      return res.status(400).json({ message: 'Password is required for password login' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      logger.warn(`Login attempt with invalid password for email: ${email}`);
      return res.status(400).json({ message: 'Invalid email or password' });
    }

    const { token, refreshToken } = generateToken(user);
    const response = { token, refreshToken };

    idempotencyKey.status = 'completed';
    idempotencyKey.response = response;
    await idempotencyKey.save();

    logger.info(`User logged in: ${email}`);
    res.status(200).json(response);
  } catch (error) {
    logger.error('Login failed', error);
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
}


// Verify OTP function
async function verifyOtp(req, res) {
  const { email, otp } = req.body;

  try {
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) {
      logger.warn(`Invalid or expired OTP for email: ${email}`);
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    await OTP.deleteOne({ _id: otpRecord._id });

    logger.info(`OTP verified and deleted for email: ${email}`);
    res.status(200).json({ message: 'OTP verified successfully' });
  } catch (error) {
    logger.error('OTP verification failed', error);
    res.status(500).json({ message: 'OTP verification failed', error: error.message });
  }
}

// Set password function
// async function completeSignup(req, res) {
//   const { email, password, confirm_password, name, username, age } = req.body;

//   if (password !== confirm_password) {
//     logger.warn('Password setup attempt with non-matching passwords');
//     return res.status(400).json({ message: 'Passwords do not match' });
//   }

//   try {
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       logger.warn(`Password setup attempt with existing email: ${email}`);
//       return res.status(400).json({ message: 'Email already in use' });
//     }

//     const user = new User({
//       name,
//       username,
//       email,
//       password,
//       age,
//       roles: ['user'], // Assign a default role to the new user
//     });

//     await user.save();

//     const { token, refreshToken } = generateToken(user);

//     logger.info(`User password set for email: ${email}`);
//     res.status(201).json({ token, refreshToken });
//   } catch (error) {
//     logger.error('Password setup failed', error);
//     res.status(500).json({ message: 'Password setup failed', error: error.message });
//   }
// }


// Verify OTP for login function
async function verifyOtpForLogin(req, res) {
  const { email, otp } = req.body;

  try {
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) {
      logger.warn(`Invalid or expired OTP for login with email: ${email}`);
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    await OTP.deleteOne({ _id: otpRecord._id });

    const user = await User.findOne({ email });
    if (!user) {
      logger.warn(`User not found for login with email: ${email}`);
      return res.status(400).json({ message: 'User not found' });
    }

    const { token, refreshToken } = generateToken(user);

    logger.info(`User logged in with OTP: ${email}`);
    res.status(200).json({ token, refreshToken });
  } catch (error) {
    logger.error('OTP verification for login failed', error);
    res.status(500).json({ message: 'OTP verification failed', error: error.message });
  }
}

// Verify OTP for forgot password function
async function verifyOtpForForgotPassword(req, res) {
  const { email, otp } = req.body;

  try {
    const otpRecord = await OTP.findOne({ email, otp });
    if (!otpRecord) {
      logger.warn(`Invalid or expired OTP for forgot password with email: ${email}`);
      return res.status(400).json({ message: 'Invalid or expired OTP' });
    }

    await OTP.deleteOne({ _id: otpRecord._id });

    const tempToken = generateTemporaryToken({ email });
    await TemporaryToken.create({ token: tempToken, email });

    logger.info(`OTP verified for forgot password: ${email}`);
    res.status(200).json({ message: 'OTP verified successfully', tempToken });
  } catch (error) {
    logger.error('OTP verification for forgot password failed', error);
    res.status(500).json({ message: 'OTP verification failed', error: error.message });
  }
}


// New forgotPassword function
async function forgotPassword(req, res) {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      logger.warn(`Forgot password attempt with non-existent email: ${email}`);
      return res.status(400).json({ message: 'Email not found' });
    }

    const otp = generateOtp();
    await OTP.create({ email, otp });
    await sendOtpEmail(email, otp);

    logger.info(`Forgot password OTP sent to email: ${email}`);
    res.status(200).json({ message: 'OTP sent to email. Please use it to reset your password.' });
  } catch (error) {
    logger.error('Failed to send OTP for forgot password', error);
    res.status(500).json({ message: 'Failed to send OTP', error: error.message });
  }
}

// New resetPassword function
async function resetPassword(req, res) {
  const { tempToken, newPassword } = req.body;

  try {
    const tempTokenRecord = await TemporaryToken.findOne({ token: tempToken });
    if (!tempTokenRecord) {
      logger.warn(`Invalid or expired temporary token for password reset`);
      return res.status(400).json({ message: 'Invalid or expired token' });
    }

    const user = await User.findOne({ email: tempTokenRecord.email });
    if (!user) {
      logger.warn(`User not found for password reset with email: ${tempTokenRecord.email}`);
      return res.status(400).json({ message: 'User not found' });
    }

    user.password = newPassword;
    await user.save();

    await TemporaryToken.deleteOne({ _id: tempTokenRecord._id });

    logger.info(`Password reset successfully for email: ${tempTokenRecord.email}`);
    res.status(200).json({ message: 'Password reset successfully' });
  } catch (error) {
    logger.error('Failed to reset password', error);
    res.status(500).json({ message: 'Failed to reset password', error: error.message });
  }
}

// New refreshToken function
async function refreshToken(req, res) {
  const { refreshToken } = req.body;
  try {
    const user = await verifyRefreshToken(refreshToken);
    const newTokens = generateToken(user);
    logger.info('Refresh token generated');
    return res.status(200).json(newTokens);
  } catch (error) {
    logger.error('Token refresh failed', error);
    return res.status(401).json({ message: error.message });
  }
}

module.exports = { initialSignup, completeSignup, verifyOtp, verifyOtpForLogin, verifyOtpForForgotPassword, login, refreshToken, forgotPassword, resetPassword };
