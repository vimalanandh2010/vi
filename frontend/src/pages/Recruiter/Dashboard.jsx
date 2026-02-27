import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate, Link } from 'react-router-dom'
import {
    Users,
    Briefcase,
    Clock,
    Search,
    Bell,
    CheckCircle,
    Shield,
    X,
    LogOut,
    User,
    Home
} from 'lucide-react'

// Hooks & API
import { useAuth } from '../../context/AuthContext'
import useFetch from '../../hooks/useFetch'
import recruiterApi from '../../api/modules/recruiter.api'

// Components
import StatsCard from '../../components/Recruiter/Dashboard/StatsCard'
import DashboardCharts from '../../components/Recruiter/Dashboard/DashboardCharts'
import ActivePostings from '../../components/Recruiter/Dashboard/ActivePostings'
import QuickActions from '../../components/Recruiter/Dashboard/QuickActions'
import UpcomingInterviews from '../../components/Recruiter/Dashboard/UpcomingInterviews'
import VerificationBadge from '../../components/Common/VerificationBadge'
import VerificationFlow from '../../components/Recruiter/VerificationFlow'

const RecruiterDashboard = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [showVerifyModal, setShowVerifyModal] = useState(false)

    // Data Fetching
    const {
        data: dashboardData,
        loading: statsLoading,
        error: statsError
    } = useFetch(recruiterApi.getDashboardStats);

    const {
        data: companyData,
        loading: companyLoading,
        error: companyError
    } = useFetch(recruiterApi.getCompanyProfile);

    // Derived State
    const stats = dashboardData?.stats || {
        activeJobs: 0,
        totalApplications: 0,
        appointments: 0,
        onboarding: 0
    };

    // Fallback for company data if loading or error
    // If 404, we just assume no company created yet.
    const company = companyData || null;

    // Loading State - Only block if STATS are loading
    if (statsLoading && !dashboardData) {
        return (
            <div className="min-h-screen bg-slate-900 flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    // Error State - Only block if STATS failed. Company failure is non-fatal (active onboarding flow).
    if (statsError) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center text-white p-4">
                <div className="bg-red-500/10 border border-red-500/20 p-6 rounded-2xl text-center max-w-md">
                    <h3 className="text-xl font-bold text-red-400 mb-2">Failed to load dashboard</h3>
                    <p className="text-slate-400 mb-6">{statsError}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="px-6 py-2 bg-red-600 hover:bg-red-500 text-white rounded-xl font-semibold transition-all"
                    >
                        Retry
                    </button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-900 text-white p-4 sm:p-6 md:p-10 lg:p-12">
            <div className="max-w-7xl mx-auto">

                {/* Header */}
                <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-8 md:mb-12">
                    <div>
                        <div className="flex items-center gap-3">
                            <motion.h1
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="text-3xl md:text-4xl font-bold tracking-tight"
                            >
                                Hello, {user?.firstName || 'Recruiter'} 👋
                            </motion.h1>
                            {company && (
                                <VerificationBadge
                                    level={company.verificationLevel}
                                    status={company.verificationStatus}
                                />
                            )}
                        </div>
                        <p className="text-slate-400 mt-2 text-sm md:text-base font-medium">Here's what's happening with your job postings today.</p>

                        {(company?.verificationStatus === 'unverified' || !company) && !companyLoading && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 p-4 bg-blue-600/10 border border-blue-500/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4"
                            >
                                <div className="flex items-center gap-3">
                                    <Shield className="text-blue-400 shrink-0" size={20} />
                                    <div>
                                        <p className="text-sm font-semibold text-white">
                                            {!company ? 'Complete Your Company Profile' : 'Verify your company'}
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            {!company ? 'Set up your company details to start posting jobs.' : 'Unlock more features and build trust with candidates.'}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => {
                                        if (!company) navigate('/recruiter/company-profile');
                                        else setShowVerifyModal(true);
                                    }}
                                    className="w-full sm:w-auto px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg transition-all"
                                >
                                    {!company ? 'Setup Profile' : 'Start Verification'}
                                </button>
                            </motion.div>
                        )}

                        {company?.verificationStatus === 'verified' && (
                            <motion.div
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="mt-4 p-4 bg-emerald-600/10 border border-emerald-500/20 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-4"
                            >
                                <div className="flex items-center gap-3">
                                    <Users className="text-emerald-400 shrink-0" size={20} />
                                    <div>
                                        <p className="text-sm font-semibold text-white">
                                            Build Your Community
                                        </p>
                                        <p className="text-xs text-slate-400">
                                            Your company is verified! Create an official community to engage with other recruiters.
                                        </p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => navigate('/recruiter/community', { state: { openCreateModal: true } })}
                                    className="w-full sm:w-auto px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-lg transition-all"
                                >
                                    Create Community
                                </button>
                            </motion.div>
                        )}
                    </div>

                    <div className="flex flex-wrap items-center gap-3 sm:gap-4">
                        <div className="relative group w-full lg:w-64">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={18} />
                            <input
                                type="text"
                                placeholder="Search applicants..."
                                className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl py-2 pl-10 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all text-sm"
                            />
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
                            <button className="flex-1 sm:flex-none p-2 bg-slate-800/50 border border-slate-700/50 rounded-xl text-slate-400 hover:text-white transition-colors relative flex items-center justify-center">
                                <Bell size={20} />
                                <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-slate-900" />
                            </button>
                            <Link to="/recruiter/profile" className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all border border-slate-700 active:scale-95 text-sm md:text-base">
                                <User size={18} />
                                <span className="sm:inline">Profile</span>
                            </Link>
                            <button
                                onClick={() => navigate('/recruiter/candidates')}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-semibold transition-all border border-slate-700 active:scale-95 text-sm md:text-base"
                            >
                                <Home size={18} />
                                <span className="sm:inline">Exit</span>
                            </button>
                            <button
                                onClick={() => logout('employer')}
                                className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-xl font-semibold transition-all border border-red-500/20 active:scale-95 text-sm md:text-base"
                            >
                                <LogOut size={18} />
                                <span className="sm:inline">Logout</span>
                            </button>
                        </div>
                    </div>
                </header>

                {/* Main Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    <StatsCard icon={Briefcase} label="Active Jobs" value={stats.activeJobs || 0} color="blue" />
                    <StatsCard icon={Users} label="Total Applicants" value={stats.totalApplications || 0} color="purple" />
                    <StatsCard icon={Clock} label="Pending Reviews" value={stats.appointments || 0} color="orange" />
                    <StatsCard icon={CheckCircle} label="Total Hired" value={stats.onboarding || 0} color="green" />
                </div>

                {/* Charts Section */}
                <DashboardCharts
                    monthlyData={dashboardData?.monthlyData || []}
                    applicationSummary={dashboardData?.applicationSummary ? [
                        { name: 'In Review', value: dashboardData.applicationSummary.inReview, color: '#3B82F6' },
                        { name: 'Shortlisted', value: dashboardData.applicationSummary.shortlisted, color: '#10B981' },
                        { name: 'Rejected', value: dashboardData.applicationSummary.rejected, color: '#EF4444' }
                    ] : []}
                    stats={stats}
                />

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                    {/* Recent Content */}
                    <div className="lg:col-span-2 space-y-8">
                        <UpcomingInterviews />
                        <ActivePostings jobs={dashboardData?.jobs || []} />
                    </div>

                    {/* Sidebar / Quick Actions */}
                    <div className="space-y-8">
                        <section className="bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-8 relative overflow-hidden shadow-2xl shadow-blue-900/20">
                            <div className="relative z-10">
                                <h3 className="text-2xl font-bold text-white mb-2">Need Help Hiring?</h3>
                                <p className="text-blue-100/80 text-sm mb-6">Explore our premium recurring tools to find the best talent faster through AI-powered matching.</p>
                                <button className="w-full py-3 bg-white text-blue-600 rounded-xl font-bold text-sm shadow-xl shadow-blue-900/20 hover:scale-[1.02] transition-all active:scale-95">
                                    Explore Pro Tools
                                </button>
                            </div>
                            <div className="absolute top-[-20%] right-[-20%] w-48 h-48 bg-white/10 rounded-full blur-3xl" />
                        </section>

                        <QuickActions company={companyData} />
                    </div>
                </div>

                {/* Verification Modal */}
                <AnimatePresence>
                    {showVerifyModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                onClick={() => setShowVerifyModal(false)}
                                className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm"
                            />
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9, y: 20 }}
                                animate={{ opacity: 1, scale: 1, y: 0 }}
                                exit={{ opacity: 0, scale: 0.9, y: 20 }}
                                className="relative w-full max-w-lg bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl overflow-hidden"
                            >
                                <button
                                    onClick={() => setShowVerifyModal(false)}
                                    className="absolute top-4 right-4 p-2 text-slate-500 hover:text-white hover:bg-slate-800 rounded-full transition-all"
                                >
                                    <X size={20} />
                                </button>
                                <VerificationFlow onComplete={() => {
                                    window.location.reload(); // Simple reload to refresh company status
                                }} />
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

export default RecruiterDashboard
