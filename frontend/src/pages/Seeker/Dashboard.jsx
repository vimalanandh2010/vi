import React, { useState, useEffect, useRef } from 'react'
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
    Zap,
    TrendingUp,
    Users,
    CheckCircle2,
    AlertCircle,
    Building2,
    Calendar
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import axiosClient from '../../api/axiosClient'
import { io } from 'socket.io-client'

// Helper function to generate company initials
const getCompanyInitials = (companyName) => {
    if (!companyName || typeof companyName !== 'string') return 'CO';
    const words = companyName.trim().split(/\s+/);
    if (words.length >= 2) {
        return (words[0][0] + words[1][0]).toUpperCase();
    }
    return companyName.substring(0, 2).toUpperCase();
};

// Generate color based on company name
const getCompanyColor = (companyName) => {
    const colors = [
        'from-blue-600 to-blue-500',
        'from-purple-600 to-purple-500',
        'from-emerald-600 to-emerald-500',
        'from-orange-600 to-orange-500',
        'from-pink-600 to-pink-500',
        'from-indigo-600 to-indigo-500',
        'from-teal-600 to-teal-500',
        'from-rose-600 to-rose-500'
    ];
    const hash = (companyName || '').split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
    return colors[hash % colors.length];
};

const SeekerDashboard = () => {
    const navigate = useNavigate();
    const { user: authUser, logout } = useAuth();
    const [user, setUser] = useState(authUser);
    const [applications, setApplications] = useState([]);
    const [savedJobs, setSavedJobs] = useState([]);
    const [dashboardStats, setDashboardStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const socketRef = useRef(null);
    const [realtimeNotification, setRealtimeNotification] = useState(null);

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

        // 🔴 REAL-TIME: Setup Socket.io connection for application updates
        const token = localStorage.getItem('seekerToken');
        if (token) {
            const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000';
            socketRef.current = io(socketUrl, {
                auth: { token },
                transports: ['websocket', 'polling']
            });

            // Listen for application status updates
            socketRef.current.on('applicationStatusUpdate', (updateData) => {
                console.log('📬 Received application status update:', updateData);

                // Update applications list
                setApplications(prev => prev.map(app => {
                    if (app._id === updateData.applicationId) {
                        return {
                            ...app,
                            status: updateData.status,
                            interviewDate: updateData.interviewDate || app.interviewDate,
                            interviewTime: updateData.interviewTime || app.interviewTime,
                            meetingLink: updateData.meetingLink || app.meetingLink
                        };
                    }
                    return app;
                }));

                // Update dashboard stats
                setDashboardStats(prev => {
                    if (!prev) return prev;
                    const newStats = { ...prev };

                    // Decrement old status count
                    if (updateData.oldStatus === 'shortlisted') newStats.shortlisted = Math.max(0, (newStats.shortlisted || 0) - 1);
                    if (updateData.oldStatus === 'interview' || updateData.oldStatus === 'scheduled') newStats.interviews = Math.max(0, (newStats.interviews || 0) - 1);
                    if (updateData.oldStatus === 'rejected') newStats.rejected = Math.max(0, (newStats.rejected || 0) - 1);
                    if (updateData.oldStatus === 'offer' || updateData.oldStatus === 'selected') newStats.offers = Math.max(0, (newStats.offers || 0) - 1);
                    if (updateData.oldStatus === 'hired') newStats.hired = Math.max(0, (newStats.hired || 0) - 1);

                    // Increment new status count
                    if (updateData.status === 'shortlisted') newStats.shortlisted = (newStats.shortlisted || 0) + 1;
                    if (updateData.status === 'interview' || updateData.status === 'scheduled') newStats.interviews = (newStats.interviews || 0) + 1;
                    if (updateData.status === 'rejected') newStats.rejected = (newStats.rejected || 0) + 1;
                    if (updateData.status === 'offer' || updateData.status === 'selected') newStats.offers = (newStats.offers || 0) + 1;
                    if (updateData.status === 'hired') newStats.hired = (newStats.hired || 0) + 1;

                    return newStats;
                });

                // Show notification to user
                setRealtimeNotification({
                    jobTitle: updateData.jobTitle,
                    company: updateData.company,
                    status: updateData.status,
                    timestamp: new Date()
                });

                // Auto-dismiss notification after 5 seconds
                setTimeout(() => setRealtimeNotification(null), 5000);
            });

            socketRef.current.on('connect', () => {
                console.log('✅ Dashboard socket connected for real-time updates');
            });

            socketRef.current.on('disconnect', () => {
                console.log('❌ Dashboard socket disconnected');
            });
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect();
                socketRef.current = null;
            }
        };
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
        {
            label: 'Applied',
            value: dashboardStats?.applied || 0,
            icon: Briefcase,
            gradient: 'from-blue-500 to-blue-600',
            shadowColor: 'shadow-blue-500/30',
            iconBg: 'bg-blue-500/20',
            trend: '+2 this week',
            emptyText: 'Start applying to jobs that match your profile'
        },
        {
            label: 'Shortlisted',
            value: dashboardStats?.shortlisted || 0,
            icon: TrendingUp,
            gradient: 'from-emerald-500 to-teal-600',
            shadowColor: 'shadow-emerald-500/30',
            iconBg: 'bg-emerald-500/20',
            trend: '↑ 12%',
            emptyText: 'Keep applying! Companies will notice you soon'
        },
        {
            label: 'Interviews',
            value: dashboardStats?.interviews || 0,
            icon: Users,
            gradient: 'from-orange-500 to-red-500',
            shadowColor: 'shadow-orange-500/30',
            iconBg: 'bg-orange-500/20',
            trend: '2 scheduled',
            emptyText: 'Prepare your profile for interview invites'
        },
        {
            label: 'Offers',
            value: dashboardStats?.offers || 0,
            icon: Award,
            gradient: 'from-purple-500 to-pink-600',
            shadowColor: 'shadow-purple-500/30',
            iconBg: 'bg-purple-500/20',
            trend: 'Review now',
            emptyText: 'Your dream offer is on the way!'
        },
    ]

    const quickActions = [
        {
            title: 'Search Jobs',
            desc: 'Find your next opportunity',
            icon: Search,
            link: '/seeker/jobs',
            gradient: 'from-blue-500 to-blue-600',
            preview: dashboardStats ? `${dashboardStats.applied} jobs explored` : 'Explore opportunities'
        },
        {
            title: 'Saved Jobs',
            desc: 'View your bookmarked roles',
            icon: Bookmark,
            link: '/seeker/saved-jobs',
            gradient: 'from-purple-500 to-pink-500',
            preview: savedJobs.length > 0 ? `${savedJobs.length} jobs saved` : 'Save interesting jobs'
        },
        {
            title: 'Messages',
            desc: 'Chat with employers',
            icon: MessageCircle,
            link: '/seeker/chat',
            gradient: 'from-indigo-500 to-purple-600',
            preview: 'Connect with recruiters'
        },
    ]

    if (loading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-blue-600 mb-4" size={48} />
                <p className="text-gray-600 font-medium">Loading your career overview...</p>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-white pb-20">
            <Navbar />

            <div className="max-w-[100vw] px-4 sm:px-6 lg:px-12 xl:px-20 pt-6 sm:pt-10">

                {error && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-8 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3 text-red-700"
                    >
                        <div className="bg-red-500 w-2 h-2 rounded-full animate-pulse" />
                        <span className="text-sm font-medium">Sync Error: {error}. Stats may be outdated.</span>
                    </motion.div>
                )}

                {/* Real-Time Notification */}
                <AnimatePresence>
                    {realtimeNotification && (
                        <motion.div
                            initial={{ opacity: 0, y: -20, scale: 0.95 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: -20, scale: 0.95 }}
                            transition={{ duration: 0.3, ease: 'easeOut' }}
                            className="mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl shadow-lg"
                        >
                            <div className="flex items-start gap-3">
                                <div className="bg-blue-500 p-2 rounded-lg flex-shrink-0">
                                    <Zap size={20} className="text-white" />
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-bold text-gray-900 text-base mb-1">
                                        🎉 Application Status Updated!
                                    </h4>
                                    <p className="text-sm text-gray-700 leading-relaxed">
                                        Your application for <span className="font-semibold text-blue-700">{realtimeNotification.jobTitle}</span> at <span className="font-semibold">{realtimeNotification.company}</span> has been updated to: {' '}
                                        <span className={`font-bold uppercase ${realtimeNotification.status === 'interview' ? 'text-orange-600' :
                                            realtimeNotification.status === 'shortlisted' ? 'text-green-600' :
                                                realtimeNotification.status === 'rejected' ? 'text-red-600' :
                                                    realtimeNotification.status === 'offer' ? 'text-purple-600' :
                                                        'text-blue-600'
                                            }`}>
                                            {realtimeNotification.status}
                                        </span>
                                    </p>
                                </div>
                                <button
                                    onClick={() => setRealtimeNotification(null)}
                                    className="text-gray-400 hover:text-gray-600 transition-colors"
                                >
                                    ✕
                                </button>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Header Section */}
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-8 md:mb-10">
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-3xl sm:text-4xl md:text-5xl font-bold text-gray-900 mb-3"
                        >
                            Welcome back, {user?.firstName || 'Seeker'}!
                        </motion.h1>
                        <p className="text-gray-600 text-lg md:text-xl">Here's what's happening with your job search today.</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3">
                        <Link
                            to="/seeker/profile"
                            className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-blue-600 px-5 md:px-6 py-2.5 md:py-3 rounded-xl font-semibold border-2 border-gray-300 hover:border-blue-400 shadow-md transition-all active:scale-95 whitespace-nowrap text-sm md:text-base"
                        >
                            <Edit3 size={18} className="md:w-5 md:h-5" />
                            Edit Profile
                        </Link>
                        <div className="flex flex-1 sm:flex-none gap-3">
                            <button
                                onClick={() => navigate('/seeker/home')}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-white hover:bg-gray-50 text-gray-700 px-5 md:px-6 py-2.5 md:py-3 rounded-xl font-semibold border-2 border-gray-300 transition-all active:scale-95 whitespace-nowrap text-sm md:text-base"
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
                                    whileHover={{ y: -4, scale: 1.02 }}
                                    className="relative group cursor-default overflow-hidden"
                                >
                                    <div className="bg-white border-2 border-gray-200 rounded-2xl p-6 sm:p-7 h-full shadow-sm hover:shadow-lg hover:border-gray-300 transition-all duration-300">
                                        {/* Background glow effect */}
                                        <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-0 group-hover:opacity-5 transition-opacity duration-300 rounded-2xl`} />

                                        <div className="relative z-10">
                                            <div className="flex items-center justify-between mb-4">
                                                <div className={`bg-gradient-to-br ${stat.gradient} rounded-xl p-3 shadow-md`}>
                                                    <stat.icon size={24} className="text-white stroke-white" strokeWidth={2.5} color="white" />
                                                </div>
                                                {stat.value > 0 && (
                                                    <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
                                                        {stat.trend}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-4xl sm:text-5xl font-black text-gray-900 mb-2">
                                                {stat.value}
                                            </p>
                                            <p className="text-gray-600 text-sm sm:text-base font-bold mb-1">{stat.label}</p>
                                            {stat.value === 0 && (
                                                <p className="text-xs text-gray-500 mt-2">{stat.emptyText}</p>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </div>



                        {/* ATS Super UI Access Card */}


                        {/* Recent Activity / Applications */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-md"
                        >
                            <div className="p-6 border-b-2 border-gray-200 flex items-center justify-between bg-white">
                                <h3 className="text-2xl font-bold text-gray-900">Recent Applications</h3>
                                <Link to="/seeker/jobs" className="text-blue-600 hover:text-blue-700 text-sm font-semibold flex items-center gap-1 group transition-all">
                                    View all <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>

                            {applications.length > 0 ? (
                                <div className="divide-y divide-gray-200">
                                    {applications.slice(0, 5).map((app, idx) => {
                                        const companyName = app.job?.company?.name || app.job?.company || 'Company';
                                        return (
                                            <div key={app._id} className="p-6 hover:bg-blue-50/20 transition-all border-l-4 border-transparent hover:border-blue-600">
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex items-center gap-4 flex-1">
                                                        <div className="w-16 h-16 flex-shrink-0 rounded-xl flex items-center justify-center text-xl font-bold text-white shadow-lg overflow-hidden">
                                                            {app.job?.company?.logo || app.job?.companyLogo ? (
                                                                <img src={app.job?.company?.logo || app.job?.companyLogo} alt="" className="w-full h-full object-cover" />
                                                            ) : (
                                                                <div className="w-full h-full bg-white flex items-center justify-center">
                                                                    <span className="text-lg font-black text-blue-600 drop-shadow-sm">{getCompanyInitials(companyName)}</span>
                                                                </div>
                                                            )}
                                                        </div>
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-gray-900 font-bold text-lg mb-1">{app.job?.title}</h4>
                                                            <div className="flex items-center gap-2 text-gray-600">
                                                                <p className="text-sm font-medium">{companyName}</p>
                                                                <span className="text-gray-400">•</span>
                                                                <p className="text-sm flex items-center gap-1">
                                                                    <MapPin size={14} /> {app.job?.location}
                                                                </p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                    <div className="text-right flex flex-col items-end gap-2">
                                                        <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider border-2 shadow-sm
                                                        ${app.status === 'pending' || app.status === 'applied' ? 'bg-blue-50 text-blue-700 border-blue-300' :
                                                                app.status === 'viewed' || app.status === 'reviewed' ? 'bg-white text-gray-700 border-gray-400' :
                                                                    app.status === 'shortlisted' ? 'bg-orange-50 text-orange-700 border-orange-300' :
                                                                        app.status === 'interview' || app.status === 'scheduled' ? 'bg-purple-50 text-purple-700 border-purple-300' :
                                                                            app.status === 'selected' || app.status === 'offer' ? 'bg-emerald-50 text-emerald-700 border-emerald-300' :
                                                                                app.status === 'hired' ? 'bg-green-50 text-green-700 border-green-300' :
                                                                                    app.status === 'rejected' || app.status.includes('rejected') ? 'bg-red-50 text-red-700 border-red-300' :
                                                                                        'bg-white text-gray-700 border-gray-400'
                                                            }`}>
                                                            {app.status}
                                                        </span>
                                                        <p className="text-gray-500 text-xs flex items-center gap-1">
                                                            <Calendar size={12} />
                                                            {new Date(app.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                                                        </p>
                                                        {['interview', 'scheduled', 'offer'].includes(app.status) && app.interviewDate && (
                                                            <div className="mt-2 flex flex-col gap-2 w-full">
                                                                {app.meetingLink ? (
                                                                    <a
                                                                        href={app.meetingLink.startsWith('http') ? app.meetingLink : `https://${app.meetingLink}`}
                                                                        target="_blank"
                                                                        rel="noopener noreferrer"
                                                                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white hover:bg-gray-50 text-blue-600 border-2 border-gray-300 hover:border-blue-400 rounded-lg text-xs font-bold transition-all shadow-md"
                                                                    >
                                                                        <Video size={14} /> Join Meeting
                                                                    </a>
                                                                ) : (
                                                                    <Link
                                                                        to={`/interview/${app._id}`}
                                                                        className="inline-flex items-center justify-center gap-1.5 px-4 py-2 bg-white hover:bg-gray-50 text-blue-600 border-2 border-gray-300 hover:border-blue-400 rounded-lg text-xs font-bold transition-all shadow-md"
                                                                    >
                                                                        <Video size={14} /> Join Call
                                                                    </Link>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            ) : (
                                <div className="p-8 text-center py-16">
                                    <div className="bg-blue-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-blue-200">
                                        <Briefcase size={28} className="text-blue-600" />
                                    </div>
                                    <h4 className="text-gray-900 font-bold mb-2 text-lg">No recent applications found</h4>
                                    <p className="text-gray-600 max-w-sm mx-auto mb-6">You haven't applied to any jobs recently. Start exploring opportunities that match your skills!</p>
                                    <Link to="/seeker/jobs" className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg transition-all font-semibold shadow-md">
                                        Browse Jobs
                                    </Link>
                                </div>
                            )}
                        </motion.div>

                        {/* Saved Jobs Section */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="bg-white border-2 border-gray-200 rounded-2xl overflow-hidden shadow-md"
                        >
                            <div className="p-6 border-b-2 border-gray-200 flex items-center justify-between bg-white">
                                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                                    <Bookmark className="text-purple-600" size={22} />
                                    Saved Jobs
                                </h3>
                                <Link to="/seeker/saved-jobs" className="text-purple-600 hover:text-purple-700 text-sm font-bold flex items-center gap-1 group transition-all">
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
                                            className="bg-white border-2 border-gray-200 rounded-xl p-4 hover:border-purple-600 hover:shadow-md transition-all group/card"
                                        >
                                            <div className="flex items-start justify-between mb-3">
                                                <div className="w-10 h-10 rounded-lg flex items-center justify-center text-lg overflow-hidden border-2 border-gray-200 shadow-sm">
                                                    {job.company?.logo || job.companyLogo ? (
                                                        <img src={job.company?.logo || job.companyLogo} alt="" className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full bg-white flex items-center justify-center">
                                                            <span className="text-xs font-black text-blue-600 drop-shadow-sm">{getCompanyInitials(job.company?.name || job.company || 'Company')}</span>
                                                        </div>
                                                    )}
                                                </div>
                                                <Link to="/seeker/jobs" className="p-2 text-gray-400 hover:text-purple-600 transition-colors">
                                                    <ExternalLink size={14} />
                                                </Link>
                                            </div>
                                            <h4 className="text-gray-900 font-bold text-sm mb-1 group-hover/card:text-purple-600 transition-colors truncate">{job.title}</h4>
                                            <p className="text-purple-600 text-xs font-bold mb-3">{job.company?.name || job.company}</p>
                                            <div className="flex items-center gap-2 text-gray-500 text-xs font-medium">
                                                <MapPin size={12} />
                                                <span>{job.location}</span>
                                            </div>
                                        </motion.div>
                                    ))}
                                </div>
                            ) : (
                                <div className="p-8 text-center py-12">
                                    <div className="bg-purple-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-purple-200">
                                        <Bookmark size={28} className="text-purple-600" />
                                    </div>
                                    <h4 className="text-gray-900 font-bold mb-2">No saved jobs yet</h4>
                                    <p className="text-gray-600 text-sm max-w-xs mx-auto mb-6">Found an interesting role? Save it to track it here and never miss an opportunity.</p>
                                    <Link to="/seeker/jobs" className="inline-flex items-center gap-2 text-purple-600 hover:text-purple-700 text-sm font-bold">
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
                            className="bg-white border-2 border-gray-200 rounded-2xl p-6 relative overflow-hidden group shadow-md"
                        >

                            <div className="flex items-center gap-4 mb-6">
                                {user?.photoUrl ? (
                                    <img src={user.photoUrl} alt="Profile" className="w-16 h-16 rounded-2xl object-cover border-2 border-blue-500/20 shadow-xl" />
                                ) : (
                                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl font-bold text-white shadow-xl shadow-blue-500/20">
                                        {user?.firstName?.charAt(0) || 'U'}
                                    </div>
                                )}
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">{user?.firstName} {user?.lastName}</h3>
                                    <p className="text-blue-600 font-medium">{user?.preferredRole || 'Job Seeker'}</p>
                                </div>
                            </div>

                            <div className="space-y-4 mb-6">
                                <div className="flex items-center gap-3 text-gray-700">
                                    <MapPin size={18} className="text-gray-500" />
                                    <span className="text-sm font-medium">{user?.location || 'Location Not Set'}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-700">
                                    <Mail size={18} className="text-gray-500" />
                                    <span className="text-sm truncate max-w-[200px] font-medium">{user?.email}</span>
                                </div>
                                <div className="flex items-center gap-3 text-gray-700">
                                    <Phone size={18} className="text-gray-500" />
                                    <span className="text-sm font-medium">{user?.phoneNumber || 'No phone set'}</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-4 mb-6">
                                {user?.githubUrl && (
                                    <a href={user.githubUrl} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-lg transition-all border-2 border-gray-200 hover:border-blue-400 group/link">
                                        <Github size={20} />
                                    </a>
                                )}
                                {user?.linkedInUrl && (
                                    <a href={user.linkedInUrl} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-lg transition-all border-2 border-gray-200 hover:border-blue-400 group/link">
                                        <Linkedin size={20} />
                                    </a>
                                )}
                                {user?.portfolioUrl && (
                                    <a href={user.portfolioUrl} target="_blank" rel="noopener noreferrer" className="p-2.5 bg-white hover:bg-blue-50 text-gray-600 hover:text-blue-600 rounded-lg transition-all border-2 border-gray-200 hover:border-blue-400 group/link">
                                        <Globe size={20} />
                                    </a>
                                )}
                            </div>

                            {/* Profile Strength Indicator */}
                            <div className="p-4 bg-white rounded-xl border-2 border-gray-200 mb-4">
                                <div className="flex items-center justify-between mb-3">
                                    <p className="text-xs font-bold text-gray-600 uppercase tracking-wider">Profile Strength</p>
                                    <span className={`text-xs font-bold ${profileStrength >= 80 ? 'text-emerald-600' :
                                        profileStrength >= 50 ? 'text-orange-600' :
                                            'text-red-600'
                                        }`}>{profileStrength}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2.5 overflow-hidden mb-2">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${profileStrength}%` }}
                                        transition={{ duration: 1, ease: 'easeOut' }}
                                        className={`h-full rounded-full ${profileStrength >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-500' :
                                            profileStrength >= 50 ? 'bg-gradient-to-r from-orange-500 to-amber-500' :
                                                'bg-gradient-to-r from-red-500 to-pink-500'
                                            }`}
                                    />
                                </div>
                                {profileStrength < 100 && (
                                    <div className="flex items-start gap-2 mt-3">
                                        <AlertCircle size={14} className="text-blue-600 mt-0.5 flex-shrink-0" />
                                        <p className="text-xs text-gray-600 font-medium">
                                            {profileStrength < 50 ? 'Complete your profile to get more interview calls' : 'Add more details to stand out'}
                                        </p>
                                    </div>
                                )}
                                {profileStrength === 100 && (
                                    <div className="flex items-center gap-2 mt-3">
                                        <CheckCircle2 size={14} className="text-emerald-600" />
                                        <p className="text-xs text-emerald-600 font-bold">Your profile is complete!</p>
                                    </div>
                                )}
                            </div>

                            <div className="p-4 bg-white rounded-xl border-2 border-gray-200">
                                <p className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-3">Top Skills</p>
                                <div className="flex flex-wrap gap-2">
                                    {user?.primarySkill ? (
                                        <span className="px-3 py-1.5 bg-gradient-to-r from-blue-500/10 to-indigo-500/10 text-blue-600 border-2 border-blue-500/20 rounded-lg text-sm font-bold shadow-sm">
                                            {user.primarySkill}
                                        </span>
                                    ) : (
                                        <p className="text-xs text-gray-500 italic">No skills listed yet</p>
                                    )}
                                    <Link to="/seeker/profile-setup" className="px-2 py-1 hover:bg-blue-50 rounded-lg transition-colors">
                                        <Edit3 size={12} className="text-gray-500" />
                                    </Link>
                                </div>
                            </div>
                        </motion.div>

                        {/* Quick Actions */}
                        <div className="space-y-4">
                            <h4 className="text-gray-900 font-bold ml-1 flex items-center gap-2 text-xl">
                                <Zap size={20} className="text-yellow-500" />
                                Quick Actions
                            </h4>
                            {quickActions.map((action, idx) => (
                                <motion.div
                                    key={action.title}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 + 0.3 }}
                                    whileHover={{ x: 4 }}
                                >
                                    <button
                                        onClick={() => navigate(action.link, { state: action.state })}
                                        className="w-full group relative overflow-hidden"
                                    >
                                        <div className={`bg-gradient-to-r ${action.gradient} p-[2px] rounded-xl transition-all duration-300`}>
                                            <div className="bg-white p-5 rounded-xl transition-all flex items-center justify-between text-left group-hover:shadow-lg">
                                                <div className="flex items-center gap-4">
                                                    <div className={`bg-gradient-to-br ${action.gradient} w-12 h-12 rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
                                                        <action.icon size={22} className="text-white stroke-white" strokeWidth={2.5} />
                                                    </div>
                                                    <div>
                                                        <h5 className="text-gray-900 font-bold text-sm mb-0.5">{action.title}</h5>
                                                        <p className="text-gray-600 text-xs font-medium">{action.desc}</p>
                                                        <p className="text-xs text-gray-500 mt-1 font-medium italic">{action.preview}</p>
                                                    </div>
                                                </div>
                                                <ArrowRight size={20} className="text-gray-400 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                                            </div>
                                        </div>
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
