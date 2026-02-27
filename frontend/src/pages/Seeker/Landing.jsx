import React, { useState } from 'react'
import { useGoogleLogin } from '@react-oauth/google'
import { motion } from 'framer-motion'
import {
    Briefcase,
    TrendingUp,
    Zap,
    CheckCircle,
    ArrowRight,
    Star,
    Award,
    Target,
    Users,
    BookOpen
} from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import logo from '../../assets/logo.jpeg'

const SeekerLanding = () => {
    const { user, loginWithGoogle, getRedirectPath } = useAuth()
    const navigate = useNavigate()
    const [isLoading, setIsLoading] = useState(false)

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const user = await loginWithGoogle(tokenResponse.access_token, 'seeker');
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

    const features = [
        {
            title: "Browse Jobs",
            description: "Access thousands of verified job listings from top companies worldwide.",
            icon: Briefcase,
            color: "blue"
        },
        {
            title: "Apply Easily",
            description: "One-click applications with your profile. Track everything in one place.",
            icon: Zap,
            color: "purple"
        },
        {
            title: "Skill Development",
            description: "Access free courses from leading companies to boost your career.",
            icon: BookOpen,
            color: "indigo"
        },
        {
            title: "Career Growth",
            description: "Get matched with opportunities that align with your skills and goals.",
            icon: TrendingUp,
            color: "green"
        }
    ]

    const benefits = [
        {
            title: "Verified Companies",
            description: "All employers are verified to ensure legitimate opportunities.",
            icon: Award
        },
        {
            title: "Smart Matching",
            description: "AI-powered recommendations based on your profile and preferences.",
            icon: Target
        }
    ]

    const testimonials = [
        {
            name: "Sarah Mitchell",
            role: "Software Engineer at Google",
            content: "I landed my dream job within 2 weeks of signing up. The platform made it so easy to connect with top companies!",
            avatar: "SM"
        },
        {
            name: "James Chen",
            role: "Product Designer at Meta",
            content: "The course offerings helped me upskill and transition into product design. Couldn't be happier!",
            avatar: "JC"
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
                            Your Career Starts Here
                        </span>
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1]">
                            Find Your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">Dream Job</span> <br />
                            Today.
                        </h1>
                        <p className="text-lg md:text-xl text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
                            Join thousands of professionals who've found their perfect role. Browse verified opportunities, upskill with free courses, and take control of your career journey.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            {user ? (
                                user.role === 'seeker' ? (
                                    <Link to="/seeker/home" className="w-full sm:w-auto px-12 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-blue-900/40 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2">
                                        Go to Home Page <ArrowRight size={20} />
                                    </Link>
                                ) : (
                                    <div className="flex flex-col sm:flex-row items-center gap-4">
                                        <Link to="/recruiter/dashboard" className="w-full sm:w-auto px-12 py-4 bg-purple-600 hover:bg-purple-500 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-purple-900/40 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2">
                                            Go to Recruiter Dashboard <ArrowRight size={20} />
                                        </Link>
                                        <button
                                            onClick={() => { window.location.href = '/recruiter/dashboard' }} // Fallback or explicit logout could go here
                                            className="text-slate-400 hover:text-white text-sm"
                                        >
                                            Available for Recruiter Account
                                        </button>
                                    </div>
                                )
                            ) : (
                                <>
                                    <Link to="/seeker/signup" className="w-full sm:w-auto px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-blue-900/40 transition-all hover:scale-[1.02] active:scale-95 flex items-center justify-center gap-2">
                                        Get Started Free <ArrowRight size={20} />
                                    </Link>
                                    <button
                                        onClick={() => {
                                            setIsLoading(true);
                                            googleLogin();
                                        }}
                                        disabled={isLoading}
                                        className="w-full sm:w-auto px-10 py-4 bg-white text-slate-900 border border-slate-200 rounded-2xl font-bold text-lg transition-all hover:bg-slate-50 flex items-center justify-center gap-3 shadow-lg hover:shadow-xl active:scale-95"
                                    >
                                        <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                                        <span>Continue with Google</span>
                                    </button>
                                </>
                            )}
                        </div>

                        <div className="mt-16 flex flex-wrap items-center justify-center gap-8 md:gap-16 opacity-50 grayscale hover:grayscale-0 transition-all duration-500">
                            {/* Brand placeholders */}
                            <span className="font-bold text-2xl tracking-tighter">GOOGLE</span>
                            <span className="font-bold text-2xl tracking-tighter">MICROSOFT</span>
                            <span className="font-bold text-2xl tracking-tighter">AMAZON</span>
                            <span className="font-bold text-2xl tracking-tighter">META</span>
                        </div>
                    </motion.div>
                </div>
            </section>

            {/* Core Features */}
            <section className="py-24 px-6 bg-slate-900/30">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-20">
                        <h2 className="text-3xl md:text-5xl font-bold mb-6">Everything You Need to Succeed</h2>
                        <p className="text-slate-400 max-w-2xl mx-auto text-lg">Powerful tools and resources to accelerate your job search and career growth.</p>
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

            {/* Benefits Section */}
            <section className="py-24 px-6 relative overflow-hidden">
                <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <motion.div
                        initial={{ opacity: 0, x: -50 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                    >
                        <span className="text-blue-400 font-bold tracking-widest uppercase text-sm mb-4 block">Why Choose Us</span>
                        <h2 className="text-3xl md:text-5xl font-bold mb-8 leading-tight">
                            Your Success is <br />
                            <span className="text-indigo-400">Our Priority.</span>
                        </h2>
                        <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                            We connect talented professionals with companies that value their skills. Every opportunity is verified, every course is curated, and every feature is designed with your career growth in mind.
                        </p>

                        <div className="space-y-6">
                            {benefits.map((b, i) => (
                                <div key={i} className="flex gap-4 p-5 rounded-2xl bg-slate-800/20 border border-slate-700/50">
                                    <div className="w-12 h-12 rounded-xl bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0">
                                        <b.icon size={22} />
                                    </div>
                                    <div>
                                        <h4 className="font-bold mb-1">{b.title}</h4>
                                        <p className="text-slate-400 text-sm">{b.description}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </motion.div>

                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true }}
                        className="relative"
                    >
                        <div className="aspect-square rounded-3xl overflow-hidden border border-slate-700/50 bg-gradient-to-br from-blue-600/20 to-purple-600/20 relative group cursor-pointer shadow-2xl flex items-center justify-center">
                            <div className="text-center p-8">
                                <div className="text-6xl font-bold text-white mb-4">50K+</div>
                                <p className="text-slate-300 text-xl">Jobs Posted</p>
                            </div>
                        </div>
                        {/* Decorative blobs */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-purple-600/20 rounded-full blur-[80px]" />
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-blue-600/20 rounded-full blur-[80px]" />
                    </motion.div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 px-6 bg-slate-900/20 shadow-inner">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-2">Success Stories</h2>
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

            {/* Final CTA */}
            <section className="py-24 px-6 relative overflow-hidden">
                <div className="max-w-4xl mx-auto rounded-[40px] bg-gradient-to-br from-blue-600 to-indigo-700 p-12 md:p-20 text-center relative shadow-2xl shadow-blue-900/20">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-10" />
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to start your journey?</h2>
                        <p className="text-blue-100/80 text-lg mb-10 max-w-xl mx-auto">Join 50,000+ professionals who've found their dream careers through our platform.</p>
                        {user ? (
                            user.role === 'seeker' ? (
                                <Link to="/seeker/home" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-blue-600 rounded-2xl font-bold text-lg hover:bg-slate-100 transition-all shadow-xl active:scale-95 leading-none">
                                    Open Dashboard <ArrowRight size={20} />
                                </Link>
                            ) : (
                                <Link to="/recruiter/dashboard" className="inline-flex items-center gap-2 px-10 py-4 bg-purple-600 text-white rounded-2xl font-bold text-lg hover:bg-purple-500 transition-all shadow-xl active:scale-95 leading-none">
                                    Go to Recruiter Dashboard <ArrowRight size={20} />
                                </Link>
                            )
                        ) : (
                            <Link to="/seeker/signup" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-blue-600 rounded-2xl font-bold text-lg hover:bg-slate-100 transition-all shadow-xl active:scale-95 leading-none">
                                Get Started Free <ArrowRight size={20} />
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

export default SeekerLanding
