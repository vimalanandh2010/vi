const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: { type: String, required: true },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company',
        required: true
    },
    companyName: { type: String }, // Optional: fallback or display name
    location: { type: String, required: true },
    type: { type: String, enum: ['Full Time', 'Part Time', 'Remote', 'Hybrid', 'Contract', 'Internship', 'Freelance'], default: 'Full Time' },
    salary: { type: String },
    description: { type: String },
    minSalary: { type: Number },
    maxSalary: { type: Number },
    experienceLevel: { type: String, enum: ['Entry Level', 'Mid-Senior Level', 'Senior Level', 'Expert/Principal'], default: 'Entry Level' },
    tags: [String],
    requiredSkills: [String],
    requirements: [String],
    posterUrl: { type: String, default: '' },
    category: {
        type: String,
        enum: [
            'IT',
            'Non-IT',
            'IT & Technology',
            'Software Engineering',
            'DevOps',
            'Engineering',
            'Design',
            'Marketing',
            'Sales',
            'Product',
            'Operations',
            'Customer Success',
            'Customer Service',
            'Finance',
            'HR',
            'Human Resources',
            'Data & Analytics',
            'Data Science',
            'Education',
            'Healthcare',
            'Legal',
            'Retail',
            'Hospitality',
            'Other'
        ],
        default: 'Other'
    },
    status: { type: String, enum: ['active', 'pending', 'closed'], default: 'active' },
    postedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // Analytics fields
    views: { type: Number, default: 0 },
    uniqueViews: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    analytics: {
        totalApplications: { type: Number, default: 0 },
        viewToApplicationRate: { type: Number, default: 0 },
        averageTimeToApply: { type: Number, default: 0 }, // in hours
        applicantQuality: {
            entry: { type: Number, default: 0 },
            mid: { type: Number, default: 0 },
            senior: { type: Number, default: 0 },
            expert: { type: Number, default: 0 }
        },
        dailyViews: [{ date: Date, count: Number }],
        dailyApplications: [{ date: Date, count: Number }]
    }
}, { timestamps: true, toJSON: { virtuals: true }, toObject: { virtuals: true } });

// Virtual for applicants
jobSchema.virtual('applicants', {
    ref: 'Application',
    localField: '_id',
    foreignField: 'job'
});

module.exports = mongoose.model('Job', jobSchema);
