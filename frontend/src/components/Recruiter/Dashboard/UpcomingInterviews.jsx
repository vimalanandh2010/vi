import React from 'react';
import { motion } from 'framer-motion';
import { Calendar, Video, MapPin, Clock, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import useFetch from '../../../hooks/useFetch';
import recruiterApi from '../../../api/modules/recruiter.api';

const UpcomingInterviews = () => {
    const { data, loading } = useFetch(recruiterApi.getInterviews);
    const interviews = data?.interviews?.slice(0, 3) || [];

    const formatTime = (timeStr) => {
        if (!timeStr) return '';
        const [hh, mm] = timeStr.split(':');
        const h = parseInt(hh, 10);
        return `${h > 12 ? h - 12 : h === 0 ? 12 : h}:${mm} ${h >= 12 ? 'PM' : 'AM'}`;
    };

    if (loading) {
        return (
            <div className="bg-white border border-slate-100 rounded-[2.5rem] p-8 animate-pulse shadow-sm">
                <div className="h-6 w-48 bg-slate-100 rounded-lg mb-8" />
                <div className="space-y-4">
                    {[1, 2].map(i => (
                        <div key={i} className="h-24 bg-slate-50 rounded-3xl" />
                    ))}
                </div>
            </div>
        );
    }

    return (
        <section className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-black text-black">Upcoming Interviews</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Calendar Overview</p>
                </div>
                <Link
                    to="/recruiter/calendar"
                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-black hover:text-white text-slate-500 rounded-xl text-[10px] font-black uppercase transition-all duration-300"
                >
                    View Calendar <ChevronRight size={14} />
                </Link>
            </div>

            <div className="space-y-4">
                {interviews.length > 0 ? (
                    interviews.map((iv, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: idx * 0.1 }}
                            className="flex items-center gap-6 p-6 bg-slate-50 rounded-3xl border border-transparent hover:border-slate-100 hover:bg-white hover:shadow-lg transition-all duration-300 group"
                        >
                            <div className="flex flex-col items-center justify-center w-16 h-16 bg-white rounded-2xl border border-slate-100 shadow-sm group-hover:scale-110 transition-transform">
                                <span className="text-[10px] font-black text-slate-400 uppercase leading-none mb-1">
                                    {new Date(iv.interviewDate).toLocaleString('en-US', { month: 'short' })}
                                </span>
                                <span className="text-xl font-black text-black leading-none">
                                    {new Date(iv.interviewDate).getDate()}
                                </span>
                            </div>

                            <div className="flex-1 min-w-0">
                                <h4 className="text-lg font-black text-black truncate group-hover:text-blue-600 transition-colors">
                                    {iv.candidate?.name || 'Anonymous'}
                                </h4>
                                <p className="text-xs text-slate-500 font-bold mb-2 truncate uppercase tracking-tight">{iv.job?.title || 'Unknown Position'}</p>
                                <div className="flex flex-wrap gap-4 text-[10px] font-black text-slate-400 uppercase tracking-tight">
                                    <div className="flex items-center gap-1.5">
                                        <Clock size={12} className="text-slate-300" /> {formatTime(iv.interviewTime)}
                                    </div>
                                    <div className="flex items-center gap-1.5">
                                        {iv.meetingLink ? (
                                            <><Video size={12} className="text-blue-400" /> Virtual</>
                                        ) : (
                                            <><MapPin size={12} className="text-slate-300" /> In-Person</>
                                        )}
                                    </div>
                                </div>
                                {iv.meetingLink && (
                                    <a
                                        href={iv.meetingLink}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="mt-3 inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-wider hover:from-blue-700 hover:to-blue-600 transition-all shadow-md hover:shadow-lg active:scale-95"
                                    >
                                        <Video size={14} />
                                        Join Meeting
                                    </a>
                                )}
                            </div>

                            <div className="hidden sm:block">
                                <Link
                                    to={`/recruiter/job-applicants/${iv.job?.id}`}
                                    className="p-3 bg-white border border-slate-200 text-slate-400 hover:text-black hover:border-black rounded-xl transition-all shadow-sm"
                                >
                                    <ChevronRight size={18} />
                                </Link>
                            </div>
                        </motion.div>
                    ))
                ) : (
                    <div className="bg-slate-50 border border-dashed border-slate-200 rounded-3xl p-12 text-center">
                        <Calendar className="mx-auto text-slate-200 mb-4" size={40} />
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No Interviews Scheduled</p>
                    </div>
                )}
            </div>
        </section>
    );
};

export default UpcomingInterviews;
