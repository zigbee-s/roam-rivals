const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { JWT_SECRET, REFRESH_TOKEN_SECRET } = require('../config/config');

function generateToken(user) {
  const token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '1m' });
  const refreshToken = jwt.sign({ userId: user._id, email: user.email }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
  return { token, refreshToken };
}

async function signup(req, res) {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const user = new User({ name, email, password });
    await user.save();

    const { token, refreshToken } = generateToken(user);
    res.status(201).json({ token, refreshToken });
  } catch (error) {
    res.status(500).json({ message: 'Signup failed', error: error.message });
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

    const { token, refreshToken } = generateToken(user);
    res.status(200).json({ token, refreshToken });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
}

async function refreshToken(req, res) {
  const { refreshToken } = req.body;
  if (!refreshToken) return res.status(401).json({ message: 'Refresh token not provided', code: 'NO_REFRESH_TOKEN' });

  jwt.verify(refreshToken, REFRESH_TOKEN_SECRET, (err, user) => {
    if (err) {
      const isExpired = err.name === 'TokenExpiredError';
      return res.status(403).json({ 
        message: isExpired ? 'Refresh token expired' : 'Invalid refresh token', 
        code: isExpired ? 'REFRESH_TOKEN_EXPIRED' : 'INVALID_REFRESH_TOKEN' 
      });
    }

    const newToken = jwt.sign({ userId: user.userId, email: user.email }, JWT_SECRET, { expiresIn: '1m' });
    const newRefreshToken = jwt.sign({ userId: user.userId, email: user.email }, REFRESH_TOKEN_SECRET, { expiresIn: '7d' });
    res.status(200).json({ token: newToken, refreshToken: newRefreshToken });
  });
}

module.exports = { signup, login, refreshToken };
