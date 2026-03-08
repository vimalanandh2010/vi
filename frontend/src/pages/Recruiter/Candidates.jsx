import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Users,
    Briefcase,
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
    Video,
    FileText,
    BarChart3,
    TrendingUp
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'react-toastify'
import axiosClient from '../../api/axiosClient'
import { Link, useNavigate, useLocation } from 'react-router-dom'
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

    useEffect(() => {
        const queryParams = new URLSearchParams(routerLocation.search)
        const skillsFromUrl = queryParams.get('skills')
        const locationFromUrl = queryParams.get('location')

        if (skillsFromUrl) setSearchQuery(skillsFromUrl)
        if (locationFromUrl) setLocationQuery(locationFromUrl)

        fetchData()
        fetchJobCount()
    }, [routerLocation.search])

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
                    toast.success(`Action successful: ${action}`)
                    setApplications(apps => apps.map(app => {
                        if (app._id !== selectedId) return app
                        return { ...app, status: res.applicationStatus || app.status }
                    }))
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
                {/* Middle Column: Candidates List */}
                <aside className="w-[450px] border-r border-slate-100 flex flex-col bg-white">
                    <div className="p-8 border-b border-slate-50 space-y-6">
                        <h1 className="text-3xl font-black text-black">Candidates</h1>
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                            <input
                                type="text"
                                placeholder="Search by name, role, or skills..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-3.5 pl-12 pr-4 text-sm text-black focus:outline-none focus:ring-4 focus:ring-black/5 focus:bg-white focus:border-black transition-all"
                            />
                        </div>
                        <div className="flex items-center gap-2 overflow-x-auto pb-2 custom-scrollbar">
                            {['All', 'Shortlisted', 'Interview', 'Selected', 'Rejected'].map(f => (
                                <button
                                    key={f}
                                    onClick={() => setFilter(f)}
                                    className={`px-4 py-2 rounded-xl text-xs font-black uppercase tracking-tight whitespace-nowrap transition-all flex items-center gap-2 ${filter === f
                                        ? 'bg-black text-white shadow-lg'
                                        : 'bg-slate-50 text-slate-500 hover:bg-slate-100'
                                        }`}
                                >
                                    {f}
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] ${filter === f ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-500'}`}>
                                        {getStatusCount(f)}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
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
                                    onClick={() => setSelectedId(app._id)}
                                    className={`p-6 rounded-3xl cursor-pointer transition-all border relative group ${selectedId === app._id
                                        ? 'bg-white border-black shadow-xl scale-[1.02]'
                                        : 'bg-white border-slate-100 hover:border-slate-300'
                                        }`}
                                >
                                    <div className="flex gap-5">
                                        <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center font-black text-black shrink-0 border border-slate-100">
                                            {app.user?.firstName?.[0] || '?'}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="flex justify-between items-start mb-1">
                                                <h4 className="font-black text-black text-lg truncate leading-tight">
                                                    {app.user?.firstName} {app.user?.lastName}
                                                </h4>
                                                <StatusBadge status={app.status} />
                                            </div>
                                            <p className="text-sm text-slate-500 font-bold mb-3 truncate">{app.job?.title}</p>
                                            <div className="flex items-center gap-4">
                                                <div className="flex items-center gap-1.5 text-[10px] font-black text-slate-400 uppercase tracking-tight">
                                                    <MapPin size={12} />
                                                    {app.user?.location || 'Remote'}
                                                </div>
                                                {app.aiMatchScore && (
                                                    <div className="flex items-center gap-1.5 text-[10px] font-black text-blue-600 uppercase tracking-tight">
                                                        <Sparkles size={12} />
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

                {/* Right Panel: Candidate Details */}
                <main className="flex-1 bg-[#FDFDFD] overflow-y-auto custom-scrollbar">
                    {selectedApplication ? (
                        <div className="p-12 max-w-5xl mx-auto">
                            <header className="flex items-start justify-between mb-12">
                                <div className="flex gap-8">
                                    <div className="w-32 h-32 rounded-[2.5rem] bg-black shadow-2xl flex items-center justify-center text-5xl font-black text-white shrink-0">
                                        {selectedApplication.user?.firstName?.[0]}
                                    </div>
                                    <div className="pt-2">
                                        <div className="flex items-center gap-4 mb-2">
                                            <h2 className="text-5xl font-black text-black tracking-tight">{selectedApplication.user?.firstName} {selectedApplication.user?.lastName}</h2>
                                            <StatusBadge status={selectedApplication.status} />
                                        </div>
                                        <p className="text-2xl text-slate-400 font-black mb-6 uppercase tracking-tight">{selectedApplication.job?.title}</p>
                                        <div className="flex flex-wrap gap-6">
                                            <div className="flex items-center gap-2 text-slate-500 font-black uppercase text-xs tracking-widest border-r border-slate-200 pr-6">
                                                <MapPin size={16} /> {selectedApplication.user?.location || 'Remote'}
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500 font-black uppercase text-xs tracking-widest border-r border-slate-200 pr-6">
                                                <Clock size={16} /> Exp: {selectedApplication.user?.experienceLevel}
                                            </div>
                                            <div className="flex items-center gap-2 text-slate-500 font-black uppercase text-xs tracking-widest">
                                                <Calendar size={16} /> Applied: {new Date(selectedApplication.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    {selectedApplication.resumeUrl && (
                                        <button
                                            onClick={() => setShowResumeModal(true)}
                                            className="px-6 py-3 bg-white border border-slate-200 text-black hover:border-black rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-sm"
                                        >
                                            View Resume
                                        </button>
                                    )}
                                    <button className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-black rounded-2xl transition-all shadow-sm">
                                        <MoreVertical size={24} />
                                    </button>
                                </div>
                            </header>

                            <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
                                <div className="lg:col-span-2 space-y-12">
                                    <section className="bg-white p-10 rounded-[2.5rem] border border-slate-100 shadow-sm">
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Professional Summary</h3>
                                        <p className="text-xl text-slate-600 leading-relaxed font-medium">
                                            {selectedApplication.user?.aboutMe || 'No summary provided.'}
                                        </p>
                                    </section>

                                    <section>
                                        <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.3em] mb-8">Experience</h3>
                                        <div className="space-y-6">
                                            {selectedApplication.user?.experience?.map((exp, i) => (
                                                <div key={i} className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-md transition-shadow">
                                                    <div className="flex justify-between items-start mb-4">
                                                        <div>
                                                            <h4 className="text-2xl font-black text-black mb-1">{exp.role}</h4>
                                                            <p className="text-blue-600 font-black uppercase text-xs tracking-widest">{exp.company}</p>
                                                        </div>
                                                        <span className="px-4 py-1.5 bg-slate-50 text-slate-500 rounded-xl text-[10px] font-black uppercase tracking-widest">{exp.duration}</span>
                                                    </div>
                                                    <p className="text-slate-600 font-medium leading-relaxed">{exp.description}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </section>
                                </div>

                                <div className="space-y-8">
                                    <section className="bg-black p-10 rounded-[2.5rem] text-white shadow-2xl relative overflow-hidden">
                                        <div className="relative z-10">
                                            <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] mb-8">AI Match Analysis</h3>
                                            <div className="flex items-center gap-6 mb-8">
                                                <div className="w-20 h-20 rounded-2xl bg-white/10 flex items-center justify-center text-4xl font-black shadow-inner border border-white/5">
                                                    {selectedApplication.aiMatchScore || '??'}%
                                                </div>
                                                <div>
                                                    <p className="text-white font-black text-lg mb-1">Strong Match</p>
                                                    <p className="text-slate-400 text-xs font-bold uppercase">ATS Ranking</p>
                                                </div>
                                            </div>
                                            <p className="text-slate-300 text-xs leading-relaxed font-medium mb-8">
                                                {selectedApplication.aiAnalysis?.summary || "AI analysis is currently processing this candidate's profile."}
                                            </p>
                                        </div>
                                        <div className="absolute top-[-20%] right-[-20%] w-48 h-48 bg-white/5 rounded-full blur-3xl" />
                                    </section>

                                    <div className="bg-white p-10 rounded-[3rem] border border-slate-100 shadow-xl space-y-6">
                                        <div className="grid grid-cols-2 gap-6">
                                            <button
                                                onClick={() => handleCandidateAction('shortlist')}
                                                className="p-[3px] bg-emerald-50 text-emerald-600 border border-emerald-100 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.15em] hover:bg-emerald-600 hover:text-white transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                                            >
                                                <Check size={18} /> Shortlist
                                            </button>
                                            <button
                                                onClick={() => handleCandidateAction('interview')}
                                                className="p-[3px] bg-blue-50 text-blue-600 border border-blue-100 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.15em] hover:bg-blue-600 hover:text-white transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                                            >
                                                <Calendar size={18} /> Schedule
                                            </button>
                                        </div>
                                        <button
                                            onClick={() => handleCandidateAction('reject')}
                                            className="w-full py-1 bg-red-50 text-red-600 border border-red-100 rounded-[1.5rem] font-black text-[10px] uppercase tracking-[0.2em] hover:bg-red-600 hover:text-white transition-all flex items-center justify-center gap-2 active:scale-[0.98]"
                                        >
                                            <XCircle size={18} /> Decline Application
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-300">
                            <Users size={80} className="mb-6 opacity-20" />
                            <p className="text-2xl font-black uppercase tracking-widest opacity-30">Select a candidate to view</p>
                        </div>
                    )}
                </main>
            </div>

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
