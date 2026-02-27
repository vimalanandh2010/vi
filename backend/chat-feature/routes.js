const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const ChatProfile = require('./ChatProfile');
const Conversation = require('./Conversation');
const Message = require('./Message');
const User = require('../models/User');

let ioInstance;
const setSocketIO = (io) => { ioInstance = io; };

// 1. Health Check
router.get('/test', (req, res) => {
    res.json({ message: "Chat API is working - 404 resolved!" });
});

// 2. Unique Username Logic
router.post('/register-handle', auth, async (req, res) => {
    const { chat_username } = req.body;
    if (!chat_username) return res.status(400).json({ message: 'chat_username is required' });

    const uname = chat_username.toLowerCase().trim();
    try {
        const conflict = await ChatProfile.findOne({ chat_username: uname });
        if (conflict && conflict.userId.toString() !== req.user.id) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        const user = await User.findById(req.user.id).select('firstName lastName photoUrl');
        const profile = await ChatProfile.findOneAndUpdate(
            { userId: req.user.id },
            {
                userId: req.user.id,
                chat_username: uname,
                displayName: `${user?.firstName || ''} ${user?.lastName || ''}`.trim(),
                avatar: user?.photoUrl || ''
            },
            { upsert: true, new: true, runValidators: true }
        );
        res.json(profile);
    } catch (err) {
        if (err.code === 11000) return res.status(400).json({ message: 'Username already taken' });
        res.status(500).json({ message: 'Server error' });
    }
});

// Search Users
router.get('/search', auth, async (req, res) => {
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

// Get My Profile
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await ChatProfile.findOne({ userId: req.user.id });
        res.json(profile || null);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Get Conversations
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

// Start or Get Conversation
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

// Get Messages
router.get('/conversations/:id/messages', auth, async (req, res) => {
    try {
        const messages = await Message.find({ conversationId: req.params.id }).sort({ createdAt: 1 }).lean();
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Send Message
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
            ioInstance.to(recipient).emit('receiveMessage', { conversationId: convo._id, message });
        }

        res.status(201).json(message);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = { router, setSocketIO };
