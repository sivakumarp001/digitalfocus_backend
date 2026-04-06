const Task = require('../models/Task');
const FocusSession = require('../models/FocusSession');
const Quiz = require('../models/Quiz');
const User = require('../models/User');

const getWeekDates = () => {
    const dates = [];
    for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        d.setHours(0, 0, 0, 0);
        dates.push(d);
    }
    return dates;
};

// @desc Get weekly analytics
// @route GET /api/analytics/weekly
const getWeeklyAnalytics = async (req, res, next) => {
    try {
        const weekStart = new Date();
        weekStart.setDate(weekStart.getDate() - 6);
        weekStart.setHours(0, 0, 0, 0);

        const weekDates = getWeekDates();
        const labels = weekDates.map(d => d.toLocaleDateString('en-US', { weekday: 'short' }));

        // Focus minutes per day
        const focusSessions = await FocusSession.find({
            user: req.user._id,
            mode: 'work',
            completed: true,
            startTime: { $gte: weekStart },
        });

        const focusPerDay = weekDates.map(day => {
            const nextDay = new Date(day); nextDay.setDate(nextDay.getDate() + 1);
            const dayTotal = focusSessions
                .filter(s => s.startTime >= day && s.startTime < nextDay)
                .reduce((acc, s) => acc + s.duration, 0);
            return Math.round(dayTotal / 60 * 10) / 10; // hours
        });

        // Tasks completed per day
        const completedTasks = await Task.find({
            user: req.user._id,
            completed: true,
            completedAt: { $gte: weekStart },
        });

        const tasksPerDay = weekDates.map(day => {
            const nextDay = new Date(day); nextDay.setDate(nextDay.getDate() + 1);
            return completedTasks.filter(t => t.completedAt >= day && t.completedAt < nextDay).length;
        });

        // Quizzes completed per day (study sessions tracked)
        const completedQuizzes = await Quiz.find({
            userId: req.user._id,
            status: 'completed',
            completedAt: { $gte: weekStart },
        });

        const quizzesPerDay = weekDates.map(day => {
            const nextDay = new Date(day); nextDay.setDate(nextDay.getDate() + 1);
            return completedQuizzes.filter(q => q.completedAt >= day && q.completedAt < nextDay).length;
        });

        // Quizzes passed per day
        const passedQuizzes = completedQuizzes.filter(q => q.isPassed);
        const quizzesPassedPerDay = weekDates.map(day => {
            const nextDay = new Date(day); nextDay.setDate(nextDay.getDate() + 1);
            return passedQuizzes.filter(q => q.completedAt >= day && q.completedAt < nextDay).length;
        });

        res.json({
            success: true,
            labels,
            focusHours: focusPerDay,
            tasksCompleted: tasksPerDay,
            quizzesCompleted: quizzesPerDay,
            quizzesPassed: quizzesPassedPerDay,
        });
    } catch (error) {
        next(error);
    }
};

// @desc Get monthly analytics
// @route GET /api/analytics/monthly
const getMonthlyAnalytics = async (req, res, next) => {
    try {
        const monthStart = new Date();
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);

        const weeks = [1, 2, 3, 4];
        const weekData = await Promise.all(weeks.map(async (week) => {
            const start = new Date(monthStart);
            start.setDate((week - 1) * 7 + 1);
            const end = new Date(start);
            end.setDate(end.getDate() + 6);

            const [sessions, tasksAssigned, tasksCompleted, quizzes] = await Promise.all([
                FocusSession.find({
                    user: req.user._id, mode: 'work', completed: true,
                    startTime: { $gte: start, $lte: end },
                }),
                Task.find({
                    user: req.user._id,
                    createdAt: { $gte: start, $lte: end },
                }),
                Task.find({
                    user: req.user._id, completed: true,
                    completedAt: { $gte: start, $lte: end },
                }),
                Quiz.find({
                    userId: req.user._id, status: 'completed',
                    completedAt: { $gte: start, $lte: end },
                }),
            ]);

            const focusHours = sessions.reduce((a, s) => a + s.duration, 0) / 60;
            const passedQuizzes = quizzes.filter(q => q.isPassed).length;
            const avgScore = quizzes.length
                ? Math.round((quizzes.reduce((sum, q) => sum + (q.score || 0), 0) / quizzes.length) * 10) / 10
                : 0;

            return {
                week: `Week ${week}`,
                focusHours: Math.round(focusHours * 10) / 10,
                tasksAssigned: tasksAssigned.length,
                tasksCompleted: tasksCompleted.length,
                quizzes: quizzes.length,
                quizzesPassed: passedQuizzes,
                avgScore,
            };
        }));

        res.json({ success: true, weekData });
    } catch (error) {
        next(error);
    }
};

// @desc Get dashboard summary
// @route GET /api/analytics/summary
const getSummary = async (req, res, next) => {
    try {
        const user = await User.findById(req.user._id).select('-password');
        const today = new Date(); today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today); tomorrow.setDate(tomorrow.getDate() + 1);

        const [totalTasks, completedTasks, todayFocus, todayDistractions, todayQuizzes] = await Promise.all([
            Task.countDocuments({ user: req.user._id }),
            Task.countDocuments({ user: req.user._id, completed: true }),
            FocusSession.find({ user: req.user._id, mode: 'work', completed: true, startTime: { $gte: today, $lt: tomorrow } }),
            FocusSession.find({ user: req.user._id, startTime: { $gte: today, $lt: tomorrow } }),
            Quiz.find({ userId: req.user._id, status: 'completed', completedAt: { $gte: today, $lt: tomorrow } }),
        ]);

        const todayFocusMins = todayFocus.reduce((a, s) => a + s.duration, 0);
        const todayDistractionCount = todayDistractions.reduce((a, s) => a + s.distractions, 0);
        const todayQuizzesCount = todayQuizzes.length;
        const todayQuizzesPassedCount = todayQuizzes.filter(q => q.isPassed).length;
        const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

        // Productivity score = (completion rate * 0.4) + (focus hours * 10 * 0.3) + (quizzes passed * 2 * 0.2) + (streak * 2 * 0.1) capped at 100
        const focusScore = Math.min(todayFocusMins / 6, 30);
        const taskScore = completionRate * 0.4;
        const quizScore = Math.min(todayQuizzesPassedCount * 2, 20);
        const streakScore = Math.min((user.streak || 0) * 2, 10);
        const productivityScore = Math.round(focusScore + taskScore + quizScore + streakScore);

        await User.findByIdAndUpdate(req.user._id, { productivityScore });

        res.json({
            success: true,
            summary: {
                totalTasks,
                completedTasks,
                completionRate,
                todayFocusMinutes: todayFocusMins,
                todayFocusHours: Math.round(todayFocusMins / 60 * 10) / 10,
                todayDistractions: todayDistractionCount,
                todayQuizzes: todayQuizzesCount,
                todayQuizzesPassed: todayQuizzesPassedCount,
                streak: user.streak,
                productivityScore,
                totalFocusMinutes: user.totalFocusMinutes,
            },
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { getWeeklyAnalytics, getMonthlyAnalytics, getSummary };
