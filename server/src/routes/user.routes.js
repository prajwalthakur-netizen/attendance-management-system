const express = require('express');
const {
  getAllUsers,
  getTeamMembers,
  updateUserStatus,
  assignManager,
} = require('../controllers/user.controller');
const { protect } = require('../middlewares/auth.middleware');
const { authorize } = require('../middlewares/role.middleware');

const router = express.Router();

router.use(protect);

router.get('/', authorize('admin'), getAllUsers);
router.get('/my-team', authorize('manager'), getTeamMembers);
router.patch('/:id/status', authorize('admin'), updateUserStatus);
router.patch('/:id/assign-manager', authorize('admin'), assignManager);

module.exports = router;