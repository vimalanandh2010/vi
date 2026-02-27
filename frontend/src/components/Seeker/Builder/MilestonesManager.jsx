import React, { useState } from 'react';
import { Plus, Trash2, Edit3, Award, ShieldCheck, X, CheckCircle2, Calendar } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosClient from '../../../api/axiosClient';
import { toast } from 'react-toastify';

const MilestonesManager = ({ user, onUpdate }) => {
    const [activeTab, setActiveTab] = useState('accomplishments'); // 'accomplishments' or 'certifications'
    const [isAdding, setIsAdding] = useState(false);
    const [editingIdx, setEditingIdx] = useState(-1);
    const [formData, setFormData] = useState({});

    const data = activeTab === 'accomplishments' ? (user?.accomplishments || []) : (user?.certifications || []);

    const handleOpen = (idx = -1) => {
        if (idx >= 0) {
            setFormData(data[idx]);
            setEditingIdx(idx);
        } else {
            setFormData(activeTab === 'accomplishments'
                ? { title: '', category: 'Other', description: '', date: '' }
                : { name: '', issuer: '', date: '', link: '' }
            );
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

        const payload = { [activeTab]: newData };

        try {
            const res = await axiosClient.put('jobseeker/profile', payload);
            onUpdate(res);
            toast.success(`${activeTab === 'accomplishments' ? 'Milestone' : 'Certification'} saved!`);
            setIsAdding(false);
            setEditingIdx(-1);
        } catch (err) {
            toast.error("Save failed");
        }
    };

    const handleFileUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const uploadFormData = new FormData();
        uploadFormData.append('certificate', file);

        const loadingToast = toast.loading("Uploading certificate...");

        try {
            const res = await axiosClient.post('jobseeker/certificate', uploadFormData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            setFormData(prev => ({ ...prev, link: res.certificateUrl }));
            toast.update(loadingToast, {
                render: "Certificate uploaded!",
                type: "success",
                isLoading: false,
                autoClose: 3000
            });
        } catch (err) {
            toast.update(loadingToast, {
                render: "Upload failed",
                type: "error",
                isLoading: false,
                autoClose: 3000
            });
        }
    };

    const handleDelete = async (idx) => {
        if (!window.confirm("Remove this entry?")) return;
        const newData = data.filter((_, i) => i !== idx);
        const payload = { [activeTab]: newData };

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
            {/* Tab Switcher */}
            <div className="flex gap-4 p-1.5 bg-white/5 rounded-2xl border border-white/5 max-w-md mx-auto">
                <button
                    onClick={() => setActiveTab('accomplishments')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-500 font-black text-[10px] tracking-widest ${activeTab === 'accomplishments' ? 'bg-blue-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <Award size={14} />
                    ACCOMPLISHMENTS
                </button>
                <button
                    onClick={() => setActiveTab('certifications')}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl transition-all duration-500 font-black text-[10px] tracking-widest ${activeTab === 'certifications' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                >
                    <ShieldCheck size={14} />
                    CERTIFICATIONS
                </button>
            </div>

            <div className="flex justify-between items-center px-4">
                <h3 className="text-xl font-black text-white tracking-tight uppercase">
                    {activeTab === 'accomplishments' ? 'Key Milestones' : 'Professional Certs'}
                </h3>
                <button
                    onClick={() => handleOpen()}
                    className={`p-4 ${activeTab === 'accomplishments' ? 'bg-blue-600' : 'bg-indigo-600'} text-white rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all`}
                >
                    <Plus size={24} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {data.map((item, idx) => (
                    <div key={idx} className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8 group hover:bg-white/[0.08] transition-all relative">
                        <div className="flex items-start gap-6">
                            <div className={`w-14 h-14 rounded-2xl ${activeTab === 'accomplishments' ? 'bg-blue-600/10 text-blue-400' : 'bg-indigo-600/10 text-indigo-400'} flex items-center justify-center text-xl`}>
                                {activeTab === 'accomplishments' ? (item.category === 'Hackathon' ? '🚀' : '🏆') : '📜'}
                            </div>
                            <div className="flex-1">
                                <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">
                                    {activeTab === 'accomplishments' ? item.category : item.issuer}
                                </p>
                                <h4 className="text-xl font-black text-white mb-2">{activeTab === 'accomplishments' ? item.title : item.name}</h4>
                                <div className="flex items-center gap-2 text-slate-500 text-[10px] font-bold">
                                    <Calendar size={12} />
                                    {item.date}
                                </div>
                            </div>
                        </div>
                        <div className="absolute top-6 right-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <button onClick={() => handleOpen(idx)} className="p-2 bg-white/5 text-slate-500 rounded-lg hover:text-white transition-all"><Edit3 size={16} /></button>
                            <button onClick={() => handleDelete(idx)} className="p-2 bg-red-500/5 text-red-500 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16} /></button>
                        </div>
                    </div>
                ))}

                {data.length === 0 && (
                    <div className="col-span-full text-center py-20 bg-white/[0.02] border border-dashed border-white/10 rounded-[3rem]">
                        <p className="text-slate-600 font-bold italic">No records added for {activeTab}.</p>
                    </div>
                )}
            </div>

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
                                <h3 className="text-3xl font-black text-white tracking-tight">
                                    {activeTab === 'accomplishments' ? 'Milestone Details' : 'Certification Info'}
                                </h3>
                                <button onClick={() => { setIsAdding(false); setEditingIdx(-1); }} className="p-2 text-slate-500 hover:text-white"><X size={24} /></button>
                            </div>

                            <div className="p-10 space-y-6">
                                {activeTab === 'accomplishments' ? (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Title / Achievement</label>
                                            <input
                                                value={formData.title}
                                                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white outline-none focus:border-blue-500/50"
                                                placeholder="E.g. Winner of Global Hackathon 2024"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Category</label>
                                                <select
                                                    value={formData.category}
                                                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white focus:border-blue-500/50 outline-none appearance-none"
                                                >
                                                    <option value="Hackathon" className="bg-[#15293E] text-white">Hackathon</option>
                                                    <option value="Award" className="bg-[#15293E] text-white">Award</option>
                                                    <option value="Publication" className="bg-[#15293E] text-white">Publication</option>
                                                    <option value="Patent" className="bg-[#15293E] text-white">Patent</option>
                                                    <option value="Other" className="bg-[#15293E] text-white">Other</option>
                                                </select>
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Date</label>
                                                <input
                                                    value={formData.date}
                                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white focus:border-blue-500/50 outline-none"
                                                    placeholder="E.g. March 2024"
                                                />
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Certificate Name</label>
                                            <input
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white focus:border-indigo-500/50 outline-none"
                                                placeholder="E.g. AWS Certified Solutions Architect"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Issuing Organization</label>
                                            <input
                                                value={formData.issuer}
                                                onChange={(e) => setFormData({ ...formData, issuer: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white focus:border-indigo-500/50 outline-none"
                                                placeholder="E.g. Amazon Web Services"
                                            />
                                        </div>
                                        <div className="grid grid-cols-2 gap-6">
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Issued Date</label>
                                                <input
                                                    value={formData.date}
                                                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                                                    className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white focus:border-indigo-500/50 outline-none"
                                                    placeholder="E.g. 2023"
                                                />
                                            </div>
                                            <div className="space-y-2">
                                                <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Verification Link / File</label>
                                                <div className="flex gap-2">
                                                    <input
                                                        value={formData.link}
                                                        onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                                        className="flex-1 bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white focus:border-indigo-500/50 outline-none"
                                                        placeholder="https://..."
                                                    />
                                                    <label className="p-4 bg-indigo-600/20 text-indigo-400 rounded-2xl border border-indigo-500/30 cursor-pointer hover:bg-indigo-600 hover:text-white transition-all">
                                                        <Plus size={20} />
                                                        <input type="file" hidden onChange={handleFileUpload} accept=".pdf,image/*" />
                                                    </label>
                                                </div>
                                                {formData.link && (
                                                    <p className="text-[9px] text-indigo-400 font-bold mt-1 truncate max-w-full">
                                                        Linked: {formData.link}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </>
                                )}
                            </div>

                            <div className="px-10 py-8 border-t border-white/5 flex gap-4">
                                <button onClick={() => { setIsAdding(false); setEditingIdx(-1); }} className="flex-1 py-4 bg-white/5 text-slate-400 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all">Cancel</button>
                                <button onClick={handleSave} className={`flex-1 py-4 ${activeTab === 'accomplishments' ? 'bg-blue-600' : 'bg-indigo-600'} text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:opacity-90 transition-all flex items-center justify-center gap-2`}>
                                    <CheckCircle2 size={18} />
                                    Sync Data
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default MilestonesManager;
