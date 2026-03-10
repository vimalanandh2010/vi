import React, { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGoogleLogin } from '@react-oauth/google'
import { Mail, Lock, ArrowRight, Chrome, Eye, EyeOff } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'react-toastify'
import logo from '../../assets/logo.jpeg'
import axiosClient from '../../api/axiosClient'
import background from '../../assets/background.svg'

const SeekerLogin = () => {
    const { user, login, loginWithGoogle, getRedirectPath } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const [isLoading, setIsLoading] = useState(false);

    const googleLogin = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const user = await loginWithGoogle(tokenResponse.access_token, 'seeker');
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
            console.error("[SeekerLogin] Auth Error:", error, details);
            toast.error(details || "Google Authentication Failed");
            // Clear the query params
            navigate(location.pathname, { replace: true });
            return;
        }

        if (user) {
            if (user.role === 'seeker') {
                navigate(getRedirectPath(user), { replace: true });
            } else if (user.role === 'employer') {
                navigate('/recruiter/home', { replace: true });
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
            console.log("🚀 Attempting login for:", formData.email);
            const response = await axiosClient.post('auth/login', {
                email: formData.email,
                password: formData.password,
                role: 'seeker'
            });

            console.log("✅ Login Success:", response);
            toast.success("Welcome back!");
            login(response.user, response.token);
            // Use centralized redirection helper
            navigate(getRedirectPath(response.user), { replace: true });

        } catch (error) {
            const apiError = error.response?.data || {};
            console.warn("❌ Login Failed:", apiError.message || error.message);

            if (apiError.message?.toLowerCase().includes('google')) {
                // detect if it's the "linked with google" message
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
                role: 'seeker'
            });

            if (response.status === 200 || response.status === 201) {
                toast.success("Password linked! Now logging you in...");
                setIsLinkingPassword(false);
                // Attempt to login automatically with the new password
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
        <div className="min-h-screen relative flex items-center justify-center overflow-hidden bg-portal-bg">

            {/* Background Image */}
            <div className="absolute inset-0 z-0 opacity-10">
                <img src={background} alt="Background" className="w-full h-full object-cover" />
            </div>

            {/* Background Gradients/Blobs */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-50">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-slate-200 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-slate-300 rounded-full blur-[120px]" />
            </div>

            <div className="z-10 w-full max-w-6xl p-4 sm:p-6 lg:p-8 grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

                {/* Left Side - Form */}
                <motion.div
                    initial={{ opacity: 0, x: -50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white border border-slate-200 rounded-2xl md:rounded-3xl p-6 sm:p-8 shadow-lg"
                >
                    {!isLinkingPassword ? (
                        <>
                            <div className="mb-6 md:mb-8">
                                <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Welcome Back</h2>
                                <p className="text-slate-600 text-sm md:text-base">Choose your preferred login method.</p>
                            </div>

                            <div className="mb-6 md:mb-8">
                                <div className="flex items-center gap-2 mb-4">
                                    <Chrome className="text-slate-500" size={16} />
                                    <span className="text-[10px] md:text-xs font-bold text-slate-500 uppercase tracking-widest">Quick Access</span>
                                </div>
                                <button
                                    onClick={handleGoogleLogin}
                                    disabled={isLoading}
                                    className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 font-bold transition-all shadow-lg hover:shadow-xl active:scale-[0.98] text-sm md:text-base"
                                >
                                    <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                                    <span>Continue with Google</span>
                                </button>
                            </div>

                            <div className="relative mb-8">
                                <div className="absolute inset-0 flex items-center">
                                    <div className="w-full border-t border-slate-200"></div>
                                </div>
                                <div className="relative flex justify-center text-sm">
                                    <span className="px-4 bg-white text-slate-500 font-medium italic">or use your credentials</span>
                                </div>
                            </div>

                            <div className="flex items-center gap-2 mb-6">
                                <Mail className="text-slate-400" size={18} />
                                <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Manual Login</span>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">

                                {/* Email */}
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        type="email"
                                        name="email"
                                        placeholder="Email Address"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:border-slate-500 transition-all placeholder:text-slate-400"
                                        required
                                    />
                                </div>

                                {/* Password */}
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="Password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl py-3 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:border-slate-500 transition-all placeholder:text-slate-400"
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
                                    <label className="flex items-center text-slate-400 cursor-pointer hover:text-slate-600">
                                        <input type="checkbox" className="mr-2 rounded border-slate-300 bg-white text-slate-900 focus:ring-slate-500" />
                                        Remember me
                                    </label>
                                    <Link
                                        to="/auth/forgot-password"
                                        state={{ role: 'seeker' }}
                                        className="text-slate-600 font-bold hover:text-slate-900 hover:underline"
                                    >
                                        Forgot Password?
                                    </Link>
                                </div>

                                <button
                                    type="submit"
                                    className="w-full py-4 bg-black hover:bg-zinc-900 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-2"
                                >
                                    Sign In <ArrowRight size={20} />
                                </button>

                                <div className="text-center mt-4">
                                    <Link
                                        to="/auth/login-otp"
                                        state={{ role: 'seeker' }}
                                        className="text-sm text-slate-500 font-bold hover:text-slate-900 transition-colors hover:underline"
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
                            <div>
                                <h2 className="text-3xl font-bold text-white mb-2">Enable Dual Auth</h2>
                                <p className="text-slate-400 italic">This account is linked to Google. Set a password below to also log in manually.</p>
                            </div>

                            <form onSubmit={handleLinkPassword} className="space-y-6">
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        type="password"
                                        name="password"
                                        placeholder="New Password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                        required
                                    />
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                                    <input
                                        type="password"
                                        name="confirmPassword"
                                        placeholder="Confirm Password"
                                        value={formData.confirmPassword}
                                        onChange={handleChange}
                                        className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl py-4 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                        required
                                    />
                                </div>
                                <button
                                    type="submit"
                                    disabled={isLoading}
                                    className="w-full py-4 bg-black hover:bg-gray-800 text-white font-bold rounded-xl transition-all"
                                >
                                    {isLoading ? 'Setting password...' : 'Set Password & Log In'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setIsLinkingPassword(false)}
                                    className="w-full text-slate-500 text-sm hover:text-slate-300 transition-colors"
                                >
                                    Go back to normal login
                                </button>
                            </form>
                        </motion.div>
                    )}

                    <div className="mt-8 pt-6 border-t border-slate-200 text-center">
                        <p className="text-slate-500 text-sm mb-4 uppercase tracking-widest font-bold">Role Switching</p>
                        <Link
                            to="/recruiter/login"
                            className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-all duration-300 font-bold"
                        >
                            Switch to Recruiter Account
                        </Link>
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-slate-500">
                            Don't have an account? {' '}
                            <Link to="/seeker/signup" className="text-slate-700 font-bold hover:text-black hover:underline">
                                Sign Up
                            </Link>
                        </p>
                    </div>
                </motion.div>

                {/* Right Side - Quote/Info */}
                <motion.div
                    initial={{ opacity: 0, x: 50 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: 0.2 }}
                    className="hidden md:flex flex-col justify-center h-full text-slate-900 p-8"
                >
                    <div className="mb-6">
                        <img src={logo} alt="Logo" className="h-16 mb-6 opacity-90 drop-shadow-lg" />
                    </div>

                    <h1 className="text-5xl font-bold mb-6 leading-tight text-slate-900">
                        Welcome back to <br />
                        <span className="text-black">
                            your future.
                        </span>
                    </h1>

                    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-lg relative hover:-translate-y-1 transition-all group">
                        <div className="text-4xl text-slate-300 absolute -top-4 -left-2">"</div>
                        <p className="text-lg text-slate-700 italic mb-4 relative z-10">
                            Applying to jobs has never been easier. I found my current role within a week of creating my profile here.
                        </p>
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center text-lg font-bold text-white">
                                JS
                            </div>
                            <div>
                                <h4 className="font-bold text-slate-900">halfbrick</h4>
                                <p className="text-sm text-slate-600">brick by brick only made a wall</p>
                            </div>
                        </div>
                    </div>
                </motion.div>

            </div>
        </div>
    )
}

export default SeekerLogin
