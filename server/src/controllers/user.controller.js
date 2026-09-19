const User = require('../models/User');
const logger = require('../utils/logger');

const getAllUsers = async (req, res, next) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;

    const filter = {};
    if (role) filter.role = role;

    const users = await User.find(filter)
      .select('-password')
      .populate('manager', 'name email')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await User.countDocuments(filter);

    res.status(200).json({ success: true, count: users.length, total, users });
  } catch (error) {
    next(error);
  }
};

const getTeamMembers = async (req, res, next) => {
  try {
    const members = await User.find({ manager: req.user._id }).select('-password');
    res.status(200).json({ success: true, count: members.length, members });
  } catch (error) {
    next(error);
  }
};

const updateUserStatus = async (req, res, next) => {
  try {
    const { isActive } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = isActive;
    await user.save();

    logger.info(`User ${user.email} status updated to isActive=${isActive} by ${req.user.email}`);

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

const assignManager = async (req, res, next) => {
  try {
    const { managerId } = req.body;

    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    if (managerId) {
      const manager = await User.findById(managerId);
      if (!manager || manager.role !== 'manager') {
        return res.status(400).json({ success: false, message: 'Invalid manager ID' });
      }
    }

    user.manager = managerId || null;
    await user.save();

    res.status(200).json({ success: true, user });
  } catch (error) {
    next(error);
  }
};

module.exports = { getAllUsers, getTeamMembers, updateUserStatus, assignManager };