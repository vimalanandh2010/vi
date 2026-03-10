import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Navbar from '../../components/Navbar';
import ProfileSidebar from '../../components/Seeker/ProfileSidebar';
import CollapsibleSection from '../../components/Seeker/CollapsibleSection';
import ExperienceTimeline from '../../components/Seeker/ExperienceTimeline';
import ProfileSkeleton from '../../components/Seeker/ProfileSkeleton';
import {
    Download,
    Mail,
    ExternalLink,
    GraduationCap,
    Award,
    ShieldCheck,
    Briefcase,
    Plus,
    Calendar,
    ChevronRight,
    Zap,
    Trophy,
    Target
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosClient from '../../api/axiosClient';
import { toast } from 'react-toastify';
import ResumeViewerModal from '../../components/ResumeViewerModal';

const Profile = () => {
    const navigate = useNavigate();
    const { user: authUser, updateUser } = useAuth();
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [showResumeModal, setShowResumeModal] = useState(false);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const res = await axiosClient.get('jobseeker/profile');
                setUser(res);
            } catch (err) {
                console.error("Failed to fetch profile", err);
                toast.error("Failed to load profile data");
            } finally {
                setLoading(false);
            }
        };
        fetchProfile();
    }, []);

    const handlePhotoUpload = async (e) => {
        const file = e?.target?.files?.[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('photo', file);

        try {
            const res = await axiosClient.post('jobseeker/photo', formData);
            setUser(prev => ({ ...prev, photoUrl: res.photoUrl }));
            updateUser('seeker', { photoUrl: res.photoUrl });
            toast.success("Photo updated!");
        } catch (err) {
            toast.error("Failed to upload photo");
        }
    };

    const handleDeleteSkill = async (skillToDelete) => {
        const currentSkills = user?.primarySkill?.split(',').map(s => s.trim()) || [];
        const updatedSkills = currentSkills.filter(s => s !== skillToDelete).join(', ');

        try {
            const res = await axiosClient.put('jobseeker/profile', { primarySkill: updatedSkills });
            setUser(res);
            updateUser('seeker', { primarySkill: updatedSkills });
            toast.success("Skill removed");
        } catch (err) {
            toast.error("Failed to update skills");
        }
    };

    const handleAddSkill = async () => {
        const newSkill = prompt("Enter new skill:");
        if (!newSkill) return;

        const currentSkills = user?.primarySkill?.split(',').map(s => s.trim()) || [];
        if (currentSkills.includes(newSkill)) {
            toast.info("Skill already exists");
            return;
        }

        const updatedSkills = [...currentSkills, newSkill].join(', ');

        try {
            const res = await axiosClient.put('jobseeker/profile', { primarySkill: updatedSkills });
            setUser(res);
            updateUser('seeker', { primarySkill: updatedSkills });
            toast.success("Skill added!");
        } catch (err) {
            toast.error("Failed to add skill");
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-white pb-20 overflow-x-hidden">
                <Navbar />
                <ProfileSkeleton />
            </div>
        );
    }

    const isEditable = true;

    return (
        <div className="min-h-screen bg-white text-gray-900 pb-20 overflow-x-hidden font-outfit">
            <style>
                {`
                    @import url('https://fonts.googleapis.com/css2?family=Outfit:wght@100;300;400;500;600;700;800;900&display=swap');
                    .font-outfit { font-family: 'Outfit', sans-serif; }
                `}
            </style>
            <Navbar />

            <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-12 pt-12 relative z-10">


                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* Left Sidebar - High-End Floating Column */}
                    <div className="lg:col-span-3 lg:sticky lg:top-24">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                        >
                            <input
                                type="file"
                                hidden
                                ref={fileInputRef}
                                onChange={handlePhotoUpload}
                                accept="image/*"
                            />
                            <ProfileSidebar
                                user={user}
                                isEditable={isEditable}
                                onEdit={() => navigate('/seeker/profile-builder')}
                                onPhotoUpload={() => fileInputRef.current.click()}
                                onDeleteSkill={handleDeleteSkill}
                                onAddSkill={handleAddSkill}
                                onViewResume={() => setShowResumeModal(true)}
                                theme="light"
                            />
                        </motion.div>
                    </div>

                    {/* Right Main Panel - Content Rich */}
                    <div className="lg:col-span-9 space-y-10">
                        <motion.div
                            initial={{ opacity: 0, x: 30 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ duration: 0.8, delay: 0.2, ease: [0.16, 1, 0.3, 1] }}
                            className="space-y-10"
                        >
                            {/* Premium Hero Card with Glass Depth */}
                            <div className="bg-white border-2 border-gray-200 shadow-md rounded-3xl p-12 relative overflow-hidden group">

                                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-6">
                                            <div className="w-12 h-1 bg-blue-600 rounded-full" />
                                            <span className="text-[10px] font-black text-blue-600 uppercase tracking-[0.5em]">Executive Summary</span>
                                            {isEditable && (
                                                <button
                                                    onClick={() => navigate('/seeker/profile-builder?section=summary')}
                                                    className="ml-auto px-3 py-2 bg-black hover:bg-gray-800 border border-black rounded-xl text-white transition-all"
                                                >
                                                    <span className="text-[10px] font-bold uppercase tracking-widest">Edit</span>
                                                </button>
                                            )}
                                        </div>

                                        {user?.aboutMe ? (
                                            <p className="text-xl lg:text-2xl font-medium text-gray-900 leading-relaxed tracking-tight mb-8">
                                                {user.aboutMe}
                                            </p>
                                        ) : (
                                            <div className="mb-8 p-6 bg-blue-50 border-2 border-blue-200 rounded-3xl">
                                                <p className="text-blue-900 font-medium italic mb-4">
                                                    "Your summary is your digital handshake. Write a compelling bio to stand out to recruiters."
                                                </p>
                                                <button
                                                    onClick={() => navigate('/seeker/profile-builder?section=summary')}
                                                    className="text-blue-600 font-bold hover:text-blue-700 transition-colors flex items-center gap-2"
                                                >
                                                    <Plus size={16} /> Add Summary
                                                </button>
                                            </div>
                                        )}

                                        <div className="grid grid-cols-2 gap-8 mt-12">
                                            {[
                                                { icon: Briefcase, label: 'EXP LEVEL', val: user?.experienceLevel || 'Fresher', color: 'text-blue-600' },
                                                { icon: Zap, label: 'AVAILABILITY', val: user?.jobPreferences?.availability || 'Immediate', color: 'text-amber-600' },
                                                { icon: Trophy, label: 'SKILLS', val: user?.primarySkill?.split(',').length + '+' || '0', color: 'text-emerald-600' },
                                                { icon: Target, label: 'LOCATION', val: user?.location?.split(',')[0] || 'Remote', color: 'text-purple-600' }
                                            ].map((stat, i) => (
                                                <div key={i} className="flex items-center gap-4 group/stat">
                                                    <div className={`w-12 h-12 rounded-2xl bg-gray-50 border-2 border-gray-200 flex items-center justify-center ${stat.color} group-hover/stat:scale-110 transition-transform duration-500`}>
                                                        <stat.icon size={20} />
                                                    </div>
                                                    <div>
                                                        <p className="text-gray-500 text-[9px] font-black uppercase tracking-widest">{stat.label}</p>
                                                        <p className="text-gray-900 font-bold text-lg">{stat.val}</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                </div>
                            </div>

                            {/* Section: Professional Trajectory */}
                            <div className="space-y-8">
                                <div className="flex items-end justify-between px-6">
                                    <div>
                                        <h3 className="text-3xl font-black text-gray-900 tracking-tight">
                                            {user?.experienceLevel === 'fresher' ? 'Projects & Internships' : 'Professional Trajectory'}
                                        </h3>
                                        <p className="text-gray-600 font-medium">
                                            {user?.experienceLevel === 'fresher' ? 'Academic ventures and early-stage impact' : 'Historical impact and role evolutions'}
                                        </p>
                                    </div>
                                    {isEditable && (
                                        <button
                                            onClick={() => navigate('/seeker/profile-builder')}
                                            className="p-4 bg-black hover:bg-gray-800 border-2 border-black rounded-2xl text-white transition-all duration-500 shadow-md"
                                        >
                                            <Plus size={24} />
                                        </button>
                                    )}
                                </div>

                                <div className="space-y-6">
                                    {user?.experienceLevel === 'fresher' ? (
                                        <div className="grid grid-cols-1 gap-6">
                                            {/* Projects for Freshers */}
                                            {user?.projects?.length > 0 ? (
                                                <div className="bg-white border-2 border-gray-200 rounded-3xl p-10 shadow-md">
                                                    <div className="flex items-center justify-between mb-6">
                                                        <h4 className="text-gray-600 text-[10px] font-black uppercase tracking-[0.2em]">Featured Projects</h4>
                                                        <button onClick={() => navigate('/seeker/profile-builder?section=projects')} className="p-2 bg-black hover:bg-gray-800 border-2 border-black rounded-xl text-white transition-all"><Plus size={16} /></button>
                                                    </div>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        {user.projects.map((proj, idx) => (
                                                            <div key={idx} className="p-8 bg-gray-50 border-2 border-gray-200 rounded-2xl hover:border-blue-600 transition-all group hover:shadow-md">
                                                                <div className="flex justify-between items-start mb-4">
                                                                    <h5 className="text-xl font-black text-gray-900">{proj.title}</h5>
                                                                    {proj.link && (
                                                                        <a href={proj.link} target="_blank" rel="noopener noreferrer" className="text-gray-500 hover:text-blue-600 transition-colors">
                                                                            <ExternalLink size={18} />
                                                                        </a>
                                                                    )}
                                                                </div>
                                                                <p className="text-gray-600 text-sm font-medium mb-6 line-clamp-3">{proj.description}</p>
                                                                <div className="flex flex-wrap gap-2">
                                                                    {proj.technologies?.map((tech, i) => (
                                                                        <span key={i} className="px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black rounded-lg border-2 border-blue-200">{tech}</span>
                                                                    ))}
                                                                </div>
                                                            </div>
                                                        ))}
                                                    </div>
                                                </div>
                                            ) : (
                                                <div className="bg-white border-2 border-gray-200 rounded-3xl p-10 text-center shadow-md">
                                                    <button onClick={() => navigate('/seeker/profile-builder?section=projects')} className="flex flex-col items-center gap-4 group">
                                                        <div className="p-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-full group-hover:bg-blue-50 group-hover:border-blue-500 transition-all">
                                                            <Plus size={32} className="text-gray-400 group-hover:text-blue-600" />
                                                        </div>
                                                        <span className="text-gray-600 font-bold group-hover:text-blue-600 transition-all">Share your impact! Add your first project.</span>
                                                    </button>
                                                </div>
                                            )}

                                            {/* Internships for Freshers */}
                                            <div className="bg-white border-2 border-gray-200 rounded-3xl p-10 shadow-md">
                                                <div className="flex items-center justify-between mb-6">
                                                    <h4 className="text-gray-600 text-[10px] font-black uppercase tracking-[0.2em]">Internship Experience</h4>
                                                    <button onClick={() => navigate('/seeker/profile-builder?section=experience')} className="p-2 bg-blue-600 hover:bg-blue-700 border-2 border-blue-600 rounded-xl text-white transition-all"><Plus size={16} /></button>
                                                </div>
                                                {user?.experience?.filter(exp => exp.type === 'internship').length > 0 ? (
                                                    <ExperienceTimeline
                                                        experiences={user?.experience?.filter(exp => exp.type === 'internship')}
                                                        theme="light"
                                                    />
                                                ) : (
                                                    <div className="text-center py-6 border-2 border-dashed border-gray-300 rounded-3xl">
                                                        <p className="text-gray-500 italic text-sm">No internship data added</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        /* Default for Experienced: Standard Timeline */
                                        <div className="bg-white border-2 border-gray-200 rounded-3xl p-10 shadow-md">
                                            <div className="flex items-center justify-between mb-6">
                                                <h4 className="text-gray-600 text-[10px] font-black uppercase tracking-[0.2em]">Work Experience</h4>
                                                <button onClick={() => navigate('/seeker/profile-builder?section=experience')} className="p-2 bg-blue-600 hover:bg-blue-700 border-2 border-blue-600 rounded-xl text-white transition-all"><Plus size={16} /></button>
                                            </div>
                                            <ExperienceTimeline experiences={user?.experience?.filter(exp => exp.type === 'job' || !exp.type) || []} theme="light" />
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 gap-8">
                                <CollapsibleSection
                                    title="Academic Foundation"
                                    icon={GraduationCap}
                                    defaultOpen={true}
                                    theme="light"
                                    action={
                                        <button onClick={() => navigate('/seeker/profile-builder?section=education')} className="p-2 bg-blue-600 hover:bg-blue-700 border-2 border-blue-600 rounded-xl text-white transition-all"><Plus size={16} /></button>
                                    }
                                >
                                    <div className="grid grid-cols-1 gap-6">
                                        {user?.education?.length > 0 ? (
                                            ['Graduation', '12th', '10th', 'Other'].map((lvl) => {
                                                const filteredEdu = user.education.filter(e => e.level === lvl || (lvl === 'Other' && !['10th', '12th', 'Graduation'].includes(e.level)));
                                                return filteredEdu.map((edu, idx) => (
                                                    <div key={`${lvl}-${idx}`} className="group relative p-10 bg-white border-2 border-gray-200 rounded-3xl hover:border-blue-600 transition-all duration-700 shadow-md hover:shadow-lg">
                                                        <div className="flex flex-wrap items-start justify-between gap-6">
                                                            <div className="flex gap-8">
                                                                <div className="w-20 h-20 rounded-3xl bg-blue-50 flex items-center justify-center text-4xl shadow-inner border-2 border-blue-200">
                                                                    {lvl === 'Graduation' ? '🎓' : lvl === '12th' ? '📜' : '📖'}
                                                                </div>
                                                                <div>
                                                                    <div className="inline-block px-3 py-1 bg-blue-50 text-blue-600 text-[10px] font-black tracking-widest uppercase rounded-lg mb-4 border-2 border-blue-200">{lvl}</div>
                                                                    <h4 className="text-2xl font-black text-gray-900 mb-2">{edu.degreeName}</h4>
                                                                    <p className="text-gray-600 font-bold text-lg">{edu.institutionName}</p>
                                                                </div>
                                                            </div>
                                                            <div className="flex flex-col gap-3 items-end">
                                                                <span className="px-6 py-3 bg-gray-50 border-2 border-gray-200 rounded-2xl text-gray-900 text-xs font-black tracking-widest">CLASS OF {edu.yearOfPassing}</span>
                                                                <span className="text-emerald-600 font-black text-lg">SCORE: {edu.score}</span>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ));
                                            })
                                        ) : (
                                            <div className="text-center p-12 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-300">
                                                <p className="text-gray-500 font-bold italic">Educational background details haven't been provided yet.</p>
                                            </div>
                                        )}
                                    </div>
                                </CollapsibleSection>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <CollapsibleSection
                                    title="Key Milestones"
                                    icon={Award}
                                    theme="light"
                                    action={
                                        <button onClick={() => navigate('/seeker/profile-builder?section=milestones')} className="p-2 bg-blue-600 hover:bg-blue-700 border-2 border-blue-600 rounded-xl text-white transition-all"><Plus size={16} /></button>
                                    }
                                >
                                    <div className="space-y-4">
                                        {user?.accomplishments?.length > 0 ? (
                                            user.accomplishments.map((acc, i) => (
                                                <div key={i} className="flex items-start gap-5 p-6 bg-white border-2 border-gray-200 rounded-3xl hover:border-blue-600 transition-all group cursor-default shadow-md hover:shadow-lg">
                                                    <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform font-black text-xs shrink-0 border-2 border-blue-200">
                                                        {acc.category === 'Hackathon' ? '🚀' : acc.category === 'Award' ? '🏆' : '⭐'}
                                                    </div>
                                                    <div>
                                                        <div className="text-[9px] font-black text-blue-600 uppercase tracking-widest mb-1">{acc.category}</div>
                                                        <p className="text-gray-900 font-black text-base">{acc.title}</p>
                                                        {acc.description && <p className="text-gray-600 text-xs font-medium mt-1">{acc.description}</p>}
                                                        {acc.date && <p className="text-gray-500 text-[10px] font-bold mt-2">{acc.date}</p>}
                                                    </div>
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-3xl text-center">
                                                <span className="text-gray-500 font-bold italic text-sm">No highlights noted yet.</span>
                                            </div>
                                        )}
                                    </div>
                                </CollapsibleSection>

                                <CollapsibleSection
                                    title="Certifications"
                                    icon={ShieldCheck}
                                    theme="light"
                                    action={
                                        <button onClick={() => navigate('/seeker/profile-builder?section=milestones')} className="p-2 bg-blue-600 hover:bg-blue-700 border-2 border-blue-600 rounded-xl text-white transition-all"><Plus size={16} /></button>
                                    }
                                >
                                    <div className="space-y-4">
                                        {user?.certifications?.length > 0 ? (
                                            user.certifications.map((cert, i) => (
                                                <div key={i} className="p-6 bg-white border-2 border-gray-200 rounded-3xl flex items-center justify-between group cursor-pointer hover:border-blue-600 transition-all shadow-md hover:shadow-lg">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center text-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-500 border-2 border-blue-200">🏆</div>
                                                        <div>
                                                            <h5 className="text-gray-900 font-black text-sm mb-1">{cert.name}</h5>
                                                            <p className="text-gray-600 text-[10px] font-black tracking-widest uppercase">{cert.issuer} • {cert.date}</p>
                                                        </div>
                                                    </div>
                                                    {cert.link && (
                                                        <a href={cert.link} target="_blank" rel="noopener noreferrer">
                                                            <ExternalLink size={18} className="text-gray-500 group-hover:text-blue-600" />
                                                        </a>
                                                    )}
                                                </div>
                                            ))
                                        ) : (
                                            <div className="p-6 bg-gray-50 border-2 border-dashed border-gray-300 rounded-3xl text-center">
                                                <span className="text-gray-500 font-bold italic text-sm">No certifications listed yet.</span>
                                            </div>
                                        )}
                                    </div>
                                </CollapsibleSection>
                            </div>
                        </motion.div>
                    </div>
                </div>
            </div>

            {/* Resume Viewer Modal */}
            <ResumeViewerModal
                isOpen={showResumeModal}
                onClose={() => setShowResumeModal(false)}
                resumeUrl={user?.resumeUrl}
                userName={user?.firstName || 'User'}
            />
        </div>
    );
};

export default Profile;
