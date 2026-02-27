import React from 'react';
import { motion } from 'framer-motion';
import { Users, MessageSquare, ArrowRight, PlusCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const CommunityCard = ({ community, isSeeker = true }) => {
    const navigate = useNavigate();
    const basePath = isSeeker ? '/seeker/communities' : '/recruiter/communities';

    // Map common community types to colors/icons if they aren't provided
    const getTheme = () => {
        if (community.name?.toLowerCase().includes('guvi')) return 'bg-green-600';
        if (community.name?.toLowerCase().includes('halfbrick')) return 'bg-orange-600';
        return 'bg-blue-600';
    };

    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-6 hover:border-blue-500/50 transition-all cursor-pointer flex flex-col h-full shadow-xl"
            onClick={() => navigate(`${basePath}/${community._id}`)}
        >
            <div className={`w-16 h-16 ${getTheme()} rounded-xl flex items-center justify-center mb-4 shrink-0 shadow-lg`}>
                <Users size={32} className="text-white" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                {community.name}
            </h3>
            <p className="text-slate-400 mb-6 text-sm flex-1 leading-relaxed">
                {community.description}
            </p>
            <div className="flex items-center justify-between mt-auto">
                <span className="text-slate-500 text-xs font-medium">
                    {community.members?.length || 0} members
                </span>
                <div className="flex gap-2">
                    {community.isMember && (
                        <button
                            onClick={(e) => {
                                e.stopPropagation();
                                navigate(`${basePath}/${community._id}?action=post`);
                            }}
                            className="px-4 py-2 bg-blue-600/10 hover:bg-blue-600/20 text-blue-400 rounded-lg text-xs font-bold transition-colors flex items-center gap-1.5"
                        >
                            <PlusCircle size={14} />
                            {isSeeker ? 'Ask' : 'Post'}
                        </button>
                    )}
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            navigate(`${basePath}/${community._id}`);
                        }}
                        className="px-4 py-2 bg-slate-700 hover:bg-slate-600 text-white rounded-lg text-xs font-bold transition-colors"
                    >
                        {community.isMember ? 'View' : 'Join'}
                    </button>
                </div>
            </div>
        </motion.div>
    );
};

export default CommunityCard;
