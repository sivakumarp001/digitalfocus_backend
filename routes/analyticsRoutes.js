const express = require('express');
const router = express.Router();
const { getWeeklyAnalytics, getMonthlyAnalytics, getSummary } = require('../controllers/analyticsController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/weekly', getWeeklyAnalytics);
router.get('/monthly', getMonthlyAnalytics);
router.get('/summary', getSummary);

module.exports = router;
