const express = require('express');
const {
  requestOvertime,
  getMyOvertime,
  getPendingOvertime,
  reviewOvertime,
} = require('../controllers/overtime.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(protect);

router.post('/', authorize('employee'), requestOvertime);
router.get('/my', authorize('employee'), getMyOvertime);
router.get('/pending', authorize('manager', 'admin'), getPendingOvertime);
router.patch('/:id/review', authorize('manager', 'admin'), reviewOvertime);

module.exports = router;