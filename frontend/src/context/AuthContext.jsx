import React, { createContext, useState, useEffect, useContext } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import authApi from '../api/modules/auth.api';

const AuthContext = createContext({});

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context || Object.keys(context).length === 0) {
        // Return a mock object to prevent destructuring crashes in initial load or misconfiguration
        return { user: null, loading: true, seekerAuth: null, recruiterAuth: null };
    }
    return context;
};

export function AuthProvider({ children }) {
    const [seekerAuth, setSeekerAuth] = React.useState(null);
    const [recruiterAuth, setRecruiterAuth] = React.useState(null);
    const [loading, setLoading] = React.useState(true);
    const location = useLocation();
    const navigate = useNavigate();

    const fetchUser = async (role, token) => {
        if (!token) return null;
        try {
            // Standard axios call (will throw on 4xx/5xx)
            const response = await authApi.getCurrentUser({
                headers: { Authorization: `Bearer ${token}` }
            });

            // If it resolves, it's successful (axiosClient now unwraps response.data)
            return response.user || response;
        } catch (error) {
            if (error.response?.status === 401) {
                console.warn(`[AuthContext] ${role} token expired (401)`);
                const tokenKey = role === 'seeker' ? 'seekerToken' : 'recruiterToken';
                sessionStorage.removeItem(tokenKey);
                localStorage.removeItem(tokenKey);
            } else {
                console.error(`Failed to fetch ${role} user:`, error.message);
            }
            return null;
        }
    };

    React.useEffect(() => {
        const initAuth = async () => {
            const sToken = sessionStorage.getItem('seekerToken');
            const rToken = sessionStorage.getItem('recruiterToken');

            const promises = [];
            promises.push(sToken ? fetchUser('seeker', sToken) : Promise.resolve(null));
            promises.push(rToken ? fetchUser('employer', rToken) : Promise.resolve(null));

            const [sUser, rUser] = await Promise.all(promises);

            setSeekerAuth(sUser);
            setRecruiterAuth(rUser);
            setLoading(false);
        };

        initAuth();
    }, []);

    let activeUser = seekerAuth || recruiterAuth;
    if (location.pathname.startsWith('/recruiter') || location.pathname.startsWith('/employer')) {
        activeUser = recruiterAuth;
    } else if (location.pathname.startsWith('/seeker')) {
        activeUser = seekerAuth;
    }

    const loginWithGoogle = async (googleToken, role) => {
        setLoading(true);
        try {
            const response = await authApi.googleVerify(googleToken, role);
            if (response && response.token) {
                login(response.user, response.token);
                return response.user;
            }
            throw new Error('Invalid response from Google verification');
        } catch (error) {
            console.error('[AuthContext] loginWithGoogle Error:', error);
            throw error;
        } finally {
            setLoading(false);
        }
    };

    const login = (userData, token) => {
        const role = userData.role;
        if (role === 'seeker') {
            setSeekerAuth(userData);
            sessionStorage.setItem('seekerToken', token);
            localStorage.setItem('seekerToken', token);
        } else if (role === 'employer' || role === 'recruiter') {
            setRecruiterAuth(userData);
            sessionStorage.setItem('recruiterToken', token);
            localStorage.setItem('recruiterToken', token);
        }
    };

    const updateUser = (role, newData) => {
        if (role === 'seeker') {
            setSeekerAuth(prev => prev ? { ...prev, ...newData } : null);
        } else if (role === 'employer' || role === 'recruiter') {
            setRecruiterAuth(prev => prev ? { ...prev, ...newData } : null);
        }
    };

    const logout = (role) => {
        // Clear tokens
        setSeekerAuth(null);
        setRecruiterAuth(null);
        sessionStorage.removeItem('seekerToken');
        localStorage.removeItem('seekerToken');
        sessionStorage.removeItem('recruiterToken');
        localStorage.removeItem('recruiterToken');

        // Always navigate to role selection (Landing) on logout as requested
        navigate('/');
    };

    const getRedirectPath = (u = activeUser) => {
        if (!u) return '/';
        if (u.role === 'employer') return '/recruiter/home';
        if (u.role === 'seeker') return '/seeker/home';
        return '/';
    };

    const value = React.useMemo(() => ({
        user: activeUser,
        seekerAuth,
        recruiterAuth,
        loading,
        login,
        loginWithGoogle,
        logout,
        updateUser,
        getRedirectPath
    }), [activeUser, seekerAuth, recruiterAuth, loading, login]);

    return (
        <AuthContext.Provider value={value}>
            {loading ? (
                <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
                </div>
            ) : (
                children
            )}
        </AuthContext.Provider>
    );
}

