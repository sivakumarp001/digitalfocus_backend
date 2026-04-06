const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['student', 'admin'], default: 'student' },
    avatar: { type: String, default: '' },
    streak: { type: Number, default: 0 },
    lastActiveDate: { type: Date, default: null },
    totalFocusMinutes: { type: Number, default: 0 },
    productivityScore: { type: Number, default: 0 },
    cumulativePoints: { type: Number, default: 0 },
    totalRankingPoints: { type: Number, default: 0 }, // For leaderboard ranking
    scoreHistory: [{
        quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
        taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },
        subject: { type: String, default: '' },
        score: { type: Number, default: 0 },
        totalQuestions: { type: Number, default: 0 },
        percentage: { type: Number, default: 0 },
        passed: { type: Boolean, default: false },
        pointsDelta: { type: Number, default: 0 },
        isPractice: { type: Boolean, default: false },
        takenAt: { type: Date, default: Date.now },
    }],
    levelHistory: [{
        subject: { type: String, default: '' },
        level: { type: Number, default: 1 },
        testId: { type: mongoose.Schema.Types.ObjectId, ref: 'LevelTest' },
        score: { type: Number, default: 0 },
        timeTakenSeconds: { type: Number, default: 0 },
        timeBonus: { type: Number, default: 0 },
        totalPoints: { type: Number, default: 0 },
        passed: { type: Boolean, default: false },
        attemptNumber: { type: Number, default: 1 },
        completedAt: { type: Date, default: Date.now },
    }],
    preferences: {
        theme: { type: String, enum: ['light', 'dark'], default: 'light' },
        pomodoroWork: { type: Number, default: 25 },
        pomodoroBreak: { type: Number, default: 5 },
        notifications: { type: Boolean, default: true },
    },
}, { timestamps: true });

userSchema.pre('save', async function () {
    if (!this.isModified('password')) return;
    this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
