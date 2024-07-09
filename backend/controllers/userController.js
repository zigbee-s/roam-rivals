// backend/controllers/userController.js
const User = require('../models/userModel');
const logger = require('../logger');

async function getProfile(req, res) {
  try {
    const user = await User.findById(req.user.userId)
      .select('-password')
      .populate('events');
    if (!user) {
      logger.warn(`User profile not found: ${req.user.userId}`);
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json(user);
  } catch (error) {
    logger.error('Failed to fetch profile', error);
    res.status(500).json({ message: 'Failed to fetch profile', error: error.message });
  }
}

async function assignRole(req, res) {
  const { userId, role } = req.body;
  try {
    const user = await User.findById(userId);
    if (!user) {
      logger.warn(`User not found for role assignment: ${userId}`);
      return res.status(404).json({ message: 'User not found' });
    }

    if (!['user', 'admin'].includes(role)) {
      logger.warn(`Invalid role assignment attempt: ${role}`);
      return res.status(400).json({ message: 'Invalid role' });
    }

    if (!user.roles.includes(role)) {
      user.roles.push(role);
    }
    await user.save();

    logger.info(`Role assigned: ${role} to user: ${userId}`);
    res.status(200).json({ message: 'Role assigned successfully', user });
  } catch (error) {
    logger.error('Failed to assign role', error);
    res.status(500).json({ message: 'Failed to assign role', error: error.message });
  }
}


async function updateSkills(req, res) {
  const { skills } = req.body;
  try {
    const user = await User.findById(req.user.userId);
    if (!user) {
      logger.warn(`User not found for updating skills: ${req.user.userId}`);
      return res.status(404).json({ message: 'User not found' });
    }

    user.skills = skills;
    await user.save();

    logger.info(`Skills updated for user: ${req.user.userId}`);
    res.status(200).json({ message: 'Skills updated successfully', skills: user.skills });
  } catch (error) {
    logger.error('Failed to update skills', error);
    res.status(500).json({ message: 'Failed to update skills', error: error.message });
  }
}

async function getSkills(req, res) {
  try {
    const user = await User.findById(req.user.userId).select('skills');
    if (!user) {
      logger.warn(`User not found for fetching skills: ${req.user.userId}`);
      return res.status(404).json({ message: 'User not found' });
    }
    res.status(200).json({ skills: user.skills });
  } catch (error) {
    logger.error('Failed to fetch skills', error);
    res.status(500).json({ message: 'Failed to fetch skills', error: error.message });
  }
}


module.exports = { getProfile, assignRole, updateSkills, getSkills };
