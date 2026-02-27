import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Briefcase, ArrowRight, X } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useEffect } from 'react'
import logo from '../assets/logo.jpeg'
import background from '../assets/background.svg'

const RoleSelection = () => {
    const { user, getRedirectPath, logout } = useAuth();
    const navigate = useNavigate();

    console.log('RoleSelection Rendered. User:', user);

    // Auto-redirect removed - user wants localhost:5173 to always show role selection
    useEffect(() => {
        // No-op
    }, []);

    return (
        <div className="min-h-screen relative flex flex-col items-center justify-center overflow-hidden bg-slate-950">
            {/* Ambient Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] bg-blue-600/10 rounded-full blur-[150px] animate-pulse" />
                <div className="absolute bottom-[-20%] right-[-10%] w-[50%] h-[50%] bg-purple-600/10 rounded-full blur-[150px] animate-pulse" style={{ animationDelay: '2s' }} />
                <img src={background} alt="Background" className="w-full h-full object-cover opacity-10 mix-blend-overlay" />
            </div>

            <div className="z-10 w-full max-w-6xl px-6 py-12">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-10 md:mb-16"
                >
                    <div className="inline-block p-1 px-3 mb-4 md:mb-6 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-[10px] md:text-xs font-bold uppercase tracking-widest">
                        The Next Era of Hiring
                    </div>
                    <img src={logo} alt="Logo" className="h-16 sm:h-20 md:h-24 mx-auto mb-6 md:mb-8 drop-shadow-2xl brightness-110" />
                    <h1 className="text-4xl sm:text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-4 md:mb-6 leading-tight">
                        Define your <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-indigo-400 to-purple-500">Milestone</span>
                    </h1>
                    <p className="text-base md:text-lg text-slate-400 max-w-2xl mx-auto leading-relaxed px-4">
                        Whether you're scaling a global team or searching for your next career leap,
                        we provide the tools to make it happen.
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 items-stretch">
                    {/* Job Seeker Card */}
                    <motion.div
                        whileHover={{ y: -8 }}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                    >
                        <Link to="/seeker" className="group block h-full" onClick={() => { localStorage.setItem('selectedRole', 'seeker'); }}>
                            <div className="h-full relative overflow-hidden bg-slate-900/40 backdrop-blur-2xl border border-slate-800 hover:border-blue-500/50 rounded-[30px] md:rounded-[40px] p-8 md:p-10 transition-all duration-500">
                                <div className="absolute top-0 right-0 p-6 md:p-8">
                                    <div className="w-24 h-24 md:w-32 md:h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-colors" />
                                </div>
                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center text-blue-400 mb-6 md:mb-8 group-hover:scale-110 group-hover:bg-blue-500 group-hover:text-white transition-all duration-500">
                                        <User size={28} className="md:w-8 md:h-8" />
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 md:mb-4">Continue as Job Seeker</h2>
                                    <p className="text-slate-400 mb-8 md:mb-10 leading-relaxed text-base md:text-lg flex-grow">
                                        Access top tier opportunities, showcase your skills to global recruiters, and track your journey to success.
                                    </p>
                                    <div className="flex items-center gap-2 text-blue-400 font-bold group/btn text-sm md:text-base">
                                        <span>Enter Portal</span>
                                        <ArrowRight size={18} className="group-hover/btn:translate-x-2 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>

                    {/* Recruiter Card */}
                    <motion.div
                        whileHover={{ y: -8 }}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.4 }}
                    >
                        <Link to="/recruiter" className="group block h-full" onClick={() => { localStorage.setItem('selectedRole', 'employer'); }}>
                            <div className="h-full relative overflow-hidden bg-slate-900/40 backdrop-blur-2xl border border-slate-800 hover:border-purple-500/50 rounded-[30px] md:rounded-[40px] p-8 md:p-10 transition-all duration-500">
                                <div className="absolute top-0 right-0 p-6 md:p-8">
                                    <div className="w-24 h-24 md:w-32 md:h-32 bg-purple-500/5 rounded-full blur-3xl group-hover:bg-purple-500/10 transition-colors" />
                                </div>
                                <div className="relative z-10 flex flex-col h-full">
                                    <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-6 md:mb-8 group-hover:scale-110 group-hover:bg-purple-500 group-hover:text-white transition-all duration-500">
                                        <Briefcase size={28} className="md:w-8 md:h-8" />
                                    </div>
                                    <h2 className="text-2xl md:text-3xl font-bold text-white mb-3 md:mb-4">Continue as Recruiter</h2>
                                    <p className="text-slate-400 mb-8 md:mb-10 leading-relaxed text-base md:text-lg flex-grow">
                                        Streamline your hiring architecture, manage talent pipelines, and scale your organization with precision tools.
                                    </p>
                                    <div className="flex items-center gap-2 text-purple-400 font-bold group/btn text-sm md:text-base">
                                        <span>Manage Workspace</span>
                                        <ArrowRight size={18} className="group-hover/btn:translate-x-2 transition-transform" />
                                    </div>
                                </div>
                            </div>
                        </Link>
                    </motion.div>
                </div>

                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-12 md:mt-16 text-center"
                >
                    <p className="text-slate-500 text-xs md:text-sm mb-4 md:mb-6 px-4">Protected by secure encryption. Built for Future Milestone.</p>

                    <p className="text-slate-500 text-[10px] md:text-xs">Choose a path to begin your journey.</p>
                </motion.div>
            </div>
        </div>
    );
};

export default RoleSelection;

