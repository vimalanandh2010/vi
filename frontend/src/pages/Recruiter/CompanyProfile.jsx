import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { toast } from 'react-toastify';
import { Building2, MapPin, Globe, Users, Briefcase, Save, Info, ArrowRight, ChevronRight, Target, Sparkles, Loader2 } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import VerificationBadge from '../../components/Common/VerificationBadge';
import { useCompany } from '../../context/CompanyContext';
import RecruiterLayout from '../../components/RecruiterLayout';

const CompanyProfile = () => {
    const navigate = useNavigate();
    const { company, updateCompanyContext, loading: contextLoading } = useCompany();

    const [saving, setSaving] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        logo: '',
        about: '',
        companyType: 'Startup',
        industries: [],
        size: '1-10',
        location: '',
        website: ''
    });

    const companyTypes = ['Startup', 'Unicorn Startup', 'Scale-up', 'MNC', 'Enterprise', 'NGO', 'Government'];
    const industriesList = [
        'IoT', 'AI/ML', 'Web/SaaS', 'FinTech', 'EdTech',
        'Hospital', 'School', 'College/University', 'Healthcare',
        'Manufacturing', 'E-commerce', 'BioTech'
    ];

    useEffect(() => {
        if (!contextLoading && company) {
            navigate('/recruiter/dashboard');
            toast.info('Mandate active for existing organization.');
        }
    }, [company, contextLoading, navigate]);

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleIndustryToggle = (industry) => {
        if (formData.industries.includes(industry)) {
            setFormData({
                ...formData,
                industries: formData.industries.filter(i => i !== industry)
            });
        } else {
            setFormData({
                ...formData,
                industries: [...formData.industries, industry]
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await axiosClient.put('/companies/update', formData);
            updateCompanyContext(res);
            toast.success('Organization data synchronized');
            navigate('/recruiter/dashboard');
        } catch (err) {
            console.error('Error saving company:', err);
            toast.error(err.response?.data?.message || 'Failed to save company profile');
        } finally {
            setSaving(false);
        }
    };

    if (contextLoading) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-black mb-4" size={48} />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Validating Infrastructure...</p>
            </div>
        );
    }

    if (company) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-black mb-4" size={48} />
                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Rerouting to Command Center...</p>
            </div>
        );
    }

    return (
        <RecruiterLayout>
            <main className="p-4 sm:p-8 md:p-12 lg:p-16 max-w-5xl mx-auto bg-white min-h-full">
                {/* Strategic Header */}
                <header className="mb-20">
                    <div className="flex items-center gap-2 mb-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">
                        Governance <ChevronRight size={12} /> Organizational Architect
                    </div>
                    <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-black tracking-tighter mb-4 leading-tight">
                        Register Your <br />Corporate Entity
                    </h1>
                    <p className="text-slate-400 text-base sm:text-xl font-medium tracking-tight">Establish your brand presence to attract top-tier global talent.</p>
                </header>

                <form onSubmit={handleSubmit} className="space-y-12 pb-24">
                    {/* Fundamental Info */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-slate-100 rounded-[2rem] sm:rounded-[3.5rem] p-6 sm:p-10 lg:p-16 shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden relative group"
                    >
                        <div className="flex items-center gap-6 mb-12">
                            <div className="p-5 bg-black text-white rounded-3xl group-hover:bg-blue-600 transition-colors">
                                <Building2 size={28} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-black">Entity Fundamentals</h2>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Core Identity Parameters</p>
                            </div>
                        </div>

                        <div className="grid md:grid-cols-2 gap-10">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Legal Entity Name *</label>
                                <div className="relative group/input">
                                    <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-black transition-colors" size={20} />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="e.g. Atlas Systems"
                                        className="w-full bg-slate-50 border border-transparent focus:border-black/5 focus:bg-white text-black font-bold rounded-2xl py-5 pl-14 pr-6 outline-none transition-all placeholder:text-slate-300"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Digital Domain (URL)</label>
                                <div className="relative group/input">
                                    <Globe className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-black transition-colors" size={20} />
                                    <input
                                        type="url"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleChange}
                                        placeholder="https://atlas.io"
                                        className="w-full bg-slate-50 border border-transparent focus:border-black/5 focus:bg-white text-black font-bold rounded-2xl py-5 pl-14 pr-6 outline-none transition-all placeholder:text-slate-300"
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Operational Headquarters *</label>
                                <div className="relative group/input">
                                    <MapPin className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within/input:text-black transition-colors" size={20} />
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        placeholder="City, Country"
                                        className="w-full bg-slate-50 border border-transparent focus:border-black/5 focus:bg-white text-black font-bold rounded-2xl py-5 pl-14 pr-6 outline-none transition-all placeholder:text-slate-300"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-3">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Force Scale (Employees)</label>
                                <div className="relative group/input">
                                    <Users className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-300 transition-colors" size={20} />
                                    <select
                                        name="size"
                                        value={formData.size}
                                        onChange={handleChange}
                                        className="w-full bg-slate-50 border border-transparent focus:border-black/5 focus:bg-white text-black font-bold rounded-2xl py-5 pl-14 pr-6 outline-none transition-all appearance-none cursor-pointer"
                                        required
                                    >
                                        <option value="1-10">1-10 Members</option>
                                        <option value="11-50">11-50 Members</option>
                                        <option value="51-200">51-200 Members</option>
                                        <option value="201-500">201-500 Members</option>
                                        <option value="501-1000">501-1000 Members</option>
                                        <option value="1000+">1000+ Members</option>
                                    </select>
                                    <ChevronDown className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-300 pointer-events-none" size={18} />
                                </div>
                            </div>

                            <div className="space-y-3 md:col-span-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Structural Framework</label>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    {companyTypes.map(type => (
                                        <button
                                            type="button"
                                            key={type}
                                            onClick={() => setFormData({ ...formData, companyType: type })}
                                            className={`py-4 px-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${formData.companyType === type
                                                ? 'bg-black text-white border-black shadow-xl scale-105'
                                                : 'bg-slate-50 text-slate-400 border-transparent hover:border-slate-100 hover:bg-white hover:text-black'
                                                }`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.section>

                    {/* Operational Narrative */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-slate-100 rounded-[3.5rem] p-10 lg:p-16 shadow-sm hover:shadow-xl transition-all group"
                    >
                        <div className="flex items-center gap-6 mb-12">
                            <div className="p-5 bg-blue-50 text-blue-600 rounded-3xl group-hover:bg-blue-600 group-hover:text-white transition-all">
                                <Target size={28} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-black">Mission Statement</h2>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Refining the narrative</p>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Corporate Mandate & Vision *</label>
                            <textarea
                                name="about"
                                value={formData.about}
                                onChange={handleChange}
                                placeholder="Articulate your company's vision, culture, and technological stack..."
                                rows="6"
                                className="w-full bg-slate-50 border border-transparent focus:border-black/5 focus:bg-white text-black font-bold rounded-[2rem] py-8 px-10 outline-none transition-all placeholder:text-slate-300 resize-none leading-relaxed"
                                required
                            />
                        </div>
                    </motion.section>

                    {/* Domain Expertise */}
                    <motion.section
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-white border border-slate-100 rounded-[3.5rem] p-10 lg:p-16 shadow-sm hover:shadow-xl transition-all group"
                    >
                        <div className="flex items-center gap-6 mb-12">
                            <div className="p-5 bg-emerald-50 text-emerald-600 rounded-3xl group-hover:bg-emerald-600 group-hover:text-white transition-all">
                                <Sparkles size={28} strokeWidth={2.5} />
                            </div>
                            <div>
                                <h2 className="text-2xl font-black text-black">Domain Expertise</h2>
                                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest mt-1">Market Positioning</p>
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4">
                            {industriesList.map((industry) => {
                                const isSelected = formData.industries.includes(industry);
                                return (
                                    <button
                                        type="button"
                                        key={industry}
                                        onClick={() => handleIndustryToggle(industry)}
                                        className={`px-8 py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border ${isSelected
                                            ? 'bg-emerald-600 text-white border-emerald-600 shadow-xl scale-105'
                                            : 'bg-slate-50 text-slate-400 border-transparent hover:border-slate-100 hover:bg-white hover:text-black'
                                            }`}
                                    >
                                        {industry}
                                    </button>
                                );
                            })}
                        </div>
                    </motion.section>

                    {/* Meta Insight */}
                    <div className="p-6 sm:p-10 bg-black text-white rounded-[2rem] sm:rounded-[3rem] shadow-2xl flex flex-col md:flex-row gap-8 items-start sm:items-center">
                        <div className="p-6 bg-white/10 rounded-[2rem]">
                            <Info className="text-white" size={32} />
                        </div>
                        <div>
                            <h4 className="text-xl font-black mb-2 tracking-tight">Trust Calibration</h4>
                            <p className="text-white/60 text-sm font-medium leading-relaxed max-w-xl">
                                High-fidelity organizational profiles correlate with a 40% increase in senior-level engagement. Ensure all parameters represent the latest strategic vision.
                            </p>
                        </div>
                        <div className="ml-auto">
                            <button
                                type="submit"
                                disabled={saving}
                                className="group flex items-center gap-4 px-12 py-6 bg-white hover:bg-blue-600 text-black hover:text-white rounded-[2rem] font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl active:scale-95 disabled:opacity-50"
                            >
                                {saving ? (
                                    <Loader2 size={18} className="animate-spin" />
                                ) : (
                                    <>
                                        Calibrate Identity
                                        <ArrowRight size={18} className="group-hover:translate-x-2 transition-transform" />
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                </form>
            </main>
        </RecruiterLayout>
    );
};

// Helper SVG for custom selects
const ChevronDown = ({ className, size }) => (
    <svg
        className={className}
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
    >
        <path d="m6 9 6 6 6-6" />
    </svg>
)

export default CompanyProfile;
