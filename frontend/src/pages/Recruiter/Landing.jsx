import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Users, Zap, Globe, ArrowRight, CheckCircle, BarChart, Shield, MessageSquare, Briefcase, LogOut } from 'lucide-react'
import logo from '../../assets/logo.jpeg'
import { useAuth } from '../../context/AuthContext'

const RecruiterLanding = () => {
    const { user, logout, loginWithGoogle, getRedirectPath } = useAuth()
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)

    // Unused Google login logic removed



    return (
        <div className="min-h-screen bg-portal-bg text-slate-900 selection:bg-blue-500/30 overflow-x-hidden">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 bg-white/60 backdrop-blur-md border-b border-slate-200">
                <div className="max-w-[1400px] mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <img src={logo} alt="Logo" className="h-10 w-10 rounded-xl" />
                        <span className="text-2xl font-bold text-slate-900 tracking-tight">
                            Future Milestone
                        </span>
                    </div>
                    <div className="flex items-center gap-8">
                        {user && (
                            <div className="flex items-center gap-6">
                                <Link to="/recruiter/candidates" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Candidates</Link>
                                <Link to="/recruiter/chat" className="text-slate-400 hover:text-white transition-colors text-sm font-medium">Chat</Link>
                                <Link to={user.role === 'employer' ? "/recruiter/landing" : "/seeker/dashboard"} className="px-6 py-2 bg-black hover:bg-zinc-900 text-white rounded-xl font-bold transition-all shadow-lg active:scale-95">
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
                        )}
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <div className="relative pt-32 pb-20 px-4 overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-slate-200 opacity-50 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-slate-200 opacity-50 rounded-full blur-[120px]" />

                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 30 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <span className="px-4 py-1.5 rounded-full bg-slate-100 border border-slate-200 text-slate-600 text-sm font-bold tracking-wider uppercase mb-8 inline-block">
                            For Innovative Employers
                        </span>
                        <h1 className="text-6xl md:text-8xl font-bold mb-8 leading-[1.1] tracking-tight text-slate-900">
                            Hire the <span className="text-black">Top 1%</span> of <br />
                            Tech Talent.
                        </h1>
                        <p className="text-xl text-slate-600 max-w-3xl mx-auto mb-12 leading-relaxed">
                            Stop sifting through hundreds of unqualified resumes. Future Milestone uses AI to match your roles with vetted experts, saving you 40+ hours per hire.
                        </p>
                        <div className="flex flex-col md:flex-row items-center justify-center gap-4">
                            {user ? (
                                user.role === 'employer' ? (
                                    <Link to="/recruiter/home" className="px-12 py-4 bg-black hover:bg-zinc-900 text-white rounded-2xl text-lg font-bold transition-all hover:-translate-y-1 flex items-center gap-2 shadow-lg active:scale-95">
                                        Go to Home <ArrowRight size={20} />
                                    </Link>
                                ) : (
                                    <Link to="/seeker/dashboard" className="px-12 py-4 bg-black hover:bg-zinc-900 text-white rounded-2xl text-lg font-bold transition-all hover:-translate-y-1 flex items-center gap-2 shadow-lg active:scale-95">
                                        Go to Seeker Dashboard <ArrowRight size={20} />
                                    </Link>
                                )
                            ) : (
                                <>
                                    <Link to="/recruiter/signup" className="px-12 py-4 bg-black hover:bg-zinc-900 text-white rounded-2xl text-lg font-bold transition-all hover:-translate-y-1 flex items-center gap-4 shadow-xl hover:shadow-2xl active:scale-95 border border-white/10">
                                        Start Hiring Now <ArrowRight size={20} />
                                    </Link>
                                </>
                            )}
                        </div>
                    </motion.div>
                </div>
            </div >

            {/* Features Grid */}
            < div className="py-24 bg-transparent" >
                <div className="max-w-[1400px] mx-auto px-6">
                    <div className="text-center mb-16">
                        <h2 className="text-4xl font-bold mb-4 text-slate-900">Why Recruiters Love Us</h2>
                        <p className="text-slate-600">Direct access to a pool of pre-vetted, high-quality candidates.</p>
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
                                className="p-8 bg-white border border-slate-200 rounded-3xl shadow-lg hover:-translate-y-1 transition-all"
                            >
                                <div className="w-12 h-12 bg-slate-100 rounded-2xl flex items-center justify-center mb-6 text-slate-800">
                                    {feature.icon}
                                </div>
                                <h3 className="text-xl font-bold mb-3 text-slate-900">{feature.title}</h3>
                                <p className="text-slate-600 leading-relaxed">{feature.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div >

            {/* Stats Section */}
            < div className="py-24 border-y border-slate-800" >
                <div className="max-w-[1400px] mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                    <div>
                        <div className="text-4xl font-bold text-black mb-2">50k+</div>
                        <div className="text-slate-500 uppercase tracking-widest text-xs font-bold font-sans">Active Seekers</div>
                    </div>
                    <div>
                        <div className="text-4xl font-bold text-black mb-2">2.5k+</div>
                        <div className="text-slate-500 uppercase tracking-widest text-xs font-bold">Top Companies</div>
                    </div>
                    <div>
                        <div className="text-4xl font-bold text-black mb-2">12 Days</div>
                        <div className="text-slate-500 uppercase tracking-widest text-xs font-bold">Avg. Time to Hire</div>
                    </div>
                    <div>
                        <div className="text-4xl font-bold text-black mb-2">98%</div>
                        <div className="text-slate-500 uppercase tracking-widest text-xs font-bold">Client Satisfaction</div>
                    </div>
                </div>
            </div >

            {/* CTA Footer */}
            <section className="py-24 px-6 relative overflow-hidden">
                <div className="max-w-5xl mx-auto rounded-[40px] bg-black p-12 md:p-20 text-center relative shadow-2xl border border-white/10">
                    <div className="absolute inset-0 opacity-5" style={{ backgroundImage: "url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4xIj48cGF0aCBkPSJNMzYgMzRjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6bTAgNmMwLTIuMjEgMS43OS00IDQtNHM0IDEuNzkgNCA0LTEuNzkgNC00IDQtNC0xLjc5LTQtNHptNiAwYzAtMi4yMSAxLjc5LTQgNC00czQgMS43OSA0IDQtMS43OSA0LTQgNC00LTEuNzktNC00em0wLTZjMC0yLjIxIDEuNzktNCA0LTRzNCAxLjc5IDQgNC0xLjc5IDQtNCA0LTQtMS43OS00LTR6Ii8+PC9nPjwvZz48L3N2Zz4=')" }} />
                    
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">
                            Ready to scale your team?
                        </h2>
                        <p className="text-gray-400 text-lg mb-8 max-w-2xl mx-auto font-medium">
                            Join thousands of companies building the future with our AI-powered hiring platform.
                        </p>
                        
                        {/* Trust indicators */}
                        <div className="flex flex-wrap justify-center gap-6 mb-10 text-white/80">
                            <div className="flex items-center gap-2">
                                <Shield size={20} />
                                <span className="text-sm font-bold uppercase tracking-widest text-[10px]">GDPR Compliant</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Users size={20} />
                                <span className="text-sm font-bold uppercase tracking-widest text-[10px]">AI-Vetted Talent</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Zap size={20} />
                                <span className="text-sm font-bold uppercase tracking-widest text-[10px]">3x Faster Hiring</span>
                            </div>
                        </div>

                        <Link to="/recruiter/signup" className="inline-flex items-center gap-2 px-12 py-5 bg-white text-black rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-gray-100 transition-all shadow-2xl hover:shadow-3xl active:scale-95">
                            Create Your Recruiter Account <ArrowRight size={20} />
                        </Link>
                        
                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.3em] mt-8">
                            Join 2,500+ Top Companies Worldwide
                        </p>
                    </div>
                </div>
            </section>

            <footer className="py-10 border-t border-slate-800 text-center text-slate-500 text-sm">
                &copy; {new Date().getFullYear()} Future Milestone. All rights reserved.
            </footer>
        </div >
    )
}

export default RecruiterLanding
