const { getEmployeeScopeFilter } = require('../utils/scopeFilter');
const { getIO } = require('../config/socket');
const Attendance = require('../models/Attendance');
const imagekit = require('../config/imagekit');
const { calculateWorkingHours, getAttendanceStatus } = require('../utils/calculateHours');
const logger = require('../utils/logger');

// Helper: get today's date as 'YYYY-MM-DD'
const getTodayDate = () => new Date().toISOString().split('T')[0];

// Helper: upload base64 selfie to ImageKit
const uploadSelfie = async (base64Image, employeeId, type) => {
  const result = await imagekit.upload({
    file: base64Image, // base64 string from frontend camera capture
    fileName: `${employeeId}_${type}_${Date.now()}.jpg`,
    folder: '/attendance-selfies',
  });
  return result.url;
};

// @desc   Punch In
// @route  POST /api/attendance/punch-in
// @access Private (Employee)
const punchIn = async (req, res, next) => {
  try {
    const { selfie, latitude, longitude } = req.body;

    if (!selfie || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ success: false, message: 'Selfie and location are required' });
    }

    const today = getTodayDate();

    const existing = await Attendance.findOne({ employee: req.user._id, date: today });
    if (existing && existing.punchIn?.time) {
      return res.status(400).json({ success: false, message: 'Already punched in today' });
    }

    const selfieUrl = await uploadSelfie(selfie, req.user._id, 'punchin');

    const attendance =
      existing ||
      new Attendance({
        employee: req.user._id,
        date: today,
      });

    attendance.punchIn = {
      time: new Date(),
      selfieUrl,
      location: { latitude, longitude },
    };

    await attendance.save();

    getIO().emit('attendance-updated', { type: 'punch-in', employeeId: req.user._id });

    logger.info(`Punch-in: ${req.user.email} at ${attendance.punchIn.time}`);

    res.status(200).json({ success: true, attendance });
  } catch (error) {
    next(error);
  }
};

// @desc   Punch Out
// @route  POST /api/attendance/punch-out
// @access Private (Employee)
const punchOut = async (req, res, next) => {
  try {
    const { selfie, latitude, longitude } = req.body;

    if (!selfie || latitude === undefined || longitude === undefined) {
      return res.status(400).json({ success: false, message: 'Selfie and location are required' });
    }

    const today = getTodayDate();

    const attendance = await Attendance.findOne({ employee: req.user._id, date: today });

    if (!attendance || !attendance.punchIn?.time) {
      return res.status(400).json({ success: false, message: 'You must punch in first' });
    }

    if (attendance.punchOut?.time) {
      return res.status(400).json({ success: false, message: 'Already punched out today' });
    }

    const selfieUrl = await uploadSelfie(selfie, req.user._id, 'punchout');
    const punchOutTime = new Date();

    attendance.punchOut = {
      time: punchOutTime,
      selfieUrl,
      location: { latitude, longitude },
    };

    const totalHours = calculateWorkingHours(attendance.punchIn.time, punchOutTime);
    attendance.totalWorkingHours = totalHours;
    attendance.status = getAttendanceStatus(totalHours);

    await attendance.save();

    getIO().emit('attendance-updated', { type: 'punch-out', employeeId: req.user._id });

    logger.info(`Punch-out: ${req.user.email}, hours: ${totalHours}`);

    res.status(200).json({ success: true, attendance });
  } catch (error) {
    next(error);
  }
};

// @desc   Get logged-in employee's own attendance history
// @route  GET /api/attendance/my
// @access Private (Employee)
const getMyAttendance = async (req, res, next) => {
  try {
    const { from, to, page = 1, limit = 10 } = req.query;

    const filter = { employee: req.user._id };
    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = from;
      if (to) filter.date.$lte = to;
    }

    const records = await Attendance.find(filter)
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Attendance.countDocuments(filter);

    res.status(200).json({ success: true, count: records.length, total, records });
  } catch (error) {
    next(error);
  }
};

// @desc   Get team attendance (Manager) or all attendance (Admin)
// @route  GET /api/attendance/team
// @access Private (Manager, Admin)
const getTeamAttendance = async (req, res, next) => {
  try {
    const { from, to, employeeId, page = 1, limit = 10 } = req.query;

    const filter = await getEmployeeScopeFilter(req.user, employeeId);

    if (from || to) {
      filter.date = {};
      if (from) filter.date.$gte = from;
      if (to) filter.date.$lte = to;
    }

    const records = await Attendance.find(filter)
      .populate('employee', 'name email role')
      .sort({ date: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Attendance.countDocuments(filter);

    res.status(200).json({ success: true, count: records.length, total, records });
  } catch (error) {
    next(error);
  }
};

// @desc   Validate attendance (mark selfie/record as Valid or Invalid)
// @route  PATCH /api/attendance/:id/validate
// @access Private (Manager, Admin)
const validateAttendance = async (req, res, next) => {
  try {
    const { status, remarks } = req.body; // status: 'Valid' | 'Invalid'

    if (!['Valid', 'Invalid'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Status must be Valid or Invalid' });
    }

    const attendance = await Attendance.findById(req.params.id);
    if (!attendance) {
      return res.status(404).json({ success: false, message: 'Attendance record not found' });
    }

    attendance.validation = {
      status,
      verifiedBy: req.user._id,
      remarks: remarks || '',
    };

    await attendance.save();
    getIO().emit('attendance-updated', { type: 'validation', employeeId: attendance.employee });

    logger.info(`Attendance ${attendance._id} marked ${status} by ${req.user.email}`);

    res.status(200).json({ success: true, attendance });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  punchIn,
  punchOut,
  getMyAttendance,
  getTeamAttendance,
  validateAttendance,
};