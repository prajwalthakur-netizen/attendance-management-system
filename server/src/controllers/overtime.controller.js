const User = require('../models/User');
const { getIO } = require('../config/socket');
const Overtime = require('../models/Overtime');
const Attendance = require('../models/Attendance');
const logger = require('../utils/logger');

const requestOvertime = async (req, res, next) => {
  try {
    const { date, requestedHours, reason } = req.body;

    if (!date || !requestedHours || !reason) {
      return res.status(400).json({ success: false, message: 'Date, hours and reason are required' });
    }

    const attendance = await Attendance.findOne({ employee: req.user._id, date });
    if (!attendance) {
      return res.status(404).json({ success: false, message: 'No attendance record found for this date' });
    }

    const existing = await Overtime.findOne({ employee: req.user._id, date });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Overtime already requested for this date' });
    }

    const overtime = await Overtime.create({
      employee: req.user._id,
      attendance: attendance._id,
      date,
      requestedHours,
      reason,
    });

    getIO().emit('overtime-updated', { type: 'requested', employeeId: req.user._id });
    

    logger.info(`Overtime requested: ${req.user.email} - ${requestedHours}h on ${date}`);

    res.status(201).json({ success: true, overtime });
  } catch (error) {
    next(error);
  }
};

const getMyOvertime = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const records = await Overtime.find({ employee: req.user._id })
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Overtime.countDocuments({ employee: req.user._id });

    res.status(200).json({ success: true, count: records.length, total, records });
  } catch (error) {
    next(error);
  }
};

const getPendingOvertime = async (req, res, next) => {
  try {
    const { page = 1, limit = 10 } = req.query;
    

    const filter = { status: 'Pending' };

    if (req.user.role === 'manager') {
      const teamMembers = await User.find({ manager: req.user._id }).select('_id');
      filter.employee = { $in: teamMembers.map((u) => u._id) };
    }

    const records = await Overtime.find(filter)
      .populate('employee', 'name email role')
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Overtime.countDocuments(filter);

    res.status(200).json({ success: true, count: records.length, total, records });
  } catch (error) {
    next(error);
  }
};

const reviewOvertime = async (req, res, next) => {
  try {
    const { status, reviewRemarks } = req.body;

    if (!['Approved', 'Rejected'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be Approved or Rejected' });
    }

    const overtime = await Overtime.findById(req.params.id);
    if (!overtime) {
      return res.status(404).json({ success: false, message: 'Overtime request not found' });
    }

    if (overtime.status !== 'Pending') {
      return res.status(400).json({ success: false, message: 'This request has already been reviewed' });
    }

    overtime.status = status;
    overtime.reviewedBy = req.user._id;
    overtime.reviewRemarks = reviewRemarks || '';

    await overtime.save();

    getIO().emit('overtime-updated', { type: 'reviewed', employeeId: overtime.employee });

    logger.info(`Overtime ${overtime._id} ${status} by ${req.user.email}`);

    res.status(200).json({ success: true, overtime });
  } catch (error) {
    next(error);
  }
};

module.exports = { requestOvertime, getMyOvertime, getPendingOvertime, reviewOvertime };