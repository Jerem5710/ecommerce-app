import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const PrivateRoute = ({ children, adminOnly = false }) => {
    const { user } = useContext(AuthContext);

    if (!user) {
        // Not logged in, redirect to login
        return <Navigate to="/login" replace />;
    }

    if (adminOnly && !user.isAdmin) {
        // Logged in but not admin, redirect to home or unauthorized page
        return <Navigate to="/" replace />;
    }

    // User is logged in and authorized
    return children;
};

export default PrivateRoute;