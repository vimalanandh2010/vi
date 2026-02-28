import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import axiosClient from '../api/axiosClient';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const InterviewAlerts = () => {
    const { user, loading } = useAuth();
    const navigate = useNavigate();
    const [applications, setApplications] = useState([]);

    // Fetch user's applications or recruiter's applicants
    useEffect(() => {
        // Don't fetch if still loading or no user
        if (loading || !user || !user.role) {
            setApplications([]);
            return;
        }

        const fetchData = async () => {
            try {
                let data = [];
                if (user.role === 'employer' || user.role === 'recruiter') {
                    const res = await axiosClient.get('jobs/recruiter/applicants');
                    data = res.data;
                } else if (user.role === 'seeker') {
                    const res = await axiosClient.get('jobs/applied');
                    data = res.data;
                }
                setApplications(data);
            } catch (err) {
                // Silently fail - don't spam console with errors
            }
        };

        fetchData();
        // Refresh data every 5 minutes
        const fetchInterval = setInterval(fetchData, 5 * 60 * 1000);
        return () => clearInterval(fetchInterval);
    }, [user, loading]);

    // Check times every minute
    useEffect(() => {
        if (!applications || applications.length === 0) return;

        const checkInterviews = () => {
            const alertedIds = new Set(JSON.parse(sessionStorage.getItem('notifiedInterviews') || '[]'));
            const now = new Date();
            let newAlertAdded = false;

            applications.forEach(app => {
                const status = app.status?.toLowerCase() || '';
                if (['interview', 'scheduled', 'offer'].includes(status) && app.interviewDate && app.interviewTime) {

                    const interviewDateTimeStr = `${app.interviewDate}T${app.interviewTime}:00`;
                    const interviewTime = new Date(interviewDateTimeStr);

                    // Difference in minutes
                    const diffMs = interviewTime - now;
                    const diffMins = Math.floor(diffMs / 60000);

                    if (diffMins > 0 && diffMins <= 20 && !alertedIds.has(app._id)) {

                        toast.info(
                            <div>
                                <h4 className="font-bold text-sm mb-1 text-slate-800">Upcoming Interview!</h4>
                                <p className="text-xs mb-3 text-slate-600">You have an interview in {diffMins} minutes.</p>
                                <button
                                    onClick={() => navigate(`/interview/${app._id}`)}
                                    className="bg-blue-600 hover:bg-blue-500 text-white text-xs px-3 py-2 rounded-lg w-full font-bold shadow-md transition-all active:scale-95"
                                >
                                    Join Video Call
                                </button>
                            </div>,
                            {
                                autoClose: false,
                                closeOnClick: false,
                                icon: "⏰",
                                toastId: `interview_alert_${app._id}`, // Prevent duplicate toasts
                                theme: "light"
                            }
                        );

                        alertedIds.add(app._id);
                        newAlertAdded = true;
                    }
                }
            });

            if (newAlertAdded) {
                sessionStorage.setItem('notifiedInterviews', JSON.stringify(Array.from(alertedIds)));
            }
        };

        checkInterviews();
        const checkInterval = setInterval(checkInterviews, 60000); // Check every 1 minute

        return () => clearInterval(checkInterval);
    }, [applications, navigate]);

    return null; // Background component, renders nothing inline
};

export default InterviewAlerts;
