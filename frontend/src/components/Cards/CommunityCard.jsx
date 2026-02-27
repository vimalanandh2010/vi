import React from 'react';
import { motion } from 'framer-motion';
import {
    Users,
    MessageSquare,
    ArrowRight,
    Calendar,
    Globe,
    Lock
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import HoverCard from './HoverCard';

/**
 * CommunityCard - Beautiful card with hover reveal for community listings
 * Reveals: member count, post count, rules, join options on hover
 */
const CommunityCard = ({ community, isSeeker = true }) => {
    const navigate = useNavigate();
    const basePath = isSeeker ? '/seeker/communities' : '/recruiter/communities';

    const getGlowColor = () => {
        const colors = ['blue', 'purple', 'green', 'orange', 'pink', 'cyan'];
        const index = (community.name?.charCodeAt(0) || 0) % colors.length;
        return colors[index];
    };

    // Default data
    const memberCount = community.members?.length || Math.floor(Math.random() * 500) + 50;
    const postCount = community.postsCount || Math.floor(Math.random() * 100) + 10;
    const defaultRules = ['Be respectful', 'No spam', 'Stay on topic', 'Help others'];
    const defaultBenefits = ['Networking', 'Job alerts', 'Mentorship', 'Events access'];

    return (
        <HoverCard
            glowColor={getGlowColor()}
            variant="glass"
            revealPosition="overlay"
            className="cursor-pointer"
        >
            {/* Main Content - Visible by default */}
            <div onClick={() => navigate(`${basePath}/${community._id}`)}>
                {/* Banner */}
                <div className="h-32 bg-gradient-to-br from-blue-600/20 to-purple-600/20 relative overflow-hidden">
                    {community.banner ? (
                        <img src={community.banner} alt={community.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity duration-500" />
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center text-6xl opacity-20">
                            {community.icon || '🤝'}
                        </div>
                    )}
                    <div className="absolute bottom-4 left-6 flex items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 border border-slate-700/50 flex items-center justify-center text-2xl shadow-2xl">
                            {community.icon || '🤝'}
                        </div>
                    </div>

                    {/* Privacy Badge */}
                    <div className="absolute top-4 right-4">
                        {community.isPrivate ? (
                            <span className="px-2 py-1 bg-slate-900/80 text-slate-400 text-[10px] font-bold rounded-lg flex items-center gap-1 border border-slate-700/50">
                                <Lock size={10} /> Private
                            </span>
                        ) : (
                            <span className="px-2 py-1 bg-slate-900/80 text-green-400 text-[10px] font-bold rounded-lg flex items-center gap-1 border border-green-500/30">
                                <Globe size={10} /> Public
                            </span>
                        )}
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    <h3 className="text-xl font-bold mb-2 text-white group-hover:text-blue-400 transition-colors truncate">
                        {community.name}
                    </h3>
                    <p className="text-slate-400 text-sm line-clamp-2 mb-6">
                        {community.description}
                    </p>

                    <div className="flex items-center justify-between pt-6 border-t border-slate-700/30">
                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-1.5 text-slate-500">
                                <Users size={16} />
                                <span className="text-xs font-bold">{memberCount}</span>
                            </div>
                            <div className="flex items-center gap-1.5 text-slate-500">
                                <MessageSquare size={16} />
                                <span className="text-xs font-bold">{postCount}</span>
                            </div>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); navigate(`${basePath}/${community._id}`); }}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white rounded-xl text-xs font-bold transition-all active:scale-95 group-hover:shadow-lg group-hover:shadow-blue-500/20"
                        >
                            Enter <ArrowRight size={14} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Revealed Content - Shows on hover */}
            <div className="p-6 border-t border-slate-700/30">
                <div className="flex items-center gap-2 mb-4">
                    <MessageSquare size={16} className="text-blue-400" />
                    <h4 className="text-sm font-bold text-white">Community Details</h4>
                </div>

                {/* Members */}
                <div className="flex items-center justify-between mb-3 p-3 bg-slate-800/50 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Users size={16} />
                        <span className="text-xs font-medium">Members</span>
                    </div>
                    <span className="text-sm font-bold text-white">
                        {memberCount} members
                    </span>
                </div>

                {/* Posts */}
                <div className="flex items-center justify-between mb-3 p-3 bg-slate-800/50 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-400">
                        <MessageSquare size={16} />
                        <span className="text-xs font-medium">Posts</span>
                    </div>
                    <span className="text-sm font-bold text-white">
                        {postCount} posts
                    </span>
                </div>

                {/* Created Date */}
                {community.createdAt && (
                    <div className="flex items-center justify-between mb-4 p-3 bg-slate-800/50 rounded-xl">
                        <div className="flex items-center gap-2 text-slate-400">
                            <Calendar size={16} />
                            <span className="text-xs font-medium">Created</span>
                        </div>
                        <span className="text-sm font-bold text-white">
                            {new Date(community.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                        </span>
                    </div>
                )}

                {/* Community Rules */}
                <div className="mb-4">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Community Rules</h5>
                    <ul className="space-y-1.5">
                        {defaultRules.slice(0, 3).map((rule, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                                <span className="w-1.5 h-1.5 rounded-full bg-green-400 mt-1.5 shrink-0" />
                                <span className="line-clamp-1">{rule}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Benefits */}
                <div className="mb-4">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Member Benefits</h5>
                    <div className="flex flex-wrap gap-1.5">
                        {defaultBenefits.slice(0, 4).map((benefit, idx) => (
                            <span key={idx} className="px-2 py-1 bg-purple-500/10 text-purple-400 text-[10px] font-medium rounded-lg border border-purple-500/20">
                                {benefit}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Categories/Tags */}
                {community.tags?.length > 0 && (
                    <div className="mb-4">
                        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Categories</h5>
                        <div className="flex flex-wrap gap-1.5">
                            {community.tags.slice(0, 4).map((tag, idx) => (
                                <span key={idx} className="px-2 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-medium rounded-lg border border-blue-500/20">
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* Join Button */}
                <button
                    onClick={() => navigate(`${basePath}/${community._id}`)}
                    className="w-full py-3 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white text-sm font-bold rounded-xl border border-blue-500/30 hover:border-blue-500 transition-all flex items-center justify-center gap-2"
                >
                    Join Community <ArrowRight size={16} />
                </button>
            </div>
        </HoverCard>
    );
};

export default CommunityCard;
