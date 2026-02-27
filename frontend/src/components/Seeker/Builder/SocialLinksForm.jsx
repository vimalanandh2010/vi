import React from 'react';
import { Linkedin, Github, Globe, Link2 } from 'lucide-react';

import { useAutoSave } from '../../../hooks/useAutoSave';

const SocialLinksForm = ({ user, onUpdate }) => {
    const autoSave = useAutoSave('jobseeker/profile');

    const handleUpdate = (field, value) => {
        const currentLinks = user?.socialLinks || {};
        const updatedSocial = { ...currentLinks, [field]: value };

        const updatedUser = { ...user, socialLinks: updatedSocial };
        onUpdate(updatedUser);

        // Debounced autosave
        autoSave({ socialLinks: updatedSocial });
    };

    const platforms = [
        { id: 'linkedin', label: 'LinkedIn', icon: Linkedin, color: 'text-blue-400', placeholder: 'https://linkedin.com/in/...' },
        { id: 'github', label: 'GitHub', icon: Github, color: 'text-slate-200', placeholder: 'https://github.com/...' },
        { id: 'portfolio', label: 'Portfolio', icon: Globe, color: 'text-teal-400', placeholder: 'https://your-portfolio.com' },
    ];

    return (
        <div className="max-w-4xl space-y-10">
            <div className="bg-indigo-500/5 border border-indigo-500/10 rounded-2xl p-6 mb-8">
                <p className="text-indigo-400 text-sm font-medium leading-relaxed">
                    <span className="font-black">Direct Access:</span> Connecting your professional circles helps recruiters verify your work and connect with you faster.
                </p>
            </div>

            <div className="grid grid-cols-1 gap-8">
                {platforms.map((platform) => {
                    const Icon = platform.icon;
                    return (
                        <div key={platform.id} className="space-y-3">
                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1 flex items-center gap-2">
                                <Icon size={14} className={platform.color} />
                                {platform.label}
                            </label>
                            <div className="relative group">
                                <div className={`absolute left-4 top-1/2 -translate-y-1/2 transition-colors ${platform.color} opacity-50 group-focus-within:opacity-100`}>
                                    <Link2 size={18} />
                                </div>
                                <input
                                    value={user?.socialLinks?.[platform.id] || ''}
                                    onChange={(e) => handleUpdate(platform.id, e.target.value)}
                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-5 pl-12 pr-4 text-white placeholder:text-slate-600 focus:border-indigo-500/50 focus:bg-indigo-500/5 transition-all outline-none font-bold italic"
                                    placeholder={platform.placeholder}
                                />
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default SocialLinksForm;
