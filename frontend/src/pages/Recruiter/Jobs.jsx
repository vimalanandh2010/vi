import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import {
    Briefcase,
    Users,
    MapPin,
    Calendar,
    DollarSign,
    Clock,
    Edit,
    Trash2,
    Eye,
    Plus,
    Search,
    Filter,
    Loader2,
    BarChart3,
    TrendingUp,
    X,
    ArrowRight,
    CheckCircle2,
    Sparkles
} from 'lucide-react'
import axiosClient from '../../api/axiosClient'
import { toast } from 'react-toastify'
import Navbar from '../../components/Navbar'
import { useAuth } from '../../context/AuthContext'
import useFetch from '../../hooks/useFetch'
import recruiterApi from '../../api/modules/recruiter.api'
import { AnimatePresence } from 'framer-motion'
import VerificationBadge from '../../components/Common/VerificationBadge'

const RecruiterJobs = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const { data: company } = useFetch(recruiterApi.getCompanyProfile)
    const [jobs, setJobs] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [analyticsData, setAnalyticsData] = useState({})
    const [selectedJob, setSelectedJob] = useState(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    useEffect(() => {
        fetchJobs()
        fetchAnalyticsSummary()
    }, [])

    const handlePostNavigation = (e, path, label) => {
        e.preventDefault();
        if (!company) {
            toast.error(`Please complete your company profile to ${label}.`);
            return;
        }
        navigate(path);
    }

    const fetchJobs = async () => {
        try {
            const res = await axiosClient.get('jobs/recruiter/jobs')
            setJobs(res)
        } catch (err) {
            console.error('Failed to fetch jobs:', err)
            toast.error('Failed to load jobs')
        } finally {
            setLoading(false)
        }
    }

    const fetchAnalyticsSummary = async () => {
        try {
            const res = await axiosClient.get('jobs/recruiter/analytics')
            // Create a map of jobId to analytics
            const analyticsMap = {}
            res.jobs.forEach(job => {
                analyticsMap[job.jobId] = job
            })
            setAnalyticsData(analyticsMap)
        } catch (err) {
            console.error('Failed to fetch analytics:', err)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this job?')) return

        try {
            await axiosClient.delete(`jobs/${id}`)
            toast.success('Job deleted successfully')
            fetchJobs()
        } catch (err) {
            toast.error('Failed to delete job')
        }
    }

    const handleCardClick = (job) => {
        setSelectedJob(job)
        setIsModalOpen(true)
    }

    const filteredJobs = jobs.filter(job =>
        job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-slate-950">
            <Navbar />

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-4xl font-bold text-white">My Job Postings</h1>
                            <span className="px-4 py-1.5 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-full text-sm font-bold">
                                {jobs.length} {jobs.length === 1 ? 'Job' : 'Jobs'}
                            </span>
                        </div>
                        <p className="text-slate-400">Posted by {user?.email}</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={(e) => handlePostNavigation(e, '/recruiter/post-course', 'post a course')}
                            className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-indigo-900/30 active:scale-95"
                        >
                            <Plus size={20} />
                            Post Course
                        </button>
                        <button
                            onClick={(e) => handlePostNavigation(e, '/recruiter/post-job', 'post a job')}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/30 active:scale-95"
                        >
                            <Plus size={20} />
                            Post New Job
                        </button>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative mb-8">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                    <input
                        type="text"
                        placeholder="Search jobs by title, company, or location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-800 rounded-xl py-3 pl-12 pr-4 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                    />
                </div>

                {/* Dashboard Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <Briefcase size={24} />
                            <span className="text-blue-200 text-sm font-medium">Total</span>
                        </div>
                        <h3 className="text-3xl font-bold mb-1">{jobs.length}</h3>
                        <p className="text-blue-200 text-sm">Job Postings</p>
                    </div>

                    <div className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <Users size={24} />
                            <span className="text-purple-200 text-sm font-medium">Total</span>
                        </div>
                        <h3 className="text-3xl font-bold mb-1">
                            {jobs.reduce((sum, job) => sum + (job.applicants?.length || 0), 0)}
                        </h3>
                        <p className="text-purple-200 text-sm">Total Applicants</p>
                    </div>

                    <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <Clock size={24} />
                            <span className="text-green-200 text-sm font-medium">Active</span>
                        </div>
                        <h3 className="text-3xl font-bold mb-1">
                            {jobs.filter(job => job.status !== 'closed').length}
                        </h3>
                        <p className="text-green-200 text-sm">Active Jobs</p>
                    </div>

                    <div className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-2xl p-6 text-white">
                        <div className="flex items-center justify-between mb-2">
                            <Calendar size={24} />
                            <span className="text-orange-200 text-sm font-medium">Recent</span>
                        </div>
                        <h3 className="text-3xl font-bold mb-1">
                            {jobs.filter(job => {
                                const daysDiff = (new Date() - new Date(job.createdAt)) / (1000 * 60 * 60 * 24);
                                return daysDiff <= 7;
                            }).length}
                        </h3>
                        <p className="text-orange-200 text-sm">Posted This Week</p>
                    </div>
                </div>

                {/* Jobs List */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                        <Loader2 className="animate-spin mb-4" size={32} />
                        <p className="text-sm">Loading jobs...</p>
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <div className="text-center py-12 bg-slate-900/50 rounded-2xl border border-slate-800">
                        <Briefcase className="mx-auto mb-4 text-slate-600" size={48} />
                        <p className="text-slate-400 text-lg mb-2">No jobs found</p>
                        <p className="text-slate-500 text-sm">
                            {searchQuery ? 'Try a different search term' : 'Start by posting your first job'}
                        </p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        {filteredJobs.map((job) => (
                            <motion.div
                                key={job._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 hover:border-slate-700 transition-all"
                            >
                                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-start gap-4 mb-4">
                                            <div className="w-14 h-14 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shrink-0">
                                                {job.company?.[0] || 'J'}
                                            </div>
                                            <div
                                                onClick={() => handleCardClick(job)}
                                                className="flex-1 cursor-pointer group/title"
                                            >
                                                <h3 className="text-xl font-bold text-white mb-1 group-hover/title:text-blue-400 transition-colors flex items-center gap-2">
                                                    {job.title}
                                                    <Eye size={16} className="opacity-0 group-hover/title:opacity-100 text-slate-500 transition-all" />
                                                </h3>
                                                <p className="text-slate-400 text-sm">{job.company}</p>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                                <MapPin size={16} className="text-slate-600" />
                                                {job.location || 'Remote'}
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                                <Briefcase size={16} className="text-slate-600" />
                                                {job.type || 'Full-time'}
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                                <DollarSign size={16} className="text-slate-600" />
                                                {job.salary || 'Not specified'}
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                                <Calendar size={16} className="text-slate-600" />
                                                {new Date(job.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="px-3 py-1 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-full text-xs font-bold">
                                                {job.applicants?.length || 0} Applicants
                                            </span>
                                            <span className="px-3 py-1 bg-slate-800 border border-slate-700 text-slate-400 rounded-full text-xs font-bold capitalize">
                                                {job.experienceLevel || 'All Levels'}
                                            </span>
                                            {analyticsData[job._id] && (
                                                <>
                                                    <span className="px-3 py-1 bg-purple-600/20 border border-purple-500/30 text-purple-400 rounded-full text-xs font-bold">
                                                        <Eye size={12} className="inline mr-1" />
                                                        {analyticsData[job._id].views} views
                                                    </span>
                                                    <span className="px-3 py-1 bg-green-600/20 border border-green-500/30 text-green-400 rounded-full text-xs font-bold">
                                                        <TrendingUp size={12} className="inline mr-1" />
                                                        {analyticsData[job._id].viewToApplicationRate}% rate
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex md:flex-col gap-2">
                                        <Link
                                            to={`/recruiter/job-analytics/${job._id}`}
                                            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-500 hover:to-blue-500 text-white rounded-xl text-sm font-medium transition-all"
                                        >
                                            <BarChart3 size={16} />
                                            Analyze
                                        </Link>

                                        <Link
                                            to={`/recruiter/job-applicants/${job._id}`}
                                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-xl text-sm font-medium transition-all"
                                        >
                                            <Eye size={16} />
                                            View
                                        </Link>
                                        <Link
                                            to={`/recruiter/edit-job/${job._id}`}
                                            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-sm font-medium transition-all"
                                        >
                                            <Edit size={16} />
                                            Edit
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(job._id)}
                                            className="flex items-center gap-2 px-4 py-2 bg-red-600/10 hover:bg-red-600/20 border border-red-500/30 text-red-400 rounded-xl text-sm font-medium transition-all"
                                        >
                                            <Trash2 size={16} />
                                            Delete
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>

            {/* Job Details Preview Modal */}
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
                            {/* Modal Banner Image */}
                            {selectedJob.posterUrl && (
                                <div className="w-full h-48 md:h-64 overflow-hidden relative border-b border-slate-700/50 flex-shrink-0">
                                    <img src={selectedJob.posterUrl} alt="Job Banner" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                                </div>
                            )}

                            {/* Modal Header */}
                            <div className="p-8 border-b border-slate-700/50 bg-slate-800/20">
                                <div className="flex justify-between items-start">
                                    <div className="flex gap-6">
                                        <div className="w-20 h-20 rounded-2xl bg-slate-700/50 flex items-center justify-center text-4xl shadow-lg border border-slate-600/30">
                                            🏢
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-3 mb-2">
                                                <span className="px-3 py-1 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-full text-[10px] font-black uppercase tracking-widest">
                                                    Recruiter Preview
                                                </span>
                                            </div>
                                            <h2 className="text-3xl font-bold text-white mb-2">{selectedJob.title}</h2>
                                            <div className="flex items-center gap-3 mb-4">
                                                <p className="text-blue-400 text-xl font-medium">{selectedJob.companyName || selectedJob.company?.name || selectedJob.company}</p>
                                                <VerificationBadge
                                                    level={selectedJob.company?.verificationLevel || 0}
                                                    status={selectedJob.company?.verificationStatus || 'unverified'}
                                                />
                                            </div>
                                            <div className="flex flex-wrap gap-4">
                                                <div className="flex items-center gap-2 text-slate-400 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700/50">
                                                    <MapPin size={18} />
                                                    {selectedJob.location}
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-400 px-3 py-1.5 bg-slate-800/50 rounded-lg border border-slate-700/50">
                                                    <Briefcase size={18} />
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
                                            <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                                <div className="w-1.5 h-6 bg-blue-500 rounded-full" />
                                                Job Description
                                            </h4>
                                            <p className="text-slate-300 leading-relaxed whitespace-pre-line text-lg">
                                                {selectedJob.description || 'No description provided.'}
                                            </p>
                                        </section>

                                        {/* Requirements */}
                                        {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                                            <section>
                                                <h4 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                                                    <div className="w-1.5 h-6 bg-purple-500 rounded-full" />
                                                    Requirements
                                                </h4>
                                                <ul className="space-y-3">
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
                                            <h5 className="text-white font-bold mb-4 uppercase text-xs tracking-widest text-slate-500">Overview</h5>
                                            <div className="space-y-4">
                                                <div>
                                                    <p className="text-slate-500 text-xs mb-1">Salary</p>
                                                    <p className="text-white font-semibold">{selectedJob.salary || 'Competitive'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-500 text-xs mb-1">Posted On</p>
                                                    <p className="text-white font-semibold">{new Date(selectedJob.createdAt).toLocaleDateString()}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-500 text-xs mb-1">Category</p>
                                                    <p className="text-white font-semibold">{selectedJob.category || 'Standard'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Tags */}
                                        <div className="bg-slate-800/40 p-6 rounded-2xl border border-slate-700/50">
                                            <h5 className="text-white font-bold mb-4 uppercase text-xs tracking-widest text-slate-500">Skills & Tags</h5>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedJob.tags?.map(tag => (
                                                    <span key={tag} className="px-3 py-1 bg-slate-700/50 text-slate-400 rounded-lg text-xs border border-slate-600/30">
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
                                <p className="text-slate-500 text-xs italic">
                                    * This is a preview of how candidates will see your job posting.
                                </p>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all"
                                    >
                                        Close Preview
                                    </button>
                                    <Link
                                        to={`/recruiter/edit-job/${selectedJob._id}`}
                                        className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/40"
                                    >
                                        Edit Job
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default RecruiterJobs
