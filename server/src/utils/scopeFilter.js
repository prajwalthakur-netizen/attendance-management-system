const User = require('../models/User');

/**
 * Returns a MongoDB filter object scoping records to what the given user
 * is allowed to see: employees see only their own, managers see their
 * team, admins see everyone (optionally narrowed to one employee).
 */
const getEmployeeScopeFilter = async (user, employeeIdQuery) => {
  const filter = {};

  if (user.role === 'employee') {
    filter.employee = user._id;
  } else if (user.role === 'manager') {
    const teamMembers = await User.find({ manager: user._id }).select('_id');
    filter.employee = { $in: teamMembers.map((m) => m._id) };
    if (employeeIdQuery) filter.employee = employeeIdQuery;
  } else if (user.role === 'admin' && employeeIdQuery) {
    filter.employee = employeeIdQuery;
  }

  return filter;
};

module.exports = { getEmployeeScopeFilter };