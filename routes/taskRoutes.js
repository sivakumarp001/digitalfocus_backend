const express = require('express');
const router = express.Router();
const { getTasks, createTask, updateTask, deleteTask, getTodayTasks } = require('../controllers/taskController');
const { protect } = require('../middleware/authMiddleware');

router.use(protect);
router.get('/today', getTodayTasks);
router.route('/').get(getTasks).post(createTask);
router.route('/:id').put(updateTask).delete(deleteTask);

module.exports = router;
