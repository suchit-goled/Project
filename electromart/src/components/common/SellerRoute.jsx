import React from "react";
import { Navigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { FiBriefcase, FiArrowRight } from "react-icons/fi";

/**
 * Route guard requiring seller or administrator privileges.
 * Directs unauthenticated users to /login, and non-seller users to /seller/register.
 */
const SellerRoute = ({ children }) => {
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

    const isSeller = parsedUser?.role === "seller" || parsedUser?.role === "admin" || parsedUser?.role === "superadmin";

    if (!isSeller) {
        return (
            <div className="container" style={{
                textAlign: "center",
                padding: "80px 20px",
                maxWidth: "600px",
                margin: "0 auto"
            }}>
                <div style={{ fontSize: "3.5rem", color: "#6366f1", marginBottom: "16px" }}>
                    <FiBriefcase />
                </div>
                <h1 style={{ fontSize: "1.85rem", marginBottom: "12px", color: "var(--text-primary)" }}>
                    Seller Dashboard Access Required
                </h1>
                <p style={{ color: "var(--text-secondary)", marginBottom: "28px", lineHeight: "1.6" }}>
                    You are currently signed in as a customer. To sell electronics, manage inventory, and receive customer orders on ElectroNova, register your store today.
                </p>
                <div style={{ display: "flex", gap: "12px", justifyContent: "center", flexWrap: "wrap" }}>
                    <Link
                        to="/seller/register"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "10px 22px",
                            background: "#6366f1",
                            color: "#fff",
                            borderRadius: "8px",
                            fontWeight: 600,
                            textDecoration: "none"
                        }}
                    >
                        Register as Seller <FiArrowRight />
                    </Link>
                    <Link
                        to="/"
                        style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "8px",
                            padding: "10px 22px",
                            background: "transparent",
                            border: "1px solid var(--border-subtle)",
                            color: "var(--text-primary)",
                            borderRadius: "8px",
                            fontWeight: 600,
                            textDecoration: "none"
                        }}
                    >
                        Back to Shopping
                    </Link>
                </div>
            </div>
        );
    }

    return children;
};

export default SellerRoute;
