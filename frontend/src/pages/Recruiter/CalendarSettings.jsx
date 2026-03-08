import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
    Calendar, Settings, CheckCircle, XCircle, RefreshCw, 
    LogOut, Info, Shield, Mail, Clock, AlertTriangle
} from 'lucide-react';
import axiosClient from '../../api/axiosClient';
import { toast } from 'react-toastify';

const CalendarSettings = () => {
    const [loading, setLoading] = useState(true);
    const [connectionStatus, setConnectionStatus] = useState(null);
    const [disconnecting, setDisconnecting] = useState(false);
    const [showDisconnectModal, setShowDisconnectModal] = useState(false);

    useEffect(() => {
        fetchConnectionStatus();
    }, []);

    const fetchConnectionStatus = async () => {
        try {
            const data = await axiosClient.get('/calendar/status');
            setConnectionStatus(data);
        } catch (error) {
            console.error('Failed to fetch calendar status:', error);
            toast.error('Failed to load calendar settings');
        } finally {
            setLoading(false);
        }
    };

    const handleConnect = async () => {
        try {
            const data = await axiosClient.get('/calendar/auth-url');
            
            const width = 600;
            const height = 700;
            const left = window.screen.width / 2 - width / 2;
            const top = window.screen.height / 2 - height / 2;
            
            window.open(
                data.authUrl,
                'Google Calendar Authorization',
                `width=${width},height=${height},left=${left},top=${top}`
            );

            // Listen for OAuth success
            const handleMessage = (event) => {
                if (event.origin !== window.location.origin) return;
                
                if (event.data.type === 'GOOGLE_CALENDAR_AUTH_SUCCESS') {
                    toast.success('Successfully connected!');
                    fetchConnectionStatus();
                    window.removeEventListener('message', handleMessage);
                }
            };

            window.addEventListener('message', handleMessage);

        } catch (error) {
            toast.error('Failed to connect Google Calendar');
            console.error(error);
        }
    };

    const handleDisconnect = async () => {
        setDisconnecting(true);
        try {
            await axiosClient.post('/calendar/disconnect');
            toast.success('Calendar disconnected successfully');
            setConnectionStatus({ connected: false });
            setShowDisconnectModal(false);
            fetchConnectionStatus();
        } catch (error) {
            toast.error('Failed to disconnect calendar');
            console.error(error);
        } finally {
            setDisconnecting(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <RefreshCw className="w-8 h-8 text-blue-600 animate-spin" />
            </div>
        );
    }

    return (
        <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-8">
                <div className="flex items-center gap-3 mb-3">
                    <div className="p-3 bg-blue-50 rounded-2xl">
                        <Settings className="w-6 h-6 text-blue-600" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-black text-black">Calendar Settings</h1>
                        <p className="text-slate-500 font-medium">Manage your Google Calendar integration</p>
                    </div>
                </div>
            </div>

            {/* Connection Status Card */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-3xl shadow-lg border border-slate-100 p-8 mb-6"
            >
                <div className="flex items-start justify-between mb-6">
                    <div className="flex items-center gap-4">
                        <div className={`p-4 rounded-2xl ${
                            connectionStatus?.connected 
                                ? 'bg-emerald-50' 
                                : 'bg-slate-50'
                        }`}>
                            <Calendar className={`w-8 h-8 ${
                                connectionStatus?.connected 
                                    ? 'text-emerald-600' 
                                    : 'text-slate-400'
                            }`} />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-black flex items-center gap-2">
                                Connection Status
                                {connectionStatus?.connected ? (
                                    <CheckCircle className="w-5 h-5 text-emerald-600" />
                                ) : (
                                    <XCircle className="w-5 h-5 text-slate-400" />
                                )}
                            </h2>
                            <p className="text-slate-500 text-sm font-medium mt-1">
                                {connectionStatus?.connected 
                                    ? `Connected to ${connectionStatus.email || 'Google Calendar'}`
                                    : 'Not connected to Google Calendar'
                                }
                            </p>
                        </div>
                    </div>

                    {connectionStatus?.connected ? (
                        <button
                            onClick={() => setShowDisconnectModal(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-xl font-bold text-sm transition-all"
                        >
                            <LogOut size={16} />
                            Disconnect
                        </button>
                    ) : (
                        <button
                            onClick={handleConnect}
                            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-sm transition-all shadow-lg"
                        >
                            <Calendar size={16} />
                            Connect Now
                        </button>
                    )}
                </div>

                {/* Status Details */}
                {connectionStatus?.connected && (
                    <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-4">
                        <div className="flex items-start gap-3">
                            <CheckCircle className="text-emerald-600 flex-shrink-0 mt-0.5" size={20} />
                            <div className="flex-1">
                                <p className="font-bold text-black text-sm mb-2">Active Features:</p>
                                <ul className="space-y-1 text-sm text-slate-600">
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                        Automatic calendar event creation
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                        Email invitations to candidates
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                        Interview reminders and notifications
                                    </li>
                                    <li className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-600" />
                                        Sync with Google Calendar app
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Information Cards */}
            <div className="grid md:grid-cols-2 gap-6">
                {/* How It Works */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-blue-50 rounded-xl">
                            <Info className="w-5 h-5 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-bold text-black">How It Works</h3>
                    </div>
                    <ul className="space-y-3 text-sm text-slate-600">
                        <li className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">1</div>
                            <span>Connect your Google Calendar account once</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">2</div>
                            <span>Schedule interviews from applicant pages</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">3</div>
                            <span>Events automatically sync to your calendar</span>
                        </li>
                        <li className="flex items-start gap-3">
                            <div className="w-6 h-6 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center font-bold text-xs flex-shrink-0">4</div>
                            <span>Candidates receive calendar invites via email</span>
                        </li>
                    </ul>
                </motion.div>

                {/* Privacy & Security */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className="bg-white rounded-3xl shadow-lg border border-slate-100 p-6"
                >
                    <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 bg-green-50 rounded-xl">
                            <Shield className="w-5 h-5 text-green-600" />
                        </div>
                        <h3 className="text-lg font-bold text-black">Privacy & Security</h3>
                    </div>
                    <ul className="space-y-3 text-sm text-slate-600">
                        <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>OAuth 2.0 secure authentication</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>Only calendar access, no other data</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>Encrypted token storage</span>
                        </li>
                        <li className="flex items-start gap-2">
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0 mt-0.5" />
                            <span>Disconnect anytime without data loss</span>
                        </li>
                    </ul>
                </motion.div>
            </div>

            {/* Disconnect Confirmation Modal */}
            <AnimatePresence>
                {showDisconnectModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[200] p-4"
                        onClick={() => !disconnecting && setShowDisconnectModal(false)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-3xl shadow-2xl max-w-md w-full p-8"
                        >
                            <div className="flex items-center gap-4 mb-6">
                                <div className="p-3 bg-red-50 rounded-2xl">
                                    <AlertTriangle className="text-red-600" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-2xl font-black text-black">Disconnect Calendar?</h3>
                                    <p className="text-slate-400 font-medium text-sm">This action can be reversed</p>
                                </div>
                            </div>

                            <div className="bg-yellow-50/50 border border-yellow-100 rounded-2xl p-4 mb-6">
                                <p className="text-sm text-slate-600">
                                    <strong className="text-black">Note:</strong> Existing calendar events will remain in your Google Calendar, 
                                    but new interviews won't be synced automatically until you reconnect.
                                </p>
                            </div>

                            <div className="flex gap-3">
                                <button
                                    onClick={() => setShowDisconnectModal(false)}
                                    disabled={disconnecting}
                                    className="flex-1 py-3 bg-slate-100 hover:bg-slate-200 text-black rounded-2xl font-bold text-sm transition-all disabled:opacity-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleDisconnect}
                                    disabled={disconnecting}
                                    className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl font-bold text-sm transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {disconnecting ? (
                                        <>
                                            <RefreshCw size={16} className="animate-spin" />
                                            Disconnecting...
                                        </>
                                    ) : (
                                        <>
                                            <LogOut size={16} />
                                            Disconnect
                                        </>
                                    )}
                                </button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default CalendarSettings;
