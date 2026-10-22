import React, { useState } from "react";
import { Link } from "react-router-dom";
import api from "../api/axios";
import toast from "react-hot-toast";

import "./Login.css";

const ForgotPassword = () => {
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!email.trim()) {
            toast.error("Please enter your registered email address.");
            return;
        }

        try {
            setLoading(true);
            await api.post("/password/forgot-password", {
                email: email.trim()
            });

            setSubmitted(true);
            toast.success("Password reset link has been dispatched!");
        } catch (error) {
            toast.error(
                error.response?.data?.message ||
                "Failed to send reset link. Please check your email and try again."
            );
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            <div className="auth-card">
                <h1>Reset Password 🔑</h1>
                <p>
                    {submitted
                        ? "Check your inbox for instructions to reset your password."
                        : "Enter your registered email and we'll send you a password recovery link."}
                </p>

                {submitted ? (
                    <div style={{ textAlign: "center", padding: "10px 0 20px" }}>
                        <div
                            style={{
                                background: "rgba(56, 189, 248, 0.1)",
                                border: "1px solid rgba(56, 189, 248, 0.3)",
                                color: "#38bdf8",
                                padding: "14px",
                                borderRadius: "12px",
                                fontSize: "0.95rem",
                                marginBottom: "20px"
                            }}
                        >
                            If an account exists for <strong>{email}</strong>, you will receive an email shortly with a secure password reset link valid for 15 minutes.
                        </div>

                        <button
                            type="button"
                            onClick={() => {
                                setSubmitted(false);
                                setEmail("");
                            }}
                            style={{
                                background: "transparent",
                                border: "1px solid rgba(255, 255, 255, 0.2)",
                                color: "#f8fafc",
                                padding: "12px 20px",
                                borderRadius: "12px",
                                cursor: "pointer",
                                width: "100%",
                                marginBottom: "12px"
                            }}
                        >
                            Try Another Email
                        </button>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your registered email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />

                        <button
                            type="submit"
                            disabled={loading}
                        >
                            {loading ? "Sending Link..." : "Send Reset Link"}
                        </button>
                    </form>
                )}

                <p className="auth-link">
                    Remember your password? <Link to="/login">Back to Login</Link>
                </p>
            </div>
        </div>
    );
};

export default ForgotPassword;
