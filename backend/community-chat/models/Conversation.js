const mongoose = require('mongoose');

const ConversationSchema = new mongoose.Schema({
    participants: { type: [String], required: true }, // Array of 2 chat_usernames
    lastMessage: { content: String, sender: String, timestamp: Date }
}, { timestamps: true });

ConversationSchema.index({ participants: 1 }, { unique: false });

module.exports = mongoose.model('CC_Conversation', ConversationSchema);
