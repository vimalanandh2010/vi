import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

const StatsCard = ({ icon: Icon, label, value, color, trend }) => {
    return (
        <motion.div
            whileHover={{ y: -5 }}
            className="bg-slate-800/40 backdrop-blur-xl border border-slate-700/50 p-6 rounded-3xl shadow-xl hover:shadow-2xl hover:shadow-blue-900/10 transition-all"
        >
            <div className="flex items-start justify-between">
                <div>
                    <p className="text-slate-400 text-sm font-medium mb-1">{label}</p>
                    <h3 className="text-3xl font-bold text-white tracking-tight">{value}</h3>
                </div>
                <div className={`p-3 rounded-2xl bg-${color}-500/10 text-${color}-400`}>
                    <Icon size={24} />
                </div>
            </div>
            <div className="mt-4 flex items-center text-xs">
                {trend && (
                    <span className="text-green-400 flex items-center gap-1 font-medium">
                        <TrendingUp size={12} /> {trend}
                    </span>
                )}
                <span className="text-slate-500 ml-2">from last month</span>
            </div>
        </motion.div>
    );
};

export default StatsCard;
