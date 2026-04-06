const express = require('express');
const { 
    generateQuiz, 
    submitQuiz, 
    getQuizHistory, 
    getQuiz, 
    deleteQuiz, 
    generateTaskQuiz,
    submitTaskQuiz,
    getTaskQuiz,
    getTaskQuizStatus,
    requestRetest
} = require('../controllers/quizController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);

// Regular quiz routes
router.post('/generate', generateQuiz);
router.put('/:id/submit', submitQuiz);
router.post('/:id/request-retest', requestRetest);
router.get('/history', getQuizHistory);
router.get('/:id', getQuiz);
router.delete('/:id', deleteQuiz);

// Task-linked quiz routes
router.post('/task/:taskId/generate', generateTaskQuiz);
router.put('/:id/task-submit', submitTaskQuiz);
router.get('/task/:taskId/status', getTaskQuizStatus);
router.get('/task/:taskId', getTaskQuiz);

module.exports = router;
