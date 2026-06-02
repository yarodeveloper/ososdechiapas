import React from 'react';
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children, allowedRoles }) => {
    const storedUser = localStorage.getItem('user');
    
    if (!storedUser) {
        return <Navigate to="/login" replace />;
    }

    try {
        const user = JSON.parse(storedUser);
        
        // If allowedRoles is provided, verify the user role
        if (allowedRoles && allowedRoles.length > 0) {
            if (!allowedRoles.includes(user.role)) {
                // Determine fallback based on role
                if (user.role === 'admin' || user.role === 'coach') {
                    return <Navigate to="/admin/dashboard" replace />;
                } else if (user.role === 'parent' || user.role === 'player') {
                    return <Navigate to="/portal" replace />;
                } else {
                    return <Navigate to="/" replace />;
                }
            }
        }
        
        return children;
    } catch (e) {
        return <Navigate to="/login" replace />;
    }
};

export default ProtectedRoute;
