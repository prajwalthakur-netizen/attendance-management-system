const STANDARD_SHIFT_HOURS = 8;

/**
 * Calculates total working hours between punchIn and punchOut times.
 * Returns hours rounded to 2 decimal places.
 */
const calculateWorkingHours = (punchInTime, punchOutTime) => {
  if (!punchInTime || !punchOutTime) return 0;

  const diffMs = new Date(punchOutTime) - new Date(punchInTime);
  const diffHours = diffMs / (1000 * 60 * 60);

  return Math.round(diffHours * 100) / 100;
};

/**
 * Determines attendance status based on total working hours.
 */
const getAttendanceStatus = (totalHours) => {
  return totalHours >= STANDARD_SHIFT_HOURS ? 'Completed' : 'Incomplete';
};

module.exports = {
  calculateWorkingHours,
  getAttendanceStatus,
  STANDARD_SHIFT_HOURS,
};