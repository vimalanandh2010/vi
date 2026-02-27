import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search } from 'lucide-react';
import Navbar from '../../components/Navbar';
import CommunityCard from '../../components/Community/CommunityCard';
import axiosClient from '../../api/axiosClient';
import { toast } from 'react-toastify';

const CommunityList = ({ isSeeker = true }) => {
    const [communities, setCommunities] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [newCommunity, setNewCommunity] = useState({ name: '', description: '', isPrivate: false, tags: '', icon: '' });

    useEffect(() => {
        fetchCommunities();
    }, []);

    const fetchCommunities = async () => {
        try {
            setLoading(true);
            const data = await axiosClient.get('/community');
            setCommunities(Array.isArray(data) ? data : []);
        } catch (err) {
            console.error('[CommunityList] Fetch error:', err);
            toast.error("Failed to load communities");
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCommunity = async (e) => {
        e.preventDefault();
        try {
            await axiosClient.post('community', {
                ...newCommunity,
                tags: newCommunity.tags.split(',').map(t => t.trim())
            });
            toast.success("Community created!");
            setShowCreateModal(false);
            setNewCommunity({ name: '', description: '', isPrivate: false, tags: '', icon: '' });
            fetchCommunities();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create community");
        }
    };

    const filteredCommunities = communities.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-900 text-white selection:bg-blue-500/30">
            <Navbar />

            <div className="max-w-7xl mx-auto p-6 md:p-12">
                {/* Header */}
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                    >
                        <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-2 bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                            Discover Communities
                        </h1>
                        <p className="text-slate-400 text-lg">Join professional circles and grow together.</p>
                    </motion.div>

                    <div className="flex items-center gap-4 w-full md:w-auto">
                        <div className="relative flex-1 md:w-80">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                            <input
                                type="text"
                                placeholder="Find a community..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-2xl py-3.5 pl-12 pr-6 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all backdrop-blur-xl"
                            />
                        </div>
                        {!isSeeker && (
                            <button
                                onClick={() => setShowCreateModal(true)}
                                className="px-6 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold shadow-xl shadow-blue-900/20 transition-all active:scale-95 whitespace-nowrap"
                            >
                                + Create New
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => (
                            <div key={i} className="h-80 bg-slate-800/20 border border-slate-700/30 rounded-[32px] animate-pulse" />
                        ))}
                    </div>
                ) : (
                    <AnimatePresence>
                        {filteredCommunities.length > 0 ? (
                            <motion.div
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8"
                            >
                                {filteredCommunities.map((community) => (
                                    <CommunityCard key={community._id} community={community} isSeeker={isSeeker} />
                                ))}
                            </motion.div>
                        ) : (
                            <div className="text-center py-20">
                                <div className="w-20 h-20 bg-slate-800 rounded-3xl flex items-center justify-center mx-auto mb-6 text-4xl opacity-20 italic font-serif">
                                    ?
                                </div>
                                <h3 className="text-2xl font-bold text-slate-300 mb-2">No communities found</h3>
                                <p className="text-slate-500 max-w-sm mx-auto">Try searching for something else or explore all categories.</p>
                            </div>
                        )}
                    </AnimatePresence>
                )}
            </div>

            {/* Create Modal */}
            <AnimatePresence>
                {showCreateModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setShowCreateModal(false)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.9, opacity: 0, y: 20 }}
                            className="relative w-full max-w-2xl bg-slate-900 border border-slate-800 rounded-[40px] shadow-2xl overflow-hidden"
                        >
                            <div className="p-8 border-b border-slate-800 flex items-center justify-between">
                                <h3 className="text-2xl font-bold flex items-center gap-3 text-white">
                                    Create Community
                                </h3>
                                <button onClick={() => setShowCreateModal(false)} className="p-2 hover:bg-slate-800 rounded-xl transition-all text-white">✕</button>
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
                                <div className="space-y-2">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-widest pl-2">Tags (comma separated)</label>
                                    <input
                                        type="text"
                                        placeholder="e.g. Hiring, Tech, Networking"
                                        value={newCommunity.tags}
                                        onChange={(e) => setNewCommunity({ ...newCommunity, tags: e.target.value })}
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-2xl py-3 px-6 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                    />
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
    );
};

export default CommunityList;
