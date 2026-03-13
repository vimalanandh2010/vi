import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useGoogleLogin } from '@react-oauth/google'
import { User, Mail, Lock, Building2, ArrowRight, Chrome, Eye, EyeOff, Phone, AlertTriangle } from 'lucide-react'
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
                const errorMessage = err.response?.data?.message || err.message || "Google signup failed";
                console.error("Google Signup Error:", err);
                
                const isDomainError = 
                    errorMessage.toLowerCase().includes('company') || 
                    errorMessage.toLowerCase().includes('public domain') || 
                    errorMessage.toLowerCase().includes('gmail') ||
                    errorMessage.toLowerCase().includes('personal');

                if (isDomainError) {
                    setGoogleAuthError("Personal Gmail accounts are not allowed. You must use a company Google Workspace account (e.g. name@company.com).");
                    toast.warning("Company email required");
                } else {
                    toast.error(errorMessage);
                }
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
    const [emailWarning, setEmailWarning] = useState(false);
    const [googleAuthError, setGoogleAuthError] = useState('');

    const PUBLIC_DOMAINS = [
        'gmail.com', 'googlemail.com', 'yahoo.com', 'ymail.com', 'outlook.com', 
        'hotmail.com', 'icloud.com', 'me.com', 'mac.com', 'aol.com', 
        'zoho.com', 'protonmail.com', 'proton.me', 'mail.com', 'gmx.com',
        'yandex.com', 'mail.ru', 'live.com', 'msn.com', 'rediffmail.com', 'yahoo.in'
    ];

    const isPublicDomainEmail = (email) => {
        if (!email || !email.includes('@')) return false;
        const parts = email.trim().split('@');
        const domain = parts[parts.length - 1]?.toLowerCase();
        return domain ? PUBLIC_DOMAINS.includes(domain) : false;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value });
        if (name === 'email') {
            const isPersonal = isPublicDomainEmail(value);
            setEmailWarning(value.includes('@') && isPersonal);
        }
    }

    const handleBlur = (e) => {
        if (e.target.name === 'email' && isPublicDomainEmail(e.target.value)) {
            toast.warning("Recruiters must use a company email address.", {
                toastId: 'domain-warning' // Prevent duplicate toasts
            });
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (isLoading) return;

        if (isPublicDomainEmail(formData.email)) {
            toast.error("Manual signup restricted: Personal email accounts (Gmail, Yahoo, etc.) are not allowed for recruiters. Please use your official company email.");
            setEmailWarning(true);
            return;
        }

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

            if (response.user && response.token) {
                login(response.user, response.token);
                // Go straight to home after signup as requested
                navigate('/recruiter/home', { replace: true });
            } else {
                toast.info("Registration request submitted. Please check your email.");
                navigate('/recruiter/login');
            }

        } catch (error) {
            console.error("❌ Signup Error Detail:", error);
            const apiError = error.response?.data || {};
            const errorMsg = apiError.message || (apiError.errors && apiError.errors[0]?.msg) || error.message || "Signup failed. Please try again.";

            if (apiError.code === 'USER_EXISTS' || errorMsg.includes('User already exists') || errorMsg.includes('Account with this details already exists')) {
                const role = apiError.existingRole || 'employer';
                const loginPath = (role === 'seeker' || role === 'jobseeker') ? '/seeker/login' : '/recruiter/login';

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
            {/* Background Gradients */}
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden z-0 pointer-events-none opacity-50">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-slate-200 rounded-full blur-[120px]" />
                <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-slate-300 rounded-full blur-[120px]" />
            </div>

            <div className="z-10 w-full max-w-md px-4 sm:px-6 py-8">

                {/* Centered Form */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white border border-slate-200 rounded-2xl md:rounded-[32px] p-6 sm:p-8 md:p-10 shadow-lg"
                >
                    <div className="mb-8">
                        <h2 className="text-3xl font-bold text-slate-900 mb-2 text-center md:text-left">Recruiter Signup</h2>
                        <p className="text-slate-600 text-center md:text-left">Choose your gateway to global talent.</p>
                    </div>

                    {googleAuthError && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mb-6 flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-2xl p-4"
                        >
                            <AlertTriangle className="text-orange-500 shrink-0 mt-0.5" size={20} />
                            <div>
                                <h4 className="text-orange-800 font-bold text-sm mb-1">Company Email Required</h4>
                                <p className="text-orange-600 text-sm">
                                    {googleAuthError}
                                </p>
                            </div>
                        </motion.div>
                    )}

                    <div className="mb-8">
                        <div className="flex items-center gap-2 mb-4">
                            <Chrome className="text-slate-500" size={18} />
                            <span className="text-sm font-black text-slate-500 uppercase tracking-[0.2em]">One-Tap Setup</span>
                        </div>
                        <button
                            onClick={handleGoogleSignup}
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-3 bg-white text-gray-700 hover:bg-gray-50 border border-gray-300 rounded-[20px] px-6 py-4 font-bold transition-all shadow-xl hover:shadow-2xl active:scale-[0.98]"
                        >
                            <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
                            <span>Continue with Google</span>
                        </button>
                    </div>

                    <div className="relative mb-8">
                        <div className="absolute inset-0 flex items-center">
                            <div className="w-full border-t border-slate-200"></div>
                        </div>
                        <div className="relative flex justify-center text-[10px] uppercase tracking-tighter">
                            <span className="px-4 bg-white text-slate-500 font-black">or establish credentials manually</span>
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
                                className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-slate-500/40 transition-all placeholder:text-slate-400"
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
                                className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-slate-500/40 transition-all placeholder:text-slate-400"
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
                                className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-slate-500/40 transition-all placeholder:text-slate-400"
                                required
                            />
                        </div>

                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                type="email"
                                name="email"
                                placeholder="Business / Company Email"
                                value={formData.email}
                                onChange={handleChange}
                                onBlur={handleBlur}
                                className={`w-full bg-white border text-slate-900 rounded-xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 transition-all placeholder:text-slate-400 ${
                                    emailWarning
                                        ? 'border-orange-400 focus:ring-orange-400/30 focus:border-orange-400'
                                        : 'border-slate-200 focus:ring-slate-500/40'
                                }`}
                                required
                            />
                        </div>

                        {/* Real-time email domain warning */}
                        {emailWarning && (
                            <motion.div
                                initial={{ opacity: 0, y: -8 }}
                                animate={{ opacity: 1, y: 0 }}
                                className="flex items-start gap-3 bg-orange-50 border border-orange-200 rounded-xl px-4 py-3"
                            >
                                <AlertTriangle className="text-orange-500 mt-0.5 shrink-0" size={16} />
                                <div>
                                    <p className="text-orange-700 font-bold text-sm">Personal email not allowed</p>
                                    <p className="text-orange-600 text-xs mt-0.5">
                                        Recruiters must use a <strong>company/domain email</strong> (e.g. name@company.com).
                                        Use <strong>Continue with Google</strong> if your Google account is linked to your company.
                                    </p>
                                </div>
                            </motion.div>
                        )}

                        <div className="grid md:grid-cols-2 gap-4">
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                                <input
                                    type={showPassword ? "text" : "password"}
                                    name="password"
                                    placeholder="Password"
                                    value={formData.password}
                                    onChange={handleChange}
                                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl py-3.5 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-slate-500/40 transition-all placeholder:text-slate-400"
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
                                    className="w-full bg-white border border-slate-200 text-slate-900 rounded-xl py-3.5 pl-12 pr-12 focus:outline-none focus:ring-2 focus:ring-slate-500/40 transition-all placeholder:text-slate-400"
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
                            className="w-full py-4 bg-black hover:bg-zinc-900 text-white font-bold rounded-xl shadow-lg transition-all hover:-translate-y-1 active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-2"
                        >
                            {isLoading ? 'Creating Account...' : 'Create Recruiter Account'}
                            <ArrowRight size={20} />
                        </button>
                    </form>


                    <div className="mt-8 pt-6 border-t border-slate-200 text-center">
                        <p className="text-slate-500 text-xs mb-4 uppercase tracking-[0.2em] font-black">Role Switcher</p>
                        <Link
                            to="/seeker/signup"
                            className="inline-flex items-center gap-2 px-6 py-2 rounded-full bg-slate-100 border border-slate-200 text-slate-600 hover:bg-slate-200 hover:text-slate-900 transition-all duration-300 font-bold text-sm tracking-tight"
                        >
                            Switch to Job Seeker Account
                        </Link>
                    </div>

                    <p className="mt-8 text-center text-slate-500 font-medium">
                        Already have an account? {' '}
                        <Link to="/recruiter/login" className="text-slate-700 font-bold hover:text-black hover:underline">
                            Login here
                        </Link>
                    </p>
                </motion.div>
            </div>
        </div>
    )
}

export default RecruiterSignup
