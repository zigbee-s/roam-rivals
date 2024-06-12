// controllers/userController.js
const User = require('../models/userModel');

async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user.userId)
      .select('-password')
      .populate('events');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
}

async function assignRole(req, res) {
  const { userId, role } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ message: 'Invalid role' });
    }

    if (!user.roles.includes(role)) {
      user.roles.push(role);
    }
    await user.save();

    res.status(200).json({ message: 'Role assigned successfully', user });
  } catch (error) {
    res.status(500).json({ message: 'Failed to assign role', error: error.message });
  }
}

module.exports = { getProfile, assignRole };
