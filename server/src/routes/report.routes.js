const express = require('express');
const { getDailyReport } = require('../controllers/report.controller');
const { protect } = require('../middlewares/auth.middleware');

const router = express.Router();

router.get('/daily', protect, getDailyReport);

module.exports = router;