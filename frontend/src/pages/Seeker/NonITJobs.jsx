import React, { useState, useEffect } from 'react'
import { Search, MapPin, Briefcase, Filter, ArrowRight, Loader2, Bookmark, CheckCircle2 } from 'lucide-react'
import Navbar from '../../components/Navbar'
import { motion, AnimatePresence } from 'framer-motion'
import axiosClient from '../../api/axiosClient'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { MessageSquare, X } from 'lucide-react'
import VerificationBadge from '../../components/Common/VerificationBadge'

const NonITJobs = () => {
    // 1. Initialize all state as arrays
    const [jobs, setJobs] = useState([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [searchTerm, setSearchTerm] = useState('')
    const [applying, setApplying] = useState(null)
    const [appliedIds, setAppliedIds] = useState([])
    const [savedIds, setSavedIds] = useState([])
    const [selectedJob, setSelectedJob] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const navigate = useNavigate()

    useEffect(() => {
        const loadAllData = async () => {
            setLoading(true)
            setError(null)
            try {
                // Wrap in Promise.all to load everything efficiently
                await Promise.allSettled([
                    fetchJobs(),
                    fetchUserApplications(),
                    fetchSavedIds()
                ])
            } catch (err) {
                console.error("Critical data load failure:", err)
            } finally {
                setLoading(false)
            }
        }
        loadAllData()
    }, [])

    const fetchJobs = async () => {
        try {
            const res = await axiosClient.get('jobs?category=Non-IT');
            const jobsData = res.jobs || (Array.isArray(res) ? res : []);
            setJobs(jobsData)
        } catch (err) {
            console.error('Error fetching Non-IT jobs:', err)
            setJobs([]) // Guard: ensure it stays an array
        }
    }

    const fetchSavedIds = async () => {
        const token = localStorage.getItem('seekerToken')
        if (!token) return
        try {
            const res = await axiosClient.get('/auth/me')
            const savedData = res.savedJobs || res.user?.savedJobs || [];
            setSavedIds(Array.isArray(savedData) ? savedData : [])
        } catch (err) {
            console.error('Error fetching saved IDs:', err)
            setSavedIds([]) // Guard: ensure it stays an array
        }
    }

    const fetchUserApplications = async () => {
        const token = localStorage.getItem('seekerToken')
        if (!token) return
        try {
            const res = await axiosClient.get('/jobs/applied')
            const appData = res.applications || (Array.isArray(res) ? res : []);
            const extractedIds = appData
                .map(app => app?.job?._id || app?.job)
                .filter(Boolean);
            setAppliedIds(extractedIds)
        } catch (err) {
            console.error('Error fetching applications:', err)
            setAppliedIds([]) // Guard: ensure it stays an array
        }
    }

    const handleApply = async (jobId) => {
        if (!jobId) return
        const token = localStorage.getItem('seekerToken')
        if (!token) {
            toast.error('Please login to apply')
            return
        }

        setApplying(jobId)
        try {
            await axiosClient.post(`/jobs/apply/${jobId}`)
            toast.success('Applied successfully!')
            setAppliedIds(prev => Array.isArray(prev) ? [...new Set([...prev, jobId])] : [jobId])
        } catch (err) {
            console.error('Apply failure:', err)
            toast.error(err.response?.data?.message || 'Application failed')
        } finally {
            setApplying(null)
        }
    }

    const handleSave = async (jobId) => {
        if (!jobId) return
        const token = localStorage.getItem('seekerToken')
        if (!token) {
            toast.error('Please login to save jobs')
            return
        }

        // Defensive check before includes
        const safeSavedIds = Array.isArray(savedIds) ? savedIds : [];
        const isCurrentlySaved = safeSavedIds.includes(jobId)

        // Optimistic UI updates
        setSavedIds(prev => {
            const current = Array.isArray(prev) ? prev : [];
            return isCurrentlySaved
                ? current.filter(id => id !== jobId)
                : [...new Set([...current, jobId])]
        })

        try {
            const res = await axiosClient.post(`/jobs/save/${jobId}`)
            toast.info(res.message || 'Updated bookmark')
        } catch (err) {
            console.error('Save failure:', err)
            // Roll back state on failure
            setSavedIds(prev => {
                const current = Array.isArray(prev) ? prev : [];
                return isCurrentlySaved
                    ? [...new Set([...current, jobId])]
                    : current.filter(id => id !== jobId)
            })
            toast.error('Failed to update saved list')
        }
    }

    const handleMessage = async (recruiterId) => {
        const token = localStorage.getItem('seekerToken');
        if (!token) {
            toast.error('Please login to message recruiters');
            return;
        }

        try {
            const res = await axiosClient.post('chat/conversations/start', { targetUserId: recruiterId });
            navigate('/seeker/chat', { state: { activeChatId: res.conversation?._id } });
        } catch (err) {
            console.error('Error starting chat:', err);
            toast.error('Failed to start conversation');
        }
    };

    const handleCardClick = (job) => {
        setSelectedJob(job);
        setIsModalOpen(true);
    };

    // Defensive Filtering: Ensure 'jobs' is an array before .filter
    const filteredJobs = (Array.isArray(jobs) ? jobs : []).filter(job => {
        if (!job) return false;
        const search = (searchTerm || '').toLowerCase();
        const title = (job?.title || '').toLowerCase();
        const companyName = (job?.company?.name || job?.company || '').toLowerCase();
        const tags = Array.isArray(job?.tags) ? job.tags.map(t => (t || '').toLowerCase()) : [];

        return title.includes(search) ||
            companyName.includes(search) ||
            tags.some(tag => tag.includes(search));
    });

    if (error && !loading && jobs.length === 0) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center p-6">
                <div className="text-center bg-slate-800/80 p-10 rounded-[2rem] border border-red-500/30 max-w-sm backdrop-blur-xl">
                    <p className="text-red-400 mb-8 font-bold text-lg">{error}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full bg-gradient-to-r from-orange-600 to-red-600 text-white px-8 py-4 rounded-2xl font-black shadow-2xl shadow-orange-600/20 active:scale-95 transition-all"
                    >
                        Retry Connection
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-900 pb-20 overflow-x-hidden">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
                <div className="mb-12">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-block px-4 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-[10px] font-black tracking-[0.2em] uppercase mb-6"
                    >
                        Enterprise Roles
                    </motion.div>
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-4xl md:text-6xl font-black text-white mb-4 tracking-tighter"
                    >
                        Business & Beyond 💼
                    </motion.h1>
                    <p className="text-slate-400 text-lg mb-8 max-w-2xl leading-relaxed font-medium">Find elite non-technical positions in management, marketing, and operations.</p>

                    <div className="flex flex-col md:flex-row gap-4 items-stretch">
                        <div className="flex-1 relative group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-orange-500 transition-colors" size={20} />
                            <input
                                type="text"
                                placeholder="Search roles, brands, or departments..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-800/60 border border-slate-700/50 text-white rounded-2xl py-5 pl-14 pr-6 focus:ring-4 focus:ring-orange-500/20 focus:border-orange-500/50 focus:outline-none transition-all placeholder:text-slate-600 font-medium"
                            />
                        </div>
                        <button className="flex items-center justify-center gap-3 bg-slate-800/80 backdrop-blur-md hover:bg-slate-700 text-white px-8 py-5 rounded-2xl border border-slate-700 transition-all active:scale-95 shadow-xl shadow-black/20">
                            <Filter size={20} />
                            <span className="font-black uppercase tracking-widest text-[11px]">Refine</span>
                        </button>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-40 gap-8">
                        <div className="relative">
                            <Loader2 className="animate-spin text-orange-500" size={56} strokeWidth={3} />
                            <div className="absolute inset-0 blur-3xl bg-orange-500/30 rounded-full animate-pulse" />
                        </div>
                        <p className="text-slate-500 font-black tracking-[0.3em] uppercase text-[9px]">Fetching Opportunities</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        <AnimatePresence mode="popLayout">
                            {filteredJobs.length > 0 ? filteredJobs.map((job, idx) => (
                                <motion.div
                                    key={job?._id || idx}
                                    layout
                                    initial={{ opacity: 0, y: 40 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.5, delay: idx * 0.05 }}
                                    onClick={() => handleCardClick(job)}
                                    className="bg-slate-800/30 backdrop-blur-2xl border border-slate-700/30 rounded-[2.5rem] p-8 hover:border-orange-500/40 transition-all group flex flex-col h-full shadow-2xl shadow-black/20 cursor-pointer"
                                >
                                    <div className="flex justify-between items-start mb-8">
                                        <div className="w-14 h-14 rounded-2xl bg-white/5 flex items-center justify-center text-3xl border border-white/10 shadow-inner">
                                            {job?.icon || '🏢'}
                                        </div>
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleSave(job?._id);
                                            }}
                                            className={`p-3 rounded-2xl transition-all ${savedIds?.includes(job?._id)
                                                ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/30'
                                                : 'bg-slate-700/30 text-slate-500 hover:text-white'}`}
                                        >
                                            <Bookmark size={20} fill={savedIds?.includes(job?._id) ? "currentColor" : "none"} />
                                        </button>
                                    </div>

                                    <div className="flex-1">
                                        <h3 className="text-2xl font-black text-white mb-2 leading-tight group-hover:text-orange-400 transition-colors uppercase tracking-tight">
                                            {job?.title || 'Professional Role'}
                                        </h3>
                                        <p className="text-orange-500 font-black text-sm mb-8 tracking-widest uppercase">
                                            {job?.company?.name || job?.company || 'Opportunity'}
                                        </p>

                                        <div className="grid grid-cols-1 gap-4 mb-8">
                                            <div className="flex items-center gap-4 text-slate-400 font-bold text-xs uppercase tracking-widest bg-slate-900/40 p-3 rounded-xl border border-white/5">
                                                <MapPin size={16} className="text-slate-600" />
                                                {job?.location || 'On-site'}
                                            </div>
                                            <div className="flex items-center gap-4 text-slate-400 font-bold text-xs uppercase tracking-widest bg-slate-900/40 p-3 rounded-xl border border-white/5">
                                                <Briefcase size={16} className="text-slate-600" />
                                                {job?.type || 'Full-time'}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mb-10">
                                            {Array.isArray(job?.tags) && job.tags.map(tag => (
                                                <span key={tag} className="px-4 py-2 bg-white/5 text-slate-400 rounded-xl text-[10px] font-black uppercase tracking-widest border border-white/5 group-hover:border-orange-500/20 transition-colors">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-8 border-t border-white/5 mt-auto">
                                        <div>
                                            <span className="text-[9px] text-slate-600 font-black uppercase tracking-[0.2em] block mb-1">Expectation</span>
                                            <p className="text-white font-black text-xl tracking-tighter">{job?.salary || 'NDA'}</p>
                                        </div>
                                        {appliedIds?.includes(job?._id) ? (
                                            <div className="flex items-center gap-2 text-emerald-500 font-black px-6 py-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-[10px] uppercase tracking-[0.2em] shadow-lg shadow-emerald-500/10">
                                                <CheckCircle2 size={16} />
                                                Applied
                                            </div>
                                        ) : (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleApply(job?._id);
                                                }}
                                                disabled={applying === job?._id}
                                                className="flex items-center gap-3 bg-gradient-to-br from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-8 py-4 rounded-2xl font-black text-[11px] uppercase tracking-widest transition-all active:scale-95 disabled:opacity-50 shadow-2xl shadow-orange-600/30 group/btn"
                                            >
                                                {applying === job?._id ? (
                                                    <Loader2 className="animate-spin" size={18} strokeWidth={3} />
                                                ) : (
                                                    <>Join Now <ArrowRight size={18} className="group-hover/btn:translate-x-1 transition-transform" /></>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            )) : (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="col-span-full py-40 text-center"
                                >
                                    <div className="bg-slate-800/20 p-16 rounded-[3rem] border-4 border-dashed border-slate-800 max-w-2xl mx-auto shadow-2xl shadow-black/40">
                                        <Briefcase className="mx-auto text-slate-800 mb-8" size={80} strokeWidth={1.5} />
                                        <h2 className="text-3xl font-black text-white mb-4 uppercase tracking-tighter">No Roles Available</h2>
                                        <p className="text-slate-500 text-lg font-medium leading-relaxed">
                                            Our filters couldn't find matches for "{searchTerm}". <br className="hidden md:block" />
                                            Try broader keywords or browse all categories.
                                        </p>
                                    </div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Job Details Modal */}
            <AnimatePresence>
                {isModalOpen && selectedJob && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsModalOpen(false)}
                            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 20 }}
                            className="relative w-full max-w-4xl max-h-[90vh] bg-slate-900 border border-slate-700/50 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                        >
                            {/* Modal Header */}
                            <div className="p-8 border-b border-slate-700/50 bg-slate-800/20">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-6">
                                        <div className="w-20 h-20 rounded-2xl bg-slate-700/50 flex items-center justify-center text-4xl shadow-lg border border-slate-600/30">
                                            {selectedJob.icon || '🏢'}
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-black text-white mb-2 tracking-tighter">{selectedJob.title}</h2>
                                            <div className="flex items-center gap-3 mb-4">
                                                <p className="text-orange-400 text-xl font-black uppercase tracking-widest">{selectedJob.companyName || selectedJob.company?.name || selectedJob.company}</p>
                                                {selectedJob.company?.verificationLevel !== undefined && (
                                                    <VerificationBadge
                                                        level={selectedJob.company?.verificationLevel || 0}
                                                        status={selectedJob.company?.verificationStatus || 'unverified'}
                                                    />
                                                )}
                                            </div>
                                            <div className="flex flex-wrap gap-4 text-xs font-bold uppercase tracking-widest">
                                                <div className="flex items-center gap-2 text-slate-400 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700/50">
                                                    <MapPin size={16} />
                                                    {selectedJob.location}
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-400 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700/50">
                                                    <Briefcase size={16} />
                                                    {selectedJob.type}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition-all"
                                    >
                                        <X size={24} />
                                    </button>
                                </div>
                            </div>

                            {/* Modal Content */}
                            <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                                    <div className="lg:col-span-2 space-y-8">
                                        {/* Description */}
                                        <section>
                                            <h4 className="text-xl font-black text-white mb-4 flex items-center gap-2 tracking-tight">
                                                <div className="w-1.5 h-6 bg-orange-500 rounded-full" />
                                                Job Description
                                            </h4>
                                            <p className="text-slate-300 leading-relaxed whitespace-pre-line text-lg font-medium">
                                                {selectedJob.description || 'No description provided.'}
                                            </p>
                                        </section>

                                        {/* Requirements */}
                                        {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                                            <section>
                                                <h4 className="text-xl font-black text-white mb-4 flex items-center gap-2 tracking-tight">
                                                    <div className="w-1.5 h-6 bg-rose-500 rounded-full" />
                                                    Requirements
                                                </h4>
                                                <ul className="space-y-3 font-medium">
                                                    {selectedJob.requirements.map((req, i) => (
                                                        <li key={i} className="flex gap-3 text-slate-300 bg-slate-800/30 p-4 rounded-xl border border-slate-700/30">
                                                            <div className="w-2 h-2 mt-2 rounded-full bg-slate-600 flex-shrink-0" />
                                                            {req}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </section>
                                        )}
                                    </div>

                                    {/* Sidebar Info */}
                                    <div className="space-y-6">
                                        <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
                                            <h5 className="text-slate-500 font-black mb-4 uppercase text-[10px] tracking-[0.2em]">Overview</h5>
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Salary</p>
                                                    <p className="text-white font-black text-lg">{selectedJob.salary || 'Competitive'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Posted On</p>
                                                    <p className="text-white font-black text-sm">{new Date(selectedJob.createdAt || Date.now()).toLocaleDateString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-500 text-[10px] uppercase font-bold tracking-widest mb-1">Category</p>
                                                    <p className="text-white font-black text-sm">{selectedJob.category || 'Non-IT'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tags */}
                                        <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
                                            <h5 className="text-slate-500 font-black mb-4 uppercase text-[10px] tracking-[0.2em]">Skills & Tags</h5>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedJob.tags?.map(tag => (
                                                    <span key={tag} className="px-3 py-1 bg-slate-700/50 text-slate-400 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-600/30">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-8 border-t border-slate-700/50 bg-slate-800/20 flex flex-wrap gap-4 items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => handleSave(selectedJob._id)}
                                        className={`flex items-center gap-2 px-6 py-3 rounded-xl border transition-all text-xs font-black uppercase tracking-widest ${savedIds.includes(selectedJob._id)
                                            ? 'bg-rose-500/10 border-rose-500 text-rose-400'
                                            : 'border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800'
                                            }`}
                                    >
                                        <Bookmark size={18} fill={savedIds.includes(selectedJob._id) ? "currentColor" : "none"} />
                                        {savedIds.includes(selectedJob._id) ? 'Saved' : 'Save'}
                                    </button>
                                    {selectedJob.postedBy && (
                                        <button
                                            onClick={() => {
                                                setIsModalOpen(false);
                                                handleMessage(selectedJob.postedBy._id || selectedJob.postedBy);
                                            }}
                                            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-slate-700 text-slate-400 hover:text-white hover:bg-slate-800 transition-all text-xs font-black uppercase tracking-widest"
                                        >
                                            <MessageSquare size={18} />
                                            Message
                                        </button>
                                    )}
                                </div>

                                {appliedIds.includes(selectedJob._id) ? (
                                    <div className="flex items-center gap-2 text-emerald-500 font-black px-10 py-3 bg-emerald-500/10 rounded-2xl border border-emerald-500/20 text-xs uppercase tracking-widest">
                                        <CheckCircle2 size={24} />
                                        Applied
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleApply(selectedJob._id)}
                                        disabled={applying === selectedJob._id}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-gradient-to-r from-orange-600 to-red-600 hover:from-orange-500 hover:to-red-500 text-white px-10 py-3 rounded-2xl font-black shadow-lg shadow-orange-600/30 transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 text-sm uppercase tracking-widest"
                                    >
                                        {applying === selectedJob._id ? (
                                            <Loader2 className="animate-spin" size={24} />
                                        ) : (
                                            <>Apply Now <ArrowRight size={24} /></>
                                        )}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default NonITJobs;
