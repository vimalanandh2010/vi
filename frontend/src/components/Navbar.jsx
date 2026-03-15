import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Briefcase, Building2, BookOpen, Users, MessageCircle, User, LogOut, Menu, X, Plus, Home, LayoutDashboard, AtSign } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import logo from '../assets/logo.jpeg'

const Navbar = ({ onSidebarToggle, showSidebarToggle = false }) => {
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
        { name: 'Home', path: '/seeker/home', icon: Home },
        { name: 'Jobs', path: '/seeker/jobs', icon: Briefcase },
        { name: 'Companies', path: '/seeker/companies', icon: Users },
        { name: 'Message', path: '/seeker/chat', icon: MessageCircle },
    ]

    const recruiterLinks = []

    const navLinks = user?.role === 'employer' ? recruiterLinks : seekerLinks

    // Validate path uniqueness and log warnings for duplicates
    const paths = navLinks.map(link => link.path)
    const uniquePaths = new Set(paths)
    if (uniquePaths.size !== paths.length) {
        const duplicates = paths.filter((path, index) => paths.indexOf(path) !== index)
        console.warn(`Duplicate route paths detected in Navbar navigation links: ${duplicates.join(', ')}. This may cause React key warnings and rendering issues.`)
    }

    return (
        <nav className="bg-white border-b border-slate-200 sticky top-0 z-50">
            <div className="max-w-[100vw] px-4 sm:px-6 md:px-8 lg:px-12 xl:px-16 2xl:px-20">
                <div className="flex items-center gap-3 sm:gap-6 h-20 sm:h-24">
                    {/* Left: Logo & Branding */}
                    <Link to={user?.role === 'employer' ? "/recruiter/home" : "/seeker/home"} className="flex items-center gap-3 sm:gap-4 flex-shrink-0">
                        <img src={logo} alt="Logo" className="h-16 w-16 sm:h-20 sm:w-20 rounded-xl object-cover shadow-lg border-2 border-slate-300/50 hover:scale-105 transition-transform" />
                    </Link>

                    {/* Middle: Desktop Navigation */}
                    <div className="hidden md:flex items-center gap-1 lg:gap-3 xl:gap-5 ml-6 lg:ml-10">
                        {navLinks.map((link) => {
                            const Icon = link.icon
                            return (
                                <Link
                                    key={`${link.path}-${link.name}`}
                                    to={link.path}
                                    className="flex items-center gap-2 lg:gap-3 px-3 lg:px-4 py-2.5 lg:py-3 text-slate-600 hover:text-white hover:bg-blue-950 rounded-xl transition-all group whitespace-nowrap"
                                >
                                    <Icon size={20} className={`lg:size-[22px] group-hover:scale-110 transition-transform text-slate-500 group-hover:text-white`} />
                                    <span className="text-base lg:text-lg font-bold">{link.name}</span>
                                </Link>
                            )
                        })}
                    </div>

                    {/* Right: User Profile & Mobile Toggle */}
                    <div className="flex items-center gap-2 sm:gap-4 ml-auto">
                        {/* Recruiter Sidebar Toggle (mobile only) */}
                        {showSidebarToggle && (
                            <button
                                onClick={onSidebarToggle}
                                className="lg:hidden text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-all"
                                aria-label="Toggle sidebar"
                            >
                                <Menu size={24} />
                            </button>
                        )}
                        {/* Profile Section */}
                        {user ? (
                            <div className="relative">
                                <button
                                    onClick={() => setShowProfileMenu(!showProfileMenu)}
                                    className="flex items-center gap-2.5 bg-slate-100 hover:bg-blue-950 border border-slate-200 hover:border-blue-900 text-slate-700 hover:text-white rounded-xl px-2 sm:px-3 py-2 transition-all group"
                                >
                                    <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-sm sm:text-base font-bold text-white shadow-lg group-hover:scale-105 transition-transform">
                                        {user.firstName?.charAt(0) || 'U'}
                                    </div>
                                    <div className="hidden xs:flex sm:flex flex-col items-start pr-1 sm:pr-2">
                                        <span className="text-xs text-slate-400 group-hover:text-blue-300 leading-tight transition-colors">Welcome,</span>
                                        <span className="text-sm sm:text-base font-semibold text-slate-900 group-hover:text-white leading-tight truncate max-w-[80px] sm:max-w-[120px] transition-colors">
                                            {user.firstName || 'User'}
                                        </span>
                                    </div>
                                </button>

                                {/* Profile Dropdown */}
                                {showProfileMenu && (
                                    <div className="absolute right-0 mt-2 w-64 bg-white border border-slate-200 rounded-xl shadow-2xl overflow-hidden py-2">
                                        <div className="px-5 py-4 border-b border-slate-100">
                                            <p className="text-sm text-slate-400 font-medium">Welcome,</p>
                                            <p className="text-base font-semibold text-slate-900 truncate">{user.firstName || user.email}</p>
                                        </div>
                                        <Link
                                            to={user.role === 'employer' ? "/recruiter/dashboard" : "/seeker/dashboard"}
                                            className="flex items-center gap-3 px-5 py-3 hover:bg-slate-100 transition-colors text-slate-700 hover:text-slate-900"
                                            onClick={() => setShowProfileMenu(false)}
                                        >
                                            <LayoutDashboard size={20} className="text-slate-400" />
                                            <span className="text-base font-medium">Go to Dashboard</span>
                                        </Link>
                                        <Link
                                            to={user.role === 'employer' ? "/recruiter/profile" : "/seeker/profile"}
                                            className="flex items-center gap-3 px-5 py-3 hover:bg-slate-100 transition-colors text-slate-700 hover:text-slate-900"
                                            onClick={() => setShowProfileMenu(false)}
                                        >
                                            <User size={20} className="text-slate-400" />
                                            <span className="text-base font-medium">Account Settings</span>
                                        </Link>
                                        <button
                                            onClick={handleLogout}
                                            className="w-full flex items-center gap-3 px-5 py-3 hover:bg-red-50 transition-colors text-slate-500 hover:text-red-500"
                                        >
                                            <LogOut size={20} />
                                            <span className="text-base font-medium">Log out</span>
                                        </button>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <Link
                                to={location.pathname.startsWith('/recruiter') ? "/recruiter/login" : "/seeker/login"}
                                className="px-6 py-2.5 bg-black hover:bg-zinc-900 text-white rounded-xl text-base font-semibold transition-all hover:scale-105 active:scale-95"
                            >
                                Login
                            </Link>
                        )}

                        {/* Mobile Menu Button */}
                        <button
                            onClick={() => setShowMobileMenu(!showMobileMenu)}
                            className="md:hidden text-slate-600 p-2 hover:bg-slate-100 rounded-lg transition-all"
                        >
                            {showMobileMenu ? <X size={24} /> : <Menu size={24} />}
                        </button>
                    </div>
                </div>

                {/* Mobile Menu */}
                {showMobileMenu && (
                    <div className="md:hidden py-4 space-y-3 border-t border-slate-200">


                        {/* Mobile Links */}
                        <div className="flex flex-col gap-1">
                            {navLinks.map((link) => {
                                const Icon = link.icon
                                return (
                                    <Link
                                        key={`${link.path}-${link.name}`}
                                        to={link.path}
                                        className="flex items-center gap-3 text-slate-700 hover:text-white hover:bg-blue-950 rounded-lg px-3 py-2.5 transition-all group"
                                        onClick={() => setShowMobileMenu(false)}
                                    >
                                        <Icon size={20} className="text-slate-400 group-hover:text-white transition-colors" />
                                        <span className="text-sm font-bold">{link.name}</span>
                                    </Link>
                                )
                            })}
                        </div>

                        {/* Mobile Profile Section */}
                        {user && (
                            <div className="pt-4 border-t border-slate-100 space-y-1">
                                <Link
                                    to={user.role === 'employer' ? "/recruiter/dashboard" : "/seeker/dashboard"}
                                    className="flex items-center gap-3 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg px-3 py-2.5 transition-all"
                                    onClick={() => setShowMobileMenu(false)}
                                >
                                    <LayoutDashboard size={20} className="text-slate-400" />
                                    <span className="text-sm font-medium">Go to Dashboard</span>
                                </Link>
                                <Link
                                    to={user.role === 'employer' ? "/recruiter/profile" : "/seeker/profile"}
                                    className="flex items-center gap-3 text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg px-3 py-2.5 transition-all"
                                    onClick={() => setShowMobileMenu(false)}
                                >
                                    <User size={20} className="text-slate-400" />
                                    <span className="text-sm font-medium">Account Settings</span>
                                </Link>
                                <button
                                    onClick={() => {
                                        handleLogout()
                                        setShowMobileMenu(false)
                                    }}
                                    className="w-full flex items-center gap-3 text-slate-500 hover:text-red-500 hover:bg-red-50 rounded-lg px-3 py-2.5 transition-all"
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
