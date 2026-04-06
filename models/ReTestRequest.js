const mongoose = require('mongoose');

const reTestRequestSchema = new mongoose.Schema({
    studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
    taskId: { type: mongoose.Schema.Types.ObjectId, ref: 'Task', default: null },
    score: { type: Number, required: true },
    percentage: { type: Number, required: true },
    reason: { type: String, default: 'Student requested retest after failing' },
    status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
    approvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
    approvalReason: { type: String, default: '' },
    approvalDate: { type: Date, default: null },
    requestedAt: { type: Date, default: Date.now },
    expiresAt: { type: Date, default: () => new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) }, // Expires after 7 days
}, { timestamps: true });

module.exports = mongoose.model('ReTestRequest', reTestRequestSchema);
