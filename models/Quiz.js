const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    options: { type: [String], required: true, minlength: 4, maxlength: 4 },
    correctAnswer: { type: Number, required: true, min: 0, max: 3 },
    explanation: { type: String, default: '' },
});

const quizSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    linkedTaskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },
    linkedLevelTestId: { type: mongoose.Schema.Types.ObjectId, ref: 'LevelTest', default: null },
    subject: { type: String, required: true, trim: true },
    level: { type: Number, default: null }, // For level-based tests: 1-4
    title: { type: String, required: true },
    questions: [questionSchema],
    totalQuestions: { type: Number, default: 0 },
    timeLimit: { type: Number, default: 60 },
    quizType: { type: String, enum: ['practice', 'assigned', 'level-test'], default: 'practice' },
    assignedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    availableAt: { type: Date, default: Date.now },
    isPassed: { type: Boolean, default: false },
    answers: [{
        questionIndex: Number,
        selectedAnswer: Number,
        isCorrect: Boolean,
    }],
    score: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    pointsDelta: { type: Number, default: 0 },
    timeTakenSeconds: { type: Number, default: 0 }, // For time-based scoring
    timeBonus: { type: Number, default: 0 }, // Bonus points for quick completion
    totalPoints: { type: Number, default: 0 }, // score + timeBonus
    antiCheatWarnings: { type: Number, default: 0 },
    fullscreenViolations: { type: Number, default: 0 },
    tabSwitchViolations: { type: Number, default: 0 },
    status: { type: String, enum: ['in-progress', 'completed'], default: 'in-progress' },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
    reTestRequested: { type: Boolean, default: false },
    reTestRequestId: { type: mongoose.Schema.Types.ObjectId, ref: 'ReTestRequest', default: null },
    isRetake: { type: Boolean, default: false },
    originalQuizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', default: null },
}, { timestamps: true });

module.exports = mongoose.model('Quiz', quizSchema);
