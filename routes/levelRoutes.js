const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
    initializeSubjects,
    addQuestionsToLevel,
    getAllSubjects,
    getLevelsBySubject,
    getUserLevelProgress,
    startLevelTest,
    submitLevelTest,
    getLevelTestHistory
} = require('../controllers/levelController');

const router = express.Router();

// ============ ADMIN ONLY ROUTES ============

/**
 * POST /api/levels/initialize
 * Initialize all subjects and levels (Admin only)
 */
router.post('/initialize', protect, initializeSubjects);

/**
 * POST /api/levels/:subjectId/:levelNumber/questions
 * Add questions to a level (Admin only)
 */
router.post('/:subjectId/:levelNumber/questions', protect, addQuestionsToLevel);

// ============ STUDENT ROUTES ============

/**
 * GET /api/levels/subjects
 * Get all subjects with user's progress
 */
router.get('/subjects', protect, getAllSubjects);

/**
 * GET /api/levels/subject/:subjectId
 * Get levels for a specific subject
 */
router.get('/subject/:subjectId', protect, getLevelsBySubject);

/**
 * GET /api/levels/progress
 * Get user's level progress across all subjects
 */
router.get('/progress', protect, getUserLevelProgress);

/**
 * POST /api/levels/test/start/:levelId
 * Start a level test
 */
router.post('/test/start/:levelId', protect, startLevelTest);

/**
 * PUT /api/levels/test/:testId/submit
 * Submit a level test with answers
 */
router.put('/test/:testId/submit', protect, submitLevelTest);

/**
 * GET /api/levels/test-history/:subjectId
 * Get level test history for a subject
 */
router.get('/test-history/:subjectId', protect, getLevelTestHistory);

module.exports = router;
