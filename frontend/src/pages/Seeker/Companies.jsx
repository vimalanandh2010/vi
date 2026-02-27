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
        <div className="min-h-screen bg-slate-950 text-white">
            <Navbar />
            {/* Hero Section */}
            <div className="relative overflow-hidden bg-slate-900/50 border-b border-slate-800/50 py-16 sm:py-24">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_50%_-20%,#1e293b,transparent)] opacity-50" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="text-center"
                    >
                        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight mb-6 bg-gradient-to-r from-white via-white to-slate-400 bg-clip-text text-transparent">
                            Discover Top Companies
                        </h1>
                        <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mb-10 leading-relaxed">
                            Explore organizations, learn about their culture, and find your next dream role at the world's most innovative workplaces.
                        </p>

                        {/* Search Bar */}
                        <form onSubmit={handleSearch} className="max-w-2xl mx-auto flex gap-3 p-2 bg-slate-800/80 backdrop-blur-xl border border-slate-700/50 rounded-2xl shadow-2xl">
                            <div className="flex-1 relative">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search by company name..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-transparent border-none text-white py-3 pl-12 pr-4 focus:outline-none placeholder:text-slate-600 font-medium"
                                />
                            </div>
                            <button type="submit" className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all hover:scale-[1.02] active:scale-95">
                                Search
                            </button>
                        </form>
                    </motion.div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Filters Sidebar */}
                    <aside className="w-full lg:w-72 shrink-0">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-slate-900/50 border border-slate-800/50 rounded-3xl p-6 sticky top-28"
                        >
                            <div className="flex items-center gap-2 mb-8 border-b border-slate-800 pb-4">
                                <Filter className="text-blue-500" size={20} />
                                <h3 className="font-bold text-lg">Filters</h3>
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
                                    <label className="text-sm font-bold text-slate-400 uppercase tracking-widest block mb-4">Company Type</label>
                                    <div className="space-y-3">
                                        {companyTypes.map(type => (
                                            <button
                                                key={type}
                                                onClick={() => setFilters({ ...filters, type: filters.type === type ? '' : type })}
                                                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all flex items-center justify-between group ${filters.type === type
                                                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                                                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                                                    }`}
                                            >
                                                {type}
                                                {filters.type === type && <CheckCircle size={14} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Industries */}
                                <div>
                                    <label className="text-sm font-bold text-slate-400 uppercase tracking-widest block mb-4">Industries</label>
                                    <div className="space-y-3 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                                        {industriesList.map(industry => (
                                            <button
                                                key={industry}
                                                onClick={() => setFilters({ ...filters, industry: filters.industry === industry ? '' : industry })}
                                                className={`w-full text-left px-4 py-2.5 rounded-xl text-sm transition-all flex items-center justify-between group ${filters.industry === industry
                                                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20'
                                                    : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                                                    }`}
                                            >
                                                {industry}
                                                {filters.industry === industry && <CheckCircle size={14} />}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Skills */}
                                <div>
                                    <label className="text-sm font-bold text-slate-400 uppercase tracking-widest block mb-4">Focus Skills</label>
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
                                                        ? 'bg-blue-600 border-blue-500 text-white shadow-lg shadow-blue-900/40'
                                                        : 'bg-slate-800/50 border-slate-700/50 text-slate-400 hover:border-slate-600 hover:text-slate-200'
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
                                            className="w-full bg-slate-800/50 border border-slate-700/50 text-white rounded-xl py-2.5 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 text-sm transition-all placeholder:text-slate-600"
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
                                            className="group bg-slate-900/40 hover:bg-slate-900/60 backdrop-blur-sm border border-slate-800/50 hover:border-blue-500/30 rounded-3xl p-6 transition-all shadow-lg hover:shadow-blue-900/10"
                                        >
                                            <div className="flex items-start justify-between mb-6">
                                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-800 to-slate-900 border border-slate-700/50 flex items-center justify-center text-2xl font-bold text-white shadow-inner group-hover:scale-110 transition-transform">
                                                    {company.logo ? (
                                                        <img src={company.logo} alt={company.name} className="w-full h-full object-cover rounded-2xl" />
                                                    ) : (
                                                        company.name.charAt(0)
                                                    )}
                                                </div>
                                                <div className="flex flex-col items-end gap-2">
                                                    <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                                        {company.companyType}
                                                    </span>
                                                    {company.verified && (
                                                        <CheckCircle size={16} className="text-green-500" />
                                                    )}
                                                </div>
                                            </div>

                                            <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors uppercase tracking-tight">{company.name}</h3>
                                            <p className="text-slate-400 text-sm line-clamp-2 mb-6 leading-relaxed">
                                                {company.about}
                                            </p>

                                            <div className="flex flex-wrap gap-2 mb-8">
                                                {company.industries.slice(0, 3).map(industry => (
                                                    <span key={industry} className="px-2 py-1 bg-slate-800/80 text-slate-300 rounded-md text-[10px] whitespace-nowrap">
                                                        {industry}
                                                    </span>
                                                ))}
                                                {company.industries.length > 3 && (
                                                    <span className="text-[10px] text-slate-500 self-center">+{company.industries.length - 3}</span>
                                                )}
                                            </div>

                                            <div className="flex items-center justify-between border-t border-slate-800/50 pt-4">
                                                <div className="flex items-center gap-4 text-slate-400 text-xs font-medium">
                                                    <div className="flex items-center gap-1.5">
                                                        <MapPin size={14} className="text-blue-500/60" />
                                                        {company.location}
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Users size={14} className="text-blue-500/60" />
                                                        {company.size}
                                                    </div>
                                                </div>
                                                <Link
                                                    to={`/seeker/company/${company._id}`}
                                                    className="p-2 bg-blue-600/10 hover:bg-blue-600 text-blue-400 hover:text-white rounded-lg transition-all"
                                                >
                                                    <ChevronRight size={18} />
                                                </Link>
                                            </div>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                        ) : (
                            <div className="py-20 text-center bg-slate-900/20 rounded-3xl border border-dashed border-slate-800">
                                <Building2 size={64} className="mx-auto text-slate-700 mb-6" />
                                <h3 className="text-2xl font-bold text-white mb-2">No companies found</h3>
                                <p className="text-slate-400">Try adjusting your filters or search terms.</p>
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
