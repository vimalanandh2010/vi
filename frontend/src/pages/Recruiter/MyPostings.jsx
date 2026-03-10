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
                    <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
                    <p className="text-sm font-semibold text-gray-600">Loading your job postings...</p>
                </div>
            </RecruiterLayout>
        )
    }

    return (
        <RecruiterLayout>
            <main className="p-4 sm:p-8 md:p-12 lg:p-16 max-w-7xl mx-auto bg-white min-h-full">
                {/* Header */}
                <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 mb-12">
                    <div>
                        <div className="flex flex-wrap items-center gap-4 mb-2">
                            <h1 className="text-4xl font-bold text-gray-900">
                                Your Job Postings
                            </h1>
                            <div className="px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold shadow-sm">
                                {jobs.length} Active
                            </div>
                        </div>
                        <p className="text-gray-600 text-sm font-medium">Manage and monitor your active job listings</p>
                    </div>

                    <Link
                        to="/recruiter/post-job"
                        className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold text-sm transition-all shadow-md hover:shadow-lg active:scale-95 group"
                    >
                        Create New Job
                        <Plus size={18} className="group-hover:rotate-90 transition-transform" />
                    </Link>
                </header>

                {/* Search Bar */}
                <div className="flex flex-col md:flex-row gap-6 mb-8">
                    <div className="relative flex-1 group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
                        <input
                            type="text"
                            placeholder="Search by job title..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-200 focus:bg-white focus:border-blue-500 text-gray-900 font-medium rounded-lg py-3 pl-12 pr-4 outline-none transition-all placeholder:text-gray-400"
                        />
                    </div>
                </div>

                {/* Job Listings */}
                {filteredJobs.length === 0 ? (
                    <div className="bg-gray-50 border-2 border-gray-200 border-dashed rounded-2xl p-20 text-center">
                        <Target size={48} className="text-gray-300 mx-auto mb-6" />
                        <h3 className="text-xl font-bold text-gray-900 mb-2">No Jobs Found</h3>
                        <p className="text-gray-600 font-medium text-sm">No job postings match your search criteria.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredJobs.map((job, idx) => (
                                <motion.div
                                    key={job._id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-white border-2 border-gray-200 p-6 rounded-2xl hover:shadow-lg transition-all duration-300 group flex flex-col justify-between"
                                >
                                    <div>
                                        <div className="flex justify-between items-start mb-6">
                                            <div className="w-12 h-12 bg-blue-50 border border-blue-100 rounded-xl flex items-center justify-center text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                                <Briefcase size={22} strokeWidth={2.5} />
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="px-3 py-1 bg-green-50 text-green-600 rounded-lg text-xs font-semibold border border-green-100">
                                                    Active
                                                </span>
                                            </div>
                                        </div>

                                        <h3 className="text-xl font-bold text-gray-900 mb-3 leading-tight group-hover:text-blue-600 transition-colors">{job.title}</h3>

                                        <div className="flex flex-col gap-2 mb-6">
                                            <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                                                <MapPin size={14} className="text-gray-400" />
                                                {job.location}
                                            </div>
                                            <div className="flex items-center gap-2 text-xs font-medium text-gray-600">
                                                <Calendar size={14} className="text-gray-400" />
                                                Posted: {new Date(job.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-3 mb-6">
                                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 group-hover:bg-white transition-colors">
                                                <p className="text-xs font-semibold text-gray-500 mb-1">Applicants</p>
                                                <div className="flex items-center gap-2">
                                                    <Users size={18} className="text-blue-500" />
                                                    <span className="text-2xl font-bold text-gray-900">{job.applicants || 0}</span>
                                                </div>
                                            </div>
                                            <div className="bg-gray-50 p-4 rounded-xl border border-gray-100 group-hover:bg-white transition-colors">
                                                <p className="text-xs font-semibold text-gray-500 mb-1">Activity</p>
                                                <div className="flex items-center gap-2">
                                                    <Activity size={16} className="text-green-500" />
                                                    <span className="text-2xl font-bold text-gray-900">—</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 pt-6 border-t border-gray-100">
                                        <Link
                                            to={`/recruiter/job/${job._id}/applicants`}
                                            className="flex-1 py-3 bg-blue-600 text-white rounded-lg font-semibold text-sm flex items-center justify-center gap-2 hover:bg-blue-700 transition-all active:scale-95"
                                        >
                                            View Applicants
                                            <ChevronRight size={16} strokeWidth={2.5} />
                                        </Link>
                                        <Link
                                            to={`/recruiter/edit-job/${job._id}`}
                                            className="p-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-lg transition-all border border-gray-200"
                                            title="Edit Job"
                                        >
                                            <Edit size={18} strokeWidth={2.5} />
                                        </Link>
                                        <button
                                            onClick={() => handleDelete(job._id)}
                                            className="p-3 bg-gray-50 hover:bg-red-50 text-red-500 rounded-lg transition-all border border-gray-200 hover:border-red-200"
                                            title="Delete Job"
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
