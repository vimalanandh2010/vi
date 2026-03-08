import React from 'react';
import { motion } from 'framer-motion';
import {
    MapPin,
    Briefcase,
    DollarSign,
    Heart,
    Star,
    Clock,
    Zap,
    Bookmark,
    ArrowRight
} from 'lucide-react';
import VerificationBadge from '../Common/VerificationBadge';

/**
 * JobCard - Vertical "Superio" Style
 * Boxy layout as per user requirements with a premium white theme
 */
const JobCard = ({
    job,
    isSaved = false,
    onSave,
    onApply,
    onClick
}) => {
    const formatSalary = (salary) => {
        if (!salary) return 'Not disclosed';
        if (typeof salary === 'object') {
            return `${salary.min?.toLocaleString()} - ${salary.max?.toLocaleString()}`;
        }
        return `${salary.toLocaleString()}`;
    };

    const getLogoGradient = (name) => {
        const gradients = [
            'from-blue-600 to-blue-800',
            'from-indigo-600 to-indigo-800',
            'from-slate-600 to-slate-800',
            'from-zinc-700 to-zinc-900',
        ];
        const index = (name?.charCodeAt(0) || 0) % gradients.length;
        return gradients[index];
    };

    const formatDate = (dateString) => {
        if (!dateString) return 'Recent';
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{
                y: -8,
                boxShadow: "0 25px 50px -12px rgba(0, 0, 0, 0.2)",
                backgroundColor: "#1e3a8a",
                borderColor: "#1e3a8a"
            }}
            className="group relative bg-white border border-slate-200 rounded-2xl p-6 transition-all duration-500 cursor-pointer shadow-sm flex flex-col h-full overflow-hidden max-w-sm mx-auto w-full"
            onClick={onClick}
        >
            {/* Top Row: Title & Bookmark */}
            <div className="flex justify-between items-start mb-4 pt-2 relative z-10">
                <div className="flex-1 pr-4">
                    <h3 className="text-lg font-bold text-[#000000] group-hover:text-white leading-tight transition-colors duration-500 line-clamp-2">
                        {job.title}
                    </h3>
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); onSave?.(job._id); }}
                    className="p-2 text-[#000000] group-hover:text-white bg-slate-100 group-hover:bg-white/10 rounded-lg transition-all shrink-0"
                >
                    <Bookmark size={18} className={isSaved ? 'fill-black text-black group-hover:fill-white group-hover:text-white' : ''} />
                </button>
            </div>

            {/* Company Info */}
            <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className="w-10 h-10 rounded-lg bg-white border border-slate-200 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                    {job.company?.logo ? (
                        <img src={job.company.logo} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className={`w-full h-full bg-gradient-to-br ${getLogoGradient(job.company?.name || job.companyName)} flex items-center justify-center`}>
                            <span className="text-base font-black text-white">{(job.company?.name || job.companyName || 'J').charAt(0)}</span>
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-[#000000] group-hover:text-white truncate transition-colors duration-500 mb-1">{job.company?.name || job.companyName || 'Company'}</p>
                    <p className="text-xs text-slate-500 group-hover:text-blue-200 transition-colors duration-500">{formatDate(job.createdAt)}</p>
                </div>
            </div>

            {/* Metadata Section */}
            <div className="flex flex-wrap items-center gap-2 mb-4 text-[#000000] group-hover:text-white text-xs font-medium relative z-10 transition-colors duration-500">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 group-hover:bg-white/10 rounded-lg">
                    <MapPin size={13} className="text-[#000000] group-hover:text-white" />
                    <span className="text-xs">{job.location || 'Location'}</span>
                </div>
                <div className="flex items-center gap-1.5 px-3 py-1 bg-black group-hover:bg-white text-white group-hover:text-black rounded-lg text-xs font-bold transition-all duration-500">
                    <Clock size={12} />
                    {job.jobType || job.type || 'Full Time'}
                </div>
            </div>

            {/* Description Snippet */}
            <p className="text-slate-600 group-hover:text-blue-100 text-sm line-clamp-3 mb-4 transition-colors duration-500 leading-relaxed">
                {job.description || "Exciting opportunity to join a world-class team and work on industry-leading projects. We value innovation and creativity."}
            </p>

            {/* Tags / Skills */}
            <div className="flex flex-wrap gap-2 mb-5 relative z-10">
                {job.tags?.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-700 group-hover:bg-white/10 group-hover:text-white hover:bg-white/20 text-xs font-medium rounded-lg transition-all duration-500">
                        {tag}
                    </span>
                )) || (
                        ['React', 'Node.js', 'PostgreSQL'].map((tag, idx) => (
                            <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-700 group-hover:bg-white/10 group-hover:text-white hover:bg-white/20 text-xs font-medium rounded-lg transition-all duration-500">
                                {tag}
                            </span>
                        ))
                    )}
                {job.tags?.length > 3 && (
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 group-hover:bg-white/10 group-hover:text-white text-xs font-medium rounded-lg transition-all duration-500">
                        +{job.tags.length - 3}
                    </span>
                )}
            </div>

            {/* Salary Display */}
            <div className="mb-5 relative z-10 mt-auto">
                <div className="text-xl font-bold text-[#000000] group-hover:text-white flex items-baseline gap-1 transition-colors duration-500">
                    <span className="text-lg font-bold text-slate-900 group-hover:text-white">₹</span>
                    {formatSalary(job.salary)}
                    <span className="text-xs font-medium text-slate-500 group-hover:text-blue-200 ml-1">/ Month</span>
                </div>
            </div>

            {/* Footer Section: Button */}
            <div className="pt-4 border-t border-slate-200 group-hover:border-white/20 relative z-10 transition-colors duration-500">
                <button
                    onClick={(e) => { e.stopPropagation(); onApply?.(job._id); }}
                    className="w-full py-2.5 bg-black hover:bg-zinc-900 group-hover:bg-white group-hover:!text-slate-900 text-white text-sm font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 border border-transparent shadow-sm hover:scale-105 active:scale-95"
                >
                    Apply Now
                    <ArrowRight size={16} />
                </button>
            </div>
        </motion.div>
    );
};

export default JobCard;
