import React, { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import RecruiterLayout from '../../components/RecruiterLayout'
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
    MessageCircle,
    Video,
    Send
} from 'lucide-react'
import axiosClient from '../../api/axiosClient'
import { toast } from 'react-toastify'
import ResumeViewerModal from '../../components/ResumeViewerModal'
import DateTimePicker from '../../components/Calendar/DateTimePicker'

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

    const [showResumeModal, setShowResumeModal] = useState(false)
    const [resumeUrlToView, setResumeUrlToView] = useState(null)
    const [resumeUserName, setResumeUserName] = useState('')

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

    const autoScanPending = async (pendingApps, options = {}) => {
        const { forceRescan = false, autoClassify = false } = options;
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
                console.warn(`[AutoScan] Could not scan ${app._id}:`, err?.response?.data?.message || err.message)
                if (app.aiMatchScore == null) {
                    setApplicants(prev => prev.map(a =>
                        a._id === app._id ? {
                            ...a,
                            aiMatchScore: -1
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
        e.stopPropagation()
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
                toast.success('AI Scan Completed')
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'AI scan failed')
        } finally {
            setUpdating(null)
        }
    }

    const getStatusColor = (status) => {
        switch (status) {
            case 'applied': return 'bg-blue-50 text-blue-600 border-blue-100'
            case 'viewed': return 'bg-purple-50 text-purple-600 border-purple-100'
            case 'screening': return 'bg-amber-50 text-amber-600 border-amber-100'
            case 'interview': return 'bg-indigo-50 text-indigo-600 border-indigo-100 font-bold'
            case 'offer': return 'bg-emerald-50 text-emerald-600 border-emerald-100 font-bold'
            case 'rejected': return 'bg-red-50 text-red-600 border-red-100'
            default: return 'bg-slate-50 text-slate-600 border-slate-100'
        }
    }

    if (loading) {
        return (
            <RecruiterLayout>
                <div className="flex flex-col items-center justify-center h-[80vh] bg-white">
                    <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                    <p className="text-sm font-semibold text-gray-600">Loading applicants...</p>
                </div>
            </RecruiterLayout>
        )
    }

    return (
        <RecruiterLayout>
            <main className="p-4 sm:p-8 md:p-12 lg:p-16 max-w-7xl mx-auto bg-white min-h-full">
                {/* Header Section */}
                <div className="mb-12">
                    <Link to="/recruiter/jobs" className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-blue-600 mb-8 transition-all group">
                        <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
                        Back to Jobs
                    </Link>

                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                        <div>
                            <div className="flex items-center gap-4 mb-2">
                                <h1 className="text-3xl sm:text-4xl font-bold text-gray-900">
                                    Applicants
                                </h1>
                                <span className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-semibold">
                                    {applicants.length} Total
                                </span>
                            </div>
                            <p className="text-gray-600 text-base font-medium flex items-center gap-2">
                                For <span className="text-gray-900 font-semibold">{jobDetails?.title || 'Loading...'}</span>
                            </p>
                        </div>

                        <div className="flex items-center gap-6 bg-gray-50 border-2 border-gray-200 p-6 rounded-xl">
                            <div className="pr-6 border-r border-gray-300 text-center">
                                <p className="text-xs font-semibold text-gray-600 mb-1">Engaged</p>
                                <p className="text-2xl font-bold text-gray-900">
                                    {applicants.filter(a => a.status !== 'applied').length}
                                </p>
                            </div>
                            <div className="pl-6 text-center">
                                <p className="text-xs font-semibold text-gray-600 mb-1">New</p>
                                <p className="text-2xl font-bold text-blue-600">
                                    {applicants.filter(a => a.status === 'applied').length}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Applicants Grid */}
                {applicants.length === 0 ? (
                    <div className="bg-gray-50 border-2 border-gray-200 border-dashed rounded-2xl p-20 text-center">
                        <Users size={48} className="text-gray-300 mx-auto mb-6" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Applicants Yet</h3>
                        <p className="text-gray-600 font-medium text-sm">This job posting hasn't received any applications yet.</p>
                    </div>
                ) : (
                    <div className="grid gap-6">
                        <AnimatePresence>
                            {applicants.map((app, idx) => (
                                <motion.div
                                    key={app._id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    onClick={() => setSelectedCandidate(app)}
                                    className={`bg-white border-2 rounded-2xl p-6 sm:p-8 transition-all group cursor-pointer relative overflow-hidden hover:shadow-md ${selectedCandidate?._id === app._id ? 'border-blue-500 ring-2 ring-blue-200' : 'border-gray-200'
                                        }`}
                                >
                                    <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
                                        {/* Candidate Primary Info */}
                                        <div className="flex items-center gap-4">
                                            <div className="w-14 h-14 sm:w-16 sm:h-16 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-xl sm:text-2xl font-bold text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all overflow-hidden shrink-0">
                                                {app.user?.photoUrl ? (
                                                    <img src={app.user.photoUrl} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    app.user?.firstName?.charAt(0)
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                                    {app.user?.firstName} {app.user?.lastName}
                                                </h3>
                                                <div className="flex flex-wrap items-center gap-4">
                                                    <span className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                                                        <Mail size={12} className="text-gray-400" /> {app.user?.email}
                                                    </span>
                                                    <span className="flex items-center gap-1.5 text-xs font-medium text-gray-600">
                                                        <Clock size={12} className="text-gray-400" /> {new Date(app.createdAt).toLocaleDateString()}
                                                    </span>
                                                    {app.user?.experienceLevel && (
                                                        <span className="px-2.5 py-1 bg-gray-50 text-gray-700 border border-gray-200 rounded-lg text-xs font-semibold">
                                                            {app.user.experienceLevel}
                                                        </span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* ATS & Actions Section */}
                                        <div className="flex flex-wrap items-center gap-4 sm:gap-6 w-full lg:w-auto border-t lg:border-t-0 lg:border-l border-gray-100 pt-4 sm:pt-6 lg:pt-0 lg:pl-6">
                                            {/* AI Match Score */}
                                            <div className="text-center group/score pr-6 border-r border-gray-100">
                                                {app.aiMatchScore === -1 ? (
                                                    <div className="text-red-500 font-bold text-xl flex items-center gap-2">
                                                        <AlertCircle size={20} /> Error
                                                    </div>
                                                ) : app.aiMatchScore != null ? (
                                                    <div className="flex items-center gap-3">
                                                        <div>
                                                            <div className="text-3xl font-bold text-gray-900 group-hover/score:text-blue-600 transition-colors leading-none">
                                                                {app.aiMatchScore}%
                                                            </div>
                                                            <div className="text-xs font-semibold text-gray-500 mt-1">AI Match</div>
                                                        </div>
                                                        <div className="w-1.5 h-10 bg-gray-100 rounded-full overflow-hidden flex flex-col justify-end">
                                                            <motion.div
                                                                initial={{ height: 0 }}
                                                                animate={{ height: `${app.aiMatchScore}%` }}
                                                                className={`w-full rounded-full ${app.aiMatchScore >= 80 ? 'bg-green-500' : 'bg-blue-500'}`}
                                                            />
                                                        </div>
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-2 text-slate-300 font-black animate-pulse uppercase text-[10px] tracking-widest">
                                                        <Brain size={16} /> Scanning
                                                    </div>
                                                )}
                                            </div>

                                            {/* Interaction Controls */}
                                            <div className="flex items-center gap-3">
                                                <button
                                                    onClick={(e) => messageApplicant(e, app.user?._id)}
                                                    className="p-4 bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-700 border border-gray-200 rounded-2xl transition-all shadow-sm active:scale-95"
                                                    title="Direct Communication"
                                                >
                                                    <MessageCircle size={20} strokeWidth={2.5} />
                                                </button>

                                                {app.resumeUrl && (
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            setResumeUrlToView(app.resumeUrl)
                                                            setResumeUserName(app.user?.firstName || 'Candidate')
                                                            setShowResumeModal(true)
                                                        }}
                                                        className="p-4 bg-gray-100 hover:bg-blue-600 hover:text-white text-gray-700 border border-gray-200 rounded-2xl transition-all shadow-sm active:scale-95"
                                                        title="Credentials Check"
                                                    >
                                                        <FileText size={20} strokeWidth={2.5} />
                                                    </button>
                                                )}

                                                <div className="relative group/status ml-2">
                                                    <button
                                                        onClick={(e) => e.stopPropagation()}
                                                        className={`px-6 py-4 rounded-[1.25rem] text-[10px] font-black uppercase tracking-widest border shadow-sm transition-all flex items-center gap-3 ${getStatusColor(app.status)}`}
                                                    >
                                                        {app.status}
                                                        <MoreHorizontal size={14} strokeWidth={3} className="opacity-40" />
                                                    </button>

                                                    <div className="absolute right-0 mt-4 w-56 bg-white border border-slate-100 rounded-[1.5rem] shadow-[0_20px_40px_rgba(0,0,0,0.1)] overflow-hidden hidden group-hover/status:block z-[60] py-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                                        {['applied', 'shortlisted', 'screening', 'interview', 'offer', 'rejected'].map(status => (
                                                            <button
                                                                key={status}
                                                                onClick={(e) => {
                                                                    e.stopPropagation()
                                                                    handleStatusUpdate(app._id, status)
                                                                }}
                                                                className={`w-full text-left px-6 py-3 text-[10px] font-black uppercase tracking-widest transition-all ${app.status === status ? 'bg-slate-50 text-black' : 'text-slate-400 hover:text-black hover:bg-slate-50'
                                                                    }`}
                                                            >
                                                                {status}
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* AI Insight Peek */}
                                    {app.aiAnalysis && (
                                        <div className="mt-8 pt-8 border-t border-slate-50 flex items-center gap-4">
                                            <Sparkles size={14} className="text-yellow-400" />
                                            <p className="text-[11px] font-bold text-slate-400 line-clamp-1 italic tracking-tight">
                                                "{app.aiAnalysis?.summary?.slice(0, 120) || 'AI analysis in progress'}..."
                                            </p>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </main>

            {/* Resume Viewer Integration */}
            <ResumeViewerModal
                isOpen={showResumeModal}
                onClose={() => setShowResumeModal(false)}
                resumeUrl={resumeUrlToView}
                candidateName={resumeUserName}
            />

            {/* Candidate Insight Modal */}
            <AnimatePresence>
                {selectedCandidate && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[70] flex items-center justify-center p-4 lg:p-12 bg-white/95 backdrop-blur-2xl"
                        onClick={() => setSelectedCandidate(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.95, opacity: 0 }}
                            className="bg-white border border-slate-100 w-full max-w-6xl h-full lg:h-[85vh] overflow-y-auto rounded-[3.5rem] shadow-[0_40px_80px_rgba(0,0,0,0.1)] custom-scrollbar"
                            onClick={e => e.stopPropagation()}
                        >
                            <div className="p-10 lg:p-20">
                                <header className="flex flex-col lg:flex-row justify-between items-start gap-12 mb-20 pb-20 border-b border-slate-50">
                                    <div className="flex flex-col lg:flex-row gap-10 items-start lg:items-center">
                                        <div className="w-32 h-32 rounded-[2.5rem] bg-black flex items-center justify-center text-5xl font-black text-white shadow-2xl relative overflow-hidden">
                                            {selectedCandidate.user?.photoUrl ? (
                                                <img src={selectedCandidate.user.photoUrl} alt="" className="w-full h-full object-cover" />
                                            ) : (
                                                selectedCandidate.user?.firstName?.[0]
                                            )}
                                        </div>
                                        <div>
                                            <h2 className="text-6xl font-black text-black tracking-tighter mb-4">
                                                {selectedCandidate.user?.firstName} {selectedCandidate.user?.lastName}
                                            </h2>
                                            <div className="flex flex-wrap gap-8 text-slate-400">
                                                <span className="flex items-center gap-3 font-bold uppercase text-xs tracking-widest"><Mail className="text-blue-500" size={18} /> {selectedCandidate.user?.email}</span>
                                                <span className="flex items-center gap-3 font-bold uppercase text-xs tracking-widest"><MapPin className="text-purple-500" size={18} /> {selectedCandidate.user?.location || 'Remote'}</span>
                                                <span className="flex items-center gap-3 font-bold uppercase text-xs tracking-widest"><Briefcase className="text-emerald-500" size={18} /> {selectedCandidate.user?.experienceLevel} Tier</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4">
                                        <button
                                            onClick={() => setSelectedCandidate(null)}
                                            className="p-6 bg-gray-100 hover:bg-gray-200 rounded-[2rem] transition-all group"
                                        >
                                            <X size={24} strokeWidth={3} className="group-hover:rotate-90 transition-transform" />
                                        </button>
                                    </div>
                                </header>

                                <div className="grid grid-cols-1 lg:grid-cols-12 gap-20">
                                    <div className="lg:col-span-8 space-y-20">
                                        {/* AI Executive Summary */}
                                        {selectedCandidate.aiAnalysis && (
                                            <section className="bg-slate-50 border border-slate-100 rounded-[3.5rem] p-12 lg:p-16 relative overflow-hidden">
                                                <div className="flex items-center gap-4 mb-10">
                                                    <div className="p-4 bg-yellow-400 rounded-2xl shadow-lg shadow-yellow-400/20">
                                                        <Brain className="text-white" size={24} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-1 leading-none">Intelligence Report</h4>
                                                        <p className="text-2xl font-black text-black">Talent Analysis</p>
                                                    </div>
                                                </div>

                                                <p className="text-2xl lg:text-3xl font-bold text-slate-700 leading-tight tracking-tight mb-12">
                                                    "{selectedCandidate.aiAnalysis.summary}"
                                                </p>

                                                <div className="grid grid-cols-2 lg:grid-cols-3 gap-10">
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Match Confidence</p>
                                                        <p className="text-5xl font-black text-black tracking-tighter">{selectedCandidate.aiMatchScore}%</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">AI Verdict</p>
                                                        <p className="text-2xl font-black text-blue-600 uppercase tracking-tight">{selectedCandidate.aiAnalysis.decision}</p>
                                                    </div>
                                                </div>

                                                <div className="absolute top-0 right-0 p-12 opacity-[0.03] pointer-events-none">
                                                    <Sparkles size={200} />
                                                </div>
                                            </section>
                                        )}

                                        <section>
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-10 pb-4 border-b border-slate-50">Professional Bio</h3>
                                            <p className="text-2xl font-bold text-slate-600 leading-relaxed group-hover:text-black transition-colors">
                                                {selectedCandidate.user?.aboutMe || 'The candidate has not provided an executive summary.'}
                                            </p>
                                        </section>

                                        <section>
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 mb-10 pb-4 border-b border-slate-50">Technical Arsenal</h3>
                                            <div className="flex flex-wrap gap-4">
                                                {(selectedCandidate.user?.primarySkill || '').split(',').map((skill, i) => (
                                                    <span key={i} className="px-8 py-4 bg-white border-2 border-slate-100 rounded-2xl text-xs font-black uppercase tracking-widest hover:border-black transition-all cursor-default">
                                                        {skill.trim()}
                                                    </span>
                                                ))}
                                            </div>
                                        </section>
                                    </div>

                                    <aside className="lg:col-span-4 space-y-16">
                                        <section>
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8 pb-4 border-b border-slate-50">Decision Metrics</h3>
                                            <div className="space-y-8">
                                                <div className="bg-slate-50 p-8 rounded-[2.5rem] border border-slate-100">
                                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-6">Education Validation</p>
                                                    <div className="space-y-6">
                                                        {Array.isArray(selectedCandidate.user?.education) && selectedCandidate.user.education.slice(0, 2).map((edu, idx) => (
                                                            <div key={idx} className="relative pl-6 border-l-2 border-slate-200">
                                                                <p className="text-sm font-black text-black leading-tight mb-1">{edu.degreeName || edu.level}</p>
                                                                <p className="text-[10px] font-bold text-slate-400 uppercase">{edu.collegeName || edu.schoolName}</p>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>
                                        </section>

                                        <section>
                                            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-8 pb-4 border-b border-slate-50">Network Status</h3>
                                            <div className="grid gap-4">
                                                {selectedCandidate.user?.linkedInUrl && (
                                                    <a href={selectedCandidate.user.linkedInUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between p-6 bg-blue-50 text-blue-600 rounded-3xl border border-blue-100 hover:bg-blue-600 hover:text-white transition-all group/link font-black text-[10px] uppercase tracking-widest">
                                                        LinkedIn Identity <ExternalLink size={16} />
                                                    </a>
                                                )}
                                                {selectedCandidate.user?.githubUrl && (
                                                    <a href={selectedCandidate.user.githubUrl} target="_blank" rel="noreferrer" className="flex items-center justify-between p-6 bg-gray-100 text-gray-700 rounded-3xl border border-gray-200 hover:bg-blue-600 hover:text-white transition-all group/link font-black text-[10px] uppercase tracking-widest">
                                                        Engineering Profile <ExternalLink size={16} />
                                                    </a>
                                                )}
                                            </div>
                                        </section>

                                        <div className="pt-20 space-y-8">
                                            <div className="grid grid-cols-2 gap-8">
                                                <button
                                                    onClick={() => handleStatusUpdate(selectedCandidate._id, 'shortlisted')}
                                                    className="p-[3px] bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-[1.5rem] font-black uppercase tracking-[0.15em] text-[10px] transition-all hover:bg-emerald-600 hover:text-white active:scale-95 flex items-center justify-center gap-2"
                                                >
                                                    <CheckCircle size={18} /> Shortlist
                                                </button>
                                                <button
                                                    onClick={() => handleStatusUpdate(selectedCandidate._id, 'interview')}
                                                    className="p-[3px] bg-blue-50 text-blue-600 border border-blue-100 rounded-[1.5rem] font-black uppercase tracking-[0.15em] text-[10px] transition-all hover:bg-blue-600 hover:text-white active:scale-95 flex items-center justify-center gap-2"
                                                >
                                                    <Calendar size={18} /> Schedule
                                                </button>
                                            </div>
                                            <button
                                                onClick={() => handleStatusUpdate(selectedCandidate._id, 'rejected')}
                                                className="w-full py-1 bg-red-50 text-red-600 border border-red-100 rounded-[1.5rem] font-black uppercase tracking-[0.2em] text-[10px] transition-all hover:bg-red-600 hover:text-white active:scale-95 flex items-center justify-center gap-2"
                                            >
                                                <XCircle size={18} /> Decline Application
                                            </button>
                                        </div>
                                    </aside>
                                </div>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Interview Scheduling Modal with Calendar */}
            <AnimatePresence>
                {showScheduleModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[100] p-4"
                        onClick={() => setShowScheduleModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-[3rem] shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-10"
                        >
                            {/* Header */}
                            <div className="flex items-start justify-between mb-8">
                                <div>
                                    <div className="flex items-center gap-4 mb-3">
                                        <div className="p-3 bg-blue-50 rounded-2xl">
                                            <Calendar className="text-blue-600" size={24} />
                                        </div>
                                        <h2 className="text-3xl font-black text-black">Schedule Interview</h2>
                                    </div>
                                    <p className="text-slate-400 font-bold text-sm">
                                        Set up interview date, time and meeting details
                                    </p>
                                </div>
                                <button
                                    onClick={() => setShowScheduleModal(false)}
                                    className="p-3 hover:bg-slate-50 rounded-2xl transition-all"
                                >
                                    <X size={24} className="text-slate-400" />
                                </button>
                            </div>

                            {/* Form */}
                            <form onSubmit={handleScheduleSubmit} className="space-y-6">
                                {/* Date & Time Picker */}
                                <DateTimePicker
                                    selectedDate={interviewForm.date ? new Date(interviewForm.date) : null}
                                    onDateChange={(date) => {
                                        const formatted = date ? date.toISOString().split('T')[0] : '';
                                        setInterviewForm({ ...interviewForm, date: formatted });
                                    }}
                                    selectedTime={interviewForm.time}
                                    onTimeChange={(e) => setInterviewForm({ ...interviewForm, time: e.target.value })}
                                    label="Interview Date & Time"
                                    required
                                />

                                {/* Meeting Link */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                        Meeting Link (Optional)
                                    </label>
                                    <div className="relative">
                                        <Video className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                                        <input
                                            type="url"
                                            value={interviewForm.link}
                                            onChange={(e) => setInterviewForm({ ...interviewForm, link: e.target.value })}
                                            placeholder="Google Meet, Zoom, or Teams link"
                                            className="w-full bg-slate-50 border border-transparent focus:border-black/10 focus:bg-white text-black font-bold rounded-2xl py-4 pl-12 pr-4 outline-none transition-all placeholder:text-slate-300"
                                        />
                                    </div>
                                    <p className="text-xs text-slate-400 font-medium ml-1">
                                        Leave empty to use built-in interview room
                                    </p>
                                </div>

                                {/* Notes */}
                                <div className="space-y-3">
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">
                                        Interview Notes (Optional)
                                    </label>
                                    <textarea
                                        value={interviewForm.notes}
                                        onChange={(e) => setInterviewForm({ ...interviewForm, notes: e.target.value })}
                                        placeholder="Add any special instructions or topics to discuss..."
                                        className="w-full bg-slate-50 border border-transparent focus:border-black/10 focus:bg-white text-black font-bold rounded-2xl py-4 px-6 outline-none transition-all placeholder:text-slate-300 resize-none"
                                        rows={4}
                                    />
                                </div>

                                {/* Actions */}
                                <div className="flex gap-4 pt-6">
                                    <button
                                        type="button"
                                        onClick={() => setShowScheduleModal(false)}
                                        className="flex-1 py-4 bg-slate-50 hover:bg-slate-100 text-black rounded-2xl font-black text-sm uppercase tracking-widest transition-all"
                                        disabled={updating === schedulingAppId}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={updating === schedulingAppId}
                                        className="flex-1 py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                    >
                                        {updating === schedulingAppId ? (
                                            <>
                                                <Loader2 size={18} className="animate-spin" />
                                                Scheduling...
                                            </>
                                        ) : (
                                            <>
                                                <Send size={18} />
                                                Schedule & Notify
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </RecruiterLayout>
    )
}

export default JobApplicants
