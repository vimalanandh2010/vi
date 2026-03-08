import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Check, AlertCircle, X, Shield, AtSign } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-toastify';

const ChatIdModal = ({ isOpen, onClose, currentId, onSave }) => {
    const [chatId, setChatId] = useState('');
    const [isAvailable, setIsAvailable] = useState(null);
    const [loading, setLoading] = useState(false);
    const [checking, setChecking] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (currentId) setChatId(currentId);
    }, [currentId]);

    const validateFormat = (id) => {
        const regex = /^[a-z0-9_]{3,20}$/;
        return regex.test(id);
    };

    const handleCheckAvailability = async (id) => {
        if (!validateFormat(id)) {
            setIsAvailable(false);
            setError('Use 3-20 lowercase letters, numbers, or underscores');
            return;
        }

        if (id === currentId) {
            setIsAvailable(true);
            setError('');
            return;
        }

        setChecking(true);
        setError('');
        try {
            const res = await axios.get(`/api/chat/check-id/${id}`);
            setIsAvailable(res.data.available);
            if (!res.data.available) setError('This Chat ID is already taken');
        } catch (err) {
            console.error(err);
        } finally {
            setChecking(false);
        }
    };

    useEffect(() => {
        const delayDebounce = setTimeout(() => {
            if (chatId && chatId !== currentId) {
                handleCheckAvailability(chatId);
            } else if (chatId === currentId) {
                setIsAvailable(true);
                setError('');
            } else {
                setIsAvailable(null);
                setError('');
            }
        }, 500);

        return () => clearTimeout(delayDebounce);
    }, [chatId]);

    const handleSave = async () => {
        if (!isAvailable || loading) return;

        setLoading(true);
        try {
            const res = await axiosClient.post('chat/set-id', { chatId }); // Changed axios.post and removed /api
            if (res.success) { // Removed .data
                toast.success('Chat ID updated successfully!');
                onSave(chatId);
                onClose();
            }
        } catch (err) {
            toast.error(err.response?.data?.message || 'Failed to save Chat ID');
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="absolute inset-0 bg-slate-950/80 backdrop-blur-xl"
                onClick={currentId ? onClose : undefined}
            />
            <motion.div
                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                className="relative w-full max-w-md bg-slate-900 border border-slate-800 rounded-[32px] p-8 shadow-2xl"
            >
                <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-500 mx-auto mb-4 border border-blue-500/20">
                        <AtSign size={32} />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">
                        {currentId ? 'Edit your Chat ID' : 'Choose your Chat ID'}
                    </h2>
                    <p className="text-slate-400 text-sm leading-relaxed px-4">
                        Your Chat ID is your unique identifier on Future Milestone. Others can use it to find and message you.
                    </p>
                </div>

                <div className="space-y-6">
                    <div className="relative group">
                        <label className="text-[10px] font-black uppercase tracking-widest text-slate-500 mb-2 block ml-1">Unique Identifier</label>
                        <div className={`flex items-center bg-slate-800/50 border-2 rounded-2xl px-4 py-3.5 transition-all focus-within:ring-4 ${error ? 'border-red-500/50 focus-within:ring-red-500/10' :
                            isAvailable === true ? 'border-green-500/50 focus-within:ring-green-500/10' :
                                'border-slate-700/50 focus-within:ring-blue-500/10'
                            }`}>
                            <span className="text-slate-500 font-bold mr-1">@</span>
                            <input
                                type="text"
                                value={chatId}
                                onChange={(e) => setChatId(e.target.value.toLowerCase().replace(/ /g, '_'))}
                                placeholder="unique_handle_123"
                                className="bg-transparent border-none text-white focus:ring-0 p-0 text-lg font-medium w-full placeholder:text-slate-700"
                            />
                            <div className="flex items-center gap-2">
                                {checking && <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />}
                                {!checking && isAvailable === true && <Check size={20} className="text-green-500" />}
                                {!checking && error && <AlertCircle size={20} className="text-red-500" />}
                            </div>
                        </div>
                        <AnimatePresence>
                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="text-xs text-red-400 mt-2 ml-1 font-medium flex items-center gap-2"
                                >
                                    <AlertCircle size={12} /> {error}
                                </motion.p>
                            )}
                        </AnimatePresence>
                    </div>

                    <div className="pt-4">
                        <button
                            onClick={handleSave}
                            disabled={!isAvailable || loading || checking || (chatId === currentId && currentId)}
                            className="w-full py-4 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 disabled:hover:bg-blue-600 text-white rounded-2xl font-bold text-lg transition-all shadow-xl shadow-blue-500/20 flex items-center justify-center gap-2 active:scale-[0.98]"
                        >
                            {loading ? <div className="w-6 h-6 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : 'Confirm Chat ID'}
                        </button>
                        {currentId && (
                            <button
                                onClick={onClose}
                                className="w-full mt-4 py-2 text-slate-500 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider"
                            >
                                Cancel
                            </button>
                        )}
                    </div>
                </div>

                <div className="mt-8 p-4 bg-blue-500/5 rounded-2xl border border-blue-500/10 flex items-start gap-3">
                    <Shield size={18} className="text-blue-400 shrink-0 mt-0.5" />
                    <p className="text-[10px] text-slate-500 leading-normal">
                        Your internal ID remains stable. Changing your Chat ID won't loose any old messages or connections.
                    </p>
                </div>
            </motion.div>
        </div>
    );
};

export default ChatIdModal;
