import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

import api from '../services/api';

const AuthCallback = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const { login, getRedirectPath } = useAuth();

    useEffect(() => {
        const handleAuth = async () => {
            const token = searchParams.get('token');
            const role = searchParams.get('role');
            const error = searchParams.get('error');

            if (error) {
                console.warn("[AuthCallback] Authentication error:", error);
                toast.error('Authentication failed');

                // Redirect back to the specific login page if role is known
                if (role === 'employer') {
                    navigate('/recruiter/login', { replace: true });
                } else if (role === 'seeker') {
                    navigate('/seeker/login', { replace: true });
                } else {
                    navigate('/', { replace: true });
                }
                return;
            }

            if (token && role) {
                console.log(`[AuthCallback] Success! Token received for role: ${role}`);
                // Store token in appropriate localStorage key before fetching profile
                if (role === 'employer' || role === 'recruiter') {
                    sessionStorage.setItem('recruiterToken', token);
                    localStorage.setItem('recruiterToken', token);
                    sessionStorage.removeItem('seekerToken');
                    localStorage.removeItem('seekerToken');
                } else if (role === 'seeker') {
                    sessionStorage.setItem('seekerToken', token);
                    localStorage.setItem('seekerToken', token);
                    sessionStorage.removeItem('recruiterToken');
                    localStorage.removeItem('recruiterToken');
                }
                try {
                    // Fetch full user data before finalizing login using unified API service
                    const response = await api.get('auth/me', {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                    const fullUser = response.user || response;
                    console.log('[AuthCallback] Full user data fetched:', fullUser);
                    // Call login with complete data
                    login(fullUser, token);
                    // Navigate using getRedirectPath for consistency
                    navigate(getRedirectPath(fullUser), { replace: true });
                } catch (err) {
                    console.error('[AuthCallback] Error fetching user profile:', err);
                    toast.error('Failed to complete login. Please try again.');
                    navigate('/');
                }
            } else {
                navigate('/');
            }
        };

        handleAuth();
    }, [searchParams, navigate, login]);

    return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-lg text-gray-700">Completing login...</span>
        </div>
    );
};

export default AuthCallback;
