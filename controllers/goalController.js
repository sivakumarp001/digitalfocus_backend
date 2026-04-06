const Goal = require('../models/Goal');

// @desc Get all goals
// @route GET /api/goals
const getGoals = async (req, res, next) => {
    try {
        const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json({ success: true, goals });
    } catch (error) {
        next(error);
    }
};

// @desc Create goal
// @route POST /api/goals
const createGoal = async (req, res, next) => {
    try {
        const { title, description, targetValue, unit, category, deadline } = req.body;
        const goal = await Goal.create({
            user: req.user._id, title, description, targetValue, unit, category, deadline,
        });
        res.status(201).json({ success: true, goal });
    } catch (error) {
        next(error);
    }
};

// @desc Update goal
// @route PUT /api/goals/:id
const updateGoal = async (req, res, next) => {
    try {
        const goal = await Goal.findById(req.params.id);
        if (!goal || goal.user.toString() !== req.user._id.toString()) {
            res.status(404); throw new Error('Goal not found');
        }
        if (req.body.currentValue >= goal.targetValue && !goal.achieved) {
            req.body.achieved = true;
            req.body.achievedAt = new Date();
        }
        const updated = await Goal.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json({ success: true, goal: updated });
    } catch (error) {
        next(error);
    }
};

// @desc Delete goal
// @route DELETE /api/goals/:id
const deleteGoal = async (req, res, next) => {
    try {
        const goal = await Goal.findById(req.params.id);
        if (!goal || goal.user.toString() !== req.user._id.toString()) {
            res.status(404); throw new Error('Goal not found');
        }
        await goal.deleteOne();
        res.json({ success: true, message: 'Goal removed' });
    } catch (error) {
        next(error);
    }
};

module.exports = { getGoals, createGoal, updateGoal, deleteGoal };
