import React, { useState, useEffect } from 'react'
import { Bookmark, MapPin, Briefcase, Trash2, Loader2, ArrowLeft, ArrowRight, MessageSquare, Building2 } from 'lucide-react'
import Navbar from '../../components/Navbar'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import axiosClient from '../../api/axiosClient'
import { toast } from 'react-toastify'
import { useNavigate } from 'react-router-dom'

const SavedJobs = () => {
    const [savedJobs, setSavedJobs] = useState([])
    const [loading, setLoading] = useState(true)
    const navigate = useNavigate()

    useEffect(() => {
        fetchSavedJobs()
    }, [])

    const fetchSavedJobs = async () => {
        const token = localStorage.getItem('seekerToken');
        if (!token) {
            navigate('/login');
            return;
        }

        try {
            const res = await axiosClient.get('/auth/me');
            const savedIds = res.savedJobs || [];

            if (savedIds.length === 0) {
                setLoading(false);
                return;
            }

            const jobsRes = await axiosClient.get('/jobs/saved-details');
            setSavedJobs(jobsRes || []);
        } catch (err) {
            console.error('Error fetching saved jobs:', err);
            toast.error('Failed to load saved jobs');
        } finally {
            setLoading(false);
        }
    };

    const handleRemove = async (jobId) => {
        const token = localStorage.getItem('seekerToken');
        if (!token) return

        try {
            await axiosClient.post(`/jobs/save/${jobId}`)
            setSavedJobs(prev => prev.filter(job => job._id !== jobId))
            toast.success('Job removed from saved list')
        } catch (err) {
            toast.error('Failed to remove job')
        }
    }

    const handleMessage = async (recruiterId) => {
        const token = localStorage.getItem('seekerToken');
        if (!token) {
            toast.error('Please login to message recruiters');
            return;
        }

        try {
            const res = await axiosClient.post('chat/conversations/start', { targetUserId: recruiterId });
            navigate('/seeker/chat', { state: { activeChatId: res.conversation?._id } });
        } catch (err) {
            console.error('Error starting chat:', err);
            toast.error('Failed to start conversation');
        }
    };

    return (
        <div className="min-h-screen bg-white pb-20">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">
                <Link to="/seeker/dashboard" className="inline-flex items-center gap-2 text-slate-500 hover:text-black transition-colors mb-8 group">
                    <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform" />
                    Back to Dashboard
                </Link>

                <div className="mb-12">
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">Saved Jobs</h1>
                    <p className="text-slate-500 font-medium italic">Your personal collection of interesting opportunities.</p>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="animate-spin text-purple-500 mb-4" size={40} />
                        <p className="text-slate-400">Loading your bookmarks...</p>
                    </div>
                ) : savedJobs.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {savedJobs.map((job, idx) => (
                                <motion.div
                                    key={job._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-white border-2 border-blue-200/50 rounded-2xl p-6 shadow-xl hover:shadow-2xl hover:shadow-blue-500/20 hover:border-blue-300 transition-all duration-300 group relative"
                                >
                                    <button
                                        onClick={() => handleRemove(job._id)}
                                        className="absolute top-4 right-4 p-2 text-slate-500 hover:text-red-400 hover:bg-red-500/10 rounded-lg transition-all"
                                        title="Remove from saved"
                                    >
                                        <Trash2 size={18} />
                                    </button>

                                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-700 flex items-center justify-center text-2xl mb-4 transition-all duration-300 group-hover:scale-110">
                                        <Building2 size={24} className="text-white stroke-white" strokeWidth={2.5} />
                                    </div>

                                    <h3 className="text-xl font-bold text-slate-900 mb-1 group-hover:text-blue-900 transition-colors pr-8">{job.title}</h3>
                                    <p className="text-slate-600 group-hover:text-blue-700 font-bold mb-6 transition-colors">{job.company?.name || job.company}</p>

                                    <div className="space-y-3 mb-8">
                                        <div className="flex items-center gap-2 text-slate-500 group-hover:text-blue-700 text-sm font-medium transition-colors">
                                            <MapPin size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                                            {job.location}
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-500 group-hover:text-blue-700 text-sm font-medium transition-colors">
                                            <Briefcase size={16} className="text-slate-400 group-hover:text-blue-600 transition-colors" />
                                            {job.type}
                                        </div>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-slate-100 group-hover:border-blue-200 transition-colors duration-300">
                                        <div className="flex flex-col">
                                            <p className="text-slate-900 font-bold group-hover:text-blue-900 transition-colors">{job.salary || 'Competitive'}</p>
                                            {job.postedBy && (
                                                <button
                                                    onClick={() => handleMessage(job.postedBy._id || job.postedBy)}
                                                    className="flex items-center gap-1.5 text-slate-500 group-hover:text-blue-600 hover:text-blue-700 text-xs font-bold mt-1 transition-colors"
                                                >
                                                    <MessageSquare size={14} className="group-hover:text-blue-600 transition-colors" />
                                                    Message
                                                </button>
                                            )}
                                        </div>
                                        <Link
                                            to="/seeker/jobs"
                                            className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-xl text-sm transition-all shadow-lg shadow-blue-500/30"
                                        >
                                            View Details <ArrowRight size={16} />
                                        </Link>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                ) : (
                    <div className="text-center py-24 bg-slate-800/20 rounded-3xl border border-dashed border-slate-700">
                        <div className="w-20 h-20 bg-slate-700/30 rounded-full flex items-center justify-center mx-auto mb-6">
                            <Bookmark size={32} className="text-slate-500" />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Your collection is empty</h3>
                        <p className="text-slate-400 mb-8 max-w-sm mx-auto">Explore jobs and click the bookmark icon to save the ones you're interested in.</p>
                        <Link to="/seeker/jobs" className="bg-purple-600 hover:bg-purple-500 text-white px-8 py-3 rounded-2xl font-bold transition-all inline-flex items-center gap-2">
                            Explore Jobs <ArrowRight size={20} />
                        </Link>
                    </div>
                )}
            </div>
        </div>
    )
}

export default SavedJobs
