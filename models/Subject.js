const mongoose = require('mongoose');

const subjectSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true, 
        unique: true,
        enum: [
            'Java',
            'Python',
            'C',
            'C++',
            'React',
            'DBMS',
            'Web Development',
            'Data Structures',
            'Algorithms',
            'Operating Systems',
            'Computer Networks',
            'Machine Learning',
            'Cybersecurity'
        ],
        trim: true 
    },
    description: { type: String, default: '' },
    iconColor: { type: String, default: '#3498db' },
    isActive: { type: Boolean, default: true },
    totalLevels: { type: Number, default: 4 },
    levelNames: {
        type: Map,
        of: String,
        default: () => ({
            '1': 'Beginner',
            '2': 'Intermediate',
            '3': 'Advanced',
            '4': 'Expert'
        })
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now },
}, { timestamps: true });

module.exports = mongoose.model('Subject', subjectSchema);
