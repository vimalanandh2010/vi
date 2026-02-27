import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Calendar, Briefcase, GraduationCap, X, CheckCircle2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosClient from '../../../api/axiosClient';
import { toast } from 'react-toastify';

const TimelineManager = ({ type, user, onUpdate, experienceLevel }) => {
    const isExperience = type === 'experience';
    const isFresher = experienceLevel === 'fresher';
    const data = isExperience ? (user?.experience || []) : (user?.education || []);

    const [isAdding, setIsAdding] = useState(false);
    const [editingIdx, setEditingIdx] = useState(-1);
    const [formData, setFormData] = useState({});

    const handleOpen = (idx = -1) => {
        if (idx >= 0) {
            setFormData(data[idx]);
            setEditingIdx(idx);
        } else {
            // Default type based on experience level
            const defaultType = isFresher ? 'internship' : 'job';
            setFormData({
                company: '', role: '', duration: '', description: '', logo: '', type: isExperience ? defaultType : 'internship',
                institutionName: '', degreeName: '', yearOfPassing: '', score: '', level: !isExperience ? 'Graduation' : ''
            });
            setIsAdding(true);
        }
    };

    const handleSave = async () => {
        let newData = [...data];
        if (editingIdx >= 0) {
            newData[editingIdx] = formData;
        } else {
            newData.push(formData);
        }

        const payload = isExperience ? { experience: newData } : { education: newData };

        try {
            const res = await axiosClient.put('jobseeker/profile', payload);
            onUpdate(res);
            toast.success(`${isExperience ? 'Experience' : 'Education'} saved!`);
            setIsAdding(false);
            setEditingIdx(-1);
        } catch (err) {
            toast.error("Failed to save data");
        }
    };

    const handleDelete = async (idx) => {
        if (!window.confirm("Delete this entry?")) return;
        let newData = data.filter((_, i) => i !== idx);
        const payload = isExperience ? { experience: newData } : { education: newData };

        try {
            const res = await axiosClient.put('jobseeker/profile', payload);
            onUpdate(res);
            toast.info("Entry removed");
        } catch (err) {
            toast.error("Delete failed");
        }
    };
    return (
        <div className="space-y-10">
            <div className="flex justify-between items-center px-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-blue-600/10 flex items-center justify-center text-blue-500">
                        {isExperience ? <Briefcase size={24} /> : <GraduationCap size={24} />}
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white tracking-tight">
                            {isExperience ? (isFresher ? 'Internship History' : 'Career History') : 'Academic Background'}
                        </h3>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">
                            {data.length} Total Entries
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => handleOpen()}
                    className="p-4 bg-blue-600 text-white rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                    <Plus size={24} />
                </button>
            </div>

            {/* List of Entries */}
            <div className="space-y-6">
                {data.map((item, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8 flex flex-col md:flex-row justify-between items-start gap-8 group hover:bg-white/[0.07] transition-all">
                        <div className="flex gap-6">
                            <div className="w-16 h-16 rounded-[1.25rem] bg-slate-800 flex items-center justify-center text-2xl group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                                {isExperience ? '🏢' : '🎓'}
                            </div>
                            <div>
                                <h4 className="text-2xl font-black text-white mb-2">
                                    {isExperience ? item.role : item.degreeName}
                                </h4>
                                <div className="flex items-center gap-3 text-blue-400 font-bold mb-4">
                                    <div className="flex items-center gap-2 text-slate-500 text-[10px] uppercase font-black tracking-widest shrink-0">
                                        <Calendar size={14} />
                                        {isExperience ? (item.duration || 'Duration') : `Class of ${item.yearOfPassing}`}
                                    </div>
                                    <div className="w-1.5 h-1.5 rounded-full bg-slate-700" />
                                    <div className="px-2 py-0.5 bg-blue-600/10 text-blue-400 text-[9px] font-black uppercase rounded">
                                        {isExperience ? (item.type || 'job') : (item.level || 'Degree')}
                                    </div>
                                </div>
                                <p className="text-slate-400 text-sm leading-relaxed max-w-2xl line-clamp-2">
                                    {isExperience ? item.description : `Score: ${item.score}`}
                                </p>
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <button onClick={() => handleOpen(idx)} className="p-3 bg-white/5 text-slate-500 rounded-xl hover:bg-white hover:text-slate-900 transition-all"><Edit3 size={18} /></button>
                            <button onClick={() => handleDelete(idx)} className="p-3 bg-red-500/10 text-red-400 rounded-xl hover:bg-red-500 hover:text-white transition-all"><Trash2 size={18} /></button>
                        </div>
                    </div>
                ))}

                {data.length === 0 && (
                    <div className="text-center py-20 bg-white/[0.02] border border-dashed border-white/10 rounded-[3rem]">
                        <p className="text-slate-600 font-bold italic">No history records found. Click '+' to add.</p>
                    </div>
                )}
            </div>

            {/* Modal for Add/Edit */}
            <AnimatePresence>
                {(isAdding || editingIdx >= 0) && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9, y: 30 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.9, y: 30 }}
                            className="bg-[#15293E] border border-white/10 rounded-[3rem] w-full max-w-2xl shadow-2xl relative overflow-hidden"
                        >
                            <div className="px-10 py-8 border-b border-white/5 flex items-center justify-between">
                                <h3 className="text-2xl font-black text-white tracking-tight">
                                    {isExperience ? (isFresher ? (editingIdx >= 0 ? 'Edit Internship' : 'Add Internship') : (editingIdx >= 0 ? 'Edit Role' : 'Add Experience')) : (editingIdx >= 0 ? 'Edit Education' : 'Add Academic Record')}
                                </h3>
                                <button onClick={() => { setIsAdding(false); setEditingIdx(-1); }} className="p-2 text-slate-500 hover:text-white"><X size={24} /></button>
                            </div>

                            <div className="p-10 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{isExperience ? (isFresher ? 'Organization/Company' : 'Company Name') : 'Institution Name'}</label>
                                        <input
                                            value={isExperience ? formData.company : formData.institutionName}
                                            onChange={(e) => setFormData({ ...formData, [isExperience ? 'company' : 'institutionName']: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white focus:border-blue-500/50 transition-all outline-none"
                                            placeholder={isExperience ? (isFresher ? "E.g. Google, Microsoft" : "E.g. Apple Inc.") : "E.g. Stanford University"}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{isExperience ? (isFresher ? 'Role/Position' : 'Job Role') : 'Degree/Course'}</label>
                                        <input
                                            value={isExperience ? formData.role : formData.degreeName}
                                            onChange={(e) => setFormData({ ...formData, [isExperience ? 'role' : 'degreeName']: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white focus:border-blue-500/50 transition-all outline-none"
                                            placeholder={isExperience ? (isFresher ? "E.g. Software Development Intern" : "E.g. Senior Product Designer") : "E.g. B.S Computer Science"}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{isExperience ? 'Duration' : 'Year of Passing'}</label>
                                        <input
                                            value={isExperience ? formData.duration : formData.yearOfPassing}
                                            onChange={(e) => setFormData({ ...formData, [isExperience ? 'duration' : 'yearOfPassing']: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white focus:border-blue-500/50 transition-all outline-none"
                                            placeholder={isExperience ? "E.g. Jan 2022 - Present" : "E.g. 2024"}
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">{isExperience ? 'Type' : 'Level'}</label>
                                        <select
                                            value={isExperience ? formData.type : formData.level}
                                            onChange={(e) => setFormData({ ...formData, [isExperience ? 'type' : 'level']: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white focus:border-blue-500/50 transition-all outline-none appearance-none"
                                        >
                                            {isExperience ? (
                                                <>
                                                    <option value="job" className="bg-[#15293E] text-white">Job</option>
                                                    <option value="internship" className="bg-[#15293E] text-white">Internship</option>
                                                    <option value="freelance" className="bg-[#15293E] text-white">Freelance</option>
                                                </>
                                            ) : (
                                                <>
                                                    <option value="Graduation" className="bg-[#15293E] text-white">Graduation</option>
                                                    <option value="12th" className="bg-[#15293E] text-white">12th</option>
                                                    <option value="10th" className="bg-[#15293E] text-white">10th</option>
                                                    <option value="Post-Graduation" className="bg-[#15293E] text-white">Post-Graduation</option>
                                                    <option value="Diploma" className="bg-[#15293E] text-white">Diploma</option>
                                                    <option value="Other" className="bg-[#15293E] text-white">Other</option>
                                                </>
                                            )}
                                        </select>
                                    </div>
                                    {!isExperience && (
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Score/GPA</label>
                                            <input
                                                value={formData.score}
                                                onChange={(e) => setFormData({ ...formData, score: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white focus:border-blue-500/50 transition-all outline-none"
                                                placeholder="E.g. 3.9/4.0"
                                            />
                                        </div>
                                    )}
                                </div>
                                {isExperience && (
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Description</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white focus:border-blue-500/50 transition-all outline-none min-h-[120px]"
                                            placeholder="Outline your responsibilities and achievements..."
                                        />
                                    </div>
                                )}
                            </div>

                            <div className="px-10 py-8 border-t border-white/5 flex gap-4">
                                <button onClick={() => { setIsAdding(false); setEditingIdx(-1); }} className="flex-1 py-4 bg-white/5 text-slate-400 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all">Cancel</button>
                                <button onClick={handleSave} className="flex-1 py-4 bg-blue-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2">
                                    <CheckCircle2 size={18} />
                                    Confirm
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default TimelineManager;
