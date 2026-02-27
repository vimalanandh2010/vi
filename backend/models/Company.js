const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Company name is required'],
        trim: true
    },
    logo: {
        type: String,
        default: ''
    },
    about: {
        type: String,
        required: [true, 'Company description is required']
    },
    companyType: {
        type: String,
        enum: ['Startup', 'Unicorn Startup', 'Scale-up', 'MNC', 'Enterprise', 'NGO', 'Government'],
        required: true
    },
    industries: [{
        type: String,
        enum: [
            'IoT', 'AI/ML', 'Web/SaaS', 'FinTech', 'EdTech',
            'Hospital', 'School', 'College/University', 'Healthcare',
            'Manufacturing', 'E-commerce', 'BioTech'
        ]
    }],
    size: {
        type: String, // e.g., "1-10", "11-50", "501-1000", "10000+"
        required: true
    },
    location: {
        type: String,
        required: true
    },
    website: {
        type: String,
        default: ''
    },
    officialEmail: {
        type: String,
        lowercase: true,
        trim: true
    },
    emailDomain: {
        type: String,
        lowercase: true,
        trim: true
    },
    mxValid: {
        type: Boolean,
        default: false
    },
    officialEmailVerified: {
        type: Boolean,
        default: false
    },
    verificationStatus: {
        type: String,
        enum: ['unverified', 'pending', 'verified', 'rejected'],
        default: 'unverified'
    },
    verificationLevel: {
        type: Number,
        default: 0
    },
    trustScore: {
        type: Number,
        default: 0
    },
    verified: {
        type: Boolean,
        default: false
    },
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);
