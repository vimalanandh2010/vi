import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
    Briefcase,
    MapPin,
    DollarSign,
    ExternalLink,
    Loader2,
    ArrowLeft,
    Sparkles
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import Navbar from '../../components/Navbar';
import { motion, AnimatePresence } from 'framer-motion';

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
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Loader2 className="animate-spin text-blue-500" size={48} />
            </div>
        );
    }

    if (!job) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">
                Job not found.
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-950 text-slate-200">
            <Navbar />
            <div className="max-w-7xl mx-auto px-6 py-12">
                <Link to="/recruiter/jobs" className="flex items-center gap-2 text-slate-400 hover:text-white mb-8 transition-colors">
                    <ArrowLeft size={20} />
                    Back to Jobs
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* Job Info Section */}
                    <div className="lg:col-span-2 space-y-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="bg-slate-900 border border-slate-800 rounded-3xl p-8"
                        >
                            <h1 className="text-4xl font-bold text-white mb-4">{job.title}</h1>
                            <div className="flex flex-wrap gap-4 text-slate-400 mb-6">
                                <div className="flex items-center gap-2"><MapPin size={18} /> {job.location}</div>
                                <div className="flex items-center gap-2"><Briefcase size={18} /> {job.type}</div>
                                <div className="flex items-center gap-2"><DollarSign size={18} /> {job.salary || 'Competitive'}</div>
                            </div>
                            <div className="prose prose-invert max-w-none">
                                <h3 className="text-xl font-bold text-white mb-2">Description</h3>
                                <p className="text-slate-400 whitespace-pre-line">{job.description}</p>
                            </div>
                        </motion.div>

                        {/* Recommended Candidates Section */}
                        <div className="space-y-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-2xl font-bold text-white flex items-center gap-3">
                                    <Sparkles className="text-yellow-400" />
                                    AI Recommended Candidates
                                </h2>
                                <span className="px-4 py-1.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 rounded-full text-sm font-bold">
                                    {recommendations.length} Matches Found
                                </span>
                            </div>

                            {recoLoading ? (
                                <div className="flex flex-col items-center justify-center py-12">
                                    <Loader2 className="animate-spin text-blue-500 mb-4" size={32} />
                                    <p className="text-slate-400">Analyzing candidates with AI...</p>
                                </div>
                            ) : recommendations.length === 0 ? (
                                <div className="bg-slate-900 border border-slate-800 rounded-3xl p-12 text-center text-slate-500">
                                    No recommendations found for this job yet.
                                </div>
                            ) : (
                                <div className="grid gap-6">
                                    <AnimatePresence>
                                        {recommendations.map((cand, idx) => (
                                            <motion.div
                                                key={cand.candidateId}
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: idx * 0.1 }}
                                                className="bg-slate-950 border border-slate-800 hover:border-blue-500/30 rounded-2xl p-6 transition-all group"
                                            >
                                                <div className="flex flex-col md:flex-row justify-between gap-6">
                                                    <div className="flex gap-4">
                                                        <div className="w-16 h-16 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-blue-600/20 transition-all">
                                                            {cand.name[0]}
                                                        </div>
                                                        <div>
                                                            <h3 className="text-xl font-bold text-white mb-1">{cand.name}</h3>
                                                            <div className="flex items-center gap-3 text-sm text-slate-500 mb-3">
                                                                <span className="flex items-center gap-1"><MapPin size={14} /> {cand.location || 'Remote'}</span>
                                                                <span className="flex items-center gap-1"><Briefcase size={14} /> {cand.experienceLevel}</span>
                                                            </div>
                                                            <div className="flex flex-wrap gap-2">
                                                                {cand.matchedSkills.slice(0, 5).map(skill => (
                                                                    <span key={skill} className="px-2 py-0.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded text-[10px] font-bold uppercase tracking-wider">
                                                                        {skill}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    </div>

                                                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-4">
                                                        <div className="text-right">
                                                            <div className="text-3xl font-black text-blue-400">{cand.matchScore}%</div>
                                                            <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Match Score</div>
                                                        </div>
                                                        <button className="flex items-center gap-2 px-6 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-900/40">
                                                            View Profile
                                                            <ExternalLink size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </motion.div>
                                        ))}
                                    </AnimatePresence>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar Stats */}
                    <div className="space-y-6">
                        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6">
                            <h3 className="text-lg font-bold text-white mb-6">Job Overview</h3>
                            <div className="space-y-4">
                                <div>
                                    <div className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Status</div>
                                    <span className="px-3 py-1 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full text-xs font-bold uppercase">
                                        {job.status}
                                    </span>
                                </div>
                                <div>
                                    <div className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-1">Required Skills</div>
                                    <div className="flex flex-wrap gap-2">
                                        {((job.requiredSkills?.length ? job.requiredSkills : null) || (job.skills?.length ? job.skills : null) || (job.tags?.length ? job.tags : null))?.map(skill => (
                                            <span key={skill} className="px-2 py-1 bg-slate-800 text-slate-400 rounded-lg text-xs">
                                                {skill}
                                            </span>
                                        )) || <span className="text-slate-600 text-xs">No specific skills listed</span>}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default JobDetails;
