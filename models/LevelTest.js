const mongoose = require('mongoose');

const answerSchema = new mongoose.Schema({
    questionIndex: { type: Number, required: true },
    selectedAnswer: { type: Number, required: true },
    isCorrect: { type: Boolean, default: false },
});

const levelTestSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    level: { type: mongoose.Schema.Types.ObjectId, ref: 'Level', required: true },
    levelNumber: { type: Number, required: true }, // denormalized for faster queries
    questions: [{
        question: String,
        options: [String],
        correctAnswer: Number,
        explanation: String,
    }],
    totalQuestions: { type: Number, default: 0 },
    answers: [answerSchema],
    score: { type: Number, default: 0 }, // out of 100%
    percentage: { type: Number, default: 0 },
    correctCount: { type: Number, default: 0 },
    isPassed: { type: Boolean, default: false },
    timeTakenSeconds: { type: Number, default: 0 },
    timeBonus: { type: Number, default: 0 }, // Extra points based on speed
    totalPoints: { type: Number, default: 0 }, // score + timeBonus
    status: { type: String, enum: ['in-progress', 'completed'], default: 'in-progress' },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date, default: null },
    attemptNumber: { type: Number, default: 1 },
    antiCheatWarnings: { type: Number, default: 0 },
}, { timestamps: true });

module.exports = mongoose.model('LevelTest', levelTestSchema);
