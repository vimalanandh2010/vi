import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGoogleLogin } from '@react-oauth/google'
import { User, Mail, Lock, Briefcase, ArrowRight, Github, Chrome, Eye, EyeOff, Phone } from 'lucide-react'
import { useAuth } from '../../context/AuthContext'
import { toast } from 'react-toastify'
import logo from '../../assets/logo.jpeg'
import background from '../../assets/background.svg'
import axiosClient from '../../api/axiosClient'

const SeekerSignup = () => {
    const { login, loginWithGoogle, user, getRedirectPath } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);

    const googleSignup = useGoogleLogin({
        onSuccess: async (tokenResponse) => {
            try {
                const user = await loginWithGoogle(tokenResponse.access_token, 'seeker');
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
        email: '',
        phoneNumber: '',
        password: '',
        confirmPassword: '',
        skills: ''
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
            console.log(" Starting signup for:", formData.email);
            const response = await axiosClient.post('auth/signup', {
                firstName: formData.fullName.split(' ')[0],
                lastName: formData.fullName.split(' ').slice(1).join(' '),
                email: formData.email,
                password: formData.password,
                phoneNumber: formData.phoneNumber,
                role: 'seeker',
                experienceLevel: 'fresher' // Default
            });

            console.log("✅ Signup Success:", response);
            toast.success("Account created successfully!");

            if (response.user && response.token) {
                login(response.user, response.token);
                // Go straight to home after signup as requested
                navigate('/seeker/home', { replace: true });
            } else {
                // Fallback to login if something is missing
                navigate('/seeker/login', { state: { email: formData.email } });
            }

        } catch (error) {
            const apiError = error.response?.data || {};
            console.warn("❌ Signup Failed:", apiError.message || error.message);

            const errorMsg = apiError.message || (apiError.errors && apiError.errors[0]?.msg) || error.message || "Signup Failed";

            if (apiError.code === 'USER_EXISTS' || errorMsg.includes('User already exists') || errorMsg.includes('Account with this details already exists')) {
                const role = apiError.existingRole || 'seeker';
                const loginPath = role === 'employer' ? '/recruiter/login' : '/seeker/login';

                toast.info(`Account already exists as a ${role}! Redirecting to login...`);
                navigate(loginPath, { state: { email: formData.email } });
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

            <div className="z-10 w-full max-w-md px-4 sm:px-6 py-8">

                {/* Centered Form */}
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6 }}
                    className="bg-white border border-slate-200 rounded-2xl md:rounded-3xl p-6 sm:p-8 shadow-lg"
                >
                    <div className="mb-6 md:mb-8">
                        <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-2">Create Account</h2>
                        <p className="text-slate-600 text-sm md:text-base">Choose how you want to join our platform.</p>
                    </div>

                    <div className="mb-6 md:mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <span className="text-[10px] md:text-xs font-bold text-blue-400 uppercase tracking-widest"></span>
                        </div>
                        <button
                            onClick={handleGoogleSignup}
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
                            <span className="px-4 bg-white text-slate-500 font-medium italic">or fill details manually</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-2 mb-6 font-['Poppins']">
                        <User className="text-slate-400" size={18} />
                        <span className="text-sm font-bold text-slate-400 uppercase tracking-widest">Manual Registration</span>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-5">

                        {/* Full Name */}
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                name="fullName"
                                placeholder="Full Name"
                                value={formData.fullName}
                                onChange={handleChange}
                                className="w-full bg-white border border-slate-200 text-slate-900 font-medium tracking-[-0.02em] rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:border-slate-500 transition-all placeholder:text-slate-400 [&:-webkit-autofill]:bg-white [&:-webkit-autofill]:shadow-[0_0_0_30px_white_inset] [&:-webkit-autofill]:text-slate-900"
                                required
                            />
                        </div>

                        {/* Email */}
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="email"
                                name="email"
                                placeholder="Email Address"
                                value={formData.email}
                                onChange={handleChange}
                                className="w-full bg-white border border-slate-200 text-slate-900 font-medium tracking-[-0.02em] rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:border-slate-500 transition-all placeholder:text-slate-400 [&:-webkit-autofill]:bg-white [&:-webkit-autofill]:shadow-[0_0_0_30px_white_inset] [&:-webkit-autofill]:text-slate-900"
                                required
                            />
                        </div>

                        {/* Phone Number */}
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="tel"
                                name="phoneNumber"
                                placeholder="Phone Number"
                                value={formData.phoneNumber}
                                onChange={handleChange}
                                className="w-full bg-white border border-slate-200 text-slate-900 font-medium tracking-[-0.02em] rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:border-slate-500 transition-all placeholder:text-slate-400 [&:-webkit-autofill]:bg-white [&:-webkit-autofill]:shadow-[0_0_0_30px_white_inset] [&:-webkit-autofill]:text-slate-900"
                                required
                            />
                        </div>

                        {/* Skills/Role (Optional) */}
                        <div className="relative">
                            <Briefcase className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type="text"
                                name="skills"
                                placeholder="Role or Key Skills (e.g. Frontend Developer or python)"
                                value={formData.skills}
                                onChange={handleChange}
                                className="w-full bg-white border border-slate-200 text-slate-900 font-medium tracking-[-0.02em] rounded-xl py-3 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:border-slate-500 transition-all placeholder:text-slate-400 [&:-webkit-autofill]:bg-white [&:-webkit-autofill]:shadow-[0_0_0_30px_white_inset] [&:-webkit-autofill]:text-slate-900"
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
                                className="w-full bg-white border border-slate-200 text-slate-900 font-medium tracking-[-0.02em] rounded-xl py-3 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:border-slate-500 transition-all placeholder:text-slate-400 hover:bg-white [&:-webkit-autofill]:bg-white [&:-webkit-autofill]:shadow-[0_0_0_30px_white_inset] [&:-webkit-autofill]:text-slate-900"
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

                        {/* Confirm Password */}
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-slate-400" size={20} />
                            <input
                                type={showConfirmPassword ? "text" : "password"}
                                name="confirmPassword"
                                placeholder="Confirm Password"
                                value={formData.confirmPassword}
                                onChange={handleChange}
                                className="w-full bg-white border border-slate-200 text-slate-900 font-medium tracking-[-0.02em] rounded-xl py-3 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-slate-500/50 focus:border-slate-500 transition-all placeholder:text-slate-400 [&:-webkit-autofill]:bg-white [&:-webkit-autofill]:shadow-[0_0_0_30px_white_inset] [&:-webkit-autofill]:text-slate-900"
                                required
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="absolute right-4 top-1/2 transform -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 bg-black hover:bg-zinc-900 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all hover:-translate-y-1 active:scale-[0.98] flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? 'Creating Account...' : 'Create Account'} <ArrowRight size={20} />
                        </button>
                    </form>


                    <div className="mt-8 pt-6 border-t border-slate-200 text-center font-['Poppins']">
                        <p className="text-slate-500 text-sm mb-4 uppercase tracking-widest font-bold">Role Switching</p>
                        <Link
                            to="/recruiter/signup"
                            className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-all duration-300 font-bold"
                        >
                            Switch to Recruiter Account
                        </Link>
                    </div>

                    <div className="mt-6 text-center">
                        <p className="text-slate-500">
                            Already have an account? {' '}
                            <Link to="/seeker/login" className="text-slate-700 font-bold hover:text-black hover:underline">
                                Login
                            </Link>
                        </p>
                    </div>
                </motion.div>

            </div>
        </div>
    )
}

export default SeekerSignup
