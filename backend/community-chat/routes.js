const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

const ChatProfile = require('./models/ChatProfile');
const Conversation = require('./models/Conversation');
const Message = require('./models/Message');
const Community = require('./models/Community');
const User = require('../models/User');

let ioInstance;
const setSocketIO = (io) => { ioInstance = io; };

// ─────────────────────────────────────────────────────────────────────────────
// 1. CHAT PROFILE & SETUP LOGIC
// ─────────────────────────────────────────────────────────────────────────────

router.get('/test', (req, res) => {
    res.json({ message: "Community & Chat Module API is working!" });
});

router.post('/register-handle', auth, async (req, res) => {
    const { chat_username } = req.body;
    if (!chat_username) return res.status(400).json({ message: 'chat_username is required' });

    const uname = chat_username.toLowerCase().trim();
    try {
        const conflict = await ChatProfile.findOne({ chat_username: uname });
        if (conflict && conflict.userId.toString() !== req.user.id) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        const user = await User.findById(req.user.id).select('firstName lastName role');
        const profile = await ChatProfile.findOneAndUpdate(
            { userId: req.user.id },
            {
                userId: req.user.id,
                chat_username: uname,
                displayName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
                role: user?.role || 'seeker'
            },
            { upsert: true, new: true, runValidators: true }
        );
        res.json(profile);
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ message: 'Username already taken' });
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/me', auth, async (req, res) => {
    try {
        const profile = await ChatProfile.findOne({ userId: req.user.id });
        res.json(profile || null);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/search-users', auth, async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json([]);
    try {
        const myProfile = await ChatProfile.findOne({ userId: req.user.id });
        const results = await ChatProfile.find({
            chat_username: { $regex: q.toLowerCase().trim(), $options: 'i' },
            ...(myProfile ? { chat_username: { $ne: myProfile.chat_username } } : {})
        }).limit(10).lean();
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});


// ─────────────────────────────────────────────────────────────────────────────
// 2. 1-ON-1 PRIVATE MESSAGING (INSTAGRAM STYLE)
// ─────────────────────────────────────────────────────────────────────────────

router.get('/conversations', auth, async (req, res) => {
    try {
        const myProfile = await ChatProfile.findOne({ userId: req.user.id });
        if (!myProfile) return res.json([]);
        const convos = await Conversation.find({ participants: myProfile.chat_username }).sort({ updatedAt: -1 }).lean();
        res.json(convos);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/conversations/start', auth, async (req, res) => {
    const { target_username } = req.body;
    try {
        const myProfile = await ChatProfile.findOne({ userId: req.user.id });
        if (!myProfile) return res.status(400).json({ message: 'Set up username first' });

        const sorted = [myProfile.chat_username, target_username.toLowerCase().trim()].sort();
        let convo = await Conversation.findOne({ participants: { $all: sorted, $size: 2 } });
        if (!convo) convo = await Conversation.create({ participants: sorted, lastMessage: { content: '', sender: '', timestamp: new Date() } });

        res.json({ conversation: convo });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/conversations/:id/messages', auth, async (req, res) => {
    try {
        const messages = await Message.find({ conversationId: req.params.id }).sort({ createdAt: 1 }).lean();
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/conversations/:id/messages', auth, async (req, res) => {
    try {
        const myProfile = await ChatProfile.findOne({ userId: req.user.id });
        const convo = await Conversation.findById(req.params.id);
        if (!convo || !convo.participants.includes(myProfile.chat_username)) return res.status(403).json({ message: 'Unauthorized' });

        const message = await Message.create({
            conversationId: convo._id,
            sender: myProfile.chat_username,
            content: req.body.content,
            read: false
        });

        convo.lastMessage = { content: req.body.content, sender: myProfile.chat_username, timestamp: message.createdAt };
        await convo.save();

        const recipient = convo.participants.find(p => p !== myProfile.chat_username);
        if (ioInstance && recipient) {
            ioInstance.to(recipient).emit('receivePrivateMessage', { conversationId: convo._id, message });
        }

        res.status(201).json(message);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ─────────────────────────────────────────────────────────────────────────────
// 3. COMMUNITY LOGIC (Recruiter = Create, Seeker = View/Comment)
// ─────────────────────────────────────────────────────────────────────────────

router.get('/community', auth, async (req, res) => {
    try {
        const communities = await Community.find().sort({ createdAt: -1 }).populate('createdBy', 'firstName lastName');
        res.json(communities);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/community', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user.role !== 'recruiter' && user.role !== 'employer') {
            return res.status(403).json({ message: 'Only recruiters can create a community' });
        }

        const { title, description } = req.body;
        if (!title || !description) return res.status(400).json({ message: 'Title and description required' });

        const community = await Community.create({
            title,
            description,
            createdBy: req.user.id,
            comments: []
        });

        res.status(201).json(community);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/community/:id/comment', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        const { content } = req.body;
        if (!content) return res.status(400).json({ message: 'Comment content required' });

        const community = await Community.findById(req.params.id);
        if (!community) return res.status(404).json({ message: 'Community not found' });

        const newComment = {
            userId: req.user.id,
            displayName: `${user.firstName} ${user.lastName}`.trim(),
            content,
            createdAt: new Date()
        };

        community.comments.push(newComment);
        await community.save();

        if (ioInstance) {
            ioInstance.to(`community_${community._id}`).emit('newCommunityComment', {
                communityId: community._id,
                comment: newComment
            });
        }

        res.status(201).json(newComment);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.get('/recruiter-stats', auth, async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user.role !== 'recruiter' && user.role !== 'employer') {
            return res.status(403).json({ message: 'Only accessible by recruiters' });
        }

        const count = await Community.countDocuments({ createdBy: req.user.id });
        res.json({ totalCommunitiesCreated: count });
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = { router, setSocketIO };
