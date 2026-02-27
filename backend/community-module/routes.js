const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Post = require('./models/Post');
const Comment = require('./models/Comment');
const User = require('../models/User');
const multer = require('multer');
const { uploadFile } = require('../utils/uploadService');
const storage = multer.memoryStorage();
const upload = multer({ storage });

// POST /api/community/posts (Recruiter only)
router.post('/posts', auth, upload.single('image'), async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (user.role !== 'recruiter' && user.role !== 'employer') {
            return res.status(403).json({ message: 'Only recruiters can create posts' });
        }

        let imageUrl = null;
        if (req.file) {
            imageUrl = await uploadFile(req.file, 'photos');
        }

        const { content } = req.body;
        if (!content) return res.status(400).json({ message: 'Content is required' });

        const post = await Post.create({
            recruiterId: req.user.id,
            content,
            image: imageUrl
        });

        const populatedPost = await Post.findById(post._id).populate('recruiterId', 'firstName lastName role profilePic');
        res.status(201).json(populatedPost);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error creating post' });
    }
});

// GET /api/community/posts (All)
router.get('/posts', auth, async (req, res) => {
    try {
        const posts = await Post.find()
            .populate('recruiterId', 'firstName lastName role profilePic')
            .sort({ createdAt: -1 })
            .lean();

        // Fetch comments for each post
        const postsWithComments = await Promise.all(posts.map(async (post) => {
            const comments = await Comment.find({ postId: post._id })
                .populate('userId', 'firstName lastName role profilePic')
                .sort({ createdAt: 1 })
                .lean();
            return { ...post, comments };
        }));

        res.json(postsWithComments);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error fetching posts' });
    }
});

// POST /api/community/posts/:id/comments (Seeker only - or all per general feed logic, but prompt said Seeker Actions: Can comment)
router.post('/posts/:id/comments', auth, async (req, res) => {
    try {
        const { text } = req.body;
        if (!text) return res.status(400).json({ message: 'Comment text is required' });

        const comment = await Comment.create({
            postId: req.params.id,
            userId: req.user.id,
            text
        });

        const populatedComment = await Comment.findById(comment._id).populate('userId', 'firstName lastName role profilePic');
        res.status(201).json(populatedComment);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: 'Server error posting comment' });
    }
});

module.exports = router;
