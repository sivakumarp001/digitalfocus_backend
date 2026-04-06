const Task = require('../models/Task');
const Quiz = require('../models/Quiz');

const validLanguages = [
    'java',
    'python',
    'c',
    'c++',
    'react',
    'dbms',
    'dsa',
    'web',
    'html',
    'css',
    'mathematics',
    'science',
    'history',
    'english',
    'aptitude'
];

const enrichTask = (task) => {
    const now = new Date();
    const endTime = task.endTime ? new Date(task.endTime) : null;
    const testAvailable = Boolean(task.quizRequired && task.linkedQuizId && (!task.taskQuizAvailableAt || new Date(task.taskQuizAvailableAt) <= now));

    return {
        ...task.toObject(),
        testAvailable,
        hasEnded: Boolean(endTime && endTime <= now),
        taskStatus: task.completed ? 'completed' : endTime && endTime <= now ? 'duration-complete' : 'in-progress',
    };
};

const getTasks = async (req, res, next) => {
    try {
        const { category, priority, completed, search } = req.query;
        const filter = { user: req.user._id };

        if (category) filter.category = category;
        if (priority) filter.priority = priority;
        if (completed !== undefined) filter.completed = completed === 'true';
        if (search) filter.title = { $regex: search, $options: 'i' };

        const tasks = await Task.find(filter).sort({ createdAt: -1 });
        res.json({ success: true, count: tasks.length, tasks: tasks.map(enrichTask) });
    } catch (error) {
        next(error);
    }
};

const createTask = async (req, res, next) => {
    try {
        const { title, description, priority, category, dueDate, tags, requiredLanguage, startTime, endTime } = req.body;

        if (requiredLanguage && !validLanguages.includes(requiredLanguage.toLowerCase())) {
            return res.status(400).json({ success: false, message: 'Invalid language specified' });
        }

        const parsedStart = startTime ? new Date(startTime) : null;
        const parsedEnd = endTime ? new Date(endTime) : null;

        if (parsedStart && parsedEnd && parsedEnd <= parsedStart) {
            return res.status(400).json({ success: false, message: 'End time must be after start time' });
        }

        const plannedDurationMinutes = parsedStart && parsedEnd
            ? Math.max(0, Math.round((parsedEnd - parsedStart) / (1000 * 60)))
            : 0;

        const task = await Task.create({
            user: req.user._id,
            title,
            description,
            priority,
            category,
            dueDate,
            tags,
            startTime: parsedStart,
            endTime: parsedEnd,
            plannedDurationMinutes,
            requiredLanguage: requiredLanguage ? requiredLanguage.toLowerCase() : null,
        });

        res.status(201).json({ success: true, task: enrichTask(task) });
    } catch (error) {
        next(error);
    }
};

const updateTask = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task || task.user.toString() !== req.user._id.toString()) {
            res.status(404);
            throw new Error('Task not found');
        }

        if (req.body.requiredLanguage && !validLanguages.includes(req.body.requiredLanguage.toLowerCase())) {
            res.status(400);
            throw new Error('Invalid language specified');
        }

        const startTime = req.body.startTime ? new Date(req.body.startTime) : (req.body.startTime === null ? null : task.startTime);
        const endTime = req.body.endTime ? new Date(req.body.endTime) : (req.body.endTime === null ? null : task.endTime);

        if (startTime && endTime && endTime <= startTime) {
            res.status(400);
            throw new Error('End time must be after start time');
        }

        if (req.body.completed === true && !task.completed && task.quizRequired && task.requiredLanguage) {
            const passedQuiz = await Quiz.findOne({
                userId: req.user._id,
                linkedTaskId: task._id,
                isPassed: true,
            });

            if (!passedQuiz) {
                res.status(400);
                throw new Error(`You must pass the assigned ${task.requiredLanguage} test before completing this task`);
            }

            req.body.quizCompleted = true;
            req.body.quizPassedAt = new Date();
            req.body.completedAt = new Date();
        }

        const plannedDurationMinutes = startTime && endTime
            ? Math.max(0, Math.round((endTime - startTime) / (1000 * 60)))
            : 0;

        const payload = {
            ...req.body,
            startTime,
            endTime,
            plannedDurationMinutes,
        };

        if (payload.requiredLanguage) {
            payload.requiredLanguage = payload.requiredLanguage.toLowerCase();
        }

        const updatedTask = await Task.findByIdAndUpdate(req.params.id, payload, { new: true });
        res.json({ success: true, task: enrichTask(updatedTask) });
    } catch (error) {
        next(error);
    }
};

const deleteTask = async (req, res, next) => {
    try {
        const task = await Task.findById(req.params.id);
        if (!task || task.user.toString() !== req.user._id.toString()) {
            res.status(404);
            throw new Error('Task not found');
        }

        await task.deleteOne();
        res.json({ success: true, message: 'Task removed' });
    } catch (error) {
        next(error);
    }
};

const getTodayTasks = async (req, res, next) => {
    try {
        const today = new Date();
        const start = new Date(today.setHours(0, 0, 0, 0));
        const end = new Date(today.setHours(23, 59, 59, 999));

        const tasks = await Task.find({
            user: req.user._id,
            $or: [
                { dueDate: { $gte: start, $lte: end } },
                { startTime: { $gte: start, $lte: end } },
                { dueDate: null, completed: false },
            ],
        }).sort({ priority: -1, startTime: 1 });

        res.json({ success: true, tasks: tasks.map(enrichTask) });
    } catch (error) {
        next(error);
    }
};

module.exports = { getTasks, createTask, updateTask, deleteTask, getTodayTasks };
