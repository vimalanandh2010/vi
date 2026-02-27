import React, { useState } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, Zap, Globe, ArrowRight, CheckCircle, BarChart, Shield, MessageSquare, Briefcase, LogOut } from 'lucide-react'
import logo from '../../assets/logo.jpeg'
import { useAuth } from '../../context/AuthContext'

const RecruiterLanding = () => {
    const { user, logout, loginWithGoogle, getRedirectPath } = useAuth()
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const user = await loginWithGoogle(tokenResponse.access_token, 'employer');
                navigate(getRedirectPath(user), { replace: true });
            } catch (err) {
                console.error("Google login failed", err);
            } finally {
                setIsLoading(false);
            }
        },
        onError: () => {
            setIsLoading(false);
        }
    });

    return (
        <div className="min-h-screen bg-slate-950 text-white selection:bg-blue-500/30 overflow-x-hidden">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
                <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src={logo} alt="Logo" className="h-10 w-10 rounded-xl" />
                        <span className="text-2xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent tracking-tight">
                            Future Milestone
                        </span>
                    </div>
                    <div className="flex items-center gap-8">
                        {user ? (
                            <div className="flex items-center gap-6">
                                <Link to="/recruiter/candidates" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Candidates</Link>
                                <Link to="/recruiter/community" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Community</Link>
                                <Link to="/recruiter/chat" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Chat</Link>
                                <Link to={user.role === 'employer' ? "/recruiter/landing" : "/seeker/dashboard"} className="px-6 py-2 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95">
                                    Dashboard
                                </Link>
                                <button
                                    onClick={() => navigate('/recruiter')}
                                    className="flex items-center gap-2 px-4 py-2 bg-red-600/10 hover:bg-red-600/20 text-red-500 rounded-xl font-bold transition-all border border-red-500/20 active:scale-95"
                                >
                                    <LogOut size={18} />
                                    <span className="hidden md:inline">Exit</span>
                                </button>
                            </div>
                        ) : (
                            <>
                                <Link to="/recruiter/login" className="text-slate-400 hover:text-white transition-colors font-medium">Login</Link>
                                <Link to="/recruiter/signup" className="px-6 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-lg shadow-blue-500/20">
                                    Get Started
                                </Link>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 px-4 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/20 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-purple-600/20 rounded-full blur-[120px]" />

                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold tracking-wider uppercase mb-8 inline-block">
                            For Innovative Employers
                        </span>
                        <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-[1.1] tracking-tight">
                            Hire the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">Top 1%</span> of <br />
                            Tech Talent.
                        </h1>
                        <p className="text-xl text-slate-400 max-w-3xl mx-auto mb-12 leading-relaxed">
                            Stop sifting through hundreds of unqualified resumes. Future Milestone uses AI to match your roles with vetted experts, saving you 40+ hours per hire.
                        </p>
                        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                            {user ? (
                                user.role === 'employer' ? (
                                    <Link to="/recruiter/home" className="px-12 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl text-lg font-bold transition-all hover:scale-[1.02] flex items-center gap-2 shadow-2xl shadow-blue-600/40 active:scale-95">
                                        Go to Home <ArrowRight size={20} />
                                    </Link>
                                ) : (
                                    <Link to="/seeker/dashboard" className="px-12 py-4 bg-indigo-600 hover:bg-indigo-500 rounded-2xl text-lg font-bold transition-all hover:scale-[1.02] flex items-center gap-2 shadow-2xl shadow-indigo-600/40 active:scale-95">
                                        Go to Seeker Dashboard <ArrowRight size={20} />
                                    </Link>
                                )
                            ) : (
                                <>
                                    <Link to="/recruiter/signup" className="px-10 py-4 bg-blue-600 hover:bg-blue-500 rounded-2xl text-lg font-bold transition-all hover:scale-[1.02] flex items-center gap-2 shadow-2xl shadow-blue-600/40 active:scale-95">
                                        Start Hiring Now <ArrowRight size={20} />
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setIsLoading(true);
                                            googleLogin();
                                        }}
                                        disabled={isLoading}
                                        className="px-10 py-4 bg-white text-slate-900 rounded-2xl text-lg font-bold transition-all hover:bg-slate-50 flex items-center gap-3 shadow-lg active:scale-95"
                                    >
                                        <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                                        <span>Continue with Google</span>
                                    </button>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div>

            {/* Features Grid */}
            <div className="py-24 bg-slate-800/20">
                <div className="max-w-[1400px] mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4">Why Recruiters Love Us</h2>
                        <p className="text-slate-400">Direct access to a pool of pre-vetted, high-quality candidates.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                        {[
                            { icon: <Zap className="text-yellow-400" />, title: "3x Faster Hiring", desc: "Our AI shortlist identifies the best candidates instantly." },
                            { icon: <Users className="text-blue-400" />, title: "Vetted Candidates", desc: "Every profile is verified for skills and experience." },
                            { icon: <Globe className="text-purple-400" />, title: "Global Pipeline", desc: "Connect with talent across 50+ countries seamlessly." },
                            { icon: <BarChart className="text-green-400" />, title: "Advanced Analytics", desc: "Track application trends and hiring efficiency." },
                            { icon: <Shield className="text-red-400" />, title: "Secure & Compliant", desc: "Enterprise-grade security for your data." },
                            { icon: <CheckCircle className="text-cyan-400" />, title: "Quality Guarantee", desc: "Only see resumes that match your criteria." }
                        ].map((feature, idx) => (
                            <motion.div
                                key={idx}
                                whileHover={{ y: -5 }}
                                className="p-8 bg-slate-800/40 border border-slate-700 rounded-3xl backdrop-blur-sm shadow-xl"
                            >
                                <div className="w-12 h-12 bg-slate-900 rounded-2xl flex items-center justify-center mb-6 border border-slate-700">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3">{feature.title}</h3>
                                <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            <div className="py-24 border-y border-slate-800">
                <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    <div>
                        <div className="text-4xl font-bold text-blue-400 mb-2">50k+</div>
                        <div className="text-slate-500 uppercase tracking-widest text-xs font-bold font-sans">Active Seekers</div>
                    </div>
                    <div>
                        <div className="text-4xl font-bold text-blue-400 mb-2">2.5k+</div>
                        <div className="text-slate-500 uppercase tracking-widest text-xs font-bold">Top Companies</div>
                    </div>
                    <div>
                        <div className="text-4xl font-bold text-blue-400 mb-2">12 Days</div>
                        <div className="text-slate-500 uppercase tracking-widest text-xs font-bold">Avg. Time to Hire</div>
                    </div>
                    <div>
                        <div className="text-4xl font-bold text-blue-400 mb-2">98%</div>
                        <div className="text-slate-500 uppercase tracking-widest text-xs font-bold">Client Satisfaction</div>
                    </div>
                </div>
            </div>

            {/* CTA Footer */}
            <div className="py-24 text-center bg-gradient-to-b from-slate-900 to-blue-900/20">
                <div className="max-w-3xl mx-auto px-4">
                    <h2 className="text-4xl font-bold mb-6">Ready to scale your team?</h2>
                    <p className="text-slate-400 mb-10">Join thousands of companies building the future with our platform.</p>
                    <Link to="/recruiter/signup" className="px-12 py-5 bg-white text-slate-900 rounded-2xl text-xl font-bold hover:bg-slate-100 transition-all inline-block shadow-2xl">
                        Create Your Recruiter Account
                    </Link>
                </div>
            </div>

            <footer className="py-10 border-t border-slate-800 text-center text-slate-500 text-sm">
                &copy; {new Date().getFullYear()} Future Milestone. All rights reserved.
            </footer>
        </div>
    )
}

export default RecruiterLanding
