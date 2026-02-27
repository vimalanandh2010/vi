import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Briefcase, Building2, BookOpen, Users, MessageCircle, User, LogOut, Menu, X, Plus, Home, LayoutDashboard, AtSign } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo.jpeg'

const Navbar = () => {
    const { user, logout } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const [showProfileMenu, setShowProfileMenu] = useState(false)
    const [showMobileMenu, setShowMobileMenu] = useState(false)


    const handleLogout = () => {
        logout()
        setShowProfileMenu(false)
    }

    const seekerLinks = [
        { name: 'Jobs', path: '/seeker/jobs', icon: Briefcase },
        { name: 'Non-IT', path: '/seeker/non-it-jobs', icon: Building2 },
        { name: 'Companies', path: '/seeker/companies', icon: Users },
        { name: 'Courses', path: '/seeker/courses', icon: BookOpen },
        { name: 'Communities', path: '/seeker/community', icon: Users },
        { name: 'Chat', path: '/seeker/chat', icon: MessageCircle },
    ]

    const recruiterLinks = [
        { name: 'Home', path: '/recruiter/home', icon: Home },
        { name: 'Jobs', path: '/recruiter/jobs', icon: Briefcase },
        { name: 'Candidates', path: '/recruiter/candidates', icon: Users },
        { name: 'Communities', path: '/recruiter/community', icon: Users },
        { name: 'Chat', path: '/recruiter/chat', icon: MessageCircle },
    ]

    const navLinks = user?.role === 'employer' ? recruiterLinks : seekerLinks

    // Validate path uniqueness and log warnings for duplicates
    const paths = navLinks.map(link => link.path)
    const uniquePaths = new Set(paths)
    if (uniquePaths.size !== paths.length) {
        const duplicates = paths.filter((path, index) => paths.indexOf(path) !== index)
        console.warn(`Duplicate route paths detected in Navbar navigation links: ${duplicates.join(', ')}. This may cause React key warnings and rendering issues.`)
    }

    return (
        <nav className="bg-slate-800/60 backdrop-blur-xl border-b border-slate-700/50 sticky top-0 z-50">
            <div className="max-w-[100vw] px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
                <div className="flex items-center gap-2 sm:gap-4 h-16 sm:h-20">
                    {/* Left: Logo & Branding */}
                    <Link to={user?.role === 'employer' ? "/recruiter/home" : "/seeker/home"} className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
                        <img src={logo} alt="Logo" className="h-8 w-8 sm:h-10 sm:w-10 rounded-lg object-cover shadow-lg border border-slate-700/50" />
                        <span className="text-white font-bold text-lg sm:text-xl lg:text-2xl tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent truncate max-w-[120px] sm:max-w-none">
                            Future Milestone
                        </span>
                    </Link>

                    {/* Middle: Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-0.5 lg:gap-2 xl:gap-4 ml-4 lg:ml-8">
                        {navLinks.map((link) => {
                            const Icon = link.icon
                            return (
                                <Link
                                    key={`${link.path}-${link.name}`}
                                    to={link.path}
                                    className="flex items-center gap-1.5 lg:gap-2 px-2 lg:px-3 py-2 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg transition-all group whitespace-nowrap"
                                >
                                    <Icon size={16} className={`lg:size-[18px] group-hover:scale-110 transition-transform ${user?.role === 'employer' ? 'text-purple-400' : 'text-blue-400'}`} />
                                    <span className="text-xs lg:text-sm font-medium">{link.name}</span>
                                </Link>
                            )
                        })}
                    </div>



                    {/* Dashboard Shortcut (Logged In Only) */}
                    {user && (
                        <Link
                            to={user.role === 'employer' ? "/recruiter/dashboard" : "/seeker/dashboard"}
                            className="hidden xl:flex items-center gap-2 px-4 py-2 bg-slate-700/30 hover:bg-slate-700/50 border border-slate-700/50 text-white rounded-lg transition-all group ml-2"
                        >
                            <LayoutDashboard size={18} className={`group-hover:rotate-12 transition-transform ${user.role === 'employer' ? 'text-purple-400' : 'text-blue-400'}`} />
                            <span className="text-sm font-semibold tracking-tight">Dashboard</span>
                        </Link>
                    )}

                    {/* Right: User Profile & Mobile Toggle */}
                    <div className="flex items-center gap-2 sm:gap-4 ml-auto">
                        {/* Profile Section */}
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                    className="flex items-center gap-2 bg-slate-700/30 hover:bg-slate-700/50 border border-slate-700/50 text-white rounded-xl px-1.5 sm:px-2 py-1.5 transition-all group"
                                >
                                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-xs sm:text-sm font-bold shadow-lg group-hover:scale-105 transition-transform">
                                        {user.firstName?.charAt(0) || 'U'}
                                    </div>
                                    <div className="hidden xs:flex sm:flex flex-col items-start pr-1 sm:pr-2">
                                        <span className="text-[10px] text-slate-400 leading-tight">Welcome,</span>
                                        <span className="text-xs sm:text-sm font-semibold text-white leading-tight truncate max-w-[60px] sm:max-w-[100px]">
                                            {user.firstName || 'User'}
                                        </span>
                                    </div>
                                </button>

                                {/* Profile Dropdown */}
                                {showProfileMenu && (
                                    <div className="absolute right-0 mt-2 w-56 bg-slate-800 border border-slate-700 rounded-xl shadow-2xl overflow-hidden py-1 backdrop-blur-xl bg-slate-800/90">
                                        <div className="px-4 py-3 border-b border-slate-700/50">
                                            <p className="text-xs text-slate-400">Signed in as</p>
                                            <p className="text-sm font-medium text-white truncate">{user.email}</p>
                                        </div>
                                        <Link
                                            to={user.role === 'employer' ? "/recruiter/home" : "/seeker/home"}
                                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-700 transition-colors text-slate-300 hover:text-white"
                                            onClick={() => setShowProfileMenu(false)}
                                        >
                                            <Home size={18} className={user.role === 'employer' ? "text-purple-400" : "text-blue-400"} />
                                            <span className="text-sm">My Home</span>
                                        </Link>
                                        <Link
                                            to={user.role === 'employer' ? "/recruiter/profile" : "/seeker/profile"}
                                            className="flex items-center gap-3 px-4 py-2.5 hover:bg-slate-700 transition-colors text-slate-300 hover:text-white"
                                            onClick={() => setShowProfileMenu(false)}
                                        >
                                            <User size={18} className={user.role === 'employer' ? "text-purple-400" : "text-indigo-400"} />
                                            <span className="text-sm">Account Settings</span>
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-red-500/10 transition-colors text-slate-300 hover:text-red-400"
                                        >
                                            <LogOut size={18} />
                                            <span className="text-sm">Log out</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                to={location.pathname.startsWith('/recruiter') ? "/recruiter/login" : "/seeker/login"}
                                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-sm font-medium transition-all"
                            >
                                Login
                            </Link>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            className="md:hidden text-white p-2 hover:bg-slate-700/50 rounded-lg transition-all"
                        >
                            {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {showMobileMenu && (
                    <div className="md:hidden py-4 space-y-3 border-t border-slate-700/50">


                        {/* Mobile Links */}
                        <div className="flex flex-col gap-1">
                            {navLinks.map((link) => {
                                const Icon = link.icon
                                return (
                                    <Link
                                        key={`${link.path}-${link.name}`}
                                        to={link.path}
                                        className="flex items-center gap-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg px-3 py-2.5 transition-all"
                                        onClick={() => setShowMobileMenu(false)}
                                    >
                                        <Icon size={20} className={user?.role === 'employer' ? "text-purple-400" : "text-blue-400"} />
                                        <span className="text-sm font-medium">{link.name}</span>
                                    </Link>
                                )
                            })}
                        </div>

                        {/* Mobile Profile Section */}
                        {user && (
                            <div className="pt-4 border-t border-slate-700/50 space-y-1">
                                <Link
                                    to={user.role === 'employer' ? "/recruiter/home" : "/seeker/home"}
                                    className="flex items-center gap-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg px-3 py-2.5 transition-all"
                                    onClick={() => setShowMobileMenu(false)}
                                >
                                    <Home size={20} className={user.role === 'employer' ? "text-purple-400" : "text-blue-400"} />
                                    <span className="text-sm font-medium">My Home</span>
                                </Link>
                                <Link
                                    to={user.role === 'employer' ? "/recruiter/profile" : "/seeker/profile"}
                                    className="flex items-center gap-3 text-slate-300 hover:text-white hover:bg-slate-700/50 rounded-lg px-3 py-2.5 transition-all"
                                    onClick={() => setShowMobileMenu(false)}
                                >
                                    <User size={20} className={user.role === 'employer' ? "text-purple-400" : "text-indigo-400"} />
                                    <span className="text-sm font-medium">Account Settings</span>
                                </Link>
                                <button
                                    onClick={() => {
                                        handleLogout()
                                        setShowMobileMenu(false)
                                    }}
                                    className="w-full flex items-center gap-3 text-slate-300 hover:text-red-400 hover:bg-red-500/10 rounded-lg px-3 py-2.5 transition-all"
                                >
                                    <LogOut size={20} />
                                    <span className="text-sm font-medium">Log out</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </nav>
    )
}

export default Navbar
