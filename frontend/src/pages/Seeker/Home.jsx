import React, { useState, useEffect, useRef } from 'react'
import Navbar from '../../components/Navbar'
import {
    Briefcase, TrendingUp, GraduationCap, Users,
    Globe, Zap, MessageCircle, Code2, Cpu, Settings, LineChart,
    BarChart, Palette, ArrowRight, MapPin, MousePointer2,
    DollarSign, Flame, Clock, ChevronRight, CheckCircle2, Star,
    Target, Rocket, Award, Shield, Sparkles, Crown
} from 'lucide-react'
import { motion } from 'framer-motion'
import axiosClient from '../../api/axiosClient'
import { useNavigate, Link } from 'react-router-dom'
import JobCard from '../../components/Cards/JobCard'
import WaveDivider from '../../components/Common/WaveDivider'
import { io } from 'socket.io-client'


/* ─────────────────────────────────────────────
   Main Home Component
───────────────────────────────────────────── */
const Home = () => {
    const navigate = useNavigate()
    const [liveCategories, setLiveCategories] = useState([])
    const [topCompanies, setTopCompanies] = useState([])
    const [jobs, setJobs] = useState([])
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState(null)
    const socketRef = useRef(null)
    const [totalJobsCount, setTotalJobsCount] = useState(0)
    const [jobsAddedToday, setJobsAddedToday] = useState(0)

    useEffect(() => {
        const fetchHomeData = async () => {
            try {
                const token = localStorage.getItem('seekerToken')
                console.log('🔍 Fetching home data from:', import.meta.env.VITE_API_URL)
                const promises = [
                    axiosClient.get('jobs/categories/stats'), // Using new stats endpoint with demand data
                    axiosClient.get('jobs/top-companies'),
                    axiosClient.get('jobs')
                ]
                if (token) promises.push(axiosClient.get('dashboard/seeker'))
                const results = await Promise.all(promises)

                console.log('✅ Categories data received:', results[0])
                console.log('✅ Companies data received:', results[1])
                console.log('✅ Jobs data received:', results[2])

                if (Array.isArray(results[0])) {
                    setLiveCategories(results[0])
                    // Calculate total jobs count from all categories
                    const total = results[0].reduce((sum, cat) => sum + (cat.count || 0), 0)
                    setTotalJobsCount(total)
                }
                if (Array.isArray(results[1])) setTopCompanies(results[1])
                if (Array.isArray(results[2])) {
                    setJobs(results[2].slice(0, 5))
                    // Count jobs added today
                    const today = new Date()
                    today.setHours(0, 0, 0, 0)
                    const todayCount = results[2].filter(job => {
                        const jobDate = new Date(job.createdAt)
                        return jobDate >= today
                    }).length
                    setJobsAddedToday(todayCount)
                }
                if (token && results[3]) setStats(results[3].stats)
            } catch (err) {
                console.error('❌ Error fetching home data:', err)
                console.error('Error details:', err.response?.data || err.message)
            } finally {
                setLoading(false)
            }
        }
        fetchHomeData()

        // 🔴 REAL-TIME: Setup Socket.io connection
        const token = localStorage.getItem('seekerToken')
        if (token) {
            const socketUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
            socketRef.current = io(socketUrl, {
                auth: { token },
                transports: ['websocket', 'polling']
            })

            // Listen for job count updates
            socketRef.current.on('jobCountUpdate', (updatedCounts) => {
                console.log('📊 Received real-time job count update:', updatedCounts)
                setLiveCategories(prev => {
                    const updated = prev.map(cat => {
                        const updatedCat = updatedCounts.find(u => u.name === cat.name)
                        if (updatedCat) {
                            return {
                                ...cat,
                                count: updatedCat.count,
                                displayCount: `${updatedCat.count}+ Jobs`
                            }
                        }
                        return cat
                    })
                    // Recalculate total jobs count
                    const total = updated.reduce((sum, cat) => sum + (cat.count || 0), 0)
                    setTotalJobsCount(total)
                    return updated
                })
            })

            // Listen for new job posted notifications
            socketRef.current.on('newJobPosted', (jobData) => {
                console.log('🆕 New job posted:', jobData)
                // Could show a toast notification here if desired
            })

            socketRef.current.on('connect', () => {
                console.log('✅ Socket connected for real-time updates')
            })

            socketRef.current.on('disconnect', () => {
                console.log('❌ Socket disconnected')
            })
        }

        return () => {
            if (socketRef.current) {
                socketRef.current.disconnect()
                socketRef.current = null
            }
        }
    }, [])


    // Category config
    const categoryIcons = {
        'IT': Code2, 'Non-IT': Briefcase, 'Remote': Globe,
        'Engineering': Cpu, 'Data Science': BarChart, 'Design': Palette,
        'Finance': DollarSign, 'Hardware': Zap, 'Product': Settings,
        'Sales': TrendingUp, 'Marketing': Zap
    }
    const categoryColors = [
        { icon: 'bg-blue-100 text-blue-600', card: '#3b82f6', hot: true },
        { icon: 'bg-orange-100 text-orange-600', card: '#f97316', hot: false },
        { icon: 'bg-emerald-100 text-emerald-600', card: '#10b981', hot: true },
        { icon: 'bg-purple-100 text-purple-600', card: '#8b5cf6', hot: false },
        { icon: 'bg-pink-100 text-pink-600', card: '#ec4899', hot: true },
        { icon: 'bg-cyan-100 text-cyan-600', card: '#06b6d4', hot: false },
        { icon: 'bg-amber-100 text-amber-600', card: '#f59e0b', hot: false },
        { icon: 'bg-indigo-100 text-indigo-600', card: '#6366f1', hot: false },
    ]
    const trendingJobs = ['ReactJS Developer', 'Data Analyst', 'Python Developer', 'UI/UX Designer', 'DevOps Engineer']

    const categoriesToDisplay = liveCategories.length > 0
        ? liveCategories.map((cat, idx) => {
            console.log(`📦 Mapping category ${cat.name}:`, { count: cat.count, demand: cat.demandPercentage, color: cat.color })
            return {
                id: cat._id || idx,
                name: cat.name,
                icon: categoryIcons[cat.name] || Code2,
                count: cat.displayCount || `${cat.count}+ Jobs`,
                colorConfig: {
                    icon: categoryColors[idx % categoryColors.length].icon,
                    card: cat.color || categoryColors[idx % categoryColors.length].card,
                    hot: cat.demandPercentage >= 80
                },
                description: 'Explore growing opportunities in this sector.',
                skills: cat.tags || ['Analysis', 'Communication', 'Technical'],
                demand: cat.demandPercentage || Math.floor(Math.random() * 60) + 40
            }
        })
        : [
            { id: 'm1', name: 'IT', count: '4+ Jobs', icon: MousePointer2, colorConfig: categoryColors[0], description: 'Software development, cloud computing & digital transformation.', skills: ['React', 'Node.js', 'AWS'], demand: 92 },
            { id: 'm2', name: 'Non-IT', count: '0+ Jobs', icon: Briefcase, colorConfig: categoryColors[1], description: 'Core industries, manufacturing, and operational excellence.', skills: ['Operations', 'Safety', 'Planning'], demand: 55 },
            { id: 'm3', name: 'Remote', count: '0+ Jobs', icon: Globe, colorConfig: categoryColors[2], description: 'Work from anywhere with top global companies.', skills: ['Self-discipline', 'Async Comm', 'Digital Tools'], demand: 88 },
            { id: 'm4', name: 'Engineering', count: '0+ Jobs', icon: Cpu, colorConfig: categoryColors[3], description: 'Civil, mechanical, and electrical engineering roles.', skills: ['AutoCAD', 'Math', 'Problem Solving'], demand: 67 },
            { id: 'm5', name: 'Data Science', count: '0+ Jobs', icon: BarChart, colorConfig: categoryColors[4], description: 'Data analysis, machine learning, and big data.', skills: ['Python', 'SQL', 'Statistics'], demand: 95 },
            { id: 'm6', name: 'Design', count: '0+ Jobs', icon: Palette, colorConfig: categoryColors[5], description: 'Creative direction, UI/UX, and graphic design.', skills: ['Figma', 'Adobe', 'UX Research'], demand: 73 },
            { id: 'm7', name: 'Finance', count: '0+ Jobs', icon: DollarSign, colorConfig: categoryColors[6], description: 'Banking, accounting, and financial planning.', skills: ['Tally', 'Excel', 'Audit'], demand: 60 },
            { id: 'm8', name: 'Hardware', count: '0+ Jobs', icon: Zap, colorConfig: categoryColors[7], description: 'Semiconductors, VLSI, and electronics manufacturing.', skills: ['Verilog', 'PCB Design', 'MATLAB'], demand: 48 },
        ]

    const currentStats = stats || { applied: 4, shortlisted: 0, interviews: 2, offers: 0 }

    const statCards = [
        { label: 'Applied', value: currentStats.applied, sub: 'Total Applications', icon: Briefcase, color: 'blue', accent: '#3b82f6', trend: '+2 this week', progress: 65 },
        { label: 'Shortlisted', value: currentStats.shortlisted, sub: 'Next Stage', icon: TrendingUp, color: 'emerald', accent: '#10b981', trend: '↑ 12%', progress: 30 },
        { label: 'Interviews', value: currentStats.interviews, sub: 'Upcoming', icon: Users, color: 'orange', accent: '#f97316', trend: '2 scheduled', progress: 50 },
        { label: 'Offers', value: currentStats.offers, sub: 'Received', icon: GraduationCap, color: 'purple', accent: '#8b5cf6', trend: 'Review now', progress: 10 },
    ]



    // Company colors for marquee
    const companyBgColors = [
        'linear-gradient(135deg,#1e3a8a,#3b82f6)',
        'linear-gradient(135deg,#065f46,#10b981)',
        'linear-gradient(135deg,#7c3aed,#a78bfa)',
        'linear-gradient(135deg,#b45309,#fbbf24)',
        'linear-gradient(135deg,#be123c,#fb7185)',
        'linear-gradient(135deg,#0e7490,#22d3ee)',
    ]
    const companiesForMarquee = topCompanies.length > 0
        ? topCompanies.map((c, i) => ({ ...c, bgColor: companyBgColors[i % companyBgColors.length] }))
        : [
            { name: 'Google', openings: 12, bgColor: companyBgColors[0] },
            { name: 'Microsoft', openings: 8, bgColor: companyBgColors[1] },
            { name: 'Amazon', openings: 15, bgColor: companyBgColors[2] },
            { name: 'Infosys', openings: 20, bgColor: companyBgColors[3] },
            { name: 'TCS', openings: 25, bgColor: companyBgColors[4] },
            { name: 'Flipkart', openings: 10, bgColor: companyBgColors[5] },
            { name: 'Zomato', openings: 6, bgColor: companyBgColors[0] },
            { name: 'Razorpay', openings: 9, bgColor: companyBgColors[1] },
        ]

    const featuredJob = jobs[0]
    const remainingJobs = jobs.slice(1)

    return (
        <div className="min-h-screen relative overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>

            {/* ── Google Fonts ── */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap');

                .font-heading { font-family: 'Poppins', sans-serif; }

                /* Animated gradient bg */
                @keyframes gradientShift {
                    0%   { background-position: 0% 50%; }
                    50%  { background-position: 100% 50%; }
                    100% { background-position: 0% 50%; }
                }
                .animated-hero-bg {
                    background: linear-gradient(-45deg, #f0f4ff, #e8eeff, #f5f0ff, #eef4ff, #f0f9ff);
                    background-size: 400% 400%;
                    animation: gradientShift 12s ease infinite;
                }

                /* Gradient text */
                .gradient-text {
                    background: linear-gradient(135deg, #0f172a 0%, #1e3a8a 50%, #3b82f6 100%);
                    -webkit-background-clip: text;
                    -webkit-text-fill-color: transparent;
                    background-clip: text;
                }

                /* Mesh overlay */
                .mesh-overlay {
                    background-image:
                        radial-gradient(circle at 20% 20%, rgba(59,130,246,0.12) 0%, transparent 50%),
                        radial-gradient(circle at 80% 80%, rgba(139,92,246,0.10) 0%, transparent 50%),
                        radial-gradient(circle at 60% 30%, rgba(16,185,129,0.08) 0%, transparent 40%);
                }

                /* Grid texture */
                .grid-texture {
                    background-image: linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
                                      linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px);
                    background-size: 20px 20px;
                }

                /* Glassmorphism */
                .glass-card {
                    background: rgba(255,255,255,0.7);
                    backdrop-filter: blur(20px);
                    -webkit-backdrop-filter: blur(20px);
                    border: 1px solid rgba(255,255,255,0.8);
                }


            `}</style>



            <Navbar />

            {/* ══════════════════════════════════════════
                HERO SECTION — Elegant Luxury Style
            ══════════════════════════════════════════ */}
            <section className="relative bg-white pt-24 pb-16 overflow-hidden z-10">
                {/* Elegant background effects */}


                {/* Floating particles */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    {[...Array(20)].map((_, i) => (
                        <div
                            key={i}
                            className="absolute w-1 h-1 bg-amber-400/40 rounded-full"
                            style={{
                                left: `${Math.random() * 100}%`,
                                top: `${Math.random() * 100}%`,
                                animation: `float ${5 + Math.random() * 10}s infinite ease-in-out`,
                                animationDelay: `${Math.random() * 5}s`
                            }}
                        />
                    ))}
                </div>

                <style>{`
                    @keyframes float {
                        0%, 100% { transform: translateY(0px) translateX(0px); opacity: 0; }
                        50% { transform: translateY(-100px) translateX(20px); opacity: 1; }
                    }
                `}</style>
                <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 mb-6"
                    >
                        Find Your Dream Job
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.7 }}
                        className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-10"
                    >
                        Discover opportunities that match your skills and aspirations
                    </motion.p>

                    {/* CTA Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.7 }}
                        className="mb-10"
                    >
                        <button
                            onClick={() => navigate('/seeker/jobs')}
                            className="group relative px-8 py-4 bg-black hover:bg-gray-900 text-white font-semibold rounded-xl transition-all hover:scale-105 active:scale-95 inline-flex items-center gap-3 text-base shadow-none"
                        >

                            <span className="relative z-10">Explore All Jobs</span>
                            <ArrowRight className="relative z-10 group-hover:translate-x-1 transition-transform" size={20} />
                        </button>
                    </motion.div>

                    {/* Trending tag pills */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7, duration: 0.7 }}
                        className="flex flex-wrap justify-center gap-3"
                    >
                        <span className="text-blue-600 text-sm font-semibold flex items-center gap-2">
                            <Sparkles size={14} /> Trending:
                        </span>
                        {trendingJobs.map((job, i) => (
                            <motion.span
                                key={i}
                                whileHover={{ scale: 1.05 }}
                                onClick={() => navigate(`/seeker/jobs?search=${encodeURIComponent(job)}`)}
                                className="px-5 py-2.5 bg-white backdrop-blur-sm border border-blue-300 text-blue-700 text-sm font-semibold rounded-xl cursor-pointer transition-all duration-300 hover:bg-blue-50 hover:border-blue-400 hover:shadow-lg hover:shadow-blue-500/20"
                            >
                                {job}
                            </motion.span>
                        ))}
                    </motion.div>
                </div>
            </section>

            <div className="relative h-8 bg-white" />

            {/* ══════════════════════════════════════════
                EVERYTHING YOU NEED TO SUCCEED - Elegant
            ══════════════════════════════════════════ */}
            <section className="py-20 bg-white relative overflow-hidden">

                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-12">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                                Everything You Need to Succeed
                            </h2>
                            <p className="text-gray-600 text-base max-w-2xl mx-auto">
                                Powerful tools and resources to accelerate your job search and career growth
                            </p>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {[
                            {
                                icon: Briefcase,
                                title: 'Browse Jobs',
                                desc: 'Access thousands of verified job listings from top companies worldwide',
                                color: 'blue',
                                gradient: 'from-blue-500 to-cyan-500'
                            },
                            {
                                icon: Target,
                                title: 'Apply Easily',
                                desc: 'One-click applications with your profile. Track everything in one place',
                                color: 'emerald',
                                gradient: 'from-emerald-500 to-teal-500'
                            },
                            {
                                icon: GraduationCap,
                                title: 'Skill Development',
                                desc: 'Access free courses from leading companies to boost your career',
                                color: 'purple',
                                gradient: 'from-purple-500 to-pink-500'
                            },
                            {
                                icon: Rocket,
                                title: 'Career Growth',
                                desc: 'Get matched with opportunities that align with your skills and goals',
                                color: 'orange',
                                gradient: 'from-orange-500 to-red-500'
                            }
                        ].map((item, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.1, duration: 0.6 }}
                                whileHover={{ y: -12, boxShadow: '0 25px 50px rgba(37, 99, 235, 0.2)' }}
                                className="group relative bg-gradient-to-br from-white via-white to-blue-50/30 rounded-3xl p-8 border-2 border-blue-200/50 shadow-xl hover:border-blue-300 hover:shadow-2xl transition-all duration-500 cursor-default overflow-hidden"
                            >
                                {/* Premium shine effect */}
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-200/30 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className={`relative w-16 h-16 bg-gradient-to-br ${item.gradient} rounded-2xl flex items-center justify-center mb-6 shadow-2xl shadow-blue-500/20 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500`}>
                                    <item.icon size={26} className="text-white stroke-white" strokeWidth={2.5} />
                                </div>
                                <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-blue-700 transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-sm text-gray-600 leading-relaxed">
                                    {item.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════
                STATS CARDS - Elite Dashboard
            ══════════════════════════════════════════ */}
            <section className="py-16 bg-white relative overflow-hidden">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {statCards.map((s, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08 }}
                                whileHover={{ y: -8, scale: 1.03 }}
                                className="group relative bg-white rounded-2xl p-6 overflow-hidden cursor-default shadow-md hover:shadow-xl hover:border-gray-300 transition-all duration-300 border-2 border-gray-200"
                            >
                                {/* Elegant glow effect */}
                                <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                                <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                <div className="flex items-center justify-between mb-6 relative z-10">
                                    <div className="w-14 h-14 rounded-xl flex items-center justify-center shadow-lg transition-all duration-300 group-hover:scale-110 bg-gradient-to-br from-blue-500 to-blue-600">
                                        <s.icon size={24} className="text-white" color="white" />
                                    </div>
                                    <span className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-50 border border-blue-200 text-blue-700">
                                        {s.trend}
                                    </span>
                                </div>

                                {/* Number */}
                                <p className="relative z-10 text-4xl font-bold text-gray-900 mb-2">{s.value}</p>
                                <p className="relative z-10 text-sm text-gray-600 font-semibold mb-6">{s.label}</p>

                                {/* Progress bar */}
                                <div className="relative z-10 w-full bg-blue-50 rounded-full h-2 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${s.progress}%` }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 1.5, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
                                        className="h-full rounded-full bg-gradient-to-r from-blue-400 to-blue-600 shadow-lg shadow-blue-500/50"
                                    />
                                </div>
                                <p className="relative z-10 text-xs text-gray-500 mt-2">{s.sub}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Elegant gradient divider */}
            <div className="relative h-8 bg-white" />

            {/* ══════════════════════════════════════════
                JOB CATEGORIES - Elegant
            ══════════════════════════════════════════ */}
            <section className="py-20 bg-white relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                        >
                            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-6">
                                Popular Job Categories
                            </h2>
                        </motion.div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {categoriesToDisplay.map((category, idx) => {
                            const Icon = category.icon
                            const isHot = category.colorConfig?.hot && category.demand > 80
                            return (
                                <motion.div
                                    key={category.id}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ delay: idx * 0.06 }}
                                    whileHover={{ y: -8, boxShadow: '0 25px 50px rgba(37, 99, 235, 0.25)', borderColor: '#60a5fa' }}
                                    onClick={() => navigate(`/seeker/jobs?search=${encodeURIComponent(category.name)}`)}
                                    className="group relative bg-gradient-to-br from-white via-white to-blue-50/50 border-2 border-blue-200/50 rounded-2xl p-6 cursor-pointer shadow-lg hover:shadow-xl flex flex-col h-full overflow-hidden transition-all duration-500"
                                >
                                    {/* Grid texture overlay */}
                                    <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-br from-blue-500/5 to-transparent" />

                                    {/* Premium glow */}
                                    <div className="absolute top-0 right-0 w-40 h-40 bg-gradient-to-br from-blue-400/20 to-transparent rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    {/* Hot badge */}
                                    {isHot && (
                                        <div className="absolute top-4 right-4 flex items-center gap-1 px-3 py-1.5 bg-gradient-to-r from-orange-400 to-red-500 border border-orange-300 rounded-full shadow-lg">
                                            <Flame size={12} className="text-white" />
                                            <span className="text-[10px] font-black uppercase tracking-wider text-white">Hot</span>
                                        </div>
                                    )}

                                    {/* Icon */}
                                    <div className="flex items-start justify-between mb-5 relative z-10">
                                        <div className={`w-14 h-14 rounded-xl ${category.colorConfig?.icon} shadow-lg flex items-center justify-center transition-all duration-500 group-hover:scale-110`}>
                                            <Icon size={26} className="group-hover:drop-shadow-lg transition-all duration-500" />
                                        </div>
                                        <ArrowRight size={20} className="text-blue-400 transition-all duration-500 mt-1 opacity-0 group-hover:opacity-100 group-hover:translate-x-1" />
                                    </div>

                                    {/* Name + description */}
                                    <div className="relative z-10 mb-5">
                                        <h3 className="text-lg font-bold text-gray-900 mb-2">
                                            {category.name}
                                        </h3>
                                        <p className="text-gray-600 text-sm leading-relaxed line-clamp-2">
                                            {category.description}
                                        </p>
                                    </div>

                                    {/* Skills */}
                                    <div className="flex flex-wrap gap-2 mb-6 relative z-10">
                                        {category.skills?.map((skill, i) => (
                                            <span key={i} className="px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 text-xs font-semibold rounded-lg transition-all duration-300 hover:bg-blue-100">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Demand bar */}
                                    <div className="mb-6 relative z-10">
                                        <div className="flex justify-between items-center mb-2">
                                            <span className="text-xs font-semibold text-gray-600">Job Demand</span>
                                            <span className="text-sm font-bold text-blue-600">{category.demand}%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 rounded-full h-2 transition-colors duration-500 overflow-hidden">
                                            <div
                                                className="h-full rounded-full transition-all duration-700 bg-gradient-to-r from-blue-400 to-blue-600 shadow-lg shadow-blue-500/30"
                                                style={{ width: `${category.demand}%` }}
                                            />
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="pt-5 border-t-2 border-blue-200/50 mt-auto relative z-10 transition-colors duration-500 flex items-center justify-between">
                                        <div>
                                            <p className="text-2xl font-bold text-gray-900">{category.count}</p>
                                            <p className="text-xs font-semibold text-gray-500">Active Jobs</p>
                                        </div>
                                        <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-semibold rounded-lg transition-all duration-300 hover:scale-105 active:scale-95 shadow-md">
                                            Explore
                                        </button>
                                    </div>
                                </motion.div>
                            )
                        })}
                    </div>
                </div>
            </section>



            {/* ══════════════════════════════════════════
                FEATURED JOBS
            ══════════════════════════════════════════ */}
            <section className="py-16 bg-[#f8fafc]">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">Featured Jobs</h2>
                        <p className="text-gray-600 text-base">Know your worth and find the job that qualifies your life</p>
                        <Link to="/seeker/jobs" className="inline-flex items-center gap-1 text-[#1e3a8a] font-bold text-sm mt-3 hover:underline">
                            Explore All Opportunities <ChevronRight size={15} />
                        </Link>
                    </div>

                    {/* Normal 3-column grid of job cards */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {jobs.map((job, idx) => (
                            <motion.div
                                key={job._id || idx}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: idx * 0.07 }}
                            >
                                <JobCard
                                    job={job}
                                    onClick={() => navigate('/seeker/jobs')}
                                    onApply={() => navigate('/seeker/jobs')}
                                />
                            </motion.div>
                        ))}
                    </div>

                    <div className="flex justify-center mt-12">
                        <button
                            onClick={() => navigate('/seeker/jobs')}
                            className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl shadow-md transition-all hover:scale-105 active:scale-95"
                        >
                            Load More Listings →
                        </button>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════
                TOP COMPANIES — CARD GRID
            ══════════════════════════════════════════ */}
            <section className="py-16 bg-white border-t border-slate-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-3">
                            Top Companies Hiring
                        </h2>
                        <p className="text-gray-600 text-base mb-5">Join the world's best companies</p>
                        <button
                            onClick={() => navigate('/seeker/companies')}
                            className="px-6 py-2.5 bg-gray-900 hover:bg-gray-800 text-white font-semibold rounded-xl transition-all hover:scale-105 shadow-md"
                        >
                            View All Partners →
                        </button>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5">
                        {companiesForMarquee.slice(0, 8).map((company, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, y: 10 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.08)', borderColor: '#1e3a8a' }}
                                onClick={() => navigate(`/seeker/jobs?search=${encodeURIComponent(company.name)}`)}
                                className="group bg-white border border-slate-200 rounded-2xl p-6 flex flex-col items-center text-center cursor-pointer transition-all shadow-sm"
                            >
                                {/* Logo circle */}
                                <div
                                    className="w-14 h-14 rounded-2xl flex items-center justify-center text-white font-black text-xl mb-4 shadow-sm bg-slate-900 group-hover:scale-105 transition-transform"
                                >
                                    {company.logo || company.name?.charAt(0) || 'C'}
                                </div>
                                <p className="font-bold text-gray-900 text-sm mb-1 group-hover:text-blue-700 transition-colors truncate w-full">
                                    {company.name}
                                </p>
                                <p className="text-xs text-gray-500 font-semibold">{company.openings} Openings</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════
                CHAT WIDGET
            ══════════════════════════════════════════ */}
            <div className="fixed bottom-6 right-6 z-50">
                <button
                    onClick={() => navigate('/seeker/chat')}
                    className="w-14 h-14 bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white rounded-full shadow-2xl shadow-blue-500/30 hover:shadow-blue-500/50 flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                >
                    <MessageCircle size={22} className="text-white stroke-white" strokeWidth={2.5} />
                </button>
            </div>
        </div>
    )
}

export default Home
