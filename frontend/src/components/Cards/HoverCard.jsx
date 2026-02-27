import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Base HoverCard - A beautiful card component with smooth reveal animations
 * 
 * @param {string} variant - Card style variant: 'glass', 'gradient', 'minimal'
 * @param {string} glowColor - Color for the hover glow effect
 * @param {React.ReactNode} children - Main content
 * @param {React.ReactNode} revealContent - Content revealed on hover
 * @param {string} className - Additional classes
 */
const HoverCard = ({
    children,
    revealContent,
    variant = 'glass',
    glowColor = 'blue',
    className = '',
    revealPosition = 'bottom' // 'bottom', 'overlay', 'slide'
}) => {
    const [isHovered, setIsHovered] = useState(false);

    const baseClasses = "relative overflow-hidden rounded-3xl transition-all duration-500";

    const variantClasses = {
        glass: "bg-slate-800/30 backdrop-blur-xl border border-slate-700/30 hover:bg-slate-800/50",
        gradient: "bg-gradient-to-br from-slate-800/80 to-slate-900/80 border border-slate-700/50",
        minimal: "bg-slate-900/50 border border-slate-800/50 hover:border-slate-700"
    };

    const glowColors = {
        blue: { light: 'blue-500/20', dark: 'blue-500/40', text: 'blue-400' },
        purple: { light: 'purple-500/20', dark: 'purple-500/40', text: 'purple-400' },
        green: { light: 'green-500/20', dark: 'green-500/40', text: 'green-400' },
        orange: { light: 'orange-500/20', dark: 'orange-500/40', text: 'orange-400' },
        pink: { light: 'pink-500/20', dark: 'pink-500/40', text: 'pink-400' },
        cyan: { light: 'cyan-500/20', dark: 'cyan-500/40', text: 'cyan-400' },
    };

    const currentGlow = glowColors[glowColor] || glowColors.blue;

    const revealVariants = {
        bottom: {
            hidden: { y: '100%', opacity: 0 },
            visible: { y: 0, opacity: 1, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } }
        },
        overlay: {
            hidden: { opacity: 0, scale: 0.95 },
            visible: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: 'easeOut' } }
        },
        slide: {
            hidden: { x: '-100%', opacity: 0 },
            visible: { x: 0, opacity: 1, transition: { duration: 0.4, ease: [0.25, 0.46, 0.45, 0.94] } }
        }
    };

    return (
        <motion.div
            className={`${baseClasses} ${variantClasses[variant]} group ${className}`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            whileHover={{ y: -4 }}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
        >
            {/* Ambient Glow Effect */}
            <motion.div
                className={`absolute inset-0 bg-gradient-to-br ${currentGlow.light} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`}
                initial={{ opacity: 0 }}
                animate={{ opacity: isHovered ? 1 : 0 }}
            />

            {/* Corner Glow */}
            <motion.div
                className={`absolute -top-20 -right-20 w-40 h-40 bg-${currentGlow.dark} rounded-full blur-[80px] opacity-0 group-hover:opacity-60 transition-all duration-700`}
            />
            <motion.div
                className={`absolute -bottom-20 -left-20 w-40 h-40 bg-${currentGlow.dark} rounded-full blur-[80px] opacity-0 group-hover:opacity-60 transition-all duration-700 delay-100`}
            />

            {/* Main Content */}
            <div className="relative z-10">
                {children}
            </div>

            {/* Reveal Content */}
            <AnimatePresence>
                {isHovered && revealContent && (
                    <motion.div
                        className={`relative z-20 ${revealPosition === 'overlay'
                                ? 'absolute inset-0 bg-slate-900/95 backdrop-blur-xl'
                                : ''
                            }`}
                        initial="hidden"
                        animate="visible"
                        exit="hidden"
                        variants={revealVariants[revealPosition]}
                    >
                        {revealContent}
                    </motion.div>
                )}
            </AnimatePresence>
        </motion.div>
    );
};

export default HoverCard;
