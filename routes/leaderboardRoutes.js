const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
    getGlobalLeaderboard,
    getSubjectLeaderboard,
    getUserRank,
    getUserSubjectRank,
    getTopPerformers,
    getLevelStats
} = require('../controllers/leaderboardController');

const router = express.Router();

/**
 * GET /api/leaderboard/global
 * Get global leaderboard with pagination
 * Query params: limit (default: 20), page (default: 1)
 */
router.get('/global', protect, getGlobalLeaderboard);

/**
 * GET /api/leaderboard/subject/:subjectId
 * Get leaderboard for a specific subject
 * Query params: limit (default: 20), page (default: 1)
 */
router.get('/subject/:subjectId', protect, getSubjectLeaderboard);

/**
 * GET /api/leaderboard/user-rank
 * Get current user's global rank and nearby students
 */
router.get('/user-rank', protect, getUserRank);

/**
 * GET /api/leaderboard/user-subject-rank/:subjectId
 * Get current user's rank in a specific subject
 */
router.get('/user-subject-rank/:subjectId', protect, getUserSubjectRank);

/**
 * GET /api/leaderboard/top-performers
 * Get top performers across all subjects
 * Query params: limit (default: 10)
 */
router.get('/top-performers', protect, getTopPerformers);

/**
 * GET /api/leaderboard/level-stats/:subjectId
 * Get statistics about level completion for a subject
 */
router.get('/level-stats/:subjectId', protect, getLevelStats);

module.exports = router;
