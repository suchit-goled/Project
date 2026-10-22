import React, { useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";

import "./Login.css";

const ResetPassword = () => {
    const { token } = useParams();
    const navigate = useNavigate();

    const [passwords, setPasswords] = useState({
        newPassword: "",
        confirmPassword: ""
    });

    const [loading, setLoading] = useState(false);

    const handleChange = (e) => {
        setPasswords({
            ...passwords,
            [e.target.name]: e.target.value
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (passwords.newPassword.length < 6) {
            toast.error("New password must be at least 6 characters long.");
            return;
        }

        if (passwords.newPassword !== passwords.confirmPassword) {
            toast.error("Passwords do not match.");
            return;
        }

        try {
            setLoading(true);
            await api.post(`/password/reset-password/${token}`, {
                token,
                newPassword: passwords.newPassword
            });

            toast.success("Password reset successfully! You can now log in.");
            navigate("/login");
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to reset password. The link may have expired."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1>Set New Password 🔐</h1>
                <p>Enter your new password below to secure your account.</p>

                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        name="newPassword"
                        placeholder="New Password (min. 6 characters)"
                        value={passwords.newPassword}
                        onChange={handleChange}
                        required
                    />

                    <input
                        type="password"
                        name="confirmPassword"
                        placeholder="Confirm New Password"
                        value={passwords.confirmPassword}
                        onChange={handleChange}
                        required
                    />

                    <button
                        type="submit"
                        disabled={loading}
                    >
                        {loading ? "Updating Password..." : "Reset Password"}
                    </button>
                </form>

                <p className="auth-link">
                    Back to <Link to="/login">Login</Link>
                </p>
            </div>
        </div>
    );
};

export default ResetPassword;
