const FocusSession = require('../models/FocusSession');
const User = require('../models/User');

// @desc Start a focus session
// @route POST /api/focus/start
const startSession = async (req, res, next) => {
    try {
        const { mode, plannedDuration, taskId } = req.body;
        const session = await FocusSession.create({
            user: req.user._id,
            startTime: new Date(),
            mode: mode || 'work',
            plannedDuration: plannedDuration || 25,
            taskId: taskId || null,
        });
        res.status(201).json({ success: true, session });
    } catch (error) {
        next(error);
    }
};

// @desc End a focus session
// @route PUT /api/focus/:id/end
const endSession = async (req, res, next) => {
    try {
        const session = await FocusSession.findById(req.params.id);
        if (!session || session.user.toString() !== req.user._id.toString()) {
            res.status(404);
            throw new Error('Session not found');
        }
        const endTime = new Date();
        const duration = Math.round((endTime - session.startTime) / 60000);
        session.endTime = endTime;
        session.duration = duration;
        session.completed = req.body.completed !== false;
        session.notes = req.body.notes || '';
        await session.save();

        if (session.mode === 'work' && session.completed) {
            await User.findByIdAndUpdate(req.user._id, {
                $inc: { totalFocusMinutes: duration },
            });
        }
        res.json({ success: true, session });
    } catch (error) {
        next(error);
    }
};

// @desc Add distraction to session
// @route POST /api/focus/:id/distraction
const addDistraction = async (req, res, next) => {
    try {
        const session = await FocusSession.findById(req.params.id);
        if (!session) { res.status(404); throw new Error('Session not found'); }
        session.distractions += 1;
        await session.save();
        res.json({ success: true, distractions: session.distractions });
    } catch (error) {
        next(error);
    }
};

// @desc Get session history
// @route GET /api/focus/history
const getHistory = async (req, res, next) => {
    try {
        const { limit = 20, page = 1 } = req.query;
        const sessions = await FocusSession.find({ user: req.user._id, completed: true })
            .sort({ createdAt: -1 })
            .limit(Number(limit))
            .skip((page - 1) * Number(limit))
            .populate('taskId', 'title');
        const total = await FocusSession.countDocuments({ user: req.user._id, completed: true });
        res.json({ success: true, sessions, total, page: Number(page) });
    } catch (error) {
        next(error);
    }
};

module.exports = { startSession, endSession, addDistraction, getHistory };
