import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { Search, MapPin, Building2, Filter, ChevronRight, Briefcase, Globe, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CompanyCard from '../../components/Cards/CompanyCard';

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
                                        className="ml-auto text-xs text-blue-600 hover:text-blue-700 font-medium"
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
                                                        ? 'bg-gradient-to-r from-blue-600 to-blue-700 border-blue-500 text-white shadow-lg shadow-blue-500/30'
                                                        : 'bg-slate-50 border-slate-200 text-slate-500 hover:border-blue-300 hover:text-blue-900'
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
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {[1, 2, 3, 4, 5, 6].map(i => (
                                    <div key={i} className="h-96 bg-slate-100 animate-pulse rounded-2xl border border-slate-200" />
                                ))}
                            </div>
                        ) : companies.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                <AnimatePresence mode="popLayout">
                                    {companies.map((company, idx) => (
                                        <CompanyCard
                                            key={company._id}
                                            company={company}
                                            onClick={() => window.location.href = `/seeker/company/${company._id}`}
                                        />
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

export default Companies;
