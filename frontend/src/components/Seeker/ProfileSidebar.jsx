import React from 'react';
import { useNavigate } from 'react-router-dom';
import { MapPin, Mail, Phone, Github, Linkedin, Globe, Edit3, CheckCircle2, Camera, Plus, X, Save, TrendingUp, ShieldCheck } from 'lucide-react';

const ProfileSidebar = ({ user, isEditable, onEdit, onPhotoUpload, onDeleteSkill, onAddSkill, onViewResume, theme = 'premium-dark' }) => {
    const navigate = useNavigate();
    const isPremium = theme === 'premium-dark';

    const calculateStrength = () => {
        if (!user) return 0;
        let score = 0;
        if (user.firstName && user.lastName) score += 5;
        if (user.photoUrl) score += 10;
        if (user.jobPreferences?.preferredRole || user.primarySkill) score += 10;
        if (user.aboutMe && user.aboutMe.length > 20) score += 10;
        if (user.location) score += 10;
        if (user.phoneNumber && user.phoneNumber !== '0000000000') score += 10; // Check against dummy
        if (user.primarySkill) score += 10;
        if (user.socialLinks?.github || user.socialLinks?.linkedin || user.socialLinks?.portfolio) score += 10;
        if (user.experience?.length > 0 || user.projects?.length > 0) score += 15;
        if (user.education?.length > 0) score += 10;
        return Math.min(score, 100);
    };

    const strength = calculateStrength();

    return (
        <div className="space-y-8">
            {/* Primary Profile Identity Card */}
            <div className={`relative overflow-hidden ${isPremium ? 'bg-slate-900/60 backdrop-blur-3xl border border-white/10 shadow-[0_40px_100px_rgba(0,0,0,0.4)]' : 'bg-white/80 backdrop-blur-2xl border border-white/40 shadow-[0_20px_50px_rgba(0,0,0,0.05)]'} rounded-[3rem] p-10 group`}>

                {/* Visual Accent */}
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/10 rounded-full blur-[80px] -mr-20 -mt-20 group-hover:bg-blue-600/20 transition-all duration-700" />
                <div className="absolute bottom-0 left-0 w-32 h-32 bg-indigo-600/5 rounded-full blur-[60px] -ml-16 -mb-16" />

                <div className="flex flex-col items-center text-center relative z-10">
                    <div className="relative mb-8 group/avatar cursor-pointer" onClick={onPhotoUpload}>
                        <div className={`w-40 h-40 rounded-full ring-8 ${isPremium ? 'ring-white/5' : 'ring-white'} shadow-[0_25px_60px_rgba(0,0,0,0.5)] overflow-hidden bg-slate-800 flex items-center justify-center transition-transform duration-700 group-hover/avatar:scale-[1.02]`}>
                            {user?.photoUrl ? (
                                <img
                                    src={user.photoUrl}
                                    alt="Profile"
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover/avatar:scale-110"
                                />
                            ) : (
                                <div className="text-6xl font-black bg-gradient-to-br from-blue-400 to-indigo-500 bg-clip-text text-transparent w-full h-full flex items-center justify-center uppercase">
                                    {user?.firstName?.charAt(0) || 'U'}
                                </div>
                            )}
                        </div>
                        {isEditable && (
                            <button
                                className="absolute bottom-2 right-2 p-4 bg-white text-slate-900 rounded-full shadow-[0_15px_30px_rgba(0,0,0,0.3)] transition-all hover:bg-blue-600 hover:text-white hover:scale-110 active:scale-90"
                            >
                                <Camera size={20} />
                            </button>
                        )}
                    </div>

                    <h2 className={`text-4xl font-black tracking-tight ${isPremium ? 'text-white' : 'text-slate-900'} mb-2`}>
                        {user?.firstName} {user?.lastName}
                    </h2>
                    <div className="px-5 py-2 bg-blue-600/10 border border-blue-500/20 text-blue-400 font-black text-[10px] tracking-[0.2em] uppercase rounded-xl mb-6 inline-block">
                        {user?.preferredRole || user?.jobPreferences?.preferredRole || user?.primarySkill || 'Set your primary role'}
                    </div>

                    <div className={`p-6 ${isPremium ? 'bg-white/5 border border-white/5' : 'bg-slate-50 border border-slate-100'} rounded-[2rem] w-full text-left mb-8 shadow-inner`}>
                        <p className={`text-sm leading-relaxed ${isPremium ? 'text-slate-400' : 'text-slate-500'} italic font-medium`}>
                            {user?.aboutMe ? `"${user.aboutMe}"` : "Add a brief bio about yourself to stand out."}
                        </p>
                    </div>
                </div>

                {/* Contact & Social Slabs */}
                <div className="space-y-3 mb-10 relative z-10">
                    {[
                        { icon: MapPin, text: user?.location || 'Location not set', label: 'BASED IN', missing: !user?.location },
                        { icon: Mail, text: user?.email, label: 'EMAIL', missing: !user?.email },
                        { icon: Phone, text: (user?.phoneNumber && user?.phoneNumber !== '0000000000') ? user.phoneNumber : 'Phone not set', label: 'SECURE', missing: (!user?.phoneNumber || user?.phoneNumber === '0000000000') }
                    ].map((item, i) => (
                        <div key={i} className={`flex items-center gap-5 p-4 ${isPremium ? 'hover:bg-white/5 border border-transparent hover:border-white/5' : 'hover:bg-white border border-transparent hover:border-slate-100'} rounded-2xl transition-all duration-300 group/item`}>
                            <div className={`w-12 h-12 rounded-xl ${isPremium ? 'bg-slate-800' : 'bg-slate-50'} flex items-center justify-center text-blue-500 group-hover/item:scale-110 transition-transform`}>
                                <item.icon size={20} />
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                    <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest">{item.label}</p>
                                    {isEditable && item.missing && (
                                        <button
                                            onClick={() => navigate('/seeker/profile-builder?section=basic')}
                                            className="px-2 py-0.5 bg-red-500/10 hover:bg-red-500 text-red-500 hover:text-white text-[8px] font-bold rounded-full transition-all flex items-center gap-1 animate-pulse"
                                        >
                                            <Edit3 size={8} /> FIX NOW
                                        </button>
                                    )}
                                </div>
                                <p className={`text-sm font-bold truncate ${isPremium ? 'text-slate-300' : 'text-slate-700'}`}>{item.text}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Profile Strength Indicator - New High-End Feature */}
                <div className="mb-10 p-6 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-[2rem] relative overflow-hidden group/strength">
                    <div className="absolute top-0 right-0 p-4 opacity-20 group-hover/strength:rotate-12 transition-transform duration-700">
                        <TrendingUp size={60} />
                    </div>
                    <div className="relative z-10">
                        <div className="flex justify-between items-end mb-4">
                            <h3 className="text-white font-black text-xs uppercase tracking-widest">Profile Strength</h3>
                            <span className="text-white font-black text-2xl tracking-tighter">{strength}%</span>
                        </div>
                        <div className="h-2 w-full bg-white/20 rounded-full overflow-hidden">
                            <div
                                className={`h-full bg-white rounded-full shadow-[0_0_15px_rgba(255,255,255,0.5)] transition-all duration-1000 ease-out`}
                                style={{ width: `${strength}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* Skills Master Section */}
                <div className="mb-10 relative z-10">
                    <div className="flex items-center justify-between mb-6 px-4">
                        <h3 className={`text-[10px] font-black ${isPremium ? 'text-slate-500' : 'text-slate-400'} uppercase tracking-[0.3em]`}>Core Tech Stack</h3>
                        {isEditable && <button onClick={onAddSkill} className="w-8 h-8 flex items-center justify-center bg-blue-600 text-white rounded-lg hover:scale-110 active:scale-95 transition-all shadow-lg"><Plus size={16} /></button>}
                    </div>
                    <div className="flex flex-wrap gap-2.5 px-2">
                        {user?.primarySkill ? (
                            user.primarySkill.split(',').map((skill, idx) => (
                                <div key={idx} className={`flex items-center gap-2 px-4 py-2 ${isPremium ? 'bg-white/5 border-white/5 text-slate-300 hover:border-blue-500/50' : 'bg-white border-slate-100 text-slate-700 hover:border-blue-300'} border rounded-xl text-xs font-black shadow-sm transition-all duration-300 group/skill`}>
                                    {skill.trim()}
                                    {isEditable && (
                                        <X
                                            size={14}
                                            onClick={() => onDeleteSkill(skill.trim())}
                                            className="text-slate-500 hover:text-red-500 cursor-pointer opacity-0 group-hover/skill:opacity-100 transition-all"
                                        />
                                    )}
                                </div>
                            ))
                        ) : (
                            <div className="px-4 py-2 text-slate-600 italic text-xs">No skills added yet</div>
                        )}
                    </div>
                </div>

                {/* Action Column */}
                <div className="flex flex-col gap-3 relative z-10">
                    <div className="flex items-center gap-4 justify-center mb-6">
                        {[
                            { icon: Github, url: user?.socialLinks?.github },
                            { icon: Linkedin, url: user?.socialLinks?.linkedin },
                            { icon: Globe, url: user?.socialLinks?.portfolio }
                        ].map((social, i) => social.url && (
                            <a key={i} href={social.url} target="_blank" rel="noopener noreferrer" className={`w-14 h-14 ${isPremium ? 'bg-white/5 border-white/5 text-slate-400 hover:text-white' : 'bg-slate-50 border-slate-100 text-slate-500'} border rounded-2xl flex items-center justify-center transition-all hover:border-blue-500 hover:-translate-y-2 shadow-xl`}>
                                <social.icon size={24} />
                            </a>
                        ))}
                    </div>

                    {isEditable && (
                        <button
                            onClick={onEdit}
                            className="w-full py-5 bg-white text-slate-900 font-extrabold rounded-[1.75rem] shadow-2xl transition-all hover:scale-[1.03] active:scale-[0.98] flex items-center justify-center gap-3 uppercase tracking-[0.2em] text-xs"
                        >
                            <Save size={18} />
                            Commit Updates
                        </button>
                    )}
                </div>
            </div>

            {/* Verification Badge & Resume Download */}
            <div className="space-y-4">
                <div className={`p-8 ${isPremium ? 'bg-slate-900/60 backdrop-blur-3xl border border-white/10' : 'bg-white/80'} rounded-[3rem] shadow-2xl group`}>
                    <div className="flex items-center gap-6">
                        <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 flex items-center justify-center text-emerald-500 border border-emerald-500/20 group-hover:scale-110 transition-transform duration-500">
                            <ShieldCheck size={32} />
                        </div>
                        <div>
                            <h4 className="text-white font-black text-sm tracking-tight mb-1">Identity Verified</h4>
                            <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">Tier 1 Professional</p>
                        </div>
                    </div>
                </div>

                {user?.resumeUrl && (
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            onViewResume && onViewResume();
                        }}
                        className={`w-full p-6 ${isPremium ? 'bg-blue-600 hover:bg-blue-500 text-white' : 'bg-blue-600 text-white'} rounded-[2.5rem] flex items-center justify-between group transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1`}
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-white/20 rounded-2xl flex items-center justify-center">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" /><polyline points="7 10 12 15 17 10" /><line x1="12" x2="12" y1="15" y2="3" /></svg>
                            </div>
                            <div className="text-left">
                                <p className="font-black text-xs uppercase tracking-widest opacity-80">Curriculum Vitae</p>
                                <p className="font-bold text-sm">Download Resume</p>
                            </div>
                        </div>
                        <div className="w-10 h-10 bg-white text-blue-600 rounded-full flex items-center justify-center font-bold group-hover:scale-110 transition-transform">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M5 12h14" /><path d="m12 5 7 7-7 7" /></svg>
                        </div>
                    </button>
                )}
            </div>
        </div>
    );
};

export default ProfileSidebar;
