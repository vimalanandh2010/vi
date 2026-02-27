import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Video, User, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';

const InterviewCard = ({ iv, index }) => {
    const formatTime = (t) => {
        if (!t) return '';
        const [hh, mm] = t.split(':');
        const h = parseInt(hh, 10);
        return `${h > 12 ? h - 12 : h === 0 ? 12 : h}:${mm} ${h >= 12 ? 'PM' : 'AM'}`;
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className={`p-5 rounded-[2rem] border relative overflow-hidden group transition-all hover:border-white/20 ${index % 2 === 0
                ? 'bg-gradient-to-br from-blue-600/5 to-transparent border-blue-600/10'
                : 'bg-gradient-to-br from-violet-600/5 to-transparent border-violet-600/10'
                }`}
        >
            {/* Decorative background element */}
            <div className={`absolute -right-4 -bottom-4 w-24 h-24 rounded-full blur-3xl opacity-10 group-hover:opacity-20 transition-opacity ${index % 2 === 0 ? 'bg-blue-500' : 'bg-violet-500'}`}></div>

            <div className="flex items-center gap-4 mb-4 relative z-10">
                <div className={`w-14 h-14 rounded-2xl p-0.5 bg-gradient-to-br shadow-xl transition-transform group-hover:scale-105 overflow-hidden ${index % 2 === 0 ? 'from-blue-500 to-indigo-600' : 'from-violet-500 to-fuchsia-600'}`}>
                    <div className="w-full h-full rounded-[0.9rem] bg-slate-900 flex items-center justify-center font-bold text-white text-lg overflow-hidden">
                        {iv.user?.photoUrl ? (
                            <img src={iv.user.photoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                            iv.user?.firstName?.[0] || '?'
                        )}
                    </div>
                </div>
                <div className="min-w-0">
                    <p className="text-white font-black text-base truncate tracking-tight">{iv.user?.firstName} {iv.user?.lastName}</p>
                    <div className="flex items-center gap-1.5 mt-0.5">
                        <span className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[9px] font-black text-slate-400 uppercase tracking-widest">{iv.user?.experienceLevel || 'Candidate'}</span>
                        {iv.aiMatchScore != null && iv.aiMatchScore !== -1 && (
                            <span className={`px-1.5 py-0.5 rounded-md border text-[9px] font-black uppercase tracking-widest ${iv.aiMatchScore >= 80 ? 'bg-green-500/10 text-green-400 border-green-500/20' : iv.aiMatchScore >= 60 ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' : 'bg-amber-500/10 text-amber-400 border-amber-500/20'}`}>
                                {iv.aiMatchScore}% ATS
                            </span>
                        )}
                        <span className="text-slate-500 text-xs truncate">• {iv.job?.title}</span>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-4 relative z-10">
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                        <Calendar size={14} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none mb-1">Date</p>
                        <p className="text-xs text-white font-bold truncate">{iv.interviewDate}</p>
                    </div>
                </div>
                <div className="flex items-center gap-2.5 p-3 rounded-xl bg-white/[0.03] border border-white/5">
                    <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center text-violet-400 shrink-0">
                        <Clock size={14} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[8px] font-black text-slate-500 uppercase tracking-[0.2em] leading-none mb-1">Time</p>
                        <p className="text-xs text-white font-bold truncate">{formatTime(iv.interviewTime)}</p>
                    </div>
                </div>
            </div>

            {iv.interviewNotes && (
                <div className="relative z-10 mb-4 p-3 rounded-xl bg-amber-500/5 border border-amber-500/10 group-hover:bg-amber-500/10 transition-colors">
                    <div className="flex items-start gap-2">
                        <span className="text-xs mt-0.5">📝</span>
                        <p className="text-amber-200/60 text-[11px] leading-relaxed italic font-medium">{iv.interviewNotes}</p>
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-3 pt-4 border-t border-white/5 relative z-10">
                {(() => {
                    const interviewDateTime = new Date(`${iv.interviewDate}T${iv.interviewTime}`);
                    const now = new Date();
                    const earlyBuffer = 15 * 60 * 1000;
                    const isReady = now.getTime() >= (interviewDateTime.getTime() - earlyBuffer);

                    return isReady ? (
                        <Link
                            to={`/interview/${iv._id}`}
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl shadow-lg shadow-blue-900/40 hover:scale-[1.02] active:scale-[0.98] transition-all font-black text-[10px] uppercase tracking-widest"
                        >
                            <Video size={14} /> Start Meet
                        </Link>
                    ) : (
                        <button
                            disabled
                            className="w-full flex items-center justify-center gap-2 py-2.5 bg-slate-800 text-slate-500 rounded-xl cursor-not-allowed font-black text-[10px] uppercase tracking-widest border border-slate-700"
                        >
                            <Clock size={14} /> Upcoming
                        </button>
                    );
                })()}

                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 border border-white/5">
                            <User size={8} />
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-[8px] font-bold border capitalize 
                            ${iv.status === 'interview' ? 'bg-purple-500/10 text-purple-400 border-purple-500/20' :
                                iv.status === 'scheduled' ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20' :
                                    'bg-blue-500/10 text-blue-400 border-blue-500/20'}`}>
                            {iv.status}
                        </span>
                    </div>
                    <div className="flex items-center gap-2">
                        <div className="w-4 h-4 rounded-full bg-slate-800 flex items-center justify-center text-slate-500 border border-white/5">
                            <Mail size={8} />
                        </div>
                        <span className="text-[10px] font-medium text-slate-500 truncate max-w-[100px]">{iv.user?.email}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default InterviewCard;
