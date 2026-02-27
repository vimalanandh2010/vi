const mongoose = require('mongoose');

const applicationSchema = new mongoose.Schema({
    job: { type: mongoose.Schema.Types.ObjectId, ref: 'Job', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['applied', 'viewed', 'shortlisted', 'qualified', 'screening', 'interview', 'scheduled', 'interviewed', 'selected', 'rejected after interview', 'offer', 'hired', 'rejected', 'cancelled'], default: 'applied' },
    resumeUrl: { type: String, default: '' },
    aiMatchScore: { type: Number },
    aiAnalysis: { type: Object },
    interviewDate: { type: String, default: '' },
    interviewTime: { type: String, default: '' },
    interviewNotes: { type: String, default: '' },
    meetingLink: { type: String, default: '' },
    reminderSent: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Application', applicationSchema);
