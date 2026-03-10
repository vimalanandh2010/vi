import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    User,
    FileText,
    Cpu,
    GraduationCap,
    Briefcase,
    Layers,
    Upload,
    Settings,
    CheckCircle2,
    Save,
    Eye,
    ChevronRight,
    Loader2,
    Share2,
    Target,
    Award
} from 'lucide-react';
import Navbar from '../../components/Navbar';
import axiosClient from '../../api/axiosClient';
import { toast } from 'react-toastify';

// Import sub-components
import BasicInfoForm from '../../components/Seeker/Builder/BasicInfoForm';
import SummaryForm from '../../components/Seeker/Builder/SummaryForm';
import SkillManager from '../../components/Seeker/Builder/SkillManager';
import TimelineManager from '../../components/Seeker/Builder/TimelineManager';
import ProjectsManager from '../../components/Seeker/Builder/ProjectsManager';
import MilestonesManager from '../../components/Seeker/Builder/MilestonesManager';
import ResumeUpload from '../../components/Seeker/Builder/ResumeUpload';
import PreferencesForm from '../../components/Seeker/Builder/PreferencesForm';
import SocialLinksForm from '../../components/Seeker/Builder/SocialLinksForm';
import { useSearchParams, useNavigate } from 'react-router-dom';

const ProfileBuilder = () => {
    const navigate = useNavigate();
    const [searchParams, setSearchParams] = useSearchParams();
    const sectionParam = searchParams.get('section');
    const [activeSection, setActiveSection] = useState(sectionParam || 'basic');
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [completion, setCompletion] = useState(0);
    const containerRef = useRef(null);

    // Dynamic sections based on experience level
    const getExperienceSection = () => {
        if (user?.experienceLevel === 'fresher') {
            return { id: 'experience', label: 'Internships', icon: Briefcase, color: 'text-emerald-500' };
        }
        return { id: 'experience', label: 'Experience', icon: Briefcase, color: 'text-emerald-500' };
    };

    const sections = [
        { id: 'basic', label: 'Basic Info', icon: User, color: 'text-blue-500' },
        { id: 'summary', label: 'Summary', icon: FileText, color: 'text-indigo-500' },
        { id: 'skills', label: 'Skills', icon: Cpu, color: 'text-teal-500' },
        { id: 'education', label: 'Education', icon: GraduationCap, color: 'text-amber-500' },
        getExperienceSection(),
        { id: 'projects', label: 'Projects', icon: Layers, color: 'text-purple-500' },
        { id: 'milestones', label: 'Milestones & Certs', icon: Award, color: 'text-amber-400' },
        { id: 'social', label: 'Social & Links', icon: Share2, color: 'text-blue-400' },
        { id: 'resume', label: 'Resume', icon: Upload, color: 'text-slate-400' },
        { id: 'preferences', label: 'Preferences', icon: Settings, color: 'text-slate-500' },
    ];

    useEffect(() => {
        if (sectionParam && sections.some(s => s.id === sectionParam)) {
            setActiveSection(sectionParam);
        }
    }, [sectionParam]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                const res = await axiosClient.get('jobseeker/profile');
                setUser(res);
                calculateCompletion(res);
            } catch (err) {
                toast.error("Failed to load profile data");
            } finally {
                setLoading(false);
            }
        };
        fetchUserData();
    }, []);

    const calculateCompletion = (data) => {
        if (!data) return;
        let score = 0;
        const weights = {
            basic: (data.firstName && data.photoUrl && data.location) ? 15 : 5,
            summary: data.aboutMe?.length > 50 ? 10 : 0,
            skills: (data.primarySkill?.split(',').filter(Boolean).length >= 3) ? 15 : 5,
            education: (data.education?.length > 0) ? 10 : 0,
            experience: (data.experience?.length > 0) ? 10 : 0,
            projects: (data.projects?.length > 0) ? 10 : 0,
            milestones: (data.accomplishments?.length > 0 || data.certifications?.length > 0) ? 10 : 0,
            social: (data.socialLinks?.linkedin || data.socialLinks?.github) ? 10 : 0,
            resume: data.resumeUrl ? 10 : 0,
        };
        score = Object.values(weights).reduce((a, b) => a + b, 0);
        setCompletion(Math.min(score, 100));
    };

    const handleSectionChange = (id) => {
        setActiveSection(id);
        if (containerRef.current) {
            containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    };

    const handleSync = async () => {
        setLoading(true);
        try {
            await axiosClient.put('jobseeker/profile', user);
            toast.success("Synchronized with Cloud!");
            calculateCompletion(user);
            setTimeout(() => {
                navigate('/seeker/dashboard');
            }, 1000);
        } catch (err) {
            toast.error("Sync failed");
        } finally {
            setLoading(false);
        }
    };

    if (loading && !user) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-outfit selection:bg-blue-500/30">
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100;300;400;500;600;700;800;900&display=swap');
                    .font-outfit { font-family: 'Outfit', sans-serif; }
                    .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                    .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                    .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(0,0,0,0.1); border-radius: 10px; }
                    .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: rgba(0,0,0,0.2); }
                `}
            </style>
            <Navbar />

            <div className="max-w-[1600px] mx-auto px-6 py-10 grid grid-cols-12 gap-8 relative">

                {/* Left Side: Stepper Navigation (Sticky) */}
                <div className="col-span-12 lg:col-span-3">
                    <div className="sticky top-24 space-y-6">
                        <div className="bg-white border-2 border-gray-200 rounded-3xl p-8 shadow-md relative overflow-hidden">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl -mr-16 -mt-16" />

                            <div className="mb-8 text-center">
                                <h2 className="text-2xl font-black text-gray-900 tracking-tight mb-2">My Profile</h2>
                                <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">Manage your professional identity</p>
                            </div>

                            {/* Completion Meter */}
                            <div className="mb-8 p-6 bg-slate-50 rounded-[2rem] border-2 border-gray-100">
                                <div className="flex justify-between items-end mb-4">
                                    <div className="flex items-center gap-2">
                                        <Target size={12} className="text-blue-500" />
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Strength</span>
                                    </div>
                                    <span className="text-gray-900 font-black text-2xl tracking-tighter">{completion}%</span>
                                </div>
                                <div className="h-2 w-full bg-gray-200 rounded-full overflow-hidden">
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${completion}%` }}
                                        className="h-full bg-gradient-to-r from-blue-500 to-teal-400 rounded-full shadow-[0_0_15px_rgba(59,130,246,0.5)]"
                                    />
                                </div>
                                <p className="text-[10px] font-bold text-blue-400 mt-4 text-center italic hover:scale-105 transition-transform cursor-default">
                                    “Complete your skills to be seen 5x more!”
                                </p>
                            </div>

                            {/* Stepper Steps */}
                            <nav className="space-y-1.5 max-h-[500px] overflow-y-auto custom-scrollbar pr-2">
                                {sections.map((section) => {
                                    const Icon = section.icon;
                                    const isActive = activeSection === section.id;
                                    return (
                                        <button
                                            key={section.id}
                                            onClick={() => handleSectionChange(section.id)}
                                            className={`w-full group flex items-center justify-between p-3.5 rounded-2xl transition-all duration-300 ${isActive
                                                ? 'bg-blue-50 text-blue-600 scale-[1.02] border border-blue-200'
                                                : 'text-gray-500 hover:bg-gray-100 hover:text-black'
                                                }`}
                                        >
                                            <div className="flex items-center gap-3">
                                                <div className={`p-2 rounded-xl transition-colors ${isActive ? 'bg-blue-100 text-blue-600' : `bg-gray-100 ${section.color}`}`}>
                                                    <Icon size={16} />
                                                </div>
                                                <span className={`text-[13px] font-black tracking-tight ${isActive ? 'text-blue-700' : 'text-black'}`}>
                                                    {section.label}
                                                </span>
                                            </div>
                                            {isActive ? (
                                                <ChevronRight size={14} className="text-blue-500" strokeWidth={3} />
                                            ) : (
                                                <div className={`w-1 h-1 rounded-full bg-gray-300 transition-all ${section.color} group-hover:scale-150`} />
                                            )}
                                        </button>
                                    );
                                })}
                            </nav>

                        </div>
                    </div>
                </div>

                {/* Right Side: Section Editor */}
                <div className="col-span-12 lg:col-span-9" ref={containerRef}>
                    <div className="bg-white border-2 border-gray-200 rounded-[3rem] min-h-[85vh] shadow-lg relative overflow-hidden flex flex-col">
                        <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/5 rounded-full blur-[140px] -mr-80 -mt-80 pointer-events-none" />

                        {/* Section Header */}
                        <div className="px-12 py-10 border-b border-gray-100 flex items-center justify-between sticky top-0 bg-white/90 backdrop-blur-xl z-40">
                            <div>
                                <h1 className="text-3xl font-black text-black tracking-tighter">
                                    {sections.find(s => s.id === activeSection)?.label}
                                </h1>
                                <p className="text-gray-500 text-sm font-medium mt-1">Configure your professional details for {sections.find(s => s.id === activeSection)?.label.toLowerCase()}.</p>
                            </div>
                            <div className="flex gap-4">

                                <button
                                    onClick={handleSync}
                                    disabled={loading}
                                    className="px-6 py-3 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest shadow-[0_10px_20px_rgba(0,0,0,0.3)] hover:bg-gray-800 hover:scale-105 active:scale-95 transition-all flex items-center gap-2 disabled:opacity-50"
                                >
                                    {loading ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                                    Save
                                </button>
                            </div>
                        </div>

                        {/* Rendering Active Section */}
                        <div className="flex-1 p-12 overflow-y-auto custom-scrollbar">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={activeSection}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -20 }}
                                    transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
                                >
                                    {activeSection === 'basic' && <BasicInfoForm user={user} onUpdate={setUser} />}
                                    {activeSection === 'summary' && <SummaryForm user={user} onUpdate={setUser} />}
                                    {activeSection === 'skills' && <SkillManager user={user} onUpdate={setUser} />}
                                    {activeSection === 'education' && <TimelineManager type="education" user={user} onUpdate={setUser} />}
                                    {activeSection === 'experience' && <TimelineManager type="experience" user={user} onUpdate={setUser} experienceLevel={user?.experienceLevel} />}
                                    {activeSection === 'projects' && <ProjectsManager user={user} onUpdate={setUser} />}
                                    {activeSection === 'milestones' && <MilestonesManager user={user} onUpdate={setUser} />}
                                    {activeSection === 'social' && <SocialLinksForm user={user} onUpdate={setUser} />}
                                    {activeSection === 'resume' && <ResumeUpload user={user} onUpdate={setUser} />}
                                    {activeSection === 'preferences' && <PreferencesForm user={user} onUpdate={setUser} />}
                                </motion.div>
                            </AnimatePresence>
                        </div>


                    </div>
                </div>
            </div>
        </div>
    );
};

export default ProfileBuilder;
