import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Check, AlertCircle, Loader2, ExternalLink } from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { toast } from 'react-toastify';

const GoogleCalendarSync = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(true);
    const [syncing, setSyncing] = useState(false);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        checkConnectionStatus();

        // Listen for OAuth callback messages
        const handleMessage = (event) => {
            // Verify origin for security
            if (event.origin !== window.location.origin) return;

            if (event.data.type === 'GOOGLE_CALENDAR_AUTH_SUCCESS') {
                toast.success('Successfully connected to Google Calendar!');
                setIsConnected(true);
                checkConnectionStatus();
            } else if (event.data.type === 'GOOGLE_CALENDAR_AUTH_ERROR') {
                toast.error(event.data.error || 'Failed to connect Google Calendar');
            }
        };

        window.addEventListener('message', handleMessage);
        return () => window.removeEventListener('message', handleMessage);
    }, []);

    const checkConnectionStatus = async () => {
        try {
            const data = await axiosClient.get('/calendar/status');
            setIsConnected(data.connected);
        } catch (error) {
            console.error('Error checking calendar status:', error);
        } finally {
            setLoading(false);
        }
    };

    const connectGoogleCalendar = async () => {
        try {
            const data = await axiosClient.get('/calendar/auth-url');
            // Open Google OAuth in popup
            const width = 600;
            const height = 700;
            const left = window.screen.width / 2 - width / 2;
            const top = window.screen.height / 2 - height / 2;
            
            window.open(
                data.authUrl,
                'Google Calendar Authorization',
                `width=${width},height=${height},left=${left},top=${top}`
            );

            // postMessage handler will update connection status

        } catch (error) {
            toast.error('Failed to connect Google Calendar');
            console.error(error);
        }
    };

    const syncAllInterviews = async () => {
        setSyncing(true);
        try {
            const data = await axiosClient.post('/calendar/sync-all');
            toast.success(data.message || `Synced ${data.syncedCount} interviews successfully!`);
            setShowModal(false);
        } catch (error) {
            if (error.response?.data?.requiresAuth) {
                toast.error('Please reconnect your Google Calendar');
                setIsConnected(false);
            } else {
                toast.error('Failed to sync interviews');
            }
            console.error(error);
        } finally {
            setSyncing(false);
        }
    };

    if (loading) {
        return <div className="animate-pulse bg-slate-100 rounded-2xl h-12 w-48"></div>;
    }

    return (
        <>
            {isConnected ? (
                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 bg-emerald-50 text-emerald-600 px-4 py-2 rounded-xl border border-emerald-100">
                        <Check size={16} />
                        <span className="text-xs font-bold">Connected</span>
                    </div>
                    <button
                        onClick={() => setShowModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-black hover:bg-slate-800 text-white rounded-xl font-bold text-sm transition-all shadow-lg"
                    >
                        <CalendarIcon size={16} />
                        Sync to Google Calendar
                    </button>
                </div>
            ) : (
                <button
                    onClick={connectGoogleCalendar}
                    className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg"
                >
                    <CalendarIcon size={16} />
                    Connect Google Calendar
                </button>
            )}

            {/* Sync Confirmation Modal */}
            <AnimatePresence>
                {showModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4"
                        onClick={() => !syncing && setShowModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-blue-50 rounded-2xl">
                                    <CalendarIcon className="text-blue-600" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-black">Sync Interviews</h3>
                                    <p className="text-slate-400 font-medium text-sm">to Google Calendar</p>
                                </div>
                            </div>

                            <div className="bg-blue-50/50 border border-blue-100 rounded-2xl p-4 mb-6">
                                <div className="flex items-start gap-3">
                                    <AlertCircle className="text-blue-600 flex-shrink-0 mt-0.5" size={18} />
                                    <div className="text-sm">
                                        <p className="font-bold text-black mb-1">What will happen:</p>
                                        <ul className="text-slate-600 space-y-1 text-xs">
                                            <li>• All scheduled interviews will be added to your Google Calendar</li>
                                            <li>• Candidates will receive calendar invites automatically</li>
                                            <li>• Meeting links will be included in calendar events</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowModal(false)}
                                    disabled={syncing}
                                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-black rounded-2xl font-bold text-sm transition-all disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={syncAllInterviews}
                                    disabled={syncing}
                                    className="flex-1 py-3 bg-black hover:bg-slate-800 text-white rounded-2xl font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {syncing ? (
                                        <>
                                            <Loader2 size={16} className="animate-spin" />
                                            Syncing...
                                        </>
                                    ) : (
                                        <>
                                            <Check size={16} />
                                            Sync Now
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    );
};

export default GoogleCalendarSync;
