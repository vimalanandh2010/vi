import React from 'react'
import { motion } from 'framer-motion'
import { Sparkles, ArrowRight, Zap, Target, FileSearch } from 'lucide-react'
import { Link } from 'react-router-dom'

const ResumeAnalyzerCard = () => {
    return (
        <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            className="relative group bg-slate-800/40 backdrop-blur-2xl rounded-[2.5rem] border border-white/10 p-1 overflow-hidden shadow-2xl shadow-blue-500/10"
        >
            {/* Animated Glow Cursor Follow (Simulated with group hover) */}
            <div className="absolute -inset-24 bg-gradient-to-br from-blue-600/20 to-indigo-600/20 blur-[100px] opacity-0 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

            <div className="relative p-8 sm:p-10">
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-10">
                    <div className="flex-1 space-y-8">
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white shadow-2xl shadow-blue-500/40 group-hover:scale-110 transition-transform duration-500">
                                <Sparkles size={28} className="animate-pulse" />
                            </div>
                            <div>
                                <h3 className="text-2xl font-black text-white tracking-tight group-hover:text-blue-400 transition-colors">Local ATS Intelligence</h3>
                                <p className="text-slate-400 text-sm font-medium mt-1">Deep privacy-first scan of your career documents.</p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {[
                                { icon: Zap, label: 'Instant Score', desc: 'Live analysis', color: 'text-blue-400', bg: 'bg-blue-500/10' },
                                { icon: Target, label: 'Skill Matrix', desc: 'Find missing gaps', color: 'text-indigo-400', bg: 'bg-indigo-500/10' },
                                { icon: FileSearch, label: 'Role Match', desc: 'Top 3 career paths', color: 'text-purple-400', bg: 'bg-purple-500/10' }
                            ].map((item, i) => (
                                <div key={i} className="flex items-center gap-4 bg-slate-900/50 backdrop-blur p-4 rounded-2xl border border-white/5 group-hover:border-white/10 transition-all">
                                    <div className={`w-10 h-10 rounded-xl ${item.bg} flex items-center justify-center ${item.color} border border-white/5`}>
                                        <item.icon size={18} />
                                    </div>
                                    <div>
                                        <p className="text-xs font-black text-white uppercase tracking-wider">{item.label}</p>
                                        <p className="text-[10px] text-slate-500 font-bold">{item.desc}</p>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <Link
                            to="/seeker/ats-analyzer"
                            className="inline-flex items-center gap-4 bg-white text-slate-950 px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] shadow-2xl shadow-white/10 hover:shadow-white/20 hover:-translate-y-1 transition-all active:scale-95 group/btn"
                        >
                            Start Scan
                            <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform duration-300" />
                        </Link>
                    </div>

                    <div className="shrink-0">
                        <div className="relative">
                            <motion.div
                                animate={{ y: [0, -10, 0], rotate: [-6, -4, -6] }}
                                transition={{ repeat: Infinity, duration: 6, ease: "easeInOut" }}
                                className="relative bg-slate-900/90 p-8 rounded-[3rem] border border-white/10 backdrop-blur-md shadow-2xl"
                            >
                                <div className="flex items-center gap-3 mb-6">
                                    <div className="w-2 h-2 rounded-full bg-red-500/50" />
                                    <div className="w-2 h-2 rounded-full bg-amber-500/50" />
                                    <div className="w-2 h-2 rounded-full bg-emerald-500/50" />
                                </div>
                                <div className="space-y-4">
                                    {[
                                        { w: "85%", c: "bg-blue-500", d: 0 },
                                        { w: "65%", c: "bg-indigo-500", d: 0.2 },
                                        { w: "90%", c: "bg-emerald-500", d: 0.4 }
                                    ].map((bar, i) => (
                                        <div key={i} className="h-2 w-48 bg-white/5 rounded-full overflow-hidden">
                                            <motion.div
                                                className={`h-full ${bar.c} shadow-[0_0_15px_rgba(255,255,255,0.1)]`}
                                                initial={{ width: 0 }}
                                                animate={{ width: bar.w }}
                                                transition={{ duration: 1.5, delay: bar.d, ease: "circOut" }}
                                            />
                                        </div>
                                    ))}
                                </div>
                                <div className="mt-8 flex flex-col items-center">
                                    <div className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-1">Match Potential</div>
                                    <div className="text-5xl font-black text-white tracking-tighter">85<span className="text-blue-500 font-medium">%</span></div>
                                </div>

                                {/* Animated Laser Line */}
                                <motion.div
                                    animate={{ top: ["10%", "90%", "10%"] }}
                                    transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
                                    className="absolute left-4 right-4 h-0.5 bg-gradient-to-r from-transparent via-blue-400 to-transparent blur-sm z-20 pointer-events-none"
                                />
                            </motion.div>

                            {/* Decorative Elements */}
                            <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-indigo-600/30 rounded-full blur-[40px] -z-10" />
                            <div className="absolute -top-10 -left-10 w-32 h-32 bg-blue-600/20 rounded-full blur-[60px] -z-10" />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

export default ResumeAnalyzerCard
