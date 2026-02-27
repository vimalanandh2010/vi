const express = require('express');
const router = express.Router();
const auth = require('../../middleware/auth');
const ChatProfile = require('./models/ChatProfile');
const SocialConversation = require('./models/SocialConversation');
const SocialMessage = require('./models/SocialMessage');
const User = require('../../models/User');
const { emitSocialMessage } = require('./socketHandlers');

// ── PROFILE ──────────────────────────────────────────────

router.get('/profile/me', auth, async (req, res) => {
    try {
        const profile = await ChatProfile.findOne({ userId: req.user.id });
        res.json(profile);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/profile/setup', auth, async (req, res) => {
    const { chat_handle, displayName } = req.body;
    if (!chat_handle) return res.status(400).json({ message: 'Handle is required' });

    const handle = chat_handle.toLowerCase().trim().startsWith('@') ? chat_handle.toLowerCase().trim() : `@${chat_handle.toLowerCase().trim()}`;

    if (!/^@[a-z0-9_]{3,24}$/.test(handle)) {
        return res.status(400).json({ message: 'Invalid handle format' });
    }

    try {
        const existing = await ChatProfile.findOne({ chat_handle: handle });
        if (existing && existing.userId.toString() !== req.user.id) {
            return res.status(400).json({ message: 'Handle already taken' });
        }

        const user = await User.findById(req.user.id);
        const profile = await ChatProfile.findOneAndUpdate(
            { userId: req.user.id },
            {
                chat_handle: handle,
                displayName: displayName || `${user.firstName} ${user.lastName}`,
                avatar: user.photoUrl
            },
            { upsert: true, new: true }
        );
        res.json(profile);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ── SEARCH ───────────────────────────────────────────────

router.get('/search', auth, async (req, res) => {
    const { q } = req.query;
    if (!q) return res.json([]);

    try {
        const term = q.startsWith('@') ? q.toLowerCase() : `@${q.toLowerCase()}`;
        const results = await ChatProfile.find({
            $or: [
                { chat_handle: { $regex: term, $options: 'i' } },
                { displayName: { $regex: q, $options: 'i' } }
            ],
            userId: { $ne: req.user.id }
        }).limit(10);
        res.json(results);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ── CONVERSATIONS ────────────────────────────────────────

router.get('/conversations', auth, async (req, res) => {
    try {
        const profile = await ChatProfile.findOne({ userId: req.user.id });
        if (!profile) return res.json([]);

        const conversations = await SocialConversation.find({
            participants: profile.chat_handle
        }).sort({ updatedAt: -1 });

        res.json(conversations);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/conversations/start', auth, async (req, res) => {
    const { target_handle } = req.body;
    try {
        const myProfile = await ChatProfile.findOne({ userId: req.user.id });
        const targetProfile = await ChatProfile.findOne({ chat_handle: target_handle });

        if (!myProfile || !targetProfile) return res.status(404).json({ message: 'Profile not found' });

        const sorted = [myProfile.chat_handle, targetProfile.chat_handle].sort();
        let convo = await SocialConversation.findOne({ participants: sorted });

        if (!convo) {
            convo = await SocialConversation.create({ participants: sorted });
        }
        res.json(convo);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

// ── MESSAGES ─────────────────────────────────────────────

router.get('/conversations/:id/messages', auth, async (req, res) => {
    try {
        const messages = await SocialMessage.find({ conversationId: req.params.id }).sort({ createdAt: 1 });
        res.json(messages);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

router.post('/conversations/:id/messages', auth, async (req, res) => {
    const { text, receiver_handle } = req.body;
    try {
        const senderProfile = await ChatProfile.findOne({ userId: req.user.id });
        if (!senderProfile) return res.status(403).json({ message: 'No chat profile' });

        const message = await SocialMessage.create({
            conversationId: req.params.id,
            sender_handle: senderProfile.chat_handle,
            receiver_handle,
            message_text: text
        });

        await SocialConversation.findByIdAndUpdate(req.params.id, {
            lastMessage: {
                text,
                sender_handle: senderProfile.chat_handle,
                timestamp: Date.now()
            }
        });

        // Emit via socket
        emitSocialMessage(receiver_handle, {
            conversationId: req.params.id,
            message
        });

        res.json(message);
    } catch (err) {
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
