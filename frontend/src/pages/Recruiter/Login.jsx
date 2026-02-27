import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGoogleLogin } from '@react-oauth/google'
import { Mail, Lock, ArrowRight, Chrome, ShieldCheck, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'react-toastify'
import logo from '../../assets/logo.jpeg'
import axiosClient from '../../api/axiosClient'

const RecruiterLogin = () => {
    const { user, login, loginWithGoogle, getRedirectPath } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(false);

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const user = await loginWithGoogle(tokenResponse.access_token, 'employer');
                toast.success("Welcome back!");
                navigate(getRedirectPath(user), { replace: true });
            } catch (err) {
                toast.error(err.response?.data?.message || "Google login failed");
            } finally {
                setIsLoading(false);
            }
        },
        onError: () => {
            toast.error("Google Login Failed");
            setIsLoading(false);
        }
    });
    const [isLinkingPassword, setIsLinkingPassword] = useState(false);
    const [formData, setFormData] = useState({
        email: location.state?.email || '',
        password: '',
        confirmPassword: ''
    })
    const [showPassword, setShowPassword] = useState(false);

    // Auto-redirect if already logged in or handle auth errors
    React.useEffect(() => {
        const params = new URLSearchParams(location.search);
        const error = params.get('error');
        const details = params.get('details');

        if (error) {
            console.error("[RecruiterLogin] Auth Error:", error, details);
            toast.error(details || "Google Authentication Failed");
            navigate(location.pathname, { replace: true });
            return;
        }

        if (user) {
            if (user.role === 'employer') {
                navigate(getRedirectPath(user), { replace: true });
            } else if (user.role === 'seeker') {
                navigate('/seeker/home', { replace: true });
            }
        }
    }, [user, navigate, getRedirectPath, location]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (isLoading) return;
        setIsLoading(true);

        try {
            console.log("🚀 Attempting recruiter login for:", formData.email);
            const response = await axiosClient.post('auth/login', {
                email: formData.email,
                password: formData.password,
                role: 'employer'
            });

            console.log("✅ Recruiter Login Success:", response);
            toast.success("Welcome back!");
            login(response.user, response.token);
            // Use centralized redirection helper
            navigate(getRedirectPath(response.user), { replace: true });

        } catch (error) {
            const apiError = error.response?.data || {};
            console.warn("❌ Login Failed:", apiError.message || error.message);

            if (apiError.message?.toLowerCase().includes('google')) {
                if (apiError.message.includes('linked with Google')) {
                    setIsLinkingPassword(true);
                    toast.info("This account uses Google. You can set a password below to use both methods!", { autoClose: 7000 });
                } else {
                    toast.info(apiError.message, { autoClose: 10000 });
                }
            } else {
                toast.error(apiError.message || "Login Failed");
            }
        } finally {
            setIsLoading(false);
        }
    }

    const handleLinkPassword = async (e) => {
        e.preventDefault();
        if (isLoading) return;

        if (formData.password !== formData.confirmPassword) {
            toast.error("Passwords do not match");
            return;
        }

        setIsLoading(true);
        try {
            const response = await axiosClient.post('auth/link-password', {
                email: formData.email,
                password: formData.password,
                role: 'employer'
            });

            if (response.status === 200 || response.status === 201) {
                toast.success("Password linked! Now logging you in...");
                setIsLinkingPassword(false);
                handleSubmit(new Event('submit'));
            } else {
                toast.error(response.message || "Failed to link password");
            }
        } catch (error) {
            toast.error("Error: " + error.message);
        } finally {
            setIsLoading(false);
        }
    };

    const handleGoogleLogin = () => {
        setIsLoading(true);
        googleLogin();
    };

    return (
        <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-[#0f172a]">

            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none">
                <div className="absolute top-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/10 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] left-[-10%] w-[40%] h-[40%] bg-purple-600/10 rounded-full blur-[120px]" />
            </div>

            <div className="z-10 w-full max-w-5xl p-4 sm:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 md:gap-12 items-center">

                {/* Visual Side */}
                <motion.div
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="hidden md:flex flex-col items-center justify-center p-12 bg-blue-600/10 border border-blue-500/20 rounded-[40px] text-center"
                >
                    <div className="w-20 h-20 bg-blue-600 rounded-3xl flex items-center justify-center mb-8 shadow-2xl shadow-blue-500/20">
                        <ShieldCheck size={40} className="text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-4">Employer Central</h2>
                    <p className="text-slate-400 mb-8 leading-relaxed">
                        Securely access your recruitment dashboard and manage your hiring pipeline with industry-leading precision.
                    </p>
                    <div className="flex -space-x-4 mb-4">
                        {[1, 2, 3, 4].map(i => (
                            <div key={i} className="w-12 h-12 rounded-full border-4 border-[#0f172a] bg-slate-800 flex items-center justify-center text-xs font-bold text-slate-400">
                                {i}
                            </div>
                        ))}
                        <div className="w-12 h-12 rounded-full border-4 border-[#0f172a] bg-blue-600 flex items-center justify-center text-xs font-bold text-white">
                            +5k
                        </div>
                    </div>
                    <p className="text-sm text-slate-500 font-medium">Joined by 5,000+ top companies</p>
                </motion.div>

                {/* Form Side */}
                <motion.div
                    initial={{ opacity: 0, x: 30 }}
                    animate={{ opacity: 1, x: 0 }}
                    className="bg-slate-800/40 border border-slate-700/50 backdrop-blur-xl rounded-2xl md:rounded-[32px] p-6 sm:p-8 md:p-10 shadow-2xl"
                >
                    {!isLinkingPassword ? (
                        <>
                            <div className="mb-10 text-center md:text-left">
                                <img src={logo} alt="Logo" className="h-8 mb-6 mx-auto md:mx-0 rounded-lg" />
                                <h2 className="text-3xl font-bold text-white mb-2">Recruiter Login</h2>
                                <p className="text-slate-400">Choose your preferred access method.</p>
                            </div>

                            <div className="mb-8">
                                <div className="flex items-center gap-2 mb-4">
                                    <ShieldCheck className="text-blue-400" size={18} />
                                    <span className="text-sm font-black text-blue-400 uppercase tracking-[0.2em]">Quick Auth</span>
                                </div>
                                <button
                                    onClick={handleGoogleLogin}
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
                                    <span className="px-4 bg-[#1e293b] text-slate-500 font-black">or secure login with credentials</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mb-6">
                                <Mail className="text-slate-500" size={18} />
                                <span className="text-sm font-black text-slate-500 uppercase tracking-[0.2em]">Portal Login</span>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="relative group">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Business Email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-2xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all placeholder:text-slate-500"
                                        required
                                    />
                                </div>

                                <div className="relative group">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="Password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-2xl py-4 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all placeholder:text-slate-500"
                                        required
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>

                                <div className="flex items-center justify-between text-sm">
                                    <label className="flex items-center text-slate-400 cursor-pointer hover:text-slate-300">
                                        <input type="checkbox" className="mr-2 rounded border-slate-700 bg-slate-800 text-blue-500 focus:ring-0" />
                                        Keep me signed in
                                    </label>
                                    <Link
                                        to="/auth/forgot-password"
                                        state={{ role: 'employer' }}
                                        className="text-blue-400 hover:text-blue-300 hover:underline font-medium"
                                    >
                                        Forgot?
                                    </Link>
                                </div>

                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-4 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-2xl shadow-xl shadow-blue-900/30 transition-all hover:scale-[1.01] active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
                                >
                                    {isLoading ? 'Signing in...' : (
                                        <>
                                            Sign in to Dashboard <ArrowRight size={20} />
                                        </>
                                    )}
                                </button>

                                <div className="text-center mt-4">
                                    <Link
                                        to="/auth/login-otp"
                                        state={{ role: 'employer' }}
                                        className="text-sm text-blue-400 hover:text-blue-300 font-medium transition-colors"
                                    >
                                        Login via OTP instead
                                    </Link>
                                </div>
                            </form>
                        </>
                    ) : (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="space-y-6"
                        >
                            <div className="mb-8">
                                <h2 className="text-3xl font-bold text-white mb-2 tracking-tight">Enable Dual Auth</h2>
                                <p className="text-slate-400 italic">This recruiter account is linked to Google. Set an access password below.</p>
                            </div>

                            <form onSubmit={handleLinkPassword} className="space-y-6">
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="New Access Password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-2xl py-5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                                        required
                                    />
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="Confirm Password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full bg-slate-900/50 border border-slate-700 text-white rounded-2xl py-5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/40 transition-all"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-5 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-bold rounded-2xl shadow-xl transition-all"
                                >
                                    {isLoading ? 'Securing account...' : 'Set Password & Access Dashboard'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsLinkingPassword(false)}
                                    className="w-full text-slate-500 text-xs uppercase tracking-widest font-black hover:text-slate-300 transition-colors"
                                >
                                    Back to normal login
                                </button>
                            </form>
                        </motion.div>
                    )}

                    <div className="mt-8 pt-6 border-t border-slate-700/50 text-center">
                        <p className="text-slate-500 text-xs mb-4 uppercase tracking-[0.2em] font-black">Role Switcher</p>
                        <Link
                            to="/seeker/login"
                            className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 hover:bg-blue-500 hover:text-white transition-all duration-300 font-bold text-sm tracking-tight"
                        >
                            Switch to Job Seeker Account
                        </Link>
                    </div>

                    <p className="mt-8 text-center text-slate-500 font-medium text-sm">
                        Need a recruiter account? {' '}
                        <Link to="/recruiter/signup" className="text-blue-400 hover:text-blue-300 hover:underline">
                            Signup today
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    )
}

export default RecruiterLogin
