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
            name: "HALF BRICK",
            role: "BASED ON A COMMUNITIES",
            content: "I landed my dream job within 2 weeks of signing up. The platform made it so easy to connect with top companies!",
            avatar: "HB"
        },
        {
            name: "HALF BRICK",
            role: "BASED ON A COMMUNITIES",
            content: "The course offerings helped me upskill and transition into product design. Couldn't be happier!",
            avatar: "HB"
        }
    ]

    return (
        <div className="min-h-screen bg-portal-bg text-slate-900 selection:bg-blue-500/30">

            {/* Hero Section */}
            <section className="relative pt-32 pb-20 px-6 overflow-hidden">
                <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full pointer-events-none opacity-10">
                    <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-slate-400 rounded-full blur-[120px]" />
                    <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-slate-300 rounded-full blur-[120px]" />
                </div>

                <div className="max-w-7xl mx-auto text-center relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6 }}
                    >
                        <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-8 leading-[1.1] text-slate-900">
                            Find Your <span className="text-black">Dream Job</span> <br />
                            Today.
                        </h1>
                        <p className="text-lg md:text-xl text-slate-600 max-w-3xl mx-auto mb-10 leading-relaxed">
                            Join thousands of professionals who've found their perfect role. Browse verified opportunities, upskill with free courses, and take control of your career journey.
                        </p>

                        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                            {user ? (
                                user.role === 'seeker' ? (
                                    <Link to="/seeker/home" className="w-full sm:w-auto px-12 py-4 bg-black hover:bg-zinc-900 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2">
                                        Go to Home Page <ArrowRight size={20} />
                                    </Link>
                                ) : (
                                    <div className="flex flex-col sm:flex-row items-center gap-4">
                                        <Link to="/recruiter/dashboard" className="w-full sm:w-auto px-12 py-4 bg-black hover:bg-zinc-900 text-white rounded-2xl font-bold text-lg shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 active:scale-95 flex items-center justify-center gap-2">
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
                                    <Link to="/seeker/signup" className="w-full sm:w-auto px-10 py-4 bg-white text-black rounded-2xl font-bold text-lg shadow-lg active:scale-95 flex items-center justify-center gap-2">
                                        Get Started  <ArrowRight size={20} />
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







                    </motion.div>
                </div>
            </section>

            {/* Core Features */}
            <section className="py-24 px-6 bg-transparent">
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
                                className="p-8 rounded-3xl bg-white shadow-lg border border-slate-200 hover:-translate-y-1 transition-all group"
                            >
                                <div className={`w-14 h-14 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-800 mb-6 group-hover:scale-110 transition-transform`}>
                                    <f.icon size={28} />
                                </div>
                                <h3 className="text-xl font-bold mb-4 text-slate-900">{f.title}</h3>
                                <p className="text-slate-600 text-sm leading-relaxed">{f.description}</p>
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
                        <span className="text-slate-500 font-bold tracking-widest uppercase text-sm mb-4 block">Why Choose Us</span>
                        <h2 className="text-3xl md:text-5xl font-bold mb-8 leading-tight">
                            Your Success is <br />
                            <span className="text-black">Our Priority.</span>
                        </h2>
                        <p className="text-slate-400 text-lg mb-10 leading-relaxed">
                            We connect talented professionals with companies that value their skills. Every opportunity is verified, every course is curated, and every feature is designed with your career growth in mind.
                        </p>

                        <div className="space-y-6">
                            {benefits.map((b, i) => (
                                <div key={i} className="flex gap-4 p-5 rounded-2xl bg-white shadow-lg border border-slate-200 hover:-translate-y-1 transition-all">
                                    <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center text-slate-800 shrink-0">
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
                        <div className="aspect-square rounded-3xl overflow-hidden border border-slate-200 bg-white group hover:-translate-y-1 transition-all cursor-pointer shadow-lg flex items-center justify-center relative z-10">
                            <div className="text-center p-8">
                                <div className="text-6xl font-bold text-black mb-4">50K+</div>
                                <p className="text-slate-600 text-xl">Jobs Posted</p>
                            </div>
                        </div>
                        {/* Decorative blobs */}
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-slate-200 rounded-full blur-[80px]" />
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-slate-200 rounded-full blur-[80px]" />
                    </motion.div>
                </div>
            </section>

            {/* Testimonials */}
            <section className="py-24 px-6 relative">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-16">
                        <h2 className="text-3xl font-bold mb-2">Success Stories</h2>
                    </div>
                    <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
                        {testimonials.map((t, i) => (
                            <div key={i} className="p-8 rounded-3xl bg-white shadow-lg border border-slate-200 hover:-translate-y-1 transition-all relative">
                                <Star className="absolute top-8 right-8 text-yellow-500/20" size={40} />
                                <p className="text-slate-600 italic mb-8 relative z-10">"{t.content}"</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center font-bold text-white shadow-lg">
                                        {t.avatar}
                                    </div>
                                    <div>
                                        <h4 className="font-bold text-slate-900 leading-none mb-1">{t.name}</h4>
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
                <div className="max-w-4xl mx-auto rounded-[40px] bg-black p-12 md:p-20 text-center relative shadow-2xl">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')] opacity-20" />
                    <div className="relative z-10">
                        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Ready to start your journey?</h2>
                        <p className="text-slate-300 text-lg mb-10 max-w-xl mx-auto">Join 50,000+ professionals who've found their dream careers through our platform.</p>
                        {user ? (
                            user.role === 'seeker' ? (
                                <Link to="/seeker/home" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-black rounded-2xl font-bold text-lg hover:bg-slate-100 transition-all shadow-xl active:scale-95 leading-none">
                                    Open Dashboard <ArrowRight size={20} />
                                </Link>
                            ) : (
                                <Link to="/recruiter/dashboard" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-black rounded-2xl font-bold text-lg hover:bg-slate-100 transition-all shadow-xl active:scale-95 leading-none">
                                    Go to Recruiter Dashboard <ArrowRight size={20} />
                                </Link>
                            )
                        ) : (
                            <Link to="/seeker/signup" className="inline-flex items-center gap-2 px-10 py-4 bg-white text-black rounded-2xl font-bold text-lg hover:bg-slate-100 transition-all shadow-xl active:scale-95 leading-none">
                                Get Started Free <ArrowRight size={20} />
                            </Link>
                        )}
                    </div>
                </div>
            </section>



        </div>
    )
}

export default SeekerLanding
