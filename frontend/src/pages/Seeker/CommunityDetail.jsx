import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, Users, MessageSquare, Info, Globe, Lock, Check, Plus } from 'lucide-react';
import Navbar from '../../components/Navbar';
import CreatePost from '../../components/Community/CreatePost';
import PostCard from '../../components/Community/PostCard';
import { useAuth } from '../../context/AuthContext';
import { toast } from 'react-toastify';

const CommunityDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useAuth();
    const [community, setCommunity] = useState(null);
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isMember, setIsMember] = useState(false);

    useEffect(() => {
        fetchCommunityData();
        if (location.search.includes('action=post')) {
            window.scrollTo({ top: 300, behavior: 'smooth' });
        }
    }, [id, location.search]);

    useEffect(() => {
        if (community && user) {
            setIsMember(community.members?.some(m => m._id === user._id) || community.members?.includes(user._id));
        }
    }, [community, user]);

    const fetchCommunityData = async () => {
        try {
            setLoading(true);
            const [commData, postsData] = await Promise.all([
                axiosClient.get(`community/${id}`),
                axiosClient.get(`community/${id}/posts`)
            ]);

            if (commData) setCommunity(commData);
            if (postsData) setPosts(postsData);
        } catch (err) {
            console.error(err);
            toast.error("Failed to load community details");
        } finally {
            setLoading(false);
        }
    };

    const handleJoin = async () => {
        try {
            const res = await axiosClient.post(`community/join/${id}`);
            if (res) {
                toast.success("Joined community!");
                fetchCommunityData();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to join");
        }
    };

    const handleLike = async (postId) => {
        try {
            await axiosClient.post(`community/posts/${postId}/like`);
            fetchCommunityData();
        } catch (err) {
            console.error(err);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-slate-900 flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        </div>
    );

    if (!community) return (
        <div className="min-h-screen bg-slate-900 text-white flex flex-col items-center justify-center p-6">
            <h2 className="text-2xl font-bold mb-4">Community not found</h2>
            <button onClick={() => navigate(-1)} className="text-blue-400 font-bold hover:underline flex items-center gap-2">
                <ArrowLeft size={18} /> Go Back
            </button>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-900 text-white selection:bg-blue-500/30">
            <Navbar />

            {/* Header / Hero Section */}
            <div className="h-[400px] relative overflow-hidden">
                <div className="absolute inset-0 bg-slate-950 opacity-40 z-10" />
                <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900 z-10" />
                {community.banner ? (
                    <img src={community.banner} alt="" className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full bg-gradient-to-br from-blue-900/40 via-purple-900/40 to-slate-900" />
                )}

                <div className="absolute bottom-0 inset-x-0 p-8 md:p-12 z-20 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-end gap-6">
                    <div className="flex gap-6 items-end">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            className="w-24 h-24 md:w-32 md:h-32 bg-slate-900 border-4 border-slate-900 rounded-[32px] flex items-center justify-center text-5xl shadow-2xl z-20"
                        >
                            {community.icon || '🤝'}
                        </motion.div>
                        <div className="mb-2">
                            <div className="flex items-center gap-3 mb-2">
                                <h1 className="text-3xl md:text-5xl font-black tracking-tighter">{community.name}</h1>
                                {community.isPrivate ? <Lock size={20} className="text-slate-500" /> : <Globe size={20} className="text-slate-500" />}
                            </div>
                            <p className="text-slate-400 font-medium max-w-xl line-clamp-2">{community.description}</p>
                        </div>
                    </div>

                    <div className="flex items-center gap-4 mb-2">
                        <div className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl px-6 py-3 text-center">
                            <p className="text-blue-400 font-black text-xl leading-none">{community.members?.length || 0}</p>
                            <p className="text-[10px] text-slate-500 uppercase font-black mt-1">Members</p>
                        </div>
                        {isMember ? (
                            <button className="px-8 py-4 bg-slate-800 text-slate-400 rounded-2xl font-bold flex items-center gap-2 cursor-default border border-slate-700/50">
                                <Check size={20} /> Joined
                            </button>
                        ) : (
                            <button
                                onClick={handleJoin}
                                className="px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-xl shadow-blue-900/40 active:scale-95"
                            >
                                Join Community
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto p-6 md:p-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
                {/* Main Feed */}
                <div className="lg:col-span-2 space-y-8">
                    <CreatePost communityId={id} onPostCreated={fetchCommunityData} onJoin={handleJoin} isMember={isMember} role={user?.role} />

                    <div className="space-y-6">
                        <AnimatePresence>
                            {posts.length > 0 ? (
                                posts.map(post => (
                                    <PostCard key={post._id} post={post} user={user} onLike={handleLike} />
                                ))
                            ) : (
                                <div className="text-center py-20 border-2 border-dashed border-slate-800 rounded-[40px]">
                                    <MessageSquare size={48} className="mx-auto text-slate-700 mb-4 opacity-20" />
                                    <h3 className="text-xl font-bold text-slate-600">No posts yet</h3>
                                    <p className="text-slate-700 text-sm">Be the first to share something!</p>
                                </div>
                            )}
                        </AnimatePresence>
                    </div>
                </div>

                {/* Sidebar Info */}
                <div className="space-y-8">
                    <section className="bg-slate-800/20 backdrop-blur-xl border border-slate-700/30 rounded-[32px] p-8">
                        <h3 className="text-lg font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                            <Info size={16} /> About Community
                        </h3>
                        <p className="text-slate-300 text-sm leading-relaxed mb-6">
                            {community.description}
                        </p>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-slate-400">
                                <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center italic font-serif">@</div>
                                <div>
                                    <p className="text-[10px] uppercase font-black text-slate-600">Creator</p>
                                    <p className="text-xs font-bold text-slate-300">
                                        {community.creator?.firstName} {community.creator?.lastName}
                                    </p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 text-slate-400">
                                <div className="w-8 h-8 rounded-lg bg-slate-900 flex items-center justify-center text-lg"><Plus size={14} /></div>
                                <div>
                                    <p className="text-[10px] uppercase font-black text-slate-600">Created At</p>
                                    <p className="text-xs font-bold text-slate-300">{new Date(community.createdAt).toLocaleDateString()}</p>
                                </div>
                            </div>
                        </div>
                    </section>

                    <section className="bg-slate-800/20 backdrop-blur-xl border border-slate-700/30 rounded-[32px] p-8">
                        <h3 className="text-lg font-black text-slate-500 uppercase tracking-widest mb-6">Trending Tags</h3>
                        <div className="flex flex-wrap gap-2">
                            {['#Hiring', '#JobSearch', '#Career', '#Referral', '#Engineering'].map(t => (
                                <span key={t} className="px-3 py-1 bg-slate-900/50 border border-slate-800 rounded-lg text-xs font-bold text-slate-500 hover:text-blue-400 hover:border-blue-500/30 cursor-pointer transition-all">
                                    {t}
                                </span>
                            ))}
                        </div>
                    </section>
                </div>
            </main>
        </div>
    );
};

export default CommunityDetail;
