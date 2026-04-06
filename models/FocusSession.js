const mongoose = require('mongoose');

const focusSessionSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startTime: { type: Date, required: true },
    endTime: { type: Date, default: null },
    duration: { type: Number, default: 0 }, // in minutes
    plannedDuration: { type: Number, default: 25 }, // in minutes
    mode: { type: String, enum: ['work', 'break'], default: 'work' },
    completed: { type: Boolean, default: false },
    distractions: { type: Number, default: 0 },
    notes: { type: String, default: '' },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },
}, { timestamps: true });

module.exports = mongoose.model('FocusSession', focusSessionSchema);
