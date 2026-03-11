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
            'viewed': 'bg-gray-50 text-gray-600 border-gray-100',
            'shortlisted': 'bg-orange-50 text-orange-600 border-orange-100',
            'interview': 'bg-purple-50 text-purple-600 border-purple-100',
            'selected': 'bg-green-50 text-green-600 border-green-100',
            'rejected': 'bg-red-50 text-red-600 border-red-100'
        }
        return (
            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold border ${styles[status] || styles['applied']}`}>
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
                    <div className="p-6 sm:p-8 border-b border-gray-100 space-y-4 sm:space-y-6">
                        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">Candidates</h1>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name, role..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-lg py-3 sm:py-3.5 pl-12 pr-4 text-sm text-gray-900 font-medium focus:outline-none focus:border-blue-500 focus:bg-white transition-all placeholder:text-gray-400"
                            />
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto pb-1 custom-scrollbar">
                            {['All', 'Shortlisted', 'Interview', 'Selected', 'Rejected'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 sm:gap-2 ${filter === f
                                    ? 'bg-black text-white shadow-md'
                                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100 border border-gray-200'
                                    }`}
                                >
                                    {f}
                                    <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] font-semibold ${filter === f ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-600'}`}>
                                        {getStatusCount(f)}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-3 sm:space-y-4 custom-scrollbar">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-64 text-gray-500 font-semibold text-sm">
                                <Loader2 className="animate-spin mb-4 text-blue-600" size={32} />
                                Loading candidates...
                            </div>
                        ) : filteredApplications.length === 0 ? (
                            <div className="text-center py-20 font-medium text-gray-400">No candidates found</div>
                        ) : (
                            filteredApplications.map(app => (
                                <motion.div
                                    key={app._id}
                                    onClick={() => {
                                        setSelectedId(app._id)
                                        setShowDetailMobile(true)
                                    }}
                                    className={`p-4 sm:p-5 rounded-2xl cursor-pointer transition-all border relative group ${selectedId === app._id
                                        ? 'bg-slate-50 border-slate-300 shadow-md'
                                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-sm'
                                        }`}
                                >
                                    <div className="flex gap-3 sm:gap-4">
                                        <div className="relative">
                                            <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-slate-900 flex items-center justify-center font-black text-white shrink-0 text-base sm:text-lg shadow-md">
                                                {app.user?.firstName?.[0] || '?'}
                                            </div>
                                            {app.aiMatchScore >= 70 && (
                                                <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-emerald-500 rounded-full flex items-center justify-center border-2 border-white">
                                                    <Check className="text-white" size={10} strokeWidth={3} />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-black text-slate-900 text-sm sm:text-base truncate leading-tight">
                                                    {app.user?.firstName} {app.user?.lastName}
                                                </h4>
                                                <StatusBadge status={app.status} />
                                            </div>
                                            <p className="text-xs sm:text-sm text-slate-600 font-semibold mb-2 truncate">{app.job?.title}</p>
                                            <div className="flex items-center gap-3 sm:gap-4">
                                                <div className="flex items-center gap-1 text-[10px] font-bold text-slate-500 uppercase tracking-tight">
                                                    <MapPin size={11} />
                                                    {app.user?.location || 'Remote'}
                                                </div>
                                                {app.aiMatchScore && (
                                                    <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-tight ${
                                                        app.aiMatchScore >= 70 ? 'text-emerald-600' : 
                                                        app.aiMatchScore >= 50 ? 'text-blue-600' : 'text-slate-500'
                                                    }`}>
                                                        <Sparkles size={11} />
                                                        {app.aiMatchScore}%
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
                            <header className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-6 mb-8">
                                <div className="flex gap-4 sm:gap-6">
                                    <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-slate-900 shadow-xl flex items-center justify-center text-2xl sm:text-3xl font-black text-white shrink-0">
                                        {selectedApplication.user?.firstName?.[0]}
                                    </div>
                                    <div className="min-w-0">
                                        <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-2">
                                            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight truncate">
                                                {selectedApplication.user?.firstName} {selectedApplication.user?.lastName}
                                            </h2>
                                            <StatusBadge status={selectedApplication.status} />
                                        </div>
                                        <p className="text-sm sm:text-base text-slate-600 font-bold mb-3 sm:mb-4 truncate">
                                            {selectedApplication.job?.title}
                                        </p>
                                        <div className="flex flex-wrap gap-3 sm:gap-5">
                                            <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-[10px] sm:text-xs uppercase tracking-wide">
                                                <MapPin size={14} /> {selectedApplication.user?.location || 'Remote'}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-[10px] sm:text-xs uppercase tracking-wide">
                                                <Clock size={14} /> Exp: {selectedApplication.user?.experienceLevel || 'Fresher'}
                                            </div>
                                            <div className="flex items-center gap-1.5 text-slate-500 font-semibold text-[10px] sm:text-xs uppercase tracking-wide">
                                                <Calendar size={14} /> Applied: {new Date(selectedApplication.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-3 shrink-0 self-start sm:self-auto">
                                    {selectedApplication.resumeUrl ? (
                                        <button
                                            onClick={() => setShowResumeModal(true)}
                                            className="px-4 sm:px-5 py-2.5 bg-white border-2 border-slate-900 text-slate-900 hover:bg-slate-900 hover:text-white rounded-xl font-bold text-xs uppercase tracking-wide transition-all shadow-sm"
                                        >
                                            View Resume
                                        </button>
                                    ) : (
                                        <div className="px-4 sm:px-5 py-2.5 bg-slate-100 border-2 border-slate-300 text-slate-500 rounded-xl font-semibold text-xs uppercase tracking-wide">
                                            No Resume
                                        </div>
                                    )}
                                    <button className="p-2.5 bg-white border border-slate-300 text-slate-600 hover:text-slate-900 hover:border-slate-900 rounded-xl transition-all">
                                        <MoreVertical size={20} />
                                    </button>
                                </div>
                            </header>

                            {/* Skills Tags */}
                            {selectedApplication.user?.skills && selectedApplication.user.skills.length > 0 && (
                                <div className="flex flex-wrap gap-2 mb-8">
                                    {selectedApplication.user.skills.slice(0, 8).map((skill, i) => (
                                        <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-600 rounded-lg text-xs font-semibold border border-blue-200">
                                            {skill}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {/* Content Grid */}
                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8">
                                <div className="lg:col-span-2 space-y-6 sm:space-y-8">
                                    <section className="bg-white p-6 sm:p-8 rounded-[1.5rem] border border-slate-200 shadow-sm">
                                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.25em] mb-4 sm:mb-6">Professional Summary</h3>
                                        {selectedApplication.user?.aboutMe ? (
                                            <p className="text-sm sm:text-base text-slate-700 leading-relaxed">
                                                {selectedApplication.user.aboutMe}
                                            </p>
                                        ) : (
                                            <div className="flex flex-col items-center justify-center py-8 text-center">
                                                <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                                                    <Users className="text-slate-400" size={28} />
                                                </div>
                                                <p className="text-slate-400 font-bold text-sm">No professional summary added yet</p>
                                                <p className="text-slate-300 text-xs mt-1">Candidate hasn't added a professional summary</p>
                                            </div>
                                        )}
                                    </section>

                                    <section>
                                        <h3 className="text-xs font-black text-slate-500 uppercase tracking-[0.25em] mb-4 sm:mb-6">Experience</h3>
                                        <div className="space-y-3 sm:space-y-4">
                                            {selectedApplication.user?.experience && selectedApplication.user.experience.length > 0 ? (
                                                selectedApplication.user.experience.map((exp, i) => (
                                                    <div key={i} className="bg-white p-5 sm:p-6 rounded-[1.5rem] border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
                                                        <div className="flex items-start gap-4 mb-3">
                                                            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shrink-0 shadow-md">
                                                                <span className="text-white font-black text-lg drop-shadow-sm">{exp.company?.[0] || exp.role?.[0] || 'E'}</span>
                                                            </div>
                                                            <div className="flex-1 min-w-0">
                                                                <h4 className="text-base sm:text-lg font-black text-slate-900 mb-0.5 truncate">{exp.role || 'Position not specified'}</h4>
                                                                <p className="text-sm text-blue-600 font-bold truncate">{exp.company || 'Company not specified'}</p>
                                                                <p className="text-xs text-slate-500 font-medium mt-1">{exp.duration || 'Duration not specified'}</p>
                                                            </div>
                                                        </div>
                                                        {exp.description && (
                                                            <div className="ml-16 space-y-1">
                                                                {exp.description.split('\n').slice(0, 2).map((line, idx) => (
                                                                    line.trim() && (
                                                                        <p key={idx} className="text-sm text-slate-600 leading-relaxed flex items-start gap-2">
                                                                            <span className="text-blue-500 mt-1">•</span>
                                                                            <span>{line}</span>
                                                                        </p>
                                                                    )
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="bg-white p-5 sm:p-6 rounded-[1.5rem] border border-slate-200 shadow-sm">
                                                    <div className="flex flex-col items-center justify-center py-8 text-center">
                                                        <div className="w-16 h-16 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
                                                            <Clock className="text-slate-400" size={28} />
                                                        </div>
                                                        <p className="text-slate-400 font-bold text-sm">No experience added yet</p>
                                                        <p className="text-slate-300 text-xs mt-1">Candidate hasn't added work experience to their profile</p>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </section>
                                </div>

                                <div className="space-y-6 sm:space-y-8">
                                    {/* AI Match */}
                                    <section className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 sm:p-10 rounded-[2rem] sm:rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                                        <div className="relative z-10">
                                            <h3 className="text-[10px] font-black text-emerald-400 uppercase tracking-[0.3em] mb-6 sm:mb-8">AI Match Analysis</h3>
                                            
                                            {/* Improved AI Match Analysis UI */}
                                            {!selectedApplication.resumeUrl ? (
                                                <div className="flex flex-col items-center justify-center py-12">
                                                    <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center shadow-lg mb-6">
                                                        <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2.5">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                                        </svg>
                                                    </div>
                                                    <p className="text-white font-black text-xl mb-2">No Resume Uploaded</p>
                                                    <p className="text-slate-400 text-sm font-semibold">Please ask the candidate to upload a resume to enable AI analysis.</p>
                                                </div>
                                            ) : selectedApplication.aiMatchScore !== null && selectedApplication.aiMatchScore !== undefined && selectedApplication.aiMatchScore !== -1 ? (
                                                <div className="flex items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
                                                    <div className="relative">
                                                        <div className={`w-20 h-20 sm:w-24 sm:h-24 rounded-2xl flex items-center justify-center text-3xl sm:text-4xl font-black shadow-lg border-4 ${
                                                            selectedApplication.aiMatchScore >= 70 
                                                                ? 'bg-gradient-to-br from-emerald-500 to-emerald-600 border-emerald-400/20'
                                                                : selectedApplication.aiMatchScore >= 50
                                                                ? 'bg-gradient-to-br from-blue-500 to-blue-600 border-blue-400/20'
                                                                : 'bg-gradient-to-br from-orange-500 to-orange-600 border-orange-400/20'
                                                        }`}>
                                                            {selectedApplication.aiMatchScore}%
                                                        </div>
                                                        {selectedApplication.aiMatchScore >= 70 && (
                                                            <div className="absolute -top-1 -right-1 w-6 h-6 bg-emerald-400 rounded-full flex items-center justify-center">
                                                                <Check className="text-slate-900" size={14} strokeWidth={3} />
                                                            </div>
                                                        )}
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-black text-lg sm:text-xl mb-1">
                                                            {selectedApplication.aiMatchScore >= 70 ? 'Strong Match' : 
                                                             selectedApplication.aiMatchScore >= 50 ? 'Good Match' : 'Weak Match'}
                                                        </p>
                                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wide">✓ AI Verified Score</p>
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="flex items-center gap-4 sm:gap-6 mb-6 sm:mb-8">
                                                    <div className="relative">
                                                        <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-600 flex items-center justify-center shadow-lg border-4 border-slate-500/20">
                                                            <Loader2 className="animate-spin text-white stroke-white" size={32} strokeWidth={2.5} />
                                                        </div>
                                                    </div>
                                                    <div>
                                                        <p className="text-white font-black text-lg sm:text-xl mb-1">Analyzing Resume...</p>
                                                        <p className="text-slate-400 text-xs font-bold uppercase tracking-wide">⏳ Please wait</p>
                                                    </div>
                                                </div>
                                            )}

                                            {/* Skill Match Breakdown & Recommendation - Only show if resume exists */}
                                            {selectedApplication.resumeUrl && (
                                                <div className="mb-6">
                                                    <p className="text-slate-300 text-xs font-black uppercase tracking-widest mb-4">Skill Match:</p>
                                                    <div className="grid grid-cols-2 gap-2 sm:gap-3">
                                                        {selectedApplication.user?.skills && selectedApplication.user.skills.length > 0 ? (
                                                            selectedApplication.user.skills.slice(0, 4).map((skill, idx) => {
                                                                const jobSkills = selectedApplication.job?.requiredSkills || [];
                                                                const matched = jobSkills.length > 0
                                                                    ? jobSkills.some(s => s.toLowerCase() === skill.toLowerCase())
                                                                    : (selectedApplication.aiMatchScore >= 70);
                                                                return (
                                                                <div 
                                                                    key={idx} 
                                                                    className={`flex items-center gap-2 px-3 py-2 rounded-xl border ${
                                                                        matched 
                                                                        ? 'bg-emerald-500/20 border-emerald-500/30' 
                                                                        : 'bg-slate-700/30 border-slate-600/30'
                                                                    }`}
                                                                >
                                                                    {matched ? (
                                                                        <Check className="text-emerald-400 shrink-0" size={14} strokeWidth={3} />
                                                                    ) : (
                                                                        <X className="text-slate-500 shrink-0" size={14} strokeWidth={3} />
                                                                    )}
                                                                    <span className={`text-xs font-bold truncate ${
                                                                        matched ? 'text-emerald-300' : 'text-slate-400'
                                                                    }`}>
                                                                        {skill}
                                                                    </span>
                                                                </div>
                                                                );
                                                            })
                                                        ) : (
                                                            <div className="col-span-2 text-center py-4 px-3 bg-slate-700/20 border border-slate-600/30 rounded-xl">
                                                                <p className="text-slate-400 text-xs font-medium">No skills listed by candidate</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            )}

                                            {/* Recommendation */}
                                            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-4">
                                                <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-2 flex items-center gap-2">
                                                    <Sparkles size={12} /> Recommendation:
                                                </p>
                                                <ul className="space-y-1.5">
                                                    {(() => {
                                                        const status = selectedApplication.status.toLowerCase();
                                                        const matchScore = selectedApplication.aiMatchScore;
                                                        
                                                        // If no ATS score yet, show pending
                                                        if (matchScore === null || matchScore === undefined || matchScore === -1) {
                                                            if (!selectedApplication.resumeUrl) {
                                                                return (
                                                                    <li className="text-slate-300 text-xs font-medium flex items-start gap-2">
                                                                        <svg className="w-3 h-3 text-slate-400 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                                        </svg>
                                                                        <span>⚠️ Upload resume for AI analysis</span>
                                                                    </li>
                                                                );
                                                            }
                                                            return (
                                                                <li className="text-slate-300 text-xs font-medium flex items-start gap-2">
                                                                    <Loader2 className="animate-spin text-slate-400 shrink-0 mt-0.5" size={12} strokeWidth={3} />
                                                                    <span>⏳ Analyzing candidate profile...</span>
                                                                </li>
                                                            );
                                                        }
                                                        
                                                        if (status === 'selected') {
                                                            return (
                                                                <li className="text-emerald-300 text-xs font-medium flex items-start gap-2">
                                                                    <Check className="text-emerald-400 shrink-0 mt-0.5" size={12} strokeWidth={3} />
                                                                    <span>✓ Recommended for selection - Excellent match</span>
                                                                </li>
                                                            );
                                                        }
                                                        
                                                        if (status === 'rejected') {
                                                            return (
                                                                <li className="text-red-300 text-xs font-medium flex items-start gap-2">
                                                                    <X className="text-red-400 shrink-0 mt-0.5" size={12} strokeWidth={3} />
                                                                    <span>Not eligible - Requirements not met</span>
                                                                </li>
                                                            );
                                                        }
                                                        
                                                        if (matchScore >= 80) {
                                                            return (
                                                                <li className="text-emerald-300 text-xs font-medium flex items-start gap-2">
                                                                    <Check className="text-emerald-400 shrink-0 mt-0.5" size={12} strokeWidth={3} />
                                                                    <span>Highly recommended for selection</span>
                                                                </li>
                                                            );
                                                        }
                                                        
                                                        if (matchScore >= 70) {
                                                            return (
                                                                <li className="text-blue-300 text-xs font-medium flex items-start gap-2">
                                                                    <Check className="text-blue-400 shrink-0 mt-0.5" size={12} strokeWidth={3} />
                                                                    <span>Recommended - Good skill match</span>
                                                                </li>
                                                            );
                                                        }
                                                        
                                                        if (matchScore >= 50) {
                                                            return (
                                                                <li className="text-yellow-300 text-xs font-medium flex items-start gap-2">
                                                                    <Check className="text-yellow-400 shrink-0 mt-0.5" size={12} strokeWidth={3} />
                                                                    <span>Potential match - Needs review</span>
                                                                </li>
                                                            );
                                                        }
                                                        
                                                        return (
                                                            <li className="text-slate-300 text-xs font-medium flex items-start gap-2">
                                                                <X className="text-slate-400 shrink-0 mt-0.5" size={12} strokeWidth={3} />
                                                                <span>Not eligible - Low match score</span>
                                                            </li>
                                                        );
                                                    })()}
                                                </ul>
                                            </div>
                                        </div>
                                        {/* Decorative blurs - inside section, outside z-10 wrapper */}
                                        <div className="absolute top-[-20%] right-[-20%] w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl" />
                                        <div className="absolute bottom-[-30%] left-[-10%] w-64 h-64 bg-blue-500/10 rounded-full blur-3xl" />
                                    </section>

                                    {/* Actions */}
                                    <div className="bg-white p-6 sm:p-8 rounded-[2rem] border border-slate-200 shadow-lg space-y-3 sm:space-y-4">
                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={() => handleCandidateAction('shortlist')}
                                                className="py-3 px-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl font-bold text-xs uppercase tracking-wide hover:from-emerald-600 hover:to-emerald-700 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.98]"
                                            >
                                                <Check size={16} /> Shortlist
                                            </button>
                                            <button
                                                onClick={() => handleCandidateAction('message')}
                                                className="py-3 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl font-bold text-xs uppercase tracking-wide hover:from-blue-600 hover:to-blue-700 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.98]"
                                            >
                                                <MessageSquare size={16} /> Signature
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => setShowInterviewModal(true)}
                                            className="w-full py-3.5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-xl font-bold text-sm uppercase tracking-wide hover:from-blue-700 hover:to-indigo-700 transition-all flex items-center justify-center gap-2 shadow-md hover:shadow-lg active:scale-[0.98]"
                                        >
                                            <Calendar size={18} /> Schedule Interview
                                        </button>
                                        <button
                                            onClick={() => handleCandidateAction('reject')}
                                            className="w-full py-3.5 bg-red-50 text-red-600 border border-red-200 rounded-xl font-bold text-sm uppercase tracking-wide hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                                        >
                                            <XCircle size={16} /> Reject
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
