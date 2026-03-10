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
    Activity,
    Loader2,
    BarChart3,
    PieChart as PieChartIcon
} from 'lucide-react'
import RecruiterLayout from '../../components/RecruiterLayout'

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
            const index = res.findIndex(job => job._id === jobId)
            if (index >= 0) setCurrentJobIndex(index)
        } catch (err) {
            console.error('Failed to fetch jobs:', err)
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
            <RecruiterLayout>
                <div className="flex flex-col items-center justify-center h-[80vh] bg-white">
                    <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                    <p className="text-sm font-semibold text-gray-600">Loading analytics...</p>
                </div>
            </RecruiterLayout>
        )
    }

    if (!analytics) {
        return (
            <RecruiterLayout>
                <div className="flex flex-col items-center justify-center h-[80vh] bg-white">
                    <p className="text-gray-600 font-medium mb-4">No analytics data available</p>
                    <Link to="/recruiter/jobs" className="px-6 py-2.5 bg-blue-600 text-white rounded-lg text-sm font-semibold hover:bg-blue-700 transition-all">
                        Back to Jobs
                    </Link>
                </div>
            </RecruiterLayout>
        )
    }

    const { applicantQuality } = analytics
    const totalApplicants = Object.values(applicantQuality).reduce((sum, val) => sum + val, 0)

    return (
        <RecruiterLayout>
            <main className="p-8 md:p-12 lg:p-16 max-w-7xl mx-auto bg-white min-h-full">
                {/* Header with Navigation */}
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div className="flex items-center gap-4">
                        <Link
                            to="/recruiter/jobs"
                            className="p-3 bg-gray-50 hover:bg-blue-600 hover:text-white text-gray-600 rounded-lg transition-all border border-gray-200"
                        >
                            <ArrowLeft size={20} />
                        </Link>
                        <div>
                            <div className="flex items-center gap-3 mb-1">
                                <h1 className="text-3xl font-bold text-gray-900">{analytics.jobTitle}</h1>
                                <span className="px-3 py-1 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-xs font-semibold">Analytics</span>
                            </div>
                            <p className="text-gray-600 text-sm font-medium">{analytics.company}</p>
                        </div>
                    </div>

                    {/* Job Stepper */}
                    <div className="flex items-center gap-4 bg-gray-50 border border-gray-200 p-2 rounded-xl shadow-sm">
                        <button
                            onClick={() => navigateToJob('prev')}
                            disabled={currentJobIndex === 0}
                            className="p-3 bg-white hover:bg-blue-600 hover:text-white text-gray-600 rounded-lg transition-all disabled:opacity-20 shadow-sm"
                        >
                            <ArrowLeft size={18} />
                        </button>
                        <span className="text-xs font-semibold text-gray-900 px-4">
                            Job {currentJobIndex + 1} of {allJobs.length}
                        </span>
                        <button
                            onClick={() => navigateToJob('next')}
                            disabled={currentJobIndex === allJobs.length - 1}
                            className="p-3 bg-white hover:bg-blue-600 hover:text-white text-gray-600 rounded-lg transition-all disabled:opacity-20 shadow-sm"
                        >
                            <ArrowRight size={18} />
                        </button>
                    </div>
                </div>

                {/* Key Metrics Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 mb-16">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="p-8 bg-blue-600 rounded-[2.5rem] text-white shadow-2xl shadow-blue-600/20 relative overflow-hidden group">
                        <div className="relative z-10 flex flex-col justify-between h-full">
                            <div>
                                <Eye className="text-blue-100 mb-6" size={32} />
                                <h3 className="text-6xl font-black tracking-tighter mb-2">{analytics.totalViews}</h3>
                                <p className="text-sm font-black uppercase tracking-widest opacity-80">Total Views</p>
                            </div>
                            <div className="mt-8 pt-4 border-t border-white/10 flex items-center justify-between text-[11px] font-bold">
                                <span>Unique</span>
                                <span className="bg-white/10 px-2 py-0.5 rounded-lg">{analytics.uniqueViews}</span>
                            </div>
                        </div>
                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors" />
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="p-8 bg-purple-600 rounded-[2.5rem] text-white shadow-2xl shadow-purple-600/20 relative overflow-hidden group">
                        <div className="relative z-10">
                            <Users className="text-purple-100 mb-6" size={32} />
                            <h3 className="text-6xl font-black tracking-tighter mb-2">{analytics.totalApplications}</h3>
                            <p className="text-sm font-black uppercase tracking-widest opacity-80">Total Applications</p>
                        </div>
                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors" />
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="p-8 bg-emerald-600 rounded-[2.5rem] text-white shadow-2xl shadow-emerald-600/20 relative overflow-hidden group">
                        <div className="relative z-10">
                            <TrendingUp className="text-emerald-100 mb-6" size={32} />
                            <h3 className="text-6xl font-black tracking-tighter mb-2">{analytics.viewToApplicationRate}%</h3>
                            <p className="text-sm font-black uppercase tracking-widest opacity-80">Conversion Rate</p>
                        </div>
                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors" />
                    </motion.div>

                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="p-8 bg-orange-600 rounded-[2.5rem] text-white shadow-2xl shadow-orange-600/20 relative overflow-hidden group">
                        <div className="relative z-10">
                            <Clock className="text-orange-100 mb-6" size={32} />
                            <h3 className="text-6xl font-black tracking-tighter mb-2">{analytics.averageTimeToApply}h</h3>
                            <p className="text-sm font-black uppercase tracking-widest opacity-80">Avg. Time to Apply</p>
                        </div>
                        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors" />
                    </motion.div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Job Details Card */}
                    <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="p-4 bg-blue-50 text-blue-600 rounded-2xl">
                                <Briefcase size={24} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-2xl font-black text-black">Job Parameters</h3>
                        </div>
                        
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <MapPin size={20} className="text-slate-300" />
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Location</p>
                                        <p className="text-black font-bold uppercase">{analytics.location}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Briefcase size={20} className="text-slate-300" />
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Type</p>
                                        <p className="text-black font-bold uppercase">{analytics.type}</p>
                                    </div>
                                </div>
                            </div>
                            <div className="space-y-4">
                                <div className="flex items-center gap-3">
                                    <DollarSign size={20} className="text-slate-300" />
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Salary</p>
                                        <p className="text-black font-bold uppercase">{analytics.salary || 'Competitive'}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-3">
                                    <Calendar size={20} className="text-slate-300" />
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Posted On</p>
                                        <p className="text-black font-bold uppercase">{new Date(analytics.postedDate).toLocaleDateString(undefined, { dateStyle: 'long' })}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        <div className="mt-10 pt-10 border-t border-slate-50 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                                <Activity size={18} className="text-slate-400" />
                                <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${
                                    analytics.status === 'active' ? 'bg-green-50 text-green-600 border-green-100' : 'bg-slate-50 text-slate-400 border-slate-100'
                                }`}>
                                    {analytics.status}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-slate-400">
                                <span className="text-[10px] font-black uppercase tracking-widest">Job ID:</span>
                                <span className="font-mono text-[10px] bg-slate-50 px-3 py-1 rounded-lg border border-slate-100">{analytics.jobId.slice(-8).toUpperCase()}</span>
                            </div>
                        </div>
                    </motion.div>

                    {/* Applicant Quality Distribution */}
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="bg-white border border-slate-100 rounded-[3rem] p-10 shadow-sm hover:shadow-xl transition-all duration-300">
                        <div className="flex items-center gap-4 mb-10">
                            <div className="p-4 bg-purple-50 text-purple-600 rounded-2xl">
                                <PieChartIcon size={24} strokeWidth={2.5} />
                            </div>
                            <h3 className="text-2xl font-black text-black">Talent Distribution</h3>
                        </div>

                        <div className="space-y-6">
                            {[
                                { label: 'Entry Level', value: applicantQuality.entry, color: 'bg-blue-600' },
                                { label: 'Mid-Senior', value: applicantQuality.mid, color: 'bg-purple-600' },
                                { label: 'Senior Tier', value: applicantQuality.senior, color: 'bg-emerald-600' },
                                { label: 'Expert Class', value: applicantQuality.expert, color: 'bg-orange-600' }
                            ].map((item) => {
                                const percentage = totalApplicants > 0 ? ((item.value / totalApplicants) * 100).toFixed(1) : 0
                                return (
                                    <div key={item.label} className="group cursor-default">
                                        <div className="flex items-center justify-between mb-3">
                                            <span className="text-[11px] font-black text-slate-500 uppercase tracking-widest">{item.label}</span>
                                            <span className="text-sm font-black text-black">{item.value} <span className="text-slate-300 font-bold ml-1">({percentage}%)</span></span>
                                        </div>
                                        <div className="w-full bg-slate-50 rounded-full h-3 overflow-hidden border border-slate-100 shadow-inner">
                                            <motion.div
                                                initial={{ width: 0 }}
                                                animate={{ width: `${percentage}%` }}
                                                transition={{ duration: 1, ease: 'easeOut' }}
                                                className={`${item.color} h-full rounded-full shadow-lg group-hover:brightness-110 transition-all`}
                                            />
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    </motion.div>
                </div>

                {/* Footer Action */}
                <div className="mt-16 text-center">
                    <Link
                        to={`/recruiter/job-applicants/${analytics.jobId}`}
                        className="inline-flex items-center gap-3 px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold text-sm transition-all shadow-lg active:scale-95 group"
                    >
                        <Users size={20} className="group-hover:scale-110 transition-transform" />
                        View All Applicants
                    </Link>
                </div>
            </main>
        </RecruiterLayout>
    )
}

export default JobAnalytics
