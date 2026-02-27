import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Video, Loader2, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import axiosClient from '../../../api/axiosClient';
import InterviewCard from './InterviewCard';

const UpcomingInterviews = () => {
    const [interviews, setInterviews] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchInterviews = async () => {
            try {
                const res = await axiosClient.get('jobs/recruiter/interviews');
                // Sort by date and time
                const sortedInterviews = (res.interviews || []).sort((a, b) => {
                    const dateA = new Date(`${a.interviewDate}T${a.interviewTime}`);
                    const dateB = new Date(`${b.interviewDate}T${b.interviewTime}`);
                    return dateA - dateB;
                });

                // Show only future or today's interviews
                const now = new Date();
                const filteredInterviews = sortedInterviews.filter(iv => {
                    const ivDate = new Date(`${iv.interviewDate}T${iv.interviewTime}`);
                    // Keep if it's within the last hour or in the future
                    return ivDate.getTime() > (now.getTime() - 60 * 60 * 1000);
                });

                setInterviews(filteredInterviews.slice(0, 3)); // Show top 3 on dashboard
            } catch (err) {
                console.error('Failed to fetch dashboard interviews:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchInterviews();
    }, []);

    if (loading) {
        return (
            <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-[2.5rem] p-8 flex flex-col items-center justify-center min-h-[300px]">
                <Loader2 className="animate-spin text-blue-500 mb-4" size={32} />
                <p className="text-slate-400 font-medium">Loading interviews...</p>
            </div>
        );
    }

    return (
        <div className="bg-slate-800/40 backdrop-blur-sm border border-slate-700/50 rounded-[2.5rem] p-8">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-2xl font-black text-white flex items-center gap-3">
                        <Video className="text-blue-500" size={24} /> Upcoming Interviews
                    </h3>
                    <p className="text-slate-400 text-sm mt-1">Your schedule for the next few hours</p>
                </div>
                <Link
                    to="/recruiter/calendar"
                    className="flex items-center gap-2 text-blue-400 hover:text-blue-300 font-bold text-sm group transition-all"
                >
                    View Calendar <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </Link>
            </div>

            {interviews.length === 0 ? (
                <div className="bg-slate-900/50 border border-dashed border-slate-700 rounded-3xl p-10 text-center">
                    <Calendar className="mx-auto text-slate-700 mb-4" size={40} />
                    <p className="text-slate-500 font-medium">No upcoming interviews</p>
                    <p className="text-slate-600 text-xs mt-2">Any interviews you schedule will appear here.</p>
                </div>
            ) : (
                <div className="space-y-4">
                    {interviews.map((iv, i) => (
                        <InterviewCard key={iv._id || i} iv={iv} index={i} />
                    ))}
                </div>
            )}
        </div>
    );
};

export default UpcomingInterviews;
