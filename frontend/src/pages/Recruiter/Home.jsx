import React from 'react'
import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'
import axiosClient from '../../api/axiosClient'
import CommunityCard from '../../components/Community/CommunityCard'
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
    const [communities, setCommunities] = useState([])
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
        const fetchCommunities = async () => {
            try {
                const res = await axiosClient.get('community')
                setCommunities(Array.isArray(res) ? res.slice(0, 3) : [])
            } catch (err) {
                console.error('Error fetching communities:', err)
            }
        }
        fetchCommunities()
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
        <div className="min-h-screen bg-[#0f172a] text-white selection:bg-blue-500/30">

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none">
                    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/20 rounded-full blur-[120px] animate-pulse" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/20 rounded-full blur-[120px] animate-pulse" />
                </div>

                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <span className="px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-sm font-bold tracking-wider uppercase mb-8 inline-block">
                            Recruiter Platform 2.0
                        </span>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1]">
                            Hire the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">Best Talent</span> <br />
                            Faster Than Ever.
                        </h1>
                        <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
                            Stop chasing candidates. Start building teams. Future Milestone provides you with the precision tools to find, track, and hire the world's most ambitious talent.
                        </p>

                        {/* Dual Input Search Bar */}
                        <motion.form
                            onSubmit={handleSearch}
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.5 }}
                            className="max-w-4xl mx-auto mb-12 bg-slate-900/40 backdrop-blur-xl border border-slate-700/50 rounded-full p-2 flex flex-col md:flex-row items-center gap-2 shadow-2xl shadow-blue-900/20"
                        >
                            <div className="flex-1 flex items-center px-4 py-2 w-full">
                                <Search className="text-blue-400 mr-3 shrink-0" size={20} />
                                <input
                                    type="text"
                                    placeholder="Skills, roles, or keywords (e.g. React, Python)"
                                    value={searchSkills}
                                    onChange={(e) => setSearchSkills(e.target.value)}
                                    className="bg-transparent border-none text-white focus:outline-none w-full placeholder:text-slate-500 text-lg"
                                />
                            </div>

                            <div className="hidden md:block w-px h-10 bg-slate-700/50"></div>
                            <div className="w-full md:hidden h-px bg-slate-700/50 my-2"></div>

                            <div className="flex-1 flex items-center px-4 py-2 w-full">
                                <MapPin className="text-purple-400 mr-3 shrink-0" size={20} />
                                <input
                                    type="text"
                                    placeholder="City, state, or country"
                                    value={searchLocation}
                                    onChange={(e) => setSearchLocation(e.target.value)}
                                    className="bg-transparent border-none text-white focus:outline-none w-full placeholder:text-slate-500 text-lg"
                                />
                            </div>

                            <button
                                type="submit"
                                className="w-full md:w-auto px-8 py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-full font-bold text-lg transition-all active:scale-95 flex items-center justify-center shrink-0"
                            >
                                Search Candidates
                            </button>
                        </motion.form>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            {user ? (
                                user.role === 'employer' ? (
                                    <Link to="/recruiter/candidates" className="w-full sm:w-auto px-8 py-3 bg-slate-800/50 hover:bg-slate-800 text-white border border-slate-700/50 rounded-2xl font-bold transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2">
                                        View All Talent <ArrowRight size={18} />
                                    </Link>
                                ) : (
                                    <Link to="/seeker/dashboard" className="w-full sm:w-auto px-8 py-3 bg-indigo-600/20 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/30 rounded-2xl font-bold transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2">
                                        Go to Seeker Dashboard <ArrowRight size={18} />
                                    </Link>
                                )
                            ) : (
                                <>
                                    <Link to="/recruiter/signup" className="w-full sm:w-auto px-8 py-3 bg-slate-800/50 hover:bg-slate-800 border border-slate-700/50 text-white rounded-2xl font-bold transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center">
                                        Create Free Account
                                    </Link>
                                    <Link to="/recruiter/login" className="w-full sm:w-auto px-8 py-3 text-slate-400 hover:text-white rounded-2xl font-bold transition-colors flex items-center justify-center">
                                        Log In
                                    </Link>
                                </>
                            )}
                        </div>

                        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                            {/* Brand placeholders */}
                            <span className="font-bold text-2xl tracking-tighter">TECHFLOW</span>
                            <span className="font-bold text-2xl tracking-tighter">VORTEX</span>
                            <span className="font-bold text-2xl tracking-tighter">PRISM</span>
                            <span className="font-bold text-2xl tracking-tighter">NEXUS</span>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Core Features */}
            <section className="py-24 px-6 bg-slate-900/30">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Designed for Modern Teams</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto text-lg">Everything you need to scale your engineering, product, and design teams seamlessly.</p>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
                        {features.map((f, i) => (
                            <motion.div
                                key={i}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: i * 0.1 }}
                                className="p-8 rounded-3xl bg-slate-800/20 border border-slate-700/30 backdrop-blur-xl hover:bg-slate-800/40 transition-all group"
                            >
                                <div className={`w-14 h-14 rounded-2xl bg-${f.color}-500/10 flex items-center justify-center text-${f.color}-400 mb-6 group-hover:scale-110 transition-transform`}>
                                    <f.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold mb-4">{f.title}</h3>
                                <p className="text-slate-400 text-sm leading-relaxed">{f.description}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>



            {/* Testimonials */}
            <section className="py-24 px-6 bg-slate-900/20 shadow-inner">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-2">Loved by Talent Acquisition Teams</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {testimonials.map((t, i) => (
                            <div key={i} className="p-8 rounded-3xl bg-slate-800/40 border border-slate-700/50 relative">
                                <Star className="absolute top-8 right-8 text-yellow-500/20" size={40} />
                                <p className="text-slate-300 italic mb-8 relative z-10">"{t.content}"</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center font-bold text-white shadow-lg">
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-white leading-none mb-1">{t.name}</h4>
                                        <p className="text-xs text-slate-500">{t.role}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* New Communities Section */}
            <section className="py-24 px-6 bg-slate-900/40">
                <div className="max-w-7xl mx-auto">
                    <div className="flex justify-between items-end mb-12">
                        <div>
                            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-white">Professional Communities</h2>
                            <p className="text-slate-400 max-w-xl">Join circles of recruiter experts and industry leaders.</p>
                        </div>
                        <Link to="/recruiter/communities" className="text-blue-400 font-bold hover:text-blue-300 transition-colors flex items-center gap-2 mb-2">
                            Explore All <ArrowRight size={18} />
                        </Link>
                    </div>
                    <div className="grid md:grid-cols-3 gap-8">
                        {communities.map((community) => (
                            <CommunityCard key={community._id} community={community} isSeeker={false} />
                        ))}
                        {communities.length === 0 && (
                            <div className="col-span-3 text-center py-12 border border-dashed border-slate-700 rounded-3xl">
                                <p className="text-slate-500">No communities found. Be the first to start one!</p>
                            </div>
                        )}
                    </div>
                </div>
            </section>

            {/* Final CTA */}
            <section className="py-24 px-6 relative overflow-hidden">
                <div className="max-w-4xl mx-auto rounded-[40px] bg-gradient-to-br from-blue-600 to-indigo-700 p-12 md:p-20 text-center relative shadow-2xl shadow-blue-900/20">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to scale your team?</h2>
                        <p className="text-blue-100/80 text-lg mb-10 max-w-xl mx-auto">Join 500+ companies hiring from a pool of 50k+ vetted professionals worldwide.</p>
                        {user && user.role === 'employer' ? (
                            <Link to="/recruiter/candidates" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-blue-600 rounded-2xl font-bold text-lg hover:bg-slate-100 transition-all shadow-xl active:scale-95 leading-none">
                                Explore Talent Hub <ArrowRight size={20} />
                            </Link>
                        ) : (
                            <Link to="/recruiter/signup" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-blue-600 rounded-2xl font-bold text-lg hover:bg-slate-100 transition-all shadow-xl active:scale-95 leading-none">
                                Start Hiring <ArrowRight size={20} />
                            </Link>
                        )}
                    </div>
                </div>
            </section>

            {/* Footer Simple */}
            <footer className="py-12 px-6 border-t border-slate-800">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-3">
                        <img src={logo} alt="Logo" className="h-8 rounded-lg" />
                        <span className="font-bold text-xl tracking-tight">Future Milestone</span>
                    </div>
                    <p className="text-slate-500 text-sm">© 2026 Future Milestone Inc. All rights reserved.</p>
                    <div className="flex gap-6 text-slate-400 text-sm">
                        <a href="#" className="hover:text-blue-400 transition-colors">Privacy</a>
                        <a href="#" className="hover:text-blue-400 transition-colors">Terms</a>
                        <a href="#" className="hover:text-blue-400 transition-colors">Support</a>
                    </div>
                </div>
            </footer>

        </div>
    )
}

export default RecruiterHome
