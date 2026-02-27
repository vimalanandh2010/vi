import React, { useState, useEffect } from 'react'
import { Search, GraduationCap, Play, FileText, Loader2, BookOpen, Clock } from 'lucide-react'
import Navbar from '../../components/Navbar'
import { motion, AnimatePresence } from 'framer-motion'
import axiosClient from '../../api/axiosClient'
import { toast } from 'react-toastify'
import { X } from 'lucide-react'

const Courses = () => {
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [enrollments, setEnrollments] = useState([]);
    const [enrolling, setEnrolling] = useState(null);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

    useEffect(() => {
        fetchCourses();
        fetchMyEnrollments();
    }, []);

    const fetchMyEnrollments = async () => {
        try {
            const res = await axiosClient.get('courses/my-enrollments');
            if (Array.isArray(res)) {
                setEnrollments(res.map(e => e.course?._id || e.course));
            }
        } catch (err) {
            console.error('Error fetching enrollments:', err);
        }
    };

    const fetchCourses = async () => {
        try {
            const res = await axiosClient.get('courses');
            setCourses(res);
        } catch (err) {
            console.error('Error fetching courses:', err);
            toast.error('Failed to load courses');
        } finally {
            setLoading(false);
        }
    };

    const handleEnroll = async (courseId) => {
        setEnrolling(courseId);
        try {
            await axiosClient.post(`courses/enroll/${courseId}`, {});
            setEnrollments(prev => [...prev, courseId]);
            toast.success('Successfully enrolled in the course!');
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to enroll');
        } finally {
            setEnrolling(null);
        }
    };

    const filteredCourses = (Array.isArray(courses) ? courses : []).filter(course =>
        course.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        course.level?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const getLevelColor = (level) => {
        switch (level?.toLowerCase()) {
            case 'beginner':
                return 'from-green-500 to-emerald-500';
            case 'intermediate':
                return 'from-blue-500 to-cyan-500';
            case 'advanced':
                return 'from-purple-500 to-pink-500';
            default:
                return 'from-slate-500 to-slate-600';
        }
    };

    const handleViewCourse = (course) => {
        if (course.contentUrl) {
            setSelectedCourse(course);
            setIsVideoModalOpen(true);
        } else {
            toast.info('Course content not available');
        }
    };

    return (
        <div className="min-h-screen bg-slate-900 pb-20">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">

                {/* Header */}
                <div className="mb-12">
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-4xl font-bold text-white mb-4"
                    >
                        Learn & Grow 📚
                    </motion.h1>
                    <p className="text-slate-400 text-lg mb-8">Explore courses curated by top companies to boost your skills.</p>

                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                            <input
                                type="text"
                                placeholder="Search by course title, level, or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full bg-slate-800/50 border border-slate-700/50 text-white rounded-2xl py-4 pl-12 pr-4 focus:ring-2 focus:ring-blue-500/50 focus:outline-none transition-all"
                            />
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center py-20">
                        <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
                        <p className="text-slate-400">Loading courses...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        <AnimatePresence>
                            {filteredCourses.map((course, idx) => (
                                <motion.div
                                    key={course._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden hover:border-blue-500/30 transition-all group"
                                >
                                    {/* Thumbnail */}
                                    <div className={`h-48 bg-gradient-to-br ${getLevelColor(course.level)} relative flex items-center justify-center overflow-hidden`}>
                                        {course.thumbnailUrl ? (
                                            <img
                                                src={course.thumbnailUrl}
                                                alt={course.title}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <GraduationCap size={64} className="text-white/80" />
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-slate-900/80 to-transparent" />
                                        <div className="absolute bottom-4 left-4">
                                            <span className="px-3 py-1 bg-white/20 backdrop-blur-md text-white text-xs font-bold rounded-full border border-white/30">
                                                {course.level || 'All Levels'}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content */}
                                    <div className="p-6">
                                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors line-clamp-2">
                                            {course.title}
                                        </h3>
                                        <p className="text-slate-400 text-sm mb-6 line-clamp-3">
                                            {course.description || 'No description available'}
                                        </p>

                                        <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                                            <div className="flex items-center gap-2 text-slate-400 text-sm">
                                                <BookOpen size={16} />
                                                <span>{enrollments.includes(course._id) ? 'Enrolled' : 'Not Enrolled'}</span>
                                            </div>
                                            {enrollments.includes(course._id) ? (
                                                <button
                                                    onClick={() => handleViewCourse(course)}
                                                    className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-5 py-2 rounded-xl transition-all active:scale-95 font-semibold"
                                                >
                                                    <Play size={16} />
                                                    View
                                                </button>
                                            ) : (
                                                <button
                                                    onClick={() => handleEnroll(course._id)}
                                                    disabled={enrolling === course._id}
                                                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white px-5 py-2 rounded-xl transition-all active:scale-95 font-semibold"
                                                >
                                                    {enrolling === course._id ? (
                                                        <Loader2 className="animate-spin" size={16} />
                                                    ) : (
                                                        <GraduationCap size={16} />
                                                    )}
                                                    Enroll
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                )}

                {!loading && filteredCourses.length === 0 && (
                    <div className="text-center py-20">
                        <GraduationCap className="mx-auto text-slate-600 mb-4" size={64} />
                        <p className="text-slate-400 text-lg italic">No courses match your search criteria.</p>
                    </div>
                )}
            </div>

            {/* Video Player Modal */}
            <AnimatePresence>
                {isVideoModalOpen && selectedCourse && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsVideoModalOpen(false)}
                            className="absolute inset-0 bg-slate-950/90 backdrop-blur-sm"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
                        >
                            {/* Header */}
                            <div className="flex items-center justify-between p-4 sm:p-6 border-b border-slate-800 bg-slate-900/50">
                                <div className="flex items-center gap-4">
                                    <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${getLevelColor(selectedCourse.level)} flex items-center justify-center text-white/50`}>
                                        <Play size={24} className="text-white" fill="currentColor" />
                                    </div>
                                    <div>
                                        <h3 className="text-lg sm:text-xl font-bold text-white line-clamp-1">{selectedCourse.title}</h3>
                                        <div className="flex items-center gap-3 mt-1">
                                            <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                                                {selectedCourse.level || 'Beginner'}
                                            </span>
                                            {selectedCourse.instructor && (
                                                <span className="text-slate-500 text-sm">{selectedCourse.instructor}</span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setIsVideoModalOpen(false)}
                                    className="p-2.5 bg-slate-800/50 hover:bg-slate-700 text-slate-400 hover:text-white rounded-xl transition-colors"
                                    aria-label="Close modal"
                                >
                                    <X size={20} />
                                </button>
                            </div>

                            {/* Video Container */}
                            <div className="relative w-full bg-black aspect-video flex-shrink-0">
                                {selectedCourse.contentUrl?.endsWith('.pdf') ? (
                                    <iframe
                                        src={selectedCourse.contentUrl}
                                        className="w-full h-full border-0"
                                        title={selectedCourse.title}
                                    />
                                ) : (
                                    <video
                                        src={selectedCourse.contentUrl}
                                        className="w-full h-full outline-none"
                                        controls
                                        controlsList="nodownload"
                                        poster={selectedCourse.thumbnailUrl}
                                        autoPlay
                                    >
                                        Your browser does not support the video tag.
                                    </video>
                                )}
                            </div>

                            {/* Description/Details Section */}
                            <div className="p-6 sm:p-8 overflow-y-auto custom-scrollbar bg-slate-900">
                                <h4 className="text-white font-bold text-lg mb-3">About this course</h4>
                                <p className="text-slate-400 leading-relaxed max-w-4xl">
                                    {selectedCourse.description || 'No description available for this course.'}
                                </p>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default Courses
