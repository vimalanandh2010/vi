import React from 'react';
import { Camera, MapPin, Phone, User, Briefcase } from 'lucide-react';
import axiosClient from '../../../api/axiosClient';
import { toast } from 'react-toastify';

import { useAutoSave } from '../../../hooks/useAutoSave';

const BasicInfoForm = ({ user, onUpdate }) => {
    const autoSave = useAutoSave('jobseeker/profile');

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        const updatedUser = { ...user, [name]: value };
        onUpdate(updatedUser);

        // Debounced autosave
        autoSave({ [name]: value });
    };

    const handlePhotoUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('photo', file);

        try {
            const res = await axiosClient.post('jobseeker/photo', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            onUpdate({ ...user, photoUrl: res.photoUrl });
            toast.success("Photo updated!");
        } catch (err) {
            toast.error("Photo upload failed");
        }
    };

    return (
        <div className="space-y-12">
            <div className="flex flex-col md:flex-row gap-12 items-start">
                {/* Profile Photo Upload */}
                <div className="relative group">
                    <div className="w-48 h-48 rounded-[3rem] overflow-hidden bg-slate-800 border-4 border-white/5 shadow-2xl flex items-center justify-center transition-transform duration-500 group-hover:scale-[1.02]">
                        {user?.photoUrl ? (
                            <img src={user.photoUrl} alt="Profile" className="w-full h-full object-cover" />
                        ) : (
                            <div className="text-6xl font-black text-blue-500/20 uppercase">
                                {user?.firstName?.charAt(0) || 'U'}
                            </div>
                        )}
                    </div>
                    <label className="absolute bottom-2 right-2 p-4 bg-blue-600 text-white rounded-2xl shadow-xl cursor-pointer hover:bg-blue-700 transition-all hover:scale-110 active:scale-95">
                        <Camera size={20} />
                        <input type="file" hidden onChange={handlePhotoUpload} accept="image/*" />
                    </label>
                </div>

                <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-6 w-full">
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">First Name</label>
                        <div className="relative">
                            <User className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                name="firstName"
                                value={user?.firstName || ''}
                                onChange={handleInputChange}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-blue-500/5 transition-all outline-none font-bold"
                                placeholder="John"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Last Name</label>
                        <input
                            name="lastName"
                            value={user?.lastName || ''}
                            onChange={handleInputChange}
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 px-4 text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-blue-500/5 transition-all outline-none font-bold"
                            placeholder="Doe"
                        />
                    </div>
                    <div className="col-span-1 md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Professional Headline</label>
                        <div className="relative">
                            <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                name="preferredRole"
                                value={user?.preferredRole || ''}
                                onChange={handleInputChange}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-blue-500/5 transition-all outline-none font-bold italic"
                                placeholder="E.g. Senior MERN Stack Developer | UI/UX Enthusiast"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Phone Number</label>
                        <div className="relative">
                            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                name="phoneNumber"
                                value={user?.phoneNumber || ''}
                                onChange={handleInputChange}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-blue-500/5 transition-all outline-none font-bold"
                                placeholder="+1 (555) 000-0000"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Location</label>
                        <div className="relative">
                            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
                            <input
                                name="location"
                                value={user?.location || ''}
                                onChange={handleInputChange}
                                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 text-white placeholder:text-slate-600 focus:border-blue-500/50 focus:bg-blue-500/5 transition-all outline-none font-bold"
                                placeholder="San Francisco, CA"
                            />
                        </div>
                    </div>
                    <div className="col-span-1 md:col-span-2 space-y-2">
                        <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Experience Level</label>
                        <div className="grid grid-cols-3 gap-3 p-1.5 bg-white/5 rounded-[1.5rem] border border-white/5">
                            {[
                                { id: 'fresher', label: 'FRESHER', desc: 'Student / No Experience' },
                                { id: 'entry', label: 'ENTRY LEVEL', desc: '0-1 Years Experience' },
                                { id: 'mid', label: 'MID LEVEL', desc: '2-4 Years Experience' },
                                { id: 'senior', label: 'SENIOR LEVEL', desc: '5-8 Years Experience' },
                                { id: 'expert', label: 'EXPERT', desc: '8-12 Years Experience' },
                                { id: 'principal', label: 'PRINCIPAL', desc: '12+ Years / Leadership' }
                            ].map((opt) => (
                                <button
                                    key={opt.id}
                                    onClick={() => handleInputChange({ target: { name: 'experienceLevel', value: opt.id } })}
                                    className={`p-3 rounded-2xl transition-all duration-500 border-2 ${user?.experienceLevel === opt.id ? 'bg-blue-600 border-blue-400 text-white shadow-lg' : 'bg-transparent border-transparent text-slate-500 hover:bg-white/5'}`}
                                >
                                    <p className="text-[10px] font-black tracking-widest leading-none mb-1">{opt.label}</p>
                                    <p className={`text-[8px] font-bold ${user?.experienceLevel === opt.id ? 'text-white/50' : 'text-slate-600'}`}>{opt.desc}</p>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default BasicInfoForm;
