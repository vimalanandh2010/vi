import React, { useState, useEffect } from 'react'
import Navbar from '../../components/Navbar'
import { Search, Briefcase, Building2, TrendingUp, GraduationCap, Users, Code, Globe, Zap, MessageCircle, Code2, Cpu, Settings, LineChart, BarChart, Palette, ArrowRight, MapPin } from 'lucide-react'
import { motion } from 'framer-motion'
import axiosClient from '../../api/axiosClient'
import { useNavigate, Link } from 'react-router-dom'
import { toast } from 'react-toastify'
import VerificationBadge from '../../components/Common/VerificationBadge'
import CommunityCard from '../../components/Community/CommunityCard'

const Home = () => {
    const navigate = useNavigate()
    const [liveCategories, setLiveCategories] = useState([])
    const [topCompanies, setTopCompanies] = useState([])
    const [courses, setCourses] = useState([])
    const [jobs, setJobs] = useState([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState(null)
    const [recentActivity, setRecentActivity] = useState([])

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                const token = localStorage.getItem('seekerToken');

                const promises = [
                    axiosClient.get('jobs/categories'),
                    axiosClient.get('jobs/top-companies'),
                    axiosClient.get('courses'),
                    axiosClient.get('jobs'),
                    axiosClient.get('community')
                ];

                if (token) {
                    promises.push(axiosClient.get('dashboard/seeker'));
                }

                const results = await Promise.all(promises);

                const catsRes = results[0];
                const companiesRes = results[1];
                const coursesRes = results[2];
                const jobsRes = results[3];
                const communitiesRes = results[4];
                const dashboardRes = token ? results[5] : null;

                if (Array.isArray(catsRes)) setLiveCategories(catsRes)
                if (Array.isArray(companiesRes)) setTopCompanies(companiesRes)
                if (Array.isArray(coursesRes)) setCourses(coursesRes.slice(0, 3))
                if (Array.isArray(jobsRes)) setJobs(jobsRes.slice(0, 4))
                if (Array.isArray(communitiesRes)) setCommunities(communitiesRes.slice(0, 3))

                if (dashboardRes) {
                    setStats(dashboardRes.stats);
                    setRecentActivity(dashboardRes.recentActivity);
                }

            } catch (err) {
                console.error('Error fetching home data:', err)
            } finally {
                setLoading(false)
            }
        }
        fetchHomeData()
    }, [])


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

    const categoryIcons = {
        'IT': Code2,
        'Non-IT': Briefcase,
        'Remote': Globe,
        'Engineering': Cpu,
        'Data Science': BarChart,
        'Design': Palette,
        'Finance': LineChart,
        'Hardware': Zap,
        'Product': Settings,
        'Sales': TrendingUp,
        'Marketing': Zap
    }

    const defaultIcon = Code2
    const colors = [
        'from-blue-500 to-cyan-500',
        'from-purple-500 to-pink-500',
        'from-green-500 to-emerald-500',
        'from-orange-500 to-yellow-500',
        'from-red-500 to-rose-500',
        'from-indigo-500 to-purple-500'
    ]

    const categories = liveCategories.length > 0 ? liveCategories.map((cat, idx) => ({
        id: idx,
        name: cat.name,
        icon: categoryIcons[cat.name] || defaultIcon,
        count: cat.count,
        color: colors[idx % colors.length]
    })) : []

    const [communities, setCommunities] = useState([])

    const trendingJobs = ['ReactJS Developer', 'Data Analyst', 'Python Developer', 'UI/UX Designer', 'DevOps Engineer']

    return (
        <div className="min-h-screen bg-slate-900">
            <Navbar />

            {/* Hero Section */}
            <section className="relative bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 pt-16 pb-24">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-600/10 rounded-full blur-[120px]" />
                    <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-purple-600/10 rounded-full blur-[120px]" />
                </div>

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                        className="text-center mb-12"
                    >
                        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                            Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Dream Job</span>
                        </h1>
                        <p className="text-xl text-slate-400 max-w-2xl mx-auto">
                            Discover opportunities that match your skills and aspirations
                        </p>
                    </motion.div>

                    {/* Hero Text */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8 }}
                        className="text-center py-10"
                    >
                        <Link
                            to="/seeker/jobs"
                            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-10 py-5 rounded-2xl font-black text-xl shadow-2xl shadow-blue-900/40 transition-all hover:scale-105 active:scale-95 mb-12"
                        >
                            Explore All Jobs <ArrowRight size={24} />
                        </Link>

                        {/* Quick Links / Trending */}
                        <div className="flex flex-wrap justify-center gap-3">
                            {trendingJobs.map((job, index) => (
                                <motion.span
                                    key={index}
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    transition={{ delay: 0.5 + (index * 0.1) }}
                                    onClick={() => navigate(`/seeker/jobs?search=${encodeURIComponent(job)}`)}
                                    className="px-5 py-2.5 bg-slate-800/40 backdrop-blur-md border border-slate-700/50 hover:border-blue-500/50 hover:bg-slate-800 text-slate-300 hover:text-white text-sm font-bold rounded-xl cursor-pointer transition-all"
                                >
                                    {job}
                                </motion.span>
                            ))}
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Dashboard Stats Section (Visible only when logged in) */}
            {stats && (
                <section className="py-8 px-4 sm:px-6 lg:px-8 -mt-12 relative z-10">
                    <div className="max-w-7xl mx-auto">
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-xl">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-slate-400 text-sm font-medium">Applied</p>
                                    <div className="p-2 bg-blue-500/20 rounded-lg">
                                        <Briefcase size={20} className="text-blue-400" />
                                    </div>
                                </div>
                                <h3 className="text-3xl font-bold text-white">{stats.applied}</h3>
                                <p className="text-xs text-slate-500 mt-1">Total Applications</p>
                            </motion.div>

                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-xl">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-slate-400 text-sm font-medium">Shortlisted</p>
                                    <div className="p-2 bg-purple-500/20 rounded-lg">
                                        <TrendingUp size={20} className="text-purple-400" />
                                    </div>
                                </div>
                                <h3 className="text-3xl font-bold text-white">{stats.shortlisted}</h3>
                                <p className="text-xs text-slate-500 mt-1">Profile Views</p>
                            </motion.div>

                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-xl">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-slate-400 text-sm font-medium">Interviews</p>
                                    <div className="p-2 bg-green-500/20 rounded-lg">
                                        <Users size={20} className="text-green-400" />
                                    </div>
                                </div>
                                <h3 className="text-3xl font-bold text-white">{stats.interviews}</h3>
                                <p className="text-xs text-slate-500 mt-1">Upcoming</p>
                            </motion.div>

                            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }} className="bg-slate-800/80 backdrop-blur-md border border-slate-700 rounded-2xl p-6 shadow-xl">
                                <div className="flex items-center justify-between mb-2">
                                    <p className="text-slate-400 text-sm font-medium">Offers</p>
                                    <div className="p-2 bg-yellow-500/20 rounded-lg">
                                        <GraduationCap size={20} className="text-yellow-400" />
                                    </div>
                                </div>
                                <h3 className="text-3xl font-bold text-white">{stats.offers}</h3>
                                <p className="text-xs text-slate-500 mt-1">Received</p>
                            </motion.div>
                        </div>
                    </div>
                </section>
            )}

            {/* Categories Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-bold text-white mb-8">Browse by Category</h2>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
                        {categories.map((category) => {
                            const Icon = category.icon
                            return (
                                <motion.div
                                    key={category.id}
                                    whileHover={{ scale: 1.05 }}
                                    onClick={() => navigate(`/seeker/jobs?search=${encodeURIComponent(category.name)}`)}
                                    className="bg-slate-800/40 border border-slate-700/50 rounded-xl p-6 cursor-pointer hover:border-blue-500/50 transition-all group"
                                >
                                    <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${category.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                                        <Icon size={24} className="text-white" />
                                    </div>
                                    <h3 className="text-white font-semibold mb-1">{category.name}</h3>
                                    <p className="text-slate-400 text-sm">{category.count} jobs</p>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            </section>

            {/* Recent Jobs Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-800/10">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold text-white">Recent Job Openings</h2>
                        <Link to="/seeker/jobs" className="text-blue-400 hover:text-blue-300 transition-colors">View All Jobs →</Link>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                        {jobs.map((job) => (
                            <motion.div
                                key={job._id}
                                whileHover={{ y: -5 }}
                                className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6 hover:border-blue-500/30 transition-all group relative"
                            >
                                <div onClick={() => navigate('/seeker/jobs')} className="cursor-pointer">
                                    <div className="w-12 h-12 rounded-xl bg-slate-700/50 flex items-center justify-center text-2xl mb-4 group-hover:scale-110 transition-transform overflow-hidden">
                                        {job.company?.logo || job.companyLogo ? (
                                            <img src={job.company?.logo || job.companyLogo} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            "🏢"
                                        )}
                                    </div>
                                    <h3 className="text-lg font-bold text-white mb-1 group-hover:text-blue-400 transition-colors truncate">{job.title}</h3>
                                    <div className="flex items-center justify-between mb-4">
                                        <p className="text-blue-400 text-sm font-medium">{job.companyName || job.company?.name || job.company}</p>
                                        <VerificationBadge
                                            level={job.company?.verificationLevel || 0}
                                            status={job.company?.verificationStatus || 'unverified'}
                                            showLabel={false}
                                        />
                                    </div>
                                    <div className="space-y-2 mb-6">
                                        <div className="flex items-center gap-2 text-slate-400 text-xs">
                                            <MapPin size={14} />
                                            {job.location}
                                        </div>
                                        <div className="flex items-center gap-2 text-slate-400 text-xs">
                                            <Briefcase size={14} />
                                            {job.type}
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center justify-between pt-4 border-t border-slate-700/50">
                                    <div className="flex flex-col">
                                        <p className="text-white font-bold text-sm">{job.salary || 'Competitive'}</p>
                                        {job.postedBy && (
                                            <button
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleMessage(job.postedBy._id || job.postedBy);
                                                }}
                                                className="text-blue-400 hover:text-blue-300 text-[10px] font-bold mt-1 uppercase tracking-wider"
                                            >
                                                Message
                                            </button>
                                        )}
                                    </div>
                                    <ArrowRight size={18} className="text-blue-500 group-hover:translate-x-1 transition-transform" />
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Top Companies Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-800/20">
                <div className="max-w-7xl mx-auto">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-3xl font-bold text-white">Top Companies Hiring</h2>
                        <button className="text-blue-400 hover:text-blue-300 transition-colors">View All →</button>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
                        {topCompanies.map((company, idx) => (
                            <motion.div
                                key={company.id || idx}
                                whileHover={{ y: -5 }}
                                className="bg-slate-800/60 border border-slate-700/50 rounded-xl p-6 text-center cursor-pointer hover:border-blue-500/50 transition-all"
                                onClick={() => navigate(`/seeker/jobs?search=${encodeURIComponent(company.name)}`)}
                            >
                                <div className="text-5xl mb-3">{company.logo}</div>
                                <h3 className="text-white font-semibold mb-1">{company.name}</h3>
                                <p className="text-sm text-slate-400">{company.openings} openings</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Courses Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-bold text-white mb-8">Recommended Courses</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {courses.map((course, idx) => (
                            <div
                                key={course._id || course.id || idx}
                                className="bg-slate-800/40 border border-slate-700/50 rounded-xl overflow-hidden hover:border-blue-500/50 transition-all cursor-pointer"
                                onClick={() => navigate('/seeker/courses')}
                            >
                                <div className="h-40 bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center">
                                    <GraduationCap size={48} className="text-white" />
                                </div>
                                <div className="p-6">
                                    <h3 className="text-xl font-bold text-white mb-2">{course.title}</h3>
                                    <div className="flex gap-4 text-sm text-slate-400 mb-4">
                                        <span>{course.level}</span>
                                        <span>•</span>
                                        <span>{course.duration}</span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-slate-400 text-sm">{course.students} students</span>
                                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm transition-colors">
                                            Enroll
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Communities Section */}
            <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-800/20">
                <div className="max-w-7xl mx-auto">
                    <h2 className="text-3xl font-bold text-white mb-8">Join Developer Communities</h2>
                    <div className="grid md:grid-cols-3 gap-6">
                        {communities.map((community) => (
                            <CommunityCard key={community._id} community={community} />
                        ))}
                    </div>
                </div>
            </section>

            {/* Chat Widget */}
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={() => navigate('/seeker/chat')}
                    className="w-14 h-14 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110"
                >
                    <MessageCircle size={24} />
                </button>
            </div>
        </div>
    )
}

export default Home
