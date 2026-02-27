import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGoogleLogin } from '@react-oauth/google'
import { User, Mail, Lock, Building2, ArrowRight, Chrome, Eye, EyeOff, Phone } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'react-toastify'
import logo from '../../assets/logo.jpeg'
import background from '../../assets/background.svg'
import axiosClient from '../../api/axiosClient'

const RecruiterSignup = () => {
    const { login, loginWithGoogle, user, getRedirectPath } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const googleSignup = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const user = await loginWithGoogle(tokenResponse.access_token, 'employer');
                toast.success("Welcome successfully!");
                navigate(getRedirectPath(user), { replace: true });
            } catch (err) {
                toast.error(err.response?.data?.message || "Google signup failed");
            } finally {
                setIsLoading(false);
            }
        },
        onError: () => {
            toast.error("Google Signup Failed");
            setIsLoading(false);
        }
    });

    // Auto-redirect if already logged in
    React.useEffect(() => {
        if (user) {
            navigate(getRedirectPath(user), { replace: true });
        }
    }, [user, navigate, getRedirectPath]);

    const [formData, setFormData] = useState({
        fullName: '',
        companyName: '',
        phoneNumber: '',
        email: '',
        password: '',
        confirmPassword: ''
    })
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (isLoading) return;

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setIsLoading(true);

        try {
            console.log("🚀 Starting recruiter signup for:", formData.email);
            const response = await axiosClient.post('auth/signup', {
                firstName: formData.fullName.split(' ')[0],
                lastName: formData.fullName.split(' ').slice(1).join(' '),
                email: formData.email,
                password: formData.password,
                phoneNumber: formData.phoneNumber,
                role: 'employer',
                companyName: formData.companyName
            });

            console.log("✅ Recruiter Signup Success:", response);
            toast.success("Account created successfully!");
            login(response.user, response.token);
            // Use centralized redirection helper
            navigate(getRedirectPath(response.user), { replace: true });

        } catch (error) {
            const apiError = error.response?.data || {};
            console.warn("❌ Signup Failed:", apiError.message || error.message);

            const errorMsg = apiError.message || (apiError.errors && apiError.errors[0]?.msg) || error.message || "Signup Failed";

            if (errorMsg.includes('User already exists') || errorMsg.includes('Account with this details already exists')) {
                toast.info("User already exists! Redirecting to login...");
                navigate('/recruiter/login', { state: { email: formData.email } });
            } else {
                toast.error(errorMsg);
            }
        } finally {
            setIsLoading(false);
        }
    }

    const handleGoogleSignup = () => {
        setIsLoading(true);
        googleSignup();
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#0f172a]">
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-indigo-600/10 rounded-full blur-[120px]" />
            </div>

            <div className="z-10 w-full max-w-6xl p-4 sm:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">

                {/* Information Side */}
                <motion.div
                    initial={{ opacity: 0, x: -30 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="hidden md:block"
                >
                    <img src={logo} alt="Logo" className="h-12 mb-8 rounded-xl" />
                    <h1 className="text-5xl font-bold text-white mb-6 leading-tight">
                        Hire the best <br />
                        <span className="text-blue-400">talent for your <br /> company.</span>
                    </h1>
                    <p className="text-slate-400 text-lg mb-8 max-w-md">
                        Join 500+ companies hiring from a pool of 50k+ vetted professionals worldwide.
                    </p>

                    <div className="space-y-4">
                        {[
                            "Access to top-tier verified talent",
                            "AI-powered candidate matching",
                            "Streamlined application management"
                        ].map((text, i) => (
                            <div key={i} className="flex items-center gap-3 text-slate-300">
                                <div className="w-6 h-6 rounded-full bg-blue-500/10 flex items-center justify-center text-blue-400">
                                    <ArrowRight size={14} />
                                </div>
                                <span className="font-medium">{text}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                {/* Form Side */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-800/40 border border-slate-700/50 backdrop-blur-xl rounded-2xl md:rounded-[32px] p-6 sm:p-8 md:p-10 shadow-2xl"
                >
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-white mb-2 text-center md:text-left">Recruiter Signup</h2>
                        <p className="text-slate-400 text-center md:text-left">Choose your gateway to global talent.</p>
                    </div>

                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <Chrome className="text-blue-400" size={18} />
                            <span className="text-sm font-black text-blue-400 uppercase tracking-[0.2em]">One-Tap Setup</span>
                        </div>
                        <button
                            onClick={handleGoogleSignup}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-[20px] px-6 py-4 font-bold transition-all shadow-xl hover:shadow-blue-500/10 active:scale-[0.98]"
                        >
                            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                            <span>Continue with Google</span>
                        </button>
                    </div>

                    <div className="relative mb-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-700/50"></div>
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase tracking-tighter">
                            <span className="px-4 bg-[#1e293b] text-slate-500 font-black">or establish credentials manually</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mb-6">
                        <User className="text-slate-500" size={18} />
                        <span className="text-sm font-black text-slate-500 uppercase tracking-[0.2em]">Full Registration</span>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                name="fullName"
                                placeholder="Full Name"
                                value={formData.fullName}
                                onChange={handleChange}
                                className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all placeholder:text-slate-500"
                                required
                            />
                        </div>

                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                type="tel"
                                name="phoneNumber"
                                placeholder="Phone Number"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all placeholder:text-slate-500"
                                required
                            />
                        </div>

                        <div className="relative">
                            <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                name="companyName"
                                placeholder="Company Name"
                                value={formData.companyName}
                                onChange={handleChange}
                                className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all placeholder:text-slate-500"
                                required
                            />
                        </div>

                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                type="email"
                                name="email"
                                placeholder="Business Email"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all placeholder:text-slate-500"
                                required
                            />
                        </div>

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl py-3.5 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all placeholder:text-slate-500"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type={showConfirmPassword ? "text" : "password"}
                                    name="confirmPassword"
                                    placeholder="Confirm"
                                    value={formData.confirmPassword}
                                    onChange={handleChange}
                                    className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-xl py-3.5 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all placeholder:text-slate-500"
                                    required
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-xl shadow-lg shadow-blue-900/30 transition-all hover:scale-[1.01] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                        >
                            {isLoading ? 'Creating Account...' : 'Create Recruiter Account'}
                            <ArrowRight size={20} />
                        </button>
                    </form>


                    <div className="mt-8 pt-6 border-t border-slate-700/50 text-center">
                        <p className="text-slate-500 text-xs mb-4 uppercase tracking-[0.2em] font-black">Role Switcher</p>
                        <Link
                            to="/seeker/signup"
                            className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white transition-all duration-300 font-bold text-sm tracking-tight"
                        >
                            Switch to Job Seeker Account
                        </Link>
                    </div>

                    <p className="mt-8 text-center text-slate-500 font-medium">
                        Already have an account? {' '}
                        <Link to="/recruiter/login" className="text-blue-400 hover:text-blue-300 hover:underline">
                            Login here
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    )
}

export default RecruiterSignup
