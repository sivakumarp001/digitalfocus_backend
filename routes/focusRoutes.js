const express = require('express');
const router = express.Router();
const { startSession, endSession, addDistraction, getHistory } = require('../controllers/focusController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.post('/start', startSession);
router.get('/history', getHistory);
router.put('/:id/end', endSession);
router.post('/:id/distraction', addDistraction);

module.exports = router;
