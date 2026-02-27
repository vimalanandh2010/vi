import React from 'react';
import axiosClient from '../../../api/axiosClient';

import { useAutoSave } from '../../../hooks/useAutoSave';

const SummaryForm = ({ user, onUpdate }) => {
    const charLimit = 600;
    const autoSave = useAutoSave('jobseeker/profile');

    const handleTextChange = (e) => {
        const value = e.target.value;
        if (value.length > charLimit) return;

        const updatedUser = { ...user, aboutMe: value };
        onUpdate(updatedUser);

        autoSave({ aboutMe: value });
    };

    return (
        <div className="space-y-8 max-w-4xl">
            <div className="bg-blue-500/5 border border-blue-500/10 rounded-2xl p-6 mb-8">
                <p className="text-blue-400 text-sm font-medium leading-relaxed">
                    <span className="font-black">Pro Tip:</span> Your summary is the first thing recruiters read. Focus on your unique value proposition, key achievements, and what you’re looking for in your next role.
                </p>
            </div>

            <div className="space-y-4">
                <div className="flex justify-between items-end">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Professional Bio</label>
                    <span className={`text-[10px] font-black tracking-widest ${user?.aboutMe?.length > charLimit * 0.9 ? 'text-amber-500' : 'text-slate-600'}`}>
                        {user?.aboutMe?.length || 0} / {charLimit}
                    </span>
                </div>
                <textarea
                    value={user?.aboutMe || ''}
                    onChange={handleTextChange}
                    className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-8 text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-blue-50/5 transition-all outline-none font-medium text-lg leading-relaxed min-h-[300px]"
                    placeholder="Write a compelling summary of your career journey..."
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {['Impact-driven', 'Scalable Solutions', 'Cross-functional'].map((tag) => (
                    <button
                        key={tag}
                        onClick={() => {
                            const newText = (user?.aboutMe || '') + (user?.aboutMe ? ' ' : '') + tag;
                            handleTextChange({ target: { value: newText.slice(0, charLimit) } });
                        }}
                        className="p-3 bg-white/5 border border-white/5 rounded-xl text-[10px] font-black text-slate-500 uppercase tracking-widest hover:bg-white/10 transition-all text-center"
                    >
                        + {tag}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SummaryForm;
