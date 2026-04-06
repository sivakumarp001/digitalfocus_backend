const mongoose = require('mongoose');

const dailyTaskSchema = new mongoose.Schema({
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, default: '' },
    priority: { type: String, enum: ['low', 'medium', 'high'], default: 'medium' },
    category: { type: String, enum: ['study', 'project', 'personal', 'exercise', 'health', 'other'], default: 'personal' },
    taskDate: { 
        type: Date, 
        required: true,
        set: (v) => {
            // Normalize to start of day in user's timezone
            const date = new Date(v);
            date.setHours(0, 0, 0, 0);
            return date;
        },
        get: (v) => {
            if (!v) return null;
            const date = new Date(v);
            date.setHours(0, 0, 0, 0);
            return date;
        }
    },
    completed: { type: Boolean, default: false },
    completedAt: { type: Date, default: null },
    dueTime: { type: String, default: null }, // HH:MM format
    estimatedMinutes: { type: Number, default: 0 },
    actualMinutes: { type: Number, default: 0 },
    tags: [{ type: String }],
    notes: { type: String, default: '' },
    relatedSubject: { 
        type: String, 
        enum: ['Java', 'Python', 'DBMS', 'Web Development', 'Data Structures', 'Algorithms', 'Operating Systems', 'Computer Networks', 'Machine Learning', 'Cybersecurity', null],
        default: null
    },
    relatedLevel: { type: Number, default: null }, // 1-4 for level-based tasks
    reminderSet: { type: Boolean, default: false },
    reminderTime: { type: String, default: null }, // HH:MM format
    isRecurring: { type: Boolean, default: false },
    recurringPattern: { type: String, enum: ['daily', 'weekly', 'monthly', null], default: null },
}, { timestamps: true });

// Index for efficient queries
dailyTaskSchema.index({ user: 1, taskDate: 1 });
dailyTaskSchema.index({ user: 1, completed: 1 });
dailyTaskSchema.index({ taskDate: 1 });

module.exports = mongoose.model('DailyTask', dailyTaskSchema);
