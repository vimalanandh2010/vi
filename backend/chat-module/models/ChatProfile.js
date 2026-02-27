const mongoose = require('mongoose');

const ChatProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    chat_username: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^[a-z0-9_]{3,24}$/, 'Username must be 3-24 chars: letters, numbers, underscore only']
    },
    displayName: {
        type: String,
        trim: true
    },
    avatar: {
        type: String  // URL
    },
    role: {
        type: String,
        enum: ['seeker', 'employer', 'recruiter', 'admin'],
        default: 'seeker'
    }
}, { timestamps: true });

// Index for fast username searches
ChatProfileSchema.index({ chat_username: 'text' });

module.exports = mongoose.model('ChatProfile', ChatProfileSchema);
