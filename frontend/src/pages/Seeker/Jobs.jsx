import React, { useState, useEffect } from 'react'
import { Search, MapPin, Briefcase, Filter, ArrowRight, Loader2, Bookmark, CheckCircle2, X, Clock, Home, GraduationCap, FileText, Zap, Wifi, Building2, Layers, ChevronDown } from 'lucide-react'
import Navbar from '../../components/Navbar'
import { motion, AnimatePresence } from 'framer-motion'
import axiosClient from '../../api/axiosClient'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'
import { MessageSquare } from 'lucide-react'
import VerificationBadge from '../../components/Common/VerificationBadge'

const CATEGORY_OPTIONS = [
    { value: 'All', label: '🔍 All Categories' },
    { value: 'IT', label: '💻 IT / Software' },
    { value: 'Non-IT', label: '🏭 Non-IT' },
    { value: 'Agriculture', label: '🌾 Agriculture' },
    { value: 'Teaching', label: '📚 Teaching / Training' },
    { value: 'Healthcare', label: '🏥 Healthcare' },
    { value: 'Finance', label: '💰 Finance / Banking' },
    { value: 'Marketing', label: '📣 Marketing / Sales' },
    { value: 'Design', label: '🎨 Design / Creative' },
    { value: 'Engineering', label: '⚙️ Engineering' },
    { value: 'Legal', label: '⚖️ Legal / Compliance' },
    { value: 'Logistics', label: '🚚 Logistics / Supply Chain' },
    { value: 'Hospitality', label: '🏨 Hospitality / Travel' },
    { value: 'Other', label: '📋 Other' },
]

