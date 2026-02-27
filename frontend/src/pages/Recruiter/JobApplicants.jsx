import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Users,
    Mail,
    FileText,
    CheckCircle,
    XCircle,
    Clock,
    ChevronLeft,
    Loader2,
    Download,
    MoreHorizontal,
    Briefcase,
    ExternalLink,
    X,
    MapPin,
    Github,
    Linkedin,
    Globe,
    Calendar,
    Sparkles,
    Brain,
    AlertCircle,
    TrendingUp,
    MessageCircle
} from 'lucide-react'
import axios from 'axios'
import axiosClient from '../../api/axiosClient'
import { toast } from 'react-toastify'


const JobApplicants = () => {
    const navigate = useNavigate()
    const { jobId } = useParams()
    const [applicants, setApplicants] = useState([])
    const [loading, setLoading] = useState(true)
    const [jobDetails, setJobDetails] = useState(null)
    const [updating, setUpdating] = useState(null)
    const [selectedCandidate, setSelectedCandidate] = useState(null)
    const [imagePreview, setImagePreview] = useState(null)
    const [isScreening, setIsScreening] = useState(false)
    const [screeningProgress, setScreeningProgress] = useState({ current: 0, total: 0 })

    // Scheduling Modal State
    const [showScheduleModal, setShowScheduleModal] = useState(false)
    const [schedulingAppId, setSchedulingAppId] = useState(null)
    const [interviewForm, setInterviewForm] = useState({
        date: '',
        time: '',
        link: '',
        notes: ''
    })

    useEffect(() => {
        fetchApplicants()
        fetchJobDetails()
    }, [jobId])

    const fetchJobDetails = async () => {
        try {
            const res = await axiosClient.get(`jobs/${jobId}`)
            setJobDetails(res)
        } catch (err) {
            console.error(err)
        }
    }

    const fetchApplicants = async () => {
        try {
            const res = await axiosClient.get(`jobs/applicants/${jobId}`)
            setApplicants(res)
            // After loading, auto-scan any unscanned OR previously-failed candidates in the background
            const needsScan = Array.isArray(res) ? res.filter(app => app.aiMatchScore == null || app.aiMatchScore === -1) : []
            if (needsScan.length > 0) {
                autoScanPending(needsScan, { forceRescan: false, autoClassify: true })
            }
        } catch (err) {
            console.error(err)
            toast.error('Failed to load applicants')
        } finally {
            setLoading(false)
        }
    }

    // Silently scan all unscanned applicants in background (no button needed)
    const autoScanPending = async (pendingApps, options = {}) => {
        const { forceRescan = false, autoClassify = false } = options;

        // Run all scans concurrently using Promise.allSettled to prevent one failure from blocking others
        await Promise.allSettled(pendingApps.map(async (app) => {
            try {
                const res = await axiosClient.post(`/jobs/application/${app._id}/scan`, {
                    forceRescan,
                    autoClassify
                });

                if (res.analysis || res.aiMatchScore != null) {
                    const score = res.aiMatchScore ?? res.analysis?.ats_score ?? res.analysis?.matchPercentage ?? 0
                    setApplicants(prev => prev.map(a =>
                        a._id === app._id ? {
                            ...a,
                            aiMatchScore: score,
                            aiAnalysis: res.analysis || a.aiAnalysis,
                            status: res.applicationStatus || a.status
                        } : a
                    ))
                }
            } catch (err) {
                // Scan failed for this candidate (e.g. dead resume URL)
                console.warn(`[AutoScan] Could not scan ${app._id}:`, err?.response?.data?.message || err.message)

                if (app.aiMatchScore == null) {
                    setApplicants(prev => prev.map(a =>
                        a._id === app._id ? {
                            ...a,
                            aiMatchScore: -1 // Use -1 as a special flag for "Failed / Unscannable"
                        } : a
                    ))
                }
            }
        }));
    }

    const handleStatusUpdate = async (appId, newStatus) => {
        if (newStatus === 'interview') {
            setSchedulingAppId(appId)
            const app = applicants.find(a => a._id === appId)
            if (app && app.interviewDate) {
                setInterviewForm({
                    date: app.interviewDate,
                    time: app.interviewTime || '',
                    link: app.meetingLink || '',
                    notes: app.interviewNotes || ''
                })
            } else {
                setInterviewForm({ date: '', time: '', link: '', notes: '' })
            }
            setShowScheduleModal(true)
            return
        }

        setUpdating(appId)
        try {
            await axiosClient.patch(`jobs/application/${appId}/status`, { status: newStatus })
            setApplicants(prev => prev.map(app =>
                app._id === appId ? { ...app, status: newStatus } : app
            ))
            toast.success(`Applicant marked as ${newStatus}`)
        } catch (err) {
            toast.error('Failed to update status')
        } finally {
            setUpdating(null)
        }
    }

    const handleScheduleSubmit = async (e) => {
        e.preventDefault()
        setUpdating(schedulingAppId)
        try {
            await axiosClient.patch(`jobs/application/${schedulingAppId}/status`, {
                status: 'interview',
                interviewDate: interviewForm.date,
                interviewTime: interviewForm.time,
                meetingLink: interviewForm.link,
                interviewNotes: interviewForm.notes
            })

            setApplicants(prev => prev.map(app =>
                app._id === schedulingAppId ? {
                    ...app,
                    status: 'interview',
                    interviewDate: interviewForm.date,
                    interviewTime: interviewForm.time,
                    meetingLink: interviewForm.link,
                    interviewNotes: interviewForm.notes
                } : app
            ))

            toast.success('Interview scheduled and email sent!')
            setShowScheduleModal(false)
            setInterviewForm({ date: '', time: '', link: '', notes: '' })
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to schedule interview')
        } finally {
            setUpdating(null)
            setSchedulingAppId(null)
        }
    }

    const messageApplicant = async (e, applicantUserId) => {
        e.stopPropagation() // prevent opening the detail modal
        try {
            const res = await axiosClient.post('/chat', { participantId: applicantUserId })
            if (res && (res._id || res.conversation?._id)) {
                navigate('/recruiter/chat', { state: { activeChatId: res._id || res.conversation?._id } })
            }
        } catch (err) {
            toast.error('Could not open chat')
        }
    }

    const handleGeminiScan = async (e, appId, options = { forceRescan: true, autoClassify: true }) => {
        e.stopPropagation()
        setUpdating(appId)
        try {
            const res = await axiosClient.post(`/jobs/application/${appId}/scan`, options)
            if (res.analysis || res.aiMatchScore != null) {
                const score = res.aiMatchScore ?? res.analysis?.ats_score ?? res.analysis?.matchPercentage ?? 0
                setApplicants(prev => prev.map(app =>
                    app._id === appId ? {
                        ...app,
                        aiMatchScore: score,
                        aiAnalysis: res.analysis || app.aiAnalysis,
                        status: res.applicationStatus || app.status
                    } : app
                ))
                if (res.applicationStatus === 'interview' && res.applicationStatus !== applicants.find(a => a._id === appId)?.status) {
                    toast.success('Candidate automatically shortlisted for interview based on AI score!')
                } else {
                    toast.success('AI Scan Completed')
                }
            }
        } catch (err) {
            console.error(err)
            toast.error(err.response?.data?.message || 'AI scan failed')
        } finally {
            setUpdating(null)
        }
    }

    const handleScanAll = async () => {
        const unscanned = applicants.filter(app => !app.aiMatchScore)
        if (unscanned.length === 0) {
            toast.info('All candidates have already been scanned!')
            return
        }
        setIsScreening(true)
        setScreeningProgress({ current: 0, total: unscanned.length })
        let shortlistedCount = 0
        let rejectedCount = 0
        let failedCount = 0

        for (let i = 0; i < unscanned.length; i++) {
            const app = unscanned[i]
            setScreeningProgress({ current: i + 1, total: unscanned.length })
            try {
                const res = await axiosClient.post(`/jobs/application/${app._id}/scan`)
                if (res.analysis) {
                    setApplicants(prev => prev.map(a =>
                        a._id === app._id ? {
                            ...a,
                            aiMatchScore: res.analysis.ats_score ?? res.analysis.matchPercentage ?? 0,
                            aiAnalysis: res.analysis,
                            status: res.applicationStatus || a.status
                        } : a
                    ))
                    if (res.applicationStatus === 'shortlisted') shortlistedCount++
                    else if (res.applicationStatus === 'rejected') rejectedCount++
                }
            } catch (err) {
                console.error(`[ScanAll] Failed for ${app._id}:`, err?.response?.data?.message || err)
                failedCount++
            }
        }

        setIsScreening(false)
        setScreeningProgress({ current: 0, total: 0 })
        toast.success(`✅ Scan complete! Shortlisted: ${shortlistedCount} | Rejected: ${rejectedCount}${failedCount > 0 ? ` | Failed: ${failedCount}` : ''}`)
    }


    const getStatusColor = (status) => {
        switch (status) {
            case 'applied': return 'bg-blue-500/10 text-blue-400 border-blue-500/20'
            case 'viewed': return 'bg-purple-500/10 text-purple-400 border-purple-500/20'
            case 'screening': return 'bg-amber-500/10 text-amber-400 border-amber-500/20'
            case 'interview': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
            case 'offer': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
            case 'rejected': return 'bg-red-600 text-white border-red-500 font-black shadow-lg shadow-red-900/20'
            default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20'
        }
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white pb-20">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

                {/* Header */}
                <div className="mb-8">
                    <Link to="/recruiter/my-jobs" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors">
                        <ChevronLeft size={20} /> Back to My Postings
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-3">
                                Applicants for <span className="text-blue-400">{jobDetails?.title || 'Job'}</span>
                            </h1>
                            <p className="text-slate-400 mt-1 flex items-center gap-4">
                                <span className="flex items-center gap-1.5"><Briefcase size={16} /> {jobDetails?.type}</span>
                                <span className="flex items-center gap-1.5"><Calendar size={16} /> Posted {new Date(jobDetails?.createdAt).toLocaleDateString()}</span>
                            </p>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="bg-slate-800 px-6 py-3 rounded-xl border border-slate-700">
                                <span className="text-slate-400 text-sm">Total Applications</span>
                                <p className="text-2xl font-bold text-white">{applicants.length}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Applicants List */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-blue-500" size={40} />
                    </div>
                ) : applicants.length === 0 ? (
                    <div className="bg-slate-800/30 border border-dashed border-slate-700 rounded-3xl p-20 text-center">
                        <Users size={48} className="text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2">No applicants yet</h3>
                        <p className="text-slate-400">Your job posting hasn't received any applications yet.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        <AnimatePresence>
                            {applicants.map((app, idx) => (
                                <motion.div
                                    key={app._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => setSelectedCandidate(app)}
                                    className={`bg-slate-800/40 backdrop-blur-sm border rounded-2xl p-6 transition-all group cursor-pointer relative overflow-hidden ${selectedCandidate?._id === app._id
                                        ? 'border-blue-500/50 bg-blue-500/5'
                                        : 'border-slate-700/50 hover:border-slate-600'
                                        } ${app.aiMatchScore >= 85 ? 'ring-1 ring-green-500/30' : ''}`}
                                >
                                    {app.aiMatchScore >= 85 && (
                                        <div className="absolute top-0 right-0 px-3 py-1 bg-green-500 text-white text-[10px] font-black uppercase tracking-widest rounded-bl-xl shadow-lg flex items-center gap-1.5 z-10">
                                            <TrendingUp size={12} /> Preferred Match
                                        </div>
                                    )}
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

                                        {/* Candidate Info */}
                                        <div className="flex items-start gap-4">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-2xl font-bold text-white border border-slate-600 shadow-lg">
                                                {app.user?.photoUrl ? (
                                                    <img src={app.user.photoUrl} alt="" className="w-full h-full rounded-2xl object-cover" />
                                                ) : (
                                                    app.user?.firstName?.charAt(0)
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                                    {app.user?.firstName} {app.user?.lastName}
                                                </h3>
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-slate-400 text-sm mt-1">
                                                    <a href={`mailto:${app.user?.email}`} className="flex items-center gap-1.5 hover:text-blue-400 transition-colors">
                                                        <Mail size={14} /> {app.user?.email}
                                                    </a>
                                                    <span className="flex items-center gap-1.5">
                                                        <Clock size={14} /> Applied {new Date(app.createdAt).toLocaleDateString()}
                                                    </span>
                                                    {app.user?.experienceLevel && (
                                                        <span className="px-2.5 py-0.5 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-bold capitalize">
                                                            {app.user.experienceLevel === 'mid' ? 'Mid Level' : app.user.experienceLevel === 'entry' ? 'Entry Level' : app.user.experienceLevel === 'senior' ? 'Senior Level' : app.user.experienceLevel}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* AI Score */}
                                        <div className="flex flex-col items-center gap-2">
                                            {app.aiMatchScore === -1 ? (
                                                <div className="w-16 h-16 rounded-full border-2 border-dashed border-red-500/50 flex flex-col items-center justify-center text-red-400 gap-1 bg-red-500/5">
                                                    <XCircle size={16} />
                                                    <span className="text-[7px] font-bold uppercase text-center leading-tight">Unscannable<br />Resume</span>
                                                </div>
                                            ) : app.aiMatchScore != null ? (
                                                <div className="relative w-16 h-16 flex items-center justify-center shrink-0">
                                                    <svg className="w-full h-full transform -rotate-90">
                                                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" className="text-slate-700" />
                                                        <circle cx="32" cy="32" r="28" stroke="currentColor" strokeWidth="4" fill="transparent" strokeDasharray={175.8} strokeDashoffset={175.8 - (175.8 * app.aiMatchScore) / 100} strokeLinecap="round"
                                                            className={app.aiMatchScore >= 80 ? 'text-green-500' : app.aiMatchScore >= 60 ? 'text-blue-500' : 'text-amber-500'}
                                                        />
                                                    </svg>
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                                        <span className="text-sm font-black text-white">{app.aiMatchScore}%</span>
                                                        <span className="text-[7px] text-slate-500 uppercase font-black">ATS</span>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="w-16 h-16 rounded-full border-2 border-dashed border-slate-700 flex flex-col items-center justify-center text-slate-600 gap-1 group-hover:border-blue-500/30 transition-colors">
                                                    <Brain size={16} />
                                                    <span className="text-[8px] font-bold uppercase">Pending</span>
                                                </div>
                                            )}
                                        </div>

                                        {/* Actions */}
                                        <div className="flex flex-col sm:flex-row items-center gap-3">
                                            <button
                                                onClick={(e) => messageApplicant(e, app.user?._id)}
                                                className="px-4 py-2 bg-violet-600/20 hover:bg-violet-600/40 text-violet-300 hover:text-violet-200 rounded-lg text-sm font-medium transition-all flex items-center gap-2 border border-violet-500/30"
                                                title="Message this applicant"
                                            >
                                                <MessageCircle size={16} /> Message
                                            </button>
                                            {app.aiMatchScore === -1 ? (
                                                <button
                                                    onClick={(e) => handleGeminiScan(e, app._id)}
                                                    disabled={updating === app._id}
                                                    className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 border border-red-500/20 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors disabled:opacity-50"
                                                    title="Resume could not be scanned. Click to try again."
                                                >
                                                    {updating === app._id ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />} Retry Scan
                                                </button>
                                            ) : app.aiMatchScore != null ? (
                                                <button
                                                    onClick={(e) => handleGeminiScan(e, app._id)}
                                                    disabled={updating === app._id}
                                                    className="px-4 py-2 bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 border border-emerald-500/30 rounded-lg text-sm font-medium transition-all flex items-center gap-2 disabled:opacity-50"
                                                >
                                                    {updating === app._id ? <Loader2 size={16} className="animate-spin" /> : <Sparkles size={16} />}
                                                    Rescan
                                                </button>
                                            ) : (
                                                <span className="px-3 py-1.5 bg-slate-700/50 border border-slate-600/50 text-slate-500 rounded-lg text-xs font-semibold flex items-center gap-1.5" title="Auto-scanned when candidate applied">
                                                    <Brain size={13} /> Auto-Scanned
                                                </span>
                                            )}
                                            {app.resumeUrl && (
                                                <a
                                                    href={app.resumeUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="px-4 py-2 bg-slate-700/50 hover:bg-slate-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2 border border-slate-600/50"
                                                >
                                                    <FileText size={16} /> Resume
                                                </a>
                                            )}

                                            <div className="relative group/status">
                                                <button className={`px-4 py-2 rounded-lg text-sm font-bold border flex items-center gap-2 capitalize ${getStatusColor(app.status)}`}>
                                                    {app.status}
                                                </button>

                                                {/* Status Dropdown */}
                                                <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden hidden group-hover/status:block z-10">
                                                    {['shortlisted', 'screening', 'interview', 'scheduled', 'offer', 'rejected'].map(status => (
                                                        <button
                                                            key={status}
                                                            onClick={() => handleStatusUpdate(app._id, status)}
                                                            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-700 transition-colors capitalize ${app.status === status ? 'text-blue-400 font-bold bg-slate-700/50' : 'text-slate-300'}`}
                                                        >
                                                            {status}
                                                        </button>
                                                    ))}
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {/* Schedule Interview Modal */}
                        <AnimatePresence>
                            {showScheduleModal && (
                                <motion.div
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-950/90 backdrop-blur-xl"
                                >
                                    <motion.div
                                        initial={{ scale: 0.9, y: 20 }}
                                        animate={{ scale: 1, y: 0 }}
                                        exit={{ scale: 0.9, y: 20 }}
                                        className="bg-slate-900 border border-slate-700 w-full max-w-lg rounded-3xl shadow-2xl p-8"
                                    >
                                        <div className="flex justify-between items-center mb-6">
                                            <h2 className="text-2xl font-bold flex items-center gap-2">
                                                <Calendar className="text-blue-500" /> Schedule Interview
                                            </h2>
                                            <button onClick={() => setShowScheduleModal(false)} className="text-slate-500 hover:text-white">
                                                <X size={24} />
                                            </button>
                                        </div>

                                        <form onSubmit={handleScheduleSubmit} className="space-y-5">
                                            <div className="grid grid-cols-2 gap-4">
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Date</label>
                                                    <input
                                                        type="date"
                                                        required
                                                        value={interviewForm.date}
                                                        onChange={e => setInterviewForm({ ...interviewForm, date: e.target.value })}
                                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all"
                                                    />
                                                </div>
                                                <div className="space-y-1.5">
                                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Time</label>
                                                    <input
                                                        type="time"
                                                        required
                                                        value={interviewForm.time}
                                                        onChange={e => setInterviewForm({ ...interviewForm, time: e.target.value })}
                                                        className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all"
                                                    />
                                                </div>
                                            </div>

                                            <div className="space-y-1.5">
                                                <div className="flex justify-between items-center pl-1">
                                                    <label className="text-xs font-black text-slate-500 uppercase tracking-widest">Meeting Link</label>
                                                    <button
                                                        type="button"
                                                        onClick={() => setInterviewForm({ ...interviewForm, link: `${window.location.origin}/interview/${schedulingAppId}` })}
                                                        className="text-[10px] font-black text-blue-500 hover:text-blue-400 transition-colors uppercase"
                                                    >
                                                        ✨ Generate Internal
                                                    </button>
                                                </div>
                                                <input
                                                    type="text"
                                                    placeholder="Paste your Google Meet/Zoom link here..."
                                                    value={interviewForm.link}
                                                    onChange={e => setInterviewForm({ ...interviewForm, link: e.target.value })}
                                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all"
                                                />
                                                <p className="text-[10px] text-slate-500 mt-1 pl-1 italic">
                                                    Paste any link or click generate to use our built-in video room.
                                                </p>
                                            </div>

                                            <div className="space-y-1.5">
                                                <label className="text-xs font-black text-slate-500 uppercase tracking-widest pl-1">Interview Instructions</label>
                                                <textarea
                                                    placeholder="Agenda or prep details for the candidate..."
                                                    rows={3}
                                                    value={interviewForm.notes}
                                                    onChange={e => setInterviewForm({ ...interviewForm, notes: e.target.value })}
                                                    className="w-full bg-slate-800 border border-slate-700 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none transition-all resize-none"
                                                />
                                            </div>

                                            <div className="pt-4 flex gap-3">
                                                <button
                                                    type="button"
                                                    onClick={() => setShowScheduleModal(false)}
                                                    className="flex-1 py-4 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-2xl font-bold transition-all"
                                                >
                                                    Cancel
                                                </button>
                                                <button
                                                    type="submit"
                                                    disabled={updating}
                                                    className="flex-3 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold transition-all shadow-lg shadow-blue-900/20 flex items-center justify-center gap-2"
                                                >
                                                    {updating ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                                                    Schedule & Send Invite
                                                </button>
                                            </div>
                                        </form>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                )}
            </div>

            {/* Candidate Detail Modal */}
            <AnimatePresence>
                {selectedCandidate && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md"
                        onClick={() => setSelectedCandidate(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[90vh] overflow-y-auto rounded-3xl shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="flex gap-6">
                                        <div
                                            onClick={() => selectedCandidate.user?.photoUrl && setImagePreview(selectedCandidate.user.photoUrl)}
                                            className={`w-24 h-24 rounded-3xl bg-blue-600 flex items-center justify-center text-4xl font-bold text-white shadow-lg overflow-hidden shrink-0 ${selectedCandidate.user?.photoUrl ? 'cursor-pointer hover:ring-4 hover:ring-blue-500/50 transition-all' : ''}`}
                                        >
                                            {selectedCandidate.user?.photoUrl ? (
                                                <img src={selectedCandidate.user.photoUrl} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                selectedCandidate.user?.firstName?.[0]
                                            )}
                                        </div>
                                        <div>
                                            <h2 className="text-3xl font-bold text-white">{selectedCandidate.user?.firstName} {selectedCandidate.user?.lastName}</h2>
                                            <p className="text-blue-400 font-medium mt-1">{selectedCandidate.job?.title || jobDetails?.title}</p>
                                            <div className="flex flex-wrap gap-4 mt-4 text-slate-400 text-sm">
                                                <div className="flex items-center gap-1.5"><Mail size={16} /> {selectedCandidate.user?.email}</div>
                                                <div className="flex items-center gap-1.5"><Clock size={16} /> Applied {new Date(selectedCandidate.createdAt).toLocaleDateString()}</div>
                                                {selectedCandidate.user?.experienceLevel && (
                                                    <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-full text-xs font-bold capitalize">
                                                        {selectedCandidate.user.experienceLevel === 'mid' ? 'Mid Level' : selectedCandidate.user.experienceLevel === 'entry' ? 'Entry Level' : selectedCandidate.user.experienceLevel === 'senior' ? 'Senior Level' : selectedCandidate.user.experienceLevel}
                                                    </span>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => setSelectedCandidate(null)}
                                        className="p-2 hover:bg-slate-800 rounded-lg text-slate-500 hover:text-white transition-colors"
                                    >
                                        <XCircle size={24} />
                                    </button>
                                </div>
                                {selectedCandidate.aiAnalysis && (
                                    <div className="mb-10 p-6 bg-slate-800/30 rounded-3xl border border-blue-500/20 shadow-xl relative overflow-hidden group">
                                        <div className="absolute top-0 right-0 p-4">
                                            <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest border shadow-lg ${['Strong Match', 'Good Match'].includes(selectedCandidate.aiAnalysis.decision) ? 'bg-green-500 text-white border-green-400' : selectedCandidate.aiAnalysis.decision === 'Average Match' ? 'bg-amber-500 text-white border-amber-400' : 'bg-red-500 text-white border-red-400'}`}>
                                                {selectedCandidate.aiAnalysis.decision}
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-10 h-10 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                                                <Brain size={20} />
                                            </div>
                                            <div>
                                                <h3 className="text-lg font-bold text-white">Smart Candidate Analysis</h3>
                                                <p className="text-xs text-slate-500">Intelligent background & skill verification</p>
                                            </div>
                                        </div>

                                        <div className="md:col-span-2">
                                            <p className="text-slate-300 text-sm leading-relaxed italic relative">
                                                <span className="text-4xl text-blue-500/20 absolute -top-4 -left-2 font-serif">"</span>
                                                {selectedCandidate.aiAnalysis.summary}
                                                <span className="text-4xl text-blue-500/20 absolute -bottom-8 font-serif">"</span>
                                            </p>
                                            <div className="mt-8 flex items-center gap-6">
                                                <div className="text-center">
                                                    <p className="text-4xl font-black text-blue-400">{selectedCandidate.aiMatchScore}%</p>
                                                    <p className="text-[10px] text-slate-500 uppercase font-black">Overall Match Score</p>
                                                </div>
                                                <div className="flex-1 h-3 bg-slate-700/50 rounded-full overflow-hidden p-0.5">
                                                    <div
                                                        className={`h-full rounded-full transition-all duration-1000 ${selectedCandidate.aiMatchScore >= 80 ? 'bg-green-500 shadow-[0_0_10px_rgba(34,197,94,0.5)]' : selectedCandidate.aiMatchScore >= 60 ? 'bg-blue-500' : 'bg-amber-500'}`}
                                                        style={{ width: `${selectedCandidate.aiMatchScore}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="grid md:grid-cols-2 gap-12">
                                    <div className="space-y-8">
                                        <section>
                                            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">About Candidate</h3>
                                            <p className="text-slate-400 leading-relaxed text-sm">
                                                {selectedCandidate.user?.aboutMe || 'No bio provided.'}
                                            </p>
                                        </section>

                                        <section>
                                            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Contact Details</h3>
                                            <div className="space-y-3 text-sm">
                                                <div className="flex items-center gap-3 text-slate-300">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-blue-400">
                                                        <Mail size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-500">Email Address</p>
                                                        <a href={`mailto:${selectedCandidate.user?.email}`} className="hover:text-white transition-colors">
                                                            {selectedCandidate.user?.email}
                                                        </a>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 text-slate-300">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-blue-400">
                                                        <span className="text-xs font-bold">Ph</span>
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-500">Phone Number</p>
                                                        <p>{selectedCandidate.user?.phoneNumber || 'Not provided'}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-3 text-slate-300">
                                                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-blue-400">
                                                        <MapPin size={16} />
                                                    </div>
                                                    <div>
                                                        <p className="text-xs text-slate-500">Location</p>
                                                        <p>{selectedCandidate.user?.location || 'Remote / Not specified'}</p>
                                                    </div>
                                                </div>
                                            </div>
                                        </section>

                                        <section>
                                            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Key Skills</h3>
                                            <div className="flex flex-wrap gap-2 text-xs">
                                                {(selectedCandidate.user?.primarySkill || '').split(',').map((skill, i) => (
                                                    <span key={i} className="px-3 py-1.5 bg-slate-800 text-slate-300 rounded-lg border border-slate-700">
                                                        {skill.trim()}
                                                    </span>
                                                ))}
                                                {!selectedCandidate.user?.primarySkill && <span className="text-slate-500 italic">No skills listed</span>}
                                            </div>
                                        </section>
                                    </div>

                                    <div className="space-y-8">
                                        <section>
                                            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Education Breakdown</h3>
                                            <div className="space-y-4">
                                                {(() => {
                                                    // Find education entries by level
                                                    const degree = selectedCandidate.user?.education?.find(edu => edu.level === 'Graduation' || edu.level === 'Post-Graduation');
                                                    const twelfth = selectedCandidate.user?.education?.find(edu => edu.level === '12th' || edu.level === 'Diploma');
                                                    const tenth = selectedCandidate.user?.education?.find(edu => edu.level === '10th');

                                                    return (
                                                        <>
                                                            <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 text-sm">
                                                                <p className="text-slate-500 mb-1">Degree / Graduation</p>
                                                                <p className="text-white font-bold">{degree?.degreeName || 'N/A'}</p>
                                                                <p className="text-xs text-slate-500 mt-1">{degree?.collegeName || degree?.institutionName}</p>
                                                                {degree?.score && (
                                                                    <p className="text-xs text-blue-400 mt-1 font-medium">Score: {degree.score}</p>
                                                                )}
                                                            </div>
                                                            <div className="grid grid-cols-2 gap-4">
                                                                <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 text-sm">
                                                                    <p className="text-slate-500 mb-1 font-medium">12th / Diploma</p>
                                                                    <p className="text-white font-bold">{twelfth?.schoolOrCollegeName || twelfth?.institutionName || 'N/A'}</p>
                                                                    <p className="text-xs text-blue-400 mt-1">Score: {twelfth?.score || 'N/A'}</p>
                                                                </div>
                                                                <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 text-sm">
                                                                    <p className="text-slate-500 mb-1 font-medium">10th Standard</p>
                                                                    <p className="text-white font-bold">{tenth?.schoolName || tenth?.institutionName || 'N/A'}</p>
                                                                    <p className="text-xs text-blue-400 mt-1">Score: {tenth?.score || 'N/A'}</p>
                                                                </div>
                                                            </div>
                                                        </>
                                                    );
                                                })()}
                                            </div>
                                        </section>

                                        <section>
                                            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4 border-b border-slate-800 pb-2">Social & Professional Links</h3>
                                            <div className="grid grid-cols-2 gap-3">
                                                {selectedCandidate.user?.githubUrl && (
                                                    <a href={selectedCandidate.user.githubUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-3 bg-slate-800 rounded-xl text-xs text-slate-300 hover:text-white border border-slate-700 hover:border-slate-500 transition-all">
                                                        <Github size={16} /> GitHub
                                                    </a>
                                                )}
                                                {selectedCandidate.user?.linkedInUrl && (
                                                    <a href={selectedCandidate.user.linkedInUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-3 bg-blue-600/10 rounded-xl text-xs text-blue-400 hover:text-white border border-blue-500/20 hover:border-blue-400 transition-all">
                                                        <Linkedin size={16} /> LinkedIn
                                                    </a>
                                                )}
                                                {selectedCandidate.user?.portfolioUrl && (
                                                    <a href={selectedCandidate.user.portfolioUrl} target="_blank" rel="noreferrer" className="flex items-center gap-2 p-3 bg-purple-600/10 rounded-xl text-xs text-purple-400 hover:text-white border border-purple-500/20 hover:border-purple-400 transition-all">
                                                        <Globe size={16} /> Portfolio
                                                    </a>
                                                )}
                                            </div>
                                            {(!selectedCandidate.user?.githubUrl && !selectedCandidate.user?.linkedInUrl && !selectedCandidate.user?.portfolioUrl) && (
                                                <p className="text-slate-500 italic text-sm">No social links provided.</p>
                                            )}
                                        </section>

                                        <div className="flex flex-col gap-4">
                                            {/* Post-Interview Quick Actions */}
                                            {['interview', 'scheduled', 'screening'].includes(selectedCandidate.status) && (
                                                <div className="bg-slate-800/50 p-6 rounded-2xl border border-blue-500/20 mb-4">
                                                    <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                                        <TrendingUp size={16} className="text-blue-400" /> Final Decision
                                                    </h4>
                                                    <div className="flex gap-4">
                                                        <button
                                                            onClick={() => {
                                                                if (window.confirm(`Are you sure you want to HIRE ${selectedCandidate.user?.firstName}? This will send a congratulatory selection email.`)) {
                                                                    handleStatusUpdate(selectedCandidate._id, 'hired');
                                                                    setSelectedCandidate(prev => ({ ...prev, status: 'hired' }));
                                                                }
                                                            }}
                                                            disabled={updating === selectedCandidate._id}
                                                            className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20 disabled:opacity-50"
                                                        >
                                                            {updating === selectedCandidate._id ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
                                                            Hire Candidate
                                                        </button>
                                                        <button
                                                            onClick={() => {
                                                                if (window.confirm(`Are you sure you want to REJECT ${selectedCandidate.user?.firstName}? This will send a rejection email.`)) {
                                                                    handleStatusUpdate(selectedCandidate._id, 'rejected');
                                                                    setSelectedCandidate(prev => ({ ...prev, status: 'rejected' }));
                                                                }
                                                            }}
                                                            disabled={updating === selectedCandidate._id}
                                                            className="flex-1 bg-red-600/20 hover:bg-red-600/40 text-red-400 border border-red-500/30 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                                                        >
                                                            {updating === selectedCandidate._id ? <Loader2 size={18} className="animate-spin" /> : <XCircle size={18} />}
                                                            Reject
                                                        </button>
                                                    </div>
                                                </div>
                                            )}

                                            {selectedCandidate.user?.resumeUrl && (
                                                <a
                                                    href={selectedCandidate.user.resumeUrl}
                                                    target="_blank"
                                                    rel="noopener noreferrer"
                                                    className="flex-1 flex items-center justify-center gap-2 py-4 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold transition-all border border-slate-600"
                                                >
                                                    <Download size={18} /> View Resume
                                                </a>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Image Preview Modal */}
            <AnimatePresence>
                {imagePreview && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/90 backdrop-blur-sm"
                        onClick={() => setImagePreview(null)}
                    >
                        <motion.img
                            initial={{ scale: 0.8 }}
                            animate={{ scale: 1 }}
                            exit={{ scale: 0.8 }}
                            src={imagePreview}
                            alt="Profile Preview"
                            className="max-w-full max-h-[90vh] rounded-2xl shadow-2xl"
                            onClick={e => e.stopPropagation()}
                        />
                        <button
                            onClick={() => setImagePreview(null)}
                            className="absolute top-4 right-4 p-3 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                        >
                            <X size={24} />
                        </button>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default JobApplicants
