import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { JitsiMeeting } from '@jitsi/react-sdk';
import { Loader2, ArrowLeft, ExternalLink } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';

const InterviewRoom = () => {
    const { applicationId } = useParams();
    const navigate = useNavigate();
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    // In a real application, you might verify the applicationId belongs to the user
    // and that an interview is scheduled. For now, we allow the room to load.
    const [applicationData, setApplicationData] = useState(null);

    useEffect(() => {
        const fetchApplication = async () => {
            if (!applicationId) {
                setError("Invalid interview link.");
                setLoading(false);
                return;
            }

            try {
                const res = await axiosClient.get(`/jobs/application/${applicationId}`);
                setApplicationData(res);
            } catch (err) {
                console.error("Error fetching application:", err);
                // If it fails, we'll still try to load Jitsi as a fallback
                // unless it's a 404
                if (err.response?.status === 404) {
                    setError("Interview application not found.");
                }
            } finally {
                setLoading(false);
            }
        };

        fetchApplication();
    }, [applicationId]);

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
                <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
                <p className="text-slate-400 font-medium">Preparing Interview Room...</p>
            </div>
        );
    }

    if (error) {
        return (
            <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center text-white">
                <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl text-center max-w-md">
                    <p className="text-red-400 font-bold mb-4">{error}</p>
                    <button
                        onClick={() => {
                            if (window.history.length > 1) {
                                navigate(-1);
                            } else {
                                navigate(user?.role === 'seeker' ? '/seeker/dashboard' : '/recruiter/dashboard');
                            }
                        }}
                        className="px-6 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl transition-colors cursor-pointer"
                    >
                        Go Back
                    </button>
                </div>
            </div>
        );
    }

    const roomName = `FutureMilestone-Interview-${applicationId}`;
    const displayName = user ? `${user.firstName || ''} ${user.lastName || ''}`.trim() : 'Guest';
    const isRecruiter = user?.role === 'employer' || user?.role === 'recruiter';
    const customLink = applicationData?.meetingLink;

    return (
        <div className="flex flex-col h-screen bg-[#040404]">
            {/* Minimal Header */}
            <div className="flex items-center justify-between px-6 py-4 bg-slate-900 border-b border-slate-800">
                <div className="flex items-center gap-4">
                    <button
                        onClick={() => {
                            if (window.history.length > 1) {
                                navigate(-1);
                            } else {
                                navigate(user?.role === 'seeker' ? '/seeker/dashboard' : '/recruiter/dashboard');
                            }
                        }}
                        className="p-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-slate-400 hover:text-white transition-all cursor-pointer z-50"
                        title="Exit Room"
                    >
                        <ArrowLeft size={20} />
                    </button>
                    <div>
                        <h1 className="text-white font-bold tracking-wide">Interview Session</h1>
                        <p className="text-xs text-blue-400">
                            {applicationData?.job?.title ? `${applicationData.job.title} Interview` : `ID: ${applicationId.substring(0, 8)}...`}
                        </p>
                    </div>
                </div>

                <div className="px-4 py-1.5 bg-green-500/10 border border-green-500/20 text-green-400 rounded-full text-xs font-black uppercase tracking-widest flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
                    Live
                </div>
            </div>

            {/* Meeting Container */}
            <div className="flex-1 w-full bg-black relative overflow-hidden">
                {customLink ? (
                    /* Custom Meeting Portal (Google Meet / Zoom) */
                    <div className="h-full flex flex-col items-center justify-center p-6 bg-gradient-to-b from-slate-950 to-slate-900">
                        <div className="w-full max-w-xl bg-slate-900/50 backdrop-blur-xl border border-white/10 p-10 rounded-[3rem] shadow-2xl text-center">
                            <div className="w-20 h-20 bg-blue-600/20 rounded-3xl flex items-center justify-center text-blue-500 mx-auto mb-8">
                                <ExternalLink size={40} />
                            </div>

                            <h2 className="text-3xl font-black text-white mb-4">Your Meeting is Ready</h2>
                            <p className="text-slate-400 mb-10 leading-relaxed text-lg">
                                This interview is being held on an external platfrom.<br />
                                Click the button below to join the session.
                            </p>

                            <a
                                href={customLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-3 px-10 py-5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black text-xl transition-all shadow-xl shadow-blue-900/40 group hover:-translate-y-1"
                            >
                                <ExternalLink size={24} className="group-hover:rotate-12 transition-transform" />
                                Join Meeting Now
                            </a>

                            {isRecruiter && (
                                <button
                                    onClick={async () => {
                                        if (window.confirm("Mark this interview as completed? Candidate will be moved to Finished Interviews.")) {
                                            try {
                                                await axiosClient.patch(`/jobs/application/${applicationId}/status`, { status: 'interviewed' });
                                                navigate(-1);
                                            } catch (err) {
                                                console.error("Failed to update status:", err);
                                                alert("Failed to update status. Please try again.");
                                            }
                                        }
                                    }}
                                    className="mt-6 px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-bold text-sm transition-all border border-slate-700 flex items-center gap-2"
                                >
                                    <CheckCircle size={18} className="text-emerald-500" />
                                    Mark as Interviewed
                                </button>
                            )}

                            <div className="mt-12 flex items-center justify-center gap-6 pt-8 border-t border-white/5">
                                <div className="text-center">
                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Platform</p>
                                    <p className="text-sm text-slate-300 font-bold">
                                        {customLink.includes('google.com') ? 'Google Meet' : customLink.includes('zoom.us') ? 'Zoom' : 'External'}
                                    </p>
                                </div>
                                <div className="w-px h-8 bg-white/10"></div>
                                <div className="text-center">
                                    <p className="text-[10px] text-slate-500 uppercase font-black tracking-widest mb-1">Status</p>
                                    <p className="text-sm text-green-400 font-bold flex items-center gap-1.5"><span className="w-1.5 h-1.5 rounded-full bg-green-500"></span> Online</p>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* Jitsi Fallback */
                    <>
                        <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 pointer-events-none">
                            <div className="bg-amber-950/80 backdrop-blur-md border border-amber-500/30 px-4 py-2 rounded-2xl text-amber-200 text-xs font-bold shadow-2xl flex items-center gap-3 animate-slide-up">
                                <span className="p-1 bg-amber-500/20 rounded-lg text-amber-500">
                                    <Loader2 size={14} className="animate-spin" />
                                </span>
                                Jitsi Mode (Experimental)
                            </div>
                        </div>

                        <JitsiMeeting
                            domain="meet.jit.si"
                            roomName={roomName}
                            configOverwrite={{
                                startWithAudioMuted: false,
                                startWithVideoMuted: false,
                                disableModeratorIndicator: false,
                                enableEmailInStats: false,
                                prejoinPageEnabled: false,
                                enableNoAudioDetection: true,
                                enableNoVideoDetection: true
                            }}
                            interfaceConfigOverwrite={{
                                DISABLE_JOIN_LEAVE_NOTIFICATIONS: true,
                                SHOW_CHROME_EXTENSION_BANNER: false,
                                SHOW_JITSI_WATERMARK: false,
                                SHOW_WATERMARK_FOR_GUESTS: false,
                                SHOW_BRAND_WATERMARK: false,
                                SHOW_POWERED_BY: false,
                                DEFAULT_LOGO_URL: '',
                                DEFAULT_WELCOME_PAGE_LOGO_URL: '',
                                HIDE_DEEP_LINKING_LOGO: true,
                                TOOLBAR_BUTTONS: [
                                    'microphone', 'camera', 'closedcaptions', 'desktop', 'fullscreen',
                                    'fodeviceselection', 'hangup', 'profile', 'chat', 'recording',
                                    'livestreaming', 'etherpad', 'sharedvideo', 'settings', 'raisehand',
                                    'videoquality', 'filmstrip', 'invite', 'feedback', 'stats', 'shortcuts',
                                    'tileview', 'videobackgroundblur', 'download', 'help', 'mute-everyone',
                                    'security'
                                ],
                            }}
                            userInfo={{
                                displayName: displayName,
                                email: user?.email || ''
                            }}
                            onReadyToClose={() => navigate(-1)}
                            onApiReady={(externalApi) => {
                                externalApi.addListener('videoConferenceLeft', async () => {
                                    if (isRecruiter) {
                                        try {
                                            await axiosClient.patch(`/jobs/application/${applicationId}/status`, { status: 'interviewed' });
                                        } catch (err) {
                                            console.error("Failed to update status to interviewed:", err);
                                        }
                                    }
                                    navigate(-1);
                                });
                                externalApi.addListener('readyToClose', async () => {
                                    if (isRecruiter) {
                                        try {
                                            await axiosClient.patch(`/jobs/application/${applicationId}/status`, { status: 'interviewed' });
                                        } catch (err) {
                                            console.error("Failed to update status to interviewed:", err);
                                        }
                                    }
                                    navigate(-1);
                                });
                            }}
                            getIFrameRef={(iframeRef) => {
                                iframeRef.style.height = '100%';
                                iframeRef.style.width = '100%';
                                iframeRef.allow = 'camera; microphone; display-capture; autoplay; clipboard-write; fullscreen';
                            }}
                            spinner={() => (
                                <div className="h-full w-full flex flex-col items-center justify-center text-white bg-slate-950">
                                    <Loader2 className="animate-spin text-indigo-500 mb-4" size={40} />
                                    <p className="text-sm font-medium">Connecting to secure video server...</p>
                                </div>
                            )}
                        />
                    </>
                )}
            </div>
        </div>
    );
};

export default InterviewRoom;
