import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { useNavigate } from 'react-router-dom'
import {
    Users,
    Briefcase,
    Clock,
    Search,
    CheckCircle,
    Shield,
    X
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

import RecruiterLayout from '../../components/RecruiterLayout'

const RecruiterDashboard = () => {
    const { user } = useAuth()
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
    } = useFetch(recruiterApi.getCompanyProfile);

    // Derived State
    const stats = dashboardData?.stats || {
        activeJobs: 0,
        totalApplications: 0,
        appointments: 0,
        onboarding: 0
    };

    const company = companyData || null;

    if (statsLoading && !dashboardData) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center">
                <div className="w-16 h-16 border-4 border-slate-100 border-t-black rounded-full animate-spin mb-4" />
                <p className="text-xs font-semibold text-gray-400">Initialising Dashboard</p>
            </div>
        )
    }

    if (statsError) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-4">
                <div className="bg-red-50 border border-red-100 p-12 rounded-[2.5rem] text-center max-w-md shadow-xl">
                    <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-8 shadow-sm">
                        <X className="text-red-500" size={40} />
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-4">Dashboard Offline</h3>
                    <p className="text-gray-600 mb-8 leading-relaxed">{statsError}</p>
                    <button
                        onClick={() => window.location.reload()}
                        className="w-full py-3.5 bg-black hover:bg-gray-800 text-white rounded-xl font-semibold transition-all shadow-md"
                    >
                        Reconnect Now
                    </button>
                </div>
            </div>
        )
    }

    return (
        <RecruiterLayout jobCount={stats.activeJobs}>
            <div className="p-4 sm:p-6 md:p-8 lg:p-12 xl:p-16 bg-[#FDFDFD] min-h-full">
                <div className="max-w-[1600px] mx-auto">

                    {/* Header */}
                    <header className="flex flex-col gap-6 sm:gap-8 lg:flex-row lg:items-end lg:justify-between mb-8 sm:mb-12 lg:mb-16">
                        <div className="space-y-4">
                            <div className="flex items-center gap-4">
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    className="w-14 h-14 bg-blue-600 rounded-xl flex items-center justify-center text-2xl font-bold text-white shadow-lg"
                                >
                                    {user?.firstName?.[0] || 'R'}
                                </motion.div>
                                <div>
                                    <div className="flex items-center gap-3">
                                        <motion.h1
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900"
                                        >
                                            Hello, {user?.firstName || 'Recruiter'}
                                        </motion.h1>
                                    </div>
                                    <p className="text-gray-600 mt-2 text-base md:text-lg">Here's the latest from your recruitment pipeline.</p>
                                </div>
                            </div>

                            {!company && !companyLoading && (
                                <motion.div
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="p-8 bg-blue-600 rounded-[2.5rem] flex flex-col sm:flex-row items-center justify-between gap-8 shadow-2xl shadow-blue-600/20 relative overflow-hidden group"
                                >
                                    <div className="flex items-center gap-6 relative z-10">
                                        <div className="w-14 h-14 bg-white/10 rounded-2xl flex items-center justify-center text-white backdrop-blur-md">
                                            <Shield size={24} strokeWidth={2.5} />
                                        </div>
                                        <div>
                                            <p className="text-lg font-bold text-white">Complete Your Profile</p>
                                            <p className="text-sm text-blue-100">Set up your company details to start posting jobs.</p>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => navigate('/recruiter/company-profile')}
                                        className="w-full sm:w-auto px-6 py-3 bg-white hover:bg-gray-50 text-blue-600 font-semibold rounded-xl transition-all shadow-lg active:scale-95 relative z-10"
                                    >
                                        Setup Profile
                                    </button>
                                    <div className="absolute top-[-50%] right-[-10%] w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors" />
                                </motion.div>
                            )}
                        </div>

                        <div className="flex flex-wrap items-center gap-6">
                            <div className="relative group w-full lg:w-80">
                                <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-black transition-colors" size={20} />
                                <input
                                    type="text"
                                    placeholder="Search applicants..."
                                    className="w-full bg-white border border-gray-200 rounded-xl py-3 pl-14 pr-6 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all text-sm text-gray-900 font-medium shadow-sm"
                                />
                            </div>
                        </div>
                    </header>

                    {/* Main Stats */}
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12 lg:mb-16">
                        <StatsCard icon={Briefcase} label="Active Jobs" value={stats.activeJobs || 0} color="blue" trend="+12%" />
                        <StatsCard icon={Users} label="Total Applicants" value={stats.totalApplications || 0} color="purple" trend="+24%" />
                        <StatsCard icon={Clock} label="Reviews Pending" value={stats.appointments || 0} color="orange" trend="-5%" />
                        <StatsCard icon={CheckCircle} label="Success Hires" value={stats.onboarding || 0} color="green" trend="+8%" />
                    </div>

                    {/* Charts Section */}
                    <DashboardCharts
                        monthlyData={dashboardData?.monthlyData || []}
                        applicationSummary={dashboardData?.applicationSummary ? [
                            { name: 'In Review', value: dashboardData.applicationSummary.inReview, color: '#2563EB' },
                            { name: 'Shortlisted', value: dashboardData.applicationSummary.shortlisted, color: '#10B981' },
                            { name: 'Rejected', value: dashboardData.applicationSummary.rejected, color: '#EF4444' }
                        ] : []}
                        stats={stats}
                    />

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 sm:gap-8 lg:gap-12 mt-8 sm:mt-12">
                        {/* Recent Content */}
                        <div className="lg:col-span-2 space-y-12">
                            <UpcomingInterviews />
                            <ActivePostings jobs={dashboardData?.jobs || []} />
                        </div>

                        {/* Sidebar / Quick Actions */}
                        <div className="space-y-12">
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
                                    className="absolute inset-0 bg-black/60 backdrop-blur-md"
                                />
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.9, y: 40 }}
                                    animate={{ opacity: 1, scale: 1, y: 0 }}
                                    exit={{ opacity: 0, scale: 0.9, y: 40 }}
                                    className="relative w-full max-w-xl bg-white rounded-[3rem] p-12 shadow-2xl overflow-hidden"
                                >
                                    <button
                                        onClick={() => setShowVerifyModal(false)}
                                        className="absolute top-8 right-8 p-3 text-slate-300 hover:text-black hover:bg-slate-50 rounded-2xl transition-all"
                                    >
                                        <X size={24} />
                                    </button>
                                    <VerificationFlow onComplete={() => {
                                        window.location.reload();
                                    }} />
                                </motion.div>
                            </div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </RecruiterLayout>
    )
}

export default RecruiterDashboard
