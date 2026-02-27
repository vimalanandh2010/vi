import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { MessageSquare, Send, User, Calendar, PlusCircle, Smile, Image as ImageIcon, X } from 'lucide-react';
import { toast } from 'react-toastify';
import EmojiPicker from 'emoji-picker-react';

const API_URL = ''; // Relative to axiosClient baseURL

const CommunityPage = () => {
    const { user } = useAuth();
    const navigate = useNavigate();
    const [posts, setPosts] = useState([]);
    const [newPost, setNewPost] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [commentInputs, setCommentInputs] = useState({});
    const [selectedImage, setSelectedImage] = useState(null);
    const [imagePreview, setImagePreview] = useState(null);
    const [showEmojiPicker, setShowEmojiPicker] = useState(false);
    const [showCommentEmojiPicker, setShowCommentEmojiPicker] = useState(null);

    useEffect(() => {
        fetchPosts();
    }, []);

    const fetchPosts = async () => {
        try {
            setIsLoading(true);
            const res = await axiosClient.get('community-hub/posts');
            if (res) {
                setPosts(res);
            }
        } catch (err) {
            console.error('Error fetching posts:', err);
            toast.error('Failed to load feed');
        } finally {
            setIsLoading(false);
        }
    };

    const handleCreatePost = async (e) => {
        e.preventDefault();
        if (!newPost.trim()) return;

        const formData = new FormData();
        formData.append('content', newPost);
        if (selectedImage) {
            formData.append('image', selectedImage);
        }

        try {
            const res = await axiosClient.post('community-hub/posts', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            if (res) {
                setPosts([res, ...posts]);
                setNewPost('');
                setSelectedImage(null);
                setImagePreview(null);
                setShowEmojiPicker(false);
                toast.success('Post created!');
            }
        } catch (err) {
            toast.error('Failed to create post');
        }
    };

    const handleAddComment = async (postId) => {
        const text = commentInputs[postId];
        if (!text || !text.trim()) return;

        try {
            const res = await axiosClient.post(`community-hub/posts/${postId}/comments`, { text });
            if (res) {
                setPosts(posts.map(p => p._id === postId ? { ...p, comments: [...(p.comments || []), res] } : p));
                setCommentInputs({ ...commentInputs, [postId]: '' });
                setShowCommentEmojiPicker(null);
            }
        } catch (err) {
            toast.error('Failed to add comment');
        }
    };

    const handleMessageNow = (recruiterId) => {
        const chatPath = user.role === 'recruiter' || user.role === 'employer' ? '/recruiter/chat' : '/seeker/chat';
        navigate(`${chatPath}?targetId=${recruiterId}`);
    };
    const handleImageChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setSelectedImage(file);
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const onEmojiClick = (emojiObject) => {
        setNewPost(prev => prev + emojiObject.emoji);
    };

    const onCommentEmojiClick = (postId, emojiObject) => {
        setCommentInputs(prev => ({
            ...prev,
            [postId]: (prev[postId] || '') + emojiObject.emoji
        }));
    };

    if (isLoading) {
        return <div className="flex items-center justify-center min-h-[calc(100vh-80px)] text-white bg-[#0B1120]">Loading Feed...</div>;
    }

    return (
        <div className="min-h-screen bg-[#0B1120] text-gray-100 p-4 md:p-8 font-sans">
            <div className="max-w-3xl mx-auto">
                <header className="mb-8 flex justify-between items-center">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-2">Community Hub</h1>
                        <p className="text-gray-400">Share updates, learn, and grow together.</p>
                    </div>
                </header>

                {/* Create Post (Recruiter Only) */}
                {(user?.role === 'recruiter' || user?.role === 'employer') && (
                    <div className="bg-[#1e293b] rounded-xl p-6 mb-8 border border-gray-700 shadow-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <PlusCircle className="text-purple-400" size={24} />
                            <h2 className="text-lg font-semibold text-white">Create a Post</h2>
                        </div>
                        <form onSubmit={handleCreatePost}>
                            <div className="relative">
                                <textarea
                                    value={newPost}
                                    onChange={(e) => setNewPost(e.target.value)}
                                    placeholder="What's on your mind? (Job updates, learning content...)"
                                    className="w-full bg-[#0B1120] border border-gray-700 rounded-lg p-4 text-white outline-none focus:ring-1 focus:ring-purple-500 min-h-[120px] transition-all"
                                />
                                {showEmojiPicker && (
                                    <div className="absolute bottom-12 right-0 z-50">
                                        <EmojiPicker onEmojiClick={onEmojiClick} theme="dark" />
                                    </div>
                                )}
                            </div>

                            {imagePreview && (
                                <div className="mt-4 relative inline-block">
                                    <img src={imagePreview} alt="Preview" className="max-h-64 rounded-lg border border-gray-600" />
                                    <button
                                        type="button"
                                        onClick={() => { setSelectedImage(null); setImagePreview(null); }}
                                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 transition-colors"
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            )}

                            <div className="flex justify-between items-center mt-4">
                                <div className="flex gap-4">
                                    <label className="cursor-pointer text-gray-400 hover:text-purple-400 transition-colors flex items-center gap-2">
                                        <ImageIcon size={20} />
                                        <span className="text-sm">Image</span>
                                        <input type="file" hidden accept="image/*" onChange={handleImageChange} />
                                    </label>
                                    <button
                                        type="button"
                                        onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                                        className={`text-gray-400 hover:text-yellow-400 transition-colors flex items-center gap-2 ${showEmojiPicker ? 'text-yellow-400' : ''}`}
                                    >
                                        <Smile size={20} />
                                        <span className="text-sm">Emoji</span>
                                    </button>
                                </div>
                                <button
                                    type="submit"
                                    className="bg-purple-600 hover:bg-purple-700 text-white px-6 py-2 rounded-lg font-bold transition-colors flex items-center gap-2"
                                >
                                    <Send size={18} /> Post
                                </button>
                            </div>
                        </form>
                    </div>
                )}

                {/* Feed */}
                <div className="space-y-6">
                    {posts.length === 0 ? (
                        <div className="text-center py-12 bg-[#1e293b] rounded-xl border border-dashed border-gray-700">
                            <p className="text-gray-400">No posts yet. Be the first to share something!</p>
                        </div>
                    ) : (
                        posts.map((post) => (
                            <div key={post._id} className="bg-[#1e293b] rounded-xl overflow-hidden border border-gray-700 shadow-lg">
                                {/* Post Header */}
                                <div className="p-6 border-b border-gray-700 flex justify-between items-start">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-full bg-purple-900 flex items-center justify-center border border-purple-700 overflow-hidden">
                                            {post.recruiterId?.profilePic ? (
                                                <img src={post.recruiterId.profilePic} alt="Author" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="text-purple-300" size={24} />
                                            )}
                                        </div>
                                        <div>
                                            <div className="font-bold text-white text-lg">
                                                {post.recruiterId?.firstName} {post.recruiterId?.lastName}
                                            </div>
                                            <div className="text-xs text-purple-400 font-medium uppercase tracking-wider flex items-center gap-1">
                                                <span className="bg-purple-900/50 px-2 py-0.5 rounded">@{post.recruiterId?.role || 'recruiter'}</span>
                                                <span className="text-gray-500 mx-1">•</span>
                                                <span className="text-gray-500">{new Date(post.createdAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Message Now Button */}
                                    {post.recruiterId?._id !== user?._id && (
                                        <button
                                            onClick={() => handleMessageNow(post.recruiterId?._id)}
                                            className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg text-sm font-bold transition-all transform hover:scale-105 shadow-lg flex items-center gap-2"
                                        >
                                            <MessageSquare size={16} /> Message Now
                                        </button>
                                    )}
                                </div>

                                {post.content && (
                                    <div className="p-6 text-gray-200 text-[17px] leading-relaxed whitespace-pre-wrap">
                                        {post.content}
                                    </div>
                                )}

                                {post.image && (
                                    <div className="px-6 pb-6">
                                        <img src={post.image} alt="Post content" className="w-full rounded-xl border border-gray-700 shadow-sm" />
                                    </div>
                                )}

                                {/* Comments Section */}
                                <div className="bg-[#162031] p-6 border-t border-gray-750">
                                    <h3 className="text-sm font-bold text-gray-400 mb-4 flex items-center gap-2">
                                        <MessageSquare size={16} /> Comments ({post.comments?.length || 0})
                                    </h3>

                                    <div className="space-y-4 mb-4 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
                                        {post.comments?.map((comment, idx) => (
                                            <div key={idx} className="flex gap-3 items-start">
                                                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center shrink-0 border border-gray-600">
                                                    {comment.userId?.profilePic ? (
                                                        <img src={comment.userId.profilePic} alt="User" className="w-full h-full rounded-full" />
                                                    ) : (
                                                        <User size={14} className="text-gray-400" />
                                                    )}
                                                </div>
                                                <div className="bg-[#1e293b] rounded-2xl px-4 py-2 flex-1">
                                                    <div className="font-bold text-xs text-purple-300">
                                                        {comment.userId?.firstName} {comment.userId?.lastName}
                                                    </div>
                                                    <div className="text-sm text-gray-200 mt-1">{comment.text}</div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Add Comment Input */}
                                    <div className="flex gap-3">
                                        <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center shrink-0 border border-gray-600">
                                            {user?.profilePic ? (
                                                <img src={user.profilePic} alt="Me" className="w-full h-full rounded-full" />
                                            ) : (
                                                <User size={18} className="text-gray-400" />
                                            )}
                                        </div>
                                        <div className="relative flex-1">
                                            <input
                                                type="text"
                                                placeholder="Write a comment..."
                                                value={commentInputs[post._id] || ''}
                                                onChange={(e) => setCommentInputs({ ...commentInputs, [post._id]: e.target.value })}
                                                onKeyDown={(e) => e.key === 'Enter' && handleAddComment(post._id)}
                                                className="w-full bg-[#0B1120] border border-gray-700 rounded-full py-2.5 pl-4 pr-24 text-sm text-white outline-none focus:ring-1 focus:ring-purple-500 transition-all"
                                            />
                                            <div className="absolute right-3 top-2 flex items-center gap-2">
                                                <button
                                                    onClick={() => setShowCommentEmojiPicker(showCommentEmojiPicker === post._id ? null : post._id)}
                                                    className={`text-gray-500 hover:text-yellow-400 p-1 transition-colors ${showCommentEmojiPicker === post._id ? 'text-yellow-400' : ''}`}
                                                >
                                                    <Smile size={18} />
                                                </button>
                                                <button
                                                    onClick={() => handleAddComment(post._id)}
                                                    className="text-purple-500 hover:text-purple-400 p-1"
                                                >
                                                    <Send size={18} />
                                                </button>
                                            </div>
                                            {showCommentEmojiPicker === post._id && (
                                                <div className="absolute bottom-12 right-0 z-50">
                                                    <EmojiPicker onEmojiClick={(emoji) => onCommentEmojiClick(post._id, emoji)} theme="dark" />
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default CommunityPage;
