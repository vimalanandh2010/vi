import React from 'react';
import { X, Download, ExternalLink, FileText } from 'lucide-react';

const ResumeViewerModal = ({ isOpen, onClose, resumeUrl, userName = 'Resume' }) => {
    if (!isOpen) return null;

    // Use the backend proxy to ensure proper headers and bypass CORS
    // Append token for authentication since iframes don't send headers easily
    const token = localStorage.getItem('seekerToken') || localStorage.getItem('recruiterToken');
    const apiUrl = import.meta.env.VITE_API_URL || '/api';
    const viewUrl = resumeUrl
        ? `${apiUrl}/jobseeker/proxy-resume?url=${encodeURIComponent(resumeUrl)}${token ? `&token=${token}` : ''}`
        : null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm">
            <div className="relative w-full h-full max-w-6xl max-h-[90vh] m-4 bg-slate-900 rounded-3xl shadow-2xl border border-white/10 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b border-white/10">
                    <div>
                        <h2 className="text-xl font-black text-white tracking-tight">
                            {userName}'s Resume
                        </h2>
                        <p className="text-xs text-slate-500 font-medium mt-1">
                            PDF Document
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <a
                            href={resumeUrl}
                            download
                            className="p-3 bg-white/5 text-slate-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                            title="Download Resume"
                        >
                            <Download size={20} />
                        </a>
                        <a
                            href={resumeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-3 bg-white/5 text-slate-400 rounded-xl hover:bg-blue-600 hover:text-white transition-all"
                            title="Open in New Tab"
                        >
                            <ExternalLink size={20} />
                        </a>
                        <button
                            onClick={onClose}
                            className="p-3 bg-white/5 text-slate-400 rounded-xl hover:bg-red-600 hover:text-white transition-all"
                            title="Close"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* PDF Viewer */}
                <div className="flex-1 overflow-hidden p-4">
                    <iframe
                        src={viewUrl}
                        className="w-full h-full rounded-2xl bg-white"
                        title="Resume Viewer"
                        style={{ border: 'none' }}
                    />
                </div>
            </div>
        </div>
    );
};

export default ResumeViewerModal;
