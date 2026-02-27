const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Chat = require('../models/Chat');
const User = require('../models/User');
const { emitMessage } = require('../utils/socket');

// @route   GET /api/chat
// @desc    Get all chats for the logged-in user
router.get('/', auth, async (req, res) => {
    try {
        const chats = await Chat.find({
            participants: req.user.id
        }).populate('participants', 'firstName lastName photoUrl role jobPreferences')
            .sort({ updatedAt: -1 });
        res.json(chats);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/chat
// @desc    Start a new chat or get existing
router.post('/', auth, async (req, res) => {
    const { participantId } = req.body;
    try {
        let chat = await Chat.findOne({
            participants: { $all: [req.user.id, participantId], $size: 2 }
        });

        if (chat) return res.json(chat);

        chat = new Chat({
            participants: [req.user.id, participantId],
            messages: []
        });

        await chat.save();
        res.status(201).json(chat);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/chat/:id/message
// @desc    Send a message
router.post('/:id/message', auth, async (req, res) => {
    const { content } = req.body;
    try {
        const chat = await Chat.findById(req.params.id);
        if (!chat) return res.status(404).json({ message: 'Chat not found' });

        const newMessage = {
            sender: req.user.id,
            content,
            read: false,
            timestamp: new Date()
        };

        chat.messages.push(newMessage);
        chat.lastMessage = {
            content,
            sender: req.user.id,
            timestamp: new Date()
        };

        await chat.save();

        // Emit real-time message to recipient
        const recipient = chat.participants.find(p => p.toString() !== req.user.id);
        if (recipient) {
            emitMessage(recipient.toString(), {
                chatId: chat._id,
                message: newMessage
            });
        }

        res.json(chat);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   PUT /api/chat/:id/seen
// @desc    Mark all messages in a chat as seen
router.put('/:id/seen', auth, async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.id);
        if (!chat) return res.status(404).json({ message: 'Chat not found' });

        chat.messages.forEach(msg => {
            if (msg.sender.toString() !== req.user.id) {
                msg.read = true;
            }
        });

        await chat.save();
        res.json({ success: true });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/chat/check-id/:id
// @desc    Check if a chatId is available
router.get('/check-id/:id', auth, async (req, res) => {
    try {
        const user = await User.findOne({ chatId: req.params.id.toLowerCase() });
        res.json({ available: !user });
    } catch (err) {
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/chat/set-id
// @desc    Set or update user's chatId
router.post('/set-id', auth, async (req, res) => {
    const { chatId } = req.body;

    // Basic validation
    const regex = /^[a-z0-9_]{3,20}$/;
    if (!regex.test(chatId)) {
        return res.status(400).json({ message: 'Invalid Chat ID format' });
    }

    try {
        // Check if ID is taken by someone else
        const existingUser = await User.findOne({ chatId: chatId.toLowerCase() });
        if (existingUser && existingUser._id.toString() !== req.user.id) {
            return res.status(400).json({ message: 'Chat ID already taken' });
        }

        const user = await User.findById(req.user.id);
        user.chatId = chatId.toLowerCase();
        await user.save();

        res.json({ success: true, chatId: user.chatId });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/chat/search
// @desc    Search for users by chatId or email
router.get('/search', auth, async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json([]);

    try {
        const query = q.toLowerCase();
        const users = await User.find({
            $and: [
                { _id: { $ne: req.user.id } }, // Exclude self
                {
                    $or: [
                        { chatId: { $regex: query, $options: 'i' } },
                        { email: { $regex: query, $options: 'i' } },
                        { firstName: { $regex: query, $options: 'i' } },
                        { lastName: { $regex: query, $options: 'i' } }
                    ]
                }
            ]
        }).select('firstName lastName photoUrl role chatId email').limit(10);

        res.json(users);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

// @route   DELETE /api/chat/:id
// @desc    Delete a chat conversation
router.delete('/:id', auth, async (req, res) => {
    try {
        const chat = await Chat.findById(req.params.id);
        if (!chat) return res.status(404).json({ message: 'Chat not found' });

        // Ensure user is a participant
        if (!chat.participants.includes(req.user.id)) {
            return res.status(401).json({ message: 'Unauthorized' });
        }

        await Chat.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: 'Conversation deleted' });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
});

module.exports = router;
