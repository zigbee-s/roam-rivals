// controllers/userController.js
const User = require('../models/userModel');

// Profile Controller
async function getProfile(req, res) {
  console.log(req.user)
  try {
    const user = await User.findById(req.user.userId).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
}

module.exports = { getProfile };
