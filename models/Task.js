const mongoose = require('mongoose');

const taskSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    category: { type: String, enum: ['study', 'project', 'personal', 'other'], default: 'study' },
    dueDate: { type: Date },
    startTime: { type: Date, default: null },
    endTime: { type: Date, default: null },
    plannedDurationMinutes: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
    tags: [{ type: String }],
    requiredLanguage: { 
        type: String, 
        enum: ['java', 'python', 'c', 'html', 'css', 'mathematics', 'science', 'history', 'english', 'aptitude', null],
        default: null,
        lowercase: true
    },
    quizCompleted: { type: Boolean, default: false },
    quizPassedAt: { type: Date, default: null },
    linkedQuizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', default: null },
    quizRequired: { type: Boolean, default: false },
    taskQuizStarted: { type: Boolean, default: false },
    taskQuizStartedAt: { type: Date, default: null },
    taskQuizAvailableAt: { type: Date, default: null },
    assignedByStaff: { type: Boolean, default: false },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    pointsAwarded: { type: Number, default: 20 },
    pointsPenalty: { type: Number, default: 10 },
    reTestRequested: { type: Boolean, default: false },
    reTestRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'ReTestRequest', default: null },
    reTestApprovedCount: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('Task', taskSchema);
