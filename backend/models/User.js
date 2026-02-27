const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    firstName: { type: String, required: true },
    lastName: { type: String, default: '' },
    email: { type: String, required: true },
    password: { type: String }, // Optional for Google OAuth users
    googleId: { type: String, sparse: true },
    authProvider: { type: String, enum: ['local', 'google'], default: 'local' },
    isEmailVerified: { type: Boolean, default: false },
    phoneNumber: { type: String, default: '' },
    experienceLevel: { type: String, enum: ['fresher', 'entry', 'mid', 'senior', 'expert', 'principal', 'experienced'], default: 'fresher' },
    agreeToContact: { type: Boolean, default: false },
    role: { type: String, enum: ['seeker', 'employer', 'admin'], default: 'seeker' },
    // OTP Authentication
    otp: { type: String }, // Hashed OTP
    otpExpiry: { type: Date },
    companyName: { type: String, default: '' },
    website: { type: String, default: '' },
    company: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Company'
    },
    preferredRole: { type: String, default: '' },
    skills: [{ type: String }],
    isBlocked: { type: Boolean, default: false },
    resumeUrl: { type: String, default: '' },
    photoUrl: { type: String, default: '' },
    socialLinks: {
        linkedin: { type: String, default: '' },
        github: { type: String, default: '' },
        portfolio: { type: String, default: '' }
    },
    jobPreferences: {
        preferredRole: { type: String, default: '' },
        minSalary: { type: Number, default: 0 },
        maxSalary: { type: Number, default: 0 },
        jobTypes: [{ type: String, enum: ['Full-Time', 'Part-Time', 'Contract', 'Internship', 'Freelance'] }],
        workplacePreferences: [{ type: String, enum: ['Remote', 'On-Site', 'Hybrid'] }],
        experienceLevels: [{ type: String, enum: ['Entry Level', 'Mid-Level', 'Senior Level', 'Lead/Principal', 'Executive'] }],
        preferredLocation: { type: String, default: '' },
        // Legacy fields for backward compatibility
        jobType: { type: String, enum: ['Full-Time', 'Part-Time', 'Contract', 'Internship', 'Freelance', ''], default: '' },
        workplacePreference: { type: String, enum: ['Remote', 'On-Site', 'Hybrid', ''], default: '' }
    },
    savedJobs: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Job' }],
    profileViews: { type: Number, default: 0 },
    chatId: {
        type: String,
        unique: true,
        sparse: true,
        lowercase: true,
        trim: true,
        minlength: 3,
        maxlength: 20,
        match: [/^[a-z0-9_]+$/, 'Please use only lowercase letters, numbers, and underscores']
    },

    location: { type: String, default: '' },
    primarySkill: { type: String, default: '' },
    aboutMe: { type: String, default: '' },
    experience: [{
        company: { type: String, default: '' },
        role: { type: String, default: '' },
        duration: { type: String, default: '' },
        description: { type: String, default: '' },
        logo: { type: String, default: '' }, // Logo URL or initials
        type: { type: String, enum: ['job', 'internship', 'freelance'], default: 'job' }
    }],
    projects: [{
        title: { type: String, default: '' },
        link: { type: String, default: '' },
        description: { type: String, default: '' },
        technologies: [{ type: String }],
        duration: { type: String, default: '' }
    }],
    education: [{
        institutionName: { type: String, default: '' },
        schoolName: { type: String, default: '' }, // For 10th
        schoolOrCollegeName: { type: String, default: '' }, // For 12th
        degreeName: { type: String, default: '' },
        collegeName: { type: String, default: '' }, // For degree
        yearOfPassing: { type: Number },
        score: { type: String, default: '' },
        level: { type: String, enum: ['10th', '12th', 'Graduation', 'Post-Graduation', 'Diploma', 'Other'], default: 'Graduation' }
    }],
    accomplishments: [{
        title: { type: String, default: '' },
        category: { type: String, enum: ['Hackathon', 'Award', 'Publication', 'Patent', 'Other'], default: 'Other' },
        description: { type: String, default: '' },
        date: { type: String, default: '' }
    }],
    certifications: [{
        name: { type: String, default: '' },
        issuer: { type: String, default: '' },
        date: { type: String, default: '' },
        link: { type: String, default: '' }
    }],
}, { timestamps: true });

// Virtual for profile picture to maintain compatibility with profilePic/photoUrl naming
userSchema.virtual('profilePic').get(function () {
    return this.photoUrl;
});

// Compound indices to allow same email/googleId for different roles
userSchema.index({ email: 1, role: 1 }, { unique: true });
// Fix: Only index googleId if it's present to allow multiple manual users
userSchema.index({ googleId: 1, role: 1 }, {
    unique: true,
    partialFilterExpression: { googleId: { $type: "string" } }
});

// Virtual property to check if profile is complete
userSchema.virtual('isProfileComplete').get(function () {
    return !!(
        this.firstName &&
        this.lastName &&
        this.phoneNumber &&
        this.location &&
        this.experienceLevel &&
        this.primarySkill &&
        this.education?.length > 0 &&
        this.chatId
        // resumeUrl is optional for now to avoid redirect loops
    );
});

// Ensure virtuals are included in JSON responses
userSchema.set('toJSON', { virtuals: true });
userSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('User', userSchema);
