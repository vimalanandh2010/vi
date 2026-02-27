import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
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
    MapPin
} from 'lucide-react'
import { Link } from 'react-router-dom'
import axiosClient from '../../api/axiosClient'
import { toast } from 'react-toastify'

const MyPostings = () => {
    const [jobs, setJobs] = useState([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    useEffect(() => {
        fetchMyJobs()
    }, [])

    const fetchMyJobs = async () => {
        try {
            const token = localStorage.getItem('recruiterToken')
            const res = await axiosClient.get('jobs/my-postings')
            setJobs(res)
        } catch (err) {
            console.error(err)
            toast.error('Failed to load job postings')
        } finally {
            setLoading(false)
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Are you sure you want to delete this job posting?')) return
        try {
            const token = localStorage.getItem('recruiterToken')
            await axiosClient.delete(`jobs/${id}`)
            setJobs(jobs.filter(job => job._id !== id))
            toast.success('Job posting deleted successfully')
        } catch (err) {
            toast.error('Failed to delete job')
        }
    }

    const filteredJobs = jobs.filter(job =>
        job.title.toLowerCase().includes(searchTerm.toLowerCase())
    )

    return (
        <div className="min-h-screen bg-slate-900 text-white p-6 md:p-12">
            <div className="max-w-7xl mx-auto">

                <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                    <div>
                        <div className="flex items-center gap-3 mb-2">
                            <h1 className="text-4xl font-bold tracking-tight">My Job Postings</h1>
                            <span className="px-4 py-1.5 bg-blue-600/20 border border-blue-500/30 text-blue-400 rounded-full text-sm font-bold">
                                {jobs.length} {jobs.length === 1 ? 'Job' : 'Jobs'}
                            </span>
                        </div>
                        <p className="text-slate-400">Manage your active, draft, and closed job opportunities.</p>
                    </div>

                    <Link to="/recruiter/post-job" className="flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-xl shadow-blue-900/20 active:scale-95">
                        Post New Job
                    </Link>
                </header>

                {/* Filters & Search */}
                <div className="flex flex-col md:flex-row gap-4 mb-8">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search by job title..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-slate-800/40 border border-slate-700/50 text-white rounded-2xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all font-medium"
                        />
                    </div>
                    <button className="flex items-center gap-2 px-6 py-3 bg-slate-800/40 border border-slate-700/50 rounded-2xl text-slate-400 hover:text-white transition-all">
                        <Filter size={18} />
                        Status: Active
                    </button>
                </div>

                {/* Jobs Grid */}
                {loading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map(i => <div key={i} className="h-64 bg-slate-800/20 rounded-3xl animate-pulse" />)}
                    </div>
                ) : filteredJobs.length === 0 ? (
                    <div className="bg-slate-800/20 border border-dashed border-slate-700 rounded-3xl p-20 text-center">
                        <Briefcase size={48} className="text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2">No jobs found</h3>
                        <p className="text-slate-400 mb-8">You haven't posted any jobs matching your search yet.</p>
                        <Link to="/recruiter/post-job" className="text-blue-400 font-bold hover:underline">Launch your first job →</Link>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {filteredJobs.map((job) => (
                            <motion.div
                                key={job._id}
                                layout
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-6 rounded-3xl hover:border-blue-500/30 transition-all group relative overflow-hidden"
                            >
                                <div className="absolute top-0 right-0 p-4">
                                    <button className="text-slate-600 hover:text-white transition-colors">
                                        <MoreVertical size={20} />
                                    </button>
                                </div>

                                <div className="mb-6">
                                    <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-400 mb-4 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        <Briefcase size={24} />
                                    </div>
                                    <h3 className="text-xl font-bold text-white mb-2 line-clamp-1">{job.title}</h3>
                                    <div className="flex flex-wrap gap-3">
                                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                            <MapPin size={14} />
                                            {job.location}
                                        </div>
                                        <div className="flex items-center gap-1.5 text-xs text-slate-400">
                                            <Calendar size={14} />
                                            {new Date(job.createdAt).toLocaleDateString()}
                                        </div>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <div className="bg-slate-900/50 p-3 rounded-2xl border border-slate-700/30">
                                        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">Applicants</p>
                                        <div className="flex items-center gap-2">
                                            <Users size={16} className="text-blue-400" />
                                            <span className="text-lg font-bold">{job.applicants || 0}</span>
                                        </div>
                                    </div>
                                    <div className="bg-slate-900/50 p-3 rounded-2xl border border-slate-700/30">
                                        <p className="text-[10px] uppercase tracking-wider font-bold text-slate-500 mb-1">Status</p>
                                        <span className="text-sm font-bold text-green-400">Active</span>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3">
                                    <button className="flex-1 py-2.5 bg-slate-700 hover:bg-slate-600 text-white rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2">
                                        <Edit size={16} /> Edit
                                    </button>
                                    <button
                                        onClick={() => handleDelete(job._id)}
                                        className="p-2.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white rounded-xl transition-all border border-red-500/20"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                    <Link to={`/recruiter/job/${job._id}/applicants`} className="p-2.5 bg-blue-500/10 hover:bg-blue-500 text-blue-500 hover:text-white rounded-xl transition-all border border-blue-500/20">
                                        <ExternalLink size={18} />
                                    </Link>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default MyPostings
