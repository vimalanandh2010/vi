import React from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import {
    LayoutDashboard,
    Users,
    Briefcase,
    Calendar,
    MessageSquare,
    Building2,
    Home,
    LogOut,
    X
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

const SidebarItem = ({ icon: Icon, label, path, active, badge, onClick, className = '' }) => (
    <Link
        to={path}
        onClick={onClick}
        className={`flex items-center justify-between gap-3 px-4 py-3 rounded-xl cursor-pointer transition-all ${active
            ? 'bg-black text-white shadow-lg shadow-black/10'
            : 'text-slate-500 hover:bg-slate-100 hover:text-black'
            } ${className}`}
    >
        <div className="flex items-center gap-3">
            <Icon size={20} />
            <span className="font-semibold text-sm">{label}</span>
        </div>
        {badge !== undefined && badge > 0 && (
            <span className="px-2 py-0.5 bg-blue-50 text-blue-600 border border-blue-100 rounded-full text-[10px] font-bold">
                {badge}
            </span>
        )}
    </Link>
);

const RecruiterSidebar = ({ jobCount = 0, onClose }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        logout('employer');
        navigate('/recruiter/login');
    };

    const isActive = (path) => location.pathname === path;

    const handleNavClick = () => {
        if (onClose) onClose();
    };

    return (
        <aside className="w-72 sm:w-80 bg-white border-r border-slate-100 p-6 sm:p-8 flex flex-col h-full shrink-0 shadow-[4px_0_24px_rgba(0,0,0,0.05)] overflow-y-auto custom-scrollbar">
            {/* Mobile Close Button */}
            <div className="flex items-center justify-between mb-6 lg:hidden">
                <span className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Menu</span>
                {onClose && (
                    <button
                        onClick={onClose}
                        className="p-2 rounded-xl text-slate-400 hover:bg-slate-100 hover:text-black transition-all"
                    >
                        <X size={20} />
                    </button>
                )}
            </div>

            <div className="space-y-1.5 flex-1">
                <div className="mb-6 px-2 hidden lg:block">
                    <span className="text-sm font-black text-slate-400 uppercase tracking-[0.2em]">Recruiter Menu</span>
                </div>

                <SidebarItem
                    icon={LayoutDashboard}
                    label="Dashboard"
                    path="/recruiter/dashboard"
                    active={isActive('/recruiter/dashboard')}
                    onClick={handleNavClick}
                />
                <SidebarItem
                    icon={Users}
                    label="Candidates"
                    path="/recruiter/candidates"
                    active={isActive('/recruiter/candidates')}
                    onClick={handleNavClick}
                />
                <SidebarItem
                    icon={Briefcase}
                    label="Job Postings"
                    path="/recruiter/jobs"
                    active={isActive('/recruiter/jobs')}
                    badge={jobCount}
                    onClick={handleNavClick}
                />
                <SidebarItem
                    icon={Calendar}
                    label="Interview Calendar"
                    path="/recruiter/calendar"
                    active={isActive('/recruiter/calendar')}
                    onClick={handleNavClick}
                />

                <div className="pt-6 mt-6 border-t border-slate-100 space-y-1.5">
                    <div className="mb-4 px-2">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Management</span>
                    </div>
                    <SidebarItem
                        icon={MessageSquare}
                        label="Messages"
                        path="/recruiter/chat"
                        active={isActive('/recruiter/chat')}
                        onClick={handleNavClick}
                    />
                    <SidebarItem
                        icon={Building2}
                        label="Company Profile"
                        path="/recruiter/company-profile"
                        active={isActive('/recruiter/company-profile')}
                        onClick={handleNavClick}
                    />
                </div>
            </div>

            <div className="space-y-1.5 mt-auto pt-6 border-t border-slate-100">
                <button
                    onClick={() => { navigate('/recruiter/home'); handleNavClick(); }}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-slate-100 hover:text-black transition-all"
                >
                    <Home size={20} />
                    <span className="font-semibold text-sm">Exit to Home</span>
                </button>
                <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-red-500 hover:bg-red-50 transition-all font-semibold text-sm"
                >
                    <LogOut size={20} />
                    <span>Logout</span>
                </button>

                <div className="mt-6 pt-6 border-t border-slate-100 flex items-center gap-3 px-2">
                    <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center font-bold text-white shadow-md shrink-0">
                        {user?.firstName?.charAt(0) || 'R'}
                    </div>
                    <div className="min-w-0">
                        <p className="text-sm font-bold text-black truncate">{user?.firstName || 'Recruiter'}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">Hiring Manager</p>
                    </div>
                </div>
            </div>
        </aside>
    );
};

export default RecruiterSidebar;
