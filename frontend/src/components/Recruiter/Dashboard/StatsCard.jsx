import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

const StatsCard = ({ icon: Icon, label, value, color, trend }) => {
    const colorVariants = {
        blue: { bg: 'bg-blue-50', text: 'text-blue-600', iconBg: 'bg-blue-600/10' },
        purple: { bg: 'bg-purple-50', text: 'text-purple-600', iconBg: 'bg-purple-600/10' },
        orange: { bg: 'bg-orange-50', text: 'text-orange-600', iconBg: 'bg-orange-600/10' },
        green: { bg: 'bg-green-50', text: 'text-green-600', iconBg: 'bg-green-600/10' },
    };

    const theme = colorVariants[color] || colorVariants.blue;

    return (
        <motion.div
            whileHover={{ y: -5, scale: 1.02 }}
            className="group bg-white border border-slate-100 p-8 rounded-[2rem] shadow-sm hover:shadow-2xl hover:border-transparent transition-all duration-300"
        >
            <div className="flex items-start justify-between">
                <div className="space-y-1">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.1em]">{label}</p>
                    <h3 className="text-4xl font-black text-black tracking-tighter">{value}</h3>
                </div>
                <div className={`p-4 rounded-2xl ${theme.bg} ${theme.text} group-hover:scale-110 transition-transform duration-300`}>
                    <Icon size={24} />
                </div>
            </div>

            <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center text-[10px] font-bold uppercase tracking-tight">
                    {trend ? (
                        <span className="text-green-500 flex items-center gap-1 bg-green-50 px-2 py-1 rounded-lg">
                            <TrendingUp size={12} strokeWidth={3} /> {trend}
                        </span>
                    ) : (
                        <span className="text-slate-300">Stable</span>
                    )}
                    <span className="text-slate-400 ml-2">vs last month</span>
                </div>

                <div className="w-12 h-1 bg-slate-50 rounded-full overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: trend ? '100%' : '30%' }}
                        className={`h-full ${theme.bg.replace('50', '500')}`}
                    />
                </div>
            </div>
        </motion.div>
    );
};

export default StatsCard;
