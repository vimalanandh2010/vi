import React, { useState, useEffect } from 'react'
import { Briefcase, Clock, CheckCircle2, XCircle, Loader2, ArrowLeft, Search, Filter, Brain, Sparkles, ArrowRight, Video } from 'lucide-react'
import Navbar from '../../components/Navbar'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import axiosClient from '../../api/axiosClient'

const Applications = () => {
    const [applications, setApplications] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchApplications()
    }, [])

    const fetchApplications = async () => {
        const token = localStorage.getItem('seekerToken')
        if (!token) {
            setLoading(false)
            return
        }

        try {
            const res = await axiosClient.get('jobs/applied')
            setApplications(res)
        } catch (err) {
            console.error('Error fetching applications:', err)
        } finally {
            setLoading(false)
        }
    }

    const handleCancelInterview = async (applicationId, jobTitle) => {
        if (window.confirm(`Are you sure you want to cancel your interview for ${jobTitle}? This action cannot be undone and will notify the employer.`)) {
            try {
                await axiosClient.patch(`/jobs/application/${applicationId}/cancel-interview`);

                // Update local UI state
                setApplications(prev => prev.map(app =>
                    app._id === applicationId
                        ? { ...app, status: 'cancelled', interviewDate: '', interviewTime: '', meetingLink: '' }
                        : app
                ));
            } catch (err) {
                console.error("Error cancelling interview:", err);
                alert(err.response?.data?.message || "Failed to cancel interview. Please try again.");
            }
        }
    };

    const filteredApps = applications.filter(app =>
        app.job?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.job?.company?.toLowerCase().includes(searchTerm.toLowerCase())
    )

    const getStatusStyle = (status) => {
        switch (status) {
            case 'applied': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
            case 'viewed': return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
            case 'screening': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            case 'interview': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
            case 'offer': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            case 'rejected': return 'bg-red-500/10 text-red-400 border-red-500/20'
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
        }
    }

    return (
        <div className="min-h-screen bg-slate-900 pb-20">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
                <Link to="/seeker/dashboard" className="inline-flex items-center gap-2 text-slate-400 hover:text-white transition-colors mb-8 group">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </Link>

                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <h1 className="text-4xl font-bold text-white mb-2">My Applications</h1>
                        <p className="text-slate-400 italic">Track the status of your journey with top companies.</p>
                    </div>

                    <div className="relative w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                        <input
                            type="text"
                            placeholder="Filter applications..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-800/50 border border-slate-700/50 text-white rounded-xl py-3 pl-12 pr-4 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-all"
                        />
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="animate-spin text-blue-500 mb-4" size={40} />
                        <p className="text-slate-400">Syncing with database...</p>
                    </div>
                ) : filteredApps.length > 0 ? (
                    <div className="grid gap-4">
                        <AnimatePresence>
                            {filteredApps.map((app, idx) => (
                                <motion.div
                                    key={app._id}
                                    initial={{ opacity: 0, scale: 0.95 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-slate-800/30 border border-slate-700/50 rounded-2xl p-6 flex flex-col md:flex-row md:items-center justify-between hover:border-slate-600 transition-all group"
                                >
                                    <div className="flex items-center gap-5 mb-4 md:mb-0">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-700/50 flex items-center justify-center text-2xl group-hover:scale-110 transition-transform">
                                            🏢
                                        </div>
                                        <div>
                                            <h3 className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors">{app.job?.title}</h3>
                                            <p className="text-slate-400">{app.job?.company} • {app.job?.location}</p>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap items-center gap-4">
                                        <div className="flex items-center gap-2 text-slate-500 text-sm">
                                            <Clock size={16} />
                                            Applied {new Date(app.createdAt).toLocaleDateString()}
                                        </div>
                                        <span className={`px-4 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider border ${getStatusStyle(app.status)}`}>
                                            {app.status}
                                        </span>

                                        {/* AI ATS Score Badge */}
                                        {app.aiMatchScore > 0 ? (
                                            <div className="flex items-center gap-2">
                                                <div className="relative w-12 h-12 shrink-0">
                                                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 40 40">
                                                        <circle cx="20" cy="20" r="16" fill="transparent" stroke="currentColor" strokeWidth="3" className="text-slate-700" />
                                                        <circle cx="20" cy="20" r="16" fill="transparent" stroke="currentColor" strokeWidth="3"
                                                            strokeDasharray="100.5"
                                                            strokeDashoffset={100.5 - (100.5 * app.aiMatchScore) / 100}
                                                            strokeLinecap="round"
                                                            className={app.aiMatchScore >= 80 ? 'text-green-500' : app.aiMatchScore >= 60 ? 'text-blue-500' : 'text-amber-500'}
                                                        />
                                                    </svg>
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                                        <span className={`text-[10px] font-black ${app.aiMatchScore >= 80 ? 'text-green-400' : app.aiMatchScore >= 60 ? 'text-blue-400' : 'text-amber-400'}`}>
                                                            {app.aiMatchScore}%
                                                        </span>
                                                    </div>
                                                </div>
                                                <div>
                                                    <p className="text-[10px] text-slate-500 uppercase font-bold tracking-widest leading-tight">AI Match</p>
                                                    <p className={`text-xs font-bold ${app.aiMatchScore >= 80 ? 'text-green-400' : app.aiMatchScore >= 60 ? 'text-blue-400' : 'text-amber-400'}`}>
                                                        {app.aiMatchScore >= 80 ? 'Strong' : app.aiMatchScore >= 60 ? 'Good' : 'Fair'}
                                                    </p>
                                                </div>
                                            </div>
                                        ) : app.aiMatchScore == null ? (
                                            <div className="flex items-center gap-1.5 text-slate-600 text-xs">
                                                <Brain size={14} />
                                                <span>Pending scan</span>
                                            </div>
                                        ) : null}

                                    </div>

                                    {['interview', 'scheduled', 'offer'].includes(app.status) && app.interviewDate && (
                                        <div className="flex gap-2 ml-auto">
                                            {app.meetingLink ? (
                                                <a
                                                    href={app.meetingLink.startsWith('http') ? app.meetingLink : `https://${app.meetingLink}`}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-md"
                                                >
                                                    <Video size={14} /> Join Meeting
                                                </a>
                                            ) : (
                                                <Link
                                                    to={`/interview/${app._id}`}
                                                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition-all shadow-md"
                                                >
                                                    <Video size={14} /> Join Call
                                                </Link>
                                            )}
                                            <button
                                                onClick={() => handleCancelInterview(app._id, app.job?.title)}
                                                className="inline-flex items-center gap-1.5 px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-lg text-xs font-bold transition-all"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    )}

                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="text-center py-24 bg-slate-800/20 rounded-3xl border border-dashed border-slate-700">
                        <div className="w-20 h-20 bg-slate-700/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Briefcase size={32} className="text-slate-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">No applications found</h3>
                        <p className="text-slate-400 mb-8 max-w-sm mx-auto">You haven't applied to any jobs yet. Start your journey today!</p>
                        <Link to="/seeker/jobs" className="bg-blue-600 hover:bg-blue-500 text-white px-8 py-3 rounded-2xl font-bold transition-all inline-flex items-center gap-2">
                            Browse Jobs <ArrowRight size={20} />
                        </Link>
                    </div>
                )}
            </div>
        </div >
    )
}

export default Applications
