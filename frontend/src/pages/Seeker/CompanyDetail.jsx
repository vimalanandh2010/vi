import React, { useState, useEffect } from 'react';
import Navbar from '../../components/Navbar';
import { useParams, Link } from 'react-router-dom';
import axiosClient from '../../api/axiosClient';
import { Building2, MapPin, Globe, Users, Briefcase, ChevronLeft, ExternalLink, Calendar, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

const CompanyDetail = () => {
    const { id } = useParams();
    const [company, setCompany] = useState(null);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [companyRes, jobsRes] = await Promise.all([
                    axiosClient.get(`companies/${id}`),
                    axiosClient.get(`jobs/company/${id}`)
                ]);
                setCompany(companyRes);
                setJobs(jobsRes);
            } catch (err) {
                console.error('Error fetching company details:', err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    if (loading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>;
    if (!company) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white text-2xl font-bold">Company not found</div>;

    return (
        <div className="min-h-screen bg-slate-950 text-white pb-20">
            <Navbar />
            {/* Header / Cover */}
            <div className="relative h-64 sm:h-80 bg-gradient-to-br from-blue-900 via-slate-900 to-slate-950 border-b border-slate-800">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,#1e3a8a,transparent)] opacity-40" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative h-full flex flex-col justify-between py-8">
                    <Link to="/seeker/companies" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors text-sm font-medium">
                        <ChevronLeft size={20} /> Back to Companies
                    </Link>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 sm:-mt-32 relative z-10">
                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Left Column: Profile Card */}
                    <div className="w-full lg:w-1/3 xl:w-1/4">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-slate-900/80 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-8 shadow-2xl"
                        >
                            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-slate-800 border-2 border-slate-700/50 shadow-inner flex items-center justify-center text-4xl font-bold mb-6 overflow-hidden">
                                {company.logo ? (
                                    <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
                                ) : (
                                    company.name.charAt(0)
                                )}
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2 uppercase">{company.name}</h1>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-3 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-[10px] font-bold uppercase tracking-wider">
                                            {company.companyType}
                                        </span>
                                        {company.verified && (
                                            <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full text-[10px] font-bold uppercase tracking-wider flex items-center gap-1">
                                                <CheckCircle size={10} /> Verified
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4 pt-4 border-t border-slate-800/50">
                                    <div className="flex items-center gap-3 text-slate-400 text-sm">
                                        <MapPin size={18} className="text-blue-500/60" />
                                        <span>{company.location}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-400 text-sm">
                                        <Users size={18} className="text-blue-500/60" />
                                        <span>{company.size} Employees</span>
                                    </div>
                                    {company.website && (
                                        <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-blue-400 hover:text-blue-300 text-sm transition-colors group">
                                            <Globe size={18} className="group-hover:scale-110 transition-transform" />
                                            <span>Official Website</span>
                                            <ExternalLink size={14} />
                                        </a>
                                    )}
                                </div>

                                <div className="pt-4 border-t border-slate-800/50">
                                    <label className="text-xs font-bold text-slate-500 uppercase tracking-[0.2em] block mb-3">Industries</label>
                                    <div className="flex flex-wrap gap-2">
                                        {company.industries.map(industry => (
                                            <span key={industry} className="px-3 py-1 bg-slate-800/50 text-slate-300 rounded-lg text-xs border border-slate-700/30">
                                                {industry}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </div>

                    {/* Right Column: About & Jobs */}
                    <div className="flex-1 space-y-8">
                        {/* About Section */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-slate-900/40 backdrop-blur-md border border-slate-800/50 rounded-3xl p-8 lg:p-10"
                        >
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-3">
                                <Building2 size={24} className="text-blue-500" />
                                About the Company
                            </h2>
                            <p className="text-slate-300 leading-relaxed text-lg whitespace-pre-line">
                                {company.about}
                            </p>
                        </motion.div>

                        {/* Open Jobs Section */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.1 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center justify-between px-2">
                                <h2 className="text-2xl font-bold flex items-center gap-3">
                                    <Briefcase size={24} className="text-blue-500" />
                                    Open Opportunities
                                    <span className="text-lg text-slate-500 font-medium ml-2">({jobs.length})</span>
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {jobs.length > 0 ? jobs.map((job, idx) => (
                                    <motion.div
                                        key={job._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="group bg-slate-900/30 hover:bg-slate-900/60 border border-slate-800/70 hover:border-blue-500/30 rounded-2xl p-6 transition-all shadow-lg overflow-hidden relative"
                                    >
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{job.title}</h3>
                                                    <span className="px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-[10px] font-bold uppercase tracking-wider">{job.type}</span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400 font-medium">
                                                    <div className="flex items-center gap-1.5 line-clamp-1">
                                                        <MapPin size={14} className="text-blue-500" />
                                                        {job.location}
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar size={14} className="text-blue-500" />
                                                        Posted {new Date(job.createdAt).toLocaleDateString()}
                                                    </div>
                                                    <div className="text-green-400 font-bold">
                                                        {job.salary}
                                                    </div>
                                                </div>
                                            </div>
                                            <Link
                                                to={`/seeker/jobs?id=${job._id}`}
                                                className="px-6 py-3 bg-slate-800 group-hover:bg-blue-600 text-slate-300 group-hover:text-white rounded-xl font-bold text-sm transition-all text-center whitespace-nowrap shadow-xl shadow-black/20"
                                            >
                                                Apply Now
                                            </Link>
                                        </div>

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-2 mt-4">
                                            {job.tags?.slice(0, 3).map(tag => (
                                                <span key={tag} className="px-2 py-0.5 bg-blue-500/5 text-blue-400/70 rounded text-[10px]">#{tag}</span>
                                            ))}
                                        </div>
                                    </motion.div>
                                )) : (
                                    <div className="bg-slate-900/20 border border-dashed border-slate-800 rounded-3xl p-12 text-center">
                                        <Briefcase size={48} className="mx-auto text-slate-800 mb-4" />
                                        <p className="text-slate-500 font-medium">No open jobs at the moment.</p>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CompanyDetail;
