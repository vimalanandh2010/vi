import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { User, Briefcase, ArrowRight, Building2, CheckCircle2 } from 'lucide-react'
import { useAuth } from '../context/AuthContext'
import { useEffect, useState } from 'react'
import logo from '../assets/logo.jpeg'

const RoleSelection = () => {
    const { user, getRedirectPath, logout } = useAuth();
    const navigate = useNavigate();
    const [selectedRole, setSelectedRole] = useState(null);

    console.log('RoleSelection Rendered. User:', user);

    useEffect(() => {
        // No-op
    }, []);

    const handleContinue = () => {
        if (!selectedRole) return;
        localStorage.setItem('selectedRole', selectedRole === 'seeker' ? 'seeker' : 'employer');
        navigate(`/${selectedRole}`);
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-slate-50 font-['Inter']">
            {/* Split Screen Background Effect */}
            <div className="absolute inset-0 z-0 flex pointer-events-none">
                <div className="w-1/2 h-full bg-slate-50"></div>
                <div className="w-1/2 h-full bg-slate-100/50 block"></div>
            </div>

            <div className="z-10 w-full max-w-6xl px-6 py-12 flex flex-col items-center">
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8 }}
                    className="text-center mb-10 md:mb-14"
                >
                    <img src={logo} alt="Logo" className="h-12 md:h-16 mx-auto mb-8 drop-shadow-sm rounded-lg" />
                    <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold text-[#0F172A] tracking-tight mb-4 leading-tight">
                        Welcome to the Portal
                    </h1>
                    <p className="text-base md:text-lg text-slate-500 font-medium">
                        How would you like to use our platform today?
                    </p>
                </motion.div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-10 w-full max-w-4xl mb-12">
                    {/* Job Seeker Card */}
                    <motion.div
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, x: -30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        onClick={() => setSelectedRole('seeker')}
                        className={`cursor-pointer rounded-3xl p-8 md:p-10 transition-all duration-300 relative overflow-hidden bg-white shadow-lg ${selectedRole === 'seeker'
                            ? 'border-2 border-blue-600 shadow-blue-600/20 ring-4 ring-blue-50'
                            : 'border border-slate-200 hover:border-blue-300 hover:shadow-xl opacity-90 hover:opacity-100'
                            }`}
                    >
                        {selectedRole === 'seeker' && (
                            <div className="absolute top-6 right-6 text-blue-600">
                                <CheckCircle2 size={28} className="fill-blue-100" />
                            </div>
                        )}
                        <div className="w-16 h-16 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mb-6 transition-all">
                            <Briefcase size={32} />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-[#0F172A] mb-3">
                            I'm looking for a job
                        </h2>
                        <p className="text-slate-500 leading-relaxed font-medium">
                            Discover top opportunities, showcase your profile, and fast-track your career.
                        </p>
                    </motion.div>

                    {/* Recruiter Card */}
                    <motion.div
                        whileHover={{ y: -4 }}
                        whileTap={{ scale: 0.98 }}
                        initial={{ opacity: 0, x: 30 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        onClick={() => setSelectedRole('recruiter')}
                        className={`cursor-pointer rounded-3xl p-8 md:p-10 transition-all duration-300 relative overflow-hidden bg-white shadow-lg ${selectedRole === 'recruiter'
                            ? 'border-2 border-purple-600 shadow-purple-600/20 ring-4 ring-purple-50'
                            : 'border border-slate-200 hover:border-purple-300 hover:shadow-xl opacity-90 hover:opacity-100'
                            }`}
                    >
                        {selectedRole === 'recruiter' && (
                            <div className="absolute top-6 right-6 text-purple-600">
                                <CheckCircle2 size={28} className="fill-purple-100" />
                            </div>
                        )}
                        <div className="w-16 h-16 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center mb-6 transition-all">
                            <Building2 size={32} />
                        </div>
                        <h2 className="text-2xl md:text-3xl font-bold text-[#0F172A] mb-3">
                            I want to hire
                        </h2>
                        <p className="text-slate-500 leading-relaxed font-medium">
                            Post jobs, manage candidates, and build your dream team effortlessly.
                        </p>
                    </motion.div>
                </div>

                {/* Action Section */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="w-full max-w-sm flex flex-col items-center gap-4 min-h-[80px]"
                >
                    <button
                        onClick={handleContinue}
                        disabled={!selectedRole}
                        className={`w-full py-4 rounded-full font-bold text-lg transition-all duration-300 flex items-center justify-center gap-2 ${selectedRole
                            ? 'bg-zinc-900 hover:bg-zinc-800 text-white shadow-2xl shadow-zinc-900/40 hover:-translate-y-1'
                            : 'bg-slate-200 text-slate-400 cursor-not-allowed opacity-70'
                            }`}
                    >
                        Continue {selectedRole && `as ${selectedRole === 'seeker' ? 'Seeker' : 'Recruiter'}`}
                        <ArrowRight size={20} />
                    </button>
                    {!selectedRole && (
                        <p className="text-sm font-medium text-slate-400 animate-pulse mt-1">
                            Please select an option to continue
                        </p>
                    )}
                </motion.div>
            </div>
        </div>
    );
};

export default RoleSelection;

