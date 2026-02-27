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
    TrendingUp,
    Heart
} from 'lucide-react';
import HoverCard from './HoverCard';
import VerificationBadge from '../Common/VerificationBadge';

/**
 * CompanyCard - Beautiful card with hover reveal for company listings
 * Reveals: company size, industry, open positions, culture on hover
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
            'Startup': 'bg-green-500/20 text-green-400 border-green-500/30',
            'Unicorn Startup': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
            'Scale-up': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
            'MNC': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
            'Enterprise': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
            'NGO': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
            'Government': 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
        };
        return colors[type] || 'bg-slate-500/20 text-slate-400 border-slate-500/30';
    };

    const getGlowColor = (type) => {
        const colors = {
            'Startup': 'green',
            'Unicorn Startup': 'purple',
            'Scale-up': 'blue',
            'MNC': 'orange',
            'Enterprise': 'cyan',
            'NGO': 'pink',
            'Government': 'yellow',
        };
        return colors[type] || 'blue';
    };

    // Default data for demo
    const defaultOpenings = company.openings || Math.floor(Math.random() * 20) + 1;
    const defaultIndustries = company.industry ? [company.industry] : ['Technology', 'Software'];
    const defaultCulture = ['Work-life balance', 'Innovation', 'Collaboration', 'Growth opportunities'];
    const defaultPerks = ['Remote Work', 'Health Insurance', 'Learning Budget', 'Flexible Hours', 'Stock Options', 'Free Meals'];

    return (
        <HoverCard 
            glowColor={getGlowColor(company.type)}
            variant="glass"
            revealPosition="overlay"
            className="cursor-pointer"
        >
            {/* Main Content - Visible by default */}
            <div className="p-6" onClick={onClick}>
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-4">
                        <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-2xl font-bold text-white shadow-lg border border-slate-600 overflow-hidden">
                            {company.logo ? (
                                <img src={company.logo} alt="" className="w-full h-full object-cover" />
                            ) : (
                                <Building2 size={32} />
                            )}
                        </div>
                        <div>
                            <div className="flex items-center gap-2">
                                <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                                    {company.name}
                                </h3>
                                {company.isVerified && <VerificationBadge size={14} />}
                            </div>
                            <div className="flex items-center gap-2 text-slate-400 text-sm mt-1">
                                <MapPin size={14} />
                                <span>{company.location || 'Remote'}</span>
                            </div>
                        </div>
                    </div>
                    <button 
                        onClick={(e) => { e.stopPropagation(); onSave?.(company._id); }}
                        className={`p-2 rounded-xl transition-all ${isSaved ? 'text-rose-500 bg-rose-500/10' : 'text-slate-500 hover:text-rose-400 hover:bg-rose-500/10'}`}
                    >
                        <Heart size={20} className={isSaved ? 'fill-rose-500' : ''} />
                    </button>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                    <span className={`px-3 py-1 text-xs font-bold rounded-lg border ${getCompanyTypeColor(company.type)}`}>
                        {company.type || 'Startup'}
                    </span>
                    {company.industry && (
                        <span className="px-3 py-1 text-xs font-medium text-slate-400 bg-slate-800/50 rounded-lg">
                            {company.industry}
                        </span>
                    )}
                    {company.rating && (
                        <span className="px-3 py-1 text-xs font-medium text-yellow-400 bg-yellow-500/10 rounded-lg flex items-center gap-1 border border-yellow-500/20">
                            <Star size={12} className="fill-yellow-400" /> {company.rating}
                        </span>
                    )}
                </div>

                <p className="text-slate-400 text-sm line-clamp-2 mb-4">
                    {company.description?.substring(0, 120) || 'Leading company in the industry, offering exciting opportunities for talented individuals.'}...
                </p>

                <div className="flex items-center justify-between pt-4 border-t border-slate-700/30">
                    <div className="flex items-center gap-4 text-slate-500">
                        <div className="flex items-center gap-1">
                            <Users size={14} />
                            <span className="text-xs font-bold">{formatCompanySize(company.size)}</span>
                        </div>
                        <div className="flex items-center gap-1">
                            <Briefcase size={14} />
                            <span className="text-xs font-bold">{defaultOpenings} openings</span>
                        </div>
                    </div>
                    
                    <button className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition-all hover:shadow-lg hover:shadow-blue-500/30">
                        View Jobs <ArrowRight size={14} />
                    </button>
                </div>
            </div>

            {/* Revealed Content - Shows on hover */}
            <div className="p-6 border-t border-slate-700/30">
                <div className="flex items-center gap-2 mb-4">
                    <TrendingUp size={16} className="text-blue-400" />
                    <h4 className="text-sm font-bold text-white">Company Overview</h4>
                </div>
                
                {/* Industry */}
                <div className="flex items-center justify-between mb-3 p-3 bg-slate-800/50 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Building2 size={16} />
                        <span className="text-xs font-medium">Industry</span>
                    </div>
                    <span className="text-sm font-bold text-white">
                        {defaultIndustries[0]}
                    </span>
                </div>

                {/* Company Size */}
                <div className="flex items-center justify-between mb-3 p-3 bg-slate-800/50 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Users size={16} />
                        <span className="text-xs font-medium">Company Size</span>
                    </div>
                    <span className="text-sm font-bold text-white">
                        {formatCompanySize(company.size)}
                    </span>
                </div>

                {/* Open Positions */}
                <div className="flex items-center justify-between mb-4 p-3 bg-slate-800/50 rounded-xl">
                    <div className="flex items-center gap-2 text-slate-400">
                        <Briefcase size={16} />
                        <span className="text-xs font-medium">Open Positions</span>
                    </div>
                    <span className="text-sm font-bold text-green-400">
                        {defaultOpenings} jobs
                    </span>
                </div>

                {/* Website */}
                {company.website && (
                    <div className="flex items-center justify-between mb-4 p-3 bg-slate-800/50 rounded-xl">
                        <div className="flex items-center gap-2 text-slate-400">
                            <Globe size={16} />
                            <span className="text-xs font-medium">Website</span>
                        </div>
                        <a 
                            href={company.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-sm font-bold text-blue-400 hover:text-blue-300"
                            onClick={(e) => e.stopPropagation()}
                        >
                            Visit Site
                        </a>
                    </div>
                )}

                {/* Culture */}
                <div className="mb-4">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Culture</h5>
                    <div className="flex flex-wrap gap-1.5">
                        {defaultCulture.slice(0, 4).map((item, idx) => (
                            <span key={idx} className="px-2 py-1 bg-purple-500/10 text-purple-400 text-[10px] font-medium rounded-lg border border-purple-500/20">
                                {item}
                            </span>
                        ))}
                    </div>
                </div>

                {/* Perks & Benefits */}
                <div className="mb-4">
                    <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Perks & Benefits</h5>
                    <div className="flex flex-wrap gap-1.5">
                        {defaultPerks.slice(0, 4).map((perk, idx) => (
                            <span key={idx} className="px-2 py-1 bg-green-500/10 text-green-400 text-[10px] font-medium rounded-lg border border-green-500/20">
                                {perk}
                            </span>
                        ))}
                        {defaultPerks.length > 4 && (
                            <span className="px-2 py-1 bg-slate-700 text-slate-400 text-[10px] font-medium rounded-lg">
                                +{defaultPerks.length - 4} more
                            </span>
                        )}
                    </div>
                </div>

                {/* Founded Year */}
                {company.founded && (
                    <div className="flex items-center justify-between mb-4 p-3 bg-slate-800/50 rounded-xl">
                        <div className="flex items-center gap-2 text-slate-400">
                            <CheckCircle2 size={16} />
                            <span className="text-xs font-medium">Founded</span>
                        </div>
                        <span className="text-sm font-bold text-white">
                            {company.founded}
                        </span>
                    </div>
                )}

                {/* View Details Button */}
                <button 
                    onClick={(e) => { e.stopPropagation(); onClick?.(); }}
                    className="w-full py-3 bg-blue-600/20 hover:bg-blue-600 text-blue-400 hover:text-white text-sm font-bold rounded-xl border border-blue-500/30 hover:border-blue-500 transition-all flex items-center justify-center gap-2"
                >
                    Explore Company <ArrowRight size={16} />
                </button>
            </div>
        </HoverCard>
    );
};

export default CompanyCard;
