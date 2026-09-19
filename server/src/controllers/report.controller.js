const Attendance = require('../models/Attendance');
const { getEmployeeScopeFilter } = require('../utils/scopeFilter');

const getDailyReport = async (req, res, next) => {
  try {
    const { date, employeeId, page = 1, limit = 20 } = req.query;

    if (!date) {
      return res.status(400).json({ success: false, message: 'Date is required (YYYY-MM-DD)' });
    }

    const filter = await getEmployeeScopeFilter(req.user, employeeId);
    filter.date = date;

    const records = await Attendance.find(filter)
      .populate('employee', 'name email role')
      .sort({ 'punchIn.time': 1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Attendance.countDocuments(filter);

    const report = records.map((r) => ({
      id: r._id,
      name: r.employee?.name,
      email: r.employee?.email,
      punchInTime: r.punchIn?.time || null,
      punchOutTime: r.punchOut?.time || null,
      punchInSelfie: r.punchIn?.selfieUrl || null,
      punchOutSelfie: r.punchOut?.selfieUrl || null,
      location: r.punchIn?.location || null,
      totalWorkingHours: r.totalWorkingHours,
      status: r.status,
      validationStatus: r.validation?.status,
    }));

    res.status(200).json({ success: true, count: report.length, total, date, report });
  } catch (error) {
    next(error);
  }
};

module.exports = { getDailyReport };