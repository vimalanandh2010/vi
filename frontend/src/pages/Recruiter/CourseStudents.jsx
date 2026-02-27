import React, { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import Navbar from '../../components/Navbar'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Users,
    Mail,
    ChevronLeft,
    Loader2,
    BookOpen,
    Calendar,
    Clock,
    CheckCircle
} from 'lucide-react'
import axios from 'axios'
import { toast } from 'react-toastify'

const CourseStudents = () => {
    const { courseId } = useParams()
    const [students, setStudents] = useState([])
    const [loading, setLoading] = useState(true)
    const [courseDetails, setCourseDetails] = useState(null)

    useEffect(() => {
        fetchStudents()
        fetchCourseDetails()
    }, [courseId])

    const fetchCourseDetails = async () => {
        try {
            const res = await axios.get(`/api/courses/${courseId}`)
            setCourseDetails(res.data)
        } catch (err) {
            console.error(err)
        }
    }

    const fetchStudents = async () => {
        try {
            const token = localStorage.getItem('recruiterToken')
            const res = await axios.get(`/api/courses/students/${courseId}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            })
            setStudents(res.data)
        } catch (err) {
            console.error(err)
            toast.error('Failed to load students')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white pb-20">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-8">

                {/* Header */}
                <div className="mb-8">
                    <Link to="/recruiter/my-courses" className="inline-flex items-center gap-2 text-slate-400 hover:text-white mb-4 transition-colors">
                        <ChevronLeft size={20} /> Back to My Courses
                    </Link>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                        <div>
                            <h1 className="text-3xl font-bold flex items-center gap-3">
                                Students for <span className="text-purple-400">{courseDetails?.title || 'Course'}</span>
                            </h1>
                            <p className="text-slate-400 mt-1 flex items-center gap-4">
                                <span className="flex items-center gap-1.5"><BookOpen size={16} /> {courseDetails?.level}</span>
                                <span className="flex items-center gap-1.5"><Calendar size={16} /> Created {new Date(courseDetails?.createdAt).toLocaleDateString()}</span>
                            </p>
                        </div>
                        <div className="bg-slate-800 px-6 py-3 rounded-xl border border-slate-700">
                            <span className="text-slate-400 text-sm">Total Enrolled</span>
                            <p className="text-2xl font-bold text-white">{students.length}</p>
                        </div>
                    </div>
                </div>

                {/* Students List */}
                {loading ? (
                    <div className="flex justify-center py-20">
                        <Loader2 className="animate-spin text-purple-500" size={40} />
                    </div>
                ) : students.length === 0 ? (
                    <div className="bg-slate-800/30 border border-dashed border-slate-700 rounded-3xl p-20 text-center">
                        <Users size={48} className="text-slate-600 mx-auto mb-4" />
                        <h3 className="text-xl font-bold mb-2">No students yet</h3>
                        <p className="text-slate-400">Your course hasn't received any enrollments yet.</p>
                    </div>
                ) : (
                    <div className="grid gap-4">
                        <AnimatePresence>
                            {students.map((enrollment, idx) => (
                                <motion.div
                                    key={enrollment._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-2xl p-6 hover:border-purple-500/30 transition-all group"
                                >
                                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">

                                        {/* Student Info */}
                                        <div className="flex items-start gap-4">
                                            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-2xl font-bold text-white border border-slate-600 shadow-lg overflow-hidden">
                                                {enrollment.user?.photoUrl ? (
                                                    <img src={enrollment.user.photoUrl} alt="" className="w-full h-full object-cover" />
                                                ) : (
                                                    enrollment.user?.firstName?.charAt(0)
                                                )}
                                            </div>
                                            <div>
                                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                                    {enrollment.user?.firstName} {enrollment.user?.lastName}
                                                </h3>
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 text-slate-400 text-sm mt-1">
                                                    <a href={`mailto:${enrollment.user?.email}`} className="flex items-center gap-1.5 hover:text-purple-400 transition-colors">
                                                        <Mail size={14} /> {enrollment.user?.email}
                                                    </a>
                                                    <span className="flex items-center gap-1.5">
                                                        <Clock size={14} /> Enrolled {new Date(enrollment.createdAt).toLocaleDateString()}
                                                    </span>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Status / Progress */}
                                        <div className="flex items-center gap-4">
                                            <div className="text-right hidden sm:block">
                                                <p className="text-xs text-slate-500 uppercase font-bold mb-1">Status</p>
                                                <div className="bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-3 py-1 rounded-full text-xs font-bold capitalize">
                                                    {enrollment.status}
                                                </div>
                                            </div>
                                            <div className="h-10 w-[1px] bg-slate-700 hidden sm:block"></div>
                                            <div className="flex items-center gap-2 text-slate-400">
                                                <CheckCircle size={18} className="text-emerald-500" />
                                                <span className="font-bold">{enrollment.progress}% Complete</span>
                                            </div>
                                        </div>

                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}
            </div>
        </div>
    )
}

export default CourseStudents
