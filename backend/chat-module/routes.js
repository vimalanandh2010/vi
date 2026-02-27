const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const mongoose = require('mongoose');

const Conversation = require('./models/Conversation');
const Message = require('./models/Message');
const ChatProfile = require('./models/ChatProfile');
const User = require('../models/User');
const multer = require('multer');
const { uploadFile } = require('../utils/uploadService');
const storage = multer.memoryStorage();
const upload = multer({ storage });

let ioInstance;
const setSocketIO = (io) => { ioInstance = io; };

// Get the user's Chat Profile (to determine if they need to see the "Create ID" screen)
router.get('/me', auth, async (req, res) => {
    try {
        const profile = await ChatProfile.findOne({ userId: req.user.id });
        res.json(profile || null);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// Register a handle
router.post('/register-handle', auth, async (req, res) => {
    const { chat_username } = req.body;
    if (!chat_username) return res.status(400).json({ message: 'Username required' });
    const uname = chat_username.toLowerCase().trim();
    try {
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
        console.error("REGISTER HANDLE ERR:", err);
        if (err.code === 11000) return res.status(400).json({ message: 'Username already taken' });
        res.status(500).json({ message: 'Server error registering handle', error: err.message });
    }
});

// Search for Seekers and Recruiters
router.get('/search', auth, async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json([]);
    try {
        const users = await User.find({
            $or: [
                { firstName: { $regex: q.trim(), $options: 'i' } },
                { lastName: { $regex: q.trim(), $options: 'i' } },
                { email: { $regex: q.trim(), $options: 'i' } }
            ],
            _id: { $ne: req.user.id }
        }).select('firstName lastName role profilePic').limit(20).lean();

        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error during search' });
    }
});

// Get all active chat threads for the logged-in user
router.get('/conversations', auth, async (req, res) => {
    try {
        const convos = await Conversation.find({ participants: req.user.id })
            .populate('participants', 'firstName lastName role profilePic')
            .sort({ updatedAt: -1 })
            .lean();
        res.json(convos);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error loading conversations' });
    }
});

// Start a conversation with a specific User ID
router.post('/conversations/start', auth, async (req, res) => {
    const { targetUserId } = req.body;
    if (!targetUserId) return res.status(400).json({ message: 'Target user ID is required' });

    try {
        const participants = [req.user.id, targetUserId].sort(); // Sort to ensure uniqueness consistency
        let convo = await Conversation.findOne({ participants: { $all: participants, $size: 2 } });

        if (!convo) {
            convo = await Conversation.create({
                participants,
                lastMessage: { text: '', sender: null, timestamp: new Date() }
            });
        }

        // Populate participants to send back full details for the header
        const populatedConvo = await Conversation.findById(convo._id).populate('participants', 'firstName lastName role profilePic').lean();
        res.json({ conversation: populatedConvo });
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error starting conversation' });
    }
});

// Get all messages in a specific conversation
router.get('/conversations/:id/messages', auth, async (req, res) => {
    try {
        const messages = await Message.find({ conversationId: req.params.id }).sort({ createdAt: 1 }).lean();
        res.json(messages);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error loading messages' });
    }
});

// Send a message in a conversation
router.post('/conversations/:id/messages', auth, upload.single('file'), async (req, res) => {
    try {
        const convo = await Conversation.findById(req.params.id);
        if (!convo || !convo.participants.includes(req.user.id)) {
            return res.status(403).json({ message: 'Unauthorized to post in this conversation' });
        }

        let fileUrl = null;
        let fileType = null;
        if (req.file) {
            const folder = req.file.mimetype.startsWith('image/') ? 'photos' : 'resumes';
            fileUrl = await uploadFile(req.file, folder);
            fileType = req.file.mimetype.startsWith('image/') ? 'image' : 'file';
        }

        // Allow sending message with just attachment OR text
        if (!req.body.text && !fileUrl) {
            return res.status(400).json({ message: 'Message content or file is required' });
        }

        const message = await Message.create({
            conversationId: convo._id,
            sender: req.user.id,
            text: req.body.text || (fileType === 'image' ? 'Sent an image' : 'Sent a file'),
            fileUrl,
            fileType,
            read: false
        });

        convo.lastMessage = {
            text: message.text,
            sender: req.user.id,
            timestamp: message.createdAt
        };
        await convo.save();

        const recipientId = convo.participants.find(p => p.toString() !== req.user.id.toString());

        // Emit private message to recipient's room
        if (ioInstance && recipientId) {
            ioInstance.to(recipientId.toString()).emit('receivePrivateMessage', {
                conversationId: convo._id,
                message
            });
        }

        res.status(201).json(message);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error sending message' });
    }
});

module.exports = { router, setSocketIO };
