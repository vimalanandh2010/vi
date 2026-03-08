import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const CollapsibleSection = ({ title, icon: Icon, children, defaultOpen = false, theme = 'premium-dark', action }) => {
    const [isOpen, setIsOpen] = useState(defaultOpen);
    const isPremium = theme === 'premium-dark';

    return (
        <div className={`overflow-hidden transition-all duration-700 ${isOpen ? 'mb-10' : 'mb-4'} ${isPremium ? 'bg-slate-900/40 backdrop-blur-2xl border border-white/5 shadow-2xl shadow-black/40' : 'bg-white border-2 border-gray-200 shadow-md'} rounded-[2.5rem]`}>
            <div className="flex items-center justify-between px-10 py-10 group">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="flex flex-1 items-center gap-6 text-left"
                >
                    <div className={`w-16 h-16 rounded-[1.25rem] ${isPremium ? 'bg-white/5 border-white/5 text-blue-500' : 'bg-blue-50 border-2 border-blue-200 text-blue-600'} flex items-center justify-center transition-all duration-500 group-hover:scale-110 group-hover:rotate-6 shadow-md`}>
                        {Icon && <Icon size={28} strokeWidth={2.5} />}
                    </div>
                    <div>
                        <h3 className={`text-2xl font-black ${isPremium ? 'text-white' : 'text-gray-900'} tracking-tight`}>{title}</h3>
                        <p className="text-gray-500 text-xs font-bold uppercase tracking-[0.2em] mt-1">{isOpen ? 'Hide Details' : 'Expand Section'}</p>
                    </div>
                </button>
                <div className="flex items-center gap-4">
                    {action && (
                        <div onClick={(e) => e.stopPropagation()}>
                            {action}
                        </div>
                    )}
                    <button
                        onClick={() => setIsOpen(!isOpen)}
                        className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-700 ${isOpen ? 'bg-blue-600 text-white rotate-180' : isPremium ? 'bg-white/5 text-slate-500 border border-white/5 hover:bg-white/10' : 'bg-gray-50 text-gray-600 border-2 border-gray-200 hover:bg-gray-100'}`}
                    >
                        <ChevronDown size={24} strokeWidth={4} />
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    >
                        <div className={`px-10 pb-12 pt-4 border-t-2 ${isPremium ? 'border-white/5' : 'border-gray-200'}`}>
                            <motion.div
                                initial={{ y: 20, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                transition={{ delay: 0.3, duration: 0.8 }}
                            >
                                {children}
                            </motion.div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CollapsibleSection;
