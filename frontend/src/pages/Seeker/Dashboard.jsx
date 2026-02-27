import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/Navbar'
import {
    Briefcase,
    Bookmark,
    Eye,
    Settings,
    Edit3,
    ExternalLink,
    Award,
    MapPin,
    Mail,
    Phone,
    ArrowRight,
    Search,
    MessageCircle,
    Loader2,
    LogOut,
    Video,
    Github,
    Linkedin,
    Globe,
    Home,
    Sparkles,
    Zap
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import axiosClient from '../../api/axiosClient'


const SeekerDashboard = () => {
    const navigate = useNavigate();
    const { user: authUser, logout } = useAuth();
    const [user, setUser] = useState(authUser);
    const [applications, setApplications] = useState([]);
    const [savedJobs, setSavedJobs] = useState([]);
    const [dashboardStats, setDashboardStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                console.log('Dashboard: Fetching real-time data...');
                // Fetch User Details, Applications, Stats, and All Jobs in parallel
                const [userRes, appsRes, statsRes, jobsRes] = await Promise.all([
                    axiosClient.get('/auth/me'),
                    axiosClient.get('/jobs/applied'),
                    axiosClient.get('/dashboard/seeker'),
                    axiosClient.get('/jobs')
                ]);

                console.log('Dashboard: Data fetched successfully!');

                // axiosClient interceptor returns response.data, so we shouldn't access .data again unless nested
                const userData = userRes;
                console.log('Dashboard: Final user data state:', userData);
                console.log('Dashboard: resumeUrl from user data:', userData?.resumeUrl);

                const appsData = appsRes || [];
                const statsData = statsRes.stats || statsRes || {};

                setUser(userData);
                setApplications(Array.isArray(appsData) ? appsData : []);
                setDashboardStats(statsData);

                // Filter jobs for saved ones
                const jobs = Array.isArray(jobsRes) ? jobsRes : [];
                if (userRes?.savedJobs && jobs.length > 0) {
                    const saved = jobs.filter(job => userRes.savedJobs.includes(job._id));
                    setSavedJobs(saved);
                }
            } catch (err) {
                console.error('Dashboard Fetch Error:', err);
                setError(err.response?.data?.message || err.message || 'Failed to sync with server');
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    const handleCancelInterview = async (applicationId, jobTitle) => {
        if (window.confirm(`Are you sure you want to cancel your interview for ${jobTitle}? This action cannot be undone and will notify the employer.`)) {
            try {
                await axiosClient.patch(`/jobs/application/${applicationId}/cancel-interview`);

                // Update local UI state
                setApplications(prev => prev.map(app =>
                    app._id === applicationId
                        ? { ...app, status: 'cancelled', interviewDate: '', interviewTime: '', meetingLink: '' }
                        : app
                ));
            } catch (err) {
                console.error("Error cancelling interview:", err);
                alert(err.response?.data?.message || "Failed to cancel interview. Please try again.");
            }
        }
    };

    // Calculate Profile Strength
    const calculateProfileStrength = (u) => {
        if (!u) return 0;
        const fields = [
            'firstName', 'lastName', 'phoneNumber', 'location',
            'preferredRole', 'primarySkill', 'experienceLevel',
            'education.degree.degreeName', 'resumeUrl', 'photoUrl'
        ];

        let completed = 0;
        fields.forEach(field => {
            const value = field.split('.').reduce((obj, key) => obj?.[key], u);
            if (value && value !== '') completed++;
        });

        return Math.min(Math.round((completed / fields.length) * 100), 100);
    }

    const profileStrength = calculateProfileStrength(user);

    const stats = [
        { label: 'Applied Jobs', value: dashboardStats?.applied || 0, icon: Briefcase, color: 'text-blue-400', bg: 'bg-blue-500/10' },
        { label: 'Shortlisted', value: dashboardStats?.shortlisted || 0, icon: Bookmark, color: 'text-purple-400', bg: 'bg-purple-500/10' },
        { label: 'Interviews', value: dashboardStats?.interviews || 0, icon: MessageCircle, color: 'text-cyan-400', bg: 'bg-cyan-500/10' },
        { label: 'Offers', value: dashboardStats?.offers || 0, icon: Award, color: 'text-emerald-400', bg: 'bg-emerald-500/10' },
    ]

    const quickActions = [
        { title: 'Search Jobs', desc: 'Find your next opportunity', icon: Search, link: '/seeker/jobs', color: 'bg-blue-600' },
        { title: 'Saved Jobs', desc: 'View your bookmarked roles', icon: Bookmark, link: '/seeker/saved-jobs', color: 'bg-purple-600' },
        { title: 'Messages', desc: 'Chat with employers', icon: MessageCircle, link: '/seeker/chat', color: 'bg-indigo-600' },
    ]

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
                <p className="text-slate-400 font-medium">Loading your career overview...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-900 pb-20">
            <Navbar />

            <div className="max-w-[100vw] px-4 sm:px-6 lg:px-12 xl:px-20 pt-6 sm:pt-10">

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center gap-3 text-red-400"
                    >
                        <div className="bg-red-500 w-2 h-2 rounded-full animate-pulse" />
                        <span className="text-sm font-medium">Sync Error: {error}. Stats may be outdated.</span>
                    </motion.div>
                )}

                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 md:mb-10">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-2xl sm:text-3xl md:text-4xl font-bold text-white mb-2"
                        >
                            Welcome back, {user?.firstName || 'Seeker'}! 👋
                        </motion.h1>
                        <p className="text-slate-400 text-base md:text-lg">Here's what's happening with your job search today.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            to="/seeker/profile"
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-5 md:px-6 py-2.5 md:py-3 rounded-xl font-semibold shadow-lg shadow-blue-500/20 transition-all active:scale-95 whitespace-nowrap text-sm md:text-base"
                        >
                            <Edit3 size={18} className="md:w-5 md:h-5" />
                            Edit Profile
                        </Link>
                        <div className="flex flex-1 sm:flex-none gap-3">
                            <button
                                onClick={() => navigate('/seeker/home')}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-5 md:px-6 py-2.5 md:py-3 rounded-xl font-semibold border border-slate-700 transition-all active:scale-95 whitespace-nowrap text-sm md:text-base"
                            >
                                <Home size={18} className="md:w-5 md:h-5" />
                                Exit
                            </button>
                            <button
                                onClick={logout}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 px-5 md:px-6 py-2.5 md:py-3 rounded-xl font-semibold border border-red-500/20 transition-all active:scale-95 whitespace-nowrap text-sm md:text-base"
                            >
                                <LogOut size={18} className="md:w-5 md:h-5" />
                                Logout
                            </button>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Left Column: Profile & Stats */}
                    <div className="lg:col-span-2 space-y-8">

                        {/* Stats Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                            {stats.map((stat, idx) => (
                                <motion.div
                                    key={stat.label}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-4 sm:p-5 rounded-2xl"
                                >
                                    <div className={`${stat.bg} ${stat.color} w-10 h-10 rounded-lg flex items-center justify-center mb-3`}>
                                        <stat.icon size={20} />
                                    </div>
                                    <p className="text-2xl sm:text-3xl font-bold text-white mb-1">{stat.value}</p>
                                    <p className="text-slate-400 text-xs sm:text-sm font-medium">{stat.label}</p>
                                </motion.div>
                            ))}
                        </div>



                        {/* ATS Super UI Access Card */}


                        {/* Recent Activity / Applications */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
                                <h3 className="text-xl font-bold text-white">Recent Applications</h3>
                                <Link to="/seeker/jobs" className="text-blue-400 hover:text-blue-300 text-sm font-medium flex items-center gap-1 group transition-all">
                                    View all <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>

                            {applications.length > 0 ? (
                                <div className="divide-y divide-slate-700/50">
                                    {applications.slice(0, 5).map((app, idx) => (
                                        <div key={app._id} className="p-5 hover:bg-slate-700/20 transition-colors flex items-center justify-between">
                                            <div className="flex items-center gap-4">
                                                <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl overflow-hidden">
                                                    {app.job?.company?.logo || app.job?.companyLogo ? (
                                                        <img src={app.job?.company?.logo || app.job?.companyLogo} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        "🏢"
                                                    )}
                                                </div>
                                                <div>
                                                    <h4 className="text-white font-bold group-hover:text-blue-400 transition-colors">{app.job?.title}</h4>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <p className="text-slate-400 text-xs">{app.job?.company?.name || app.job?.company}</p>
                                                        <span className="text-slate-600">•</span>
                                                        <p className="text-slate-500 text-[10px] flex items-center gap-1">
                                                            <MapPin size={10} /> {app.job?.location}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border 
                                                    ${app.status === 'pending' || app.status === 'applied' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                                                        app.status === 'viewed' || app.status === 'reviewed' ? 'bg-slate-500/10 text-slate-400 border-slate-500/20' :
                                                            app.status === 'shortlisted' ? 'bg-orange-500/10 text-orange-400 border-orange-500/20' :
                                                                app.status === 'interview' || app.status === 'scheduled' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                                                    app.status === 'selected' || app.status === 'offer' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                                                                        app.status === 'hired' ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                                                                            app.status === 'rejected' || app.status.includes('rejected') ? 'bg-red-500/10 text-red-400 border-red-500/20' :
                                                                                'bg-slate-500/10 text-slate-400 border-slate-500/20'
                                                    }`}>
                                                    {app.status}
                                                </span>
                                                <p className="text-slate-500 text-[10px] mt-1 italic">
                                                    Applied {new Date(app.createdAt).toLocaleDateString()}
                                                </p>
                                                {['interview', 'scheduled', 'offer'].includes(app.status) && app.interviewDate && (
                                                    <div className="mt-3 flex flex-col gap-2">
                                                        {app.meetingLink ? (
                                                            <a
                                                                href={app.meetingLink.startsWith('http') ? app.meetingLink : `https://${app.meetingLink}`}
                                                                target="_blank"
                                                                rel="noopener noreferrer"
                                                                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500 rounded-lg text-xs font-bold transition-all w-full shadow-md"
                                                            >
                                                                <Video size={14} /> Join Meeting
                                                            </a>
                                                        ) : (
                                                            <Link
                                                                to={`/interview/${app._id}`}
                                                                className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500 rounded-lg text-xs font-bold transition-all w-full shadow-md"
                                                            >
                                                                <Video size={14} /> Join Call
                                                            </Link>
                                                        )}
                                                        <button
                                                            onClick={() => handleCancelInterview(app._id, app.job?.title)}
                                                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-600/10 hover:bg-red-600/20 text-red-500 border border-red-500/30 rounded-lg text-xs font-bold transition-all w-full"
                                                        >
                                                            Cancel Interview
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center py-16">
                                    <div className="bg-slate-700/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700/50">
                                        <Briefcase size={28} className="text-slate-500" />
                                    </div>
                                    <h4 className="text-white font-semibold mb-2 text-lg">No recent applications found</h4>
                                    <p className="text-slate-400 max-w-sm mx-auto mb-6">You haven't applied to any jobs recently. Start exploring opportunities that match your skills!</p>
                                    <Link to="/seeker/jobs" className="inline-flex items-center gap-2 bg-slate-700 hover:bg-slate-600 text-white px-6 py-2 rounded-lg transition-all">
                                        Browse Jobs
                                    </Link>
                                </div>
                            )}
                        </motion.div>

                        {/* Saved Jobs Section */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl overflow-hidden"
                        >
                            <div className="p-6 border-b border-slate-700/50 flex items-center justify-between">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Bookmark className="text-purple-400" size={20} />
                                    Saved Jobs
                                </h3>
                                <Link to="/seeker/saved-jobs" className="text-purple-400 hover:text-purple-300 text-sm font-medium flex items-center gap-1 group transition-all">
                                    View all <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>

                            {savedJobs.length > 0 ? (
                                <div className="p-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    {savedJobs.slice(0, 4).map((job, idx) => (
                                        <motion.div
                                            key={job._id}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.1 }}
                                            className="bg-slate-900/50 border border-slate-700/50 rounded-xl p-4 hover:border-purple-500/30 transition-all group/card"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="w-10 h-10 rounded-lg bg-slate-800 flex items-center justify-center text-lg overflow-hidden">
                                                    {job.company?.logo || job.companyLogo ? (
                                                        <img src={job.company?.logo || job.companyLogo} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        "🏢"
                                                    )}
                                                </div>
                                                <Link to="/seeker/jobs" className="p-2 text-slate-500 hover:text-white transition-colors">
                                                    <ExternalLink size={14} />
                                                </Link>
                                            </div>
                                            <h4 className="text-white font-bold text-sm mb-1 group-hover/card:text-purple-400 transition-colors truncate">{job.title}</h4>
                                            <p className="text-purple-400 text-xs font-medium mb-3">{job.company?.name || job.company}</p>
                                            <div className="flex items-center gap-2 text-slate-500 text-[10px]">
                                                <MapPin size={12} />
                                                <span>{job.location}</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center py-12">
                                    <div className="bg-slate-700/30 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border border-slate-700/50">
                                        <Bookmark size={28} className="text-slate-500" />
                                    </div>
                                    <h4 className="text-white font-semibold mb-2">No saved jobs yet</h4>
                                    <p className="text-slate-400 text-sm max-w-xs mx-auto mb-6">Found an interesting role? Save it to track it here and never miss an opportunity.</p>
                                    <Link to="/seeker/jobs" className="inline-flex items-center gap-2 text-purple-400 hover:text-purple-300 text-sm font-bold">
                                        Discover Jobs <ArrowRight size={16} />
                                    </Link>
                                </div>
                            )}
                        </motion.div>
                    </div>

                    {/* Right Column: Profile Summary & Sidebar */}
                    <div className="space-y-8">

                        {/* Profile Summary Card */}
                        <motion.div
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-6 relative overflow-hidden group"
                        >
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 rounded-full blur-3xl -mr-16 -mt-16" />

                            <div className="flex items-center gap-4 mb-6">
                                {user?.photoUrl ? (
                                    <img src={user.photoUrl} alt="Profile" className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-500/20 shadow-xl" />
                                ) : (
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white shadow-xl shadow-blue-500/20">
                                        {user?.firstName?.charAt(0) || 'U'}
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-xl font-bold text-white">{user?.firstName} {user?.lastName}</h3>
                                    <p className="text-blue-400 font-medium">{user?.preferredRole || 'Job Seeker'}</p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="flex items-center gap-3 text-slate-400">
                                    <MapPin size={18} className="text-slate-500" />
                                    <span className="text-sm">{user?.location || 'Location Not Set'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-400">
                                    <Mail size={18} className="text-slate-500" />
                                    <span className="text-sm truncate max-w-[200px]">{user?.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-slate-400">
                                    <Phone size={18} className="text-slate-500" />
                                    <span className="text-sm">{user?.phoneNumber || 'No phone set'}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mb-6">
                                {user?.githubUrl && (
                                    <a href={user.githubUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-900/50 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-all border border-slate-700/50 group/link">
                                        <Github size={18} />
                                    </a>
                                )}
                                {user?.linkedInUrl && (
                                    <a href={user.linkedInUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-900/50 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-all border border-slate-700/50 group/link">
                                        <Linkedin size={18} />
                                    </a>
                                )}
                                {user?.portfolioUrl && (
                                    <a href={user.portfolioUrl} target="_blank" rel="noopener noreferrer" className="p-2 bg-slate-900/50 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg transition-all border border-slate-700/50 group/link">
                                        <Globe size={18} />
                                    </a>
                                )}
                            </div>

                            <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-700/50">
                                <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Top Skills</p>
                                <div className="flex flex-wrap gap-2">
                                    {user?.primarySkill ? (
                                        <span className="px-3 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 rounded-lg text-xs font-medium">
                                            {user.primarySkill}
                                        </span>
                                    ) : (
                                        <p className="text-xs text-slate-500 italic">No skills listed yet</p>
                                    )}
                                    <Link to="/seeker/profile-setup" className="px-2 py-1 hover:bg-slate-700 rounded-lg transition-colors">
                                        <Edit3 size={12} className="text-slate-400" />
                                    </Link>
                                </div>
                            </div>
                        </motion.div>

                        {/* Quick Actions */}
                        <div className="space-y-4">
                            <h4 className="text-white font-bold ml-1">Quick Actions</h4>
                            {quickActions.map((action, idx) => (
                                <motion.div
                                    key={action.title}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 + 0.3 }}
                                >
                                    <button
                                        onClick={() => navigate(action.link, { state: action.state })}
                                        className="w-full group flex items-center justify-between p-4 bg-slate-800/40 hover:bg-slate-800/60 border border-slate-700/50 rounded-xl transition-all text-left"
                                    >
                                        <div className="flex items-center gap-4">
                                            <div className={`${action.color} w-10 h-10 rounded-lg flex items-center justify-center text-white shadow-lg`}>
                                                <action.icon size={20} />
                                            </div>
                                            <div>
                                                <h5 className="text-white font-semibold text-sm">{action.title}</h5>
                                                <p className="text-slate-500 text-xs">{action.desc}</p>
                                            </div>
                                        </div>
                                        <ExternalLink size={16} className="text-slate-600 group-hover:text-blue-400 transition-colors" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>

                    </div>
                </div>
            </div>
        </div>
    )
}

export default SeekerDashboard
