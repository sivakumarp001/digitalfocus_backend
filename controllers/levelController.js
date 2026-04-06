const Level = require('../models/Level');
const Subject = require('../models/Subject');
const LevelTest = require('../models/LevelTest');
const LevelProgress = require('../models/LevelProgress');
const User = require('../models/User');

// Shuffle helper for randomized question order
const shuffleQuestions = (questions = []) => {
    const copy = [...questions];
    for (let i = copy.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [copy[i], copy[j]] = [copy[j], copy[i]];
    }
    return copy;
};

// Pick a randomized slice of questions per attempt
const selectQuestionsForAttempt = (level) => {
    if (!level?.questions?.length) return [];
    const desiredCount = Math.min(
        Math.max(1, level.questionsPerTest || level.totalQuestions || level.questions.length),
        level.questions.length
    );

    return shuffleQuestions(level.questions).slice(0, desiredCount);
};

// ============ ADMIN: Initialize Levels & Subjects ============

/**
 * Initialize all subjects with 4 levels each
 * POST /api/levels/initialize
 */
exports.initializeSubjects = async (req, res) => {
    try {
        const subjects = [
            'Java', 'Python', 'C', 'C++', 'React',
            'DBMS', 'Web Development',
            'Data Structures', 'Algorithms', 'Operating Systems',
            'Computer Networks', 'Machine Learning', 'Cybersecurity'
        ];

        for (const subjectName of subjects) {
            // Create subject if doesn't exist
            let subject = await Subject.findOne({ name: subjectName });
            if (!subject) {
                subject = await Subject.create({ name: subjectName });
            }

            // Create 4 levels for each subject
            for (let levelNum = 1; levelNum <= 4; levelNum++) {
                const levelNames = {
                    1: 'Beginner',
                    2: 'Intermediate',
                    3: 'Advanced',
                    4: 'Expert'
                };

                const existingLevel = await Level.findOne({
                    subject: subject._id,
                    levelNumber: levelNum
                });

                if (!existingLevel) {
                    await Level.create({
                        subject: subject._id,
                        levelNumber: levelNum,
                        title: `Level ${levelNum} - ${levelNames[levelNum]}`,
                        description: `${levelNames[levelNum]} level test for ${subjectName}`,
                        timeLimit: 60 + (levelNum - 1) * 20, // Increase time for harder levels
                        questionsPerTest: 10 + (levelNum - 1) * 5,
                        questions: [],
                        totalQuestions: 0
                    });
                }
            }
        }

        res.status(201).json({
            success: true,
            message: 'All subjects and levels initialized successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Add questions to a specific level
 * POST /api/levels/:subjectId/:levelNumber/questions
 */
exports.addQuestionsToLevel = async (req, res) => {
    try {
        const { subjectId, levelNumber } = req.params;
        const { questions } = req.body;

        if (!Array.isArray(questions) || questions.length === 0) {
            return res.status(400).json({
                success: false,
                error: 'Questions array is required and must not be empty'
            });
        }

        const level = await Level.findOne({
            subject: subjectId,
            levelNumber: parseInt(levelNumber)
        });

        if (!level) {
            return res.status(404).json({
                success: false,
                error: 'Level not found'
            });
        }

        // Add new questions
        level.questions.push(...questions);
        level.totalQuestions = level.questions.length;
        await level.save();

        res.status(200).json({
            success: true,
            message: 'Questions added successfully',
            level
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

// ============ STUDENT: Level Operations ============

/**
 * Get all subjects with level information
 * GET /api/levels/subjects
 */
exports.getAllSubjects = async (req, res) => {
    try {
        const userId = req.user._id;
        const subjects = await Subject.find({ isActive: true });

        // Enrich with user's progress
        const subjectsWithProgress = await Promise.all(
            subjects.map(async (subject) => {
                const progress = await LevelProgress.findOne({
                    user: userId,
                    subject: subject._id
                });

                return {
                    ...subject._doc,
                    userProgress: progress || {
                        currentLevel: 1,
                        unlockedLevels: [1],
                        levelScores: {},
                        totalPointsEarned: 0,
                        completionPercentage: 0,
                        isCompleted: false
                    }
                };
            })
        );

        res.status(200).json({
            success: true,
            data: subjectsWithProgress
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get levels for a specific subject
 * GET /api/levels/subject/:subjectId
 */
exports.getLevelsBySubject = async (req, res) => {
    try {
        const { subjectId } = req.params;
        const userId = req.user._id;

        const levels = await Level.find({
            subject: subjectId,
            isActive: true
        });

        // Get user's level progress
        const progress = await LevelProgress.findOne({
            user: userId,
            subject: subjectId
        });

        const unlockedLevels = progress?.unlockedLevels || [1];
        const levelScores = progress?.levelScores || {};

        const levelsWithStatus = levels.map((level) => ({
            ...level._doc,
            isUnlocked: unlockedLevels.includes(level.levelNumber),
            score: levelScores[`level${level.levelNumber}`] || {
                attempts: 0,
                bestScore: 0,
                completed: false,
                completedAt: null
            }
        }));

        res.status(200).json({
            success: true,
            data: levelsWithStatus
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get current level progress for user across all subjects
 * GET /api/levels/progress
 */
exports.getUserLevelProgress = async (req, res) => {
    try {
        const userId = req.user._id;

        const progress = await LevelProgress.find({ user: userId }).populate('subject');

        res.status(200).json({
            success: true,
            data: progress
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Start a level test
 * POST /api/levels/test/start/:levelId
 */
exports.startLevelTest = async (req, res) => {
    try {
        const { levelId } = req.params;
        const userId = req.user._id;

        const level = await Level.findById(levelId).populate('subject');
        if (!level) {
            return res.status(404).json({
                success: false,
                error: 'Level not found'
            });
        }

        // Check if user has unlocked this level
        const progress = await LevelProgress.findOne({
            user: userId,
            subject: level.subject._id
        });

        if (!progress?.unlockedLevels.includes(level.levelNumber)) {
            return res.status(403).json({
                success: false,
                error: `Level ${level.levelNumber} is not unlocked yet. Complete Level ${level.levelNumber - 1} first.`
            });
        }

        // Check max attempts
        const levelScoreKey = `level${level.levelNumber}`;
        const attempts = progress.levelScores[levelScoreKey]?.attempts || 0;

        if (attempts >= level.maxAttempts) {
            return res.status(403).json({
                success: false,
                error: `Maximum ${level.maxAttempts} attempts reached for this level`
            });
        }

        // Create new level test with randomized questions per attempt
        const selectedQuestions = selectQuestionsForAttempt(level);
        if (!selectedQuestions.length) {
            return res.status(400).json({
                success: false,
                error: 'No questions are available for this level yet. Please contact an admin.'
            });
        }

        const questions = selectedQuestions.map((q) => ({
            question: q.question,
            options: q.options,
            correctAnswer: q.correctAnswer,
            explanation: q.explanation,
            difficulty: q.difficulty
        }));

        const levelTest = await LevelTest.create({
            userId,
            subject: level.subject._id,
            level: levelId,
            levelNumber: level.levelNumber,
            questions,
            totalQuestions: questions.length,
            attemptNumber: attempts + 1
        });

        res.status(200).json({
            success: true,
            data: {
                testId: levelTest._id,
                totalQuestions: levelTest.totalQuestions,
                timeLimit: level.timeLimit,
                questions: questions.map((q) => ({
                    question: q.question,
                    options: q.options
                    // Do NOT send correctAnswer
                }))
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Calculate time-based bonus points
 * Formula: If completed in less than 60% of time limit -> Full bonus (30 points)
 *          If completed in 60-100% of time limit -> Partial bonus
 *          If completed in more than time limit -> No bonus
 */
const calculateTimeBonus = (timeTakenSeconds, timeLimitSeconds) => {
    const timeLimitMs = timeLimitSeconds * 60;
    const timePercentage = (timeTakenSeconds / timeLimitMs) * 100;

    if (timePercentage <= 60) {
        return 30; // Full bonus
    } else if (timePercentage <= 100) {
        return Math.round(30 * (1 - (timePercentage - 60) / 40));
    } else {
        return 0; // No bonus if time exceeded
    }
};

/**
 * Submit level test with scoring
 * PUT /api/levels/test/:testId/submit
 */
exports.submitLevelTest = async (req, res) => {
    try {
        const { testId } = req.params;
        const { answers } = req.body; // Array of selected answers
        const userId = req.user._id;

        const levelTest = await LevelTest.findById(testId);
        if (!levelTest) {
            return res.status(404).json({
                success: false,
                error: 'Level test not found'
            });
        }

        if (levelTest.status === 'completed') {
            return res.status(400).json({
                success: false,
                error: 'Test already submitted'
            });
        }

        // Calculate score
        let correctCount = 0;
        const submittedAnswers = answers.map((answer, index) => {
            const isCorrect = answer === levelTest.questions[index].correctAnswer;
            if (isCorrect) correctCount++;

            return {
                questionIndex: index,
                selectedAnswer: answer,
                isCorrect
            };
        });

        const percentage = (correctCount / levelTest.questions.length) * 100;
        const timeTakenSeconds = (Date.now() - new Date(levelTest.startedAt).getTime()) / 1000;

        // Get level for passing percentage
        const level = await Level.findById(levelTest.level);
        const isPassed = percentage >= level.passingPercentage;

        // Calculate time bonus
        const timeBonus = isPassed ? calculateTimeBonus(timeTakenSeconds, level.timeLimit) : 0;
        const baseScore = percentage; // 0-100
        const totalPoints = baseScore + timeBonus;

        // Update level test
        levelTest.answers = submittedAnswers;
        levelTest.score = Math.round(baseScore);
        levelTest.percentage = Math.round(percentage);
        levelTest.correctCount = correctCount;
        levelTest.isPassed = isPassed;
        levelTest.timeTakenSeconds = Math.round(timeTakenSeconds);
        levelTest.timeBonus = timeBonus;
        levelTest.totalPoints = totalPoints;
        levelTest.status = 'completed';
        levelTest.completedAt = new Date();
        await levelTest.save();

        // Update level progress
        const subject = await Subject.findById(levelTest.subject);
        let progress = await LevelProgress.findOne({
            user: userId,
            subject: levelTest.subject
        });

        if (!progress) {
            progress = await LevelProgress.create({
                user: userId,
                subject: levelTest.subject,
                subjectName: subject.name,
                currentLevel: 1,
                unlockedLevels: [1]
            });
        }

        // Update level-specific scores
        const levelKey = `level${levelTest.levelNumber}`;
        const currentLevelScore = progress.levelScores[levelKey] || {
            attempts: 0,
            bestScore: 0,
            completed: false,
            completedAt: null
        };

        currentLevelScore.attempts = (currentLevelScore.attempts || 0) + 1;
        currentLevelScore.bestScore = Math.max(currentLevelScore.bestScore || 0, totalPoints);

        if (isPassed && !currentLevelScore.completed) {
            currentLevelScore.completed = true;
            currentLevelScore.completedAt = new Date();

            // Unlock next level
            if (levelTest.levelNumber < 4 && !progress.unlockedLevels.includes(levelTest.levelNumber + 1)) {
                progress.unlockedLevels.push(levelTest.levelNumber + 1);
            }

            // Update current level
            progress.currentLevel = Math.min(levelTest.levelNumber + 1, 4);

            // Check if all levels completed
            if (progress.unlockedLevels.length === 4) {
                progress.isCompleted = true;
                progress.completedAt = new Date();
            }
        }

        // Calculate completion percentage
        const completedLevels = Object.values(progress.levelScores).filter((s) => s.completed).length;
        progress.completionPercentage = (completedLevels / 4) * 100;
        progress.totalPointsEarned += totalPoints;
        progress.levelScores[levelKey] = currentLevelScore;
        await progress.save();

        // Update user's total ranking points
        const user = await User.findById(userId);
        user.totalRankingPoints = (user.totalRankingPoints || 0) + totalPoints;
        user.levelHistory.push({
            subject: subject.name,
            level: levelTest.levelNumber,
            testId: levelTest._id,
            score: levelTest.score,
            timeTakenSeconds: levelTest.timeTakenSeconds,
            timeBonus: levelTest.timeBonus,
            totalPoints: totalPoints,
            passed: isPassed,
            attemptNumber: levelTest.attemptNumber,
            completedAt: new Date()
        });
        await user.save();

        // Return results with answer review
        const resultsWithReview = submittedAnswers.map((answer, index) => ({
            questionIndex: index,
            question: levelTest.questions[index].question,
            options: levelTest.questions[index].options,
            userAnswer: answer.selectedAnswer,
            correctAnswer: levelTest.questions[index].correctAnswer,
            isCorrect: answer.isCorrect,
            explanation: levelTest.questions[index].explanation
        }));

        res.status(200).json({
            success: true,
            isPassed,
            data: {
                testId: levelTest._id,
                levelNumber: levelTest.levelNumber,
                score: levelTest.score,
                percentage: levelTest.percentage,
                correctCount,
                totalQuestions: levelTest.totalQuestions,
                timeTakenSeconds: levelTest.timeTakenSeconds,
                timeBonus: levelTest.timeBonus,
                totalPoints: levelTest.totalPoints,
                passingPercentage: level.passingPercentage,
                answers: resultsWithReview,
                unlockedLevelNumber: isPassed ? levelTest.levelNumber + 1 : null,
                progressUpdate: {
                    currentLevel: progress.currentLevel,
                    completionPercentage: progress.completionPercentage,
                    totalPointsEarned: progress.totalPointsEarned,
                    isCompleted: progress.isCompleted
                }
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get level test history for user
 * GET /api/levels/test-history/:subjectId
 */
exports.getLevelTestHistory = async (req, res) => {
    try {
        const { subjectId } = req.params;
        const userId = req.user._id;

        const tests = await LevelTest.find({
            userId,
            subject: subjectId,
            status: 'completed'
        }).sort({ completedAt: -1 });

        res.status(200).json({
            success: true,
            data: tests
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
