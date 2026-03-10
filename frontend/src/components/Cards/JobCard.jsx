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

    const getJobTypeBadgeStyle = (jobType) => {
        const type = (jobType || '').toLowerCase();
        
        const styles = {
            'full time': {
                bg: 'bg-green-100',
                text: 'text-green-700',
                border: 'border-green-200',
                hoverBg: 'group-hover:bg-green-200',
                iconColor: 'text-green-600'
            },
            'part time': {
                bg: 'bg-amber-100',
                text: 'text-amber-700',
                border: 'border-amber-200',
                hoverBg: 'group-hover:bg-amber-200',
                iconColor: 'text-amber-600'
            },
            'remote': {
                bg: 'bg-purple-100',
                text: 'text-purple-700',
                border: 'border-purple-200',
                hoverBg: 'group-hover:bg-purple-200',
                iconColor: 'text-purple-600'
            },
            'contract': {
                bg: 'bg-blue-100',
                text: 'text-blue-700',
                border: 'border-blue-200',
                hoverBg: 'group-hover:bg-blue-200',
                iconColor: 'text-blue-600'
            },
            'internship': {
                bg: 'bg-pink-100',
                text: 'text-pink-700',
                border: 'border-pink-200',
                hoverBg: 'group-hover:bg-pink-200',
                iconColor: 'text-pink-600'
            }
        };
        
        return styles[type] || styles['full time'];
    };

    const jobTypeStyles = getJobTypeBadgeStyle(job.jobType || job.type);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{
                y: -8,
                boxShadow: "0 25px 50px rgba(59, 130, 246, 0.15)"
            }}
            className="group relative bg-white border-2 border-blue-200/50 hover:border-blue-300 rounded-2xl p-6 transition-all duration-300 cursor-pointer shadow-xl hover:shadow-2xl hover:shadow-blue-500/20 flex flex-col h-full overflow-hidden max-w-sm mx-auto w-full"
            onClick={onClick}
        >
            {/* Top Row: Title & Bookmark */}
            <div className="flex justify-between items-start mb-4 pt-2 relative z-10">
                <div className="flex-1 pr-4">
                    <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-900 leading-tight transition-colors duration-300 line-clamp-2">
                        {job.title}
                    </h3>
                </div>
                <button
                    onClick={(e) => { e.stopPropagation(); onSave?.(job._id); }}
                    className="p-2 text-slate-700 group-hover:text-blue-600 bg-slate-100 group-hover:bg-blue-50 rounded-lg transition-all shrink-0"
                >
                    <Bookmark size={18} className={isSaved ? 'fill-blue-600 text-blue-600' : ''} />
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
                    <p className="text-sm font-bold text-slate-900 group-hover:text-blue-900 truncate transition-colors duration-300 mb-1">{job.company?.name || job.companyName || 'Company'}</p>
                    <p className="text-xs text-slate-500 group-hover:text-blue-700 transition-colors duration-300">{formatDate(job.createdAt)}</p>
                </div>
            </div>

            {/* Metadata Section */}
            <div className="flex flex-wrap items-center gap-2 mb-4 text-xs font-medium relative z-10">
                <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 group-hover:bg-blue-50 rounded-lg transition-colors duration-300">
                    <MapPin size={13} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                    <span className="text-xs text-slate-500 group-hover:text-blue-700 transition-colors duration-300">{job.location || 'Location'}</span>
                </div>
                <div className={`flex items-center gap-1.5 px-3 py-1.5 ${jobTypeStyles.bg} ${jobTypeStyles.text} border ${jobTypeStyles.border} ${jobTypeStyles.hoverBg} rounded-lg transition-all duration-300 shadow-sm`}>
                    <Clock size={13} className={`${jobTypeStyles.iconColor} flex-shrink-0`} />
                    <span className="text-xs font-semibold whitespace-nowrap">{job.jobType || job.type || 'Full Time'}</span>
                </div>
            </div>

            {/* Description Snippet */}
            <p className="text-slate-600 group-hover:text-blue-800 text-sm line-clamp-3 mb-4 transition-colors duration-300 leading-relaxed">
                {job.description || "Exciting opportunity to join a world-class team and work on industry-leading projects. We value innovation and creativity."}
            </p>

            {/* Tags / Skills */}
            <div className="flex flex-wrap gap-2 mb-5 relative z-10">
                {job.tags?.slice(0, 3).map((tag, idx) => (
                    <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-700 group-hover:bg-blue-50 group-hover:text-blue-700 hover:bg-blue-100 text-xs font-medium rounded-lg transition-all duration-300">
                        {tag}
                    </span>
                )) || (
                        ['React', 'Node.js', 'PostgreSQL'].map((tag, idx) => (
                            <span key={idx} className="px-2.5 py-1 bg-slate-100 text-slate-700 group-hover:bg-blue-50 group-hover:text-blue-700 hover:bg-blue-100 text-xs font-medium rounded-lg transition-all duration-300">
                                {tag}
                            </span>
                        ))
                    )}
                {job.tags?.length > 3 && (
                    <span className="px-2.5 py-1 bg-slate-100 text-slate-700 group-hover:bg-blue-50 group-hover:text-blue-700 text-xs font-medium rounded-lg transition-all duration-300">
                        +{job.tags.length - 3}
                    </span>
                )}
            </div>

            {/* Salary Display */}
            <div className="mb-5 relative z-10 mt-auto">
                <div className="text-xl font-bold text-slate-900 group-hover:text-blue-900 flex items-baseline gap-1 transition-colors duration-300">
                    <span className="text-lg font-bold text-slate-900 group-hover:text-blue-900">₹</span>
                    {formatSalary(job.salary)}
                    <span className="text-xs font-medium text-slate-500 group-hover:text-blue-700 ml-1">/ Month</span>
                </div>
            </div>

            {/* Footer Section: Button */}
            <div className="pt-4 border-t border-slate-200 group-hover:border-blue-200 relative z-10 transition-colors duration-300">
                <button
                    onClick={(e) => { e.stopPropagation(); onApply?.(job._id); }}
                    className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 active:scale-95"
                >
                    Apply Now
                    <ArrowRight size={16} />
                </button>
            </div>
        </motion.div>
    );
};

export default JobCard;
