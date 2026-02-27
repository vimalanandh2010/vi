const mongoose = require('mongoose');

const CommentSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    displayName: String,
    content: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

const CommunitySchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, // Recruiter ID
    comments: [CommentSchema]
}, { timestamps: true });

module.exports = mongoose.model('CC_Community', CommunitySchema);
