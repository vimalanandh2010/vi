import React, { useState } from 'react';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2, RefreshCw } from 'lucide-react';
import axiosClient from '../../../api/axiosClient';
import { toast } from 'react-toastify';

const ResumeUpload = ({ user, onUpdate }) => {
    const [uploading, setUploading] = useState(false);

    const handleFileChange = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        // Validation
        const allowedTypes = ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
        if (!allowedTypes.includes(file.type)) {
            toast.error("Format not supported. Please upload PDF or DOCX.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            toast.error("File too large. Max 5MB allowed.");
            return;
        }

        setUploading(true);
        const formData = new FormData();
        formData.append('resume', file);

        try {
            const res = await axiosClient.post('jobseeker/resume', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            onUpdate({ ...user, resumeUrl: res.resumeUrl });
            toast.success("Resume uploaded successfully!");
        } catch (err) {
            toast.error("Upload failed. Try again.");
        } finally {
            setUploading(false);
        }
    };

    return (
        <div className="max-w-4xl space-y-12">
            <div className="bg-blue-50 border border-blue-100 rounded-[2.5rem] p-10 flex flex-col items-center text-center">
                <div className="w-20 h-20 rounded-3xl bg-blue-100/50 flex items-center justify-center text-blue-500 mb-6 border border-blue-200 shadow-inner">
                    <FileText size={40} />
                </div>
                <h3 className="text-2xl font-black text-black mb-2 tracking-tight">Standard Professional Resume</h3>
                <p className="text-gray-600 text-sm font-medium mb-10 max-w-md">
                    Upload your latest resume to make it easier for recruiters to view your full profile. PDF is preferred.
                </p>

                {!user?.resumeUrl ? (
                    <label className="w-full max-w-md h-64 border-2 border-dashed border-gray-300 rounded-[2.5rem] flex flex-col items-center justify-center gap-6 cursor-pointer hover:bg-gray-50 hover:border-blue-500/50 transition-all group bg-white">
                        <div className={`p-6 rounded-full ${uploading ? 'bg-blue-100' : 'bg-gray-100 shadow-sm group-hover:bg-blue-600 group-hover:text-white'} transition-all text-gray-400`}>
                            {uploading ? <Loader2 size={32} className="animate-spin text-blue-500" /> : <Upload size={32} />}
                        </div>
                        <div className="text-center">
                            <p className="text-gray-700 font-black text-sm uppercase tracking-widest">{uploading ? 'Uploading...' : 'Tap to Upload'}</p>
                            <p className="text-gray-400 text-[10px] font-black uppercase tracking-widest mt-2">PDF, DOCX (Max 5MB)</p>
                        </div>
                        <input type="file" hidden onChange={handleFileChange} />
                    </label>
                ) : (
                    <div className="w-full max-w-md space-y-4">
                        <div className="bg-white border-2 border-gray-200 rounded-3xl p-6 flex items-center justify-between group shadow-sm">
                            <div className="flex items-center gap-4 text-left">
                                <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-600 border border-emerald-200 shadow-inner">
                                    <CheckCircle2 size={24} />
                                </div>
                                <div className="min-w-0">
                                    <p className="text-black font-black text-sm truncate max-w-[180px]">Latest_Resume.pdf</p>
                                    <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest">Active & Ready</p>
                                </div>
                            </div>
                            <div className="flex gap-2">

                                <label className="p-3 bg-gray-50 text-gray-500 border border-gray-200 rounded-xl hover:bg-blue-500 hover:text-white transition-all cursor-pointer">
                                    <RefreshCw size={18} />
                                    <input type="file" hidden onChange={handleFileChange} />
                                </label>
                            </div>
                        </div>
                        <p className="text-gray-500 text-[10px] font-black uppercase tracking-[0.2em]">Recruiters will see this file</p>
                    </div>
                )}
            </div>


            {/* Resume Tips */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="p-8 bg-white border border-gray-200 shadow-sm rounded-3xl flex gap-6">
                    <div className="text-blue-500"><AlertCircle size={24} /></div>
                    <div>
                        <h4 className="text-black font-black text-xs uppercase tracking-widest mb-2">ATS Optimization</h4>
                        <p className="text-gray-600 text-xs leading-relaxed font-medium">Ensure your resume uses standard fonts and clear headings so automated systems can read it correctly.</p>
                    </div>
                </div>
                <div className="p-8 bg-white border border-gray-200 shadow-sm rounded-3xl flex gap-6">
                    <div className="text-indigo-500"><CheckCircle2 size={24} /></div>
                    <div>
                        <h4 className="text-black font-black text-xs uppercase tracking-widest mb-2">Clean Design</h4>
                        <p className="text-gray-600 text-xs leading-relaxed font-medium">Keep it to 1-2 pages maximum. Use bullet points for impact and clear dates for easy scanning.</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResumeUpload;
