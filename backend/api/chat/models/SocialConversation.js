const mongoose = require('mongoose');

const SocialConversationSchema = new mongoose.Schema({
    participants: {
        type: [String], // Array of two chat_handles (e.g., ["@john", "@jane"])
        required: true,
        validate: {
            validator: arr => arr.length === 2,
            message: 'Conversation must have exactly 2 participants'
        }
    },
    lastMessage: {
        text: { type: String, default: '' },
        sender_handle: { type: String, default: '' },
        timestamp: { type: Date, default: Date.now }
    }
}, { timestamps: true });

SocialConversationSchema.index({ participants: 1 });

module.exports = mongoose.model('SocialConversation', SocialConversationSchema);
