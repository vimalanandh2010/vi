const mongoose = require('mongoose');

const SocialMessageSchema = new mongoose.Schema({
    conversationId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'SocialConversation',
        required: true,
        index: true
    },
    sender_handle: {
        type: String,
        required: true,
        index: true
    },
    receiver_handle: {
        type: String,
        required: true,
        index: true
    },
    message_text: {
        type: String,
        required: true,
        maxlength: 5000
    },
    read: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

module.exports = mongoose.model('SocialMessage', SocialMessageSchema);
