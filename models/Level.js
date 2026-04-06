const mongoose = require('mongoose');

const levelQuestionSchema = new mongoose.Schema({
    question: { type: String, required: true },
    options: { type: [String], required: true, minlength: 4, maxlength: 4 },
    correctAnswer: { type: Number, required: true, min: 0, max: 3 },
    explanation: { type: String, default: '' },
    difficulty: { type: String, enum: ['easy', 'medium', 'hard'], default: 'medium' },
});

const levelSchema = new mongoose.Schema({
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    levelNumber: { type: Number, required: true, min: 1, max: 4 },
    title: { type: String, required: true }, // e.g., "Level 1 - Beginner"
    description: { type: String, default: '' },
    questions: [levelQuestionSchema],
    totalQuestions: { type: Number, default: 0 },
    questionsPerTest: { type: Number, default: 10 },
    timeLimit: { type: Number, default: 60 }, // in minutes
    passingPercentage: { type: Number, default: 60 },
    maxAttempts: { type: Number, default: 3 },
    isActive: { type: Boolean, default: true },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

// Ensure unique subject + level combination
levelSchema.index({ subject: 1, levelNumber: 1 }, { unique: true });

module.exports = mongoose.model('Level', levelSchema);
