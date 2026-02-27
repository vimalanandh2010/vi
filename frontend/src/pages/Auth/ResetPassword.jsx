import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Loader2, AlertCircle, RefreshCw, Lock, Eye, EyeOff } from 'lucide-react';
import authApi from '../../api/modules/auth.api';
import OtpInput from '../../components/Auth/OtpInput';
import { motion } from 'framer-motion';
import { toast } from 'react-toastify';

const ResetPassword = () => {
    const location = useLocation();
    const navigate = useNavigate();

    // Get email and role from router state or redirect if missing
    const email = location.state?.email;
    const role = location.state?.role;

    const [otp, setOtp] = useState('');
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [countdown, setCountdown] = useState(600); // 10 minutes for reset

    useEffect(() => {
        if (!email || !role) {
            navigate('/auth/forgot-password');
        }
    }, [email, role, navigate]);

    useEffect(() => {
        if (countdown > 0) {
            const timer = setTimeout(() => setCountdown(countdown - 1), 1000);
            return () => clearTimeout(timer);
        }
    }, [countdown]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    const handleReset = async (e) => {
        e.preventDefault();
        setError('');

        if (otp.length !== 6) {
            setError('Please enter the 6-digit code sent to your email');
            return;
        }

        if (password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        if (password !== confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        setLoading(true);
        try {
            await authApi.resetPassword(email, otp, password, role);
            toast.success('Password reset successful! You can now log in.');

            // Redirect to appropriate login page after a short delay
            setTimeout(() => {
                navigate(role === 'seeker' ? '/seeker/login' : '/recruiter/login');
            }, 2000);

        } catch (err) {
            console.error('Reset Password Error:', err);
            setError(err.response?.data?.message || 'Invalid code or failed to reset password.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (countdown > 0) return;

        setLoading(true);
        try {
            await authApi.forgotPassword(email, role);
            setCountdown(600);
            setError('');
            toast.info('New reset code sent!');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend code');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
                        <ShieldCheck className="text-blue-500" size={32} />
                    </div>
                    <h1 className="text-2xl font-bold text-white mb-2">Reset Password</h1>
                    <p className="text-slate-400 text-sm">We've sent a 6-digit code to <br /><span className="text-white font-medium">{email}</span></p>
                </div>

                <form onSubmit={handleReset} className="space-y-6">
                    <div className="flex justify-center mb-2">
                        <OtpInput
                            value={otp}
                            onChange={setOtp}
                            length={6}
                            disabled={loading}
                        />
                    </div>

                    <div className="space-y-4">
                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
                            <input
                                type={showPassword ? "text" : "password"}
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                placeholder="New Password"
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3.5 pl-12 pr-12 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
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

                        <div className="relative group">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-400 transition-colors" size={20} />
                            <input
                                type="password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                placeholder="Confirm New Password"
                                className="w-full bg-slate-800/50 border border-slate-700 rounded-xl py-3.5 pl-12 pr-4 text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                                required
                            />
                        </div>
                    </div>

                    {error && (
                        <div className="bg-red-500/10 border border-red-500/20 text-red-400 p-3 rounded-xl text-sm flex items-center gap-2 justify-center">
                            <AlertCircle size={16} />
                            {error}
                        </div>
                    )}

                    <div className="space-y-4">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    Reset Password
                                    <ArrowRight size={20} />
                                </>
                            )}
                        </button>

                        <div className="flex items-center justify-between text-sm px-2">
                            <span className="text-slate-500">
                                Expires in <span className="text-slate-300 font-mono pl-1">{formatTime(countdown)}</span>
                            </span>
                            <button
                                type="button"
                                onClick={handleResend}
                                disabled={countdown > 0 || loading}
                                className={`flex items-center gap-1.5 font-medium transition-colors ${countdown > 0
                                    ? 'text-slate-600 cursor-not-allowed'
                                    : 'text-blue-400 hover:text-blue-300'
                                    }`}
                            >
                                <RefreshCw size={14} className={loading && countdown === 0 ? 'animate-spin' : ''} />
                                Resend Code
                            </button>
                        </div>
                    </div>
                </form>

                <div className="mt-8 text-center pt-4 border-t border-slate-800">
                    <Link to="/auth/forgot-password" className="text-slate-400 hover:text-white text-sm transition-colors">
                        Did the email not arrive?
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default ResetPassword;
