const mongoose = require('mongoose');

const goalSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    targetValue: { type: Number, required: true },
    currentValue: { type: Number, default: 0 },
    unit: { type: String, default: 'tasks' }, // e.g., "tasks", "hours", "sessions"
    category: { type: String, enum: ['focus', 'tasks', 'streak', 'custom'], default: 'tasks' },
    deadline: { type: Date },
    achieved: { type: Boolean, default: false },
    achievedAt: { type: Date, default: null },
}, { timestamps: true });

module.exports = mongoose.model('Goal', goalSchema);
