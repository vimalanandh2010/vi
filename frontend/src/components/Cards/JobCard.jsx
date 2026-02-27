import React from 'react';
import { motion } from 'framer-motion';
import {
    MapPin,
    Briefcase,
    Clock,
    DollarSign,
    Users,
    Award,
    ArrowRight,
    CheckCircle2,
    GraduationCap,
    Building2,
    Wifi,
    Heart
} from 'lucide-react';
import HoverCard from './HoverCard';
import VerificationBadge from '../Common/VerificationBadge';

/**
 * JobCard - Beautiful card with hover reveal for job listings
 * Reveals: salary, requirements, benefits, company details on hover
 */
const JobCard = ({
    job,
    isSaved = false,
    isApplied = false,
    onSave,
    onApply,
    onClick
}) => {
    const formatSalary = (salary) => {
        if (!salary) return 'Not disclosed';
        if (typeof salary === 'object') {
            return `$${salary.min?.toLocaleString()} - $${salary.max?.toLocaleString()}`;
        }
        return `$${salary.toLocaleString()}`;
    };

    const getJobTypeColor = (type) => {
        const colors = {
            'Full Time': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            'Part Time': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
            'Remote': 'bg-green-500/20 text-green-400 border-green-500/30',
            'Hybrid': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
            'Contract': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
            'Internship': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
            'Freelance': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        };
        return colors[type] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    };

    const defaultRequirements = job.requirements || ['Skills as per job description', 'Relevant experience'];
    const defaultBenefits = job.benefits || ['Health insurance', 'Professional growth', 'Flexible working hours'];

    // Determine glow color based on job type
    const getGlowColor = (type) => {
        const colors = {
            'Full Time': 'blue',
            'Part Time': 'purple',
            'Remote': 'green',
            'Hybrid': 'orange',
            'Contract': 'cyan',
            'Internship': 'pink',
            'Freelance': 'yellow',
        };
        return colors[type] || 'blue';
    };

    return (
        <HoverCard
            glowColor={getGlowColor(job.jobType)}
            variant="glass"
            revealPosition="overlay"
            className="cursor-pointer"
        >
            {/* Main Content - Visible by default */}
            <div className="p-6" onClick={onClick}>
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-xl font-bold text-white shadow-lg border border-slate-600">
                            {job.company?.logo ? (
                                <img src={job.company.logo} alt="" className="w-full h-full object-cover rounded-2xl" />
                            ) : (
                                <Building2 size={24} />
                            )}
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                                {job.title}
                            </h3>
                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                <span className="font-medium">{job.company?.name || 'Company'}</span>
                                {job.company?.isVerified && <VerificationBadge size={12} />}
                            </div>
                        </div>
                    </div>
                    <button
                        onClick={(e) => { e.stopPropagation(); onSave?.(job._id); }}
                        className={`p-2 rounded-xl transition-all ${isSaved ? 'text-rose-500 bg-rose-500/10' : 'text-slate-500 hover:text-rose-400 hover:bg-rose-500/10'}`}
                    >
                        <Heart size={20} className={isSaved ? 'fill-rose-500' : ''} />
                    </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-3 py-1 text-xs font-bold rounded-lg border ${getJobTypeColor(job.jobType)}`}>
                        {job.jobType || 'Full Time'}
                    </span>
                    {job.location && (
                        <span className="px-3 py-1 text-xs font-medium text-slate-400 bg-slate-800/50 rounded-lg flex items-center gap-1">
                            <MapPin size={12} /> {job.location}
                        </span>
                    )}
                    {job.experience && (
                        <span className="px-3 py-1 text-xs font-medium text-slate-400 bg-slate-800/50 rounded-lg flex items-center gap-1">
                            <Briefcase size={12} /> {job.experience} yrs
                        </span>
                    )}
                </div>

                <p className="text-slate-400 text-sm line-clamp-2 mb-4">
                    {job.description?.substring(0, 150)}...
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-700/30">
                    <div className="flex items-center gap-4 text-slate-500">
                        <div className="flex items-center gap-1">
                            <Users size={14} />
                            <span className="text-xs font-bold">{job.applicantsCount || 0}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Clock size={14} />
                            <span className="text-xs font-bold">{job.postedDate || 'Recently'}</span>
                        </div>
                    </div>

                    {isApplied ? (
                        <span className="flex items-center gap-1 px-4 py-2 bg-green-500/10 text-green-400 text-xs font-bold rounded-xl border border-green-500/20">
                            <CheckCircle2 size={14} /> Applied
                        </span>
                    ) : (
                        <button
                            onClick={(e) => { e.stopPropagation(); onApply?.(job._id); }}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/30"
                        >
                            Apply Now <ArrowRight size={14} />
                        </button>
                    )}
                </div>
            </div>

            {/* Revealed Content - Shows on hover */}
            <div className="p-6 border-t border-slate-700/30">
                <div className="flex items-center gap-2 mb-4">
                    <Award size={16} className="text-blue-400" />
                    <h4 className="text-sm font-bold text-white">Quick Details</h4>
                </div>

                {/* Salary */}
                <div className="flex items-center justify-between mb-3 p-3 bg-slate-800/50 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-400">
                        <DollarSign size={16} />
                        <span className="text-xs font-medium">Salary Range</span>
                    </div>
                    <span className="text-sm font-bold text-green-400">
                        {formatSalary(job.salary)}
                    </span>
                </div>

                {/* Experience */}
                <div className="flex items-center justify-between mb-3 p-3 bg-slate-800/50 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Briefcase size={16} />
                        <span className="text-xs font-medium">Experience</span>
                    </div>
                    <span className="text-sm font-bold text-white">
                        {job.experience || '0-2'} years
                    </span>
                </div>

                {/* Work Mode */}
                <div className="flex items-center justify-between mb-4 p-3 bg-slate-800/50 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Wifi size={16} />
                        <span className="text-xs font-medium">Work Mode</span>
                    </div>
                    <span className="text-sm font-bold text-white">
                        {job.jobType || 'Full Time'}
                    </span>
                </div>

                {/* Key Requirements */}
                <div className="mb-4">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Key Requirements</h5>
                    <ul className="space-y-1.5">
                        {defaultRequirements.slice(0, 3).map((req, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-xs text-slate-300">
                                <CheckCircle2 size={12} className="text-green-400 mt-0.5 shrink-0" />
                                <span className="line-clamp-1">{req}</span>
                            </li>
                        ))}
                    </ul>
                </div>

                {/* Benefits */}
                <div className="mb-4">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Benefits</h5>
                    <div className="flex flex-wrap gap-1.5">
                        {defaultBenefits.slice(0, 4).map((benefit, idx) => (
                            <span key={idx} className="px-2 py-1 bg-green-500/10 text-green-400 text-[10px] font-medium rounded-lg border border-green-500/20">
                                {benefit}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Skills */}
                {job.skills?.length > 0 && (
                    <div className="mb-4">
                        <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Required Skills</h5>
                        <div className="flex flex-wrap gap-1.5">
                            {job.skills.slice(0, 5).map((skill, idx) => (
                                <span key={idx} className="px-2 py-1 bg-blue-500/10 text-blue-400 text-[10px] font-medium rounded-lg border border-blue-500/20">
                                    {skill}
                                </span>
                            ))}
                            {job.skills.length > 5 && (
                                <span className="px-2 py-1 bg-slate-700 text-slate-400 text-[10px] font-medium rounded-lg">
                                    +{job.skills.length - 5} more
                                </span>
                            )}
                        </div>
                    </div>
                )}

                {/* View Details Button */}
                <button
                    onClick={(e) => { e.stopPropagation(); onClick?.(); }}
                    className="w-full py-3 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white text-sm font-bold rounded-xl border border-blue-500/30 hover:border-blue-500 transition-all flex items-center justify-center gap-2"
                >
                    View Full Details <ArrowRight size={16} />
                </button>
            </div>
        </HoverCard>
    );
};

export default JobCard;
