import React from 'react';
import { Briefcase, Calendar, MapPin, ExternalLink, Globe } from 'lucide-react';

const ExperienceCard = ({ exp, theme = 'premium-dark' }) => {
    const isPremium = theme === 'premium-dark';
    return (
        <div className="relative pl-20 pb-20 last:pb-0 group">
            {/* Dynamic Timeline Line with Glow */}
            <div className={`absolute left-[29px] top-0 bottom-0 w-[2px] ${isPremium ? 'bg-gradient-to-b from-blue-600/50 via-indigo-600/20 to-transparent' : 'bg-slate-200'} group-last:hidden`} />

            {/* Sophisticated Timeline Node */}
            <div className="absolute left-0 top-1 w-[60px] h-[60px] z-10 flex items-center justify-center">
                <div className={`w-full h-full rounded-3xl ${isPremium ? 'bg-slate-900 border-white/10 shadow-[0_0_30px_rgba(37,99,235,0.2)]' : 'bg-white border-slate-200 shadow-xl'} border-2 flex items-center justify-center transform transition-all duration-700 group-hover:rotate-[360deg] group-hover:scale-110 group-hover:border-blue-500`}>
                    <div className="text-blue-500 font-black text-xs tracking-tighter">
                        {exp.company?.charAt(0) || '🏢'}
                    </div>
                </div>
                {/* Glow Pulse */}
                <div className="absolute inset-0 rounded-3xl bg-blue-500/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700 animate-pulse" />
            </div>

            <div className={`relative ${isPremium ? 'bg-gradient-to-br from-white/[0.04] to-transparent border-white/5 hover:bg-white/[0.06] hover:border-white/10 hover:shadow-[0_40px_80px_rgba(0,0,0,0.5)]' : 'bg-white shadow-xl border-slate-100 hover:shadow-2xl hover:border-blue-200'} border rounded-[3rem] p-10 transition-all duration-700 group-hover:-translate-y-2`}>
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-10">
                    <div className="flex gap-8 items-start">
                        <div className="space-y-3">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-600/10 text-blue-400 text-[10px] font-black tracking-widest uppercase rounded-lg">
                                FULL-TIME
                            </div>
                            <h4 className={`text-4xl font-black ${isPremium ? 'text-white' : 'text-slate-900'} tracking-tighter leading-none`}>
                                {exp.role || 'Principal Designer'}
                            </h4>
                            <div className="flex items-center gap-3">
                                <p className="text-blue-500 font-extrabold text-xl tracking-tight">{exp.company || 'Innovate AI'}</p>
                                <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                                <span className="text-slate-500 font-bold text-sm">San Francisco</span>
                            </div>
                        </div>
                    </div>
                    <div className={`flex flex-col items-end gap-3`}>
                        <div className={`flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] ${isPremium ? 'text-slate-400 bg-white/5 border-white/5' : 'text-slate-500 bg-slate-50 border-slate-200'} px-6 py-3 rounded-2xl border shadow-2xl`}>
                            <Calendar size={14} className="text-blue-500" />
                            <span>{exp.duration || '2022 - PRESENT'}</span>
                        </div>
                        <button className="p-3 bg-white/5 hover:bg-white/10 rounded-xl text-slate-500 hover:text-white transition-all">
                            <ExternalLink size={16} />
                        </button>
                    </div>
                </div>

                <div className={`relative p-8 ${isPremium ? 'bg-black/20 text-slate-400' : 'bg-slate-50 text-slate-500'} rounded-[1.75rem] border border-white/5`}>
                    <p className="text-sm leading-[1.8] font-medium">
                        {exp.description || "Spearheaded the design and architecture of mission-critical systems. Mentored a team of 12 engineers and improved system performance by 40% using advanced optimization techniques and modern stack implementations."}
                    </p>
                </div>

                {/* Tech Used In This Role */}
                <div className="mt-8 flex flex-wrap gap-2">
                    {['React', 'Rust', 'WebAssembly'].map((tech, i) => (
                        <span key={i} className={`px-4 py-1.5 ${isPremium ? 'bg-white/5 text-slate-500 border-white/5' : 'bg-white text-slate-400 border-slate-100'} border rounded-full text-[10px] font-black uppercase tracking-widest`}>
                            {tech}
                        </span>
                    ))}
                </div>
            </div>
        </div>
    );
};

const ExperienceTimeline = ({ experiences = [], theme = 'premium-dark' }) => {
    const displayExps = experiences;

    return (
        <div className="mt-6 space-y-4">
            {displayExps.map((exp, idx) => (
                <ExperienceCard key={idx} exp={exp} theme={theme} />
            ))}
        </div>
    );
};

export default ExperienceTimeline;
