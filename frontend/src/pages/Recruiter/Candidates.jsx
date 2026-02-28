import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    LayoutDashboard,
    Users,
    Briefcase,
    MessageSquare,

    Calendar,
    Search,
    MapPin,
    Phone,
    Mail,
    Clock,
    MoreVertical,
    Loader2,
    ExternalLink,
    X,
    LogOut,
    Zap,
    CheckCircle,
    XCircle,
    Brain,
    Sparkles,
    AlertCircle,
    Check,
    Home,
    Building2,
    Github,
    Video,
    FileText
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/Navbar'
import { toast } from 'react-toastify'
import axiosClient from '../../api/axiosClient'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import ResumeViewerModal from '../../components/ResumeViewerModal'

const RecruiterCandidates = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const routerLocation = useLocation()
    const [applications, setApplications] = useState([])
    const [loading, setLoading] = useState(true)
    const [selectedId, setSelectedId] = useState(null)
    const [searchQuery, setSearchQuery] = useState('')
    const [locationQuery, setLocationQuery] = useState('')
    const [filter, setFilter] = useState('All')
    const [updatingStatus, setUpdatingStatus] = useState(false)
    const [imagePreview, setImagePreview] = useState(null)
    const [jobCount, setJobCount] = useState(0)
    const [analyzing, setAnalyzing] = useState(false)

    // Action Modal State
    const [showActionModal, setShowActionModal] = useState(false)
    const [showInterviewModal, setShowInterviewModal] = useState(false)
    const [interviewForm, setInterviewForm] = useState({ date: '', time: '', link: '', notes: '' })
    const [autoAssigning, setAutoAssigning] = useState(false)

    // Resume Modal State
    const [showResumeModal, setShowResumeModal] = useState(false)

    // Open interview modal:
    // - If candidate already has a slot → pre-fill for editing
    // - If shortlisted but no slot yet → pre-fill with backend's next available slot
    const openInterviewModal = async () => {
        const app = selectedId ? applications.find(a => a._id === selectedId) : null

        if (app && app.status === 'rejected') {
            toast.error("Cannot schedule interviews for rejected candidates");
            return;
        }
        // Allow scheduling for anyone not rejected

        if (app && app.interviewDate) {
            // Already scheduled — let recruiter see & edit their existing slot
            setInterviewForm({
                date: app.interviewDate,
                time: app.interviewTime || '',
                link: app.meetingLink || '',
                notes: app.interviewNotes || ''
            })
            setShowInterviewModal(true)
        } else {
            // New scheduling — fetch next available slot
            setAutoAssigning(true)
            setShowInterviewModal(true) // Show early to see loading state if needed
            try {
                const res = await axiosClient.get('jobs/recruiter/next-slot')

                if (res.success && res.nextSlot) {
                    setInterviewForm({ date: res.nextSlot.date, time: res.nextSlot.time, link: '', notes: '' })
                } else {
                    // Fallback to empty date/time if no slot found, keep link empty to use built-in Jitsi
                    setInterviewForm({ date: '', time: '', link: '', notes: '' })
                }
            } catch (err) {
                console.error('Failed to pre-fill slot:', err)
                setInterviewForm({ date: '', time: '', link: '', notes: '' })
            } finally {
                setAutoAssigning(false)
            }
        }
    }

    useEffect(() => {
        const queryParams = new URLSearchParams(routerLocation.search)
        const skillsFromUrl = queryParams.get('skills')
        const locationFromUrl = queryParams.get('location')

        if (skillsFromUrl) setSearchQuery(skillsFromUrl)
        if (locationFromUrl) setLocationQuery(locationFromUrl)

        fetchData()
        fetchJobCount()
    }, [routerLocation.search])

    const autoScanPending = async (pendingApps, options = {}) => {
        const { forceRescan = false, autoClassify = false } = options;

        // Only scan if not already analyzing to avoid console spam/rate limits
        if (analyzing && !forceRescan) return;

        setAnalyzing(true);
        console.log(`[AutoScan] ${forceRescan ? 'Force-scanning' : 'Checking'} ${pendingApps.length} pending candidate(s)...`);

        // Run all scans concurrently using Promise.allSettled
        try {
            await Promise.allSettled(pendingApps.map(async (app) => {
                try {
                    const res = await axiosClient.post(`/jobs/application/${app._id}/scan`, {
                        forceRescan,
                        autoClassify
                    });

                    if (res.analysis || res.aiMatchScore != null) {
                        const score = res.aiMatchScore ?? res.analysis?.ats_score ?? res.analysis?.matchPercentage ?? 0;
                        setApplications(prev => prev.map(a =>
                            a._id === app._id ? {
                                ...a,
                                aiMatchScore: score,
                                aiAnalysis: res.analysis || a.aiAnalysis,
                                status: res.applicationStatus || a.status
                            } : a
                        ));

                        if (forceRescan) {
                            toast.success(`Scan completed for ${app.user?.firstName || 'candidate'}`);
                        }
                    }
                } catch (err) {
                    console.warn(`[AutoScan] Could not scan ${app._id}:`, err?.response?.data?.message || err.message);
                    if (forceRescan) {
                        toast.error(`Scan failed: ${err?.response?.data?.message || err.message}`);
                    }
                }
            }));
        } finally {
            setAnalyzing(false);
        }
    }

    const fetchData = async () => {
        try {
            const res = await axiosClient.get('jobs/recruiter/applicants')
            setApplications(res)
            if (res.length > 0 && !selectedId) {
                setSelectedId(res[0]._id)
            }

            // Trigger auto-scan for candidates with no score (not auto-classifying in background)
            const needsScan = Array.isArray(res) ? res.filter(app => app.aiMatchScore == null || app.aiMatchScore === -1) : []
            if (needsScan.length > 0) {
                autoScanPending(needsScan, { forceRescan: false, autoClassify: true })
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
                    // Use server-returned slot values (backend may override with auto-assigned slot)
                    const finalDate = action === 'interview' ? (res.interviewDate || additionalData.interviewDate || '') : ''
                    const finalTime = action === 'interview' ? (res.interviewTime || additionalData.interviewTime || '') : ''
                    if (action === 'interview') {
                        // Format human-readable time for toast
                        let timeLabel = finalTime
                        if (finalTime) {
                            const [hh, mm] = finalTime.split(':')
                            const h = parseInt(hh, 10)
                            timeLabel = `${h > 12 ? h - 12 : h === 0 ? 12 : h}:${mm} ${h >= 12 ? 'PM' : 'AM'}`
                        }
                        toast.success(`Interview scheduled! 📅 ${finalDate} at ⏰ ${timeLabel} — Email sent to candidate`)
                    } else {
                        toast.success(`Action successful: ${action}`)
                    }
                    setApplications(apps => apps.map(app => {
                        if (app._id !== selectedId) return app
                        const updated = { ...app, status: res.applicationStatus || app.status }
                        if (action === 'interview') {
                            updated.interviewDate = finalDate
                            updated.interviewTime = finalTime
                            updated.meetingLink = additionalData.meetingLink || ''
                            updated.interviewNotes = additionalData.interviewNotes || ''
                        }
                        return updated
                    }))
                    setShowActionModal(false)
                    setShowInterviewModal(false)
                }
            }
        } catch (err) {
            console.error('Action failed:', err)
            toast.error(err.response?.data?.message || "Action failed")
        } finally {
            setUpdatingStatus(false)
        }
    }



    const selectedApplication = selectedId
        ? applications.find(a => a._id === selectedId)
        : applications.length > 0 ? applications[0] : null

    const filteredApplications = applications.filter(app => {
        const candidateName = `${app.user?.firstName || ''} ${app.user?.lastName || ''}`.toLowerCase()
        const jobTitle = app.job?.title?.toLowerCase() || ''
        const candidateLocation = (app.user?.location || 'Remote').toLowerCase()
        const candidateSkills = (app.user?.primarySkill || '').toLowerCase()

        const matchesSearch =
            (searchQuery === '' ||
                candidateName.includes(searchQuery.toLowerCase()) ||
                jobTitle.includes(searchQuery.toLowerCase()) ||
                candidateSkills.includes(searchQuery.toLowerCase())
            ) &&
            (locationQuery === '' ||
                candidateLocation.includes(locationQuery.toLowerCase())
            )

        const matchesFilter = filter === 'All'
            || app.status.toLowerCase() === filter.toLowerCase()
            || (filter === 'Applied' && (app.status === 'viewed' || app.status === 'applied'))
            || (filter === 'Qualified' && app.aiMatchScore >= 80)
            || (filter === 'Interviews' && (app.status === 'interview' || app.status === 'scheduled'))
            || (filter === 'Finished Interviews' && app.status === 'interviewed')

        return matchesSearch && matchesFilter
    })

    const getStatusCount = (status) => {
        if (status === 'All') return applications.length;
        if (status === 'Applied') return applications.filter(a => a.status === 'applied' || a.status === 'viewed').length;
        if (status === 'Qualified') return applications.filter(a => (a.status === 'qualified' || a.aiMatchScore >= 80) && a.status !== 'rejected').length;
        if (status === 'Interviews') return applications.filter(a => a.status === 'interview' || a.status === 'scheduled').length;
        if (status === 'Finished Interviews') return applications.filter(a => a.status === 'interviewed').length;
        return applications.filter(a => a.status.toLowerCase() === status.toLowerCase()).length;
    }

    const SidebarItem = ({ icon: Icon, label, active = false, onClick, badge, className = '' }) => (
        <div
            onClick={onClick}
            className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${active
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                } ${className}`}
        >
            <div className="flex items-center gap-3">
                <Icon size={20} />
                <span className="font-medium text-sm">{label}</span>
            </div>
            {badge !== undefined && badge > 0 && (
                <span className="px-2 py-0.5 bg-blue-500/20 border border-blue-400/30 text-blue-400 rounded-full text-xs font-bold">
                    {badge}
                </span>
            )}
        </div>
    )

    const StatusBadge = ({ status }) => {
        const styles = {
            'applied': 'bg-blue-500/10 text-blue-400 border-blue-500/20',
            'viewed': 'bg-slate-500/10 text-slate-400 border-slate-500/20',
            'shortlisted': 'bg-orange-500/10 text-orange-400 border-orange-500/20',
            'screening': 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
            'interview': 'bg-purple-500/10 text-purple-400 border-purple-500/20',
            'scheduled': 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20',
            'interviewed': 'bg-blue-600/10 text-blue-400 border-blue-500/20',
            'selected': 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
            'rejected after interview': 'bg-red-600/10 text-red-500 border-red-500/20',
            'offer': 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
            'hired': 'bg-green-500/10 text-green-400 border-green-500/20',
            'qualified': 'bg-teal-500/10 text-teal-400 border-teal-500/20',
            'rejected': 'bg-red-500/10 text-red-400 border-red-500/20'
        }
        return (
            <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold border capitalize ${styles[status] || styles['applied']}`}>
                {status}
            </span>
        )
    }

    return (
        <div className="flex flex-col h-screen bg-slate-950 overflow-hidden">
            <Navbar />

            <div className="flex flex-1 overflow-hidden">
                {/* Left Sidebar */}
                <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col hidden lg:flex">
                    <div className="space-y-2 flex-1">
                        <Link to="/recruiter/dashboard">
                            <SidebarItem icon={LayoutDashboard} label="Dashboard" />
                        </Link>
                        <SidebarItem icon={Users} label="Candidates" active />
                        <Link to="/recruiter/jobs">
                            <SidebarItem icon={Briefcase} label="Jobs" badge={jobCount} />
                        </Link>

                        <Link to="/recruiter/calendar">
                            <SidebarItem icon={Calendar} label="Calendar" />
                        </Link>



                        <div className="pt-4 mt-4 border-t border-slate-800 space-y-2">
                            <Link to="/recruiter/chat">
                                <SidebarItem icon={MessageSquare} label="Messages" />
                            </Link>
                            <Link to="/recruiter/community">
                                <SidebarItem icon={Building2} label="Community" />
                            </Link>
                            <Link to="/recruiter/company-profile">
                                <SidebarItem icon={Building2} label="Company Profile" />
                            </Link>
                        </div>
                    </div>

                    <div className="space-y-2 mt-4">
                        <SidebarItem
                            icon={Home}
                            label="Exit"
                            onClick={() => navigate('/recruiter/home')}
                        />
                        <SidebarItem
                            icon={LogOut}
                            label="Logout"
                            onClick={() => logout()}
                            className="text-red-400 hover:bg-red-500/10 hover:text-red-400"
                        />
                    </div>

                    <div className="pt-6 border-t border-slate-800 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white">
                            {user?.firstName?.charAt(0) || 'R'}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white truncate max-w-[120px]">{user?.firstName || 'Recruiter'}</p>
                            <p className="text-[10px] text-slate-500">Hiring Manager</p>
                        </div>
                    </div>
                </aside>

                {/* Middle Column: Candidates List */}
                <main className="flex-1 md:w-[400px] border-r border-slate-800 flex flex-col bg-slate-950">
                    <div className="p-6 border-b border-slate-800 space-y-4">
                        <div className="flex gap-2">
                            <div className="relative flex-1">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type="text"
                                    placeholder="Skills, name, role..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                />
                            </div>
                            <div className="relative flex-[0.7]">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type="text"
                                    placeholder="Location..."
                                    value={locationQuery}
                                    onChange={(e) => setLocationQuery(e.target.value)}
                                    className="w-full bg-slate-900 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50"
                                />
                            </div>
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-hide">
                            {['All', 'Qualified', 'Shortlisted', 'Interviews', 'Finished Interviews'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all border flex items-center gap-2 ${filter === f
                                        ? 'bg-blue-600 border-blue-600 text-white'
                                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                                        }`}
                                >
                                    {f}
                                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] ${filter === f ? 'bg-white/20 text-white' : 'bg-slate-800 text-slate-500'}`}>
                                        {getStatusCount(f)}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-4 space-y-3">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                                <Loader2 className="animate-spin mb-4" size={32} />
                                <p className="text-sm">Loading candidates...</p>
                            </div>
                        ) : filteredApplications.length === 0 ? (
                            <div className="text-center py-12">
                                <p className="text-slate-500 text-sm">No candidates found.</p>
                            </div>
                        ) : (
                            filteredApplications.map(app => (
                                <motion.div
                                    key={app._id}
                                    layoutId={`card-${app._id}`}
                                    onClick={() => setSelectedId(app._id)}
                                    className={`p-4 rounded-2xl cursor-pointer transition-all border relative ${selectedId === app._id
                                        ? 'bg-blue-600/10 border-blue-500/50 ring-1 ring-blue-500/50'
                                        : 'bg-slate-900/50 border-slate-800 hover:bg-slate-900'
                                        } ${app.aiMatchScore >= 90 ? 'shadow-[0_0_15px_-3px_rgba(34,197,94,0.3)] border-green-500/30' : ''}`}
                                >
                                    {app.aiMatchScore >= 90 && (
                                        <div className="absolute -top-2 -right-2 px-2 py-0.5 bg-green-500 text-white text-[9px] font-bold uppercase tracking-wider rounded-full shadow-lg border border-green-400 flex items-center gap-1">
                                            <Sparkles size={8} fill="currentColor" /> Preferred
                                        </div>
                                    )}
                                    <div className="flex gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center font-bold text-white shrink-0 uppercase">
                                            {app.user?.photoUrl ? (
                                                <img src={app.user.photoUrl} alt="" className="w-full h-full object-cover rounded-xl" />
                                            ) : (
                                                app.user?.firstName?.[0] || '?'
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-bold text-white text-sm truncate">
                                                    {app.user?.firstName} {app.user?.lastName}
                                                </h4>
                                                <StatusBadge status={app.status} />
                                            </div>
                                            <p className="text-xs text-slate-400 mb-2 truncate">{app.job?.title}</p>
                                            <div className="flex items-center gap-2 text-[10px] text-slate-500">
                                                <MapPin size={12} />
                                                <span>{app.user?.location || 'Remote'}</span>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ))
                        )}
                    </div>
                </main>

                {/* Right Panel: Candidate Details */}
                <aside className="hidden xl:flex flex-[1.5] flex-col bg-slate-950 overflow-y-auto">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={selectedId}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="p-8"
                        >
                            {/* Profile Header */}
                            {selectedApplication ? (
                                <>
                                    <div className="flex items-start justify-between mb-8">
                                        <div className="flex gap-6">
                                            <div
                                                onClick={() => {
                                                    console.log('Profile clicked!', selectedApplication.user?.photoUrl);
                                                    if (selectedApplication.user?.photoUrl) {
                                                        setImagePreview(selectedApplication.user.photoUrl);
                                                    }
                                                }}
                                                className={`w-24 h-24 rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-4xl font-bold text-white shadow-2xl overflow-hidden ${selectedApplication.user?.photoUrl ? 'cursor-pointer hover:ring-4 hover:ring-blue-500/50 transition-all' : ''}`}
                                            >
                                                {selectedApplication.user?.photoUrl ? (
                                                    <img src={selectedApplication.user.photoUrl} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    selectedApplication.user?.firstName?.[0]
                                                )}
                                            </div>
                                            <div>
                                                <h2 className="text-3xl font-bold text-white mb-2">{selectedApplication.user?.firstName} {selectedApplication.user?.lastName}</h2>
                                                <p className="text-lg text-blue-400 font-medium mb-3">{selectedApplication.job?.title}</p>
                                                <div className="flex flex-wrap gap-4 text-slate-400 text-sm">
                                                    <div className="flex items-center gap-1.5">
                                                        <MapPin size={16} className="text-slate-600" />
                                                        {selectedApplication.user?.location || 'Remote'}
                                                    </div>
                                                    <div className="flex items-center gap-1.5">
                                                        <Clock size={16} className="text-slate-600" />
                                                        Level: {selectedApplication.user?.experienceLevel}
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            {selectedApplication.resumeUrl && (
                                                <button
                                                    onClick={() => setShowResumeModal(true)}
                                                    className="p-2.5 bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-600 hover:text-white transition-colors rounded-xl flex items-center gap-2"
                                                    title="View Candidate Resume"
                                                >
                                                    <FileText size={20} />
                                                </button>
                                            )}
                                            <button className="p-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-colors">
                                                <MoreVertical size={20} />
                                            </button>
                                        </div>
                                    </div>



                                    {/* Actions */}
                                    {/* Detailed Action Modal */}
                                    <AnimatePresence>
                                        {showActionModal && (
                                            <motion.div
                                                initial={{ opacity: 0, y: 10 }}
                                                animate={{ opacity: 1, y: 0 }}
                                                exit={{ opacity: 0, y: 10 }}
                                                className="absolute bottom-full mb-4 left-0 w-full bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl p-4 z-50"
                                            >
                                                <div className="flex justify-between items-center mb-4">
                                                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">Select Action</h3>
                                                    <button onClick={() => setShowActionModal(false)} className="text-slate-500 hover:text-white"><X size={16} /></button>
                                                </div>
                                                <div className="grid grid-cols-2 gap-3">
                                                    <button
                                                        onClick={() => handleCandidateAction('shortlist')}
                                                        className="p-3 bg-blue-600/10 hover:bg-blue-600/20 border border-blue-600/20 hover:border-blue-600/40 rounded-xl text-left transition-all group"
                                                    >
                                                        <CheckCircle className="text-blue-500 mb-2 group-hover:scale-110 transition-transform" size={20} />
                                                        <p className="text-xs font-bold text-blue-400">Shortlist</p>
                                                        <p className="text-[10px] text-slate-500">Mark as potential match</p>
                                                    </button>

                                                    <button
                                                        onClick={() => {
                                                            if (selectedApplication?.status === 'rejected') {
                                                                toast.error("Cannot schedule interviews for rejected candidates");
                                                                return;
                                                            }
                                                            setShowActionModal(false);
                                                            openInterviewModal();
                                                        }}
                                                        disabled={selectedApplication?.status === 'rejected'}
                                                        className={`p-3 rounded-xl text-left transition-all group ${selectedApplication?.status === 'rejected' ? 'bg-slate-800/50 border border-slate-700/50 opacity-50 cursor-not-allowed' : 'bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 hover:border-indigo-500/40'}`}
                                                    >
                                                        <Calendar className={`${selectedApplication?.status === 'rejected' ? 'text-slate-600' : 'text-indigo-500'} mb-2 group-hover:scale-110 transition-transform`} size={20} />
                                                        <p className={`text-xs font-bold ${selectedApplication?.status === 'rejected' ? 'text-slate-500' : 'text-indigo-400'}`}>Interview</p>
                                                        <p className="text-[10px] text-slate-500">Schedule a meeting</p>
                                                    </button>

                                                    <button
                                                        onClick={() => handleCandidateAction('message')}
                                                        className="p-3 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 hover:border-emerald-500/40 rounded-xl text-left transition-all group"
                                                    >
                                                        <MessageSquare className="text-emerald-500 mb-2 group-hover:scale-110 transition-transform" size={20} />
                                                        <p className="text-xs font-bold text-emerald-400">Message</p>
                                                        <p className="text-[10px] text-slate-500">Chat directly</p>
                                                    </button>

                                                    <button
                                                        onClick={() => handleCandidateAction('reject')}
                                                        className="p-3 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 rounded-xl text-left transition-all group"
                                                    >
                                                        <XCircle className="text-red-500 mb-2 group-hover:scale-110 transition-transform" size={20} />
                                                        <p className="text-xs font-bold text-red-400">Reject</p>
                                                        <p className="text-[10px] text-slate-500">Decline application</p>
                                                    </button>
                                                </div>
                                            </motion.div>
                                        )}
                                    </AnimatePresence>

                                    {/* Actions */}
                                    <div className="flex flex-col gap-4 mb-10">
                                        {selectedApplication?.status === 'interviewed' ? (
                                            <div className="bg-slate-900/50 p-6 rounded-2xl border border-blue-500/20 mb-4">
                                                <h4 className="text-sm font-bold text-white uppercase tracking-widest mb-4 flex items-center gap-2">
                                                    <Sparkles size={16} className="text-blue-400" /> Final Interview Decision
                                                </h4>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm(`Are you sure you want to SELECT ${selectedApplication.user?.firstName}? This will move them to the selected list.`)) {
                                                                handleCandidateAction('selected');
                                                            }
                                                        }}
                                                        disabled={updatingStatus}
                                                        className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-lg shadow-emerald-900/20 active:scale-95 disabled:opacity-50"
                                                    >
                                                        {updatingStatus ? <Loader2 size={18} className="animate-spin" /> : <Check size={20} />}
                                                        Select Candidate
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            if (window.confirm(`Are you sure you want to REJECT ${selectedApplication.user?.firstName} after interview?`)) {
                                                                handleCandidateAction('rejected after interview');
                                                            }
                                                        }}
                                                        disabled={updatingStatus}
                                                        className="flex-1 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/30 py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50"
                                                    >
                                                        {updatingStatus ? <Loader2 size={18} className="animate-spin" /> : <X size={20} />}
                                                        Not Select
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div className="grid grid-cols-2 gap-3 mb-2">
                                                <button
                                                    disabled={updatingStatus}
                                                    onClick={() => handleCandidateAction('shortlist')}
                                                    className="py-4 px-4 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20 active:scale-[0.98] transition-all"
                                                >
                                                    <CheckCircle size={20} className={updatingStatus ? 'animate-spin' : ''} />
                                                    {updatingStatus ? 'Processing...' : 'Shortlist Candidate'}
                                                </button>

                                                <button
                                                    disabled={updatingStatus}
                                                    onClick={() => handleCandidateAction('reject')}
                                                    className="py-4 px-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/20 rounded-xl font-bold flex items-center justify-center gap-2 active:scale-[0.98] transition-all"
                                                >
                                                    <XCircle size={20} /> Reject Candidate
                                                </button>
                                            </div>
                                        )}

                                        {/* AI Match Score Visualization */}
                                        <div className="mb-2 p-6 bg-white/[0.03] border border-white/10 rounded-3xl relative overflow-hidden group">
                                            <div className="flex items-center gap-6">
                                                <div className="relative w-24 h-24 flex items-center justify-center shrink-0">
                                                    <svg className="w-full h-full transform -rotate-90">
                                                        <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-800" />
                                                        <circle cx="48" cy="48" r="42" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={263.8} strokeDashoffset={263.8 - (263.8 * (selectedApplication.aiMatchScore || 0)) / 100} strokeLinecap="round"
                                                            className={selectedApplication.aiMatchScore >= 80 ? 'text-green-500' : selectedApplication.aiMatchScore >= 60 ? 'text-blue-500' : 'text-amber-500'}
                                                        />
                                                    </svg>
                                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                                                        <span className="text-2xl font-black text-white">{selectedApplication.aiMatchScore || '??'}%</span>
                                                        <span className="text-[8px] text-slate-500 uppercase font-black">ATS Match</span>
                                                    </div>
                                                </div>
                                                <div className="flex-1">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <div className="flex items-center gap-2">
                                                            <Sparkles className="text-blue-400" size={16} />
                                                            <h3 className="text-lg font-bold text-white">AI Analysis</h3>
                                                        </div>
                                                        <button
                                                            onClick={(e) => {
                                                                e.stopPropagation();
                                                                autoScanPending([selectedApplication], { forceRescan: true, autoClassify: true });
                                                            }}
                                                            disabled={analyzing}
                                                            className="px-3 py-1 bg-blue-500/10 hover:bg-blue-500/20 text-blue-400 border border-blue-500/20 rounded-lg text-[10px] font-bold uppercase transition-all flex items-center gap-1.5"
                                                        >
                                                            <Sparkles size={10} className={analyzing ? 'animate-spin' : ''} />
                                                            {analyzing ? 'Scanning...' : (selectedApplication.aiMatchScore ? 'Rescan' : 'Run Scan')}
                                                        </button>
                                                    </div>
                                                    <p className="text-slate-400 text-xs leading-relaxed italic">
                                                        {selectedApplication.aiAnalysis?.summary || "Profile analysis pending background scan..."}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3">
                                            <button
                                                onClick={openInterviewModal}
                                                disabled={selectedApplication?.status === 'rejected'}
                                                className={`py-3 px-4 ${selectedApplication?.status === 'rejected' ? 'opacity-50 cursor-not-allowed bg-slate-800 text-slate-500 border-slate-800' : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'} border rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all`}
                                                title={selectedApplication?.status === 'rejected' ? 'Cannot schedule for rejected candidates' : 'Schedule Interview'}
                                            >
                                                <Calendar size={16} /> Schedule Interview
                                            </button>

                                            <button
                                                onClick={() => handleCandidateAction('message')}
                                                className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all"
                                            >
                                                <MessageSquare size={16} /> Send Message
                                            </button>

                                            {['interview', 'scheduled', 'offer'].includes(selectedApplication?.status) && selectedApplication?.interviewDate && (
                                                <div className="col-span-2 flex flex-col gap-2">
                                                    {selectedApplication.meetingLink ? (
                                                        <a
                                                            href={selectedApplication.meetingLink.startsWith('http') ? selectedApplication.meetingLink : `https://${selectedApplication.meetingLink}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-900/40"
                                                        >
                                                            <Video size={16} /> Join External Meeting (Meet/Zoom)
                                                        </a>
                                                    ) : (
                                                        <Link
                                                            to={`/interview/${selectedApplication._id}`}
                                                            className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-900/40"
                                                        >
                                                            <Video size={16} /> Join Portal Video Call
                                                        </Link>
                                                    )}

                                                    {selectedApplication.interviewNotes && (
                                                        <div className="p-3 bg-slate-800/50 border border-slate-700 rounded-xl">
                                                            <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Interview Notes</p>
                                                            <p className="text-xs text-slate-300 italic">"{selectedApplication.interviewNotes}"</p>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Candidate Info Tabs Style */}
                                    <div className="space-y-10">
                                        {/* Summary Section */}
                                        <section>
                                            <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-2">
                                                <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Professional Summary</h3>
                                                {selectedApplication.user?.primarySkill && (
                                                    <div className="flex flex-wrap gap-2">
                                                        {selectedApplication.user.primarySkill.split(',').map((skill, i) => (
                                                            <span key={i} className="px-2 py-0.5 bg-blue-500/10 text-blue-400 text-[8px] font-black uppercase rounded border border-blue-500/20">
                                                                {skill.trim()}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                            <p className="text-slate-300 leading-relaxed text-sm bg-white/[0.02] p-6 rounded-2xl border border-white/5 shadow-inner">
                                                {selectedApplication.user?.aboutMe || 'The candidate has not provided a summary yet.'}
                                            </p>
                                        </section>

                                        {/* Dynamic Experience Section */}
                                        <section>
                                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 border-b border-slate-800 pb-2">Experience Timeline</h3>
                                            <div className="space-y-4">
                                                {selectedApplication.user?.experience?.length > 0 ? (
                                                    selectedApplication.user.experience.map((exp, i) => (
                                                        <div key={i} className="flex gap-4 p-5 bg-white/[0.03] border border-white/5 rounded-2xl hover:bg-white/[0.05] transition-all">
                                                            <div className="w-12 h-12 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-400 shrink-0">
                                                                <Briefcase size={20} />
                                                            </div>
                                                            <div>
                                                                <h4 className="text-white font-bold text-sm">{exp.role}</h4>
                                                                <p className="text-blue-400 text-xs font-semibold">{exp.company}</p>
                                                                <p className="text-slate-500 text-[10px] mt-1 italic">{exp.duration}</p>
                                                                <p className="text-slate-400 text-xs mt-2 leading-relaxed">{exp.description}</p>
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-6 bg-white/[0.01] border border-dashed border-white/10 rounded-2xl text-center">
                                                        <p className="text-slate-600 text-xs italic">No professional experience listed.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </section>

                                        {/* Dynamic Education Section */}
                                        <section>
                                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 border-b border-slate-800 pb-2">Academic Foundation</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {selectedApplication.user?.education?.length > 0 ? (
                                                    selectedApplication.user.education.map((edu, i) => (
                                                        <div key={i} className="p-5 bg-white/[0.03] border border-white/5 rounded-2xl">
                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="px-2 py-0.5 bg-indigo-500/20 text-indigo-400 text-[8px] font-black uppercase rounded border border-indigo-500/30">
                                                                    {edu.level || 'Degree'}
                                                                </span>
                                                                <span className="text-slate-600 text-[10px] font-bold">Class of {edu.yearOfPassing}</span>
                                                            </div>
                                                            <h4 className="text-white font-bold text-sm mb-1">{edu.degreeName || edu.schoolName || edu.schoolOrCollegeName}</h4>
                                                            <p className="text-slate-400 text-[11px] truncate">{edu.institutionName || edu.collegeName}</p>
                                                            {edu.score && (
                                                                <p className="text-blue-400 text-[10px] font-black mt-2">CGPA/Score: {edu.score}</p>
                                                            )}
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="col-span-2 p-6 bg-white/[0.01] border border-dashed border-white/10 rounded-2xl text-center">
                                                        <p className="text-slate-600 text-xs italic">No education details available.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </section>

                                        {/* Projects Section */}
                                        <section>
                                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 border-b border-slate-800 pb-2">Portfolio & Projects</h3>
                                            <div className="space-y-4">
                                                {selectedApplication.user?.projects?.length > 0 ? (
                                                    selectedApplication.user.projects.map((proj, i) => (
                                                        <div key={i} className="p-6 bg-teal-500/5 border border-teal-500/10 rounded-2xl hover:bg-teal-500/10 transition-all group">
                                                            <div className="flex justify-between items-start mb-3">
                                                                <h4 className="text-white font-bold">{proj.title}</h4>
                                                                {proj.link && (
                                                                    <a href={proj.link} target="_blank" rel="noreferrer" className="text-teal-400 hover:text-white transition-colors">
                                                                        <ExternalLink size={16} />
                                                                    </a>
                                                                )}
                                                            </div>
                                                            <p className="text-slate-400 text-xs mb-4 leading-relaxed">{proj.description}</p>
                                                            <div className="flex flex-wrap gap-2">
                                                                {proj.technologies?.map((tech, j) => (
                                                                    <span key={j} className="px-2 py-1 bg-white/5 border border-white/5 rounded text-[9px] font-bold text-slate-500 uppercase tracking-wider">
                                                                        {tech}
                                                                    </span>
                                                                ))}
                                                            </div>
                                                        </div>
                                                    ))
                                                ) : (
                                                    <div className="p-6 bg-white/[0.01] border border-dashed border-white/10 rounded-2xl text-center">
                                                        <p className="text-slate-600 text-xs italic">No projects showcased yet.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </section>

                                        {/* Milestones & Certifications */}
                                        <section>
                                            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 border-b border-slate-800 pb-2">Milestones & Certifications</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Accomplishments */}
                                                {(selectedApplication.user?.accomplishments || []).map((acc, i) => (
                                                    <div key={i} className="p-4 bg-amber-500/5 border border-amber-500/10 rounded-2xl">
                                                        <p className="text-[8px] font-black text-amber-500 uppercase tracking-widest mb-1">{acc.category || 'Achievement'}</p>
                                                        <h4 className="text-white font-bold text-xs mb-1">{acc.title}</h4>
                                                        <p className="text-slate-500 text-[10px] italic">{acc.date}</p>
                                                    </div>
                                                ))}
                                                {/* Certifications */}
                                                {(selectedApplication.user?.certifications || []).map((cert, i) => (
                                                    <div key={i} className="p-4 bg-emerald-500/5 border border-emerald-500/10 rounded-2xl">
                                                        <p className="text-[8px] font-black text-emerald-500 uppercase tracking-widest mb-1">Certification</p>
                                                        <h4 className="text-white font-bold text-xs mb-1">{cert.name}</h4>
                                                        <p className="text-slate-500 text-[10px] italic">{cert.issuer} • {cert.date}</p>
                                                    </div>
                                                ))}
                                                {(!selectedApplication.user?.accomplishments?.length && !selectedApplication.user?.certifications?.length) && (
                                                    <div className="col-span-2 p-6 bg-white/[0.01] border border-dashed border-white/10 rounded-2xl text-center">
                                                        <p className="text-slate-600 text-xs italic">No milestones or certifications listed.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </section>

                                        {/* Contact & Resume Section */}
                                        <section className="bg-blue-600/5 border border-blue-600/10 p-8 rounded-[2rem]">
                                            <h3 className="text-sm font-black text-white uppercase tracking-wider mb-6">Contact & Assets</h3>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                                                <div className="flex items-center gap-4 p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                                                    <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-500">
                                                        <Mail size={18} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Email Address</p>
                                                        <p className="text-xs text-white truncate font-bold">{selectedApplication.user?.email}</p>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-4 p-4 bg-slate-900 border border-slate-800 rounded-2xl">
                                                    <div className="w-10 h-10 rounded-xl bg-green-500/10 flex items-center justify-center text-green-500">
                                                        <Phone size={18} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Phone Number</p>
                                                        <p className="text-xs text-white font-bold">{selectedApplication.user?.phoneNumber || 'N/A'}</p>
                                                    </div>
                                                </div>
                                            </div>

                                            {/* Social Links */}
                                            <div className="grid grid-cols-3 gap-3 mb-8">
                                                {selectedApplication.user?.socialLinks?.github && (
                                                    <a href={selectedApplication.user.socialLinks.github} target="_blank" rel="noreferrer" className="p-3 bg-slate-800 hover:bg-slate-700 rounded-xl text-center transition-all border border-slate-700 group">
                                                        <Github size={18} className="mx-auto text-slate-400 group-hover:text-white" />
                                                    </a>
                                                )}
                                                {selectedApplication.user?.socialLinks?.linkedin && (
                                                    <a href={selectedApplication.user.socialLinks.linkedin} target="_blank" rel="noreferrer" className="p-3 bg-[#0A66C2]/10 hover:bg-[#0A66C2]/20 rounded-xl text-center transition-all border border-[#0A66C2]/20 group">
                                                        <span className="text-[10px] font-black text-[#0A66C2]">LinkedIn</span>
                                                    </a>
                                                )}
                                                {selectedApplication.user?.socialLinks?.portfolio && (
                                                    <a href={selectedApplication.user.socialLinks.portfolio} target="_blank" rel="noreferrer" className="p-3 bg-purple-500/10 hover:bg-purple-500/20 rounded-xl text-center transition-all border border-purple-500/20 group">
                                                        <span className="text-[10px] font-black text-purple-400">Portfolio</span>
                                                    </a>
                                                )}
                                            </div>

                                            {/* Resume Button */}
                                            {selectedApplication.user?.resumeUrl ? (
                                                <button
                                                    onClick={() => window.open(selectedApplication.user.resumeUrl, '_blank', 'noopener,noreferrer')}
                                                    className="w-full flex items-center justify-center gap-3 py-5 bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-[1.5rem] shadow-xl shadow-blue-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all font-black text-xs uppercase tracking-[0.2em]"
                                                >
                                                    <ExternalLink size={20} />
                                                    Open Cloud Resume (PDF)
                                                </button>
                                            ) : (
                                                <div className="w-full py-5 border border-dashed border-white/10 rounded-[1.5rem] text-center text-slate-600 text-[10px] font-black uppercase tracking-widest">
                                                    No Cloud Resume Available
                                                </div>
                                            )}
                                        </section>
                                    </div>
                                </>
                            ) : (
                                <div className="h-full flex items-center justify-center text-slate-500 italic">
                                    Select a candidate to view details
                                </div>
                            )}
                        </motion.div>
                    </AnimatePresence>
                </aside>
            </div>

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
            {/* Interview Schedule Modal */}
            <AnimatePresence>
                {showInterviewModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-800 flex justify-between items-center">
                                <h3 className="font-bold text-white text-lg">Schedule Interview</h3>
                                <button onClick={() => setShowInterviewModal(false)} className="text-slate-500 hover:text-white"><X size={20} /></button>
                            </div>
                            <div className="p-6 space-y-4">
                                {autoAssigning ? (
                                    <div className="flex flex-col items-center justify-center py-12 text-slate-500">
                                        <Loader2 className="animate-spin mb-4 text-blue-500" size={32} />
                                        <p className="text-sm font-bold animate-pulse text-blue-400">Finding Next Available Gap...</p>
                                        <p className="text-[10px] uppercase tracking-widest mt-2 opacity-60">Smart Sequential Booking</p>
                                    </div>
                                ) : (
                                    <>
                                        {/* Job Stats Banner */}
                                        {selectedApplication?.job && (
                                            <div className="grid grid-cols-2 gap-3 mb-2">
                                                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-center">
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Total Applied</span>
                                                    <span className="text-lg font-black text-white">
                                                        {applications.filter(a => a.job?._id === selectedApplication.job._id).length}
                                                    </span>
                                                </div>
                                                <div className="bg-slate-900 border border-slate-800 rounded-xl p-3 flex flex-col items-center justify-center">
                                                    <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Shortlisted</span>
                                                    <span className="text-lg font-black text-blue-400">
                                                        {applications.filter(a => a.job?._id === selectedApplication.job._id && (a.status === 'shortlisted' || a.status === 'interview')).length}
                                                    </span>
                                                </div>
                                            </div>
                                        )}

                                        {/* Always show auto-assign banner if it's a new scheduling and slot is populated */}
                                        {interviewForm.date && (!selectedId || !applications.find(a => a._id === selectedId)?.interviewDate) && (
                                            <div className="flex items-start gap-2 bg-blue-500/10 border border-blue-500/20 rounded-xl p-3">
                                                <Sparkles className="text-blue-500 shrink-0 mt-0.5" size={16} />
                                                <p className="text-xs text-blue-400 leading-relaxed font-medium">
                                                    <strong>Smart Sequential Booking</strong> — The system automatically found the first available 45-minute gap in your company's schedule starting from tomorrow.
                                                </p>
                                            </div>
                                        )}
                                        {/* Show edit banner if candidate already has a slot */}
                                        {selectedId && applications.find(a => a._id === selectedId)?.interviewDate && (
                                            <div className="flex items-start gap-2 bg-violet-500/10 border border-violet-500/20 rounded-xl p-3">
                                                <span className="text-base">✏️</span>
                                                <p className="text-xs text-violet-400 leading-relaxed">
                                                    <strong>Edit mode</strong> — You are editing an already scheduled interview.
                                                </p>
                                            </div>
                                        )}

                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Date <span className="normal-case text-slate-600">(optional — leave blank to auto-assign)</span></label>
                                            <input
                                                type="date"
                                                value={interviewForm.date}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                                                onChange={e => setInterviewForm({ ...interviewForm, date: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Time</label>
                                            <input
                                                type="time"
                                                value={interviewForm.time}
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                                                onChange={e => setInterviewForm({ ...interviewForm, time: e.target.value })}
                                            />
                                        </div>
                                        <div>
                                            <div className="flex justify-between items-center mb-2">
                                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">Meeting Link (Google Meet / Zoom)</label>
                                                <button
                                                    onClick={() => setInterviewForm({ ...interviewForm, link: `${window.location.origin}/interview/${selectedId}` })}
                                                    className="text-[10px] font-black text-blue-500 hover:text-blue-400 uppercase tracking-widest flex items-center gap-1 transition-colors"
                                                >
                                                    <Sparkles size={10} /> Generate Internal Link
                                                </button>
                                            </div>
                                            <input
                                                type="text"
                                                value={interviewForm.link}
                                                placeholder="Paste meet link here..."
                                                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none"
                                                onChange={e => setInterviewForm({ ...interviewForm, link: e.target.value })}
                                            />
                                            <p className="text-[10px] text-slate-500 mt-2 px-1 italic">
                                                You can paste your own link or click "Generate" above to use our internal room.
                                            </p>
                                        </div>
                                    </>
                                )}
                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Interview Instructions</label>
                                    <textarea
                                        rows="3"
                                        value={interviewForm.notes}
                                        placeholder="Add agenda, preparation tips, or candidate instructions..."
                                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-white focus:border-blue-500 outline-none resize-none"
                                        onChange={e => setInterviewForm({ ...interviewForm, notes: e.target.value })}
                                    ></textarea>
                                </div>
                                <button
                                    onClick={() => handleCandidateAction('interview', {
                                        interviewDate: interviewForm.date,
                                        interviewTime: interviewForm.time,
                                        meetingLink: interviewForm.link,
                                        interviewNotes: interviewForm.notes
                                    })}
                                    disabled={updatingStatus}
                                    className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-colors"
                                >
                                    {updatingStatus ? 'Scheduling...' : 'Confirm Schedule'}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            <ResumeViewerModal
                isOpen={showResumeModal}
                onClose={() => setShowResumeModal(false)}
                resumeUrl={selectedApplication?.resumeUrl}
                userName={selectedApplication?.user?.firstName || 'Candidate'}
            />
        </div >
    )
}

export default RecruiterCandidates
