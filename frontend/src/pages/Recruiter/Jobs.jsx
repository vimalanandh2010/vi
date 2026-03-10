import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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
    Loader2,
    BarChart3,
    TrendingUp,
    X
} from 'lucide-react'
import axiosClient from '../../api/axiosClient'
import { toast } from 'react-toastify'
import { useAuth } from '../../context/AuthContext'
import useFetch from '../../hooks/useFetch'
import recruiterApi from '../../api/modules/recruiter.api'
import RecruiterLayout from '../../components/RecruiterLayout'

const RecruiterJobs = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const { data: company } = useFetch(recruiterApi.getCompanyProfile)
    const [jobs, setJobs] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState('')
    const [selectedCategory, setSelectedCategory] = useState('All Categories')
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

    const categories = [
        { value: 'All Categories', label: 'All Categories', icon: '🔍' },
        { value: 'IT', label: 'Technology / IT', icon: '💻' },
        { value: 'Engineering', label: 'Engineering', icon: '⚙️' },
        { value: 'Healthcare', label: 'Healthcare / Medical', icon: '🏥' },
        { value: 'Finance', label: 'Finance / Banking', icon: '💰' },
        { value: 'Sales', label: 'Marketing / Sales', icon: '📊' },
        { value: 'HR', label: 'Human Resources', icon: '👥' },
        { value: 'CustomerService', label: 'Customer Service', icon: '📞' },
        { value: 'Education', label: 'Education / Training', icon: '📚' },
        { value: 'Design', label: 'Design / Creative', icon: '🎨' },
        { value: 'Operations', label: 'Operations / Logistics', icon: '📦' },
        { value: 'Legal', label: 'Legal / Compliance', icon: '⚖️' },
        { value: 'Consulting', label: 'Consulting', icon: '💼' },
        { value: 'Manufacturing', label: 'Manufacturing', icon: '🏭' },
        { value: 'Construction', label: 'Construction', icon: '🏗️' },
        { value: 'Retail', label: 'Retail / E-commerce', icon: '🛍️' },
        { value: 'Hospitality', label: 'Hospitality / Travel', icon: '🏨' },
        { value: 'Media', label: 'Media / Entertainment', icon: '🎬' },
        { value: 'RealEstate', label: 'Real Estate', icon: '🏢' },
        { value: 'Administration', label: 'Administration', icon: '📋' },
        { value: 'Research', label: 'Research / Science', icon: '🔬' },
        { value: 'Agriculture', label: 'Agriculture', icon: '🌾' },
        { value: 'Management', label: 'Strategic / Management', icon: '📈' },
        { value: 'Other', label: 'Other', icon: '📌' }
    ]

    const filteredJobs = jobs.filter(job => {
        const matchesSearch = job.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.company?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            job.location?.toLowerCase().includes(searchQuery.toLowerCase())
        
        const matchesCategory = selectedCategory === 'All Categories' || job.category === selectedCategory
        
        return matchesSearch && matchesCategory
    })

    return (
        <RecruiterLayout jobCount={jobs.length}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 py-5 sm:py-8">
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 sm:mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-black">My Job Postings</h1>
                            <span className="px-4 py-1.5 bg-blue-50 border border-blue-100 text-blue-600 rounded-full text-sm font-bold">
                                {jobs.length} {jobs.length === 1 ? 'Job' : 'Jobs'}
                            </span>
                        </div>
                        <p className="text-slate-500 font-medium">Manage and track your active job listings</p>
                    </div>

                    <div className="flex items-center gap-4">
                        <button
                            onClick={(e) => handlePostNavigation(e, '/recruiter/post-job', 'post a job')}
                            className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-xl shadow-blue-600/10 active:scale-95"
                        >
                            <Plus size={20} />
                            Post New Job
                        </button>
                    </div>
                </div>

                {/* Dashboard Statistics */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6 mb-8 sm:mb-12">
                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 bg-blue-50 rounded-xl flex items-center justify-center text-blue-600">
                                <Briefcase size={20} />
                            </div>
                            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total</span>
                        </div>
                        <h3 className="text-3xl font-black text-black mb-1">{jobs.length}</h3>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-tight">Job Postings</p>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 bg-purple-50 rounded-xl flex items-center justify-center text-purple-600">
                                <Users size={20} />
                            </div>
                            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Total</span>
                        </div>
                        <h3 className="text-3xl font-black text-black mb-1">
                            {jobs.reduce((sum, job) => sum + (job.applicants?.length || 0), 0)}
                        </h3>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-tight">Total Applicants</p>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-600">
                                <Clock size={20} />
                            </div>
                            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Active</span>
                        </div>
                        <h3 className="text-3xl font-black text-black mb-1">
                            {jobs.filter(job => job.status !== 'closed').length}
                        </h3>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-tight">Active Jobs</p>
                    </div>

                    <div className="bg-white border border-slate-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-10 h-10 bg-orange-50 rounded-xl flex items-center justify-center text-orange-600">
                                <Calendar size={20} />
                            </div>
                            <span className="text-slate-400 text-[10px] font-black uppercase tracking-widest">Recent</span>
                        </div>
                        <h3 className="text-3xl font-black text-black mb-1">
                            {jobs.filter(job => {
                                const daysDiff = (new Date() - new Date(job.createdAt)) / (1000 * 60 * 60 * 24);
                                return daysDiff <= 7;
                            }).length}
                        </h3>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-tight">Posted This Week</p>
                    </div>
                </div>

                {/* Search Bar */}
                <div className="relative mb-6">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
                    <input
                        type="text"
                        placeholder="Search jobs by title, company, or location..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full bg-white border border-slate-200 rounded-2xl py-4 pl-12 pr-4 text-black focus:outline-none focus:ring-4 focus:ring-black/5 focus:border-black transition-all shadow-sm"
                    />
                </div>

                {/* Category Filter */}
                <div className="mb-12">
                    <div className="flex items-center gap-3 mb-4">
                        <span className="text-sm font-black text-slate-400 uppercase tracking-widest">Filter by Category</span>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        {categories.map((cat) => (
                            <button
                                key={cat.value}
                                onClick={() => setSelectedCategory(cat.value)}
                                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all border ${
                                    selectedCategory === cat.value
                                        ? 'bg-blue-600 text-white border-blue-600 shadow-lg'
                                        : 'bg-white text-slate-600 border-slate-200 hover:border-slate-400 hover:bg-slate-50'
                                }`}
                            >
                                <span>{cat.icon}</span>
                                <span>{cat.label}</span>
                                {selectedCategory === cat.value && jobs.filter(j => cat.value === 'All Categories' || j.category === cat.value).length > 0 && (
                                    <span className="px-2 py-0.5 bg-white/20 rounded-full text-xs">
                                        {jobs.filter(j => cat.value === 'All Categories' ? true : j.category === cat.value).length}
                                    </span>
                                )}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Jobs List */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center h-64 text-slate-400">
                        <Loader2 className="animate-spin mb-4" size={32} />
                        <p className="text-sm font-bold uppercase tracking-widest">Loading jobs...</p>
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-3xl border border-slate-100 shadow-sm">
                        <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Briefcase className="text-slate-300" size={32} />
                        </div>
                        <p className="text-black text-xl font-bold mb-2">No jobs found</p>
                        <p className="text-slate-500 font-medium">
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
                                className="bg-white border border-slate-100 rounded-3xl p-8 hover:shadow-xl hover:border-transparent transition-all group"
                            >
                                <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 sm:gap-8">
                                    <div className="flex-1">
                                        <div className="flex items-start gap-6 mb-6">
                                            <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center text-black font-black text-2xl shrink-0 group-hover:bg-black group-hover:text-white transition-colors border border-slate-100">
                                                {job.company?.[0] || 'J'}
                                            </div>
                                            <div
                                                onClick={() => handleCardClick(job)}
                                                className="flex-1 cursor-pointer"
                                            >
                                                <h3 className="text-2xl font-black text-black mb-1 group-hover:text-black transition-colors flex items-center gap-3">
                                                    {job.title}
                                                    <span className="opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <BarChart3 size={18} className="text-slate-400" />
                                                    </span>
                                                </h3>
                                                <div className="flex items-center gap-3">
                                                    <p className="text-slate-500 font-bold">{job.company}</p>
                                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                                    <p className="text-slate-400 text-sm font-medium">{new Date(job.createdAt).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex flex-wrap gap-6 mb-6">
                                            <div className="flex items-center gap-2 text-slate-500 text-sm font-bold">
                                                <MapPin size={16} className="text-slate-300" />
                                                {job.location || 'Remote'}
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500 text-sm font-bold">
                                                <Briefcase size={16} className="text-slate-300" />
                                                {job.type || 'Full-time'}
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500 text-sm font-bold">
                                                <DollarSign size={16} className="text-slate-300" />
                                                {job.salary || 'Not specified'}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-2 flex-wrap">
                                            <span className="px-4 py-1.5 bg-blue-50 text-blue-600 rounded-full text-xs font-black uppercase tracking-tight">
                                                {job.applicants?.length || 0} Applicants
                                            </span>
                                            <span className="px-4 py-1.5 bg-slate-50 text-slate-600 rounded-full text-xs font-black uppercase tracking-tight">
                                                {job.experienceLevel || 'All Levels'}
                                            </span>
                                            {analyticsData[job._id] && (
                                                <>
                                                    <span className="px-4 py-1.5 bg-purple-50 text-purple-600 rounded-full text-xs font-black uppercase tracking-tight flex items-center gap-1.5">
                                                        <Eye size={12} />
                                                        {analyticsData[job._id].views} views
                                                    </span>
                                                    <span className="px-4 py-1.5 bg-green-50 text-green-600 rounded-full text-xs font-black uppercase tracking-tight flex items-center gap-1.5">
                                                        <TrendingUp size={12} />
                                                        {analyticsData[job._id].viewToApplicationRate}% rate
                                                    </span>
                                                </>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap sm:flex-row xl:flex-col gap-3">
                                        <Link
                                            to={`/recruiter/job-analytics/${job._id}`}
                                            className="flex items-center gap-2 px-6 py-2.5 bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-700 rounded-xl text-sm font-bold transition-all border border-gray-200"
                                        >
                                            <BarChart3 size={16} />
                                            Analyze
                                        </Link>

                                        <Link
                                            to={`/recruiter/job-applicants/${job._id}`}
                                            className="flex items-center gap-2 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-600/5"
                                        >
                                            <Eye size={16} />
                                            View Applicants
                                        </Link>
                                        <div className="flex gap-2">
                                            <Link
                                                to={`/recruiter/edit-job/${job._id}`}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 hover:border-black text-slate-600 hover:text-black rounded-xl text-sm font-bold transition-all"
                                            >
                                                <Edit size={16} />
                                            </Link>
                                            <button
                                                onClick={() => handleDelete(job._id)}
                                                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-600 text-red-500 hover:text-white rounded-xl text-sm font-bold transition-all border border-red-100"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </div>
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
                            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-4xl max-h-[90vh] bg-white rounded-[2rem] shadow-2xl overflow-hidden flex flex-col"
                        >
                            <div className="p-8 border-b border-slate-50 flex justify-between items-start">
                                <div className="flex-1">
                                    <h2 className="text-3xl font-black text-black mb-2">{selectedJob.title}</h2>
                                    <p className="text-slate-600 font-bold">{selectedJob.company}</p>
                                </div>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-3 text-slate-400 hover:text-black hover:bg-slate-50 rounded-full transition-all"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-10 custom-scrollbar">
                                <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                                    <div className="lg:col-span-2 space-y-10">
                                        <section>
                                            <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Job Description</h4>
                                            <p className="text-slate-600 leading-relaxed whitespace-pre-line text-lg font-medium">
                                                {selectedJob.description || 'No description provided.'}
                                            </p>
                                        </section>

                                        {selectedJob.requirements && selectedJob.requirements.length > 0 && (
                                            <section>
                                                <h4 className="text-sm font-black text-slate-400 uppercase tracking-[0.2em] mb-6">Key Requirements</h4>
                                                <ul className="grid gap-4">
                                                    {selectedJob.requirements.map((req, i) => (
                                                        <li key={i} className="flex gap-4 text-slate-600 bg-slate-50 p-5 rounded-2xl font-medium border border-slate-100">
                                                            <div className="w-2 h-2 mt-2.5 rounded-full bg-black shrink-0" />
                                                            {req}
                                                        </li>
                                                    ))}
                                                </ul>
                                            </section>
                                        )}
                                    </div>

                                    <div className="space-y-6">
                                        <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                                            <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Details</h5>
                                            <div className="space-y-6">
                                                <div>
                                                    <p className="text-slate-400 text-[10px] font-black uppercase mb-1">Salary Range</p>
                                                    <p className="text-black font-black text-lg">{selectedJob.salary || 'Competitive'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-400 text-[10px] font-black uppercase mb-1">Location</p>
                                                    <p className="text-black font-black text-lg">{selectedJob.location || 'Remote'}</p>
                                                </div>
                                                <div>
                                                    <p className="text-slate-400 text-[10px] font-black uppercase mb-1">Job Type</p>
                                                    <p className="text-black font-black text-lg">{selectedJob.type || 'Full-time'}</p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="bg-slate-50 p-8 rounded-[2rem] border border-slate-100">
                                            <h5 className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-6">Tags</h5>
                                            <div className="flex flex-wrap gap-2">
                                                {selectedJob.tags?.map(tag => (
                                                    <span key={tag} className="px-3 py-1.5 bg-white text-slate-600 rounded-xl text-xs font-bold border border-slate-200">
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8 border-t border-slate-50 flex items-center justify-between bg-slate-50/50">
                                <p className="text-slate-400 text-xs font-medium italic">
                                    This is how candidates see your post
                                </p>
                                <div className="flex gap-4">
                                    <button
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-8 py-3 bg-white hover:bg-slate-100 text-black rounded-2xl font-black text-sm transition-all border border-slate-200"
                                    >
                                        Close
                                    </button>
                                    <Link
                                        to={`/recruiter/edit-job/${selectedJob._id}`}
                                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm transition-all shadow-xl shadow-blue-600/10"
                                    >
                                        Update Job
                                    </Link>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </RecruiterLayout>
    )
}

export default RecruiterJobs
