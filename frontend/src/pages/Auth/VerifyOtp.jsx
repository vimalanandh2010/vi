import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { ShieldCheck, ArrowRight, Loader2, AlertCircle, RefreshCw } from 'lucide-react';
import authApi from '../../api/modules/auth.api';
import { useAuth } from '../../context/AuthContext';
import OtpInput from '../../components/Auth/OtpInput'; // Adjust path if needed
import { motion } from 'framer-motion';

const VerifyOtp = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { login, getRedirectPath } = useAuth();

    // Get email and role from router state or redirect if missing
    const email = location.state?.email;
    const role = location.state?.role;

    const [otp, setOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [countdown, setCountdown] = useState(300); // 5 minutes in seconds

    useEffect(() => {
        if (!email) {
            navigate('/auth/login-otp');
        }
    }, [email, navigate]);

    // Timer logic
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

    const handleVerify = async (e) => {
        e.preventDefault();
        setError('');

        if (otp.length !== 6) {
            setError('Please enter a valid 6-digit code');
            return;
        }

        setLoading(true);
        try {
            const res = await authApi.verifyOtp(email, otp, role);

            // Login success - update context
            login(res.data.user, res.data.token);
            navigate(getRedirectPath(res.data.user), { replace: true });

        } catch (err) {
            console.error('Verify OTP Error:', err);
            setError(err.response?.data?.message || 'Invalid code. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleResend = async () => {
        if (countdown > 0) return;

        setLoading(true);
        try {
            await authApi.sendOtp(email, role);
            setCountdown(300); // Reset timer
            setError('');
            // Optional: Toast success
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to resend OTP');
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
                    <h1 className="text-2xl font-bold text-white mb-2">Check Your Email</h1>
                    <p className="text-slate-400">We've sent a code to <span className="text-white font-medium">{email}</span></p>
                </div>

                <form onSubmit={handleVerify} className="space-y-8">
                    <div className="flex justify-center">
                        <OtpInput
                            value={otp}
                            onChange={setOtp}
                            length={6}
                            disabled={loading}
                        />
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
                            disabled={loading || otp.length !== 6}
                            className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                        >
                            {loading ? (
                                <Loader2 className="animate-spin" size={20} />
                            ) : (
                                <>
                                    Verify & Login
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

                <div className="mt-8 text-center pt-6 border-t border-slate-800">
                    <Link to="/auth/login-otp" className="text-slate-400 hover:text-white text-sm transition-colors">
                        Wrong email address?
                    </Link>
                </div>
            </motion.div>
        </div>
    );
};

export default VerifyOtp;
