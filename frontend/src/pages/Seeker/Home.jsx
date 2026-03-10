import React, { useState, useEffect, useRef } from 'react'
import Navbar from '../../components/Navbar'
import {
    Briefcase, TrendingUp, GraduationCap, Users,
    Globe, Zap, MessageCircle, Code2, Cpu, Settings, LineChart,
    BarChart, Palette, ArrowRight, MapPin, MousePointer2,
    DollarSign, Flame, Clock, ChevronRight, CheckCircle2, Star,
    Target, Rocket, Award, Shield
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
                HERO SECTION — Clean Professional Style
            ══════════════════════════════════════════ */}
            <section className="relative bg-white pt-24 pb-12 overflow-hidden z-10">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">

                    {/* Headline */}
                    <motion.h1
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.8, ease: 'easeOut' }}
                        className="font-heading text-5xl md:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-tight mb-4"
                    >
                        Find Your Dream Job
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3, duration: 0.7 }}
                        className="text-base md:text-lg text-slate-600 max-w-2xl mx-auto font-medium leading-relaxed mb-8"
                    >
                        Discover opportunities that match your skills and aspirations
                    </motion.p>

                    {/* CTA Button */}
                    <motion.div
                        initial={{ opacity: 0, y: 18 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5, duration: 0.7 }}
                        className="mb-8"
                    >
                        <button
                            onClick={() => navigate('/seeker/jobs')}
                            className="px-10 py-4 bg-black text-white font-bold rounded-xl shadow-lg hover:bg-slate-800 transition-all hover:scale-105 active:scale-95 inline-flex items-center gap-2 text-sm"
                        >
                            Explore All Jobs <ArrowRight size={18} />
                        </button>
                    </motion.div>

                    {/* Trending tag pills */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.7, duration: 0.7 }}
                        className="flex flex-wrap justify-center gap-3"
                    >
                        {trendingJobs.map((job, i) => (
                            <motion.span
                                key={i}
                                whileHover={{ scale: 1.05, backgroundColor: '#f1f5f9' }}
                                onClick={() => navigate(`/seeker/jobs?search=${encodeURIComponent(job)}`)}
                                className="px-5 py-2.5 bg-slate-50 border border-slate-200 text-slate-700 text-sm font-semibold rounded-lg cursor-pointer transition-all duration-300 shadow-sm hover:shadow-md hover:border-slate-300"
                            >
                                {job}
                            </motion.span>
                        ))}
                    </motion.div>
                </div>
            </section>

            <WaveDivider toColor="#ffffff" fromColor="rgb(239, 246, 255)" />

            {/* ══════════════════════════════════════════
                EVERYTHING YOU NEED TO SUCCEED
            ══════════════════════════════════════════ */}
            <section className="py-20 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-16">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            whileInView={{ opacity: 1, y: 0 }}
                            viewport={{ once: true }}
                            transition={{ duration: 0.6 }}
                        >
                            <h2 className="font-heading text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-3">
                                Everything You Need to Succeed
                            </h2>
                            <p className="text-slate-500 font-medium text-base max-w-2xl mx-auto">
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
                                whileHover={{ y: -8, boxShadow: '0 20px 40px rgba(0,0,0,0.1)' }}
                                className="group bg-gradient-to-br from-white to-slate-50 rounded-2xl p-6 border border-slate-200 shadow-sm hover:border-slate-300 transition-all duration-300 cursor-default"
                            >
                                <div className={`w-14 h-14 bg-gradient-to-br ${item.gradient} rounded-xl flex items-center justify-center mb-4 shadow-lg group-hover:scale-110 transition-transform duration-300`}>
                                    <item.icon size={26} className="text-white" />
                                </div>
                                <h3 className="font-heading text-lg font-black text-slate-900 mb-2 group-hover:text-blue-600 transition-colors">
                                    {item.title}
                                </h3>
                                <p className="text-sm text-slate-600 font-medium leading-relaxed">
                                    {item.desc}
                                </p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════
                STATS CARDS (Dashboard)
            ══════════════════════════════════════════ */}
            <section className="py-6 bg-white">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
                        {statCards.map((s, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.08 }}
                                whileHover={{ y: -6, scale: 1.02 }}
                                className="group relative bg-white rounded-2xl p-6 overflow-hidden cursor-default shadow-[0_4px_24px_rgba(0,0,0,0.07)] hover:shadow-[0_12px_40px_rgba(0,0,0,0.13)] transition-all duration-400 border border-slate-100"
                                style={{ borderTop: `3px solid ${s.accent}` }}
                            >
                                {/* Background subtle glow */}
                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                                    style={{ background: `radial-gradient(circle at top right, ${s.accent}12, transparent 60%)` }} />

                                {/* Icon */}
                                <div className="flex items-center justify-between mb-4">
                                    <div className="w-12 h-12 rounded-xl flex items-center justify-center shadow-sm transition-transform duration-300 group-hover:scale-110 group-hover:rotate-3"
                                        style={{ background: `${s.accent}18` }}>
                                        <s.icon size={22} style={{ color: s.accent }} />
                                    </div>
                                    <span className="text-xs font-bold px-2.5 py-1 rounded-full"
                                        style={{ background: `${s.accent}15`, color: s.accent }}>
                                        {s.trend}
                                    </span>
                                </div>

                                {/* Number */}
                                <p className="font-heading text-4xl font-black text-slate-900 mb-0.5">{s.value}</p>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mb-4">{s.label}</p>

                                {/* Progress bar */}
                                <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        whileInView={{ width: `${s.progress}%` }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 1, delay: 0.3 + i * 0.1, ease: 'easeOut' }}
                                        className="h-full rounded-full"
                                        style={{ background: s.accent }}
                                    />
                                </div>
                                <p className="text-xs text-slate-400 mt-1.5 font-medium">{s.sub}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Wave into categories */}
            <WaveDivider toColor="#f8fafc" fromColor="#ffffff" />

            {/* ══════════════════════════════════════════
                JOB CATEGORIES
            ══════════════════════════════════════════ */}
            <section className="py-8 bg-[#f8fafc]">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-14">
                        <h2 className="font-heading text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-3">
                            Popular Job Categories
                        </h2>
                        <p className="text-slate-500 font-medium text-base">
                            <span className="font-bold text-blue-600">{totalJobsCount.toLocaleString()}</span> jobs live — 
                            <span className="font-bold text-green-600">{jobsAddedToday}</span> added today.
                        </p>
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
                                    whileHover={{ y: -8, boxShadow: '0 20px 50px rgba(0,0,0,0.15)', backgroundColor: '#1e3a8a', borderColor: '#1e3a8a' }}
                                    onClick={() => navigate(`/seeker/jobs?search=${encodeURIComponent(category.name)}`)}
                                    className="group relative bg-white border border-slate-200 rounded-3xl p-8 cursor-pointer shadow-sm flex flex-col h-full overflow-hidden transition-all duration-500"
                                >
                                    {/* Grid texture overlay */}
                                    <div className="absolute inset-0 grid-texture opacity-50 pointer-events-none" />

                                    {/* Hot badge */}
                                    {isHot && (
                                        <div className="absolute top-4 right-4 flex items-center gap-1 px-2.5 py-1 bg-orange-50 group-hover:bg-orange-500/20 border border-orange-200 group-hover:border-orange-400/30 rounded-full transition-colors">
                                            <Flame size={10} className="text-orange-500 group-hover:text-orange-300" />
                                            <span className="text-[9px] font-black uppercase tracking-wider text-orange-600 group-hover:text-orange-200">Hot</span>
                                        </div>
                                    )}

                                    {/* Icon */}
                                    <div className="flex items-start justify-between mb-5 relative z-10">
                                        <div className={`w-14 h-14 rounded-2xl ${category.colorConfig?.icon} group-hover:bg-white/20 group-hover:backdrop-blur-sm flex items-center justify-center transition-all duration-500 group-hover:rotate-6`}>
                                            <Icon size={26} className="group-hover:text-white transition-colors duration-500" />
                                        </div>
                                        <ArrowRight size={18} className="text-slate-300 group-hover:text-white transition-colors duration-500 mt-1 opacity-0 group-hover:opacity-100" />
                                    </div>

                                    {/* Name + description */}
                                    <div className="relative z-10 mb-4">
                                        <h3 className="font-heading text-lg font-black text-slate-900 group-hover:text-white uppercase tracking-tight mb-1.5 transition-colors duration-500">
                                            {category.name}
                                        </h3>
                                        <p className="text-slate-500 group-hover:text-slate-200 text-xs font-medium leading-relaxed transition-colors duration-500 line-clamp-2">
                                            {category.description}
                                        </p>
                                    </div>

                                    {/* Skills */}
                                    <div className="flex flex-wrap gap-1.5 mb-5 relative z-10">
                                        {category.skills?.map((skill, i) => (
                                            <span key={i} className="px-2.5 py-1 bg-slate-100 text-slate-600 group-hover:bg-white/10 group-hover:text-white text-[9px] font-black uppercase rounded-lg border border-slate-200 group-hover:border-white/30 tracking-wider transition-all duration-500">
                                                {skill}
                                            </span>
                                        ))}
                                    </div>

                                    {/* Demand bar */}
                                    <div className="mb-5 relative z-10">
                                        <div className="flex justify-between items-center mb-1.5">
                                            <span className="text-[9px] font-black uppercase tracking-widest text-black group-hover:text-slate-300 transition-colors">Job Demand</span>
                                            <span className="text-[9px] font-black text-black group-hover:text-white transition-colors">{category.demand}%</span>
                                        </div>
                                        <div className="w-full bg-slate-100 group-hover:bg-black/30 rounded-full h-1.5 transition-colors duration-500">
                                            <div
                                                className="h-full rounded-full transition-all duration-700 bg-[var(--bar-color)] group-hover:!bg-white"
                                                style={{
                                                    width: `${category.demand}%`,
                                                    '--bar-color': category.colorConfig?.card || '#1e3a8a'
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* Footer */}
                                    <div className="pt-4 border-t border-slate-100 group-hover:border-white/20 mt-auto relative z-10 transition-colors duration-500 flex items-center justify-between">
                                        <div>
                                            <p className="font-heading text-xl font-black text-slate-900 group-hover:text-white transition-colors duration-500">{category.count}</p>
                                            <p className="text-[9px] font-black text-slate-400 group-hover:text-slate-300 uppercase tracking-widest transition-colors">Active Jobs</p>
                                        </div>
                                        <button className="px-4 py-2 bg-slate-900 group-hover:bg-white text-white group-hover:!text-slate-900 text-[9px] font-black uppercase tracking-wider rounded-xl transition-all duration-300 hover:scale-105 active:scale-95">
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
            <section className="py-20 bg-[#f8fafc]">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="font-heading text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-3">Featured Jobs</h2>
                        <p className="text-slate-500 font-medium text-base">Know your worth and find the job that qualifies your life</p>
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
                            className="px-12 py-4 bg-white border-2 border-slate-300 text-slate-800 hover:bg-[#1e3a8a] hover:border-[#1e3a8a] hover:text-black font-bold rounded-2xl shadow-sm transition-all hover:scale-100 active:scale-90 text-sm"
                        >
                            Load More Listings →
                        </button>
                    </div>
                </div>
            </section>

            {/* ══════════════════════════════════════════
                TOP COMPANIES — CARD GRID
            ══════════════════════════════════════════ */}
            <section className="py-20 bg-white border-t border-slate-100">
                <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="text-center mb-12">
                        <h2 className="font-heading text-4xl md:text-5xl font-black text-slate-900 tracking-tight mb-3">
                            Top Companies Hiring
                        </h2>
                        <p className="text-slate-500 font-medium text-base mb-5">Join the world's best companies</p>
                        <button
                            onClick={() => navigate('/seeker/companies')}
                            className="px-8 py-3 bg-black text-white text-sm font-bold rounded-xl hover:bg-slate-800 transition-all hover:scale-105"
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
                                <p className="font-heading font-bold text-slate-900 text-sm mb-1 group-hover:text-[#1e3a8a] transition-colors truncate w-full">
                                    {company.name}
                                </p>
                                <p className="text-xs text-slate-400 font-semibold">{company.openings} Openings</p>
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
                    className="w-14 h-14 bg-[#1e3a8a] hover:bg-blue-700 text-white rounded-full shadow-2xl flex items-center justify-center transition-all hover:scale-110 active:scale-95"
                >
                    <MessageCircle size={22} />
                </button>
            </div>
        </div>
    )
}

export default Home
