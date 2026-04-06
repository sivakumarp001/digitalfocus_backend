const User = require('../models/User');
const LevelProgress = require('../models/LevelProgress');
const Subject = require('../models/Subject');

/**
 * Get global leaderboard (top students by total ranking points)
 * GET /api/leaderboard/global
 * Query params: limit (default: 20), page (default: 1)
 */
exports.getGlobalLeaderboard = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 20;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;

        const users = await User.find({})
            .select('name email avatar totalRankingPoints cumulativePoints productivityScore streak')
            .sort({ totalRankingPoints: -1 })
            .limit(limit)
            .skip(skip)
            .lean();

        const totalUsers = await User.countDocuments();

        // Add ranking position
        const leaderboard = users.map((user, index) => ({
            ...user,
            rank: skip + index + 1,
            totalRankingPoints: user.totalRankingPoints || 0,
            cumulativePoints: user.cumulativePoints || 0,
            productivityScore: user.productivityScore || 0
        }));

        res.status(200).json({
            success: true,
            data: {
                leaderboard,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalUsers / limit),
                    totalStudents: totalUsers,
                    limit
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
 * Get leaderboard for a specific subject by level performance
 * GET /api/leaderboard/subject/:subjectId
 * Query params: limit (default: 20), page (default: 1)
 */
exports.getSubjectLeaderboard = async (req, res) => {
    try {
        const { subjectId } = req.params;
        const limit = parseInt(req.query.limit) || 20;
        const page = parseInt(req.query.page) || 1;
        const skip = (page - 1) * limit;

        const subject = await Subject.findById(subjectId);
        if (!subject) {
            return res.status(404).json({
                success: false,
                error: 'Subject not found'
            });
        }

        const progressRecords = await LevelProgress.find({
            subject: subjectId
        })
            .populate('user', 'name email avatar')
            .sort({ totalPointsEarned: -1 })
            .limit(limit)
            .skip(skip)
            .lean();

        const totalParticipants = await LevelProgress.countDocuments({ subject: subjectId });

        const leaderboard = progressRecords.map((record, index) => ({
            rank: skip + index + 1,
            user: record.user,
            subject: subject.name,
            currentLevel: record.currentLevel,
            unlockedLevels: record.unlockedLevels.length,
            totalPointsEarned: record.totalPointsEarned,
            completionPercentage: record.completionPercentage,
            isCompleted: record.isCompleted,
            completedAt: record.completedAt,
            levelScores: record.levelScores,
            lastAttemptAt: record.lastAttemptAt
        }));

        res.status(200).json({
            success: true,
            data: {
                subject: subject.name,
                leaderboard,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalParticipants / limit),
                    totalParticipants,
                    limit
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
 * Get user's rank and nearby students (global context)
 * GET /api/leaderboard/user-rank
 */
exports.getUserRank = async (req, res) => {
    try {
        const userId = req.user._id;

        const user = await User.findById(userId).select(
            'name email avatar totalRankingPoints cumulativePoints productivityScore'
        );

        // Get user's rank
        const rankAbove = await User.countDocuments({
            totalRankingPoints: { $gt: user.totalRankingPoints || 0 }
        });

        const userRank = rankAbove + 1;

        // Get nearby students (5 above, 5 below)
        const nearby = await User.find({})
            .select('name email avatar totalRankingPoints cumulativePoints')
            .sort({ totalRankingPoints: -1 })
            .limit(11)
            .skip(Math.max(0, userRank - 6))
            .lean();

        // Add rankings to nearby students
        const nearbyWithRank = nearby.map((u, index) => ({
            ...u,
            rank: Math.max(0, userRank - 6) + index + 1,
            isCurrentUser: u._id.toString() === userId.toString(),
            totalRankingPoints: u.totalRankingPoints || 0
        }));

        res.status(200).json({
            success: true,
            data: {
                userRank,
                userStats: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    avatar: user.avatar,
                    totalRankingPoints: user.totalRankingPoints || 0,
                    cumulativePoints: user.cumulativePoints || 0,
                    productivityScore: user.productivityScore || 0
                },
                nearby: nearbyWithRank
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
 * Get user's rank in a specific subject
 * GET /api/leaderboard/user-subject-rank/:subjectId
 */
exports.getUserSubjectRank = async (req, res) => {
    try {
        const userId = req.user._id;
        const { subjectId } = req.params;

        const userProgress = await LevelProgress.findOne({
            user: userId,
            subject: subjectId
        }).populate('subject', 'name');

        if (!userProgress) {
            return res.status(404).json({
                success: false,
                error: 'No progress found for this subject'
            });
        }

        // Get user's rank in this subject
        const rankAbove = await LevelProgress.countDocuments({
            subject: subjectId,
            totalPointsEarned: { $gt: userProgress.totalPointsEarned }
        });

        const userSubjectRank = rankAbove + 1;

        // Get nearby students in this subject
        const nearby = await LevelProgress.find({
            subject: subjectId
        })
            .populate('user', 'name email avatar')
            .sort({ totalPointsEarned: -1 })
            .limit(11)
            .skip(Math.max(0, userSubjectRank - 6))
            .lean();

        const nearbyWithRank = nearby.map((record, index) => ({
            rank: Math.max(0, userSubjectRank - 6) + index + 1,
            user: record.user,
            totalPointsEarned: record.totalPointsEarned,
            currentLevel: record.currentLevel,
            completionPercentage: record.completionPercentage,
            isCurrentUser: record.user._id.toString() === userId.toString()
        }));

        res.status(200).json({
            success: true,
            data: {
                userSubjectRank,
                subject: userProgress.subject.name,
                userStats: {
                    currentLevel: userProgress.currentLevel,
                    unlockedLevels: userProgress.unlockedLevels.length,
                    totalPointsEarned: userProgress.totalPointsEarned,
                    completionPercentage: userProgress.completionPercentage,
                    isCompleted: userProgress.isCompleted
                },
                nearby: nearbyWithRank
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
 * Get top performers across all subjects
 * GET /api/leaderboard/top-performers
 * Query params: limit (default: 10)
 */
exports.getTopPerformers = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 10;

        // Get users with highest level completion
        const topPerformers = await User.aggregate([
            {
                $match: {
                    role: 'student'
                }
            },
            {
                $sort: {
                    totalRankingPoints: -1,
                    cumulativePoints: -1,
                    productivityScore: -1
                }
            },
            {
                $limit: limit
            },
            {
                $project: {
                    name: 1,
                    email: 1,
                    avatar: 1,
                    totalRankingPoints: 1,
                    cumulativePoints: 1,
                    productivityScore: 1,
                    streak: 1,
                    totalFocusMinutes: 1
                }
            }
        ]);

        const topPerformersWithRank = topPerformers.map((user, index) => ({
            ...user,
            rank: index + 1,
            totalRankingPoints: user.totalRankingPoints || 0
        }));

        res.status(200).json({
            success: true,
            data: topPerformersWithRank
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get level completion stats (which level is popular)
 * GET /api/leaderboard/level-stats/:subjectId
 */
exports.getLevelStats = async (req, res) => {
    try {
        const { subjectId } = req.params;

        const stats = await LevelProgress.aggregate([
            {
                $match: {
                    subject: require('mongoose').Types.ObjectId(subjectId)
                }
            },
            {
                $group: {
                    _id: null,
                    totalStudents: { $sum: 1 },
                    level1Completed: {
                        $sum: { $cond: ['$levelScores.level1.completed', 1, 0] }
                    },
                    level2Completed: {
                        $sum: { $cond: ['$levelScores.level2.completed', 1, 0] }
                    },
                    level3Completed: {
                        $sum: { $cond: ['$levelScores.level3.completed', 1, 0] }
                    },
                    level4Completed: {
                        $sum: { $cond: ['$levelScores.level4.completed', 1, 0] }
                    },
                    avgPointsLevel1: { $avg: '$levelScores.level1.bestScore' },
                    avgPointsLevel2: { $avg: '$levelScores.level2.bestScore' },
                    avgPointsLevel3: { $avg: '$levelScores.level3.bestScore' },
                    avgPointsLevel4: { $avg: '$levelScores.level4.bestScore' }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            data: stats[0] || {
                totalStudents: 0,
                level1Completed: 0,
                level2Completed: 0,
                level3Completed: 0,
                level4Completed: 0
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};
