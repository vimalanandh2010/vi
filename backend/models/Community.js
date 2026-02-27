const mongoose = require('mongoose');

const PostSchema = new mongoose.Schema({
    author: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    community: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Community',
        required: false // Optional for global feed posts
    },
    content: {
        type: String,
        required: true
    },
    image: {
        type: String
    },
    type: {
        type: String,
        enum: ['question', 'tip', 'poll', 'experience', 'announcement', 'discussion'],
        default: 'experience'
    },
    title: {
        type: String,
        required: false
    },
    tags: [{
        type: String
    }],
    likes: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    comments: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        },
        text: String,
        createdAt: {
            type: Date,
            default: Date.now
        }
    }],
    pollOptions: [{
        option: String,
        votes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
    }]
}, { timestamps: true });

const CommunitySchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        unique: true
    },
    description: {
        type: String,
        required: true
    },
    creator: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    members: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    }],
    isPrivate: {
        type: Boolean,
        default: false
    },
    tags: [{
        type: String
    }],
    icon: {
        type: String
    },
    banner: {
        type: String
    },
    status: {
        type: String,
        enum: ['active', 'inactive'],
        default: 'active'
    }
}, { timestamps: true });

const Community = mongoose.model('Community', CommunitySchema);
const Post = mongoose.model('Post', PostSchema);

module.exports = { Community, Post };
