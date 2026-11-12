import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";

/**
 * Route guard requiring an active authenticated user session.
 * Redirects unauthenticated visitors to /login, preserving target location.
 */
const ProtectedRoute = ({ children }) => {
    const { token, loading } = useAuth();
    const location = useLocation();

    // Check if token exists in state or local storage directly to prevent flash
    const hasToken = Boolean(token || localStorage.getItem("token"));

    if (loading) {
        return (
            <div style={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                minHeight: "50vh",
                color: "var(--primary)"
            }}>
                <div className="btn-spinner" style={{ width: "32px", height: "32px" }} />
            </div>
        );
    }

    if (!hasToken) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export default ProtectedRoute;