const Jobs = () => {
    const [jobs, setJobs] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')
    const [locationSearch, setLocationSearch] = useState('')
    const [selectedJobType, setSelectedJobType] = useState('All')
    const [selectedCategory, setSelectedCategory] = useState('All')
    const [otherCategoryText, setOtherCategoryText] = useState('')
    const [applying, setApplying] = useState(null)
    const [appliedIds, setAppliedIds] = useState([])
    const [savedIds, setSavedIds] = useState([])
    const [selectedJob, setSelectedJob] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const navigate = useNavigate()

    const jobTypes = [
        { name: 'All', icon: Layers, color: 'text-slate-400' },
        { name: 'Full Time', icon: Briefcase, color: 'text-blue-400' },
        { name: 'Part Time', icon: Clock, color: 'text-purple-400' },
        { name: 'Remote', icon: Wifi, color: 'text-green-400' },
        { name: 'Hybrid', icon: Building2, color: 'text-orange-400' },
        { name: 'Contract', icon: FileText, color: 'text-cyan-400' },
        { name: 'Internship', icon: GraduationCap, color: 'text-pink-400' },
        { name: 'Freelance', icon: Zap, color: 'text-yellow-400' },
    ]

    useEffect(() => {
        fetchJobs();
    }, [searchTerm, locationSearch, selectedJobType]);

    useEffect(() => {
        fetchUserApplications();
        fetchSavedIds();
    }, []);

    const fetchJobs = async () => {
        setLoading(true);
        try {
            const res = await axiosClient.get('/jobs', {
                params: {
                    search: searchTerm,
                    location: locationSearch,
                    type: selectedJobType === 'All' ? undefined : selectedJobType
                }
            });
            console.log('📦 Jobs API Response:', res);
            setJobs(Array.isArray(res) ? res : []);
        } catch (err) {
            console.error('Error fetching jobs:', err);
            toast.error('Failed to load jobs');
        } finally {
            setLoading(false);
        }
    };

    const fetchSavedIds = async () => {
        const token = localStorage.getItem('seekerToken');
        if (!token) return;
        try {
            const res = await axiosClient.get('/auth/me');
            setSavedIds(res.savedJobs || []);
        } catch (err) {
            console.error('Error fetching saved IDs:', err);
        }
    };

    const fetchUserApplications = async () => {
        const token = localStorage.getItem('seekerToken');
        if (!token) return;
        try {
            const res = await axiosClient.get('/jobs/applied');
            setAppliedIds(res.map(app => app.job?._id).filter(Boolean) || []);
        } catch (err) {
            console.error('Error fetching applications:', err);
        }
    };

    const handleApply = async (jobId) => {
        const token = localStorage.getItem('seekerToken');
        if (!token) {
            toast.error('Please login to apply');
            return;
        }

        setApplying(jobId);
        try {
            // Track view when applying
            await trackJobView(jobId);

            await axiosClient.post(`/jobs/apply/${jobId}`);
            toast.success('Applied successfully!');
            setAppliedIds(prev => [...prev, jobId]);
        } catch (err) {
            toast.error(err.response?.data?.message || 'Application failed');
        } finally {
            setApplying(null);
        }
    };

    const trackJobView = async (jobId) => {
        const token = localStorage.getItem('seekerToken');
        if (!token) return;

        try {
            await axiosClient.post(`/jobs/${jobId}/view`);
        } catch (err) {
            // Silent fail - don't disrupt user experience
            console.error('Failed to track view:', err);
        }
    };

    const handleSave = async (jobId) => {
        const token = localStorage.getItem('seekerToken');
        if (!token) {
            toast.error('Please login to save jobs');
            return;
        }

        // Optimistic update
        const isCurrentlySaved = savedIds.includes(jobId);
        if (isCurrentlySaved) {
            setSavedIds(prev => prev.filter(id => id !== jobId));
        } else {
            setSavedIds(prev => [...prev, jobId]);
        }

        try {
            const res = await axiosClient.post(`/jobs/save/${jobId}`);
            toast.info(res.message);
        } catch (err) {
            // Revert on failure
            if (isCurrentlySaved) {
                setSavedIds(prev => [...prev, jobId]);
            } else {
                setSavedIds(prev => prev.filter(id => id !== jobId));
            }
            toast.error('Failed to update saved list');
        }
    };

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
        trackJobView(job._id);
    };

    const filteredJobs = (jobs || []).filter(job => {
        if (selectedCategory === 'All') return true;
        if (selectedCategory === 'Other') {
            if (!otherCategoryText.trim()) return true;
            const keyword = otherCategoryText.trim().toLowerCase();
            const jobCat = (job.category || '').toLowerCase();
            const jobTitle = (job.title || '').toLowerCase();
            const jobTags = (job.tags || []).join(' ').toLowerCase();
            return jobCat.includes(keyword) || jobTitle.includes(keyword) || jobTags.includes(keyword);
        }
        const jobCat = (job.category || '').toLowerCase();
        const selCat = selectedCategory.toLowerCase();
        // Use exact match only — avoids 'non-it'.includes('it') false positives
        return jobCat === selCat || jobCat.includes(selCat);
    });

    const getJobTypeCount = (typeName) => {
        if (!jobs) return 0;
        if (typeName === 'All') return jobs.length;
        return jobs.filter(job => job.type === typeName).length;
    };

    return (
        <div className="min-h-screen bg-white pb-20">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">

                {/* Search & Filter Header */}
                <div className="mb-12">
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-4xl font-bold text-black mb-4"
                    >
                        Explore Opportunities
                    </motion.h1>
                    <p className="text-gray-500 text-lg mb-8">Find the perfect role from thousands of verified job listings.</p>

                    {/* Single-Row: Search + Location + Category + Button */}
                    <div className="flex flex-wrap lg:flex-nowrap items-center gap-3">
                        <div className="flex-1 min-w-[150px] relative group">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="Job title or keywords..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-white border border-gray-300 text-black rounded-2xl py-3 pl-9 pr-3 focus:ring-2 focus:ring-black/20 focus:border-black focus:outline-none transition-all placeholder:text-gray-400 text-sm"
                            />
                        </div>
                        <div className="flex-1 min-w-[130px] relative group">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 transition-colors" size={16} />
                            <input
                                type="text"
                                placeholder="Location..."
                                value={locationSearch}
                                onChange={(e) => setLocationSearch(e.target.value)}
                                className="w-full bg-white border border-gray-300 text-black rounded-2xl py-3 pl-9 pr-3 focus:ring-2 focus:ring-black/20 focus:border-black focus:outline-none transition-all placeholder:text-gray-400 text-sm"
                            />
                        </div>
                        <div className="relative min-w-[175px]">
                            <Filter className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={15} />
                            <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={14} />
                            <select
                                value={selectedCategory}
                                onChange={(e) => setSelectedCategory(e.target.value)}
                                className="w-full appearance-none bg-white border border-gray-300 text-black rounded-2xl py-3 pl-9 pr-8 focus:ring-2 focus:ring-black/20 focus:border-black focus:outline-none transition-all cursor-pointer font-medium text-sm"
                            >
                                {CATEGORY_OPTIONS.map(opt => (
                                    <option key={opt.value} value={opt.value} className="bg-white text-black">
                                        {opt.label}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* "Other" custom keyword input */}
                        <AnimatePresence>
                            {selectedCategory === 'Other' && (
                                <motion.div
                                    initial={{ opacity: 0, width: 0 }}
                                    animate={{ opacity: 1, width: 'auto' }}
                                    exit={{ opacity: 0, width: 0 }}
                                    className="relative min-w-[150px]"
                                >
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
                                    <input
                                        type="text"
                                        placeholder="Type category..."
                                        value={otherCategoryText}
                                        onChange={(e) => setOtherCategoryText(e.target.value)}
                                        autoFocus
                                        className="w-full bg-white border border-black/20 text-black rounded-2xl py-3 pl-8 pr-3 focus:ring-2 focus:ring-black/30 focus:outline-none transition-all placeholder:text-gray-400 text-sm"
                                    />
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <button className="flex items-center justify-center gap-2 bg-black hover:bg-zinc-900 text-white px-6 py-3 rounded-2xl shadow-lg transition-all active:scale-95 font-bold text-sm whitespace-nowrap">
                            Find Jobs
                        </button>
                    </div>

                    {/* Results count + clear filter */}
                    <div className="mt-3 flex items-center gap-3">
                        {selectedCategory !== 'All' && (
                            <motion.button
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                onClick={() => setSelectedCategory('All')}
                                className="flex items-center gap-1.5 px-3 py-1.5 bg-black/5 border border-black/20 text-black rounded-xl text-xs font-bold hover:bg-black/10 transition-all"
                            >
                                <X size={12} />
                                Clear: {selectedCategory}
                            </motion.button>
                        )}
                        <span className="text-gray-500 text-sm">
                            {filteredJobs.length} job{filteredJobs.length !== 1 ? 's' : ''} found
                        </span>
                    </div>
                </div>

                {/* Job Type Tabs */}
                <div className="mb-8 overflow-x-auto pb-2 -mx-4 px-4 custom-scrollbar">
                    <div className="flex gap-3 min-w-max">
                        {jobTypes.map((jobType) => {
                            const Icon = jobType.icon;
                            const count = getJobTypeCount(jobType.name);
                            const isActive = selectedJobType === jobType.name;

                            return (
                                <motion.button
                                    key={jobType.name}
                                    onClick={() => setSelectedJobType(jobType.name)}
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                    className={`flex items-center gap-2 px-5 py-3 rounded-2xl border transition-all ${isActive
                                        ? 'bg-black border-black text-white shadow-lg'
                                        : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400 hover:text-black'
                                        }`}
                                >
                                    <Icon size={18} className={isActive ? 'text-white' : 'text-gray-400'} />
                                    <span className="font-bold text-sm whitespace-nowrap">{jobType.name}</span>
                                    <span className={`px-2 py-0.5 rounded-lg text-xs font-black ${isActive
                                        ? 'bg-white/20 text-white'
                                        : 'bg-gray-100 text-gray-500'
                                        }`}>
                                        {count}
                                    </span>
                                </motion.button>
                            );
                        })}
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="animate-spin text-black mb-4" size={48} />
                        <p className="text-gray-500">Fetching latest jobs...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        <AnimatePresence>
                            {filteredJobs.map((job, idx) => (
                                <motion.div
                                    key={job._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-white border-2 border-blue-200/50 rounded-2xl p-5 shadow-xl hover:shadow-2xl hover:shadow-blue-500/20 hover:border-blue-300 transition-all duration-300 group relative overflow-hidden max-w-sm mx-auto w-full"
                                >
                                    <div
                                        onClick={() => handleCardClick(job)}
                                        className="cursor-pointer"
                                    >
                                        <div className="flex justify-between items-start mb-4">
                                            <div className="w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center flex-shrink-0">
                                                {job.company?.logo ? (
                                                    <img src={job.company.logo} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    <div className="w-full h-full bg-gradient-to-br from-blue-800 to-blue-950 flex items-center justify-center">
                                                        <span className="text-lg font-black text-white">
                                                            {(job.companyName || job.company?.name || 'J').charAt(0).toUpperCase()}
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleSave(job._id);
                                                }}
                                                className={`transition-colors ${savedIds.includes(job._id) ? 'text-black' : 'text-gray-300 hover:text-black'}`}
                                            >
                                                <Bookmark size={20} fill={savedIds.includes(job._id) ? "currentColor" : "none"} />
                                            </button>
                                        </div>

                                        <h3 className="text-lg font-bold text-slate-900 mb-1 group-hover:text-blue-900 transition-colors duration-300">{job.title}</h3>
                                        <div className="mb-4">
                                            <p className="text-slate-600 group-hover:text-blue-700 font-bold transition-colors duration-300">{job.companyName || job.company?.name || job.company}</p>
                                        </div>

                                        <div className="space-y-2 mb-5">
                                            <div className="flex items-center gap-2 text-slate-500 group-hover:text-blue-700 text-sm font-medium transition-colors duration-300">
                                                <MapPin size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                                                {job.location}
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500 group-hover:text-blue-700 text-sm font-medium transition-colors duration-300">
                                                <Briefcase size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                                                {job.type}
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-2 mb-6">
                                            {job.tags?.map(tag => (
                                                <span key={tag} className="px-3 py-1 bg-gray-100 text-gray-600 rounded-lg text-xs border border-gray-200">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-3 border-t border-slate-100 group-hover:border-blue-200 transition-colors duration-300">
                                        <div className="flex flex-col">
                                            <p className="text-slate-900 font-bold group-hover:text-blue-900 transition-colors duration-300">{job.salary || 'Competitive'}</p>
                                            {job.postedBy && (
                                                <button
                                                    onClick={() => handleMessage(job.postedBy._id || job.postedBy)}
                                                    className="flex items-center gap-1.5 text-slate-500 group-hover:text-blue-600 hover:text-blue-700 text-xs font-bold mt-1 transition-colors duration-300"
                                                >
                                                    <MessageSquare size={14} className="group-hover:text-blue-600 transition-colors" />
                                                    Message Recruiter
                                                </button>
                                            )}
                                        </div>
                                        {appliedIds.includes(job._id) ? (
                                            <div className="flex items-center gap-1.5 text-green-700 font-semibold px-4 py-2 bg-green-50 rounded-xl border border-green-200">
                                                <CheckCircle2 size={18} />
                                                Applied
                                            </div>
                                        ) : (
                                            <button
                                                onClick={() => handleApply(job._id)}
                                                disabled={applying === job._id}
                                                className="flex items-center gap-2 bg-black hover:bg-zinc-900 text-white px-6 py-2 rounded-xl transition-all active:scale-95 disabled:opacity-50"
                                            >
                                                {applying === job._id ? (
                                                    <Loader2 className="animate-spin" size={18} />
                                                ) : (
                                                    <>Apply Now <ArrowRight size={18} /></>
                                                )}
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {!loading && filteredJobs.length === 0 && (
                    <div className="text-center py-20">
                        <p className="text-gray-400 text-lg italic">No jobs match your search criteria.</p>
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
                            className="relative w-full max-w-4xl max-h-[90vh] bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col"
                        >
                            {/* Modal Banner Image */}
                            {selectedJob.posterUrl && (
                                <div className="w-full h-48 md:h-64 overflow-hidden relative border-b border-slate-700/50 flex-shrink-0">
                                    <img src={selectedJob.posterUrl} alt="Job Banner" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                                </div>
                            )}

                            {/* Modal Header */}
                            <div className="p-8 border-b border-gray-200 bg-gray-50">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-6">
                                        <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-lg border border-gray-200 flex-shrink-0">
                                            {selectedJob.company?.logo ? (
                                                <img src={selectedJob.company.logo} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full bg-gradient-to-br from-blue-800 to-blue-950 flex items-center justify-center">
                                                    <span className="text-3xl font-black text-white">
                                                        {(selectedJob.companyName || selectedJob.company?.name || 'J').charAt(0).toUpperCase()}
                                                    </span>
                                                </div>
                                            )}
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-bold text-black mb-2">{selectedJob.title}</h2>
                                            <p className="text-gray-700 text-xl font-medium mb-4">{selectedJob.companyName || selectedJob.company?.name || selectedJob.company}</p>
                                            <div className="flex flex-wrap gap-4">
                                                <div className="flex items-center gap-2 text-gray-600 px-3 py-1.5 bg-gray-100 rounded-lg border border-gray-200">
                                                    <MapPin size={18} />
                                                    {selectedJob.location}
                                                </div>
                                                <div className="flex items-center gap-2 text-gray-600 px-3 py-1.5 bg-gray-100 rounded-lg border border-gray-200">
                                                    <Briefcase size={18} />
                                                    {selectedJob.type}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="p-2 text-gray-400 hover:text-black hover:bg-gray-100 rounded-xl transition-all"
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
                                            <h4 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
                                                <div className="w-1.5 h-6 bg-black rounded-full" />
                                                Job Description
                                            </h4>
                                            <p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">
                                                {selectedJob.description || 'No description provided.'}
                                            </p>
                                        </section>

                                        {/* Requirements */}
                                        {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                                            <section>
                                                <h4 className="text-xl font-bold text-black mb-4 flex items-center gap-2">
                                                    <div className="w-1.5 h-6 bg-black rounded-full" />
                                                    Requirements
                                                </h4>
                                                <ul className="space-y-3">
                                                    {selectedJob.requirements.map((req, i) => (
                                                        <li key={i} className="flex gap-3 text-gray-700 bg-gray-50 p-4 rounded-xl border border-gray-200">
                                                            <div className="w-2 h-2 mt-2 rounded-full bg-black flex-shrink-0" />
                                                            {req}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </section>
                                        )}
                                    </div>

                                    {/* Sidebar Info */}
                                    <div className="space-y-6">
                                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                                            <h5 className="font-bold mb-4 uppercase text-xs tracking-widest text-gray-500">Overview</h5>
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-gray-400 text-xs mb-1">Salary</p>
                                                    <p className="text-black font-semibold">{selectedJob.salary || 'Competitive'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400 text-xs mb-1">Posted On</p>
                                                    <p className="text-black font-semibold">{new Date(selectedJob.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-gray-400 text-xs mb-1">Category</p>
                                                    <p className="text-black font-semibold">{selectedJob.category || 'Standard'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tags */}
                                        <div className="bg-gray-50 p-6 rounded-2xl border border-gray-200">
                                            <h5 className="font-bold mb-4 uppercase text-xs tracking-widest text-gray-500">Skills & Tags</h5>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedJob.tags?.map(tag => (
                                                    <span key={tag} className="px-3 py-1 bg-white text-gray-700 rounded-lg text-xs border border-gray-200">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Footer */}
                            <div className="p-8 border-t border-gray-200 bg-gray-50 flex flex-wrap gap-4 items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <button
                                        onClick={() => handleSave(selectedJob._id)}
                                        className={`flex items-center gap-2 px-6 py-3 rounded-xl border transition-all ${savedIds.includes(selectedJob._id)
                                            ? 'bg-black/5 border-black text-black'
                                            : 'border-gray-300 text-gray-500 hover:text-black hover:bg-gray-100'
                                            }`}
                                    >
                                        <Bookmark size={20} fill={savedIds.includes(selectedJob._id) ? "currentColor" : "none"} />
                                        {savedIds.includes(selectedJob._id) ? 'Saved' : 'Save Job'}
                                    </button>
                                    {selectedJob.postedBy && (
                                        <button
                                            onClick={() => {
                                                setIsModalOpen(false);
                                                handleMessage(selectedJob.postedBy._id || selectedJob.postedBy);
                                            }}
                                            className="flex items-center gap-2 px-6 py-3 rounded-xl border border-gray-300 text-gray-500 hover:text-black hover:bg-gray-100 transition-all"
                                        >
                                            <MessageSquare size={20} />
                                            Message
                                        </button>
                                    )}
                                </div>

                                {appliedIds.includes(selectedJob._id) ? (
                                    <div className="flex items-center gap-2 text-green-700 font-bold px-10 py-3 bg-green-50 rounded-2xl border border-green-200">
                                        <CheckCircle2 size={24} />
                                        Successfully Applied
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => handleApply(selectedJob._id)}
                                        disabled={applying === selectedJob._id}
                                        className="flex-1 md:flex-none flex items-center justify-center gap-3 bg-black hover:bg-zinc-900 text-white px-10 py-3 rounded-2xl font-bold text-lg shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
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

export default Jobs
