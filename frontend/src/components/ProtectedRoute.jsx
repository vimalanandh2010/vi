import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ allowedRoles }) => {
    const { user, loading } = useAuth();
    const location = useLocation();

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-900 flex flex-col items-center justify-center">
                <Loader2 className="animate-spin text-blue-500 mb-4" size={48} />
                <p className="text-slate-400 font-medium">Verifying access...</p>
            </div>
        );
    }

    if (!user) {
        // Redirect to Role Selection (Landing) if not logged in
        // Store the attempted URL to redirect back after login if needed (optional enhancement)
        return <Navigate to="/" state={{ from: location }} replace />;
    }

    if (allowedRoles && !allowedRoles.includes(user.role)) {
        console.warn(`[ProtectedRoute] Unauthorized access attempt to ${location.pathname} by role: ${user.role}`);

        // Redirect to their appropriate dashboard if they try to access unauthorized routes
        if (user.role === 'employer' || user.role === 'recruiter') {
            return <Navigate to="/recruiter/home" replace />;
        }
        if (user.role === 'seeker') {
            return <Navigate to="/seeker/home" replace />;
        }
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
