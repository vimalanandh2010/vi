import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Calendar, ChevronLeft, ChevronRight, Clock, User, Briefcase,
    Mail, MapPin, Loader2, LayoutDashboard, Users, MessageSquare,
    Home, LogOut, Building2, X
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import Navbar from '../../components/Navbar'
import { Link, useNavigate } from 'react-router-dom'
import axiosClient from '../../api/axiosClient'
import InterviewCard from '../../components/Recruiter/Dashboard/InterviewCard'

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const RecruiterCalendar = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const [interviews, setInterviews] = useState([])
    const [loading, setLoading] = useState(true)
    const [today] = useState(new Date())
    const [viewDate, setViewDate] = useState(new Date())
    const [selectedDay, setSelectedDay] = useState(null)
    const [selectedDayInterviews, setSelectedDayInterviews] = useState([])
    const [jobCount, setJobCount] = useState(0)

    useEffect(() => {
        fetchInterviews()
        fetchJobCount()
    }, [])

    const fetchInterviews = async () => {
        try {
            const res = await axiosClient.get('jobs/recruiter/interviews')
            const sortedInterviews = (res.interviews || []).sort((a, b) => {
                const dateA = new Date(`${a.interviewDate}T${a.interviewTime}`);
                const dateB = new Date(`${b.interviewDate}T${b.interviewTime}`);
                return dateA - dateB;
            });
            setInterviews(sortedInterviews)
        } catch (err) {
            console.error('Failed to fetch interviews:', err)
        } finally {
            setLoading(false)
        }
    }

    const fetchJobCount = async () => {
        try {
            const res = await axiosClient.get('jobs/recruiter/jobs')
            setJobCount(res.length)
        } catch { }
    }

    // Build map: dateKey -> interviews[]
    const interviewMap = {}
    interviews.forEach(iv => {
        const key = iv.interviewDate
        if (!interviewMap[key]) interviewMap[key] = []
        interviewMap[key].push(iv)
    })

    const year = viewDate.getFullYear()
    const month = viewDate.getMonth()

    const firstDay = new Date(year, month, 1).getDay()
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const cells = Array(firstDay).fill(null).concat(Array.from({ length: daysInMonth }, (_, i) => i + 1))
    while (cells.length % 7 !== 0) cells.push(null)

    const toKey = (d) => {
        const dd = String(d).padStart(2, '0')
        const mm = String(month + 1).padStart(2, '0')
        return `${year}-${mm}-${dd}`
    }

    const isToday = (d) => d && year === today.getFullYear() && month === today.getMonth() && d === today.getDate()

    const openDay = (d) => {
        if (!d) return
        const key = toKey(d)
        setSelectedDay(key)
        setSelectedDayInterviews(interviewMap[key] || [])
    }

    const formatTime = (t) => {
        if (!t) return ''
        const [hh, mm] = t.split(':')
        const h = parseInt(hh, 10)
        return `${h > 12 ? h - 12 : h === 0 ? 12 : h}:${mm} ${h >= 12 ? 'PM' : 'AM'}`
    }

    const SidebarItem = ({ icon: Icon, label, active = false, onClick, badge, className = '' }) => (
        <div
            onClick={onClick}
            className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${active
                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/30'
                : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                } ${className}`}
        >
            <div className="flex items-center gap-3">
                <Icon size={20} />
                <span className="font-medium text-sm">{label}</span>
            </div>
            {badge !== undefined && badge > 0 && (
                <span className="px-2 py-0.5 bg-blue-500/20 border border-blue-400/30 text-blue-400 rounded-full text-xs font-bold">
                    {badge}
                </span>
            )}
        </div>
    )

    return (
        <div className="flex flex-col h-screen bg-slate-950 overflow-hidden">
            <Navbar />
            <div className="flex flex-1 overflow-hidden">
                {/* Sidebar */}
                <aside className="w-64 bg-slate-900 border-r border-slate-800 p-6 flex flex-col hidden lg:flex">
                    <div className="space-y-2 flex-1">
                        <Link to="/recruiter/dashboard"><SidebarItem icon={LayoutDashboard} label="Dashboard" /></Link>
                        <Link to="/recruiter/candidates"><SidebarItem icon={Users} label="Candidates" /></Link>
                        <Link to="/recruiter/jobs"><SidebarItem icon={Briefcase} label="Jobs" badge={jobCount} /></Link>
                        <SidebarItem icon={Calendar} label="Calendar" active />

                        <div className="pt-4 mt-4 border-t border-slate-800 space-y-2">
                            <Link to="/recruiter/chat"><SidebarItem icon={MessageSquare} label="Messages" /></Link>
                            <Link to="/recruiter/community"><SidebarItem icon={Building2} label="Community" /></Link>
                            <Link to="/recruiter/company-profile"><SidebarItem icon={Building2} label="Company Profile" /></Link>
                        </div>
                    </div>
                    <div className="space-y-2 mt-4">
                        <SidebarItem icon={Home} label="Exit" onClick={() => navigate('/recruiter/home')} />
                        <SidebarItem icon={LogOut} label="Logout" onClick={() => logout()} className="text-red-400 hover:bg-red-500/10 hover:text-red-400" />
                    </div>
                    <div className="pt-6 border-t border-slate-800 flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center font-bold text-white">
                            {user?.firstName?.charAt(0) || 'R'}
                        </div>
                        <div>
                            <p className="text-sm font-bold text-white truncate max-w-[120px]">{user?.firstName || 'Recruiter'}</p>
                            <p className="text-[10px] text-slate-500">Hiring Manager</p>
                        </div>
                    </div>
                </aside>

                {/* Main Content */}
                <main className="flex-1 overflow-y-auto p-8">
                    <div className="max-w-5xl mx-auto">
                        {/* Header */}
                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h1 className="text-3xl font-black text-white">Interview Calendar</h1>
                                <p className="text-slate-400 text-sm mt-1">All scheduled mock basic interviews — max 2 per day</p>
                            </div>
                            <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 rounded-2xl px-4 py-2">
                                <span className="w-3 h-3 rounded-full bg-blue-500"></span>
                                <span className="text-xs text-slate-400 font-semibold">{interviews.length} interviews scheduled</span>
                            </div>
                        </div>

                        {loading ? (
                            <div className="flex flex-col items-center justify-center h-64 text-slate-500">
                                <Loader2 className="animate-spin mb-4" size={36} />
                                <p className="text-sm">Loading calendar...</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                                {/* Calendar Grid */}
                                <div className="xl:col-span-2">
                                    <div className="bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden">
                                        {/* Month Navigation */}
                                        <div className="flex items-center justify-between p-6 border-b border-slate-800">
                                            <button
                                                onClick={() => setViewDate(new Date(year, month - 1))}
                                                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                                            >
                                                <ChevronLeft size={18} />
                                            </button>
                                            <h2 className="font-black text-white text-xl">{MONTH_NAMES[month]} {year}</h2>
                                            <button
                                                onClick={() => setViewDate(new Date(year, month + 1))}
                                                className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                                            >
                                                <ChevronRight size={18} />
                                            </button>
                                        </div>

                                        {/* Day Headers */}
                                        <div className="grid grid-cols-7 border-b border-slate-800">
                                            {DAY_NAMES.map(d => (
                                                <div key={d} className="py-3 text-center text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                                    {d}
                                                </div>
                                            ))}
                                        </div>

                                        {/* Calendar Cells */}
                                        <div className="grid grid-cols-7">
                                            {cells.map((d, idx) => {
                                                const key = d ? toKey(d) : null
                                                const dayInterviews = key ? (interviewMap[key] || []) : []
                                                const hasInterviews = dayInterviews.length > 0
                                                const isFull = dayInterviews.length >= 2
                                                const isSelected = key === selectedDay

                                                return (
                                                    <motion.div
                                                        key={idx}
                                                        onClick={() => openDay(d)}
                                                        whileHover={d ? { scale: 0.97 } : {}}
                                                        className={`min-h-[80px] p-2 border-b border-r border-slate-800/60 cursor-pointer transition-all relative
                                                            ${!d ? 'bg-slate-950/40' : 'hover:bg-slate-800/40'}
                                                            ${isSelected ? 'bg-blue-600/10 border-blue-500/40 ring-1 ring-blue-500/30' : ''}
                                                        `}
                                                    >
                                                        {d && (
                                                            <>
                                                                <span className={`inline-flex w-7 h-7 items-center justify-center rounded-full text-xs font-bold mb-1
                                                                    ${isToday(d) ? 'bg-blue-600 text-white' : 'text-slate-400'}
                                                                `}>
                                                                    {d}
                                                                </span>
                                                                <div className="space-y-0.5">
                                                                    {dayInterviews.slice(0, 3).map((iv, i) => (
                                                                        <div key={i} className={`w-full px-1.5 py-1 rounded text-[7px] font-bold truncate leading-tight transition-transform hover:scale-105
                                                                            ${i === 0 ? 'bg-blue-500/20 text-blue-400 border border-blue-500/20' :
                                                                                i === 1 ? 'bg-violet-500/20 text-violet-400 border border-violet-500/20' :
                                                                                    'bg-emerald-500/20 text-emerald-400 border border-emerald-500/20'}
                                                                        `}>
                                                                            <span className="opacity-70">{formatTime(iv.interviewTime)}</span><br />
                                                                            <span className="text-[8px]">{iv.user?.firstName}</span>
                                                                            <div className="text-[6px] opacity-60 mt-0.5 truncate uppercase tracking-tighter">{iv.job?.title}</div>
                                                                        </div>
                                                                    ))}
                                                                    {dayInterviews.length > 3 && (
                                                                        <div className="text-[8px] text-slate-600 font-bold text-center mt-1">
                                                                            +{dayInterviews.length - 3} more
                                                                        </div>
                                                                    )}
                                                                </div>
                                                                {isFull && (
                                                                    <div className="absolute top-2 right-2 flex gap-0.5">
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.8)]"></div>
                                                                        <div className="w-1.5 h-1.5 rounded-full bg-red-600 shadow-[0_0_8px_rgba(220,38,38,0.8)]"></div>
                                                                    </div>
                                                                )}
                                                            </>
                                                        )}
                                                    </motion.div>
                                                )
                                            })}
                                        </div>
                                    </div>
                                </div>

                                {/* Right Panel — Upcoming OR Selected Day */}
                                <div className="space-y-4">
                                    {selectedDay ? (
                                        <>
                                            <div className="flex items-center justify-between">
                                                <h3 className="font-bold text-white text-sm">{selectedDay}</h3>
                                                <button onClick={() => setSelectedDay(null)} className="text-slate-500 hover:text-white">
                                                    <X size={16} />
                                                </button>
                                            </div>
                                            {selectedDayInterviews.length === 0 ? (
                                                <div className="bg-slate-900 border border-dashed border-slate-700 rounded-2xl p-6 text-center">
                                                    <Calendar className="mx-auto text-slate-700 mb-3" size={28} />
                                                    <p className="text-slate-600 text-sm italic">No interviews this day</p>
                                                </div>
                                            ) : (
                                                selectedDayInterviews.map((iv, i) => (
                                                    <InterviewCard key={i} iv={iv} formatTime={formatTime} index={i} />
                                                ))
                                            )}
                                        </>
                                    ) : (
                                        <>
                                            <h3 className="font-bold text-white text-sm uppercase tracking-wider">Upcoming Interviews</h3>
                                            {interviews.length === 0 ? (
                                                <div className="bg-slate-900 border border-dashed border-slate-700 rounded-2xl p-8 text-center">
                                                    <Calendar className="mx-auto text-slate-700 mb-3" size={32} />
                                                    <p className="text-slate-500 text-sm">No interviews scheduled yet</p>
                                                    <p className="text-slate-600 text-xs mt-1">Schedule interviews from the Candidates page</p>
                                                </div>
                                            ) : (
                                                interviews.slice(0, 8).map((iv, i) => (
                                                    <InterviewCard key={i} iv={iv} index={i} />
                                                ))
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </main>
            </div>
        </div>
    )
}

export default RecruiterCalendar
