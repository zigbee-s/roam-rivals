// controllers/authController.js
const User = require('../models/userModel');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { JWT_SECRET } = require('../config/config');

// Generate JWT Token
function generateToken(user) {
  token = jwt.sign({ userId: user._id, email: user.email }, JWT_SECRET, { expiresIn: '11h' });
  return token
}

// Signup Controller
async function signup(req, res) {
  const { name, email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: 'Email already in use' });
    }

    const user = new User({ name, email, password });
    await user.save();
    console.log("User saved: ", name, email)

    const token = generateToken(user);
    console.log(token)
    res.status(201).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Signup failed', error: error.message });
  }
}

// Login Controller
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

    const token = generateToken(user);
    console.log(token)
    res.status(200).json({ token });
  } catch (error) {
    res.status(500).json({ message: 'Login failed', error: error.message });
  }
}

module.exports = { signup, login };
