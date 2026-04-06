const mongoose = require('mongoose');

const levelScoreSchema = new mongoose.Schema({
    attempts: { type: Number, default: 0 },
    bestScore: { type: Number, default: 0 },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null }
}, { _id: false });

const levelProgressSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    subject: { type: mongoose.Schema.Types.ObjectId, ref: 'Subject', required: true },
    subjectName: { type: String, required: true }, // denormalized for faster queries
    currentLevel: { type: Number, default: 1, min: 1, max: 4 },
    unlockedLevels: { type: [Number], default: [1] }, // Array of unlocked level numbers
    levelScores: {
        type: Map,
        of: levelScoreSchema,
        default: () => ({
            '1': { attempts: 0, bestScore: 0, completed: false, completedAt: null },
            '2': { attempts: 0, bestScore: 0, completed: false, completedAt: null },
            '3': { attempts: 0, bestScore: 0, completed: false, completedAt: null },
            '4': { attempts: 0, bestScore: 0, completed: false, completedAt: null }
        })
    },
    totalPointsEarned: { type: Number, default: 0 },
    completionPercentage: { type: Number, default: 0 }, // Based on levels completed
    isCompleted: { type: Boolean, default: false }, // All levels completed
    completedAt: { type: Date, default: null },
    startedAt: { type: Date, default: Date.now },
    lastAttemptAt: { type: Date, default: null },
}, { timestamps: true });

// Ensure unique user + subject combination
levelProgressSchema.index({ user: 1, subject: 1 }, { unique: true });

module.exports = mongoose.model('LevelProgress', levelProgressSchema);
