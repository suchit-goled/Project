import React from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FiShieldOff, FiHome } from "react-icons/fi";

/**
 * Route guard requiring administrator privileges (user.role === 'admin').
 * Redirects unauthenticated users to /login and restricts non-admin users with 403 Forbidden state.
 */
const AdminRoute = ({ children }) => {
    const { user, token, loading } = useAuth();
    const location = useLocation();

    const storedUser = localStorage.getItem("user");
    let parsedUser = user;
    if (!parsedUser && storedUser) {
        try {
            parsedUser = JSON.parse(storedUser);
        } catch {
            parsedUser = null;
        }
    }

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

    if (parsedUser?.role !== "admin") {
        return (
            <div className="container" style={{
                textAlign: "center",
                padding: "80px 20px",
                maxWidth: "600px",
                margin: "0 auto"
            }}>
                <div style={{ fontSize: "3.5rem", color: "#ef4444", marginBottom: "16px" }}>
                    <FiShieldOff />
                </div>
                <h1 style={{ fontSize: "2rem", marginBottom: "12px", color: "var(--text-primary)" }}>
                    403 — Administrator Access Required
                </h1>
                <p style={{ color: "var(--text-secondary)", marginBottom: "28px", lineHeight: "1.6" }}>
                    Your account does not possess administrative credentials to access the ElectroNova control center.
                </p>
                <Link
                    to="/"
                    style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "8px",
                        padding: "10px 22px",
                        background: "var(--primary)",
                        color: "#fff",
                        borderRadius: "var(--radius-sm)",
                        fontWeight: 600,
                        textDecoration: "none"
                    }}
                >
                    <FiHome /> Return to Storefront
                </Link>
            </div>
        );
    }

    return children;
};

export default AdminRoute;
