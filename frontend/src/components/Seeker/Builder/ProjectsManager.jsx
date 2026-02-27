import React, { useState } from 'react';
import { Plus, Github, ExternalLink, Trash2, Edit3, Globe, X, Code } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import axiosClient from '../../../api/axiosClient';
import { toast } from 'react-toastify';

const ProjectsManager = ({ user, onUpdate }) => {
    const projects = user?.projects || [];
    const [isAdding, setIsAdding] = useState(false);
    const [editingIdx, setEditingIdx] = useState(-1);
    const [formData, setFormData] = useState({});

    const handleOpen = (idx = -1) => {
        if (idx >= 0) {
            setFormData(projects[idx]);
            setEditingIdx(idx);
        } else {
            setFormData({ title: '', description: '', githubUrl: '', liveUrl: '', techStack: '' });
            setIsAdding(true);
        }
    };

    const handleSave = async () => {
        let newProjects = [...projects];
        if (editingIdx >= 0) {
            newProjects[editingIdx] = formData;
        } else {
            newProjects.push(formData);
        }

        try {
            const res = await axiosClient.put('jobseeker/profile', { projects: newProjects });
            onUpdate(res);
            toast.success("Project saved!");
            setIsAdding(false);
            setEditingIdx(-1);
        } catch (err) {
            toast.error("Save failed");
        }
    };

    const handleDelete = async (idx) => {
        if (!window.confirm("Remove this project?")) return;
        const newProjects = projects.filter((_, i) => i !== idx);
        try {
            const res = await axiosClient.put('jobseeker/profile', { projects: newProjects });
            onUpdate(res);
            toast.info("Project removed");
        } catch (err) {
            toast.error("Delete failed");
        }
    };

    return (
        <div className="space-y-10">
            <div className="flex justify-between items-center px-4">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-teal-500/10 flex items-center justify-center text-teal-500">
                        <Code size={24} />
                    </div>
                    <div>
                        <h3 className="text-xl font-black text-white tracking-tight">Portfolio & Projects</h3>
                        <p className="text-slate-500 text-xs font-bold uppercase tracking-widest">{projects.length} Total Projects</p>
                    </div>
                </div>
                <button
                    onClick={() => handleOpen()}
                    className="p-4 bg-teal-600 text-white rounded-2xl shadow-xl hover:scale-105 active:scale-95 transition-all"
                >
                    <Plus size={24} />
                </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {projects.map((proj, idx) => (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        key={idx}
                        className="bg-white/5 border border-white/5 rounded-[2.5rem] p-8 group hover:border-teal-500/30 transition-all duration-500 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-6 flex gap-2 opacity-0 group-hover:opacity-100 transition-all">
                            <button onClick={() => handleOpen(idx)} className="p-2 bg-white/10 text-white rounded-lg hover:bg-white hover:text-slate-900 transition-all"><Edit3 size={16} /></button>
                            <button onClick={() => handleDelete(idx)} className="p-2 bg-red-500/10 text-red-400 rounded-lg hover:bg-red-500 hover:text-white transition-all"><Trash2 size={16} /></button>
                        </div>

                        <div className="mb-6">
                            <h4 className="text-2xl font-black text-white mb-2">{proj.title}</h4>
                            <p className="text-slate-400 text-sm line-clamp-3 leading-relaxed mb-6">
                                {proj.description || "No description provided for this project."}
                            </p>
                            <div className="flex flex-wrap gap-2">
                                {(proj.technologies || []).map((tech, i) => (
                                    <span key={i} className="px-3 py-1 bg-white/5 border border-white/5 rounded-lg text-[10px] font-black text-slate-500 uppercase tracking-widest">{tech.trim()}</span>
                                ))}
                            </div>
                        </div>

                        <div className="flex gap-4 border-t border-white/5 pt-6">
                            {proj.link && (
                                <a href={proj.link} target="_blank" rel="noopener noreferrer" className="flex-1 py-3 bg-teal-600/10 text-teal-400 border border-teal-500/20 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-teal-600 hover:text-white transition-all">
                                    <Globe size={14} /> Demo / View Project
                                </a>
                            )}
                        </div>
                    </motion.div>
                ))}

                {projects.length === 0 && (
                    <div className="col-span-full text-center py-20 bg-white/[0.02] border border-dashed border-white/10 rounded-[3rem]">
                        <p className="text-slate-600 font-bold italic">Showcase your work. Add your first project card.</p>
                    </div>
                )}
            </div>

            {/* Modal */}
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
                                <h3 className="text-2xl font-black text-white tracking-tight">Project Details</h3>
                                <button onClick={() => { setIsAdding(false); setEditingIdx(-1); }} className="p-2 text-slate-500 hover:text-white"><X size={24} /></button>
                            </div>

                            <div className="p-10 space-y-6 max-h-[70vh] overflow-y-auto custom-scrollbar">
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Project Title</label>
                                        <input
                                            value={formData.title}
                                            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white focus:border-teal-500/50 transition-all outline-none"
                                            placeholder="E.g. E-Commerce Platform"
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Description</label>
                                        <textarea
                                            value={formData.description}
                                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white focus:border-teal-500/50 transition-all outline-none min-h-[120px]"
                                            placeholder="What problem does it solve? What was your role?"
                                        />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Live URL / Demo Link</label>
                                            <input
                                                value={formData.link}
                                                onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white focus:border-teal-500/50 transition-all outline-none"
                                                placeholder="https://my-app.vercel.app"
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Tech Stack (comma separated)</label>
                                            <input
                                                value={formData.technologies?.join(', ')}
                                                onChange={(e) => setFormData({ ...formData, technologies: e.target.value.split(',').map(s => s.trim()) })}
                                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white focus:border-teal-500/50 transition-all outline-none"
                                                placeholder="React, Firebase, Tailwind"
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="px-10 py-8 border-t border-white/5 flex gap-4">
                                <button onClick={() => { setIsAdding(false); setEditingIdx(-1); }} className="flex-1 py-4 bg-white/5 text-slate-400 font-black text-xs uppercase tracking-widest rounded-2xl hover:bg-white/10 transition-all">Cancel</button>
                                <button onClick={handleSave} className="flex-1 py-4 bg-teal-600 text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl hover:bg-teal-700 transition-all">Save Project</button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default ProjectsManager;
