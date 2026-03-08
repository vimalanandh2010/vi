import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { MessageSquare, Globe, User, Briefcase, Calendar, Settings } from 'lucide-react';
import { toast } from 'react-toastify';

const QuickActions = ({ company }) => {
    const navigate = useNavigate();

    const handleNavigation = (path, label) => {
        if (label === 'Jobs' && !company) {
            toast.error(`Please complete your company profile to access ${label}.`);
            return;
        }
        navigate(path);
    };

    const actions = [
        { label: 'Chat', icon: MessageSquare, path: '/recruiter/chat', color: 'text-blue-600', bg: 'bg-blue-50' },
        { label: 'Calendar', icon: Calendar, path: '/recruiter/calendar', color: 'text-purple-600', bg: 'bg-purple-50' },
        { label: 'Company', icon: Globe, path: '/recruiter/company-profile', color: 'text-emerald-600', bg: 'bg-emerald-50' },
        { label: 'Profile', icon: User, path: '/recruiter/profile', color: 'text-orange-600', bg: 'bg-orange-50' },
        { label: 'Jobs', icon: Briefcase, path: '/recruiter/my-jobs', color: 'text-pink-600', bg: 'bg-pink-50' },
        { label: 'Settings', icon: Settings, path: '/recruiter/settings', color: 'text-slate-600', bg: 'bg-slate-100' },
    ];

    return (
        <section className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm">
            <div className="mb-8">
                <h3 className="text-xl font-black text-black">Quick Shortcuts</h3>
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Instant Access</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
                {actions.map((item, idx) => (
                    <motion.button
                        key={idx}
                        whileHover={{ scale: 1.05, y: -2 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => handleNavigation(item.path, item.label)}
                        className="flex flex-col items-center gap-3 p-6 bg-slate-50 rounded-3xl border border-transparent hover:border-slate-100 hover:bg-white hover:shadow-xl transition-all duration-300 group"
                    >
                        <div className={`p-4 rounded-2xl ${item.bg} ${item.color} group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                            <item.icon size={20} strokeWidth={2.5} />
                        </div>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-tighter group-hover:text-black transition-colors">{item.label}</span>
                    </motion.button>
                ))}
            </div>
        </section>
    );
};

export default QuickActions;
