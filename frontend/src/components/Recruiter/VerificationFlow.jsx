import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Globe, Mail, Key, ShieldCheck, ArrowRight, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import axios from 'axios';

const VerificationFlow = ({ onComplete }) => {
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        companyWebsite: '',
        officialEmail: '',
        otp: ''
    });
    const [domainInfo, setDomainInfo] = useState(null);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
        setError('');
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const handleVerifyDomain = async () => {
        if (!formData.companyWebsite) return setError('Please enter your company website');
        setLoading(true);
        try {
            const token = localStorage.getItem('recruiterToken');
            const res = await axios.post('/api/verification/verify-domain',
                { companyWebsite: formData.companyWebsite },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            setDomainInfo(res.data);
            nextStep();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to verify domain');
        } finally {
            setLoading(false);
        }
    };

    const handleSendOTP = async () => {
        if (!formData.officialEmail) return setError('Please enter your official email');
        setLoading(true);
        try {
            const token = localStorage.getItem('recruiterToken');
            await axios.post('/api/verification/send-otp',
                {
                    officialEmail: formData.officialEmail,
                    companyWebsite: formData.companyWebsite
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            nextStep();
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    const handleVerifyOTP = async () => {
        if (!formData.otp) return setError('Please enter the verification code');
        setLoading(true);
        try {
            const token = localStorage.getItem('recruiterToken');
            const res = await axios.post('/api/verification/verify-otp',
                {
                    officialEmail: formData.officialEmail,
                    otp: formData.otp,
                    companyWebsite: formData.companyWebsite
                },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            nextStep();
            if (onComplete) onComplete(res.data);
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid verification code');
        } finally {
            setLoading(false);
        }
    };

    const renderStep = () => {
        switch (step) {
            case 1:
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <div className="mb-6">
                            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center mb-4">
                                <Globe className="text-blue-400" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Step 1: Company Website</h3>
                            <p className="text-slate-400 text-sm">Enter your official business URL to begin verification.</p>
                        </div>
                        <input
                            type="text"
                            name="companyWebsite"
                            placeholder="e.g. google.com"
                            value={formData.companyWebsite}
                            onChange={handleChange}
                            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 mb-4"
                        />
                        {error && <div className="flex items-center gap-2 text-red-400 text-xs mb-4"><AlertCircle size={14} /> {error}</div>}
                        <button
                            onClick={handleVerifyDomain}
                            disabled={loading}
                            className="w-full py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2 "
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <>Next <ArrowRight size={18} /></>}
                        </button>
                    </motion.div>
                );
            case 2:
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <div className="mb-6">
                            <div className="w-12 h-12 bg-purple-500/10 rounded-2xl flex items-center justify-center mb-4">
                                <Mail className="text-purple-400" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Step 2: Official Email</h3>
                            <p className="text-slate-400 text-sm">Enter your professional email matching <strong>{domainInfo?.domain}</strong>.</p>
                        </div>
                        <input
                            type="email"
                            name="officialEmail"
                            placeholder={`name@${domainInfo?.domain || 'company.com'}`}
                            value={formData.officialEmail}
                            onChange={handleChange}
                            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-purple-500/50 mb-4"
                        />
                        {error && <div className="flex items-center gap-2 text-red-400 text-xs mb-4"><AlertCircle size={14} /> {error}</div>}
                        <div className="flex gap-3">
                            <button onClick={prevStep} className="flex-1 py-3 bg-slate-800 text-slate-400 rounded-xl font-bold">Back</button>
                            <button
                                onClick={handleSendOTP}
                                disabled={loading}
                                className="flex-[2] py-3 bg-purple-600 hover:bg-purple-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                            >
                                {loading ? <Loader2 className="animate-spin" size={20} /> : <>Send OTP <ArrowRight size={18} /></>}
                            </button>
                        </div>
                    </motion.div>
                );
            case 3:
                return (
                    <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
                        <div className="mb-6">
                            <div className="w-12 h-12 bg-orange-500/10 rounded-2xl flex items-center justify-center mb-4">
                                <Key className="text-orange-400" size={24} />
                            </div>
                            <h3 className="text-xl font-bold text-white mb-2">Step 3: Verification</h3>
                            <p className="text-slate-400 text-sm">We've sent a 6-digit code to <strong>{formData.officialEmail}</strong>.</p>
                        </div>
                        <input
                            type="text"
                            name="otp"
                            maxLength="6"
                            placeholder="Enter Code"
                            value={formData.otp}
                            onChange={handleChange}
                            className="w-full bg-slate-800/50 border border-slate-700/50 rounded-xl px-4 py-3 text-white text-center text-2xl font-bold tracking-[10px] focus:outline-none focus:ring-2 focus:ring-orange-500/50 mb-4"
                        />
                        {error && <div className="flex items-center gap-2 text-red-400 text-xs mb-4"><AlertCircle size={14} /> {error}</div>}
                        <button
                            onClick={handleVerifyOTP}
                            disabled={loading}
                            className="w-full py-3 bg-orange-600 hover:bg-orange-500 text-white rounded-xl font-bold transition-all flex items-center justify-center gap-2"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20} /> : <>Verify OTP <ShieldCheck size={18} /></>}
                        </button>
                    </motion.div>
                );
            case 4:
                return (
                    <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="text-center py-8">
                        <div className="w-20 h-20 bg-green-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CheckCircle className="text-green-400" size={48} />
                        </div>
                        <h3 className="text-2xl font-bold text-white mb-2">Verification Successful!</h3>
                        <p className="text-slate-400 text-sm mb-8">Your company has been verified. You now have the <strong>Fully Verified</strong> badge and a higher trust score.</p>
                        <button
                            onClick={() => window.location.reload()}
                            className="px-8 py-3 bg-green-600 hover:bg-green-500 text-white rounded-xl font-bold transition-all shadow-lg shadow-green-900/20"
                        >
                            Return to Dashboard
                        </button>
                    </motion.div>
                );
            default:
                return null;
        }
    };

    return (
        <div className="max-w-md mx-auto">
            {step < 4 && (
                <div className="flex gap-2 mb-8">
                    {[1, 2, 3].map((s) => (
                        <div
                            key={s}
                            className={`h-1.5 flex-1 rounded-full transition-all duration-500 ${s <= step ? 'bg-blue-500' : 'bg-slate-700'}`}
                        />
                    ))}
                </div>
            )}
            {renderStep()}
        </div>
    );
};

export default VerificationFlow;
