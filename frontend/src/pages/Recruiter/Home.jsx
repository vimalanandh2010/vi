import React from 'react'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import axiosClient from '../../api/axiosClient'
import {
    Users,
    Briefcase,
    Zap,
    CheckCircle,
    ArrowRight,
    Layout,
    Star,
    ShieldCheck,
    MessageSquare,
    Globe,
    Search,
    MapPin
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import logo from '../../assets/logo.jpeg'

const RecruiterHome = () => {
    const { user } = useAuth()
    const navigate = useNavigate()
    const [searchSkills, setSearchSkills] = useState('')
    const [searchLocation, setSearchLocation] = useState('')

    const handleSearch = (e) => {
        e.preventDefault()
        const params = new URLSearchParams()
        if (searchSkills.trim()) params.append('skills', searchSkills.trim())
        if (searchLocation.trim()) params.append('location', searchLocation.trim())

        navigate(`/recruiter/candidates?${params.toString()}`)
    }

    useEffect(() => {
    }, [])

    const features = [
        {
            title: "Post a Job",
            description: "Reach thousands of top-tier professionals in minutes with our streamlined posting tools.",
            icon: Briefcase,
            color: "blue"
        },
        {
            title: "Find Candidates",
            description: "Access our vast database of pre-vetted talent and use AI-powered filters to find your match.",
            icon: Users,
            color: "purple"
        },
        {
            title: "Manage Applications",
            description: "Track candidate progress through custom pipelines with collaborative hiring tools.",
            icon: Layout,
            color: "indigo"
        },
        {
            title: "Company Profile",
            description: "Build an employer brand that attracts the best. Showcase your culture and values.",
            icon: Star,
            color: "yellow"
        }
    ]



    const testimonials = [
        {
            name: "Sarah Johnson",
            role: "HR Director at TechFlow",
            content: "Future Milestone transformed our hiring process. We found our lead designer within 48 hours!",
            avatar: "SJ"
        },
        {
            name: "David Chen",
            role: "Founder, Innovate AI",
            content: "The quality of candidates here is unmatched. The platform is intuitive and incredibly powerful.",
            avatar: "DC"
        }
    ]

    return (
        <div className="min-h-screen bg-[#F8FAFC] text-slate-900 selection:bg-blue-500/30 overflow-x-hidden" style={{ fontFamily: "'Inter', sans-serif" }}>

            {/* ── Custom Styles ── */}
            <style>{`
                @import url('https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700;800;900&family=Inter:wght@300;400;500;600;700&display=swap');
                .font-heading { font-family: 'Poppins', sans-serif; }
                .grid-texture {
                    background-image: linear-gradient(rgba(0,0,0,0.02) 1px, transparent 1px),
                                      linear-gradient(90deg, rgba(0,0,0,0.02) 1px, transparent 1px);
                    background-size: 20px 20px;
                }
            `}</style>

            {/* Hero Section */}
            <section className="relative pt-32 pb-24 px-6 overflow-hidden">
                {/* Subtle background blobs */}
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-400/10 rounded-full blur-[120px] pointer-events-none animate-pulse" />
                <div className="absolute bottom-[10%] right-[-5%] w-[30%] h-[30%] bg-purple-400/10 rounded-full blur-[100px] pointer-events-none" />

                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.8 }}
                    >
                        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-8 text-gray-900">
                            Hire the Best Talent <br />
                            Faster Than Ever
                        </h1>
                        <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto mb-12 leading-relaxed">
                            Stop chasing candidates. Start building teams. Future Milestone provides you with the precision tools to find, track, and hire the world's most ambitious talent.
                        </p>

                        {/* Dual Input Search Bar — Premium Light Glass */}
                        <motion.form
                            onSubmit={handleSearch}
                            initial={{ opacity: 0, scale: 0.98 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.6 }}
                            className="max-w-4xl mx-auto mb-16 bg-white border border-slate-200 rounded-[32px] p-2.5 flex flex-col md:flex-row items-center gap-2 shadow-[0_20px_50px_rgba(0,0,0,0.06)]"
                        >
                            <div className="flex-1 flex items-center px-6 py-3 w-full group">
                                <Search className="text-slate-400 group-focus-within:text-black transition-colors mr-4 shrink-0" size={22} />
                                <input
                                    type="text"
                                    placeholder="Skills, roles, or keywords"
                                    value={searchSkills}
                                    onChange={(e) => setSearchSkills(e.target.value)}
                                    className="bg-transparent border-none text-slate-900 focus:outline-none w-full placeholder:text-slate-400 text-lg font-medium"
                                />
                            </div>

                            <div className="hidden md:block w-px h-10 bg-slate-200"></div>
                            <div className="w-[90%] md:hidden h-px bg-slate-100 my-1"></div>

                            <div className="flex-1 flex items-center px-6 py-3 w-full group">
                                <MapPin className="text-slate-400 group-focus-within:text-black transition-colors mr-4 shrink-0" size={22} />
                                <input
                                    type="text"
                                    placeholder="City, state, or country"
                                    value={searchLocation}
                                    onChange={(e) => setSearchLocation(e.target.value)}
                                    className="bg-transparent border-none text-slate-900 focus:outline-none w-full placeholder:text-slate-400 text-lg font-medium"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full md:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all active:scale-95 flex items-center justify-center shrink-0 shadow-md"
                            >
                                Search Candidates
                            </button>
                        </motion.form>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-5">
                            {user ? (
                                user.role === 'employer' ? (
                                    <Link to="/recruiter/candidates" className="w-full sm:w-auto px-8 py-3 bg-white hover:bg-gray-50 text-gray-900 border-2 border-gray-200 rounded-xl font-semibold transition-all flex items-center justify-center gap-3 shadow-sm hover:shadow-md">
                                        View All Talent <ArrowRight size={20} />
                                    </Link>
                                ) : (
                                    <Link to="/seeker/dashboard" className="w-full sm:w-auto px-8 py-3 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl font-semibold transition-all flex items-center justify-center gap-3">
                                        Go to Seeker Dashboard <ArrowRight size={20} />
                                    </Link>
                                )
                            ) : (
                                <>
                                    <Link to="/recruiter/signup" className="w-full sm:w-auto px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-semibold transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center shadow-lg">
                                        Create Free Account
                                    </Link>
                                    <Link to="/recruiter/login" className="w-full sm:w-auto px-8 py-3 text-gray-600 hover:text-gray-900 rounded-xl font-semibold transition-colors flex items-center justify-center">
                                        Log In
                                    </Link>
                                </>
                            )}
                        </div>

                    </motion.div>
                </div>
            </section>

            {/* Core Features */}
            <section className="py-24 px-6 bg-white relative">
                <div className="absolute inset-0 grid-texture opacity-30 pointer-events-none" />
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-gray-900">Designed for Modern Teams</h2>
                        <p className="text-gray-600 max-w-2xl mx-auto text-base">Everything you need to scale your engineering, product, and design teams seamlessly.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((f, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                whileHover={{ y: -8 }}
                                className="p-10 rounded-[32px] bg-white border border-slate-100 shadow-[0_8px_30px_rgb(0,0,0,0.04)] hover:shadow-[0_20px_50px_rgb(0,0,0,0.08)] transition-all group cursor-default"
                            >
                                <div className={`w-16 h-16 rounded-2xl bg-${f.color}-50 flex items-center justify-center text-${f.color}-600 mb-8 group-hover:rotate-6 transition-transform`}>
                                    <f.icon size={30} />
                                </div>
                                <h3 className="text-lg font-bold mb-3 text-gray-900">{f.title}</h3>
                                <p className="text-gray-600 text-sm leading-relaxed">{f.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>



            {/* Testimonials — Clean & Modern */}
            <section className="py-24 px-6 bg-white overflow-hidden relative">
                <div className="max-w-4xl mx-auto relative">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Loved by TA Teams</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8">
                        {testimonials.map((t, i) => (
                            <div key={i} className="p-10 rounded-[40px] bg-slate-50 border border-slate-100 relative group">
                                <Star className="absolute top-10 right-10 text-slate-200 group-hover:text-yellow-400/20 transition-colors" size={40} />
                                <p className="text-gray-600 italic mb-8 text-base leading-relaxed relative z-10">"{t.content}"</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gray-900 flex items-center justify-center font-bold text-white shadow-lg text-base">
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-gray-900">{t.name}</h4>
                                        <p className="text-xs text-gray-500 font-semibold">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Final CTA — High Contrast Premium */}
            <section className="py-24 px-6 bg-[#F8FAFC]">
                <div className="max-w-6xl mx-auto rounded-[50px] bg-black p-12 md:p-24 text-center relative overflow-hidden shadow-2xl">
                    <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[100%] bg-blue-500/10 rounded-full blur-[100px]" />
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">Ready to scale your team?</h2>
                        <p className="text-gray-400 text-lg mb-10 max-w-2xl mx-auto">Join 500+ companies hiring from a pool of 50k+ vetted professionals worldwide.</p>
                        {user && user.role === 'employer' ? (
                            <Link to="/recruiter/candidates" className="inline-flex items-center gap-3 px-8 py-3.5 bg-white text-black rounded-xl font-semibold text-base hover:bg-gray-100 transition-all shadow-lg active:scale-95">
                                Explore Talent Hub <ArrowRight size={20} />
                            </Link>
                        ) : (
                            <Link to="/recruiter/signup" className="inline-flex items-center gap-3 px-8 py-3.5 bg-white text-black rounded-xl font-semibold text-base hover:bg-gray-100 transition-all shadow-lg active:scale-95">
                                Start Hiring Now <ArrowRight size={20} />
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            {/* Footer — Minimalist */}
            <footer className="py-16 px-6 bg-white border-t border-slate-100">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-10">
                    <div className="flex items-center gap-3">
                        <img src={logo} alt="Logo" className="h-10 w-10 rounded-xl" />
                        <span className="font-bold text-xl text-gray-900">Future Milestone</span>
                    </div>
                    <p className="text-gray-500 text-sm font-semibold">© {new Date().getFullYear()} Future Milestone. Built for scale.</p>
                    <div className="flex gap-8 text-gray-500 text-sm font-semibold">
                        <a href="#" className="hover:text-black transition-colors">Privacy</a>
                        <a href="#" className="hover:text-black transition-colors">Terms</a>
                        <a href="#" className="hover:text-black transition-colors">Support</a>
                    </div>
                </div>
            </footer>

        </div>
    )
}

export default RecruiterHome;
