import React from 'react';
import { motion } from 'framer-motion';
import {
    MapPin,
    Building2,
    Users,
    Briefcase,
    Globe,
    ArrowRight,
    CheckCircle2,
    Star,
    TrendingUp
} from 'lucide-react';
import VerificationBadge from '../Common/VerificationBadge';

/**
 * CompanyCard - Square card design matching JobCard style
 */
const CompanyCard = ({
    company,
    isSaved = false,
    onSave,
    onClick
}) => {
    const formatCompanySize = (size) => {
        if (!size) return 'Not specified';
        if (size >= 1000) return `${(size / 1000).toFixed(1)}k+ employees`;
        if (size >= 100) return `${size}+ employees`;
        return `${size} employees`;
    };

    const getCompanyTypeColor = (type) => {
        const colors = {
            'Startup': 'bg-green-100 text-green-700 border-green-200',
            'Unicorn Startup': 'bg-purple-100 text-purple-700 border-purple-200',
            'Scale-up': 'bg-blue-100 text-blue-700 border-blue-200',
            'MNC': 'bg-orange-100 text-orange-700 border-orange-200',
            'Enterprise': 'bg-cyan-100 text-cyan-700 border-cyan-200',
            'NGO': 'bg-pink-100 text-pink-700 border-pink-200',
            'Government': 'bg-yellow-100 text-yellow-700 border-yellow-200',
        };
        return colors[type] || 'bg-slate-100 text-slate-700 border-slate-200';
    };

    // Default data for demo
    const defaultOpenings = company.openings || Math.floor(Math.random() * 20) + 1;

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
            {/* Top Row: Company Name */}
            <div className="flex justify-between items-start mb-4 pt-2 relative z-10">
                <div className="flex-1 pr-4">
                    <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-bold text-slate-900 group-hover:text-blue-900 leading-tight transition-colors duration-300 line-clamp-2">
                            {company.name}
                        </h3>
                        {company.isVerified && <VerificationBadge size={14} />}
                    </div>
                </div>
            </div>

            {/* Company Logo */}
            <div className="flex items-center gap-3 mb-4 relative z-10">
                <div className="w-16 h-16 rounded-xl bg-white border-2 border-slate-200 flex items-center justify-center shrink-0 overflow-hidden shadow-sm">
                    {company.logo ? (
                        <img src={company.logo} alt="" className="w-full h-full object-cover" />
                    ) : (
                        <div className="w-full h-full bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center">
                            <Building2 size={32} className="text-white stroke-white" strokeWidth={2.5} />
                        </div>
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 text-slate-500 text-xs mb-2">
                        <MapPin size={13} className="flex-shrink-0" />
                        <span className="truncate">{company.location || 'Remote'}</span>
                    </div>
                    {company.rating && (
                        <div className="flex items-center gap-1">
                            <Star size={12} className="fill-yellow-400 text-yellow-400" />
                            <span className="text-sm font-bold text-slate-900">{company.rating}</span>
                            <span className="text-xs text-slate-500">/5</span>
                        </div>
                    )}
                </div>
            </div>

            {/* Tags & Type */}
            <div className="flex flex-wrap items-center gap-2 mb-4 text-xs font-medium relative z-10">
                <div className={`flex items-center gap-1.5 px-3 py-1.5 border rounded-lg transition-all duration-300 shadow-sm ${getCompanyTypeColor(company.type)}`}>
                    <Building2 size={13} className="flex-shrink-0" />
                    <span className="text-xs font-semibold whitespace-nowrap">{company.type || 'Startup'}</span>
                </div>
                {company.industry && (
                    <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-100 group-hover:bg-blue-50 border border-slate-200 rounded-lg transition-colors duration-300">
                        <span className="text-xs text-slate-600 group-hover:text-blue-700">{company.industry}</span>
                    </div>
                )}
            </div>

            {/* Description */}
            <p className="text-sm text-slate-600 group-hover:text-slate-700 mb-4 line-clamp-2 relative z-10 transition-colors duration-300">
                {company.description?.substring(0, 100) || 'Leading company in the industry, offering exciting opportunities for talented individuals.'}...
            </p>

            {/* Company Info Grid */}
            <div className="grid grid-cols-2 gap-2 mb-4 relative z-10">
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 group-hover:bg-blue-50 rounded-lg transition-colors duration-300">
                    <Users size={14} className="text-slate-400 group-hover:text-blue-600 flex-shrink-0" />
                    <span className="text-xs text-slate-600 group-hover:text-slate-900 font-medium truncate">{formatCompanySize(company.size)}</span>
                </div>
                <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 group-hover:bg-blue-50 rounded-lg transition-colors duration-300">
                    <Briefcase size={14} className="text-slate-400 group-hover:text-blue-600 flex-shrink-0" />
                    <span className="text-xs text-slate-600 group-hover:text-slate-900 font-medium truncate">{defaultOpenings} openings</span>
                </div>
            </div>

            {/* Bottom Action Button */}
            <div className="mt-auto pt-4 border-t border-slate-200 relative z-10">
                <button
                    className="w-full py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white text-sm font-bold rounded-xl transition-all duration-300 flex items-center justify-center gap-2 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 active:scale-95"
                    onClick={(e) => { e.stopPropagation(); onClick?.(); }}
                >
                    View Jobs <ArrowRight size={16} />
                </button>
            </div>
        </motion.div>
    );
};

export default CompanyCard;
