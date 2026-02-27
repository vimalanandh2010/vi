import React from 'react';
import { Target, MapPin, DollarSign, Clock, CheckCircle2, TrendingUp } from 'lucide-react';

import { useAutoSave } from '../../../hooks/useAutoSave';

const PreferencesForm = ({ user, onUpdate }) => {
    const autoSave = useAutoSave('jobseeker/profile');

    const handleUpdate = (field, value) => {
        // Ensure jobPreferences exists to prevent crash if undefined
        const currentPrefs = user?.jobPreferences || {};
        const updatedPrefs = { ...currentPrefs, [field]: value };

        const updatedUser = { ...user, jobPreferences: updatedPrefs };
        onUpdate(updatedUser);

        // Debounced autosave
        autoSave({ jobPreferences: updatedPrefs });
    };

    const toggleSelection = (field, value) => {
        const currentPrefs = user?.jobPreferences || {};
        const currentArray = currentPrefs[field] || [];

        let updatedArray;
        if (currentArray.includes(value)) {
            // Remove if already selected
            updatedArray = currentArray.filter(item => item !== value);
        } else {
            // Add if not selected
            updatedArray = [...currentArray, value];
        }

        handleUpdate(field, updatedArray);
    };

    const jobTypes = ['Full-Time', 'Part-Time', 'Contract', 'Internship', 'Freelance'];
    const locations = ['Remote', 'Hybrid', 'On-Site'];
    const experienceLevels = ['Entry Level', 'Mid-Level', 'Senior Level', 'Lead/Principal', 'Executive'];

    return (
        <div className="max-w-5xl space-y-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">

                {/* Job Type Preferences */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 ml-1">
                        <Clock size={16} className="text-blue-500" />
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Job Type Interests</label>
                    </div>
                    <p className="text-xs text-slate-600 font-medium ml-1 -mt-2">Select all that apply</p>
                    <div className="grid grid-cols-2 gap-4">
                        {jobTypes.map((type) => {
                            const isSelected = (user?.jobPreferences?.jobTypes || []).includes(type);
                            return (
                                <button
                                    key={type}
                                    onClick={() => toggleSelection('jobTypes', type)}
                                    className={`p-6 rounded-3xl border transition-all text-center group ${isSelected
                                        ? 'bg-blue-600 border-blue-500 text-white shadow-xl scale-[1.02]'
                                        : 'bg-white/5 border-white/5 text-slate-500 hover:border-blue-500/30 hover:text-white'
                                        }`}
                                >
                                    <div className={`mb-3 flex justify-center ${isSelected ? 'text-white' : 'text-slate-600 group-hover:text-blue-400'}`}>
                                        <CheckCircle2 size={24} strokeWidth={isSelected ? 3 : 1} />
                                    </div>
                                    <span className="text-sm font-black tracking-tight">{type}</span>
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Workplace Preference */}
                <div className="space-y-6">
                    <div className="flex items-center gap-3 ml-1">
                        <MapPin size={16} className="text-indigo-500" />
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Workplace Setup</label>
                    </div>
                    <p className="text-xs text-slate-600 font-medium ml-1 -mt-2">Select all that apply</p>
                    <div className="space-y-3">
                        {locations.map((loc) => {
                            const isSelected = (user?.jobPreferences?.workplacePreferences || []).includes(loc);
                            return (
                                <button
                                    key={loc}
                                    onClick={() => toggleSelection('workplacePreferences', loc)}
                                    className={`w-full p-6 flex justify-between items-center rounded-3xl border transition-all ${isSelected
                                        ? 'bg-indigo-600 border-indigo-500 text-white shadow-xl translate-x-1'
                                        : 'bg-white/5 border-white/5 text-slate-500 hover:border-indigo-500/30 hover:text-white'
                                        }`}
                                >
                                    <span className="text-sm font-black tracking-tight uppercase tracking-widest">{loc}</span>
                                    {isSelected && <CheckCircle2 size={20} strokeWidth={3} />}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Experience Level Preferences */}
                <div className="md:col-span-2 space-y-6">
                    <div className="flex items-center gap-3 ml-1">
                        <TrendingUp size={16} className="text-emerald-500" />
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Experience Level Interests</label>
                    </div>
                    <p className="text-xs text-slate-600 font-medium ml-1 -mt-2">Select all levels you're open to</p>
                    <div className="flex flex-wrap gap-3">
                        {experienceLevels.map((level) => {
                            const isSelected = (user?.jobPreferences?.experienceLevels || []).includes(level);
                            return (
                                <button
                                    key={level}
                                    onClick={() => toggleSelection('experienceLevels', level)}
                                    className={`px-6 py-4 rounded-2xl border-2 transition-all font-black text-xs uppercase tracking-wider ${isSelected
                                        ? 'bg-emerald-600 border-emerald-500 text-white shadow-lg scale-105'
                                        : 'bg-white/5 border-white/10 text-slate-500 hover:border-emerald-500/50 hover:text-emerald-400'
                                        }`}
                                >
                                    {level}
                                </button>
                            );
                        })}
                    </div>
                </div>

                {/* Salary Expectations */}
                <div className="md:col-span-2 space-y-6">
                    <div className="flex items-center gap-3 ml-1">
                        <DollarSign size={16} className="text-emerald-500" />
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Annual Salary Expectations (USD)</label>
                    </div>
                    <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-10 flex flex-col md:flex-row gap-10 items-center">
                        <div className="flex-1 w-full space-y-4">
                            <div className="flex justify-between font-black text-xs uppercase tracking-widest">
                                <span className="text-slate-600">Minimum Range</span>
                                <span className="text-emerald-400">${user?.jobPreferences?.minSalary || '80'}k - ${user?.jobPreferences?.maxSalary || '120'}k</span>
                            </div>
                            <input
                                type="range"
                                min="10"
                                max="500"
                                step="10"
                                value={parseInt(user?.jobPreferences?.minSalary) || 80}
                                onChange={(e) => handleUpdate('minSalary', e.target.value)}
                                className="w-full h-3 bg-slate-800 rounded-full appearance-none cursor-pointer accent-emerald-500 hover:accent-emerald-400 transition-all shadow-inner"
                            />
                            <div className="flex justify-between text-[10px] font-black text-slate-700">
                                <span>$10k</span>
                                <span>$500k+</span>
                            </div>
                        </div>
                        <div className="w-full md:w-64 p-8 bg-emerald-500/10 border border-emerald-500/20 rounded-3xl text-center">
                            <p className="text-emerald-500 text-[10px] font-black uppercase tracking-widest mb-2">Target Market Value</p>
                            <h4 className="text-white text-3xl font-black italic tracking-tighter">${user?.jobPreferences?.minSalary || '80'}k<span className="text-emerald-500/50 not-italic ml-1">+</span></h4>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default PreferencesForm;
