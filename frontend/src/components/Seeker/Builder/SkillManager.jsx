import React, { useState } from 'react';
import { Plus, X, Award, Zap, Target, Cpu } from 'lucide-react';
import axiosClient from '../../../api/axiosClient';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const SkillManager = ({ user, onUpdate }) => {
    const [newSkill, setNewSkill] = useState('');

    const handleAddSkill = async (e) => {
        if (e.key === 'Enter' || e.type === 'click') {
            if (!newSkill.trim()) return;

            const currentSkills = user?.primarySkill?.split(',').map(s => s.trim()).filter(Boolean) || [];

            // Case-insensitive duplicate check
            if (currentSkills.some(skill => skill.toLowerCase() === newSkill.trim().toLowerCase())) {
                toast.info("Skill already added");
                return;
            }

            const updatedSkills = [...currentSkills, newSkill.trim()].join(', ');
            updateSkills(updatedSkills);
            setNewSkill('');
        }
    };

    const handleDeleteSkill = (skillToDelete) => {
        const currentSkills = user?.primarySkill?.split(',').map(s => s.trim()) || [];
        const updatedSkills = currentSkills.filter(s => s !== skillToDelete).join(', ');
        updateSkills(updatedSkills);
    };

    const updateSkills = async (skillString) => {
        onUpdate({ ...user, primarySkill: skillString });
        try {
            await axiosClient.put('jobseeker/profile', { primarySkill: skillString });
        } catch (err) {
            toast.error("Failed to update skills");
        }
    };

    return (
        <div className="space-y-12 max-w-5xl">
            <div className="bg-black border border-gray-800 rounded-2xl p-6 mb-8">
                <p className="text-white text-sm font-medium leading-relaxed">
                    <span className="font-black">Recruiter Tip:</span> Profiles with at least 5 validated skills are 40% more likely to be shortlisted for technical roles.
                </p>
            </div>

            {/* Tag Input Section */}
            <div className="space-y-4">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Add Core Skills</label>
                <div className="flex gap-4">
                    <div className="relative flex-1">
                        <Zap className="absolute left-4 top-1/2 -translate-y-1/2 text-black" size={18} />
                        <input
                            value={newSkill}
                            onChange={(e) => setNewSkill(e.target.value)}
                            onKeyDown={handleAddSkill}
                            className="w-full bg-slate-50 border border-gray-200 rounded-2xl py-4 pl-12 pr-4 text-black placeholder:text-gray-400 focus:border-black focus:bg-white transition-all outline-none font-bold"
                            placeholder="E.g. React, Python, Product Management..."
                        />
                    </div>
                    <button
                        onClick={handleAddSkill}
                        className="px-8 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-800 transition-all flex items-center gap-2 shadow-xl active:scale-95"
                    >
                        <Plus size={18} />
                        Add
                    </button>
                </div>
            </div>

            {/* Skills Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(user?.primarySkill?.split(',').map(s => s.trim()).filter(Boolean) || []).map((skill, idx) => (
                    <motion.div
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        key={idx}
                        className="bg-white border border-gray-200 rounded-2xl p-4 group hover:bg-black hover:border-black transition-all duration-500 flex items-center justify-between"
                    >
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-xl bg-black/10 flex items-center justify-center text-black group-hover:bg-white/10 group-hover:text-white group-hover:scale-110 transition-all">
                                <Target size={18} />
                            </div>
                            <span className="text-black font-black text-lg tracking-tight group-hover:text-white transition-colors">{skill}</span>
                        </div>
                        <button
                            onClick={() => handleDeleteSkill(skill)}
                            className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 group-hover:text-white/70 group-hover:hover:text-red-400 rounded-lg transition-all"
                            title="Remove Skill"
                        >
                            <X size={18} />
                        </button>
                    </motion.div>
                ))}
            </div>

            {/* Empty State */}
            {(!user?.primarySkill || user.primarySkill.length === 0) && (
                <div className="text-center py-20 bg-gray-50 border border-dashed border-gray-200 rounded-[3rem]">
                    <Cpu className="mx-auto text-gray-300 mb-4" size={48} />
                    <p className="text-gray-500 font-bold italic">No skills added yet. Start by typing above.</p>
                </div>
            )}
        </div>
    );
};

export default SkillManager;
