const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
    createDailyTask,
    getDailyTasks,
    getTasksInRange,
    getDailyTask,
    updateDailyTask,
    toggleTaskCompletion,
    completeTask,
    deleteDailyTask,
    getTaskStats
} = require('../controllers/dailyTaskController');

const router = express.Router();

/**
 * POST /api/daily-tasks
 * Create a new daily task
 */
router.post('/', protect, createDailyTask);

/**
 * GET /api/daily-tasks
 * Get daily tasks for a specific date
 * Query params: date (YYYY-MM-DD), status (all/pending/completed)
 */
router.get('/', protect, getDailyTasks);

/**
 * GET /api/daily-tasks/range
 * Get tasks for a date range
 * Query params: startDate, endDate (YYYY-MM-DD)
 */
router.get('/range', protect, getTasksInRange);

/**
 * GET /api/daily-tasks/stats
 * Get task statistics and analytics
 * Query params: startDate, endDate, aggregateBy
 */
router.get('/stats', protect, getTaskStats);

/**
 * GET /api/daily-tasks/:taskId
 * Get a specific daily task
 */
router.get('/:taskId', protect, getDailyTask);

/**
 * PUT /api/daily-tasks/:taskId
 * Update a daily task
 */
router.put('/:taskId', protect, updateDailyTask);

/**
 * PATCH /api/daily-tasks/:taskId/toggle
 * Toggle task completion status
 */
router.patch('/:taskId/toggle', protect, toggleTaskCompletion);

/**
 * PATCH /api/daily-tasks/:taskId/complete
 * Mark task as completed
 */
router.patch('/:taskId/complete', protect, completeTask);

/**
 * DELETE /api/daily-tasks/:taskId
 * Delete a daily task
 */
router.delete('/:taskId', protect, deleteDailyTask);

module.exports = router;
