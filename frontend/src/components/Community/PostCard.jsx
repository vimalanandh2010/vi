import React from 'react';
import { motion } from 'framer-motion';
import { Heart, MessageSquare, Share2, MoreHorizontal, User } from 'lucide-react';

const PostCard = ({ post, user, onLike }) => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-slate-800/20 backdrop-blur-xl border border-slate-700/30 rounded-[32px] p-8 hover:bg-slate-800/25 transition-all shadow-xl"
        >
            <div className="flex justify-between items-start mb-6">
                <div className="flex gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-xl text-white shadow-lg shadow-blue-900/20 border-2 border-slate-900">
                        {post.author?.photoUrl ? (
                            <img src={post.author.photoUrl} alt="" className="w-full h-full object-cover rounded-2xl" />
                        ) : (
                            post.author?.firstName?.[0] || <User />
                        )}
                    </div>
                    <div>
                        <h4 className="font-bold text-lg text-white flex items-center gap-2">
                            {post.author?.firstName} {post.author?.lastName}
                            {post.author?.role === 'employer' && (
                                <span className="px-1.5 py-0.5 bg-purple-500/10 text-purple-400 text-[10px] font-black uppercase tracking-widest rounded border border-purple-500/20">Recruiter</span>
                            )}
                        </h4>
                        <p className="text-xs text-slate-500 font-medium">{new Date(post.createdAt).toLocaleDateString()}</p>
                    </div>
                </div>
                <button className="p-2 text-slate-600 hover:text-white hover:bg-slate-700/50 rounded-xl transition-all">
                    <MoreHorizontal size={20} />
                </button>
            </div>

            <p className="text-slate-300 leading-relaxed text-[17px] mb-6">
                {post.content}
            </p>

            {post.image && (
                <div className="rounded-[24px] overflow-hidden border border-slate-700/50 mb-6 shadow-2xl">
                    <img src={post.image} alt="Post content" className="w-full object-cover max-h-[500px]" />
                </div>
            )}

            {post.tags?.length > 0 && (
                <div className="flex flex-wrap gap-2 mb-8">
                    {post.tags.map(tag => (
                        <span key={tag} className="px-3 py-1 bg-blue-500/10 text-blue-400 text-[11px] font-bold rounded-lg border border-blue-500/20 transition-all hover:bg-blue-500/20 cursor-default">
                            #{tag}
                        </span>
                    ))}
                </div>
            )}

            <div className="flex items-center gap-10 pt-6 border-t border-slate-700/30">
                <button
                    onClick={() => onLike(post._id)}
                    className={`flex items-center gap-2.5 transition-all group ${post.likes?.includes(user?._id) ? 'text-rose-500' : 'text-slate-500 hover:text-rose-400'}`}
                >
                    <div className={`p-2 rounded-xl transition-all ${post.likes?.includes(user?._id) ? 'bg-rose-500/10' : 'group-hover:bg-rose-500/10'}`}>
                        <Heart size={20} className={post.likes?.includes(user?._id) ? 'fill-rose-500' : 'group-hover:fill-rose-400/20'} />
                    </div>
                    <span className="text-sm font-black">{post.likes?.length || 0}</span>
                </button>

                <button className="flex items-center gap-2.5 text-slate-500 hover:text-blue-400 transition-all group">
                    <div className="p-2 rounded-xl group-hover:bg-blue-500/10">
                        <MessageSquare size={20} />
                    </div>
                    <span className="text-sm font-black">{post.comments?.length || 0}</span>
                </button>

                <button className="flex items-center gap-2.5 text-slate-500 hover:text-emerald-400 transition-all group ml-auto">
                    <div className="p-2 rounded-xl group-hover:bg-emerald-500/10">
                        <Share2 size={20} />
                    </div>
                </button>
            </div>
        </motion.div>
    );
};

export default PostCard;
