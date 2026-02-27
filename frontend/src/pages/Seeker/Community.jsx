import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageSquare, Heart, Share2, Plus, User, Search, Globe, Users, TrendingUp, X, Send, Sparkles, Filter } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
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

const SeekerCommunity = () => {
    const { user } = useAuth()
    const [communities, setCommunities] = useState([])
    const [posts, setPosts] = useState([])
    const [activeCommunity, setActiveCommunity] = useState(null)
    const [loading, setLoading] = useState(true)
    const [showCreatePost, setShowCreatePost] = useState(false)
    const [newPost, setNewPost] = useState({ content: '', type: 'experience', tags: '', title: '', pollOptions: ['', ''] })
    const [searchQuery, setSearchQuery] = useState('')

    useEffect(() => {
        fetchData()
    }, [])

    const fetchData = async () => {
        try {
            setLoading(true)
            const [commRes, feedRes] = await Promise.all([
                axiosClient.get('/community'),
                axiosClient.get('/community/feed')
            ])

            setCommunities(commRes.data || [])
            setPosts(feedRes.data || [])
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

            await axiosClient.post(`/community/${targetCommunityId}/posts`, {
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

    const handleLike = async (postId) => {
        try {
            await axiosClient.post(`/community/posts/${postId}/like`)
            fetchData()
        } catch (err) {
            console.error('[Community] Like error:', err)
        }
    }

    const handleVote = async (postId, optionIndex) => {
        try {
            await axiosClient.post(`/community/posts/${postId}/vote`, { optionIndex })
            fetchData()
            toast.success("Vote recorded!")
        } catch (err) {
            console.error('[Community] Vote error:', err)
            toast.error("Failed to vote")
        }
    }

    const handleLeave = async (commId) => {
        if (!window.confirm("Are you sure you want to leave this community?")) return
        try {
            await axiosClient.post(`/community/leave/${commId}`)
            toast.success("You left the community")
            setActiveCommunity(null)
            fetchData()
        } catch (err) {
            toast.error("Failed to leave community")
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
                        <h1 className="text-4xl font-bold tracking-tight mb-2">Developer Community</h1>
                        <p className="text-slate-400">Connect, share, and grow with other professionals.</p>
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
                                                <div className="flex-1 min-w-0">
                                                    <div className="flex justify-between items-start">
                                                        <p className={`text-sm font-bold truncate ${activeCommunity?._id === comm._id ? 'text-blue-400' : 'text-slate-300'}`}>{comm.name}</p>
                                                        {activeCommunity?._id === comm._id && (
                                                            <button
                                                                onClick={(e) => { e.stopPropagation(); handleLeave(comm._id); }}
                                                                className="text-[9px] font-black text-red-500/50 hover:text-red-500 uppercase tracking-tighter transition-colors"
                                                            >
                                                                Leave
                                                            </button>
                                                        )}
                                                    </div>
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
                                                            await axiosClient.post(`/community/join/${comm._id}`)
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
                        </section>

                        <section className="bg-slate-800/40 border border-slate-700/50 rounded-3xl p-6 backdrop-blur-xl">
                            <h3 className="text-lg font-bold mb-6 flex items-center gap-2">
                                <TrendingUp className="text-purple-400" size={20} />
                                Trending Tags
                            </h3>
                            <div className="flex flex-wrap gap-2">
                                {['#CareerAdvice', '#TechNews', '#RemoteLife', '#Coding', '#JobSearch'].map((tag) => (
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
                            {filteredPosts.map((post) => (
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
                                                    {post.author?.role !== 'seeker' && (
                                                        <span className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[10px] uppercase tracking-wider rounded border border-blue-500/20 font-black">PRO</span>
                                                    )}
                                                </h4>
                                                <p className="text-xs text-slate-500 font-medium">{post.author?.role || 'Member'} • {new Date(post.createdAt).toLocaleDateString()}</p>
                                            </div>
                                        </div>
                                        <div className="px-3 py-1 bg-slate-900/50 border border-slate-700 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-tighter">
                                            {post.type}
                                        </div>
                                    </div>

                                    <div className="flex flex-col gap-2">
                                        {post.title && <h3 className="text-xl font-bold text-white mb-2">{post.title}</h3>}
                                        <p className="text-slate-300 leading-relaxed mb-8 text-[15px]">
                                            {post.content}
                                        </p>
                                    </div>

                                    {post.type === 'poll' && post.pollOptions && (
                                        <div className="space-y-3 mb-8">
                                            {post.pollOptions.map((opt, idx) => {
                                                const totalVotes = post.pollOptions.reduce((acc, o) => acc + (o.votes?.length || 0), 0)
                                                const percentage = totalVotes > 0 ? Math.round((opt.votes?.length || 0) / totalVotes * 100) : 0
                                                const hasVoted = opt.votes?.some(id => (id._id || id) === user?._id)

                                                return (
                                                    <button
                                                        key={idx}
                                                        onClick={() => handleVote(post._id, idx)}
                                                        className="w-full relative group/poll overflow-hidden"
                                                    >
                                                        <div className={`absolute inset-0 transition-all h-full ${hasVoted ? 'bg-blue-500/20' : 'bg-blue-500/10 group-hover/poll:bg-blue-500/15'}`} style={{ width: `${percentage}%` }} />
                                                        <div className={`relative flex justify-between items-center px-6 py-4 border rounded-2xl text-sm font-medium transition-all ${hasVoted ? 'border-blue-500/50 text-blue-400' : 'border-white/5 text-slate-200 group-hover/poll:border-white/10'}`}>
                                                            <span className="flex items-center gap-3">
                                                                {opt.option}
                                                                {hasVoted && <CheckCircle size={14} className="text-blue-500" />}
                                                            </span>
                                                            <span className="text-slate-500 text-xs font-bold">{percentage}% ({opt.votes?.length || 0})</span>
                                                        </div>
                                                    </button>
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
                            ))}
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
                                    {['experience', 'tip', 'question', 'poll'].map((type) => (
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
                                {(newPost.type === 'poll' || newPost.type === 'question') && (
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
                                    placeholder={newPost.type === 'poll' ? "Ask your question here..." : "What's on your mind? Share thoughts, questions or experiences..."}
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
                                        placeholder="e.g. Career, JobSearch"
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
            </AnimatePresence>
        </div>
    )
}

export default SeekerCommunity
