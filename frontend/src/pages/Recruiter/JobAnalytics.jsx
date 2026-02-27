import React, { useState, useEffect } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import axiosClient from '../../api/axiosClient'
import { toast } from 'react-toastify'
import { motion } from 'framer-motion'
import {
    ArrowLeft,
    ArrowRight,
    Eye,
    Users,
    TrendingUp,
    Clock,
    Calendar,
    MapPin,
    Briefcase,
    DollarSign,
    BarChart3,
    PieChart,
    Activity,
    Loader2
} from 'lucide-react'
import Navbar from '../../components/Navbar'

const JobAnalytics = () => {
    const { jobId } = useParams()
    const navigate = useNavigate()
    const [analytics, setAnalytics] = useState(null)
    const [allJobs, setAllJobs] = useState([])
    const [currentJobIndex, setCurrentJobIndex] = useState(0)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchAllJobs()
    }, [])

    useEffect(() => {
        if (jobId) {
            fetchJobAnalytics(jobId)
        }
    }, [jobId])

    const fetchAllJobs = async () => {
        try {
            const res = await axiosClient.get('jobs/recruiter/jobs')
            setAllJobs(res)

            // Find current job index
            const index = res.findIndex(job => job._id === jobId)
            if (index >= 0) setCurrentJobIndex(index)
        } catch (err) {
            console.error('Failed to fetch jobs:', err)
            toast.error('Failed to load jobs')
        }
    }

    const fetchJobAnalytics = async (id) => {
        try {
            setLoading(true)
            const res = await axiosClient.get(`jobs/recruiter/analytics/${id}`)
            setAnalytics(res)
        } catch (err) {
            console.error('Failed to fetch analytics:', err)
            toast.error('Failed to load analytics')
        } finally {
            setLoading(false)
        }
    }

    const navigateToJob = (direction) => {
        let newIndex = currentJobIndex
        if (direction === 'next' && currentJobIndex < allJobs.length - 1) {
            newIndex = currentJobIndex + 1
        } else if (direction === 'prev' && currentJobIndex > 0) {
            newIndex = currentJobIndex - 1
        }

        if (newIndex !== currentJobIndex) {
            setCurrentJobIndex(newIndex)
            navigate(`/recruiter/job-analytics/${allJobs[newIndex]._id}`)
        }
    }

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex items-center justify-center">
                <Navbar />
                <div className="text-center">
                    <Loader2 className="animate-spin text-blue-500 mx-auto mb-4" size={48} />
                    <p className="text-slate-400">Loading analytics...</p>
                </div>
            </div>
        )
    }

    if (!analytics) {
        return (
            <div className="min-h-screen bg-slate-950">
                <Navbar />
                <div className="max-w-7xl mx-auto px-6 py-8 text-center">
                    <p className="text-slate-400">No analytics data available</p>
                    <Link to="/recruiter/jobs" className="text-blue-400 hover:text-blue-300 mt-4 inline-block">
                        Back to Jobs
                    </Link>
                </div>
            </div>
        )
    }

    const { applicantQuality } = analytics
    const totalApplicants = Object.values(applicantQuality).reduce((sum, val) => sum + val, 0)

    return (
        <div className="min-h-screen bg-slate-950">
            <Navbar />

            <div className="max-w-7xl mx-auto px-6 py-8">
                {/* Header with Navigation */}
                <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/recruiter/jobs"
                            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <h1 className="text-3xl font-bold text-white">{analytics.jobTitle}</h1>
                            <p className="text-slate-400">{analytics.company}</p>
                        </div>
                    </div>

                    {/* Job Navigation */}
                    <div className="flex items-center gap-4">
                        <button
                            onClick={() => navigateToJob('prev')}
                            disabled={currentJobIndex === 0}
                            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ArrowLeft size={20} />
                        </button>
                        <span className="text-slate-400 text-sm">
                            Job {currentJobIndex + 1} of {allJobs.length}
                        </span>
                        <button
                            onClick={() => navigateToJob('next')}
                            disabled={currentJobIndex === allJobs.length - 1}
                            className="p-2 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <ArrowRight size={20} />
                        </button>
                    </div>
                </div>

                {/* Key Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <Eye size={24} />
                            <span className="text-blue-200 text-sm font-medium">Total</span>
                        </div>
                        <h3 className="text-3xl font-bold mb-1">{analytics.totalViews}</h3>
                        <p className="text-blue-200 text-sm">Total Views</p>
                        <p className="text-blue-300 text-xs mt-2">{analytics.uniqueViews} unique</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.1 }}
                        className="bg-gradient-to-br from-purple-600 to-purple-700 rounded-2xl p-6 text-white"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <Users size={24} />
                            <span className="text-purple-200 text-sm font-medium">Total</span>
                        </div>
                        <h3 className="text-3xl font-bold mb-1">{analytics.totalApplications}</h3>
                        <p className="text-purple-200 text-sm">Applications</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.2 }}
                        className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 text-white"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <TrendingUp size={24} />
                            <span className="text-green-200 text-sm font-medium">Rate</span>
                        </div>
                        <h3 className="text-3xl font-bold mb-1">{analytics.viewToApplicationRate}%</h3>
                        <p className="text-green-200 text-sm">Conversion Rate</p>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="bg-gradient-to-br from-orange-600 to-orange-700 rounded-2xl p-6 text-white"
                    >
                        <div className="flex items-center justify-between mb-2">
                            <Clock size={24} />
                            <span className="text-orange-200 text-sm font-medium">Average</span>
                        </div>
                        <h3 className="text-3xl font-bold mb-1">{analytics.averageTimeToApply}h</h3>
                        <p className="text-orange-200 text-sm">Time to Apply</p>
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    {/* Job Details */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Briefcase size={20} className="text-blue-400" />
                            Job Details
                        </h3>
                        <div className="space-y-4">
                            <div className="flex items-center gap-3 text-slate-400">
                                <MapPin size={18} className="text-slate-600" />
                                <span>{analytics.location}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-400">
                                <Briefcase size={18} className="text-slate-600" />
                                <span>{analytics.type}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-400">
                                <DollarSign size={18} className="text-slate-600" />
                                <span>{analytics.salary || 'Not specified'}</span>
                            </div>
                            <div className="flex items-center gap-3 text-slate-400">
                                <Calendar size={18} className="text-slate-600" />
                                <span>Posted {new Date(analytics.postedDate).toLocaleDateString()}</span>
                            </div>
                            <div className="flex items-center gap-3">
                                <Activity size={18} className="text-slate-600" />
                                <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${analytics.status === 'active'
                                    ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                    : 'bg-slate-700 text-slate-400'
                                    }`}>
                                    {analytics.status}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Applicant Quality Distribution */}
                    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
                        <h3 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <PieChart size={20} className="text-purple-400" />
                            Applicant Experience Level
                        </h3>
                        <div className="space-y-4">
                            {[
                                { label: 'Entry Level', value: applicantQuality.entry, color: 'bg-blue-500' },
                                { label: 'Mid-Senior Level', value: applicantQuality.mid, color: 'bg-purple-500' },
                                { label: 'Senior Level', value: applicantQuality.senior, color: 'bg-green-500' },
                                { label: 'Expert/Principal', value: applicantQuality.expert, color: 'bg-orange-500' }
                            ].map((item) => {
                                const percentage = totalApplicants > 0 ? ((item.value / totalApplicants) * 100).toFixed(1) : 0
                                return (
                                    <div key={item.label}>
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-slate-400 text-sm">{item.label}</span>
                                            <span className="text-white font-bold">{item.value} ({percentage}%)</span>
                                        </div>
                                        <div className="w-full bg-slate-800 rounded-full h-2">
                                            <div
                                                className={`${item.color} h-2 rounded-full transition-all`}
                                                style={{ width: `${percentage}%` }}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* View Applicants Button */}
                <div className="mt-8 text-center">
                    <Link
                        to={`/recruiter/job-applicants/${analytics.jobId}`}
                        className="inline-flex items-center gap-2 px-8 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-900/30 active:scale-95"
                    >
                        <Users size={20} />
                        View All Applicants
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default JobAnalytics
