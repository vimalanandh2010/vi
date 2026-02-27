const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const recruiterAuth = require('../middleware/recruiterAuth');
const { Community, Post } = require('../models/Community');
const User = require('../models/User');

// @route   GET /api/community
// @desc    Get all public communities and joined communities
router.get('/', auth, async (req, res) => {
    try {
        // Find public communities OR communities where the user is a member
        const communities = await Community.find({
            $or: [
                { isPrivate: false },
                { members: req.user.id }
            ],
            status: 'active'
        })
            .populate('creator', 'firstName lastName photoUrl')
            .sort({ createdAt: -1 });

        // Add role metadata to each community
        const communitiesWithMetadata = communities.map(comm => {
            const commObj = comm.toObject();
            commObj.isMember = comm.members.some(id => id.toString() === req.user.id);
            commObj.currentUserRole = req.user.role; // This is the user's global role
            return commObj;
        });

        res.json(communitiesWithMetadata);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/community/my-communities
// @desc    Get communities where user is a member
router.get('/my-communities', auth, async (req, res) => {
    try {
        const communities = await Community.find({
            members: req.user.id,
            status: 'active'
        })
            .populate('creator', 'firstName lastName photoUrl')
            .sort({ createdAt: -1 });

        const communitiesWithMetadata = communities.map(comm => {
            const commObj = comm.toObject();
            commObj.isMember = true;
            commObj.currentUserRole = req.user.role;
            return commObj;
        });

        res.json(communitiesWithMetadata);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/community
// @desc    Create a new community (Recruiter only)
router.post('/', recruiterAuth, async (req, res) => {
    const { name, description, isPrivate, tags, icon, member_ids } = req.body;
    try {
        const user = await User.findById(req.user.id).populate('company');
        if (!user.company || !['verified', 'pending'].includes(user.company.verificationStatus)) {
            return res.status(403).json({
                message: 'Your company must be verified or pending verification before you can create a community. Please check your verification status in the dashboard.'
            });
        }

        // Ensure current user is in members and filter out any invalid/duplicate IDs
        const initialMembers = Array.isArray(member_ids)
            ? [...new Set([req.user.id, ...member_ids])]
            : [req.user.id];

        const communityCount = await Community.countDocuments({ name });
        const finalName = communityCount > 0 ? `${name} #${communityCount + 1}` : name;

        const community = new Community({
            name: finalName,
            description,
            isPrivate,
            tags,
            icon,
            creator: req.user.id,
            members: initialMembers,
            status: 'active'
        });
        await community.save();
        res.status(201).json(community);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/community/join/:id
// @desc    Join a community
router.post('/join/:id', auth, async (req, res) => {
    try {
        const community = await Community.findById(req.params.id);
        if (!community) return res.status(404).json({ message: 'Community not found' });

        if (community.members.includes(req.user.id)) {
            return res.status(400).json({ message: 'Already a member' });
        }

        community.members.push(req.user.id);
        await community.save();
        res.json(community);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/community/leave/:id
// @desc    Leave a community
router.post('/leave/:id', auth, async (req, res) => {
    try {
        const community = await Community.findById(req.params.id);
        if (!community) return res.status(404).json({ message: 'Community not found' });

        const index = community.members.indexOf(req.user.id);
        if (index === -1) {
            return res.status(400).json({ message: 'Not a member' });
        }

        community.members.splice(index, 1);
        await community.save();
        res.json(community);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/community/feed
// @desc    Get global recruiter feed
router.get('/feed', auth, async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('author', 'firstName lastName photoUrl role')
            .populate('community', 'name icon')
            .sort({ createdAt: -1 })
            .limit(50);
        res.json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/community/:id/posts
// @desc    Create a post in a community
router.post('/:id/posts', auth, async (req, res) => {
    const { content, type, tags, title } = req.body;
    try {
        const community = await Community.findById(req.params.id);
        if (!community) return res.status(404).json({ message: 'Community not found' });

        const post = new Post({
            author: req.user.id,
            community: req.params.id,
            content,
            type,
            tags,
            title
        });

        await post.save();
        res.status(201).json(post);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/community/posts/:id/vote
// @desc    Vote in a poll
router.post('/posts/:id/vote', auth, async (req, res) => {
    const { optionIndex } = req.body;
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });
        if (post.type !== 'poll') return res.status(400).json({ message: 'Not a poll' });

        // Remove previous vote if any
        post.pollOptions.forEach(opt => {
            const idx = opt.votes.indexOf(req.user.id);
            if (idx !== -1) opt.votes.splice(idx, 1);
        });

        // Add new vote
        if (optionIndex !== undefined && post.pollOptions[optionIndex]) {
            post.pollOptions[optionIndex].votes.push(req.user.id);
        }

        await post.save();
        res.json(post);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/community/posts/:id/like
// @desc    Like or unlike a post
router.post('/posts/:id/like', auth, async (req, res) => {
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        const index = post.likes.indexOf(req.user.id);
        if (index === -1) {
            post.likes.push(req.user.id);
        } else {
            post.likes.splice(index, 1);
        }

        await post.save();
        res.json(post);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   POST /api/community/posts/:id/comment
// @desc    Add a comment to a post
router.post('/posts/:id/comment', auth, async (req, res) => {
    const { text } = req.body;
    try {
        const post = await Post.findById(req.params.id);
        if (!post) return res.status(404).json({ message: 'Post not found' });

        post.comments.push({
            user: req.user.id,
            text
        });

        await post.save();
        res.json(post);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/community/:id
// @desc    Get community by ID
router.get('/:id', auth, async (req, res) => {
    try {
        const community = await Community.findById(req.params.id)
            .populate('creator', 'firstName lastName photoUrl')
            .populate('members', 'firstName lastName photoUrl role');
        if (!community) return res.status(404).json({ message: 'Community not found' });
        res.json(community);
    } catch (err) {
        console.error(err);
        if (err.kind === 'ObjectId') return res.status(404).json({ message: 'Community not found' });
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/community/:id/stats
// @desc    Get community statistics
router.get('/:id/stats', auth, async (req, res) => {
    try {
        const community = await Community.findById(req.params.id);
        if (!community) return res.status(404).json({ message: 'Community not found' });

        const postCount = await Post.countDocuments({ community: req.params.id });
        const activeDiscussions = await Post.countDocuments({
            community: req.params.id,
            createdAt: { $gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) } // Last 7 days
        });

        res.json({
            memberCount: community.members.length,
            postCount,
            activeDiscussions
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

// @route   GET /api/community/:id/posts
// @desc    Get posts for a specific community
router.get('/:id/posts', auth, async (req, res) => {
    try {
        const posts = await Post.find({ community: req.params.id })
            .populate('author', 'firstName lastName photoUrl role')
            .sort({ createdAt: -1 });
        res.json(posts);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;

