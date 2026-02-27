import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Clock, Briefcase, ChevronRight, MoreHorizontal } from 'lucide-react';

const ActivePostings = ({ jobs }) => {
    if (!jobs || jobs.length === 0) {
        return (
            <div className="bg-slate-800/20 border border-slate-700/50 p-8 rounded-2xl text-center">
                <Briefcase className="mx-auto text-slate-600 mb-3" size={32} />
                <h3 className="text-slate-400 font-medium">No active job postings</h3>
                <Link to="/recruiter/post-job" className="text-blue-400 text-sm hover:underline mt-2 inline-block">
                    Create your first job
                </Link>
            </div>
        );
    }

    return (
        <section>
            <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold flex items-center gap-2">
                    <Clock className="text-blue-400" size={20} />
                    Active Postings
                </h2>
                <Link to="/recruiter/my-jobs" className="text-sm text-blue-400 hover:text-blue-300 flex items-center gap-1 font-medium transition-colors">
                    View All <ChevronRight size={16} />
                </Link>
            </div>

            <div className="space-y-4">
                {jobs.map((job) => (
                    <motion.div
                        key={job._id}
                        whileHover={{ x: 5 }}
                        className="bg-slate-800/30 border border-slate-700/30 p-5 rounded-2xl flex items-center justify-between group cursor-pointer hover:bg-slate-800/50 transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center border border-slate-700 group-hover:border-blue-500/50 transition-colors">
                                <Briefcase className="text-slate-400 group-hover:text-blue-400" size={24} />
                            </div>
                            <div>
                                <h4 className="font-bold text-white mb-0.5">{job.title}</h4>
                                <div className="flex items-center gap-3 text-xs text-slate-500">
                                    <span>{new Date(job.posted).toLocaleDateString()}</span>
                                    <span className="w-1 h-1 rounded-full bg-slate-700" />
                                    <span className="text-blue-400 font-medium">{job.applicants} Applicants</span>
                                </div>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <span className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${job.status?.toLowerCase() === 'active'
                                ? 'bg-green-500/10 text-green-400 border border-green-500/20'
                                : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                                }`}>
                                {job.status}
                            </span>
                            <button className="p-2 text-slate-500 hover:text-white rounded-lg hover:bg-slate-700 transition-all">
                                <MoreHorizontal size={18} />
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </section>
    );
};

export default ActivePostings;
