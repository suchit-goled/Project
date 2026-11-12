import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Route guard for guest-only pages like /login, /register, and /forgot-password.
 * If user is already authenticated, redirects them directly to their profile.
 */
const PublicOnlyRoute = ({ children }) => {
    const { token } = useAuth();
    const hasToken = Boolean(token || localStorage.getItem("token"));

    if (hasToken) {
        return <Navigate to="/profile" replace />;
    }

    return children;
};

export default PublicOnlyRoute;
