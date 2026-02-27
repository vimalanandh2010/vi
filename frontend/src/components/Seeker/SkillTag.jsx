import React from 'react';

const SkillTag = ({ skill, theme = 'premium-dark' }) => {
    const isPremium = theme === 'premium-dark';

    return (
        <div className={`
            px-5 py-2.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em]
            transition-all duration-500 cursor-default flex items-center gap-2
            ${isPremium
                ? 'bg-white/[0.03] border border-white/5 text-slate-400 hover:border-blue-500/50 hover:text-white hover:bg-white/[0.07] hover:-translate-y-1 shadow-xl'
                : 'bg-white border border-slate-100 text-slate-600 hover:border-blue-300 hover:text-blue-600 shadow-sm'}
        `}>
            <div className={`w-1.5 h-1.5 rounded-full ${isPremium ? 'bg-blue-600 shadow-[0_0_10px_rgba(37,99,235,0.8)]' : 'bg-blue-400'}`} />
            {skill}
        </div>
    );
};

export default SkillTag;
