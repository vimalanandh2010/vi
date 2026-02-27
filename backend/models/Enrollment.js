const mongoose = require('mongoose');

const enrollmentSchema = new mongoose.Schema({
    course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    status: { type: String, enum: ['enrolled', 'completed', 'dropped'], default: 'enrolled' },
    progress: { type: Number, default: 0 } // Percentage of course completed
}, { timestamps: true });

// Ensure a user can only enroll in a course once
enrollmentSchema.index({ course: 1, user: 1 }, { unique: true });

module.exports = mongoose.model('Enrollment', enrollmentSchema);
