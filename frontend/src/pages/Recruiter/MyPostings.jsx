import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Briefcase,
    Users,
    Edit,
    Trash2,
    ExternalLink,
    Search,
    Filter,
    MoreVertical,
    Calendar,
    MapPin,
    Plus,
    Loader2,
    ChevronRight,
    Target,
    Activity
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import RecruiterLayout from '../../components/RecruiterLayout'
import axiosClient from '../../api/axiosClient'
import { toast } from 'react-toastify'

const MyPostings = () => {
    const navigate = useNavigate()
    const [jobs, setJobs] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchMyJobs()
    }, [])

    const fetchMyJobs = async () => {
        try {
            const res = await axiosClient.get('jobs/my-postings')
            setJobs(res)
        } catch (err) {
            console.error(err)
            toast.error('Could not retrieve active mandates')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Confirm permanent deletion of this job record?')) return
        try {
            await axiosClient.delete(`jobs/${id}`)
            setJobs(jobs.filter(job => job._id !== id))
            toast.success('Record purged from database')
        } catch (err) {
            toast.error('Operation failed')
        }
    }

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase())
    )

    if (loading) {
        return (
            <RecruiterLayout>
                <div className="flex flex-col items-center justify-center h-[80vh] bg-white">
                    <Loader2 className="animate-spin text-black mb-4" size={48} />
                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Synchronizing Repository...</p>
                </div>
            </RecruiterLayout>
        )
    }

    return (
        <RecruiterLayout>
            <main className="p-8 md:p-12 lg:p-16 max-w-7xl mx-auto bg-white min-h-full">
                {/* Tactical Header */}
                <header className="flex flex-col lg:flex-row lg:items-end justify-between gap-12 mb-20">
                    <div>
                        <div className="flex items-center gap-2 mb-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                            Governance <ChevronRight size={12} /> Resource Allocation
                        </div>
                        <div className="flex items-center gap-6 mb-4">
                            <h1 className="text-6xl font-black text-black tracking-tighter">
                                Current <br />Mandates
                            </h1>
                            <div className="px-6 py-2 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-2xl">
                                {jobs.length} ACTIVE
                            </div>
                        </div>
                        <p className="text-slate-400 text-xl font-medium tracking-tight">Real-time management of deployed organizational roles.</p>
                    </div>

                    <Link
                        to="/recruiter/post-job"
                        className="inline-flex items-center gap-4 px-10 py-6 bg-black hover:bg-blue-600 text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-center text-xs transition-all shadow-[0_20px_50px_rgba(0,0,0,0.1)] active:scale-95 group"
                    >
                        Initiate Deployment
                        <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                    </Link>
                </header>

                {/* Operations Bar */}
                <div className="flex flex-col md:flex-row gap-6 mb-12">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-black transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Filter by title or identifier..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-50 border border-transparent focus:bg-white focus:border-slate-100 text-black font-bold rounded-[1.5rem] py-5 pl-16 pr-6 outline-none transition-all placeholder:text-slate-300"
                        />
                    </div>
                </div>

                {/* Mandate Inventory */}
                {filteredJobs.length === 0 ? (
                    <div className="bg-slate-50/50 border border-slate-100 border-dashed rounded-[4rem] p-32 text-center">
                        <Target size={64} className="text-slate-200 mx-auto mb-8" />
                        <h3 className="text-2xl font-black text-black mb-2">Zero Matches</h3>
                        <p className="text-slate-400 font-bold">No active mandates currently align with your filter parameters.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        <AnimatePresence>
                            {filteredJobs.map((job, idx) => (
                                <motion.div
                                    key={job._id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-white border border-slate-100 p-10 rounded-[3rem] hover:shadow-[0_40px_80px_rgba(0,0,0,0.05)] transition-all duration-500 group flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex justify-between items-start mb-8">
                                            <div className="w-16 h-16 bg-slate-50 border border-slate-100 rounded-2xl flex items-center justify-center text-black group-hover:bg-black group-hover:text-white transition-all shadow-sm">
                                                <Briefcase size={28} strokeWidth={2.5} />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-[8px] font-black uppercase tracking-[0.2em] border border-green-100">
                                                    Live
                                                </span>
                                            </div>
                                        </div>

                                        <h3 className="text-2xl font-black text-black mb-4 tracking-tight leading-tight group-hover:text-blue-600 transition-colors">{job.title}</h3>

                                        <div className="flex flex-col gap-3 mb-10">
                                            <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                <MapPin size={14} className="text-slate-300" />
                                                {job.location}
                                            </div>
                                            <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                <Calendar size={14} className="text-slate-300" />
                                                Depl: {new Date(job.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4 mb-10">
                                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 group-hover:bg-white transition-colors">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Talent Pool</p>
                                                <div className="flex items-center gap-3">
                                                    <Users size={20} className="text-blue-500" />
                                                    <span className="text-2xl font-black text-black tracking-tighter">{job.applicants || 0}</span>
                                                </div>
                                            </div>
                                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 group-hover:bg-white transition-colors">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">Engage Rate</p>
                                                <div className="flex items-center gap-3">
                                                    <Activity size={18} className="text-emerald-500" />
                                                    <span className="text-2xl font-black text-black tracking-tighter">—</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 pt-8 border-t border-slate-50">
                                        <Link
                                            to={`/recruiter/job/${job._id}/applicants`}
                                            className="flex-1 py-4 bg-black text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-blue-600 transition-all shadow-xl shadow-black/5 active:scale-95"
                                        >
                                            Pipeline
                                            <ChevronRight size={14} strokeWidth={3} />
                                        </Link>
                                        <Link
                                            to={`/recruiter/edit-job/${job._id}`}
                                            className="p-4 bg-slate-50 hover:bg-slate-100 text-black rounded-2xl transition-all border border-slate-100"
                                            title="Modify Mandate"
                                        >
                                            <Edit size={18} strokeWidth={2.5} />
                                        </Link>
                                        <Link
                                            to={`/recruiter/job-analytics/${job._id}`}
                                            className="p-4 bg-slate-50 hover:bg-slate-100 text-black rounded-2xl transition-all border border-slate-100"
                                            title="Analytical Insight"
                                        >
                                            <Activity size={18} strokeWidth={2.5} />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(job._id)}
                                            className="p-4 bg-slate-50 hover:bg-red-50 text-red-500 rounded-2xl transition-all border border-slate-100 hover:border-red-100"
                                            title="Purge Record"
                                        >
                                            <Trash2 size={18} />
                                        </button>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </main>
        </RecruiterLayout>
    )
}

export default MyPostings
