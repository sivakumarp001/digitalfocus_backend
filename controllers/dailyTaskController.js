const DailyTask = require('../models/DailyTask');
const User = require('../models/User');

/**
 * Create a new daily task
 * POST /api/daily-tasks
 */
exports.createDailyTask = async (req, res) => {
    try {
        const { title, description, priority, category, taskDate, dueTime, estimatedMinutes, tags, notes, relatedSubject, relatedLevel } = req.body;
        const userId = req.user._id;

        if (!title) {
            return res.status(400).json({
                success: false,
                error: 'Task title is required'
            });
        }

        // Normalize task date to start of day
        let normalizedDate = new Date(taskDate || Date.now());
        normalizedDate.setHours(0, 0, 0, 0);

        const dailyTask = await DailyTask.create({
            user: userId,
            title,
            description: description || '',
            priority: priority || 'medium',
            category: category || 'personal',
            taskDate: normalizedDate,
            dueTime,
            estimatedMinutes: estimatedMinutes || 0,
            tags: tags || [],
            notes: notes || '',
            relatedSubject,
            relatedLevel,
            completed: false
        });

        await dailyTask.populate('user', 'name email');

        res.status(201).json({
            success: true,
            data: dailyTask
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get daily tasks for today or a specific date
 * GET /api/daily-tasks
 * Query params: date (YYYY-MM-DD format, default: today), status (all/pending/completed)
 */
exports.getDailyTasks = async (req, res) => {
    try {
        const userId = req.user._id;
        const { date, status } = req.query;

        // Parse date or use today
        let targetDate = date ? new Date(date) : new Date();
        targetDate.setHours(0, 0, 0, 0);

        const query = {
            user: userId,
            taskDate: targetDate
        };

        // Filter by status
        if (status === 'pending') {
            query.completed = false;
        } else if (status === 'completed') {
            query.completed = true;
        }

        const tasks = await DailyTask.find(query)
            .sort({ priority: -1, dueTime: 1 })
            .lean();

        // Calculate stats
        const totalTasks = await DailyTask.countDocuments({
            user: userId,
            taskDate: targetDate
        });

        const completedTasks = tasks.filter((t) => t.completed).length;
        const pendingTasks = totalTasks - completedTasks;
        const completionPercentage = totalTasks === 0 ? 0 : (completedTasks / totalTasks) * 100;

        res.status(200).json({
            success: true,
            data: {
                tasks,
                date: targetDate.toISOString().split('T')[0],
                stats: {
                    totalTasks,
                    completedTasks,
                    pendingTasks,
                    completionPercentage: Math.round(completionPercentage)
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
 * Get tasks for a date range
 * GET /api/daily-tasks/range
 * Query params: startDate, endDate (YYYY-MM-DD format)
 */
exports.getTasksInRange = async (req, res) => {
    try {
        const userId = req.user._id;
        const { startDate, endDate } = req.query;

        if (!startDate || !endDate) {
            return res.status(400).json({
                success: false,
                error: 'startDate and endDate are required'
            });
        }

        let start = new Date(startDate);
        start.setHours(0, 0, 0, 0);

        let end = new Date(endDate);
        end.setHours(23, 59, 59, 999);

        const tasks = await DailyTask.find({
            user: userId,
            taskDate: { $gte: start, $lte: end }
        })
            .sort({ taskDate: -1, priority: -1 })
            .lean();

        // Group tasks by date
        const tasksByDate = {};
        tasks.forEach((task) => {
            const dateKey = task.taskDate.toISOString().split('T')[0];
            if (!tasksByDate[dateKey]) {
                tasksByDate[dateKey] = {
                    date: dateKey,
                    tasks: [],
                    completed: 0,
                    total: 0
                };
            }
            tasksByDate[dateKey].tasks.push(task);
            tasksByDate[dateKey].total++;
            if (task.completed) tasksByDate[dateKey].completed++;
        });

        res.status(200).json({
            success: true,
            data: Object.values(tasksByDate)
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get a single daily task
 * GET /api/daily-tasks/:taskId
 */
exports.getDailyTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const userId = req.user._id;

        const task = await DailyTask.findOne({
            _id: taskId,
            user: userId
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                error: 'Task not found'
            });
        }

        res.status(200).json({
            success: true,
            data: task
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Update a daily task
 * PUT /api/daily-tasks/:taskId
 */
exports.updateDailyTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const userId = req.user._id;
        const updates = req.body;

        // Prevent updating certain fields
        delete updates.user;
        delete updates.createdAt;

        // If taskDate is being updated, normalize it
        if (updates.taskDate) {
            let normalizedDate = new Date(updates.taskDate);
            normalizedDate.setHours(0, 0, 0, 0);
            updates.taskDate = normalizedDate;
        }

        const task = await DailyTask.findOneAndUpdate(
            { _id: taskId, user: userId },
            updates,
            { new: true, runValidators: true }
        );

        if (!task) {
            return res.status(404).json({
                success: false,
                error: 'Task not found'
            });
        }

        res.status(200).json({
            success: true,
            data: task
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Toggle task completion status
 * PATCH /api/daily-tasks/:taskId/toggle
 */
exports.toggleTaskCompletion = async (req, res) => {
    try {
        const { taskId } = req.params;
        const userId = req.user._id;

        const task = await DailyTask.findOne({
            _id: taskId,
            user: userId
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                error: 'Task not found'
            });
        }

        task.completed = !task.completed;
        if (task.completed) {
            task.completedAt = new Date();
            task.actualMinutes = Math.floor(
                (new Date() - new Date(task.updatedAt)) / 60000
            ) || task.estimatedMinutes;
        } else {
            task.completedAt = null;
        }

        await task.save();

        res.status(200).json({
            success: true,
            data: task,
            message: task.completed ? 'Task marked as completed' : 'Task marked as incomplete'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Mark task as completed
 * PATCH /api/daily-tasks/:taskId/complete
 */
exports.completeTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const { actualMinutes } = req.body;
        const userId = req.user._id;

        const task = await DailyTask.findOneAndUpdate(
            { _id: taskId, user: userId },
            {
                completed: true,
                completedAt: new Date(),
                actualMinutes: actualMinutes || undefined
            },
            { new: true }
        );

        if (!task) {
            return res.status(404).json({
                success: false,
                error: 'Task not found'
            });
        }

        res.status(200).json({
            success: true,
            data: task,
            message: 'Task completed successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Delete a daily task
 * DELETE /api/daily-tasks/:taskId
 */
exports.deleteDailyTask = async (req, res) => {
    try {
        const { taskId } = req.params;
        const userId = req.user._id;

        const task = await DailyTask.findOneAndDelete({
            _id: taskId,
            user: userId
        });

        if (!task) {
            return res.status(404).json({
                success: false,
                error: 'Task not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Task deleted successfully'
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            error: error.message
        });
    }
};

/**
 * Get task statistics for a specific date or date range
 * GET /api/daily-tasks/stats
 * Query params: startDate, endDate (optional), aggregateBy (day/week/month)
 */
exports.getTaskStats = async (req, res) => {
    try {
        const userId = req.user._id;
        const { startDate, endDate, aggregateBy } = req.query;

        let start = new Date(startDate || new Date().setDate(new Date().getDate() - 7));
        start.setHours(0, 0, 0, 0);

        let end = new Date(endDate || Date.now());
        end.setHours(23, 59, 59, 999);

        const stats = await DailyTask.aggregate([
            {
                $match: {
                    user: require('mongoose').Types.ObjectId(userId),
                    taskDate: { $gte: start, $lte: end }
                }
            },
            {
                $group: {
                    _id: {
                        $dateToString: {
                            format: '%Y-%m-%d',
                            date: '$taskDate'
                        }
                    },
                    totalTasks: { $sum: 1 },
                    completedTasks: {
                        $sum: { $cond: ['$completed', 1, 0] }
                    },
                    pendingTasks: {
                        $sum: { $cond: ['$completed', 0, 1] }
                    },
                    avgEstimatedMinutes: { $avg: '$estimatedMinutes' },
                    totalEstimatedMinutes: { $sum: '$estimatedMinutes' },
                    avgActualMinutes: { $avg: '$actualMinutes' }
                }
            },
            {
                $project: {
                    date: '$_id',
                    _id: 0,
                    totalTasks: 1,
                    completedTasks: 1,
                    pendingTasks: 1,
                    completionPercentage: {
                        $round: [
                            { $multiply: [{ $divide: ['$completedTasks', '$totalTasks'] }, 100] },
                            2
                        ]
                    },
                    avgEstimatedMinutes: { $round: ['$avgEstimatedMinutes', 1] },
                    totalEstimatedMinutes: 1,
                    avgActualMinutes: { $round: ['$avgActualMinutes', 1] }
                }
            },
            {
                $sort: { date: 1 }
            }
        ]);

        // Calculate overall stats
        const overallStats = stats.reduce(
            (acc, day) => ({
                totalTasks: acc.totalTasks + day.totalTasks,
                completedTasks: acc.completedTasks + day.completedTasks,
                avgCompletionPercentage:
                    (acc.avgCompletionPercentage * acc.daysCount + day.completionPercentage) /
                    (acc.daysCount + 1),
                daysCount: acc.daysCount + 1
            }),
            { totalTasks: 0, completedTasks: 0, avgCompletionPercentage: 0, daysCount: 0 }
        );

        res.status(200).json({
            success: true,
            data: {
                byDate: stats,
                overall: {
                    dateRange: {
                        start: start.toISOString().split('T')[0],
                        end: end.toISOString().split('T')[0]
                    },
                    totalTasksCreated: overallStats.totalTasks,
                    totalTasksCompleted: overallStats.completedTasks,
                    overallCompletionPercentage: Math.round(overallStats.avgCompletionPercentage)
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
