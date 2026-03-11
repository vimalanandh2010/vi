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

    if (loading) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-900 font-bold">Loading...</div>;
    if (!company) return <div className="min-h-screen bg-slate-50 flex items-center justify-center text-slate-900 text-2xl font-black">Company not found</div>;

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 pb-20">
            <Navbar />
            {/* Header / Cover */}
            <div className="relative h-64 sm:h-80 bg-white border-b border-slate-200">
                {/* Grid texture for subtle premium feel */}
                <div className="absolute inset-0 grid-texture opacity-30 pointer-events-none" />
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative h-full flex flex-col justify-between py-8 z-10">
                    <Link to="/seeker/companies" className="inline-flex items-center gap-2 text-slate-500 hover:text-slate-900 transition-colors text-xs font-black uppercase tracking-widest w-fit">
                        <ChevronLeft size={16} /> Back to Companies
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
                            className="bg-white border border-slate-200 rounded-3xl p-8 shadow-xl shadow-slate-200/50 relative overflow-hidden"
                        >
                            <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-3xl bg-white border border-slate-200 shadow-sm flex items-center justify-center text-4xl font-black text-slate-900 mb-6 overflow-hidden shrink-0">
                                {company.logo ? (
                                    <img src={company.logo} alt={company.name} className="w-full h-full object-cover" />
                                ) : (
                                    company.name.charAt(0)
                                )}
                            </div>

                            <div className="space-y-6 relative z-10">
                                <div>
                                    <h1 className="text-2xl sm:text-3xl font-black tracking-tight mb-3 uppercase text-slate-900">{company.name}</h1>
                                    <div className="flex flex-wrap gap-2">
                                        <span className="px-3 py-1 bg-slate-100 border border-slate-200 text-slate-700 rounded-lg text-[9px] font-black uppercase tracking-widest">
                                            {company.companyType}
                                        </span>
                                        {company.verified && (
                                            <span className="px-3 py-1 bg-green-50 border border-green-200 text-green-600 rounded-lg text-[9px] font-black uppercase tracking-widest flex items-center gap-1">
                                                <CheckCircle size={10} /> Verified
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="space-y-4 pt-6 border-t border-slate-100">
                                    <div className="flex items-center gap-3 text-slate-600 text-sm font-bold">
                                        <MapPin size={18} className="text-slate-400" />
                                        <span>{company.location}</span>
                                    </div>
                                    <div className="flex items-center gap-3 text-slate-600 text-sm font-bold">
                                        <Users size={18} className="text-slate-400" />
                                        <span>{company.size} Employees</span>
                                    </div>
                                    {company.website && (
                                        <a href={company.website} target="_blank" rel="noopener noreferrer" className="flex items-center gap-3 text-blue-600 hover:text-blue-700 text-sm transition-colors group font-bold">
                                            <Globe size={18} className="group-hover:scale-110 transition-transform" />
                                            <span>Official Website</span>
                                            <ExternalLink size={14} className="opacity-50" />
                                        </a>
                                    )}
                                </div>

                                <div className="pt-6 border-t border-slate-100">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest block mb-4">Industries</label>
                                    <div className="flex flex-wrap gap-2">
                                        {company.industries.map(industry => (
                                            <span key={industry} className="px-3 py-1.5 bg-slate-50 text-slate-600 rounded-lg text-[10px] font-bold border border-slate-200 uppercase tracking-wider">
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
                            className="bg-white border border-slate-200 rounded-3xl p-8 lg:p-10 shadow-sm"
                        >
                            <h2 className="text-2xl font-black mb-6 flex items-center gap-3 text-slate-900 tracking-tight">
                                <Building2 size={24} className="text-slate-400" />
                                About the Company
                            </h2>
                            <p className="text-slate-600 leading-relaxed text-lg whitespace-pre-line font-medium">
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
                                <h2 className="text-2xl font-black flex items-center gap-3 text-slate-900 tracking-tight">
                                    <Briefcase size={24} className="text-slate-400" />
                                    Open Opportunities
                                    <span className="text-lg text-slate-400 font-bold ml-1">({jobs.length})</span>
                                </h2>
                            </div>

                            <div className="grid grid-cols-1 gap-4">
                                {jobs.length > 0 ? jobs.map((job, idx) => (
                                    <motion.div
                                        key={job._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.1 }}
                                        className="group bg-white border-2 border-blue-200/50 rounded-2xl p-6 transition-all duration-500 shadow-xl hover:shadow-2xl hover:shadow-blue-500/20 hover:-translate-y-1 hover:border-blue-300 overflow-hidden relative"
                                    >
                                        {/* Blue gradient overlay on hover */}
                                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                        <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
                                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 relative z-10">
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <h3 className="text-xl font-black text-slate-900 group-hover:text-blue-900 transition-colors tracking-tight">{job.title}</h3>
                                                    <span className="px-2 py-1 bg-blue-50 text-blue-700 border border-blue-200 group-hover:bg-blue-100 group-hover:border-blue-300 rounded-lg text-[9px] font-black uppercase tracking-widest transition-colors duration-500">{job.type}</span>
                                                </div>
                                                <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 group-hover:text-slate-700 font-bold transition-colors duration-500">
                                                    <div className="flex items-center gap-1.5 line-clamp-1">
                                                        <MapPin size={14} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                                                        {job.location}
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Calendar size={14} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                                                        Posted {new Date(job.createdAt).toLocaleDateString()}
                                                    </div>
                                                    <div className="text-slate-900 group-hover:text-blue-900 font-black transition-colors">
                                                        {job.salary}
                                                    </div>
                                                </div>
                                            </div>
                                            <Link
                                                to={`/seeker/jobs?id=${job._id}`}
                                                className="px-8 py-3 bg-black hover:bg-slate-800 text-white rounded-xl font-black text-xs uppercase tracking-widest shadow-xl shadow-black/20 transition-all text-center whitespace-nowrap hover:scale-105 active:scale-95"
                                            >
                                                Apply Now
                                            </Link>
                                        </div>

                                        {/* Tags */}
                                        <div className="flex flex-wrap gap-2 mt-6 relative z-10">
                                            {job.tags?.slice(0, 3).map(tag => (
                                                <span key={tag} className="px-2.5 py-1 bg-blue-50 text-blue-700 border border-blue-200 group-hover:bg-blue-100 group-hover:border-blue-300 rounded-lg text-[9px] font-black uppercase tracking-wider transition-colors duration-500">#{tag}</span>
                                            ))}
                                        </div>
                                    </motion.div>
                                )) : (
                                    <div className="bg-white border border-dashed border-slate-300 rounded-3xl p-12 text-center shadow-sm">
                                        <Briefcase size={48} className="mx-auto text-slate-300 mb-4" />
                                        <p className="text-slate-500 font-bold">No open jobs at the moment.</p>
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
