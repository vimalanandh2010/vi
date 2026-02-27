const mongoose = require('mongoose');

const ChatProfileSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    chat_username: { type: String, required: true, unique: true, lowercase: true, trim: true },
    displayName: String,
    role: String
}, { timestamps: true });

ChatProfileSchema.index({ chat_username: 'text' });

module.exports = mongoose.model('CC_ChatProfile', ChatProfileSchema);
