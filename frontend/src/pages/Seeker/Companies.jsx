import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { Search, MapPin, Building2, Filter, ChevronRight, Briefcase, Globe, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const Companies = () => {
    const [companies, setCompanies] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState({
        type: '',
        industry: '',
        location: '',
        skills: []
    });

    const companyTypes = ['Startup', 'Unicorn Startup', 'Scale-up', 'MNC', 'Enterprise', 'NGO', 'Government'];
    const industriesList = [
        'IoT', 'AI/ML', 'Web/SaaS', 'FinTech', 'EdTech',
        'Hospital', 'School', 'College/University', 'Healthcare',
        'Manufacturing', 'E-commerce', 'BioTech'
    ];

    const popularSkills = ['Python', 'React', 'Node.js', 'JavaScript', 'TypeScript', 'Java', 'AWS', 'Docker'];

    useEffect(() => {
        fetchCompanies();
    }, [filters]);

    const fetchCompanies = async () => {
        setLoading(true);
        try {
            const { type, industry, location, skills } = filters;
            const res = await axiosClient.get('companies', {
                params: {
                    type,
                    industry,
                    location,
                    search: searchQuery,
                    skills: skills.length > 0 ? skills.join(',') : undefined
                }
            });
            setCompanies(res);
        } catch (err) {
            console.error('Error fetching companies:', err);
        } finally {
            setLoading(false);
        }
    };

    const handleSearch = (e) => {
        e.preventDefault();
        fetchCompanies();
    };

    return (
        <div className="min-h-screen bg-white">
            <Navbar />
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-white border-b border-slate-100 py-16 sm:py-28">
                {/* Grid texture overlay */}
                <div className="absolute inset-0 grid-texture opacity-30 pointer-events-none" />
                <div className="max-w-full px-4 sm:px-6 lg:px-12 xl:px-20 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 text-slate-900 font-heading">
                            Discover Top Companies
                        </h1>
                        <p className="text-lg md:text-xl text-slate-500 max-w-2xl mx-auto mb-12 leading-relaxed font-medium">
                            Explore dynamic organizations, learn about their engineering culture, and find your next dream role at the world's most innovative workplaces.
                        </p>

                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex flex-col sm:flex-row gap-3 p-2.5 bg-white border border-slate-200 rounded-3xl shadow-lg shadow-slate-200/50 hover:shadow-xl transition-shadow duration-300">
                            <div className="flex-1 relative flex items-center">
                                <Search className="absolute left-6 text-slate-400" size={24} />
                                <input
                                    type="text"
                                    placeholder="Search by company name or domain..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-transparent border-none text-slate-900 py-4 pl-16 pr-6 focus:outline-none placeholder:text-slate-400 font-bold text-lg"
                                />
                            </div>
                            <button type="submit" className="px-10 py-4 bg-slate-50 border border-slate-200 hover:border-slate-300 hover:bg-slate-100 text-slate-900 rounded-2xl font-black uppercase tracking-widest text-sm transition-all hover:scale-105 active:scale-95 shadow-sm">
                                Search
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-full px-4 sm:px-6 lg:px-12 xl:px-20 py-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <aside className="w-full lg:w-72 shrink-0">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-white border border-slate-200 rounded-3xl p-6 sticky top-28 shadow-sm"
                        >
                            <div className="flex items-center gap-2 mb-8 border-b border-slate-100 pb-4">
                                <Filter className="text-blue-600" size={20} />
                                <h3 className="font-bold text-lg text-slate-900">Filters</h3>
                                {Object.values(filters).some(v => Array.isArray(v) ? v.length > 0 : Boolean(v)) && (
                                    <button
                                        onClick={() => setFilters({ type: '', industry: '', location: '', skills: [] })}
                                        className="ml-auto text-xs text-blue-400 hover:text-blue-300 font-medium"
                                    >
                                        Reset
                                    </button>
                                )}
                            </div>

                            <div className="space-y-8">
                                {/* Company Type */}
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Company Type</label>
                                    <div className="flex flex-wrap gap-2">
                                        {companyTypes.map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setFilters({ ...filters, type: filters.type === type ? '' : type })}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${filters.type === type
                                                    ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                                                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-900'
                                                    }`}
                                            >
                                                {type}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Industries */}
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Industries</label>
                                    <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                        {industriesList.map(industry => (
                                            <button
                                                key={industry}
                                                onClick={() => setFilters({ ...filters, industry: filters.industry === industry ? '' : industry })}
                                                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${filters.industry === industry
                                                    ? 'bg-slate-900 border-slate-900 text-white shadow-md'
                                                    : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-900'
                                                    }`}
                                            >
                                                {industry}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Skills */}
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Focus Skills</label>
                                    <div className="flex flex-wrap gap-2">
                                        {popularSkills.map(skill => {
                                            const isSelected = filters.skills.includes(skill);
                                            return (
                                                <button
                                                    key={skill}
                                                    onClick={() => {
                                                        const newSkills = isSelected
                                                            ? filters.skills.filter(s => s !== skill)
                                                            : [...filters.skills, skill];
                                                        setFilters({ ...filters, skills: newSkills });
                                                    }}
                                                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all border ${isSelected
                                                        ? 'bg-[#1e3a8a] border-[#1e3a8a] text-white shadow-md'
                                                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-slate-300 hover:text-slate-900'
                                                        }`}
                                                >
                                                    {skill}
                                                </button>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Location */}
                                <div>
                                    <label className="text-sm font-bold text-slate-400 uppercase tracking-widest block mb-4">Location</label>
                                    <div className="relative">
                                        <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={16} />
                                        <input
                                            type="text"
                                            placeholder="London, remote..."
                                            value={filters.location}
                                            onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-sm transition-all placeholder:text-slate-400"
                                        />
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </aside>

                    {/* Main Content */}
                    <main className="flex-1">
                        {loading ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[1, 2, 4, 5, 6].map(i => (
                                    <div key={i} className="h-64 bg-slate-900/50 animate-pulse rounded-3xl border border-slate-800/50" />
                                ))}
                            </div>
                        ) : companies.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <AnimatePresence mode="popLayout">
                                    {companies.map((company, idx) => (
                                        <motion.div
                                            key={company._id}
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.2, delay: idx * 0.05 }}
                                            className="group bg-white hover:bg-[#1e3a8a] border border-slate-200 rounded-3xl p-6 transition-all duration-500 shadow-sm hover:shadow-2xl hover:-translate-y-2 cursor-pointer flex flex-col h-full relative overflow-hidden"
                                        >
                                            <div className="flex items-start justify-between mb-6 relative z-10">
                                                <div className="w-16 h-16 rounded-2xl bg-white border border-slate-200 flex items-center justify-center text-2xl font-black text-slate-900 shadow-sm overflow-hidden shrink-0 transition-transform duration-500 group-hover:scale-105">
                                                    {company.logo ? (
                                                        <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        company.name.charAt(0)
                                                    )}
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    {company.verified && (
                                                        <div className="flex items-center gap-1 px-2 py-1 bg-green-50 group-hover:bg-green-500/20 border border-green-200 group-hover:border-green-400/30 rounded-lg transition-colors">
                                                            <CheckCircle size={10} className="text-green-500 group-hover:text-green-300" />
                                                            <span className="text-[9px] font-black uppercase tracking-wider text-green-600 group-hover:text-green-200">Verified</span>
                                                        </div>
                                                    )}
                                                    <span className="px-3 py-1 bg-slate-100 group-hover:bg-white/10 border border-slate-200 group-hover:border-white/20 text-slate-700 group-hover:text-white rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors duration-500">
                                                        {company.companyType || 'Enterprise'}
                                                    </span>
                                                </div>
                                            </div>

                                            <div className="relative z-10">
                                                <h3 className="text-xl font-black text-slate-900 mb-1.5 group-hover:text-white transition-colors duration-500 tracking-tight">{company.name}</h3>
                                                <p className="text-slate-500 group-hover:text-blue-100 text-sm line-clamp-2 mb-6 leading-relaxed font-medium transition-colors duration-500">
                                                    {company.about || 'Innovative company shaping the future of the industry.'}
                                                </p>
                                            </div>

                                            <div className="flex flex-wrap gap-2 mb-8 relative z-10">
                                                {company.industries?.slice(0, 3).map(industry => (
                                                    <span key={industry} className="px-2.5 py-1 bg-slate-100 group-hover:bg-white/10 text-slate-600 group-hover:text-white border border-slate-200 group-hover:border-white/20 rounded-lg text-[9px] font-black uppercase tracking-wider whitespace-nowrap transition-colors duration-500">
                                                        {industry}
                                                    </span>
                                                ))}
                                                {company.industries?.length > 3 && (
                                                    <span className="text-[10px] text-slate-500 group-hover:text-blue-200 self-center transition-colors">+{company.industries.length - 3}</span>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between border-t border-slate-100 group-hover:border-white/20 mt-auto pt-4 transition-colors duration-500 relative z-10">
                                                <div className="flex items-center gap-4 text-slate-500 group-hover:text-white text-xs font-bold transition-colors duration-500">
                                                    <div className="flex items-center gap-1.5">
                                                        <MapPin size={14} className="text-slate-400 group-hover:text-white transition-colors" />
                                                        {company.location || 'Global'}
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Users size={14} className="text-slate-400 group-hover:text-white transition-colors" />
                                                        {company.size || '10-50'}
                                                    </div>
                                                </div>
                                                <Link
                                                    to={`/seeker/company/${company._id}`}
                                                    className="px-4 py-2 bg-slate-900 group-hover:bg-white text-white group-hover:!text-slate-900 rounded-xl text-[10px] font-black uppercase tracking-widest shadow-sm transition-all duration-300 hover:scale-105 active:scale-95"
                                                >
                                                    View
                                                </Link>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="py-24 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200 shadow-sm">
                                <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-inner">
                                    <Building2 size={32} className="text-slate-300" />
                                </div>
                                <h3 className="text-2xl font-black text-slate-900 mb-2 tracking-tight">No companies found</h3>
                                <p className="text-slate-500 font-medium max-w-sm mx-auto leading-relaxed">We couldn't find any companies matching your current filters or search terms.</p>
                            </div>
                        )}
                    </main>
                </div>
            </div>
        </div>
    );
};

const CheckCircle = ({ size, className }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={className}
    >
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
        <polyline points="22 4 12 14.01 9 11.01" />
    </svg>
);

export default Companies;
