const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
    conversationId: { type: mongoose.Schema.Types.ObjectId, ref: 'ChatModule_Conversation', required: true },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    text: { type: String, required: true },
    fileUrl: { type: String, default: null },
    fileType: { type: String, default: null },
    read: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('ChatModule_Message', MessageSchema);
