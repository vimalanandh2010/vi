import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Clock, Briefcase, ChevronRight, MoreHorizontal } from 'lucide-react';

const ActivePostings = ({ jobs }) => {
    if (!jobs || jobs.length === 0) {
        return (
            <div className="bg-white border border-slate-100 p-12 rounded-[2.5rem] shadow-sm text-center">
                <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
                    <Briefcase className="text-slate-200" size={32} />
                </div>
                <h3 className="text-black font-black uppercase text-xs tracking-widest mb-2">No active job postings</h3>
                <Link to="/recruiter/post-job" className="text-blue-600 text-[10px] font-black uppercase tracking-widest hover:underline">
                    Create your first job
                </Link>
            </div>
        );
    }

    return (
        <section className="bg-white border border-slate-100 rounded-[2.5rem] p-8 shadow-sm hover:shadow-xl transition-all duration-300">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h3 className="text-xl font-black text-black">Active Postings</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Recruitment Overview</p>
                </div>
                <Link
                    to="/recruiter/my-jobs"
                    className="flex items-center gap-2 px-4 py-2 bg-slate-50 hover:bg-black hover:text-white text-slate-500 rounded-xl text-[10px] font-black uppercase transition-all duration-300"
                >
                    View All <ChevronRight size={14} />
                </Link>
            </div>

            <div className="space-y-4">
                {jobs.map((job) => (
                    <motion.div
                        key={job._id}
                        whileHover={{ x: 5 }}
                        className="bg-slate-50 border border-transparent hover:border-slate-100 hover:bg-white p-6 rounded-3xl flex items-center justify-between group cursor-pointer hover:shadow-lg transition-all duration-300"
                    >
                        <div className="flex items-center gap-5">
                            <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all duration-300 shadow-sm">
                                <Briefcase className="text-slate-300 group-hover:text-white" size={24} />
                            </div>
                            <div>
                                <h4 className="text-lg font-black text-black mb-1 group-hover:text-blue-600 transition-colors">{job.title}</h4>
                                <div className="flex items-center gap-3 text-[10px] font-black text-slate-400 uppercase tracking-tight">
                                    <span>{new Date(job.posted || job.createdAt).toLocaleDateString()}</span>
                                    <span className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                    <span className="text-blue-600">{job.applicants?.length || job.applicants || 0} Applicants</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className={`px-4 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-widest border shadow-sm ${(job.status?.toLowerCase() === 'active' || job.status?.toLowerCase() === 'published')
                                    ? 'bg-green-50 text-green-600 border-green-100'
                                    : 'bg-slate-50 text-slate-500 border-slate-100'
                                }`}>
                                {job.status}
                            </span>
                            <button className="p-3 text-slate-300 hover:text-black hover:bg-slate-50 rounded-xl transition-all">
                                <MoreHorizontal size={20} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default ActivePostings;
