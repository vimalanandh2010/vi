const mongoose = require('mongoose');

const ChatProfileSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
    },
    chat_handle: {
        type: String,
        required: true,
        unique: true,
        lowercase: true,
        trim: true,
        match: [/^@[a-z0-9_]{3,24}$/, 'Handle must start with @ and be 3-24 chars: letters, numbers, underscore only']
    },
    displayName: {
        type: String,
        trim: true
    },
    avatar: {
        type: String
    }
}, { timestamps: true });

ChatProfileSchema.index({ chat_handle: 'text', displayName: 'text' });

module.exports = mongoose.model('ChatProfile', ChatProfileSchema);
