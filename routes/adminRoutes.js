const express = require('express');
const router = express.Router();
const { getAllUsers, getUserDetail, getStudentTasks, assignQuizToTask, deleteUser, getReports, getLeaderboard, getRetestRequests, approveRetest, rejectRetest } = require('../controllers/adminController');
const { protect, adminOnly } = require('../middleware/authMiddleware');

router.use(protect, adminOnly);
router.get('/users', getAllUsers);
router.get('/users/:id', getUserDetail);
router.get('/users/:id/tasks', getStudentTasks);
router.post('/tasks/:taskId/assign-quiz', assignQuizToTask);
router.delete('/users/:id', deleteUser);
router.get('/reports', getReports);
router.get('/leaderboard', getLeaderboard);
router.get('/retest-requests', getRetestRequests);
router.post('/retest-requests/:id/approve', approveRetest);
router.post('/retest-requests/:id/reject', rejectRetest);

module.exports = router;
