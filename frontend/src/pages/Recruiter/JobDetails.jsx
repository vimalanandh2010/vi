import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Briefcase,
    MapPin,
    DollarSign,
    ExternalLink,
    Loader2,
    ArrowLeft,
    Sparkles,
    CheckCircle,
    Clock,
    User
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import RecruiterLayout from '../../components/RecruiterLayout';
import { motion, AnimatePresence } from 'framer-motion';
import LocationMap from '../../components/Maps/LocationMap';

const JobDetails = () => {
    const { jobId } = useParams();
    const [job, setJob] = useState(null);
    const [recommendations, setRecommendations] = useState([]);
    const [loading, setLoading] = useState(true);
    const [recoLoading, setRecoLoading] = useState(true);

    useEffect(() => {
        fetchJobDetails();
        fetchRecommendations();
    }, [jobId]);

    const fetchJobDetails = async () => {
        try {
            const res = await axiosClient.get(`jobs/${jobId}`);
            setJob(res);
        } catch (err) {
            console.error('Failed to fetch job:', err);
        } finally {
            setLoading(false);
        }
    };

    const fetchRecommendations = async () => {
        try {
            setRecoLoading(true);
            const res = await axiosClient.get(`jobs/${jobId}/recommendations`);
            setRecommendations(res);
        } catch (err) {
            console.error('Failed to fetch recommendations:', err);
        } finally {
            setRecoLoading(false);
        }
    };

    if (loading) {
        return (
            <RecruiterLayout>
                <div className="flex flex-col items-center justify-center h-[80vh] bg-white">
                    <Loader2 className="animate-spin text-black mb-4" size={48} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Intelligence...</p>
                </div>
            </RecruiterLayout>
        );
    }

    if (!job) {
        return (
            <RecruiterLayout>
                <div className="flex flex-col items-center justify-center h-[80vh] bg-white text-slate-400">
                    <Briefcase size={48} className="mb-4 opacity-20" />
                    <p className="font-bold">Job details not found.</p>
                </div>
            </RecruiterLayout>
        );
    }

    return (
        <RecruiterLayout>
            <main className="p-8 md:p-12 lg:p-16 max-w-7xl mx-auto bg-white min-h-full">
                {/* Compact Breadcrumb Header */}
                <div className="mb-12">
                    <Link
                        to="/recruiter/jobs"
                        className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 hover:text-black transition-all group"
                    >
                        <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" />
                        Return to Workspace
                    </Link>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    {/* Main Content Area */}
                    <div className="lg:col-span-2 space-y-16">
                        {/* Job Overview Section */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                        >
                            <div className="flex items-start justify-between gap-6 mb-8">
                                <div>
                                    <div className="flex items-center gap-3 mb-4">
                                        <h1 className="text-5xl font-black text-black tracking-tighter leading-tight">{job.title}</h1>
                                    </div>
                                    <div className="flex flex-wrap gap-6 text-slate-400">
                                        <div className="flex items-center gap-2 font-bold text-sm uppercase tracking-wider">
                                            <MapPin size={18} className="text-blue-500" />
                                            {job.location}
                                        </div>
                                        <div className="flex items-center gap-2 font-bold text-sm uppercase tracking-wider">
                                            <Briefcase size={18} className="text-purple-500" />
                                            {job.type}
                                        </div>
                                        <div className="flex items-center gap-2 font-bold text-sm uppercase tracking-wider">
                                            <DollarSign size={18} className="text-emerald-500" />
                                            {job.salary || 'Competitive'}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="prose prose-slate max-w-none">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6 pb-2 border-b border-slate-50">Professional Mandate</h3>
                                <p className="text-slate-600 text-lg leading-relaxed whitespace-pre-line font-medium">
                                    {job.description}
                                </p>
                            </div>
                        </motion.section>

                        {/* Location Map Section */}
                        <motion.section
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.2 }}
                            className="space-y-6"
                        >
                            <div className="flex items-center gap-3">
                                <div className="p-3 bg-blue-50 rounded-2xl">
                                    <MapPin className="text-blue-600" size={20} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-black">Job Location</h3>
                                    <p className="text-slate-400 text-sm font-bold">{job.location}</p>
                                </div>
                            </div>
                            <LocationMap 
                                location={job.location} 
                                height="400px"
                                zoom={12}
                                className="shadow-lg"
                            />
                        </motion.section>

                        {/* AI Recommended Candidates Section */}
                        <section className="space-y-10">
                            <div className="flex items-center justify-between border-b border-slate-100 pb-8">
                                <h2 className="text-2xl font-black text-black flex items-center gap-4">
                                    <div className="p-3 bg-yellow-400 rounded-2xl">
                                        <Sparkles className="text-white fill-white" size={24} />
                                    </div>
                                    AI Talent Intelligence
                                </h2>
                                <span className="px-5 py-2 bg-slate-50 border border-slate-100 text-black rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-sm">
                                    {recommendations.length} TOP MATCHES
                                </span>
                            </div>

                            {recoLoading ? (
                                <div className="flex flex-col items-center justify-center py-20 bg-slate-50/50 rounded-[3rem] border border-slate-50 border-dashed">
                                    <Loader2 className="animate-spin text-black mb-6" size={40} />
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Analyzing matching candidates...</p>
                                </div>
                            ) : recommendations.length === 0 ? (
                                <div className="bg-slate-50/50 border border-slate-100 border-dashed rounded-[3.5rem] p-24 text-center">
                                    <User size={48} className="text-slate-200 mx-auto mb-6" />
                                    <p className="text-slate-400 font-bold text-lg">No automated matches generated yet.</p>
                                    <p className="text-slate-300 text-sm mt-1">Check back once more candidates have uploaded their profiles.</p>
                                </div>
                            ) : (
                                <div className="grid gap-8">
                                    <AnimatePresence>
                                        {recommendations.map((cand, idx) => (
                                            <motion.div
                                                key={cand.candidateId}
                                                initial={{ opacity: 0, scale: 0.95 }}
                                                animate={{ opacity: 1, scale: 1 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="bg-white border border-slate-100 hover:border-black/5 rounded-[2.5rem] p-10 transition-all group hover:shadow-2xl hover:shadow-black/5"
                                            >
                                                <div className="flex flex-col md:flex-row justify-between gap-8">
                                                    <div className="flex gap-8">
                                                        <div className="w-20 h-20 bg-slate-50 border border-slate-100 rounded-3xl flex items-center justify-center text-3xl font-black text-black group-hover:bg-black group-hover:text-white transition-all shadow-sm">
                                                            {cand.name[0]}
                                                        </div>
                                                        <div>
                                                            <div className="flex items-center gap-3 mb-2">
                                                                <h3 className="text-2xl font-black text-black">{cand.name}</h3>
                                                                {cand.matchScore > 90 && (
                                                                    <CheckCircle size={18} className="text-blue-500 fill-blue-500/10" title="High Match Confidence" />
                                                                )}
                                                            </div>
                                                            <div className="flex items-center gap-4 text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">
                                                                <span className="flex items-center gap-2"><MapPin size={14} className="text-slate-300" /> {cand.location || 'Distributed'}</span>
                                                                <span className="flex items-center gap-2"><Briefcase size={14} className="text-slate-300" /> {cand.experienceLevel}</span>
                                                            </div>
                                                            <div className="flex flex-wrap gap-2">
                                                                {cand.matchedSkills.slice(0, 4).map(skill => (
                                                                    <span key={skill} className="px-3 py-1 bg-slate-50 text-slate-500 rounded-lg text-[10px] font-black uppercase tracking-widest group-hover:bg-white transition-colors border border-slate-100">
                                                                        {skill}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-6 border-t md:border-t-0 md:border-l border-slate-50 pt-6 md:pt-0 md:pl-8">
                                                        <div className="text-right">
                                                            <div className="text-5xl font-black text-black tracking-tighter group-hover:text-blue-600 transition-colors">{cand.matchScore}%</div>
                                                            <div className="text-[9px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Intelligence Match</div>
                                                        </div>
                                                        <button
                                                            onClick={() => navigate(`/recruiter/candidates/${cand.candidateId}`)}
                                                            className="flex items-center gap-3 px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-blue-600/10 group-hover:scale-105 active:scale-95"
                                                        >
                                                            Profile
                                                            <ExternalLink size={14} strokeWidth={3} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </section>
                    </div>

                    {/* Meta Sidebar */}
                    <aside className="space-y-8">
                        <div className="bg-slate-50/50 border border-slate-100 rounded-[3rem] p-10 sticky top-32 shadow-sm">
                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-10 pb-4 border-b border-slate-100">Decision Parameters</h3>

                            <div className="space-y-10">
                                <div className="group">
                                    <div className="flex items-center gap-2 mb-3 text-slate-400 group-hover:text-black transition-colors">
                                        <Activity size={14} />
                                        <div className="text-[10px] font-black uppercase tracking-widest">Public Status</div>
                                    </div>
                                    <span className="inline-block px-5 py-2 bg-green-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-green-500/20">
                                        {job.status}
                                    </span>
                                </div>

                                <div className="group">
                                    <div className="flex items-center gap-2 mb-5 text-slate-400 group-hover:text-black transition-colors">
                                        <CheckCircle size={14} />
                                        <div className="text-[10px] font-black uppercase tracking-widest">Target Expertise</div>
                                    </div>
                                    <div className="flex flex-wrap gap-2.5">
                                        {((job.requiredSkills?.length ? job.requiredSkills : null) || (job.skills?.length ? job.skills : null) || (job.tags?.length ? job.tags : null))?.map(skill => (
                                            <span key={skill} className="px-4 py-2 bg-white text-black border border-slate-100 rounded-xl text-[11px] font-bold shadow-sm hover:shadow-md transition-shadow cursor-default">
                                                {skill}
                                            </span>
                                        )) || <span className="text-slate-300 text-xs italic font-medium px-4">No skill metadata detected</span>}
                                    </div>
                                </div>

                                <div className="pt-10 border-t border-slate-100">
                                    <div className="flex items-center gap-2 text-slate-400 mb-6">
                                        <Clock size={14} />
                                        <div className="text-[10px] font-black uppercase tracking-widest">Lifecycle</div>
                                    </div>
                                    <div className="space-y-3">
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-400 font-bold uppercase tracking-tight">Posted</span>
                                            <span className="text-black font-black uppercase">{new Date(job.createdAt).toLocaleDateString()}</span>
                                        </div>
                                        <div className="flex items-center justify-between text-xs">
                                            <span className="text-slate-400 font-bold uppercase tracking-tight">Internal ID</span>
                                            <span className="text-black font-mono text-[9px] bg-white px-2 py-0.5 rounded border border-slate-100">{job._id.slice(-8).toUpperCase()}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mt-12 pt-8">
                                <Link
                                    to={`/recruiter/job-analytics/${job._id}`}
                                    className="flex items-center justify-center gap-3 w-full py-5 border-2 border-blue-600 hover:bg-blue-600 hover:text-white text-blue-600 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all group"
                                >
                                    Analytical Data
                                    <Sparkles size={14} className="group-hover:animate-pulse" />
                                </Link>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </RecruiterLayout>
    );
};

export default JobDetails;
