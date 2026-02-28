import React from 'react';
import { Link } from 'react-router-dom';
import { MessageSquare, Globe, BookOpen, User, Briefcase, Calendar } from 'lucide-react';

import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const QuickActions = ({ company }) => {
    const navigate = useNavigate();

    const isVerified = company?.verificationStatus === 'verified';

    const handleNavigation = (path, label) => {
        if ((label === 'Courses' || label === 'Jobs') && !company) {
            toast.error(`Please complete your company profile to access ${label}.`);
            return;
        }
        navigate(path);
    };

    const actions = [
        { label: 'Chat', icon: MessageSquare, path: '/recruiter/chat' },
        { label: 'Calendar', icon: Calendar, path: '/recruiter/calendar' },
        { label: 'Community', icon: Globe, path: '/recruiter/community' },
        { label: 'Company', icon: Globe, path: '/recruiter/company-profile' },
        { label: 'Courses', icon: BookOpen, path: '/recruiter/my-courses' },
        { label: 'Profile', icon: User, path: '/recruiter/profile' },
        { label: 'Jobs', icon: Briefcase, path: '/recruiter/my-jobs' },
    ];

    return (
        <section className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 rounded-3xl p-6">
            <h3 className="text-lg font-bold mb-4 font-white">Quick Shortcuts</h3>
            <div className="grid grid-cols-2 gap-3">
                {actions.map((item, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleNavigation(item.path, item.label)}
                        className="flex flex-col items-center gap-2 p-4 bg-slate-900/50 rounded-2xl border border-slate-700/50 hover:border-blue-500/50 group transition-all text-left w-full"
                    >
                        <item.icon className="text-slate-500 group-hover:text-blue-400 transition-colors" size={20} />
                        <span className="text-xs text-slate-400 group-hover:text-white transition-colors">{item.label}</span>
                    </button>
                ))}
            </div>
        </section>
    );
};

export default QuickActions;
