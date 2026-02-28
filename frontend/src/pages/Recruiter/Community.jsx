import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Heart, Share2, Plus, User, Search, Globe, Users, TrendingUp, X, Send, Sparkles, Filter } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useCompany } from '../../context/CompanyContext'
import { toast } from 'react-toastify'
import axiosClient from '../../api/axiosClient'

const CheckCircle = ({ size, className }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <polyline points="20 6 9 17 4 12" />
    </svg>
)

const RecruiterCommunity = ({ openCreateModal = false }) => {
    const { user } = useAuth()
    const { company } = useCompany()
    const [communities, setCommunities] = useState([])
    const [posts, setPosts] = useState([])
    const [activeCommunity, setActiveCommunity] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showCreatePost, setShowCreatePost] = useState(false)
    const [showCreateCommunity, setShowCreateCommunity] = useState(openCreateModal)
    const [newPost, setNewPost] = useState({ content: '', type: 'experience', tags: '', title: '', pollOptions: ['', ''] })
    const [stats, setStats] = useState(null)
    const [newCommunity, setNewCommunity] = useState({ name: '', description: '', isPrivate: false, tags: '', icon: '' })
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        if (openCreateModal) setShowCreateCommunity(true)
    }, [openCreateModal])

    useEffect(() => {
        fetchData()
    }, [])

    useEffect(() => {
        if (activeCommunity) {
            fetchStats(activeCommunity._id)
        } else {
            setStats(null)
        }
    }, [activeCommunity])

    const fetchStats = async (id) => {
        try {
            const res = await axiosClient.get(`community/${id}/stats`)
            setStats(res.data)
        } catch (err) {
            console.error('[Community] Stats error:', err)
        }
    }

    const fetchData = async () => {
        try {
            setLoading(true)
            const [commRes, feedRes] = await Promise.all([
                axiosClient.get('community'),
                axiosClient.get('community/feed')
            ])

            setCommunities(commRes.data || [])
            setPosts(feedRes.data || [])

            // Re-fetch stats if we have an active community
            if (activeCommunity) {
                fetchStats(activeCommunity._id)
            }
        } catch (err) {
            console.error('[Community] Fetch error:', err)
            toast.error("Failed to load community data")
        } finally {
            setLoading(false)
        }
    }

    const handleCreatePost = async (e) => {
        e.preventDefault()
        try {
            const targetCommunityId = activeCommunity?._id || communities.find(c => c.isMember)?._id

            if (!targetCommunityId) {
                toast.error("Join a community first!")
                return
            }

            await axiosClient.post(`community/${targetCommunityId}/posts`, {
                content: newPost.content,
                type: newPost.type,
                title: newPost.title,
                tags: newPost.tags.split(',').map(t => t.trim()),
                pollOptions: newPost.type === 'poll' ? newPost.pollOptions.map(opt => ({ option: opt, votes: [] })) : undefined
            })

            toast.success("Post published!")
            setShowCreatePost(false)
            setNewPost({ content: '', type: 'experience', tags: '', title: '', pollOptions: ['', ''] })
            fetchData()
        } catch (err) {
            console.error('[Community] Post error:', err)
            toast.error(err.response?.data?.message || "Failed to post")
        }
    }

    const handleCreateCommunity = async (e) => {
        e.preventDefault()
        try {
            if (!company) {
                toast.error("You must complete your company profile to create a community. Please check your dashboard.")
                return
            }

            await axiosClient.post('community', {
                ...newCommunity,
                tags: newCommunity.tags.split(',').map(t => t.trim())
            })

            toast.success("Community created!")
            setShowCreateCommunity(false)
            setNewCommunity({ name: '', description: '', isPrivate: false, tags: '', icon: '' })
            fetchData()
        } catch (err) {
            console.error('[Community] Create Community error:', err)
            toast.error(err.response?.data?.message || "Failed to create community")
        }
    }

    const handleLike = async (postId) => {
        try {
            await axiosClient.post(`community/posts/${postId}/like`)
            fetchData()
        } catch (err) {
            console.error('[Community] Like error:', err)
        }
    }

    const filteredPosts = posts.filter(post =>
        post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (post.author && (
            post.author.firstName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            post.author.lastName.toLowerCase().includes(searchQuery.toLowerCase())
        ))
    )

    return (
        <div className="min-h-screen bg-slate-900 text-white p-6 md:p-12 font-sans selection:bg-blue-500/30">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-bold tracking-tight mb-2">Recruiter Community</h1>
                        <p className="text-slate-400">Connect, share, and grow with colleagues.</p>
                    </div>
                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                type="text"
                                placeholder="Search posts..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                            />
                        </div>
                        <button
                            onClick={() => setShowCreateCommunity(true)}
                            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-900/20 active:scale-95 transition-all"
                        >
                            <Users size={18} /> Create Community
                        </button>
                        <button
                            onClick={() => setShowCreatePost(true)}
                            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold shadow-lg shadow-blue-900/20 active:scale-95 transition-all"
                        >
                            <Plus size={18} /> Post
                        </button>
                    </div>
                </div>

                <div className="flex gap-8">
                    {/* Sidebar */}
                    <div className="hidden lg:block w-72 space-y-8">
                        {/* Stats Section */}
                        {activeCommunity && stats && (
                            <section className="bg-gradient-to-br from-blue-600/20 to-indigo-600/20 border border-blue-500/30 rounded-3xl p-6 backdrop-blur-xl">
                                <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                    <TrendingUp className="text-blue-400" size={20} />
                                    Community Stats
                                </h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-slate-900/40 p-3 rounded-2xl border border-white/5">
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Members</p>
                                        <p className="text-xl font-black text-white">{stats.memberCount}</p>
                                    </div>
                                    <div className="bg-slate-900/40 p-3 rounded-2xl border border-white/5">
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Posts</p>
                                        <p className="text-xl font-black text-white">{stats.postCount}</p>
                                    </div>
                                    <div className="bg-slate-900/40 p-3 rounded-2xl border border-white/5 col-span-2">
                                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider mb-1">Active Discussions (7d)</p>
                                        <p className="text-xl font-black text-white">{stats.activeDiscussions}</p>
                                    </div>
                                </div>
                            </section>
                        )}

                        <section className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 backdrop-blur-xl">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <Users className="text-blue-400" size={20} />
                                Communities
                            </h3>
                            <div className="space-y-6">
                                {/* My Communities */}
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">My Communities</p>
                                    <div className="space-y-3">
                                        {communities.filter(c => c.isMember).map((comm) => (
                                            <div
                                                key={comm._id}
                                                onClick={() => setActiveCommunity(comm)}
                                                className={`flex items-center gap-3 p-3 rounded-2xl cursor-pointer transition-all ${activeCommunity?._id === comm._id ? 'bg-blue-600/20 border border-blue-500/30' : 'hover:bg-slate-700/30 border border-transparent'}`}
                                            >
                                                <div className="w-10 h-10 rounded-xl bg-slate-700 flex items-center justify-center font-bold text-blue-400">
                                                    {comm.icon || '🤝'}
                                                </div>
                                                <div className="min-w-0">
                                                    <p className={`text-sm font-bold truncate ${activeCommunity?._id === comm._id ? 'text-blue-400' : 'text-slate-300'}`}>{comm.name}</p>
                                                    <p className="text-[10px] text-slate-500">{comm.members.length} members</p>
                                                </div>
                                            </div>
                                        ))}
                                        {communities.filter(c => c.isMember).length === 0 && (
                                            <p className="text-[10px] text-slate-600 italic px-2">You haven't joined any yet.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Explore Communities */}
                                <div>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Explore More</p>
                                    <div className="space-y-3">
                                        {communities.filter(c => !c.isMember).map((comm) => (
                                            <div
                                                key={comm._id}
                                                className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-700/30 border border-transparent transition-all group"
                                            >
                                                <div className="flex items-center gap-3 min-w-0">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-bold text-slate-500 group-hover:text-blue-400 transition-colors">
                                                        {comm.icon || '🌍'}
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-sm font-bold text-slate-400 truncate group-hover:text-slate-200 transition-colors">{comm.name}</p>
                                                        <p className="text-[10px] text-slate-600">{comm.members.length} members</p>
                                                    </div>
                                                </div>
                                                <button
                                                    onClick={async () => {
                                                        try {
                                                            await axiosClient.post(`community/join/${comm._id}`)
                                                            toast.success(`Joined ${comm.name}!`)
                                                            fetchData()
                                                        } catch (err) {
                                                            toast.error(err.response?.data?.message || "Failed to join")
                                                        }
                                                    }}
                                                    className="p-1.5 bg-blue-600/10 text-blue-400 rounded-lg hover:bg-blue-600 hover:text-white transition-all opacity-0 group-hover:opacity-100"
                                                >
                                                    <Plus size={14} />
                                                </button>
                                            </div>
                                        ))}
                                        {communities.filter(c => !c.isMember).length === 0 && communities.length > 0 && (
                                            <p className="text-[10px] text-slate-600 italic px-2">No more communities to explore.</p>
                                        )}
                                        {communities.length === 0 && (
                                            <p className="text-[10px] text-slate-600 italic px-2 font-bold text-center py-4">No communities available in the system.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                            <button
                                onClick={() => setShowCreateCommunity(true)}
                                className="w-full mt-6 py-3 border border-dashed border-slate-700 text-slate-500 rounded-2xl text-xs font-bold hover:border-blue-500/50 hover:text-blue-400 transition-all flex items-center justify-center gap-2 group"
                            >
                                <Plus size={16} className="group-hover:rotate-90 transition-transform" /> Create New
                            </button>
                        </section>

                        <section className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 backdrop-blur-xl">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <TrendingUp className="text-purple-400" size={20} />
                                Trending Tags
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {['#HiringTips', '#HRTech', '#FutureOfWork', '#Interviewing', '#RemoteWork'].map((tag) => (
                                    <span key={tag} className="px-3 py-1.5 bg-slate-900/50 border border-slate-700 rounded-lg text-[10px] font-bold text-slate-400 hover:text-purple-400 hover:border-purple-500/30 cursor-pointer transition-all">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Main Feed */}
                    <div className="flex-1 space-y-6">
                        <AnimatePresence mode="popLayout">
                            {filteredPosts.length === 0 ? (
                                <div className="flex flex-col items-center justify-center py-20 bg-slate-800/10 border border-dashed border-slate-700/50 rounded-[32px] text-center px-6">
                                    <div className="w-20 h-20 rounded-full bg-slate-800 flex items-center justify-center mb-6">
                                        <Globe className="text-slate-600" size={32} />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">No posts yet</h3>
                                    <p className="text-slate-500 mb-8 max-w-sm mx-auto">Be the first one to share an insight or question with the recruiter community!</p>
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        <button
                                            onClick={() => setShowCreateCommunity(true)}
                                            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl font-bold transition-all shadow-xl shadow-indigo-900/20"
                                        >
                                            Create New Community
                                        </button>
                                        <button
                                            onClick={() => setShowCreatePost(true)}
                                            className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-xl shadow-blue-900/20"
                                        >
                                            Share an Insight
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                filteredPosts.map((post) => (
                                    <motion.div
                                        key={post._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-slate-800/20 border border-slate-700/30 rounded-[32px] p-8 hover:bg-slate-800/30 transition-all border-l-4 border-l-transparent hover:border-l-blue-500 shadow-xl"
                                    >
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="flex gap-4">
                                                <div className="relative">
                                                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-xl border-2 border-slate-800 shadow-xl">
                                                        {post.author?.firstName?.[0] || 'U'}
                                                    </div>
                                                    <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-green-500 rounded-lg border-2 border-slate-900 flex items-center justify-center">
                                                        <CheckCircle size={10} className="text-white" />
                                                    </div>
                                                </div>
                                                <div>
                                                    <h4 className="font-bold text-lg text-white flex items-center gap-2">
                                                        {post.author?.firstName} {post.author?.lastName}
                                                        <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] uppercase tracking-wider rounded border border-blue-500/20 font-black">PRO</span>
                                                    </h4>
                                                    <p className="text-xs text-slate-500 font-medium">{post.author?.role || 'Recruiter'} • {new Date(post.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <div className="px-3 py-1 bg-slate-900/50 border border-slate-700 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                                                {post.type}
                                            </div>
                                        </div>

                                        <div className="flex flex-col gap-2">
                                            {post.title && <h3 className="text-xl font-bold text-white mb-2">{post.title}</h3>}
                                            <p className="text-slate-300 leading-relaxed mb-6 text-[15px]">
                                                {post.content}
                                            </p>
                                        </div>

                                        {post.type === 'poll' && post.pollOptions && (
                                            <div className="space-y-3 mb-8">
                                                {post.pollOptions.map((opt, idx) => {
                                                    const totalVotes = post.pollOptions.reduce((acc, o) => acc + (o.votes?.length || 0), 0)
                                                    const percentage = totalVotes > 0 ? Math.round((opt.votes?.length || 0) / totalVotes * 100) : 0
                                                    return (
                                                        <div key={idx} className="relative group/poll">
                                                            <div className="absolute inset-0 bg-blue-500/10 rounded-xl transition-all h-full" style={{ width: `${percentage}%` }} />
                                                            <div className="relative flex justify-between items-center px-4 py-3 border border-white/5 rounded-xl text-sm font-medium">
                                                                <span className="text-slate-200">{opt.option}</span>
                                                                <span className="text-slate-500 text-xs font-bold">{percentage}% ({opt.votes?.length || 0})</span>
                                                            </div>
                                                        </div>
                                                    )
                                                })}
                                            </div>
                                        )}

                                        {post.tags?.length > 0 && (
                                            <div className="flex gap-2 mb-8">
                                                {post.tags.map(tag => (
                                                    <span key={tag} className="text-xs text-blue-400 font-bold">#{tag}</span>
                                                ))}
                                            </div>
                                        )}

                                        <div className="flex items-center gap-12 border-t border-slate-700/30 pt-6">
                                            <button
                                                onClick={() => handleLike(post._id)}
                                                className={`flex items-center gap-2 transition-all group ${post.likes && post.likes.includes(user?._id) ? 'text-red-500' : 'text-slate-500 hover:text-red-400'}`}
                                            >
                                                <Heart size={20} className={post.likes && post.likes.includes(user?._id) ? 'fill-red-500' : 'group-hover:fill-red-400/20'} />
                                                <span className="text-sm font-bold">{post.likes?.length || 0}</span>
                                            </button>
                                            <button className="flex items-center gap-2 text-slate-500 hover:text-blue-400 transition-colors group">
                                                <MessageSquare size={20} />
                                                <span className="text-sm font-bold">{post.comments?.length || 0}</span>
                                            </button>
                                            <button className="flex items-center gap-2 text-slate-500 hover:text-green-400 transition-colors ml-auto">
                                                <Share2 size={20} />
                                            </button>
                                        </div>
                                    </motion.div>
                                ))
                            )}
                        </AnimatePresence>
                    </div>
                </div>
            </div>

            {/* Modals */}
            <AnimatePresence>
                {showCreatePost && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCreatePost(false)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-[40px] shadow-2xl overflow-hidden"
                        >
                            <div className="p-8 border-b border-slate-800 flex items-center justify-between">
                                <h3 className="text-2xl font-bold flex items-center gap-3">
                                    <Sparkles className="text-blue-500" /> Share Insight
                                </h3>
                                <button onClick={() => setShowCreatePost(false)} className="p-2 hover:bg-slate-800 rounded-xl transition-all"><X /></button>
                            </div>
                            <form onSubmit={handleCreatePost} className="p-8 space-y-6">
                                <div className="flex flex-wrap gap-3 mb-6">
                                    {['experience', 'tip', 'question', 'poll', 'announcement', 'discussion'].map((type) => (
                                        <button
                                            key={type}
                                            type="button"
                                            onClick={() => setNewPost({ ...newPost, type })}
                                            className={`px-4 py-2 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all ${newPost.type === type ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/50' : 'bg-slate-800 text-slate-400 hover:bg-slate-700'}`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                                {(newPost.type === 'poll' || newPost.type === 'announcement' || newPost.type === 'question') && (
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-2">Title</label>
                                        <input
                                            type="text"
                                            placeholder={`Give your ${newPost.type} a title...`}
                                            value={newPost.title}
                                            onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
                                            className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-3 px-6 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                        />
                                    </div>
                                )}
                                <textarea
                                    required
                                    placeholder={newPost.type === 'poll' ? "Ask your question here..." : "What's on your mind? Share hiring trends, tips or questions..."}
                                    value={newPost.content}
                                    onChange={(e) => setNewPost({ ...newPost, content: e.target.value })}
                                    className="w-full bg-slate-800/50 border border-slate-700 rounded-3xl p-6 text-white text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none min-h-[150px]"
                                />
                                {newPost.type === 'poll' && (
                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-2">Options</label>
                                        {newPost.pollOptions.map((opt, idx) => (
                                            <div key={idx} className="flex gap-2">
                                                <input
                                                    required
                                                    type="text"
                                                    placeholder={`Option ${idx + 1}`}
                                                    value={opt}
                                                    onChange={(e) => {
                                                        const opts = [...newPost.pollOptions];
                                                        opts[idx] = e.target.value;
                                                        setNewPost({ ...newPost, pollOptions: opts });
                                                    }}
                                                    className="flex-1 bg-slate-800/50 border border-slate-700 rounded-2xl py-3 px-6 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                                />
                                                {newPost.pollOptions.length > 2 && (
                                                    <button
                                                        type="button"
                                                        onClick={() => setNewPost({ ...newPost, pollOptions: newPost.pollOptions.filter((_, i) => i !== idx) })}
                                                        className="p-3 text-red-400 hover:bg-red-400/10 rounded-xl transition-all"
                                                    >
                                                        <X size={18} />
                                                    </button>
                                                )}
                                            </div>
                                        ))}
                                        {newPost.pollOptions.length < 5 && (
                                            <button
                                                type="button"
                                                onClick={() => setNewPost({ ...newPost, pollOptions: [...newPost.pollOptions, ''] })}
                                                className="text-xs font-bold text-blue-400 hover:text-blue-300 transition-colors pl-2"
                                            >
                                                + Add Option
                                            </button>
                                        )}
                                    </div>
                                )}
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-2">Tags (comma separated)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. HiringTips, HRTech"
                                        value={newPost.tags}
                                        onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-3 px-6 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    />
                                </div>
                                <button type="submit" className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-900/20 active:scale-95 transition-all">
                                    Publish Post
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}

                {showCreateCommunity && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCreateCommunity(false)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-[40px] shadow-2xl overflow-hidden"
                        >
                            <div className="p-8 border-b border-slate-800 flex items-center justify-between">
                                <h3 className="text-2xl font-bold flex items-center gap-3">
                                    <Users className="text-blue-500" /> Create Community
                                </h3>
                                <button onClick={() => setShowCreateCommunity(false)} className="p-2 hover:bg-slate-800 rounded-xl transition-all"><X /></button>
                            </div>
                            <form onSubmit={handleCreateCommunity} className="p-8 space-y-6">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-2">Name</label>
                                        <input
                                            required
                                            type="text"
                                            placeholder="e.g. Talent Acquisition Pro"
                                            value={newCommunity.name}
                                            onChange={(e) => setNewCommunity({ ...newCommunity, name: e.target.value })}
                                            className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-3 px-6 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-2">Icon (Emoji)</label>
                                        <input
                                            type="text"
                                            placeholder="e.g. 💼, 🚀"
                                            value={newCommunity.icon}
                                            onChange={(e) => setNewCommunity({ ...newCommunity, icon: e.target.value })}
                                            className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-3 px-6 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-center text-xl"
                                        />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-2">Description</label>
                                    <textarea
                                        required
                                        placeholder="What is this community about?"
                                        value={newCommunity.description}
                                        onChange={(e) => setNewCommunity({ ...newCommunity, description: e.target.value })}
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-3xl p-6 text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none min-h-[120px]"
                                    />
                                </div>
                                <div className="flex items-center justify-between p-4 bg-slate-800/30 rounded-2xl border border-slate-700/50">
                                    <div>
                                        <p className="text-sm font-bold">Private Community</p>
                                        <p className="text-[10px] text-slate-500">Only invited members can view the feed.</p>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => setNewCommunity({ ...newCommunity, isPrivate: !newCommunity.isPrivate })}
                                        className={`w-12 h-6 rounded-full p-1 transition-all ${newCommunity.isPrivate ? 'bg-blue-600' : 'bg-slate-700'}`}
                                    >
                                        <motion.div
                                            animate={{ x: newCommunity.isPrivate ? 24 : 0 }}
                                            className="w-4 h-4 bg-white rounded-full"
                                        />
                                    </button>
                                </div>
                                <button type="submit" className="w-full py-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-900/20 active:scale-95 transition-all">
                                    Create Community
                                </button>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default RecruiterCommunity
