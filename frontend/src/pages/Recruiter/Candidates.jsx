import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Users,
    MessageSquare,
    Calendar,
    Search,
    MapPin,
    Clock,
    MoreVertical,
    Loader2,
    X,
    CheckCircle,
    XCircle,
    Sparkles,
    Check,
    ChevronLeft,
    ChevronRight
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'react-toastify'
import axiosClient from '../../api/axiosClient'
import { useNavigate, useLocation } from 'react-router-dom'
import ResumeViewerModal from '../../components/ResumeViewerModal'
import RecruiterLayout from '../../components/RecruiterLayout'

const RecruiterCandidates = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const routerLocation = useLocation()
    const [applications, setApplications] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedId, setSelectedId] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [filter, setFilter] = useState('All')
    const [updatingStatus, setUpdatingStatus] = useState(false)
    const [jobCount, setJobCount] = useState(0)
    const [showDetailMobile, setShowDetailMobile] = useState(false)
    const [showResumeModal, setShowResumeModal] = useState(false)
    const [showInterviewModal, setShowInterviewModal] = useState(false)
    const [interviewForm, setInterviewForm] = useState({ date: '', time: '', link: '', notes: '' })

    useEffect(() => {
        fetchData()
        fetchJobCount()
    }, [])

    const fetchData = async () => {
        try {
            const res = await axiosClient.get('jobs/recruiter/applicants')
            setApplications(res)
            if (res.length > 0 && !selectedId) {
                setSelectedId(res[0]._id)
            }
        } catch (err) {
            console.error('Error fetching applicants:', err)
            toast.error("Failed to load candidates")
        } finally {
            setLoading(false)
        }
    }

    const fetchJobCount = async () => {
        try {
            const res = await axiosClient.get('jobs/recruiter/jobs')
            setJobCount(res.length)
        } catch (err) {
            console.error('Failed to fetch job count:', err)
        }
    }

    const handleCandidateAction = async (action, additionalData = {}) => {
        setUpdatingStatus(true)
        try {
            const res = await axiosClient.post('jobs/recruiter/candidate-action',
                {
                    applicationId: selectedId,
                    action,
                    ...additionalData
                }
            )

            if (res.success) {
                if (action === 'message' && res.chatId) {
                    navigate('/recruiter/chat', { state: { chatId: res.chatId } })
                } else {
                    toast.success(`Action successful!`)
                    setApplications(apps => apps.map(app => {
                        if (app._id !== selectedId) return app
                        return { ...app, status: res.applicationStatus || app.status }
                    }))
                    if (action === 'interview') {
                        setShowInterviewModal(false)
                    }
                }
            }
        } catch (err) {
            console.error('Action failed:', err)
            toast.error(err.response?.data?.message || "Action failed")
        } finally {
            setUpdatingStatus(false)
        }
    }

    const handleScheduleInterview = () => {
        if (!interviewForm.date || !interviewForm.time) {
            toast.error('Please select date and time')
            return
        }
        handleCandidateAction('interview', {
            interviewDate: interviewForm.date,
            interviewTime: interviewForm.time,
            meetingLink: interviewForm.link,
            interviewNotes: interviewForm.notes
        })
    }

    const selectedApplication = selectedId
        ? applications.find(a => a._id === selectedId)
        : null

    const filteredApplications = applications.filter(app => {
        const candidateName = `${app.user?.firstName || ''} ${app.user?.lastName || ''}`.toLowerCase()
        const jobTitle = app.job?.title?.toLowerCase() || ''
        const matchesSearch = searchQuery === '' || candidateName.includes(searchQuery.toLowerCase()) || jobTitle.includes(searchQuery.toLowerCase())
        const matchesFilter = filter === 'All' || app.status.toLowerCase() === filter.toLowerCase()
        return matchesSearch && matchesFilter
    })

    const getStatusCount = (f) => {
        if (f === 'All') return applications.length
        return applications.filter(a => a.status.toLowerCase() === f.toLowerCase()).length
    }

    const StatusBadge = ({ status }) => {
        const styles = {
            'applied': 'bg-blue-50 text-blue-600 border-blue-100',
            'viewed': 'bg-slate-50 text-slate-500 border-slate-100',
            'shortlisted': 'bg-orange-50 text-orange-600 border-orange-100',
            'interview': 'bg-purple-50 text-purple-600 border-purple-100',
            'selected': 'bg-emerald-50 text-emerald-600 border-emerald-100',
            'rejected': 'bg-red-50 text-red-600 border-red-100'
        }
        return (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-tighter border ${styles[status] || styles['applied']}`}>
                {status}
            </span>
        )
    }

    return (
        <RecruiterLayout jobCount={jobCount}>
            <div className="flex h-full overflow-hidden bg-white">

                {/* LEFT PANEL: Candidates List */}
                <aside className={`
                    w-full sm:w-[360px] lg:w-[420px] xl:w-[450px]
                    border-r border-slate-100 flex-col bg-white shrink-0
                    ${showDetailMobile ? 'hidden sm:flex' : 'flex'}
                `}>
                    <div className="p-6 sm:p-8 border-b border-slate-50 space-y-4 sm:space-y-6">
                        <h1 className="text-2xl sm:text-3xl font-black text-black">Candidates</h1>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name, role..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3 sm:py-3.5 pl-12 pr-4 text-sm text-black focus:outline-none focus:ring-4 focus:ring-black/5 focus:bg-white focus:border-black transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                            {['All', 'Shortlisted', 'Interview', 'Selected', 'Rejected'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-xl text-[10px] sm:text-xs font-black uppercase tracking-tight whitespace-nowrap transition-all flex items-center gap-1.5 sm:gap-2 ${filter === f
                                        ? 'bg-black text-white shadow-lg'
                                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                        }`}
                                >
                                    {f}
                                    <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] ${filter === f ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                        {getStatusCount(f)}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4 custom-scrollbar">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-64 text-slate-400 font-bold uppercase tracking-widest text-xs">
                                <Loader2 className="animate-spin mb-4" size={32} />
                                Loading Candidates...
                            </div>
                        ) : filteredApplications.length === 0 ? (
                            <div className="text-center py-20 font-bold text-slate-300">No candidates found</div>
                        ) : (
                            filteredApplications.map(app => (
                                <motion.div
                                    key={app._id}
                                    onClick={() => {
                                        setSelectedId(app._id)
                                        setShowDetailMobile(true)
                                    }}
                                    className={`p-4 sm:p-6 rounded-3xl cursor-pointer transition-all border relative group ${selectedId === app._id
                                        ? 'bg-white border-black shadow-xl scale-[1.02]'
                                        : 'bg-white border-slate-100 hover:border-slate-300'
                                        }`}
                                >
                                    <div className="flex gap-4 sm:gap-5">
                                        <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-black shrink-0 border border-slate-100 text-base sm:text-lg">
                                            {app.user?.firstName?.[0] || '?'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-black text-black text-base sm:text-lg truncate leading-tight">
                                                    {app.user?.firstName} {app.user?.lastName}
                                                </h4>
                                                <StatusBadge status={app.status} />
                                            </div>
                                            <p className="text-sm text-slate-500 font-bold mb-2 sm:mb-3 truncate">{app.job?.title}</p>
                                            <div className="flex items-center gap-3 sm:gap-4">
                                                <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-tight">
                                                    <MapPin size={11} />
                                                    {app.user?.location || 'Remote'}
                                                </div>
                                                {app.aiMatchScore && (
                                                    <div className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 uppercase tracking-tight">
                                                        <Sparkles size={11} />
                                                        {app.aiMatchScore}% Match
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </aside>

                {/* RIGHT PANEL: Candidate Details */}
                <main className={`
                    flex-1 bg-[#FDFDFD] overflow-y-auto custom-scrollbar flex flex-col
                    ${showDetailMobile ? 'flex' : 'hidden sm:flex'}
                `}>
                    {selectedApplication ? (
                        <div className="p-5 sm:p-8 lg:p-12 max-w-5xl mx-auto w-full">

                            {/* Mobile Back Button */}
                            <button
                                onClick={() => setShowDetailMobile(false)}
                                className="sm:hidden flex items-center gap-2 text-slate-500 hover:text-black font-bold text-sm mb-6 px-3 py-2 rounded-xl hover:bg-slate-100 transition-all"
                            >
                                <ChevronLeft size={18} /> Back to list
                            </button>

                            {/* Header */}
                            <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-8 sm:mb-12">
                                <div className="flex gap-4 sm:gap-8">
                                    <div className="w-16 h-16 sm:w-24 sm:h-24 lg:w-32 lg:h-32 rounded-2xl sm:rounded-[2.5rem] bg-black shadow-2xl flex items-center justify-center text-2xl sm:text-4xl lg:text-5xl font-black text-white shrink-0">
                                        {selectedApplication.user?.firstName?.[0]}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-4 mb-2">
                                            <h2 className="text-2xl sm:text-3xl lg:text-5xl font-black text-black tracking-tight truncate">
                                                {selectedApplication.user?.firstName} {selectedApplication.user?.lastName}
                                            </h2>
                                            <StatusBadge status={selectedApplication.status} />
                                        </div>
                                        <p className="text-base sm:text-xl lg:text-2xl text-slate-400 font-black mb-3 sm:mb-6 uppercase tracking-tight truncate">
                                            {selectedApplication.job?.title}
                                        </p>
                                        <div className="flex flex-wrap gap-3 sm:gap-6">
                                            <div className="flex items-center gap-2 text-slate-500 font-black uppercase text-[10px] sm:text-xs tracking-widest">
                                                <MapPin size={14} /> {selectedApplication.user?.location || 'Remote'}
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500 font-black uppercase text-[10px] sm:text-xs tracking-widest">
                                                <Clock size={14} /> Exp: {selectedApplication.user?.experienceLevel}
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500 font-black uppercase text-[10px] sm:text-xs tracking-widest">
                                                <Calendar size={14} /> Applied: {new Date(selectedApplication.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3 shrink-0 self-start sm:self-auto">
                                    {selectedApplication.resumeUrl && (
                                        <button
                                            onClick={() => setShowResumeModal(true)}
                                            className="px-4 sm:px-6 py-2.5 sm:py-3 bg-white border border-slate-200 text-black hover:border-black rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-sm"
                                        >
                                            View Resume
                                        </button>
                                    )}
                                    <button className="p-2.5 sm:p-3 bg-white border border-slate-200 text-slate-400 hover:text-black rounded-2xl transition-all shadow-sm">
                                        <MoreVertical size={22} />
                                    </button>
                                </div>
                            </header>

                            {/* Skills Tags */}
                            {selectedApplication.user?.skills && selectedApplication.user.skills.length > 0 && (
                                <div className="flex flex-wrap gap-2 sm:gap-3 mb-8">
                                    {selectedApplication.user.skills.slice(0, 8).map((skill, i) => (
                                        <span key={i} className="px-3 sm:px-4 py-1.5 sm:py-2 bg-blue-50 text-blue-600 rounded-xl text-xs sm:text-sm font-semibold border border-blue-100">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Content Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-12">
                                <div className="lg:col-span-2 space-y-6 sm:space-y-12">
                                    <section className="bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] border border-slate-100 shadow-sm">
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-5 sm:mb-8">Professional Summary</h3>
                                        <p className="text-base sm:text-xl text-slate-600 leading-relaxed font-medium">
                                            {selectedApplication.user?.aboutMe || 'No summary provided.'}
                                        </p>
                                    </section>

                                    <section>
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-5 sm:mb-8">Experience</h3>
                                        <div className="space-y-4 sm:space-y-6">
                                            {selectedApplication.user?.experience?.map((exp, i) => (
                                                <div key={i} className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-2 mb-4">
                                                        <div>
                                                            <h4 className="text-xl sm:text-2xl font-black text-black mb-1">{exp.role}</h4>
                                                            <p className="text-blue-600 font-black uppercase text-xs tracking-widest">{exp.company}</p>
                                                        </div>
                                                        <span className="px-4 py-1.5 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest self-start">{exp.duration}</span>
                                                    </div>
                                                    <p className="text-slate-600 font-medium leading-relaxed text-sm sm:text-base">{exp.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </div>

                                <div className="space-y-6 sm:space-y-8">
                                    {/* AI Match */}
                                    <section className="bg-black p-8 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                                        <div className="relative z-10">
                                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-6 sm:mb-8">AI Match Analysis</h3>
                                            <div className="flex items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
                                                <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-white/10 flex items-center justify-center text-2xl sm:text-4xl font-black shadow-inner border border-white/5">
                                                    {selectedApplication.aiMatchScore || '??'}%
                                                </div>
                                                <div>
                                                    <p className="text-white font-black text-base sm:text-lg mb-1">Strong Match</p>
                                                    <p className="text-slate-400 text-xs font-bold uppercase">ATS Ranking</p>
                                                </div>
                                            </div>
                                            <p className="text-slate-300 text-xs leading-relaxed font-medium mb-6 sm:mb-8">
                                                {selectedApplication.aiAnalysis?.summary || "AI analysis is currently processing this candidate's profile."}
                                            </p>
                                        </div>
                                        <div className="absolute top-[-20%] right-[-20%] w-48 h-48 bg-white/5 rounded-full blur-3xl" />
                                    </section>

                                    {/* Actions */}
                                    <div className="bg-white p-6 sm:p-10 rounded-[2rem] sm:rounded-[3rem] border border-slate-100 shadow-xl space-y-4 sm:space-y-6">
                                        <div className="grid grid-cols-2 gap-3 sm:gap-6">
                                            <button
                                                onClick={() => handleCandidateAction('shortlist')}
                                                className="py-2.5 sm:p-[3px] bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.15em] hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                                            >
                                                <Check size={16} /> Shortlist
                                            </button>
                                            <button
                                                onClick={() => setShowInterviewModal(true)}
                                                className="py-2.5 sm:p-[3px] bg-blue-50 text-blue-600 border border-blue-100 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.15em] hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                                            >
                                                <Calendar size={16} /> Schedule
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => handleCandidateAction('reject')}
                                            className="w-full py-2.5 sm:py-1 bg-red-50 text-red-600 border border-red-100 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                                        >
                                            <XCircle size={16} /> Decline Application
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300">
                            <Users size={80} className="mb-6 opacity-20" />
                            <p className="text-xl sm:text-2xl font-black uppercase tracking-widest opacity-30">Select a candidate to view</p>
                        </div>
                    )}
                </main>
            </div>

            {/* Schedule Interview Modal */}
            <AnimatePresence>
                {showInterviewModal && selectedApplication && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4"
                        onClick={() => setShowInterviewModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.95, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-gray-900 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-gray-700"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between mb-6">
                                <div>
                                    <h2 className="text-xl sm:text-2xl font-bold text-white">Schedule Interview</h2>
                                    <p className="text-gray-400 text-sm mt-1">Set up meeting with candidate</p>
                                </div>
                                <button
                                    onClick={() => setShowInterviewModal(false)}
                                    className="p-2 hover:bg-gray-800 rounded-xl transition-colors"
                                >
                                    <X size={20} className="text-gray-400" />
                                </button>
                            </div>

                            {/* Stats Row */}
                            <div className="grid grid-cols-2 gap-3 sm:gap-4 mb-6">
                                <div className="bg-gray-800/50 rounded-xl p-3 sm:p-4 border border-gray-700">
                                    <p className="text-gray-400 text-xs font-semibold uppercase mb-1">Total Applied</p>
                                    <p className="text-white text-xl sm:text-2xl font-bold">{applications.length}</p>
                                </div>
                                <div className="bg-gray-800/50 rounded-xl p-3 sm:p-4 border border-gray-700">
                                    <p className="text-gray-400 text-xs font-semibold uppercase mb-1">Shortlisted</p>
                                    <p className="text-white text-xl sm:text-2xl font-bold">{getStatusCount('Shortlisted')}</p>
                                </div>
                            </div>

                            {/* Smart Suggestion */}
                            <div className="bg-blue-500/10 border border-blue-500/20 rounded-xl p-4 mb-6">
                                <div className="flex gap-3">
                                    <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center flex-shrink-0">
                                        <Sparkles className="text-blue-400" size={20} />
                                    </div>
                                    <div>
                                        <p className="text-blue-300 font-semibold text-sm mb-1">Smart Scheduling</p>
                                        <p className="text-gray-300 text-xs leading-relaxed">
                                            System will auto-generate a Jitsi meeting link if you leave the meeting link field blank.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Form Fields */}
                            <div className="space-y-4 sm:space-y-5">
                                {/* Date */}
                                <div>
                                    <label className="block text-gray-300 text-sm font-semibold mb-2 uppercase tracking-wide">
                                        Date
                                    </label>
                                    <input
                                        type="date"
                                        value={interviewForm.date}
                                        onChange={(e) => setInterviewForm({...interviewForm, date: e.target.value})}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 sm:py-3.5 
                                                 text-white placeholder-gray-500 focus:border-blue-500 
                                                 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    />
                                </div>

                                {/* Time */}
                                <div>
                                    <label className="block text-gray-300 text-sm font-semibold mb-2 uppercase tracking-wide">
                                        Time
                                    </label>
                                    <input
                                        type="time"
                                        value={interviewForm.time}
                                        onChange={(e) => setInterviewForm({...interviewForm, time: e.target.value})}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 sm:py-3.5 
                                                 text-white focus:border-blue-500 focus:ring-2 
                                                 focus:ring-blue-500/20 transition-all"
                                    />
                                </div>

                                {/* Meeting Link */}
                                <div>
                                    <div className="flex items-center justify-between mb-2">
                                        <label className="text-gray-300 text-sm font-semibold uppercase tracking-wide">
                                            Meeting Link (Optional)
                                        </label>
                                    </div>
                                    <input
                                        type="url"
                                        value={interviewForm.link}
                                        onChange={(e) => setInterviewForm({...interviewForm, link: e.target.value})}
                                        placeholder="Leave blank to auto-generate Jitsi link"
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 sm:py-3.5 
                                                 text-white placeholder-gray-500 focus:border-blue-500 
                                                 focus:ring-2 focus:ring-blue-500/20 transition-all"
                                    />
                                </div>

                                {/* Notes */}
                                <div>
                                    <label className="block text-gray-300 text-sm font-semibold mb-2 uppercase tracking-wide">
                                        Notes
                                    </label>
                                    <textarea
                                        value={interviewForm.notes}
                                        onChange={(e) => setInterviewForm({...interviewForm, notes: e.target.value})}
                                        placeholder="Add meeting instructions..."
                                        rows={3}
                                        className="w-full bg-gray-800 border border-gray-700 rounded-xl px-4 py-3 sm:py-3.5 
                                                 text-white placeholder-gray-500 focus:border-blue-500 
                                                 focus:ring-2 focus:ring-blue-500/20 transition-all resize-none"
                                    />
                                </div>
                            </div>

                            {/* Action Button */}
                            <button
                                onClick={handleScheduleInterview}
                                disabled={!interviewForm.date || !interviewForm.time || updatingStatus}
                                className="w-full mt-6 sm:mt-8 bg-gradient-to-r from-blue-600 to-purple-600 
                                         hover:from-blue-500 hover:to-purple-500 text-white py-3 sm:py-4 rounded-xl 
                                         font-bold text-sm uppercase tracking-wide transition-all 
                                         disabled:opacity-50 disabled:cursor-not-allowed
                                         shadow-lg shadow-blue-500/30 hover:shadow-xl hover:shadow-blue-500/40"
                            >
                                {updatingStatus ? (
                                    <span className="flex items-center justify-center gap-2">
                                        <Loader2 className="animate-spin" size={18} />
                                        Scheduling...
                                    </span>
                                ) : (
                                    'Confirm Schedule'
                                )}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {showResumeModal && selectedApplication && (
                <ResumeViewerModal
                    isOpen={showResumeModal}
                    onClose={() => setShowResumeModal(false)}
                    resumeUrl={selectedApplication.resumeUrl}
                    candidateName={`${selectedApplication.user?.firstName} ${selectedApplication.user?.lastName}`}
                />
            )}
        </RecruiterLayout>
    )
}

export default RecruiterCandidates
