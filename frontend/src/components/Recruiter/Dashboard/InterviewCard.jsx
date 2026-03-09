import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Clock, Video, User, Mail, Trash2 } from 'lucide-react';
import { Link } from 'react-router-dom';
import axiosClient from '../../../api/axiosClient';
import { toast } from 'react-toastify';

const InterviewCard = ({ iv, index, onDelete }) => {
    const [deleting, setDeleting] = useState(false);
    const formatTime = (t) => {
        if (!t) return '';
        const [hh, mm] = t.split(':');
        const h = parseInt(hh, 10);
        return `${h > 12 ? h - 12 : h === 0 ? 12 : h}:${mm} ${h >= 12 ? 'PM' : 'AM'}`;
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to cancel this interview?')) return;
        
        setDeleting(true);
        try {
            await axiosClient.delete(`employer/interviews/${iv._id}`);
            toast.success('Interview cancelled successfully');
            if (onDelete) onDelete(iv._id);
        } catch (err) {
            console.error('Delete interview error:', err);
            toast.error('Failed to cancel interview');
        } finally {
            setDeleting(false);
        }
    };

    return (
        <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.05 }}
            className="p-8 rounded-[2.5rem] bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:shadow-black/5 transition-all group relative overflow-hidden active:scale-[0.99]"
        >
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div className="flex items-center gap-5">
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-black text-xl shadow-inner group-hover:bg-black group-hover:text-white transition-all overflow-hidden shrink-0">
                        {iv.user?.photoUrl ? (
                            <img src={iv.user.photoUrl} alt="" className="w-full h-full object-cover" />
                        ) : (
                            iv.user?.firstName?.[0] || '?'
                        )}
                    </div>
                    <div>
                        <h4 className="font-black text-black text-xl tracking-tight leading-none mb-2 group-hover:text-blue-600 transition-colors">
                            {iv.user?.firstName} {iv.user?.lastName}
                        </h4>
                        <div className="flex items-center gap-3">
                            <span className="px-2.5 py-1 bg-slate-50 border border-slate-100 rounded-lg text-[10px] font-black text-black uppercase tracking-widest shadow-sm">
                                {iv.user?.experienceLevel || 'Fresher'}
                            </span>
                            {iv.aiMatchScore != null && iv.aiMatchScore !== -1 && (
                                <span className={`px-2.5 py-1 border rounded-lg text-[10px] font-black uppercase tracking-widest shadow-sm ${iv.aiMatchScore >= 80 ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                        iv.aiMatchScore >= 60 ? 'bg-blue-50 text-blue-600 border-blue-100' :
                                            'bg-orange-50 text-orange-600 border-orange-100'}`}>
                                    {iv.aiMatchScore}% ATS
                                </span>
                            )}
                        </div>
                    </div>
                </div>
                <button
                    onClick={handleDelete}
                    disabled={deleting}
                    className="p-3 rounded-xl bg-red-50 hover:bg-red-100 text-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    title="Cancel Interview"
                >
                    <Trash2 size={18} />
                </button>
            </div>

            <p className="text-slate-400 font-bold text-sm mb-6 uppercase tracking-tight flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
                {iv.job?.title}
            </p>

            <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100/50">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-blue-600 shadow-sm border border-slate-100 shrink-0">
                        <Calendar size={16} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Date</p>
                        <p className="text-xs text-black font-black truncate">{iv.interviewDate}</p>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-4 rounded-2xl bg-slate-50 border border-slate-100/50">
                    <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center text-purple-600 shadow-sm border border-slate-100 shrink-0">
                        <Clock size={16} />
                    </div>
                    <div className="min-w-0">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Time</p>
                        <p className="text-xs text-black font-black truncate">{formatTime(iv.interviewTime)}</p>
                    </div>
                </div>
            </div>

            {iv.interviewNotes && (
                <div className="mb-6 p-5 rounded-2xl bg-blue-50/30 border border-blue-100/50 group-hover:bg-blue-50/50 transition-colors relative">
                    <p className="text-blue-600/70 text-xs leading-relaxed italic font-bold">"{iv.interviewNotes}"</p>
                    <div className="absolute top-3 right-4 opacity-10">
                        <Mail size={12} className="text-blue-600" />
                    </div>
                </div>
            )}

            <div className="flex flex-col gap-4 pt-6 border-t border-slate-50">
                {(() => {
                    const interviewDateTime = new Date(`${iv.interviewDate}T${iv.interviewTime}`);
                    const now = new Date();
                    const earlyBuffer = 15 * 60 * 1000;
                    const isReady = now.getTime() >= (interviewDateTime.getTime() - earlyBuffer);

                    return isReady ? (
                        <Link
                            to={`/interview/${iv._id}`}
                            className="w-full flex items-center justify-center gap-3 py-4 bg-black hover:bg-blue-600 text-white rounded-2xl shadow-xl shadow-black/10 hover:shadow-blue-600/20 active:scale-[0.98] transition-all font-black text-xs uppercase tracking-[0.2em]"
                        >
                            <Video size={18} /> Join Interview
                        </Link>
                    ) : (
                        <div
                            className="w-full flex items-center justify-center gap-3 py-4 bg-slate-50 text-slate-400 rounded-2xl font-black text-xs uppercase tracking-[0.2em] border border-slate-100"
                        >
                            <Clock size={18} /> Upcoming
                        </div>
                    );
                })()}

                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                            {iv.status}
                        </span>
                    </div>
                    <div className="flex items-center gap-1 text-[10px] font-bold text-slate-300 group-hover:text-slate-500 transition-colors">
                        <Mail size={10} />
                        <span className="truncate max-w-[120px]">{iv.user?.email}</span>
                    </div>
                </div>
            </div>
        </motion.div>
    );
};

export default InterviewCard;
