import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Calendar, ChevronLeft, ChevronRight, Loader2, X
} from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'
import axiosClient from '../../api/axiosClient'
import InterviewCard from '../../components/Recruiter/Dashboard/InterviewCard'
import RecruiterLayout from '../../components/RecruiterLayout'
import GoogleCalendarSync from '../../components/Calendar/GoogleCalendarSync'

const MONTH_NAMES = ['January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December']
const DAY_NAMES = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

const RecruiterCalendar = () => {
    const { user } = useAuth()
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

    return (
        <RecruiterLayout jobCount={jobCount}>
            <main className="p-12 max-w-7xl mx-auto bg-white min-h-full">
                {/* Header */}
                <div className="flex items-center justify-between mb-12">
                    <div>
                        <h1 className="text-4xl font-black text-black">Interview Calendar</h1>
                        <p className="text-slate-500 font-medium mt-2">Manage your upcoming candidate interview sessions</p>
                    </div>
                    <div className="flex items-center gap-4">
                        <GoogleCalendarSync />
                        <div className="flex items-center gap-4 bg-slate-50 border border-slate-100 rounded-2xl px-6 py-3 shadow-sm">
                            <div className="w-3 h-3 rounded-full bg-blue-600 animate-pulse"></div>
                            <span className="text-sm text-black font-black uppercase tracking-widest">{interviews.length} Scheduled</span>
                        </div>
                    </div>
                </div>

                {loading ? (
                    <div className="flex flex-col items-center justify-center h-96 text-slate-400">
                        <Loader2 className="animate-spin mb-4" size={40} />
                        <p className="text-sm font-black uppercase tracking-widest">Loading Calendar...</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 xl:grid-cols-3 gap-12">
                        {/* Calendar Grid */}
                        <div className="xl:col-span-2">
                            <div className="bg-white border border-slate-100 rounded-[2.5rem] shadow-xl overflow-hidden">
                                {/* Month Navigation */}
                                <div className="flex items-center justify-between p-8 border-b border-slate-50 bg-slate-50/30">
                                    <button
                                        onClick={() => setViewDate(new Date(year, month - 1))}
                                        className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-black text-black transition-all shadow-sm"
                                    >
                                        <ChevronLeft size={20} />
                                    </button>
                                    <h2 className="font-black text-black text-2xl uppercase tracking-tighter">{MONTH_NAMES[month]} {year}</h2>
                                    <button
                                        onClick={() => setViewDate(new Date(year, month + 1))}
                                        className="p-3 rounded-2xl bg-white border border-slate-200 hover:border-black text-black transition-all shadow-sm"
                                    >
                                        <ChevronRight size={20} />
                                    </button>
                                </div>

                                {/* Day Headers */}
                                <div className="grid grid-cols-7 bg-white border-b border-slate-50">
                                    {DAY_NAMES.map(d => (
                                        <div key={d} className="py-5 text-center text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                            {d}
                                        </div>
                                    ))}
                                </div>

                                {/* Calendar Cells */}
                                <div className="grid grid-cols-7">
                                    {cells.map((d, idx) => {
                                        const key = d ? toKey(d) : null
                                        const dayInterviews = key ? (interviewMap[key] || []) : []
                                        const isSelected = key === selectedDay

                                        return (
                                            <motion.div
                                                key={idx}
                                                onClick={() => openDay(d)}
                                                whileHover={d ? { backgroundColor: 'rgba(0,0,0,0.02)' } : {}}
                                                className={`min-h-[120px] p-4 border-b border-r border-slate-50 cursor-pointer transition-all relative
                                                    ${!d ? 'bg-slate-50/20' : 'bg-white'}
                                                    ${isSelected ? 'bg-blue-50/50 ring-2 ring-inset ring-blue-600/20' : ''}
                                                `}
                                            >
                                                {d && (
                                                    <>
                                                        <span className={`inline-flex w-8 h-8 items-center justify-center rounded-xl text-sm font-black mb-2
                                                            ${isToday(d) ? 'bg-black text-white shadow-lg' : 'text-black'}
                                                        `}>
                                                            {d}
                                                        </span>
                                                        <div className="space-y-1.5">
                                                            {dayInterviews.slice(0, 2).map((iv, i) => (
                                                                <div key={i} className="w-full px-2 py-1.5 bg-slate-50 border border-slate-100 rounded-lg text-[9px] font-bold text-black truncate shadow-sm">
                                                                    <span className="text-blue-600">{formatTime(iv.interviewTime)}</span> {iv.user?.firstName}
                                                                </div>
                                                            ))}
                                                            {dayInterviews.length > 2 && (
                                                                <div className="text-[9px] text-slate-400 font-black text-center mt-2 uppercase">
                                                                    +{dayInterviews.length - 2} More
                                                                </div>
                                                            )}
                                                        </div>
                                                    </>
                                                )}
                                            </motion.div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>

                        {/* Right Panel */}
                        <div className="space-y-8">
                            <div className="flex items-center justify-between mb-4 px-2">
                                <h3 className="font-black text-black text-xs uppercase tracking-[0.2em]">
                                    {selectedDay ? `Interviews on ${selectedDay}` : 'Upcoming Sessions'}
                                </h3>
                                {selectedDay && (
                                    <button onClick={() => setSelectedDay(null)} className="text-slate-400 hover:text-black transition-colors">
                                        <X size={18} />
                                    </button>
                                )}
                            </div>

                            <div className="space-y-4 max-h-[700px] overflow-y-auto pr-2 custom-scrollbar">
                                {(selectedDay ? selectedDayInterviews : interviews.slice(0, 10)).map((iv, i) => (
                                    <InterviewCard key={i} iv={iv} index={i} />
                                ))}

                                {((selectedDay ? selectedDayInterviews : interviews).length === 0) && (
                                    <div className="bg-slate-50 border border-dashed border-slate-200 rounded-[2rem] p-12 text-center">
                                        <Calendar className="mx-auto text-slate-200 mb-6" size={48} />
                                        <p className="text-black font-black uppercase text-xs tracking-widest opacity-30">No interviews scheduled</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </RecruiterLayout>
    )
}

export default RecruiterCalendar
