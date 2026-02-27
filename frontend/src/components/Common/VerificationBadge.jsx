import React from 'react';
import { CheckCircle, ShieldCheck, Mail, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

const VerificationBadge = ({ level = 0, status = 'unverified', showLabel = true }) => {
    // level: 1 (Email), 2 (Domain Match), 3 (Fully Verified/DNS)

    if (status === 'unverified' || status === 'rejected') {
        return (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-slate-800/50 border border-slate-700/50 rounded-full text-slate-500 text-xs">
                <AlertTriangle size={14} />
                {showLabel && <span>Unverified</span>}
            </div>
        );
    }

    if (status === 'pending') {
        return (
            <div className="flex items-center gap-1.5 px-3 py-1 bg-orange-500/10 border border-orange-500/20 rounded-full text-orange-400 text-xs">
                <Mail size={14} className="animate-pulse" />
                {showLabel && <span>Verification Pending</span>}
            </div>
        );
    }

    const configs = {
        1: {
            label: 'Work Email Verified',
            color: 'blue',
            icon: Mail
        },
        2: {
            label: 'Domain Verified',
            color: 'indigo',
            icon: ShieldCheck
        },
        3: {
            label: 'Fully Verified Company',
            color: 'green',
            icon: CheckCircle
        }
    };

    const config = configs[level] || configs[1];
    const Icon = config.icon;

    return (
        <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className={`flex items-center gap-1.5 px-3 py-1 bg-${config.color}-500/10 border border-${config.color}-500/20 rounded-full text-${config.color}-400 text-xs font-medium shadow-sm`}
        >
            <Icon size={14} />
            {showLabel && <span>{config.label}</span>}
        </motion.div>
    );
};

export default VerificationBadge;
