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
            <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6 mb-8">
                <p className="text-blue-700 text-sm font-medium leading-relaxed">
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
                    className="w-full bg-slate-50 border border-gray-200 rounded-3xl py-6 px-8 text-black placeholder:text-gray-400 focus:border-blue-500/50 focus:bg-blue-50 transition-all outline-none font-medium leading-relaxed resize-none custom-scrollbar"
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
                        className="p-3 bg-white border border-gray-200 rounded-xl text-[10px] font-black text-gray-500 uppercase tracking-widest hover:bg-gray-50 hover:text-gray-900 transition-all text-center"
                    >
                        + {tag}
                    </button>
                ))}
            </div>
        </div>
    );
};

export default SummaryForm;
