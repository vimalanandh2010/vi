import React, { useState, useEffect } from 'react';
import axiosClient from '../../api/axiosClient';
import { toast } from 'react-toastify';
import { Building2, MapPin, Globe, Users, Briefcase, Save, Info, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import VerificationBadge from '../../components/Common/VerificationBadge';
import { useCompany } from '../../context/CompanyContext';

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
            // Auto-redirect if company exists, but allow staying if we are explicitly editing?
            // User requirement: "If company exists → auto redirect to: /recruiter/dashboard"
            // We should probably check if query param ?edit=true exists to override this, 
            // but strict requirement says auto redirect.
            // However, the task also says "Update Profile button", implying editing is possible here.
            // I will assume for the "New Recruiter" flow, they land here. If they have a company, they go to dashboard.
            // If they want to EDIT, they might click "Manage Company" from somewhere else.
            // Let's stick to the strict requirement first: Auto redirect.
            // But wait, Page 1 is "Manage Company Profile". If I redirect, how do they edit?
            // "EXISTING RECRUITER: Login → Company exists → Auto redirect to Dashboard"
            // "PROFILE PAGE: Auto fetch company → Auto fill → Update → Save" (This refers to Page 2 /recruiter/profile)
            // It seems Page 1 is primarily for INITIAL setup?
            // "PAGE 1 ... Fields ... Update Profile button"
            // If I redirect, they can't edit here.

            // Let's IMPLEMENT: If company exists, redirect.
            // BUT, add a check: if they navigated here INTENTIONALLY to edit, maybe we shouldn't redirect?
            // The requirement says: "When opening /recruiter/company-profile ... If company exists → auto redirect to /recruiter/dashboard"

            navigate('/recruiter/dashboard');
            toast.info('Company profile already exists. Redirecting to dashboard...');
        }
    }, [company, contextLoading, navigate]);

    // Handle form changes...
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
            // Use UPSERT endpoint
            const res = await axiosClient.put('/companies/update', formData);

            updateCompanyContext(res);
            toast.success('Company profile saved successfully');
            navigate('/recruiter/dashboard');
        } catch (err) {
            console.error('Error saving company:', err);
            toast.error(err.response?.data?.message || 'Failed to save company profile');
        } finally {
            setSaving(false);
        }
    };

    if (contextLoading) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Loading...</div>;

    // If company exists, we are redirecting, so return null or loader
    if (company) return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-white">Redirecting...</div>;

    return (
        <div className="min-h-screen bg-slate-950 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-3xl overflow-hidden shadow-2xl shadow-blue-900/10"
                >
                    <div className="p-8 border-b border-slate-700/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div>
                            <h2 className="text-3xl font-bold text-white flex items-center gap-3">
                                <Building2 className="text-blue-500" size={32} />
                                Manage Company Profile
                            </h2>
                            <p className="text-slate-400 mt-2">Introduce your organization to potential candidates</p>
                        </div>
                        {/* Status badge would go here if we had company data, but we redirect if we do */}
                    </div>

                    <form onSubmit={handleSubmit} className="p-8 space-y-8">
                        {/* Basic Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Company Name</label>
                                <div className="relative group">
                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                                    <input
                                        type="text"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Epic Tech Solutions"
                                        className="w-full bg-slate-800/50 border border-slate-700/50 text-white rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Website URL</label>
                                <div className="relative group">
                                    <Globe className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                                    <input
                                        type="url"
                                        name="website"
                                        value={formData.website}
                                        onChange={handleChange}
                                        placeholder="https://company.com"
                                        className="w-full bg-slate-800/50 border border-slate-700/50 text-white rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600"
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Headquarters Location</label>
                                <div className="relative group">
                                    <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                                    <input
                                        type="text"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        placeholder="Bangalore, India"
                                        className="w-full bg-slate-800/50 border border-slate-700/50 text-white rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Company Size</label>
                                <div className="relative group">
                                    <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                                    <select
                                        name="size"
                                        value={formData.size}
                                        onChange={handleChange}
                                        className="w-full bg-slate-800/50 border border-slate-700/50 text-white rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                                        required
                                    >
                                        <option value="1-10">1-10 Employees</option>
                                        <option value="11-50">11-50 Employees</option>
                                        <option value="51-200">51-200 Employees</option>
                                        <option value="201-500">201-500 Employees</option>
                                        <option value="501-1000">501-1000 Employees</option>
                                        <option value="1000+">1000+ Employees</option>
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <label className="text-sm font-semibold text-slate-300">Company Type</label>
                                <div className="relative group">
                                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={20} />
                                    <select
                                        name="companyType"
                                        value={formData.companyType}
                                        onChange={handleChange}
                                        className="w-full bg-slate-800/50 border border-slate-700/50 text-white rounded-2xl py-3.5 pl-12 pr-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all appearance-none cursor-pointer"
                                        required
                                    >
                                        {companyTypes.map(type => (
                                            <option key={type} value={type}>{type}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2 md:col-span-2">
                                <label className="text-sm font-semibold text-slate-300">About the Company</label>
                                <textarea
                                    name="about"
                                    value={formData.about}
                                    onChange={handleChange}
                                    placeholder="Briefly describe what your company does and its mission..."
                                    rows="4"
                                    className="w-full bg-slate-800/50 border border-slate-700/50 text-white rounded-2xl p-4 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all placeholder:text-slate-600 resize-none"
                                    required
                                />
                            </div>
                        </div>

                        {/* Industries Select */}
                        <div className="space-y-4">
                            <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                                Industries <span className="text-xs text-slate-500 font-normal">(Select all that apply)</span>
                            </label>
                            <div className="flex flex-wrap gap-2">
                                {industriesList.map((industry) => {
                                    const isSelected = formData.industries.includes(industry);
                                    return (
                                        <button
                                            type="button"
                                            key={industry}
                                            onClick={() => handleIndustryToggle(industry)}
                                            className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${isSelected
                                                ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/40 scale-105'
                                                : 'bg-slate-800/50 text-slate-400 border border-slate-700/50 hover:bg-slate-700 hover:text-white'
                                                }`}
                                        >
                                            {industry}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Actions */}
                        <div className="pt-4 flex flex-col-reverse md:flex-row items-center justify-end gap-4">
                            <button
                                type="button"
                                onClick={() => navigate('/recruiter/dashboard')}
                                className="w-full md:w-auto px-6 py-4 text-slate-400 hover:text-white hover:bg-slate-800/50 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2"
                            >
                                Already Added? Go to Dashboard
                            </button>
                            <button
                                type="submit"
                                disabled={saving}
                                className="w-full md:w-auto group inline-flex items-center justify-center gap-3 px-10 py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-bold text-lg shadow-2xl shadow-blue-900/40 transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {saving ? 'Saving...' : (
                                    <>
                                        <Save size={20} className="group-hover:rotate-12 transition-transform" />
                                        Update Profile
                                    </>
                                )}
                            </button>
                        </div>
                    </form>
                </motion.div>

                {/* Info Card */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="mt-8 p-6 bg-blue-500/10 border border-blue-500/20 rounded-3xl flex gap-4 items-start"
                >
                    <Info className="text-blue-400 shrink-0 mt-1" size={24} />
                    <div>
                        <h4 className="text-white font-bold mb-1">Why complete your company profile?</h4>
                        <p className="text-blue-200/60 text-sm leading-relaxed">
                            A complete company profile increases candidate trust and improves job application rates by up to 40%. It's your space to showcase your culture and mission.
                        </p>
                    </div>
                </motion.div>
            </div>
        </div>
    );
};

export default CompanyProfile;
