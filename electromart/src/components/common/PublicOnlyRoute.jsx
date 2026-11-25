import React from "react";
import { authReturn } from "../../utils/authReturn";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Route guard for guest-only pages like /login, /register, and /forgot-password.
 * If user is already authenticated, redirects them directly to their profile.
 */
const PublicOnlyRoute = ({ children }) => {
    const location = useLocation();
    const { token } = useAuth();
    const hasToken = Boolean(token || localStorage.getItem("token"));

    if (hasToken) {
        return <Navigate to={authReturn(location, "/profile")} replace />;
    }

    return children;
};

export default PublicOnlyRoute;
