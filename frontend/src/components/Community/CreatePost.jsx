import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Send, Image, Sparkles, X, Users } from 'lucide-react';
import { toast } from 'react-toastify';
import axiosClient from '../../api/axiosClient';

const CreatePost = ({ communityId, onPostCreated, onJoin, isMember, role }) => {
    const isSeeker = role === 'seeker';
    const [content, setContent] = useState('');
    const [type, setType] = useState(isSeeker ? 'question' : 'experience');
    const [tags, setTags] = useState('');
    const [image, setImage] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!isMember) return;

        try {
            await axiosClient.post(`community/${communityId}/posts`, {
                content,
                type,
                tags: isSeeker ? ['question'] : tags.split(',').map(t => t.trim()).filter(t => t),
                image: isSeeker ? '' : image
            });

            toast.success(isSeeker ? "Question posted!" : "Post shared!");
            setContent('');
            setTags('');
            setImage('');
            if (onPostCreated) onPostCreated();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to post");
        }
    };

    return (
        <div className="bg-slate-800/20 backdrop-blur-xl border border-slate-700/30 rounded-[32px] p-8 shadow-xl mb-8">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 bg-blue-500/20 rounded-xl">
                    <Sparkles className="text-blue-400" size={20} />
                </div>
                <h3 className="text-xl font-bold">{isSeeker ? 'Ask a Question' : 'Create Post'}</h3>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
                {!isSeeker && (
                    <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-none">
                        {['experience', 'question', 'tip', 'poll'].map((t) => (
                            <button
                                key={t}
                                type="button"
                                onClick={() => setType(t)}
                                className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest transition-all whitespace-nowrap ${type === t ? 'bg-blue-600 text-white' : 'bg-slate-900/50 text-slate-500 hover:bg-slate-800'}`}
                            >
                                {t}
                            </button>
                        ))}
                    </div>
                )}

                <textarea
                    required
                    disabled={!isMember}
                    placeholder={isSeeker ? "Ask anything about interviews, preparation, or company culture..." : "Share an interview experience, a referral, or ask a question..."}
                    value={content}
                    onChange={(e) => setContent(e.target.value)}
                    className={`w-full bg-slate-900/50 border border-slate-700/50 rounded-2xl p-6 text-white text-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50 resize-none min-h-[160px] placeholder:text-slate-600 transition-all ${!isMember ? 'opacity-50 cursor-not-allowed' : ''}`}
                />

                {!isSeeker && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-2">Add Image (URL)</label>
                            <div className="relative">
                                <Image className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-600" size={16} />
                                <input
                                    type="text"
                                    placeholder="Paste image link..."
                                    value={image}
                                    onChange={(e) => setImage(e.target.value)}
                                    className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 pl-10 pr-4 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] pl-2">Tags (Comma separated)</label>
                            <input
                                type="text"
                                placeholder="Interview, React, Hiring..."
                                value={tags}
                                onChange={(e) => setTags(e.target.value)}
                                className="w-full bg-slate-900/50 border border-slate-700/50 rounded-xl py-3 px-4 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                            />
                        </div>
                    </div>
                )}

                {isMember ? (
                    <button
                        type="submit"
                        className="w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white shadow-blue-900/20"
                    >
                        <Send size={20} />
                        {isSeeker ? 'Post Question' : 'Publish to Community'}
                    </button>
                ) : (
                    <button
                        type="button"
                        onClick={onJoin}
                        className="w-full py-4 rounded-2xl font-bold text-lg flex items-center justify-center gap-2 transition-all active:scale-95 shadow-xl bg-blue-600 hover:bg-blue-500 text-white shadow-blue-900/40"
                    >
                        <Users size={20} />
                        Join Community to {isSeeker ? 'Ask' : 'Post'}
                    </button>
                )}
            </form>
        </div>
    );
};

export default CreatePost;
