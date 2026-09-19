const express = require('express');
const {
  punchIn,
  punchOut,
  getMyAttendance,
  getTeamAttendance,
  validateAttendance,
} = require('../controllers/attendance.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(protect); // sab routes yahan se neeche protected hain

router.post('/punch-in', authorize('employee'), punchIn);
router.post('/punch-out', authorize('employee'), punchOut);
router.get('/my', authorize('employee'), getMyAttendance);
router.get('/team', authorize('manager', 'admin'), getTeamAttendance);
router.patch('/:id/validate', authorize('manager', 'admin'), validateAttendance);

module.exports = router;